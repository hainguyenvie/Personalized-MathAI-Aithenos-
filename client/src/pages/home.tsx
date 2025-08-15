import { Flame, Star, Clock, Eye, Target, ClipboardCheck, PlayCircle, Trophy, LineChart, Award, Zap, Lightbulb, Sparkles } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import KnowledgeMap from "@/components/knowledge-map";
import GamificationElements from "@/components/gamification-elements";
import { mockUser, mockLearningTopics, mockAchievements } from "@/data/mock-data";
import { useLocation } from "wouter";
import { AnimatedProgressBar, StaggeredList, PulseAttention, TypewriterText } from "@/components/enhanced-animations";
import { motion } from "framer-motion";

export default function Home() {
  const [, navigate] = useLocation();
  const [hasOnboarding, setHasOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAssessment, setLastAssessment] = useState<any | null>(null);
  const [knowledgeTiles, setKnowledgeTiles] = useState<any[]>([]);
  const [onboardingConfig, setOnboardingConfig] = useState<any>(null);

  useEffect(() => {
    try {
      const ob = localStorage.getItem("onboarding");
      if (ob) {
        const config = JSON.parse(ob);
        setOnboardingConfig(config);
        setHasOnboarding(true);
      }
    } catch {}

    const loadAssessments = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/assessments/user/sample-user-1');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // pick the most recent by completedAt if available
          const sorted = [...data].sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
          const latest = sorted[0];
          setLastAssessment(latest);
          try {
            const parsed = JSON.parse(latest.knowledgeMap || '[]');
            setKnowledgeTiles(Array.isArray(parsed) ? parsed : []);
          } catch {
            setKnowledgeTiles([]);
          }
        }
      } catch (e) {
        setLastAssessment(null);
        setKnowledgeTiles([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAssessments();
  }, []);

  // Dynamic primary CTA based on user state
  const primaryCTA = useMemo(() => {
    if (!onboardingConfig) {
      return { label: "Bắt đầu cá nhân hóa", path: "/onboarding", icon: Sparkles };
    }
    if (lastAssessment) {
      return { label: "Tiếp tục học theo lộ trình", path: "/learning", icon: PlayCircle };
    }
    return { label: "Làm bài chẩn đoán", path: "/assessment", icon: ClipboardCheck };
  }, [onboardingConfig, lastAssessment]);

  const resetDemo = async () => {
    try {
      await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'sample-user-1' })
      });
      localStorage.removeItem('onboarding');
      window.location.reload();
    } catch (e) {
      navigate('/onboarding');
    }
  };

  const weakTopics = knowledgeTiles.filter(t => t.strength === 'weak');
  const PrimaryIcon = primaryCTA.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Chào mừng trở lại, <br/>
                <span className="text-yellow-400">{mockUser.fullName}!</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Nền tảng học thích ứng sẵn sàng đồng hành cùng bạn. Bắt đầu từ mục tiêu, chẩn đoán, rồi luyện tập thông minh.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate(primaryCTA.path)}
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-6 py-6 rounded-xl text-lg font-semibold shadow-lg"
                >
                  <PrimaryIcon className="inline mr-2" size={18} />
                  {primaryCTA.label}
                </Button>
                <Button
                  onClick={() => navigate('/gameshow')}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-6 py-6 rounded-xl text-lg"
                >
                  <Trophy className="inline mr-2" size={18} /> Thử thách Game Show
                </Button>
              </div>
              {!hasOnboarding && (
                <div className="mt-4 text-blue-100">
                  Chưa có mục tiêu? <button className="underline" onClick={() => navigate('/onboarding')}>Thiết lập ngay</button>
                </div>
              )}
              {hasOnboarding && (
                <div className="mt-4 text-blue-100">
                  Muốn bắt đầu lại? <button className="underline" onClick={resetDemo}>Reset demo</button>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-1">
                <img 
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Học tập thông minh" 
                  className="rounded-xl w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-blue-900 text-sm shadow">
                <Zap size={14} className="inline mr-1 text-teal-600" /> AI thích ứng • Lộ trình cá nhân hóa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Learning Path */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-blue-900">Lộ trình học tập của bạn</h2>
                  <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold">
                    {hasOnboarding ? 'Khóa học hiện tại' : 'Chưa thiết lập khóa học'}
                  </span>
                </div>
                
                {/* Progress Overview */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-medium text-gray-700">Tiến độ tổng thể</span>
                    <span className="text-lg font-bold text-blue-900">{lastAssessment ? `${Math.max(10, Math.min(95, lastAssessment.score))}%` : '—'}</span>
                  </div>
                  <Progress value={lastAssessment ? Math.max(10, Math.min(95, lastAssessment.score)) : 0} className="h-4 bg-gray-200" />
                </div>

                {/* Learning Topics */}
                <div className="space-y-6">
                  {mockLearningTopics.map((topic) => {
                    const isCompleted = topic.status === "completed";
                    const isCurrent = topic.status === "current";
                    const isLocked = topic.status === "locked";
                    
                    return (
                      <div 
                        key={topic.id}
                        className={`border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                          isCurrent 
                            ? 'border-teal-400 bg-gradient-to-r from-teal-50 to-blue-50 shadow-lg' 
                            : isCompleted
                            ? 'border-green-200 bg-green-50 hover:shadow-md'
                            : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                              isCompleted 
                                ? 'bg-green-500' 
                                : isCurrent 
                                ? 'bg-teal-500' 
                                : 'bg-gray-300'
                            }`}>
                              {isCompleted && <span className="text-white text-xl">✓</span>}
                              {isCurrent && <span className="text-white text-xl">▶</span>}
                              {isLocked && <span className="text-gray-500 text-xl">🔒</span>}
                            </div>
                            <div>
                              <h3 className={`text-lg font-bold ${isLocked ? 'text-gray-600' : 'text-blue-900'}`}>
                                {topic.name}
                              </h3>
                              <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>
                                {topic.description}
                              </p>
                            </div>
                          </div>
                          <div className={`text-xl font-bold px-3 py-1 rounded-lg ${
                            isCompleted 
                              ? 'text-green-700 bg-green-100' 
                              : isCurrent 
                              ? 'text-teal-700 bg-teal-100' 
                              : 'text-gray-500 bg-gray-100'
                          }`}>
                            {topic.progress}%
                          </div>
                        </div>
                        {isCurrent && (
                          <div className="mt-4">
                            <Progress value={topic.progress} className="h-3 bg-gray-200" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid sm:grid-cols-3 gap-3 mt-8">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105" onClick={() => navigate('/learning')}>
                    Tiếp tục học tập
                  </Button>
                  <Button variant="outline" className="w-full py-4 text-lg rounded-xl" onClick={() => navigate(lastAssessment ? '/assessment' : '/onboarding')}>
                    {lastAssessment ? 'Luyện tập điểm yếu' : 'Thiết lập mục tiêu'}
                  </Button>
                  <Button variant="outline" className="w-full py-4 text-lg rounded-xl" onClick={() => navigate('/mastery')}>
                    Thử thách Mastery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

                      {/* Sidebar */}
            <div className="space-y-8">
              {/* Gamification Elements */}
              <GamificationElements 
                userLevel={mockUser.level || 3}
                xp={mockUser.totalXP || 320}
                streak={mockUser.streak || 7}
                masteryScore={lastAssessment?.score || 78}
                achievements={mockAchievements}
                isVisible={true}
              />

              {/* Cognitive Insights */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Phân tích nhận thức</h3>
                  {lastAssessment && lastAssessment.responses ? (
                    (() => {
                      let insights: Array<{ label: string; count: number }> = [];
                      try {
                        const logs = JSON.parse(lastAssessment.responses || '[]');
                        const map: Record<string, number> = {};
                        logs.forEach((r: any) => {
                          if (r.misconception) map[r.misconception] = (map[r.misconception] || 0) + 1;
                        });
                        insights = Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 3);
                      } catch {}
                      return insights.length > 0 ? (
                        <div className="space-y-2">
                          {insights.map((it) => (
                            <div key={it.label} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{it.label}</span>
                              <span className="font-semibold text-blue-900">×{it.count}</span>
                            </div>
                          ))}
                          <Button className="w-full mt-3" onClick={() => navigate('/practice')}>Luyện tập nhắm mục tiêu</Button>
                        </div>
                      ) : (
                        <div className="text-gray-600 text-sm">Chưa phát hiện ngộ nhận đặc thù.</div>
                      );
                    })()
                  ) : (
                    <div className="text-gray-600 text-sm">Chưa có dữ liệu. Hãy hoàn thành bài chẩn đoán.</div>
                  )}
                </CardContent>
              </Card>
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Hành động nhanh</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => navigate('/practice')}><Lightbulb size={16} className="mr-2" />Luyện tập thông minh</Button>
                  <Button variant="outline" onClick={() => navigate('/unit-quiz')}><Award size={16} className="mr-2" />Unit Quiz</Button>
                </div>
              </CardContent>
            </Card>
            {/* Diagnostic Snapshot */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-900">Chẩn đoán gần nhất</h3>
                  <LineChart className="text-blue-700" size={18} />
                </div>
                {isLoading ? (
                  <div className="text-gray-500 text-sm">Đang tải...</div>
                ) : lastAssessment ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Điểm</span>
                      <span className="font-bold text-blue-900">{lastAssessment.score}%</span>
                    </div>
                    <Progress value={lastAssessment.score} className="h-3 mb-4" />
                    <div className="text-sm text-gray-600">Số câu hỏi: {lastAssessment.totalQuestions}</div>
                  </>
                ) : (
                  <div className="text-gray-600 text-sm">Chưa có bài chẩn đoán. Hãy bắt đầu ngay!</div>
                )}
                <Button className="w-full mt-4" onClick={() => navigate('/assessment')}>
                  {lastAssessment ? 'Làm lại bài chẩn đoán' : 'Bắt đầu bài chẩn đoán'}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-6">Thống kê tuần này</h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="text-blue-600" size={20} />
                      <span className="text-gray-700 font-medium">Thời gian học</span>
                    </div>
                    <span className="font-bold text-blue-900 text-lg">4h 32m</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="text-teal-600" size={20} />
                      <span className="text-gray-700 font-medium">Bài học hoàn thành</span>
                    </div>
                    <span className="font-bold text-teal-700 text-lg">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Eye className="text-green-600" size={20} />
                      <span className="text-gray-700 font-medium">Điểm trung bình</span>
                    </div>
                    <span className="font-bold text-green-700 text-lg">8.5/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Map Preview (dynamic) */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-navy mb-4">Bản đồ tri thức</h3>
                {knowledgeTiles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {knowledgeTiles.map((topic) => (
                        <div
                          key={topic.id}
                          className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer ${
                            topic.strength === 'strong' ? 'bg-green-400 text-white' :
                            topic.strength === 'medium' ? 'bg-yellow-400 text-white' :
                            'bg-red-400 text-white'
                          }`}
                          title={`${topic.name} • ${topic.score}`}
                        >
                          {topic.id}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                      <span><span className="inline-block w-3 h-3 bg-green-400 rounded mr-1"></span>Vững</span>
                      <span><span className="inline-block w-3 h-3 bg-yellow-400 rounded mr-1"></span>Cần cải thiện</span>
                      <span><span className="inline-block w-3 h-3 bg-red-400 rounded mr-1"></span>Lỗ hổng</span>
                    </div>
                    {weakTopics.length > 0 && (
                      <Button className="w-full" onClick={() => navigate('/assessment')}>Luyện tập các chủ đề yếu</Button>
                    )}
                  </>
                ) : (
                  <div className="text-gray-600 text-sm">Chưa có dữ liệu. Hãy hoàn thành bài chẩn đoán để tạo bản đồ.</div>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-6">Thành tích mới nhất</h3>
                <div className="space-y-4">
                  {mockAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                        achievement.color === 'gold' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {achievement.icon === 'fire' && <Flame className="text-white" size={18} />}
                        {achievement.icon === 'star' && <Star className="text-white" size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-blue-900">{achievement.name}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
