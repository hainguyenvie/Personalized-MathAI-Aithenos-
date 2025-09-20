import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, Lightbulb, Target, CheckCircle, XCircle, Brain } from 'lucide-react';
import MathRenderer from '@/components/math-renderer';

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

interface ReviewSession {
  id: string;
  difficulty: string;
  lesson_summary: {
    [lesson: number]: {
      total_questions: number;
      correct_answers: number;
      accuracy: number;
      weak_topics: string[];
      strong_topics: string[];
      rounds_summary?: Array<{
        round_number: number;
        passed: boolean;
        accuracy: number;
      }>;
      detailed_explanations?: Array<{
        question_id: string;
        lesson_id: number;
        content: string;
        explanation: string;
        theory_summary: string;
        step_by_step_solution: string;
        common_mistakes: string;
        similar_exercises: string;
        round_number?: number;
        correct_answer?: string;
        student_answer?: string;
        original_question_content?: string;
      }>;
    }
  };
  overall_performance: {
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    time_spent: number;
  };
  recommendations: string[];
  next_difficulty_preparation: string[];
  created_at: string;
}

interface SupplementaryRound {
  id: string;
  round_number: number;
  difficulty: string;
  questions: Question[];
  original_question: {
    content: string;
    lesson_id: number;
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
  const [studentName, setStudentName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('12');
  const [tutorStep, setTutorStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [theoryContent, setTheoryContent] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  // NEW STATES for round-based supplementary system
  const [isSupplementaryMode, setIsSupplementaryMode] = useState(false);
  const [currentSupplementaryRound, setCurrentSupplementaryRound] = useState<SupplementaryRound | null>(null);
  const [supplementaryRounds, setSupplementaryRounds] = useState<any[]>([]);
  const [showRoundReview, setShowRoundReview] = useState(false);
  const [currentRoundReview, setCurrentRoundReview] = useState<ReviewSession | null>(null);
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  // Initialize session
  const initializeSession = async (studentName: string, grade: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/adaptive-optimized/sessions', {
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
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/start`, {
        method: 'POST'
      });
      
      const data = await response.json();
      console.log('Bundle response:', data); // Debug log
      
      if (data.success) {
        console.log('Bundle questions:', data.bundle); // Debug log
        setCurrentBundle(data.bundle);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers([]);
      } else {
        setError(data.error || 'Failed to start bundle');
      }
    } catch (err) {
      console.error('Bundle error:', err); // Debug log
      setError('Failed to start bundle');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (selectedAnswer === null || !session) return;

    console.log('submitAnswer DEBUG:', {
      currentQuestionIndex,
      totalQuestions: currentBundle.length,
      selectedAnswer,
      isSupplementaryMode,
      currentRoundNumber: currentSupplementaryRound?.round_number
    });

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
      console.log('Moving to next question:', currentQuestionIndex + 1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      console.log('Last question reached, submitting bundle with', newAnswers.length, 'answers');
      await submitBundle(session.id, newAnswers);
    }
  };

  // Submit bundle - UPDATED for round-based system
  const submitBundle = async (sessionId: string, bundleAnswers: typeof answers) => {
    try {
      setLoading(true);
      
      // Check if we're in supplementary round mode
      if (isSupplementaryMode && currentSupplementaryRound) {
        console.log('Submitting supplementary round answers');
        await submitSupplementaryRoundAnswers(sessionId, bundleAnswers);
        return;
      }
      
      // Regular bundle submission
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: bundleAnswers })
      });
      
      const data = await response.json();
      console.log('Submit bundle response:', data);
      
      if (data.success) {
        setSession(data.session);
        
        if (data.needs_tutor) {
          console.log('Need tutor session');
          setShowTutor(true);
          await startTutorSession(sessionId, data.wrong_answers || bundleAnswers);
        } else if (data.needs_review || data.session.current_state?.startsWith('REVIEW_')) {
          console.log('Need review session, current state:', data.session.current_state);
          
          // Check if we need to start supplementary rounds
          if (data.session.current_state?.startsWith('REVIEW_FAIL_') && !data.session.current_state?.startsWith('REVIEW_SUPP_')) {
            await showReviewSession(sessionId, data.session.current_difficulty);
          } else if (data.session.current_state?.startsWith('REVIEW_SUPP_FAIL_')) {
            await showDetailedSupplementaryReview(sessionId, data.session.current_difficulty);
          } else {
            await showReviewSession(sessionId, data.session.current_difficulty);
          }
        } else if (data.next_bundle) {
          console.log('Got next bundle:', data.next_bundle.length, 'questions');
          
          // Check if this is a supplementary round
          if (data.session.current_state?.includes('SUPP_ROUND_')) {
            await handleSupplementaryRoundStart(sessionId, data.next_bundle);
          } else {
            setCurrentBundle(data.next_bundle);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setAnswers([]);
          }
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

  // NEW: Submit supplementary round answers
  const submitSupplementaryRoundAnswers = async (sessionId: string, bundleAnswers: typeof answers) => {
    try {
      console.log('Submitting round answers:', bundleAnswers.length);
      
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/supplementary/submit-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: bundleAnswers })
      });
      
      const data = await response.json();
      console.log('Round submission response:', data);
      
      if (data.success) {
        // Show round review
        await showSupplementaryRoundReview(sessionId, currentSupplementaryRound!.id, data.round);
      } else {
        setError(data.error || 'Failed to submit round answers');
      }
    } catch (err) {
      console.error('Error submitting round answers:', err);
      setError('Failed to submit round answers');
    }
  };

  // NEW: Handle supplementary round start
  const handleSupplementaryRoundStart = async (sessionId: string, expectedQuestions?: Question[]) => {
    try {
      console.log('Starting supplementary round mode');
      
      // Get current round info
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/supplementary/current-round`);
      const data = await response.json();
      
      if (data.success) {
        setIsSupplementaryMode(true);
        setCurrentSupplementaryRound(data.round);
        // Use API response data instead of parameter to avoid stale data
        setCurrentBundle(data.round.supplementary_questions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers([]);
        
        console.log(`Started round ${data.round.round_number} with ${data.round.supplementary_questions.length} questions`);
        
        // Debug: Compare with expected if provided
        if (expectedQuestions) {
          console.log('DEBUG: Expected vs Actual questions:', {
            expected_count: expectedQuestions.length,
            actual_count: data.round.supplementary_questions.length,
            expected_first_id: expectedQuestions[0]?.id,
            actual_first_id: data.round.supplementary_questions[0]?.id
          });
        }
      } else {
        setError('Failed to get round information');
      }
    } catch (err) {
      console.error('Error starting supplementary round:', err);
      setError('Failed to start supplementary round');
    }
  };

  // NEW: Show supplementary round review
  const showSupplementaryRoundReview = async (sessionId: string, roundId: string, roundResult: any) => {
    try {
      console.log('Generating round review for round:', roundId);
      
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/supplementary/round/${roundId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentRoundReview(data.review);
        setShowRoundReview(true);
        
        // Store round result for later use
        // Removed roundResult.all_rounds_completed as it doesn't exist
        console.log('Round review loaded successfully');
      } else {
        setError('Failed to generate round review');
      }
    } catch (err) {
      console.error('Error generating round review:', err);
      setError('Failed to generate round review');
    }
  };

  // NEW: Continue after round review
  const continueAfterRoundReview = async () => {
    if (!session || !currentSupplementaryRound || !currentRoundReview) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/adaptive-optimized/sessions/${session.id}/supplementary/round/${currentSupplementaryRound.id}/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log('Continue after round review response:', data);
      
      if (data.success) {
        setShowRoundReview(false);
        setCurrentRoundReview(null);
        
        if (data.hasMoreRounds && data.nextRound) {
          // Move to next round
          console.log('Moving to next round');
          await handleSupplementaryRoundStart(session.id, data.nextRound.supplementary_questions);
        } else if (data.completed) {
          console.log('All rounds completed');
          setAllRoundsCompleted(true);
          setIsSupplementaryMode(false);
          setCurrentSupplementaryRound(null);
          
          // For now, just show completion message
          console.log('Tất cả vòng bổ sung đã hoàn thành!');
        }
      } else {
        setError(data.error || 'Failed to continue after round review');
      }
    } catch (err) {
      console.error('Error continuing after round review:', err);
      setError('Failed to continue after round review');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Show final supplementary review
  const showFinalSupplementaryReview = async (sessionId: string, difficulty: string) => {
    try {
      console.log('Showing final supplementary review');
      
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/supplementary/final-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReviewSession(data.review_session);
        setShowReview(true);
        setIsSupplementaryMode(false);
        setCurrentSupplementaryRound(null);
      } else {
        setError('Failed to generate final supplementary review');
      }
    } catch (err) {
      console.error('Error generating final supplementary review:', err);
      setError('Failed to generate final supplementary review');
    }
  };

  // Start tutor session
  const startTutorSession = async (sessionId: string, wrongAnswers: any[]) => {
    try {
      // Use the first wrong answer to start tutor session
      const wrongAnswer = wrongAnswers.find(a => !a.is_correct) || wrongAnswers[0];
      if (!wrongAnswer) return;

      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/tutor/start`, {
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
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/tutor/${tutorSessionId}/hint`, {
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

    const response = await fetch(`/api/adaptive-optimized/sessions/${session.id}/tutor/${tutorSession.id}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_response: studentResponse })
    });
    
    const data = await response.json();
    if (data.success) {
      if (data.result.is_correct) {
        // Student got it right, complete tutor session and move to next difficulty
        await completeTutorSession(session.id, tutorSession.id);
      } else {
        // Get next hint
        await getTutorHint(session.id, tutorSession.id);
      }
    }
  };

  // Complete tutor session and move to next difficulty
  const completeTutorSession = async (sessionId: string, tutorSessionId: string) => {
    try {
      // After tutor session, move to next difficulty
      const currentDifficulty = session?.current_difficulty;
      if (!currentDifficulty) return;

      let nextDifficulty: string;
      if (currentDifficulty === 'N') {
        nextDifficulty = 'H';
      } else if (currentDifficulty === 'H') {
        nextDifficulty = 'V';
      } else {
        // End session
        await generateReport(sessionId);
        return;
      }

      // Start next difficulty bundle
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: nextDifficulty })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentBundle(data.bundle);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers([]);
        setShowTutor(false);
        setTutorSession(null);
        setCurrentHint(null);
      }
    } catch (err) {
      setError('Failed to complete tutor session');
    }
  };

  // Generate report
  const generateReport = async (sessionId: string) => {
    try {
      console.log('Generating report for session:', sessionId);
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/report`);
      console.log('Report API response status:', response.status);
      
      const data = await response.json();
      console.log('Report API response data:', data);
      
      if (data.success) {
        console.log('Report generated successfully, setting report data');
        setReport(data.report);
        setShowReport(true);
      } else {
        console.error('Report generation failed:', data.error);
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    }
  };

  // Get theory content
  const getTheoryContent = async (lessonId: number) => {
    try {
      const response = await fetch(`/api/adaptive-optimized/theory/${lessonId}/summary`);
      const data = await response.json();
      if (data.success) {
        setTheoryContent(data.summary);
        setShowTheory(true);
      }
    } catch (err) {
      setError('Failed to get theory content');
    }
  };

  // Show review session
  const showReviewSession = async (sessionId: string, difficulty: string) => {
    try {
      console.log('Generating review session for difficulty:', difficulty);
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      });
      
      const data = await response.json();
      console.log('Review session response:', data);
      
      if (data.success) {
        setReviewSession(data.review_session);
        setShowReview(true);
      } else {
        setError(data.error || 'Failed to generate review session');
      }
    } catch (err) {
      console.error('Error generating review session:', err);
      setError('Failed to generate review session');
    }
  };

  // Show detailed supplementary review session
  const showDetailedSupplementaryReview = async (sessionId: string, difficulty: string) => {
    try {
      console.log('Generating detailed supplementary review session for difficulty:', difficulty);
      const response = await fetch(`/api/adaptive-optimized/sessions/${sessionId}/review/detailed-supplementary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      });
      
      const data = await response.json();
      console.log('Detailed supplementary review session response:', data);
      
      if (data.success) {
        setReviewSession(data.review_session);
        setShowReview(true);
      } else {
        setError(data.error || 'Failed to generate detailed supplementary review session');
      }
    } catch (err) {
      console.error('Error generating detailed supplementary review session:', err);
      setError('Failed to generate detailed supplementary review session');
    }
  };

  // Continue to next difficulty after review
  const continueAfterReview = async () => {
    console.log('continueAfterReview called:', { session: !!session, reviewSession: !!reviewSession });
    if (!session || !reviewSession) {
      console.log('Missing session or reviewSession');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if this is a supplementary review (both success and fail)
      const isSupplementaryReview = session?.current_state?.startsWith('REVIEW_SUPP_');
      
      // For supplementary reviews, we need to determine the next difficulty
      let targetDifficulty = reviewSession.difficulty;
      if (isSupplementaryReview) {
        // For supplementary reviews, move to next difficulty
        if (reviewSession.difficulty === 'N') {
          targetDifficulty = 'H';
        } else if (reviewSession.difficulty === 'H') {
          targetDifficulty = 'V';
        } else {
          targetDifficulty = 'END';
        }
      } else {
        // For regular reviews, if we're at difficulty V, we should end
        // But we still send the current difficulty and let backend handle the END logic
        if (reviewSession.difficulty === 'V') {
          targetDifficulty = 'V'; // Send current difficulty, backend will set state to END
        }
      }
      
      // Use the appropriate API endpoint
      const apiEndpoint = isSupplementaryReview
        ? `/api/adaptive-optimized/sessions/${session.id}/review/${reviewSession.id}/continue-supplementary`
        : `/api/adaptive-optimized/sessions/${session.id}/review/${reviewSession.id}/continue`;
      
      console.log('Making API call to:', apiEndpoint);
      console.log('Request body:', { difficulty: targetDifficulty });
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: targetDifficulty })
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Continue after review response:', data);
      
      if (data.success) {
        console.log('Continue after review success:', {
          hasNextBundle: !!data.next_bundle,
          currentState: data.session.current_state,
          sessionId: session.id
        });
        
        setSession(data.session);
        setShowReview(false);
        setReviewSession(null);
        
        if (data.next_bundle) {
          console.log('Got next bundle after review:', data.next_bundle.length, 'questions');
          setCurrentBundle(data.next_bundle);
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setAnswers([]);
        } else if (data.session.current_state === 'END') {
          console.log('Session ended, generating report...');
          await generateReport(session.id);
        } else {
          console.log('No next bundle and not END state:', data.session.current_state);
        }
      } else {
        setError(data.error || 'Failed to continue after review');
      }
    } catch (err) {
      console.error('Error continuing after review:', err);
      setError('Failed to continue after review');
    } finally {
      setLoading(false);
    }
  };

  // Continue to supplementary questions after fail review
  const continueAfterFailReview = async () => {
    console.log('continueAfterFailReview called:', { session: !!session, reviewSession: !!reviewSession });
    if (!session || !reviewSession) {
      console.log('Missing session or reviewSession');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use the continueAfterFailReview API
      console.log('Making API call to:', `/api/adaptive-optimized/sessions/${session.id}/review/${reviewSession.id}/continue-fail`);
      console.log('Request body:', { difficulty: reviewSession.difficulty });
      
      const response = await fetch(`/api/adaptive-optimized/sessions/${session.id}/review/${reviewSession.id}/continue-fail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: reviewSession.difficulty })
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Continue after fail review response:', data);
      
      if (data.success) {
        setSession(data.session);
        setShowReview(false);
        setReviewSession(null);
        
        if (data.next_bundle) {
          console.log('Starting supplementary round system with', data.next_bundle.length, 'questions');
          // Enter supplementary round mode
          await handleSupplementaryRoundStart(session.id, data.next_bundle);
        }
      } else {
        setError(data.error || 'Failed to continue after fail review');
      }
    } catch (err) {
      console.error('Error continuing after fail review:', err);
      setError('Failed to continue after fail review');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center space-x-2">
                <Brain className="w-6 h-6 text-blue-600" />
                <span>Bắt đầu phiên học tập</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentName">Tên học sinh</Label>
                <Input
                  id="studentName"
                  placeholder="Nhập tên của bạn"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="grade">Lớp</Label>
                <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)}>
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
                onClick={() => initializeSession(studentName, selectedGrade)}
                disabled={loading || !studentName.trim()}
                className="w-full h-12 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Đang khởi tạo...
                  </>
                ) : (
                  'Bắt đầu học tập'
                )}
              </Button>
              
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showReview && reviewSession) {
    // Check if this is a fail review based on session state
    const isFailReview = session?.current_state?.startsWith('REVIEW_FAIL_');
    const isDetailedSupplementaryReview = session?.current_state?.startsWith('REVIEW_SUPP_FAIL_');
    
    return (
      <div className={`min-h-screen bg-gradient-to-br p-4 ${
        isDetailedSupplementaryReview ? 'from-orange-50 to-red-100' : 
        isFailReview ? 'from-red-50 to-orange-100' : 'from-purple-50 to-pink-100'
      }`}>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center space-x-2">
                <Target className={`w-6 h-6 ${
                  isDetailedSupplementaryReview ? 'text-orange-600' : 
                  isFailReview ? 'text-red-600' : 'text-purple-600'
                }`} />
                <span>
                  {isDetailedSupplementaryReview ? 'Đánh giá chi tiết bài tập bổ sung' :
                   isFailReview ? 'Đánh giá kết quả' : 'Tổng kết độ khó'} {reviewSession.difficulty === 'N' ? 'Nhận biết' : reviewSession.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Performance */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reviewSession.overall_performance.total_questions}</div>
                  <div className="text-sm text-gray-600">Tổng câu hỏi</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{reviewSession.overall_performance.correct_answers}</div>
                  <div className="text-sm text-gray-600">Câu đúng</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{reviewSession.overall_performance.accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Độ chính xác</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(reviewSession.overall_performance.time_spent / 60)}m</div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                </div>
              </div>

              {/* Lesson Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Kết quả theo bài học</h3>
                <div className="space-y-3">
                  {Object.entries(reviewSession.lesson_summary).map(([lesson, summary]) => (
                    <div key={lesson} className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold">Bài {lesson}</div>
                          <div className="text-sm text-gray-600">{summary.correct_answers}/{summary.total_questions} câu đúng</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={summary.accuracy >= 80 ? "default" : summary.accuracy >= 70 ? "secondary" : "destructive"}>
                            {summary.accuracy.toFixed(1)}%
                          </Badge>
                          {summary.strong_topics.length > 0 && (
                            <Badge variant="outline" className="text-green-600">Mạnh</Badge>
                          )}
                          {summary.weak_topics.length > 0 && (
                            <Badge variant="outline" className="text-red-600">Yếu</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Detailed Explanations for Supplementary Review */}
                      {isDetailedSupplementaryReview && summary.detailed_explanations && summary.detailed_explanations.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <h4 className="font-semibold text-orange-800">📚 Giải thích chi tiết cho các câu sai:</h4>
                          {summary.detailed_explanations.map((explanation: any, index: number) => (
                            <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="mb-3">
                                <h5 className="font-semibold text-orange-800 mb-2">Câu hỏi:</h5>
                                <div className="prose prose-sm text-orange-700" dangerouslySetInnerHTML={{ __html: explanation.content }} />
                              </div>
                              
                              {explanation.theory_summary && (
                                <div className="mb-3">
                                  <h5 className="font-semibold text-blue-800 mb-2">📖 Lý thuyết liên quan:</h5>
                                  <div className="prose prose-sm text-blue-700">
                                    <MathRenderer content={explanation.theory_summary} />
                                  </div>
                                </div>
                              )}
                              
                              {explanation.step_by_step_solution && (
                                <div className="mb-3">
                                  <h5 className="font-semibold text-green-800 mb-2">🔍 Lời giải từng bước:</h5>
                                  <div className="prose prose-sm text-green-700">
                                    <MathRenderer content={explanation.step_by_step_solution} />
                                  </div>
                                </div>
                              )}
                              
                              {explanation.common_mistakes && (
                                <div className="mb-3">
                                  <h5 className="font-semibold text-red-800 mb-2">⚠️ Các lỗi thường gặp:</h5>
                                  <div className="prose prose-sm text-red-700">
                                    <MathRenderer content={explanation.common_mistakes} />
                                  </div>
                                </div>
                              )}
                              
                              {explanation.similar_exercises && (
                                <div>
                                  <h5 className="font-semibold text-purple-800 mb-2">💡 Bài tập tương tự:</h5>
                                  <div className="prose prose-sm text-purple-700">
                                    <MathRenderer content={explanation.similar_exercises} />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {reviewSession.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Khuyến nghị học tập</h3>
                  <ul className="space-y-2">
                    {reviewSession.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Difficulty Preparation */}
              {reviewSession.next_difficulty_preparation.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Chuẩn bị cho độ khó tiếp theo</h3>
                  <ul className="space-y-2">
                    {reviewSession.next_difficulty_preparation.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isFailReview ? (
                <Button 
                  onClick={continueAfterFailReview}
                  disabled={loading}
                  className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang chuẩn bị...
                    </>
                  ) : (
                    'Tiếp tục với bài tập bổ sung'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={continueAfterReview}
                  disabled={loading}
                  className={`w-full h-12 text-lg font-semibold ${
                    isDetailedSupplementaryReview 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : reviewSession.difficulty === 'V'
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang chuẩn bị...
                    </>
                  ) : (
                    reviewSession.difficulty === 'V'
                      ? 'Xem báo cáo kết quả'
                      : isDetailedSupplementaryReview 
                      ? 'Tiếp tục độ khó tiếp theo' 
                      : 'Tiếp tục độ khó tiếp theo'
                  )}
                </Button>
              )}
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

  // NEW: Round Review UI
  if (showRoundReview && currentRoundReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-orange-600" />
                <span>Kết quả vòng {currentSupplementaryRound?.round_number} - Bài tập bổ sung</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Round Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{currentRoundReview.overall_performance.total_questions}</div>
                  <div className="text-sm text-gray-600">Tổng câu hỏi</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{currentRoundReview.overall_performance.correct_answers}</div>
                  <div className="text-sm text-gray-600">Câu đúng</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{currentRoundReview.overall_performance.accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Độ chính xác</div>
                </div>
              </div>

              {/* Pass/Fail Status */}
              <Alert className={currentRoundReview.overall_performance.accuracy >= 80 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {currentRoundReview.overall_performance.accuracy >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>
                    {currentRoundReview.overall_performance.accuracy >= 80 ? 
                      `🎉 Xuất sắc! Bạn đã vượt qua vòng ${currentSupplementaryRound?.round_number}` :
                      `📚 Cần cố gắng thêm. Vòng ${currentSupplementaryRound?.round_number} chưa đạt yêu cầu (cần ≥80%)`
                    }
                  </strong>
                </AlertDescription>
              </Alert>

              {/* Original Question Context */}
              {currentSupplementaryRound && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold mb-2">Câu hỏi gốc (Bài {currentSupplementaryRound.original_question.lesson_id}):</h3>
                  <p className="text-sm text-gray-700">{currentSupplementaryRound.original_question.content}</p>
                </div>
              )}

              {/* Detailed Explanations for Wrong Answers */}
              {Object.values(currentRoundReview.lesson_summary).some(summary => summary.detailed_explanations && summary.detailed_explanations.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Lời giải chi tiết các câu sai</h3>
                  {Object.entries(currentRoundReview.lesson_summary).map(([lesson, summary]) => (
                    summary.detailed_explanations && summary.detailed_explanations.length > 0 && (
                      <div key={lesson} className="space-y-4">
                        {summary.detailed_explanations.map((explanation: any, index: number) => (
                          <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="mb-3">
                              <h4 className="font-semibold text-red-800">Câu hỏi:</h4>
                              <p className="text-sm">{explanation.content}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <h4 className="font-semibold text-green-700">Đáp án đúng:</h4>
                                <p className="text-sm text-green-600">{explanation.correct_answer}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-red-700">Bạn chọn:</h4>
                                <p className="text-sm text-red-600">{explanation.student_answer}</p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <h4 className="font-semibold text-blue-700">Lý thuyết:</h4>
                              <div className="text-sm text-blue-600">
                                <MathRenderer content={explanation.theory_summary} />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700">Giải thích:</h4>
                              <div className="text-sm text-gray-600">
                                <MathRenderer content={explanation.explanation} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {currentRoundReview.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Khuyến nghị</h3>
                  <ul className="space-y-2">
                    {currentRoundReview.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={continueAfterRoundReview}
                disabled={loading}
                className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : allRoundsCompleted ? (
                  'Hoàn thành tất cả bài tập bổ sung'
                ) : (
                  `Tiếp tục vòng ${(currentSupplementaryRound?.round_number || 0) + 1}`
                )}
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
              {/* NEW: Round indicator */}
              {isSupplementaryMode && currentSupplementaryRound && (
                <Badge variant="default" className="bg-orange-500">
                  Bài tập bổ sung - Vòng {currentSupplementaryRound.round_number}
                </Badge>
              )}
            </div>
          </div>
          
          {/* NEW: Supplementary round info */}
          {isSupplementaryMode && currentSupplementaryRound && (
            <Alert className="mb-4 bg-orange-50 border-orange-200">
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Bài tập bổ sung vòng {currentSupplementaryRound.round_number}</strong><br />
                Dựa trên câu hỏi gốc bài {currentSupplementaryRound.original_question.lesson_id}: {currentSupplementaryRound.original_question.content.substring(0, 100)}...
              </AlertDescription>
            </Alert>
          )}
          
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
                <Badge variant="outline" className="ml-auto">
                  {currentQuestion.difficulty_name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg leading-relaxed bg-gray-50 p-6 rounded-lg border">
                <MathRenderer content={currentQuestion.content} className="prose max-w-none" />
              </div>
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded">
                  Debug: {currentQuestion.choices?.length || 0} choices available
                </div>
              )}
              
              <div className="space-y-3">
                {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
                  currentQuestion.choices.map((choice, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                      onClick={() => setSelectedAnswer(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                          selectedAnswer === index
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-1">
                          <MathRenderer content={choice} className="prose max-w-none" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Không có đáp án để chọn. Vui lòng thử lại.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button 
                onClick={submitAnswer}
                disabled={selectedAnswer === null || loading || !currentQuestion.choices?.length}
                className="w-full h-12 text-lg font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
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
