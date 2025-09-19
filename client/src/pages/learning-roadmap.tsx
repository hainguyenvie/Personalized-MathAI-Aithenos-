import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Star, Flame, Target, Brain, Clock, Award, 
  CheckCircle, PlayCircle, Lock, ArrowRight, Zap, 
  Calendar, TrendingUp, BookOpen, Users, Medal,
  Sparkles, Eye, BarChart3, Activity, ChevronRight,
  Map, Route, Flag, Rocket, Crown, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoadmapProps {
  userId?: string;
}

export default function LearningRoadmap({ userId = "sample-user-1" }: RoadmapProps) {
  const [activeTab, setActiveTab] = useState("roadmap");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmapData();
    // Show celebration on first load
    setTimeout(() => setShowCelebration(true), 500);
  }, [userId]);

  const loadRoadmapData = async () => {
    try {
      setLoading(true);
      
      // Mock comprehensive data for demo
      const mockProfile = {
        id: userId,
        name: "An Nguyễn",
        level: 4,
        totalXP: 2850,
        nextLevelXP: 3500,
        streak: 12,
        totalStudyTime: "24h 15m",
        completedTopics: 8,
        totalTopics: 15,
        strengths: ["Số học cơ bản", "Hình học"],
        improving: ["Phân số", "Phương trình bậc 2"],
        badge: "Học sinh xuất sắc",
        rank: "Top 15% lớp 9A3"
      };

      const mockLearningPath = {
        id: "path-1",
        title: "Lộ trình cải thiện Toán học cá nhân",
        description: "Lộ trình được thiết kế riêng dựa trên kết quả chẩn đoán của bạn",
        totalWeeks: 6,
        currentWeek: 2,
        progress: 35,
        estimatedCompletion: "2024-03-15",
        difficulty: "Trung bình",
        topics: [
          {
            id: "topic-1",
            name: "Phân số và số thập phân",
            description: "Củng cố kiến thức về phân số, chuyển đổi và phép tính",
            status: "completed",
            progress: 100,
            lessons: 8,
            completedLessons: 8,
            xpReward: 240,
            estimatedTime: "3 giờ",
            difficulty: "Dễ",
            prerequisites: [],
            skills: ["Quy đồng phân số", "Phép cộng phân số", "Rút gọn phân số"]
          },
          {
            id: "topic-2", 
            name: "Hình học phẳng cơ bản",
            description: "Chu vi, diện tích và tính chất các hình cơ bản",
            status: "in-progress",
            progress: 60,
            lessons: 12,
            completedLessons: 7,
            xpReward: 360,
            estimatedTime: "4.5 giờ",
            difficulty: "Trung bình",
            prerequisites: ["Phân số và số thập phân"],
            skills: ["Chu vi hình chữ nhật", "Diện tích tam giác", "Định lý Pythagoras"]
          },
          {
            id: "topic-3",
            name: "Phương trình bậc nhất",
            description: "Giải và ứng dụng phương trình bậc nhất một ẩn",
            status: "locked",
            progress: 0,
            lessons: 10,
            completedLessons: 0,
            xpReward: 320,
            estimatedTime: "4 giờ",
            difficulty: "Trung bình",
            prerequisites: ["Hình học phẳng cơ bản"],
            skills: ["Chuyển vế", "Quy tắc dấu", "Bài toán có lời văn"]
          },
          {
            id: "topic-4",
            name: "Hệ phương trình",
            description: "Giải hệ phương trình bậc nhất hai ẩn",
            status: "locked",
            progress: 0,
            lessons: 15,
            completedLessons: 0,
            xpReward: 450,
            estimatedTime: "6 giờ", 
            difficulty: "Khó",
            prerequisites: ["Phương trình bậc nhất"],
            skills: ["Phương pháp thế", "Phương pháp cộng", "Ứng dụng thực tế"]
          },
          {
            id: "topic-5",
            name: "Phương trình bậc hai",
            description: "Giải và phân tích phương trình bậc hai",
            status: "locked",
            progress: 0,
            lessons: 18,
            completedLessons: 0,
            xpReward: 540,
            estimatedTime: "7.5 giờ",
            difficulty: "Khó",
            prerequisites: ["Hệ phương trình"],
            skills: ["Công thức nghiệm", "Biệt thức Delta", "Định lý Vieta"]
          }
        ]
      };

      const mockAchievements = [
        {
          id: "diagnostic_master",
          name: "Chuyên gia Chẩn đoán",
          description: "Hoàn thành bài kiểm tra chẩn đoán với điểm cao",
          icon: "🎯",
          rarity: "epic",
          xpBonus: 100,
          unlockedAt: new Date().toISOString(),
          progress: 100,
          maxProgress: 100
        },
        {
          id: "quick_learner",
          name: "Học Nhanh",
          description: "Hoàn thành 3 bài học trong 1 ngày",
          icon: "⚡",
          rarity: "rare",
          xpBonus: 75,
          unlockedAt: new Date().toISOString(),
          progress: 100,
          maxProgress: 100
        },
        {
          id: "streak_warrior",
          name: "Chiến binh Chuỗi thắng",
          description: "Duy trì chuỗi học 7 ngày liên tiếp",
          icon: "🔥",
          rarity: "legendary",
          xpBonus: 200,
          unlockedAt: null,
          progress: 5,
          maxProgress: 7
        },
        {
          id: "problem_solver",
          name: "Giải Quyết Vấn Đề",
          description: "Giải đúng 50 bài toán khó",
          icon: "🧩",
          rarity: "epic",
          xpBonus: 150,
          unlockedAt: null,
          progress: 23,
          maxProgress: 50
        }
      ];

      setUserProfile(mockProfile);
      setLearningPath(mockLearningPath);
      setAchievements(mockAchievements);
      
    } catch (error) {
      console.error("Error loading roadmap data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "locked": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in-progress": return PlayCircle;
      case "locked": return Lock;
      default: return Lock;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Dễ": return "text-green-600 bg-green-50 border-green-200";
      case "Trung bình": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Khó": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Đang tạo lộ trình học tập cá nhân...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Celebration Particles */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: window.innerHeight + 50,
                opacity: 1 
              }}
              animate={{ 
                y: -100, 
                opacity: 0 
              }}
              transition={{ 
                duration: 3, 
                delay: i * 0.1 
              }}
            >
              {['🎉', '✨', '🎊', '⭐', '🌟'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Crown className="mr-2" size={20} />
              <span className="font-bold">Lộ trình học tập được cá nhân hóa</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              Chào mừng, <span className="text-yellow-300">{userProfile?.name}!</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Lộ trình học tập thông minh dành riêng cho bạn đã sẵn sàng! 🚀
            </p>

            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Medal className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold">Level {userProfile?.level}</div>
                <div className="text-sm text-blue-100">{userProfile?.badge}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Flame className="mx-auto mb-2 text-orange-300" size={32} />
                <div className="text-2xl font-bold">{userProfile?.streak} ngày</div>
                <div className="text-sm text-blue-100">Chuỗi học tập</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Star className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold">{userProfile?.totalXP}</div>
                <div className="text-sm text-blue-100">Điểm kinh nghiệm</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Trophy className="mx-auto mb-2 text-purple-300" size={32} />
                <div className="text-2xl font-bold">{userProfile?.rank}</div>
                <div className="text-sm text-blue-100">Xếp hạng</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "roadmap", name: "Lộ trình", icon: Route },
            { id: "progress", name: "Tiến độ", icon: BarChart3 },
            { id: "achievements", name: "Thành tích", icon: Award },
            { id: "analytics", name: "Phân tích", icon: Brain }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TabIcon size={18} />
                <span>{tab.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Roadmap Tab */}
        {activeTab === "roadmap" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm mb-8">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Route size={28} className="mr-3" />
                  {learningPath?.title}
                </CardTitle>
                <p className="text-indigo-100">{learningPath?.description}</p>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
                    <div className="text-2xl font-bold text-blue-600">{learningPath?.totalWeeks} tuần</div>
                    <div className="text-sm text-blue-500">Thời gian dự kiến</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
                    <div className="text-2xl font-bold text-green-600">{learningPath?.progress}%</div>
                    <div className="text-sm text-green-500">Hoàn thành</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <Target className="mx-auto mb-2 text-purple-600" size={24} />
                    <div className="text-2xl font-bold text-purple-600">{learningPath?.difficulty}</div>
                    <div className="text-sm text-purple-500">Độ khó</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Tiến độ tổng quát</h3>
                  <Progress value={learningPath?.progress} className="mb-2" />
                  <div className="text-sm text-gray-600">
                    Tuần {learningPath?.currentWeek} / {learningPath?.totalWeeks} • 
                    Dự kiến hoàn thành: {new Date(learningPath?.estimatedCompletion).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Topics */}
            <div className="space-y-6">
              {learningPath?.topics.map((topic: any, index: number) => {
                const StatusIcon = getStatusIcon(topic.status);
                const isLocked = topic.status === "locked";
                const isCompleted = topic.status === "completed";
                const isInProgress = topic.status === "in-progress";
                
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`shadow-lg border-0 overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      isLocked ? 'opacity-75' : 'hover:scale-[1.02]'
                    }`}>
                      <div className="flex">
                        {/* Left Side - Status & Number */}
                        <div className={`w-20 ${getStatusColor(topic.status)} flex flex-col items-center justify-center text-white`}>
                          <div className="text-2xl font-bold mb-1">{index + 1}</div>
                          <StatusIcon size={20} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2">{topic.name}</h3>
                              <p className="text-gray-600 mb-3">{topic.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
                                  {topic.difficulty}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Clock size={12} className="mr-1" />
                                  {topic.estimatedTime}
                                </Badge>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <Star size={12} className="mr-1" />
                                  {topic.xpReward} XP
                                </Badge>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-indigo-600">
                                {topic.completedLessons}/{topic.lessons}
                              </div>
                              <div className="text-sm text-gray-500">bài học</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <Progress value={topic.progress} className="mb-2" />
                          </div>

                          {/* Skills */}
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Kỹ năng sẽ học:</div>
                            <div className="flex flex-wrap gap-2">
                              {topic.skills.map((skill: string, skillIndex: number) => (
                                <span 
                                  key={skillIndex}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {topic.prerequisites.length > 0 && (
                                <span>Cần hoàn thành: {topic.prerequisites.join(", ")}</span>
                              )}
                            </div>
                            
                            <Button
                              disabled={isLocked}
                              className={`${
                                isCompleted ? 'bg-green-600 hover:bg-green-700' :
                                isInProgress ? 'bg-blue-600 hover:bg-blue-700' :
                                'bg-gray-400'
                              } text-white transition-colors`}
                              onClick={() => {
                                if (!isLocked) {
                                  window.location.href = '/practice';
                                }
                              }}
                            >
                              {isCompleted ? (
                                <>
                                  <Eye size={16} className="mr-2" />
                                  Ôn tập
                                </>
                              ) : isInProgress ? (
                                <>
                                  <PlayCircle size={16} className="mr-2" />
                                  Tiếp tục
                                </>
                              ) : (
                                <>
                                  <Lock size={16} className="mr-2" />
                                  Bị khóa
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Other tabs content would go here */}
        
        {/* Quick Actions */}
        <Card className="mt-8 shadow-xl border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Sẵn sàng tiếp tục học tập?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white text-indigo-600 hover:bg-gray-100 transition-colors font-semibold"
                onClick={() => window.location.href = '/practice'}
              >
                <PlayCircle size={18} className="mr-2" />
                Bắt đầu học
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-indigo-600 transition-colors"
                onClick={() => window.location.href = '/assessment'}
              >
                <Target size={18} className="mr-2" />
                Đánh giá lại
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-indigo-600 transition-colors"
                onClick={() => window.location.href = '/'}
              >
                <ChevronRight size={18} className="mr-2" />
                Trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}