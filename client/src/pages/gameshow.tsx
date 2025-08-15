import { useState } from "react";
import { Trophy, HelpCircle, Users, Video, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockGameShowQuestions } from "@/data/mock-data";

const prizeStructure = [
  { level: 1, prize: "1.000", milestone: false },
  { level: 2, prize: "2.000", milestone: false },
  { level: 3, prize: "5.000", milestone: false },
  { level: 4, prize: "10.000", milestone: false },
  { level: 5, prize: "50.000", milestone: true },
  { level: 6, prize: "100.000", milestone: false },
  { level: 7, prize: "200.000", milestone: false },
  { level: 8, prize: "500.000", milestone: false },
  { level: 9, prize: "1.000.000", milestone: true },
  { level: 10, prize: "5.000.000", milestone: false },
];

export default function GameShow() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [helpUsed, setHelpUsed] = useState({
    fifty50: false,
    askAI: false,
    replay: false
  });
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [gameStatus, setGameStatus] = useState<'playing' | 'correct' | 'wrong' | 'completed'>('playing');

  const currentQuestion = mockGameShowQuestions[currentLevel - 1];
  const progress = (currentLevel / 15) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const useHelp = async (helpType: 'fifty50' | 'askAI' | 'replay') => {
    setHelpUsed(prev => ({ ...prev, [helpType]: true }));
    
    switch (helpType) {
      case 'fifty50':
        // Remove two incorrect answers
        const correctAnswer = currentQuestion.correctAnswer;
        const incorrectOptions = currentQuestion.options.filter(opt => opt !== correctAnswer);
        const toEliminate = incorrectOptions.slice(0, 2); // Remove first 2 incorrect options
        setEliminatedOptions(toEliminate);
        break;
        
      case 'askAI':
        // Get AI hint
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: `Hãy đưa ra gợi ý (không phải đáp án trực tiếp) cho câu hỏi: ${currentQuestion.question}`,
              context: "Game show Aithenos - người chơi cần gợi ý, không phải đáp án"
            }),
          });
          const data = await response.json();
          setAiHint(data.response);
          setShowAIHelp(true);
        } catch (error) {
          console.error("AI help error:", error);
        }
        break;
        
      case 'replay':
        // Show knowledge card/video
        alert("Chức năng xem lại video sẽ được triển khai trong phiên bản tiếp theo!");
        break;
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setGameStatus('correct');
      setTimeout(() => {
        if (currentLevel < 15) {
          setCurrentLevel(currentLevel + 1);
          setSelectedAnswer("");
          setEliminatedOptions([]);
          setGameStatus('playing');
          // Reset help for new question
          setHelpUsed({ fifty50: false, askAI: false, replay: false });
        } else {
          setGameStatus('completed');
        }
      }, 2000);
    } else {
      setGameStatus('wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy via-purple-900 to-navy relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gold rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-purple-400 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-2 drop-shadow-lg">
            AITHENOS
          </h1>
          <p className="text-white/90 text-lg">Game Show Kiến Thức Toán Học</p>
        </div>

        {/* Game Progress */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-semibold">Câu hỏi {currentLevel}/15</span>
              <span className="text-gold font-bold text-xl">{currentQuestion?.prize}.000 điểm</span>
            </div>
            <Progress value={progress} className="h-3 mb-4" />
            
            {/* Prize Ladder */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {prizeStructure.slice(0, 6).map((prize) => (
                <div 
                  key={prize.level}
                  className={`p-1 rounded ${
                    prize.level === currentLevel 
                      ? 'text-gold font-bold bg-gold/20' 
                      : prize.level < currentLevel
                      ? 'text-green-400'
                      : 'text-white/60'
                  }`}
                >
                  {prize.level}: {prize.prize}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="bg-white shadow-2xl mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-navy font-bold text-2xl">{currentLevel}</span>
              </div>
              <h2 className="text-2xl font-bold text-navy mb-4">
                {currentQuestion?.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {currentQuestion?.options.map((option, index) => {
                const colors = ['blue', 'red', 'green', 'yellow'];
                const color = colors[index];
                const isEliminated = eliminatedOptions.includes(option);
                
                return (
                  <Button
                    key={index}
                    onClick={() => !isEliminated && handleAnswerSelect(option)}
                    variant="outline"
                    disabled={isEliminated}
                    className={`answer-option p-4 text-left transition-all hover:scale-105 ${
                      isEliminated
                        ? 'opacity-30 bg-gray-100 border-gray-300'
                        : selectedAnswer === option
                        ? `ring-4 ring-gold bg-${color}-50 border-${color}-300`
                        : `bg-${color}-50 border-${color}-200 hover:bg-${color}-100`
                    }`}
                  >
                    <span className={`font-bold mr-3 ${
                      isEliminated 
                        ? 'text-gray-400' 
                        : `text-${color}-600`
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={isEliminated ? 'text-gray-400' : 'text-navy'}>
                      {isEliminated ? '❌ ' + option : option}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Options */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => useHelp('fifty50')}
            disabled={helpUsed.fifty50}
            variant="outline"
            className="help-option bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all p-4"
          >
            <Zap className="mb-2" size={24} />
            <div className="font-semibold">50/50</div>
            <div className="text-sm opacity-75">Loại bỏ 2 đáp án sai</div>
          </Button>
          
          <Button
            onClick={() => useHelp('askAI')}
            disabled={helpUsed.askAI}
            variant="outline"
            className="help-option bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all p-4"
          >
            <HelpCircle className="mb-2" size={24} />
            <div className="font-semibold">Hỏi AI</div>
            <div className="text-sm opacity-75">Nhận gợi ý từ trợ lý</div>
          </Button>
          
          <Button
            onClick={() => useHelp('replay')}
            disabled={helpUsed.replay}
            variant="outline"
            className="help-option bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all p-4"
          >
            <Video className="mb-2" size={24} />
            <div className="font-semibold">Xem lại</div>
            <div className="text-sm opacity-75">Video kiến thức liên quan</div>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            variant="destructive" 
            className="px-8 py-3 font-semibold"
            onClick={() => setGameStatus('wrong')}
          >
            Dừng cuộc chơi
          </Button>
          <Button 
            onClick={submitAnswer}
            disabled={!selectedAnswer || gameStatus !== 'playing'}
            className="px-8 py-3 bg-gold text-navy font-semibold hover:bg-gold/90"
          >
            Chọn đáp án cuối cùng
          </Button>
        </div>

        {/* Game Status Modals */}
        {gameStatus === 'correct' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-8 text-center animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-green-600 mb-2">Chính xác!</h3>
              <p className="text-xl text-gray-600">
                Bạn đã trả lời đúng và nhận được <span className="text-gold font-bold">{currentQuestion?.prize}.000 điểm</span>
              </p>
            </div>
          </div>
        )}

        {gameStatus === 'wrong' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-3xl font-bold text-red-600 mb-2">Rất tiếc!</h3>
              <p className="text-lg text-gray-600 mb-6">
                Câu trả lời không đúng. Bạn đã dừng cuộc chơi ở câu số {currentLevel}.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setCurrentLevel(1);
                    setSelectedAnswer("");
                    setGameStatus('playing');
                    setHelpUsed({ fifty50: false, askAI: false, replay: false });
                    setEliminatedOptions([]);
                  }}
                  className="w-full bg-teal hover:bg-teal/90"
                >
                  Chơi lại từ đầu
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'completed' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-3xl font-bold text-gold mb-2">Xuất sắc!</h3>
              <p className="text-lg text-gray-600 mb-6">
                Bạn đã hoàn thành tất cả 15 câu hỏi và trở thành nhà vô địch Aithenos!
              </p>
              <div className="bg-gold/20 p-4 rounded-lg mb-6">
                <p className="text-2xl font-bold text-gold">🥇 5.000.000 điểm</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/leaderboard'}
                className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold"
              >
                Xem bảng xếp hạng
              </Button>
            </div>
          </div>
        )}

        {/* AI Help Modal */}
        {showAIHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-navy flex items-center">
                    <HelpCircle className="mr-2" />
                    Gợi ý từ AI
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAIHelp(false)}
                    className="p-2"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800">{aiHint}</p>
                </div>
                
                <Button 
                  onClick={() => setShowAIHelp(false)}
                  className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
                >
                  Hiểu rồi, cảm ơn!
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
