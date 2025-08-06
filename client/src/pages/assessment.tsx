import { useState } from "react";
import { ClipboardCheck, ChevronLeft, ChevronRight, SkipForward, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const assessmentQuestions = [
  {
    id: 1,
    question: "Phép tính 15 + 23 có kết quả là:",
    options: ["38", "42", "35", "40"],
    correctAnswer: "38",
    explanation: "15 + 23 = 38",
    topic: "basic-arithmetic",
    difficulty: 1
  },
  {
    id: 2,
    question: "Phương trình x + 12 = 20 có nghiệm là:",
    options: ["x = 8", "x = 32", "x = 12", "x = 20"],
    correctAnswer: "x = 8",
    explanation: "x = 20 - 12 = 8",
    topic: "linear-equation",
    difficulty: 2
  },
  {
    id: 3,
    question: "Hàm số y = 2x + 1 khi x = 4 có giá trị y là:",
    options: ["y = 9", "y = 7", "y = 8", "y = 6"],
    correctAnswer: "y = 9",
    explanation: "Thay x = 4 vào hàm số: y = 2(4) + 1 = 8 + 1 = 9",
    topic: "linear-function",
    difficulty: 2
  },
  {
    id: 4,
    question: "Phương trình 3x - 6 = 15 có nghiệm là:",
    options: ["x = 7", "x = 5", "x = 9", "x = 3"],
    correctAnswer: "x = 7",
    explanation: "3x = 15 + 6 = 21, suy ra x = 21 ÷ 3 = 7",
    topic: "linear-equation",
    difficulty: 3
  },
  {
    id: 5,
    question: "Hàm số y = x² - 4x + 3 có đỉnh parabol tại điểm:",
    options: ["(2, -1)", "(1, 0)", "(3, 0)", "(4, 3)"],
    correctAnswer: "(2, -1)",
    explanation: "Đỉnh có hoành độ x = -b/2a = -(-4)/(2×1) = 2, tung độ y = 2² - 4(2) + 3 = -1",
    topic: "quadratic-function",
    difficulty: 4
  },
  {
    id: 6,
    question: "Trong tam giác vuông có cạnh huyền 10cm, một cạnh góc vuông 6cm. Cạnh góc vuông còn lại là:",
    options: ["8cm", "4cm", "12cm", "7cm"],
    correctAnswer: "8cm",
    explanation: "Theo định lý Pythagoras: 6² + b² = 10² => b² = 100 - 36 = 64 => b = 8cm",
    topic: "geometry",
    difficulty: 4
  },
  {
    id: 7,
    question: "Hệ phương trình {x + y = 8; 2x - y = 1} có nghiệm là:",
    options: ["(3, 5)", "(2, 6)", "(4, 4)", "(1, 7)"],
    correctAnswer: "(3, 5)",
    explanation: "Cộng hai phương trình: 3x = 9 => x = 3, thay vào: y = 8 - 3 = 5",
    topic: "system-equations",
    difficulty: 5
  }
];

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [knowledgeMap, setKnowledgeMap] = useState<any[]>([]);
  
  // Smart Reinforcement Loop States
  const [currentStep, setCurrentStep] = useState<'video' | 'quiz' | 'reinforcement' | 'review' | 'celebration'>('video');
  const [showVideo, setShowVideo] = useState(true);
  const [reinforcementQuestions, setReinforcementQuestions] = useState<any[]>([]);
  const [reinforcementIndex, setReinforcementIndex] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatMessage, setAiChatMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [needsReview, setNeedsReview] = useState(false);

  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  const handleNext = () => {
    // Save current answer
    if (selectedAnswer) {
      setUserAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
    }
    
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || "");
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1] || "");
      setShowExplanation(false);
    }
  };

  const handleSkip = () => {
    setShowExplanation(false);
    handleNext();
  };

  const generateKnowledgeMap = () => {
    // Analyze user answers and create knowledge map
    const topicScores: {[key: string]: {correct: number, total: number}} = {};
    
    assessmentQuestions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (!topicScores[q.topic]) {
        topicScores[q.topic] = { correct: 0, total: 0 };
      }
      
      topicScores[q.topic].total += 1;
      if (isCorrect) {
        topicScores[q.topic].correct += 1;
      }
    });

    // Convert to knowledge map format
    const knowledgeMapData = Object.entries(topicScores).map(([topic, score]) => {
      const percentage = (score.correct / score.total) * 100;
      let strength = 'weak';
      
      if (percentage >= 80) strength = 'strong';
      else if (percentage >= 60) strength = 'medium';
      
      const topicNames: {[key: string]: string} = {
        'basic-arithmetic': 'Phép tính cơ bản',
        'linear-equation': 'Phương trình bậc nhất',
        'linear-function': 'Hàm số bậc nhất',
        'quadratic-function': 'Hàm số bậc hai',
        'geometry': 'Hình học',
        'system-equations': 'Hệ phương trình'
      };
      
      return {
        id: topic.toUpperCase().substring(0, 3),
        name: topicNames[topic] || topic,
        strength,
        score: percentage.toFixed(0) + '%'
      };
    });
    
    setKnowledgeMap(knowledgeMapData);
  };

  // Smart Reinforcement Loop Functions
  const watchVideo = () => {
    console.log(`Watching video for topic: ${question.topic}`);
    setShowVideo(false);
    setCurrentStep('quiz');
  };

  const generateReinforcementQuestions = (topic: string) => {
    // Generate similar questions for reinforcement
    const similarQuestions = assessmentQuestions.filter(q => 
      q.topic === topic && q.id !== question.id
    ).slice(0, 3);
    
    if (similarQuestions.length === 0) {
      // Create variation of current question if no similar ones found
      const variations = [
        {
          ...question,
          id: question.id + '_var1',
          question: question.question.replace(/\d+/g, (match) => String(parseInt(match) + 1))
        },
        {
          ...question,
          id: question.id + '_var2',
          question: question.question.replace(/\d+/g, (match) => String(parseInt(match) + 2))
        }
      ];
      return variations;
    }
    
    return similarQuestions;
  };

  const handleQuizAnswer = () => {
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        moveToNextQuestion();
      }, 2000);
    } else {
      setWrongAnswers(prev => [...prev, currentQuestion]);
      setShowExplanation(true);
      
      // Generate reinforcement questions
      const reinforcement = generateReinforcementQuestions(question.topic);
      setReinforcementQuestions(reinforcement);
      setReinforcementIndex(0);
      setCurrentStep('reinforcement');
    }
  };

  const handleReinforcementAnswer = () => {
    const currentReinforcement = reinforcementQuestions[reinforcementIndex];
    const isCorrect = selectedAnswer === currentReinforcement.correctAnswer;
    
    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        if (reinforcementIndex < reinforcementQuestions.length - 1) {
          setReinforcementIndex(reinforcementIndex + 1);
          setSelectedAnswer("");
        } else {
          // Back to original question
          setCurrentStep('quiz');
          setSelectedAnswer("");
          setShowExplanation(false);
        }
      }, 1500);
    } else {
      // Still wrong - trigger pedagogical intervention
      if (reinforcementIndex >= 1) {
        setNeedsReview(true);
        setCurrentStep('review');
      } else {
        setReinforcementIndex(reinforcementIndex + 1);
        setSelectedAnswer("");
      }
    }
  };

  const reviewKnowledge = () => {
    setShowVideo(true);
    setCurrentStep('video');
    setNeedsReview(false);
  };

  const moveToNextQuestion = () => {
    // Save current answer
    if (selectedAnswer) {
      setUserAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
    }
    
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentStep('video');
      setShowVideo(true);
      setSelectedAnswer("");
      setShowExplanation(false);
      setReinforcementQuestions([]);
      setReinforcementIndex(0);
    } else {
      generateKnowledgeMap();
      setShowResults(true);
    }
  };

  const sendAIMessage = async () => {
    if (!aiChatMessage.trim()) return;
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Câu hỏi: "${question.question}"\n\nHọc sinh hỏi: ${aiChatMessage}`,
          context: "Assessment - Smart Reinforcement Loop - Giải thích khái niệm và đưa ra gợi ý"
        }),
      });
      const data = await response.json();
      setAiResponse(data.response);
      setAiChatMessage("");
    } catch (error) {
      console.error("AI chat error:", error);
      setAiResponse("Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.");
    }
  };

  const completeAssessment = () => {
    generateKnowledgeMap();
    setShowResults(true);
  };

  // Get current question or reinforcement question
  const getCurrentQuestion = () => {
    if (currentStep === 'reinforcement' && reinforcementQuestions.length > 0) {
      return reinforcementQuestions[reinforcementIndex];
    }
    return question;
  };

  const currentQ = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Fixed AI Chat Button */}
        <Button
          onClick={() => setShowAIChat(!showAIChat)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl"
        >
          🤖
        </Button>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-blue-900">
                  {currentStep === 'video' && '📹 Bước A - Học Kiến Thức'}
                  {currentStep === 'quiz' && '📝 Bước B - Kiểm Tra Hiểu Biết'}
                  {currentStep === 'reinforcement' && '💪 Bước C - Luyện Tập Tăng Cường'}
                  {currentStep === 'review' && '🎯 Can Thiệp Sư Phạm'}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Câu {currentQuestion + 1}/{assessmentQuestions.length}
                  </span>
                  {currentStep === 'reinforcement' && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Luyện tập {reinforcementIndex + 1}/{reinforcementQuestions.length}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-gray-700">Tiến độ học tập</span>
                  <span className="text-lg font-bold text-blue-900">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-4 bg-gray-200" />
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  currentStep === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  📹 Học
                </div>
                <div className="w-6 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  currentStep === 'quiz' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  📝 Kiểm tra
                </div>
                {wrongAnswers.includes(currentQuestion) && (
                  <>
                    <div className="w-6 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      currentStep === 'reinforcement' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      💪 Luyện tập
                    </div>
                  </>
                )}
                {needsReview && (
                  <>
                    <div className="w-6 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      currentStep === 'review' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      🎯 Ôn tập
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Video Learning Section */}
            {currentStep === 'video' && showVideo && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📹</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">Video bài giảng: {question.topic}</h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    Xem video học tập ngắn (3-7 phút) để nắm vững kiến thức cần thiết cho chủ đề này.
                  </p>
                  <div className="bg-white/80 rounded-xl p-6 mb-6">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-4">▶️</div>
                        <p className="text-xl font-semibold">Video bài giảng</p>
                        <p className="text-sm opacity-75">Chủ đề: {question.topic}</p>
                      </div>
                    </div>
                    <Button onClick={watchVideo} className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-4 text-lg font-semibold">
                      Hoàn thành xem video - Tiến tới kiểm tra
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Section */}
            {(currentStep === 'quiz' || currentStep === 'reinforcement') && (
              <div className="mb-8">
                <div className={`rounded-2xl p-8 ${
                  currentStep === 'reinforcement' 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300' 
                    : 'bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-300'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">
                        {currentStep === 'reinforcement' ? '💪 Luyện tập tăng cường' : '📝 Câu hỏi kiểm tra'}
                      </h3>
                      <p className="text-gray-700">
                        {currentStep === 'reinforcement' 
                          ? `Câu ${reinforcementIndex + 1}/${reinforcementQuestions.length} - Hãy luyện tập thêm để củng cố kiến thức`
                          : 'Trả lời câu hỏi dựa trên video bạn vừa xem'
                        }
                      </p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      currentStep === 'reinforcement' ? 'bg-yellow-500' : 'bg-teal-500'
                    }`}>
                      {currentStep === 'reinforcement' ? '💪' : '📝'}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <h4 className="text-xl font-semibold text-blue-900 mb-6">
                      {currentQ.question}
                    </h4>
                    
                    <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                      <div className="space-y-4">
                        {currentQ.options.map((option, index) => (
                          <div key={`${currentQ.id}-${index}`} className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all">
                            <RadioGroupItem value={option} id={`option-${currentQ.id}-${index}`} className="text-teal-600" />
                            <Label htmlFor={`option-${currentQ.id}-${index}`} className="cursor-pointer flex-1 text-lg">
                              <span className="font-semibold text-teal-600 mr-3">
                                {String.fromCharCode(65 + index)}
                              </span>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    <div className="mt-8 flex justify-center">
                      <Button 
                        onClick={currentStep === 'reinforcement' ? handleReinforcementAnswer : handleQuizAnswer}
                        disabled={!selectedAnswer}
                        className={`px-8 py-4 text-lg font-semibold rounded-xl ${
                          currentStep === 'reinforcement' 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                            : 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600'
                        } text-white`}
                      >
                        {currentStep === 'reinforcement' ? '💪 Xác nhận luyện tập' : '📝 Gửi câu trả lời'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Section */}
            {needsReview && currentStep === 'review' && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8 text-center">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-white">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-red-700 mb-4">Can thiệp sư phạm</h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    Có vẻ bạn đang gặp khó khăn với chủ đề này. Hãy xem lại kiến thức cốt lõi nhé!
                  </p>
                  <div className="bg-white rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-red-700 mb-4">Thẻ kiến thức tóm tắt</h4>
                    <div className="text-left bg-red-50 p-4 rounded-lg">
                      <p className="text-gray-800">
                        <strong>Chủ đề:</strong> {question.topic}<br/>
                        <strong>Giải thích:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button 
                      onClick={reviewKnowledge}
                      className="bg-red-500 hover:bg-red-600 text-white py-3 px-6"
                    >
                      📹 Xem lại video bài giảng
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('quiz')}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 py-3 px-6"
                    >
                      🎯 Thử lại câu hỏi gốc
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation Section */}
            {showExplanation && currentStep !== 'reinforcement' && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-red-700 mb-2">Giải thích chi tiết</h4>
                      <p className="text-red-800">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Celebration Animation */}
            {showCelebration && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-2xl p-8 text-center animate-bounce shadow-2xl">
                  <div className="text-8xl mb-4">🎉</div>
                  <h3 className="text-3xl font-bold text-green-600 mb-2">Xuất sắc!</h3>
                  <p className="text-xl text-gray-700">Bạn đã trả lời đúng!</p>
                </div>
              </div>
            )}

            {/* AI Chat Interface */}
            {showAIChat && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-purple-700 flex items-center">
                        🤖 Trợ lý AI thông minh
                      </h3>
                      <Button
                        variant="ghost"
                        onClick={() => setShowAIChat(false)}
                        className="p-2 hover:bg-gray-100"
                      >
                        ✕
                      </Button>
                    </div>
                    <p className="text-gray-600 mt-2">Tôi có thể giải thích khái niệm và đưa ra gợi ý cho bạn!</p>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto">
                    {aiResponse && (
                      <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">🤖</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-purple-800">{aiResponse}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={aiChatMessage}
                        onChange={(e) => setAiChatMessage(e.target.value)}
                        placeholder="Hỏi tôi về khái niệm hoặc cách giải bài này..."
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                      />
                      <Button 
                        onClick={sendAIMessage}
                        disabled={!aiChatMessage.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3"
                      >
                        Gửi câu hỏi
                      </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-2">Gợi ý câu hỏi:</h4>
                      <div className="space-y-2">
                        <button 
                          onClick={() => setAiChatMessage("Giải thích cho tôi khái niệm này một cách đơn giản")}
                          className="block w-full text-left p-2 text-sm text-purple-600 hover:bg-purple-50 rounded"
                        >
                          • Giải thích khái niệm một cách đơn giản
                        </button>
                        <button 
                          onClick={() => setAiChatMessage("Đưa ra gợi ý để giải bài này")}
                          className="block w-full text-left p-2 text-sm text-purple-600 hover:bg-purple-50 rounded"
                        >
                          • Đưa ra gợi ý giải bài
                        </button>
                        <button 
                          onClick={() => setAiChatMessage("Cho tôi ví dụ tương tự")}
                          className="block w-full text-left p-2 text-sm text-purple-600 hover:bg-purple-50 rounded"
                        >
                          • Cho ví dụ tương tự
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation - only show when appropriate */}
            {currentStep === 'quiz' && !showExplanation && (
              <div className="flex justify-center mb-6">
                <div className="text-sm text-gray-500">
                  Chọn đáp án và nhấn "Gửi câu trả lời" để tiếp tục
                </div>
              </div>
            )}

            {/* Completion Actions */}
            {currentQuestion === assessmentQuestions.length - 1 && currentStep === 'quiz' && !showExplanation && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-2xl text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">🏆</span>
                </div>
                <h4 className="font-bold text-green-800 mb-2 text-xl">Gần hoàn thành rồi!</h4>
                <p className="text-green-700 mb-4">
                  Trả lời câu hỏi cuối cùng để hoàn thành bài đánh giá và nhận bản đồ tri thức của bạn.
                </p>
              </div>
            )}

            {/* Results Modal */}
            {showResults && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardCheck className="text-white" size={40} />
                      </div>
                      <h2 className="text-3xl font-bold text-navy mb-2">Kết quả đánh giá</h2>
                      <p className="text-gray-600">Bản đồ tri thức và lộ trình học tập được tạo riêng cho bạn</p>
                    </div>

                    {/* Overall Score */}
                    <div className="bg-gradient-to-r from-teal to-blue-500 text-white rounded-xl p-6 mb-8 text-center">
                      <h3 className="text-xl font-semibold mb-2">Điểm tổng kết</h3>
                      <div className="text-4xl font-bold mb-2">
                        {Math.round((Object.values(userAnswers).filter((answer, index) => 
                          answer === assessmentQuestions[index]?.correctAnswer
                        ).length / assessmentQuestions.length) * 100)}%
                      </div>
                      <p className="opacity-90">
                        Bạn đã trả lời đúng {Object.values(userAnswers).filter((answer, index) => 
                          answer === assessmentQuestions[index]?.correctAnswer
                        ).length}/{assessmentQuestions.length} câu hỏi
                      </p>
                    </div>

                    {/* Knowledge Map */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-navy mb-6">Bản đồ tri thức của bạn</h3>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {knowledgeMap.map((topic, index) => (
                          <div
                            key={topic.id}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-white font-medium transition-all duration-300 hover:scale-105 cursor-pointer ${
                              topic.strength === 'strong' 
                                ? 'bg-green-500' 
                                : topic.strength === 'medium' 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            }`}
                          >
                            <div className="text-2xl font-bold mb-2">{topic.id}</div>
                            <div className="text-sm text-center px-2">{topic.name}</div>
                            <div className="text-xs mt-1 opacity-90">{topic.score}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>Vững vàng (≥80%)</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span>Cần cải thiện (60-79%)</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>Cần ôn lại (&lt;60%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Learning Path Recommendations */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-navy mb-4">Lộ trình học tập được đề xuất</h3>
                      <div className="space-y-3">
                        {knowledgeMap
                          .sort((a, b) => {
                            const strengthOrder = { 'weak': 0, 'medium': 1, 'strong': 2 };
                            return strengthOrder[a.strength as keyof typeof strengthOrder] - strengthOrder[b.strength as keyof typeof strengthOrder];
                          })
                          .map((topic, index) => (
                            <div key={topic.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                    index === 0 ? 'bg-teal' : 'bg-gray-300'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-navy">{topic.name}</h4>
                                    <p className="text-sm text-gray-600">
                                      {topic.strength === 'weak' ? 'Ưu tiên cao - Cần ôn lại kiến thức cơ bản' :
                                       topic.strength === 'medium' ? 'Ưu tiên trung bình - Củng cố kiến thức' :
                                       'Duy trì và nâng cao'}
                                    </p>
                                  </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  topic.strength === 'strong' ? 'bg-green-100 text-green-700' :
                                  topic.strength === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {topic.score}
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <Button 
                        onClick={() => window.location.href = '/learning'}
                        className="flex-1 bg-teal hover:bg-teal/90 py-3"
                      >
                        Bắt đầu học theo lộ trình
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/gameshow'}
                        variant="outline"
                        className="flex-1 py-3"
                      >
                        Thử thách Game Show
                      </Button>
                      <Button 
                        onClick={() => setShowResults(false)}
                        variant="outline"
                        className="flex-1 py-3"
                      >
                        Làm lại bài test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
