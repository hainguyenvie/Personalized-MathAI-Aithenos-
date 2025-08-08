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

  const completeAssessment = () => {
    // Save final answer
    if (selectedAnswer) {
      setUserAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
    }
    
    generateKnowledgeMap();
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-navy mb-2">Bài kiểm tra đánh giá năng lực</h1>
              <p className="text-gray-600">Hoàn thành 15 câu hỏi để chúng tôi hiểu rõ trình độ hiện tại của bạn</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Tiến độ</span>
                <span className="text-sm font-bold text-navy">{currentQuestion + 1}/{assessmentQuestions.length}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Question Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center text-white font-bold">
                  {question.id}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-navy mb-4">
                    {question.question}
                  </h3>
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    <div className="space-y-3">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors">
                          <RadioGroupItem value={option} id={`option-${index}`} className="text-teal" />
                          <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                            {String.fromCharCode(65 + index)}. {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mb-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-3"
              >
                <ChevronLeft size={16} className="mr-1" />
                Câu trước
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="px-6 py-3 bg-gold/20 text-gold border-gold/20 hover:bg-gold/30"
                >
                  <SkipForward size={16} className="mr-1" />
                  Bỏ qua
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestion === assessmentQuestions.length - 1}
                  className="px-6 py-3 bg-teal hover:bg-teal/90"
                >
                  Câu tiếp theo
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>

            {/* Help Section */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <Info size={16} />
                <span className="font-medium">Mẹo:</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                {question.explanation}
              </p>
            </div>

            {/* Completion Actions */}
            {currentQuestion === assessmentQuestions.length - 1 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Hoàn thành bài kiểm tra</h4>
                <p className="text-green-700 text-sm mb-3">
                  Bạn đã hoàn thành tất cả câu hỏi. Nhấn "Xem kết quả" để xem bản đồ tri thức của bạn.
                </p>
                <Button 
                  onClick={completeAssessment}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Xem kết quả và bản đồ tri thức
                </Button>
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
