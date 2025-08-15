import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Brain, Target, Sparkles, Zap, HelpCircle, CheckCircle, XCircle, 
  Clock, TrendingUp, Award, Lightbulb, Activity, ArrowRight, 
  RotateCcw, Star, BookOpen, Users, Heart, Trophy
} from "lucide-react";

interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: number;
  type: 'multiple-choice' | 'fill-in' | 'equation';
  hints?: string[];
  visualAid?: string;
}

interface PedagogicalAgent {
  name: string;
  avatar: string;
  personality: 'encouraging' | 'analytical' | 'playful' | 'patient';
  specialization: string;
}

export default function Practice() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  
  // Pedagogical Agent State
  const [selectedAgent, setSelectedAgent] = useState<PedagogicalAgent>({
    name: "Stella",
    avatar: "🌟",
    personality: "encouraging",
    specialization: "Toán học tổng quát"
  });
  const [agentMessage, setAgentMessage] = useState("");
  const [showAgent, setShowAgent] = useState(true);
  
  // AI Tutor State
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  
  // Micro-adaptive scaffolding
  const [difficultyLevel, setDifficultyLevel] = useState(2);
  const [strugglingCount, setStrugglingCount] = useState(0);
  const [masteryScore, setMasteryScore] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);

  const agents: PedagogicalAgent[] = [
    { name: "Stella", avatar: "🌟", personality: "encouraging", specialization: "Toán học tổng quát" },
    { name: "Newton", avatar: "🧠", personality: "analytical", specialization: "Đại số & Hình học" },
    { name: "Luna", avatar: "🌙", personality: "patient", specialization: "Hướng dẫn từng bước" },
    { name: "Spark", avatar: "⚡", personality: "playful", specialization: "Bài tập thú vị" }
  ];

  const sampleQuestions: PracticeQuestion[] = [
    {
      id: "p1",
      question: "Một hình chữ nhật có chiều dài 8cm và chiều rộng 5cm. Tính diện tích của hình chữ nhật này.",
      type: "multiple-choice",
      options: ["40cm²", "26cm", "13cm²", "80cm²"],
      correctAnswer: "40cm²",
      explanation: "Diện tích hình chữ nhật = chiều dài × chiều rộng = 8cm × 5cm = 40cm²",
      topic: "geometry",
      difficulty: 2,
      hints: [
        "Công thức diện tích hình chữ nhật là gì?",
        "Diện tích = chiều dài × chiều rộng",
        "Tính 8 × 5 = ?"
      ],
      visualAid: "Hình chữ nhật với 8 hàng và 5 cột ô vuông"
    },
    {
      id: "p2",
      question: "Giải phương trình: 2x + 6 = 16",
      type: "fill-in",
      correctAnswer: "5",
      explanation: "2x + 6 = 16 → 2x = 16 - 6 → 2x = 10 → x = 5",
      topic: "linear-equation",
      difficulty: 2,
      hints: [
        "Chuyển số 6 sang vế phải và đổi dấu",
        "2x = 16 - 6",
        "Chia cả hai vế cho 2"
      ]
    },
    {
      id: "p3",
      question: "Tìm x biết: x² - 9 = 0",
      type: "multiple-choice",
      options: ["x = 3", "x = ±3", "x = 9", "x = ±9"],
      correctAnswer: "x = ±3",
      explanation: "x² - 9 = 0 → x² = 9 → x = ±3",
      topic: "quadratic-equation",
      difficulty: 3,
      hints: [
        "Chuyển -9 sang vế phải",
        "x² = 9",
        "Căn bậc hai của 9 có hai giá trị: +3 và -3"
      ]
    }
  ];

  useEffect(() => {
    initializePractice();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      setQuestionStartTime(Date.now());
      generateAgentMessage();
    }
  }, [currentQuestion, questions]);

  const initializePractice = () => {
    setQuestions(sampleQuestions);
    setMasteryScore(0);
    setSessionProgress(0);
    generateAgentMessage();
  };

  const generateAgentMessage = () => {
    const messages = {
      encouraging: [
        "Bạn làm rất tốt! Hãy tiếp tục nỗ lực nhé! 💪",
        "Tôi tin bạn có thể làm được câu này! ✨",
        "Đừng lo lắng, mọi người đều có thể học toán! 🌟",
        "Bạn đang tiến bộ từng ngày! Tuyệt vời! 🎉"
      ],
      analytical: [
        "Hãy phân tích bài toán một cách có hệ thống. 🧠",
        "Xác định những thông tin đã biết và cần tìm. 📊",
        "Áp dụng công thức phù hợp cho bài toán này. 🔬",
        "Kiểm tra lại kết quả để đảm bảo chính xác. ✓"
      ],
      patient: [
        "Không sao cả, chúng ta cùng làm từng bước nhé. 🌙",
        "Hãy đọc kỹ đề bài và suy nghĩ chậm rãi. 💭",
        "Nếu không hiểu, tôi sẽ giải thích thêm cho bạn. 💙",
        "Học toán cần thời gian, đừng vội vàng. ⏰"
      ],
      playful: [
        "Toán học thật thú vị! Hãy cùng khám phá nhé! 🎮",
        "Bạn có thể biến bài toán thành trò chơi! 🎯",
        "Thử thách này sẽ giúp bạn trở nên thông minh hơn! 🧩",
        "Mỗi bài toán là một cuộc phiêu lưu mới! 🚀"
      ]
    };
    
    const personalityMessages = messages[selectedAgent.personality];
    const randomMessage = personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
    setAgentMessage(randomMessage);
  };

  const handleAnswer = () => {
    if (!questions[currentQuestion]) return;
    
    const question = questions[currentQuestion];
    const answer = question.type === 'fill-in' ? textAnswer : selectedAnswer;
    if (!answer) return;

    const responseTime = Date.now() - questionStartTime;
    const isCorrect = answer === question.correctAnswer;
    
    // Record response
    const response = {
      questionId: question.id,
      answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      responseTime,
      hintsUsed: hintLevel,
      difficulty: question.difficulty,
      topic: question.topic
    };
    
    setResponses(prev => [...prev, response]);
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    // Micro-adaptive scaffolding logic
    if (isCorrect) {
      setConsecutiveCorrect(prev => prev + 1);
      setStrugglingCount(0);
      setMasteryScore(prev => Math.min(100, prev + 10));
      
      // Increase difficulty if doing well
      if (consecutiveCorrect >= 2) {
        setDifficultyLevel(prev => Math.min(5, prev + 1));
      }
    } else {
      setConsecutiveCorrect(0);
      setStrugglingCount(prev => prev + 1);
      setMasteryScore(prev => Math.max(0, prev - 5));
      
      // Decrease difficulty if struggling
      if (strugglingCount >= 1) {
        setDifficultyLevel(prev => Math.max(1, prev - 1));
      }
      
      // Trigger AI tutor if struggling
      if (strugglingCount >= 1) {
        triggerAITutor();
      }
    }
    
    // Update session progress
    setSessionProgress(((currentQuestion + 1) / questions.length) * 100);
    
    // Generate agent feedback
    generateAgentFeedback(isCorrect);
  };

  const generateAgentFeedback = (isCorrect: boolean) => {
    const feedback = {
      encouraging: {
        correct: ["Tuyệt vời! Bạn đã làm đúng! 🎉", "Xuất sắc! Tiếp tục như vậy! ⭐", "Bạn thật giỏi! 💫"],
        incorrect: ["Không sao cả! Hãy thử lại nhé! 💪", "Mỗi lỗi sai đều là cơ hội học hỏi! 🌟", "Bạn sẽ làm được! Đừng bỏ cuộc! ❤️"]
      },
      analytical: {
        correct: ["Phương pháp giải chính xác! 🧠", "Bạn đã áp dụng đúng công thức! ✓", "Kết quả logic và chính xác! 📊"],
        incorrect: ["Hãy xem lại phương pháp giải! 🔍", "Kiểm tra lại các bước tính toán! 📋", "Cần phân tích kỹ hơn bài toán! 🔬"]
      },
      patient: {
        correct: ["Tôi rất tự hào về bạn! 💙", "Bạn đã cố gắng và thành công! 🌙", "Từ từ nhưng chắc chắn! 💫"],
        incorrect: ["Không vội, chúng ta cùng tìm hiểu! 💭", "Hãy thử một cách khác nhé! 🤝", "Tôi sẽ giúp bạn hiểu rõ hơn! 💙"]
      },
      playful: {
        correct: ["Siêu đỉnh! Bạn đã chinh phục thử thách! 🏆", "Level up! Bạn càng ngày càng giỏi! 🎮", "Thành tích tuyệt vời! 🌟"],
        incorrect: ["Oops! Hãy thử lại nào! 😊", "Đây là cơ hội để học thêm! 🎯", "Game chưa kết thúc! Tiếp tục thôi! 🚀"]
      }
    };
    
    const agentFeedback = feedback[selectedAgent.personality];
    const messages = isCorrect ? agentFeedback.correct : agentFeedback.incorrect;
    const randomFeedback = messages[Math.floor(Math.random() * messages.length)];
    setAgentMessage(randomFeedback);
  };

  const triggerAITutor = () => {
    const question = questions[currentQuestion];
    setTutorOpen(true);
    setTutorMessages([
      {
        role: "assistant",
        content: `Tôi thấy bạn đang gặp khó khăn với câu hỏi về ${question.topic}. Hãy chia sẻ với tôi cách bạn đã suy nghĩ về bài này nhé. Bạn bắt đầu giải như thế nào?`
      }
    ]);
  };

  const sendTutorMessage = async () => {
    if (!tutorInput.trim()) return;
    
    setTutorLoading(true);
    const userMessage = { role: "user", content: tutorInput };
    setTutorMessages(prev => [...prev, userMessage]);
    
    try {
      const question = questions[currentQuestion];
      const context = `
Question: ${question.question}
Correct Answer: ${question.correctAnswer}
Topic: ${question.topic}
Student struggling with: ${question.type} question
      `.trim();
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: tutorInput,
          context
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTutorMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      setTutorMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Hãy thử chia nhỏ bài toán thành các bước đơn giản hơn nhé!" 
      }]);
    }
    
    setTutorInput("");
    setTutorLoading(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer("");
      setTextAnswer("");
      setShowFeedback(false);
      setShowHints(false);
      setHintLevel(0);
      setLastAnswerCorrect(null);
    }
  };

  const showHint = () => {
    setShowHints(true);
    if (hintLevel < (questions[currentQuestion]?.hints?.length || 0) - 1) {
      setHintLevel(prev => prev + 1);
    }
  };

  const question = questions[currentQuestion];
  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài tập...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header with progress and stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                <BookOpen size={14} className="mr-1" />
                Luyện tập thích ứng
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <Trophy size={14} className="mr-1" />
                Thành thạo: {masteryScore}%
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Câu {currentQuestion + 1}/{questions.length}
              </div>
              <div className="text-sm text-gray-600">
                Độ khó: {difficultyLevel}/5
              </div>
            </div>
          </div>
          
          <Progress value={sessionProgress} className="h-3 bg-gray-200" />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{Math.round(sessionProgress)}% hoàn thành</span>
            <span>Đúng liên tiếp: {consecutiveCorrect}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Pedagogical Agent Panel */}
          {showAgent && (
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm sticky top-6">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{selectedAgent.avatar}</span>
                      <div>
                        <div className="font-bold">{selectedAgent.name}</div>
                        <div className="text-sm opacity-90">{selectedAgent.specialization}</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAgent(false)}
                      className="text-white hover:bg-white/20"
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-700">{agentMessage}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">Chọn trợ lý:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {agents.map((agent) => (
                          <button
                            key={agent.name}
                            onClick={() => setSelectedAgent(agent)}
                            className={`p-2 rounded-lg border text-xs transition-all duration-200 ${
                              selectedAgent.name === agent.name
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                            }`}
                          >
                            <div className="text-lg">{agent.avatar}</div>
                            <div className="font-medium">{agent.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Tiến độ session:</span>
                          <span className="font-semibold">{Math.round(sessionProgress)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm thành thạo:</span>
                          <span className="font-semibold">{masteryScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chuỗi đúng:</span>
                          <span className="font-semibold">{consecutiveCorrect}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Practice Area */}
          <div className={`${showAgent ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain size={24} className="mr-2" />
                    Luyện tập Micro-Adaptive
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Target size={14} className="mr-1" />
                      Độ khó {difficultyLevel}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Activity size={14} className="mr-1" />
                      {question.topic}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Question */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h3>
                    
                    {question.type === 'multiple-choice' ? (
                      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
                        {question.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors">
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-3">
                        <Label htmlFor="text-answer" className="text-base font-medium">Nhập đáp án:</Label>
                        <Input
                          id="text-answer"
                          value={textAnswer}
                          onChange={(e) => setTextAnswer(e.target.value)}
                          placeholder="Nhập câu trả lời của bạn..."
                          className="text-lg p-4"
                        />
                      </div>
                    )}
                  </div>

                  {/* Hints */}
                  {showHints && question.hints && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                        <Lightbulb size={16} className="mr-2" />
                        Gợi ý {hintLevel + 1}/{question.hints.length}
                      </h4>
                      <p className="text-orange-800">{question.hints[hintLevel]}</p>
                      {hintLevel < question.hints.length - 1 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={showHint}
                          className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          Gợi ý tiếp theo
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Feedback */}
                  {showFeedback && (
                    <div className={`p-4 rounded-xl border ${
                      lastAnswerCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {lastAnswerCorrect ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          lastAnswerCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {lastAnswerCorrect ? 'Chính xác!' : 'Chưa đúng'}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        lastAnswerCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="flex space-x-3">
                      {!showHints && question.hints && (
                        <Button 
                          variant="outline" 
                          onClick={showHint}
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                        >
                          <HelpCircle size={16} className="mr-1" />
                          Gợi ý
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        onClick={triggerAITutor}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Brain size={16} className="mr-1" />
                        AI Tutor
                      </Button>
                    </div>

                    <div className="flex space-x-3">
                      {showFeedback ? (
                        <Button 
                          onClick={nextQuestion}
                          disabled={currentQuestion >= questions.length - 1}
                          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6"
                        >
                          Câu tiếp theo
                          <ArrowRight size={16} className="ml-1" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleAnswer}
                          disabled={!(question.type === 'fill-in' ? textAnswer : selectedAnswer)}
                          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6"
                        >
                          Trả lời
                          <CheckCircle size={16} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <Award size={24} className="mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-700">{masteryScore}%</div>
                  <div className="text-sm text-green-600">Điểm thành thạo</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <TrendingUp size={24} className="mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-700">{consecutiveCorrect}</div>
                  <div className="text-sm text-blue-600">Chuỗi đúng</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Clock size={24} className="mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-700">{responses.length}</div>
                  <div className="text-sm text-purple-600">Câu đã làm</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Tutor Dialog */}
        {tutorOpen && (
          <Card className="fixed inset-4 z-50 shadow-2xl border-0 bg-white/95 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles size={20} className="mr-2" />
                  AI Tutor Socratic
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTutorOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                {tutorMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-50 border-l-4 border-blue-500 ml-8' 
                        : 'bg-purple-50 border-l-4 border-purple-500 mr-8'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">
                      {msg.role === 'user' ? '🧑‍🎓 Bạn' : '🤖 AI Tutor'}
                    </div>
                    <div className="text-gray-700">{msg.content}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input 
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  placeholder="Chia sẻ cách bạn suy nghĩ..."
                  onKeyPress={(e) => e.key === 'Enter' && sendTutorMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendTutorMessage} 
                  disabled={tutorLoading || !tutorInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {tutorLoading ? '...' : 'Gửi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}