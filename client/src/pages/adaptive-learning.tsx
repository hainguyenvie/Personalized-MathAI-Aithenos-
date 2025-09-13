import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, Lightbulb, Target, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  type: string;
  choices: string[];
  difficulty: string;
  difficulty_name: string;
  lesson_id: number;
}

interface Session {
  id: string;
  student_name: string;
  grade: string;
  current_state: string;
  current_difficulty: string;
  current_question_index: number;
  total_questions: number;
  correct_answers: number;
  weak_lessons: number[];
}

interface TutorHint {
  id: string;
  level: number;
  content: string;
  type: string;
  is_final: boolean;
}

interface TutorSession {
  id: string;
  context: {
    lesson_id: number;
    difficulty: string;
    problem_type: string;
  };
}

export default function AdaptiveLearning() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentBundle, setCurrentBundle] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<{ question_id: string; student_answer: number; is_correct: boolean; time_spent: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutor, setShowTutor] = useState(false);
  const [tutorSession, setTutorSession] = useState<TutorSession | null>(null);
  const [currentHint, setCurrentHint] = useState<TutorHint | null>(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [tutorStep, setTutorStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [theoryContent, setTheoryContent] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Initialize session
  const initializeSession = async (studentName: string, grade: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/adaptive/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_name: studentName, grade })
      });
      
      const data = await response.json();
      if (data.success) {
        setSession(data.session);
        await startBundle(data.session.id);
      } else {
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      setError('Failed to initialize session');
    } finally {
      setLoading(false);
    }
  };

  // Start bundle
  const startBundle = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/adaptive/sessions/${sessionId}/start`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentBundle(data.bundle);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers([]);
      } else {
        setError(data.error || 'Failed to start bundle');
      }
    } catch (err) {
      setError('Failed to start bundle');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (selectedAnswer === null || !session) return;

    const currentQuestion = currentBundle[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.choices.findIndex((_, i) => i === 0); // Simplified check
    
    const newAnswer = {
      question_id: currentQuestion.id,
      student_answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent: 30 // Placeholder
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    // Move to next question or submit bundle
    if (currentQuestionIndex < currentBundle.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      await submitBundle(session.id, newAnswers);
    }
  };

  // Submit bundle
  const submitBundle = async (sessionId: string, bundleAnswers: typeof answers) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/adaptive/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: bundleAnswers })
      });
      
      const data = await response.json();
      if (data.success) {
        setSession(data.session);
        
        if (data.needs_tutor) {
          setShowTutor(true);
          await startTutorSession(sessionId, bundleAnswers);
        } else if (data.next_bundle) {
          setCurrentBundle(data.next_bundle);
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setAnswers([]);
        } else if (data.session.current_state === 'END') {
          await generateReport(sessionId);
        }
      } else {
        setError(data.error || 'Failed to submit bundle');
      }
    } catch (err) {
      setError('Failed to submit bundle');
    } finally {
      setLoading(false);
    }
  };

  // Start tutor session
  const startTutorSession = async (sessionId: string, bundleAnswers: typeof answers) => {
    try {
      const wrongAnswer = bundleAnswers.find(a => !a.is_correct);
      if (!wrongAnswer) return;

      const response = await fetch(`/api/adaptive/sessions/${sessionId}/tutor/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: wrongAnswer.question_id,
          student_answer: wrongAnswer.student_answer
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setTutorSession(data.tutor_session);
        await getTutorHint(sessionId, data.tutor_session.id);
      }
    } catch (err) {
      setError('Failed to start tutor session');
    }
  };

  // Get tutor hint
  const getTutorHint = async (sessionId: string, tutorSessionId: string) => {
    try {
      const response = await fetch(`/api/adaptive/sessions/${sessionId}/tutor/${tutorSessionId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_response: studentResponse })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentHint(data.hint);
        setTutorStep(data.tutor_session.current_step);
        setStudentResponse('');
      }
    } catch (err) {
      setError('Failed to get tutor hint');
    }
  };

  // Submit student response to tutor
  const submitTutorResponse = async () => {
    if (!session || !tutorSession) return;

    const response = await fetch(`/api/adaptive/sessions/${session.id}/tutor/${tutorSession.id}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_response: studentResponse })
    });
    
    const data = await response.json();
    if (data.success) {
      if (data.result.is_correct) {
        // Student got it right, generate retest questions
        await generateRetestQuestions(session.id, tutorSession.id);
      } else {
        // Get next hint
        await getTutorHint(session.id, tutorSession.id);
      }
    }
  };

  // Generate retest questions
  const generateRetestQuestions = async (sessionId: string, tutorSessionId: string) => {
    try {
      const response = await fetch(`/api/adaptive/sessions/${sessionId}/tutor/${tutorSessionId}/retest`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentBundle(data.retest_questions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers([]);
        setShowTutor(false);
        setTutorSession(null);
        setCurrentHint(null);
      }
    } catch (err) {
      setError('Failed to generate retest questions');
    }
  };

  // Generate report
  const generateReport = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/adaptive/sessions/${sessionId}/report`);
      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        setShowReport(true);
      }
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  // Get theory content
  const getTheoryContent = async (lessonId: number) => {
    try {
      const response = await fetch(`/api/adaptive/theory/${lessonId}/summary`);
      const data = await response.json();
      if (data.success) {
        setTheoryContent(data.summary);
        setShowTheory(true);
      }
    } catch (err) {
      setError('Failed to get theory content');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Bắt đầu phiên học tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentName">Tên học sinh</Label>
                <Input
                  id="studentName"
                  placeholder="Nhập tên của bạn"
                  onChange={(e) => setStudentResponse(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="grade">Lớp</Label>
                <Select onValueChange={(value) => setStudentResponse(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">Lớp 12</SelectItem>
                    <SelectItem value="11">Lớp 11</SelectItem>
                    <SelectItem value="10">Lớp 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => initializeSession(studentResponse, '12')}
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bắt đầu'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Báo cáo kết quả học tập</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{report?.total_questions || 0}</div>
                  <div className="text-sm text-gray-600">Tổng câu hỏi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{report?.correct_answers || 0}</div>
                  <div className="text-sm text-gray-600">Câu đúng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{report?.accuracy?.toFixed(1) || 0}%</div>
                  <div className="text-sm text-gray-600">Độ chính xác</div>
                </div>
              </div>
              
              {report?.weak_areas?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Các chủ đề cần cải thiện</h3>
                  <div className="space-y-2">
                    {report.weak_areas.map((area: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span>Bài {area.lesson} - {area.difficulty}</span>
                        <Badge variant="destructive">{area.accuracy.toFixed(1)}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report?.recommendations?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Khuyến nghị</h3>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={() => window.location.reload()}
                className="w-full mt-6"
              >
                Bắt đầu phiên mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showTutor && tutorSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <span>Gia sư AI - Bài {tutorSession.context.lesson_id}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Badge variant="outline">Bước {tutorStep}/4</Badge>
                <Badge variant="secondary">{tutorSession.context.difficulty}</Badge>
              </div>

              {currentHint && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-lg">
                    {currentHint.content}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label htmlFor="studentResponse">Câu trả lời của bạn:</Label>
                <Input
                  id="studentResponse"
                  value={studentResponse}
                  onChange={(e) => setStudentResponse(e.target.value)}
                  placeholder="Nhập câu trả lời hoặc suy nghĩ của bạn..."
                />
                <div className="flex space-x-2">
                  <Button onClick={submitTutorResponse} disabled={!studentResponse.trim()}>
                    Gửi câu trả lời
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => getTheoryContent(tutorSession.context.lesson_id)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Xem lý thuyết
                  </Button>
                </div>
              </div>

              {showTheory && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lý thuyết - Bài {tutorSession.context.lesson_id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: theoryContent }} />
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = currentBundle[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentBundle.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Học tập thích ứng</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{session.current_difficulty}</Badge>
              <Badge variant="secondary">Bài {currentQuestion?.lesson_id}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Câu {currentQuestionIndex + 1} / {currentBundle.length}</span>
              <span>{session.correct_answers} / {session.total_questions} đúng</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Câu hỏi {currentQuestionIndex + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg leading-relaxed">
                {currentQuestion.content}
              </div>
              
              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAnswer(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{choice}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={submitAnswer}
                disabled={selectedAnswer === null || loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentQuestionIndex < currentBundle.length - 1 ? (
                  'Câu tiếp theo'
                ) : (
                  'Nộp bài'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
