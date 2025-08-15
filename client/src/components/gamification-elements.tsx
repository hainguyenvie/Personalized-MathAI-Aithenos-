import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Star, Zap, Target, Award, Crown, Gem, Heart, 
  Flame, Shield, BookOpen, Brain, Users, TrendingUp,
  ChevronUp, Gift, Sparkles
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'learning' | 'persistence' | 'mastery' | 'social';
}

interface GamificationElementsProps {
  userLevel?: number;
  xp?: number;
  streak?: number;
  masteryScore?: number;
  achievements?: Achievement[];
  isVisible?: boolean;
}

export default function GamificationElements({
  userLevel = 1,
  xp = 150,
  streak = 5,
  masteryScore = 75,
  achievements = [],
  isVisible = true
}: GamificationElementsProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [floatingXP, setFloatingXP] = useState<Array<{ id: number; amount: number; x: number; y: number }>>([]);

  const xpToNextLevel = 200;
  const levelProgress = (xp / xpToNextLevel) * 100;

  const rarityColors = {
    common: "from-gray-400 to-gray-600",
    rare: "from-blue-400 to-blue-600", 
    epic: "from-purple-400 to-purple-600",
    legendary: "from-yellow-400 to-orange-600"
  };

  const rarityBorders = {
    common: "border-gray-300",
    rare: "border-blue-300",
    epic: "border-purple-300", 
    legendary: "border-yellow-300"
  };

  const defaultAchievements: Achievement[] = [
    {
      id: "first_correct",
      name: "Bước đầu tiên",
      description: "Trả lời đúng câu hỏi đầu tiên",
      icon: Star,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      rarity: 'common',
      category: 'learning'
    },
    {
      id: "streak_master",
      name: "Chuỗi thắng",
      description: "Trả lời đúng 5 câu liên tiếp",
      icon: Flame,
      unlocked: streak >= 5,
      progress: Math.min(streak, 5),
      maxProgress: 5,
      rarity: 'rare',
      category: 'persistence'
    },
    {
      id: "knowledge_seeker",
      name: "Người tìm kiếm tri thức",
      description: "Hoàn thành 10 bài học",
      icon: BookOpen,
      unlocked: false,
      progress: 7,
      maxProgress: 10,
      rarity: 'epic',
      category: 'learning'
    },
    {
      id: "master_mathematician",
      name: "Bậc thầy toán học",
      description: "Đạt 90% thành thạo",
      icon: Crown,
      unlocked: false,
      progress: masteryScore,
      maxProgress: 90,
      rarity: 'legendary',
      category: 'mastery'
    }
  ];

  const displayAchievements = achievements.length > 0 ? achievements : defaultAchievements;

  const addFloatingXP = (amount: number) => {
    const id = Date.now();
    setFloatingXP(prev => [...prev, {
      id,
      amount,
      x: Math.random() * 200 + 50,
      y: Math.random() * 100 + 50
    }]);

    setTimeout(() => {
      setFloatingXP(prev => prev.filter(item => item.id !== id));
    }, 2000);
  };

  const triggerLevelUp = () => {
    setShowLevelUp(true);
    setTimeout(() => setShowLevelUp(false), 3000);
  };

  const triggerAchievement = (achievement: Achievement) => {
    setShowAchievement(achievement);
    setTimeout(() => setShowAchievement(null), 4000);
  };

  if (!isVisible) return null;

  return (
    <div className="relative">
      {/* Main Progress Bar */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Crown size={20} className="text-yellow-300" />
              </div>
              <div>
                <div className="font-bold">Level {userLevel}</div>
                <div className="text-sm opacity-90">{xp}/{xpToNextLevel} XP</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Flame size={16} className="text-orange-300" />
                  <span className="font-bold">{streak}</span>
                </div>
                <div className="text-xs opacity-75">Chuỗi</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Target size={16} className="text-green-300" />
                  <span className="font-bold">{masteryScore}%</span>
                </div>
                <div className="text-xs opacity-75">Thành thạo</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={levelProgress} className="h-3 bg-white/20" />
            <div className="flex justify-between text-xs opacity-75">
              <span>Tiến độ level</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Preview */}
      <Card className="mt-4 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center">
              <Trophy size={16} className="mr-2 text-yellow-600" />
              Thành tích
            </h3>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              {displayAchievements.filter(a => a.unlocked).length}/{displayAchievements.length}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {displayAchievements.slice(0, 4).map((achievement) => {
              const AchievementIcon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} text-white ${rarityBorders[achievement.rarity]}`
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                  onClick={() => achievement.unlocked && triggerAchievement(achievement)}
                >
                  <div className="text-center">
                    <AchievementIcon size={20} className="mx-auto mb-1" />
                    <div className="text-xs font-medium truncate">{achievement.name}</div>
                    {!achievement.unlocked && achievement.progress < achievement.maxProgress && (
                      <div className="mt-1">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1 bg-gray-300" 
                        />
                        <div className="text-xs mt-1">{achievement.progress}/{achievement.maxProgress}</div>
                      </div>
                    )}
                  </div>
                  
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Star size={8} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="mt-4 shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-green-800 flex items-center">
              <Gift size={16} className="mr-2" />
              Thử thách tuần
            </h3>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              3 ngày còn lại
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
              <span className="text-sm font-medium text-gray-700">Giải 15 bài toán</span>
              <div className="flex items-center space-x-2">
                <Progress value={60} className="w-16 h-2" />
                <span className="text-xs font-semibold text-green-600">9/15</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
              <span className="text-sm font-medium text-gray-700">Chuỗi 7 ngày</span>
              <div className="flex items-center space-x-2">
                <Progress value={71} className="w-16 h-2" />
                <span className="text-xs font-semibold text-green-600">5/7</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="text-xs text-green-600 font-medium">Phần thưởng: 500 XP + Huy hiệu đặc biệt</div>
          </div>
        </CardContent>
      </Card>

      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-2xl shadow-2xl transform animate-bounce">
            <div className="text-center">
              <Crown size={48} className="mx-auto mb-4 text-yellow-200" />
              <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">Level {userLevel + 1}</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <Sparkles size={16} />
                <span className="text-sm">Bạn đã mở khóa tính năng mới!</span>
                <Sparkles size={16} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlock Animation */}
      {showAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={`bg-gradient-to-r ${rarityColors[showAchievement.rarity]} text-white p-6 rounded-xl shadow-2xl transform animate-pulse`}>
            <div className="text-center">
              {React.createElement(showAchievement.icon, { size: 40, className: "mx-auto mb-3" })}
              <h3 className="text-xl font-bold mb-1">Thành tích mở khóa!</h3>
              <p className="text-lg font-semibold">{showAchievement.name}</p>
              <p className="text-sm opacity-90 mt-1">{showAchievement.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating XP */}
      {floatingXP.map((xpItem) => (
        <div
          key={xpItem.id}
          className="fixed z-40 pointer-events-none animate-ping text-green-600 font-bold"
          style={{ 
            left: xpItem.x, 
            top: xpItem.y,
            animation: 'float-up 2s ease-out forwards'
          }}
        >
          +{xpItem.amount} XP
        </div>
      ))}

      {/* Quick Actions */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <Button
          onClick={() => addFloatingXP(25)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg"
          title="Thêm XP (demo)"
        >
          <Zap size={16} />
        </Button>
        
        <Button
          onClick={triggerLevelUp}
          className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-3 shadow-lg"
          title="Level Up (demo)"
        >
          <ChevronUp size={16} />
        </Button>
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px);
          }
        }
      `}</style>
    </div>
  );
}

