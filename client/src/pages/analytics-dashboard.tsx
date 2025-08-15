import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Clock, Target, Brain, Award, 
  Activity, Eye, Star, Flame, Zap, BookOpen, Users,
  ChevronRight, Calendar, PieChart, LineChart, Medal
} from "lucide-react";
import { AnimatedProgressBar, StaggeredList } from "@/components/enhanced-animations";

interface AnalyticsDashboardProps {
  userId?: string;
}

export default function AnalyticsDashboard({ userId = "sample-user-1" }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [userId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate comprehensive analytics data
      const mockAnalytics = {
        overview: {
          totalStudyTime: "24h 15m",
          questionsCompleted: 347,
          topicsStudied: 12,
          averageAccuracy: 84,
          streakRecord: 15,
          level: 4,
          totalXP: 2850,
          nextLevelXP: 3500,
          weeklyGoalProgress: 78
        },
        cognitive: {
          responseTime: {
            average: 4200,
            improvement: "+18%",
            trend: "improving"
          },
          confidence: {
            level: 78,
            change: "+12%",
            strongTopics: ["Số học cơ bản", "Hình học phẳng"],
            weakTopics: ["Phương trình bậc 2", "Hệ phương trình"]
          },
          learningStyle: {
            primary: "Visual-Kinesthetic",
            effectiveness: 87,
            adaptations: [
              "Sử dụng nhiều biểu đồ và hình ảnh",
              "Thực hành với mô hình cụ thể", 
              "Kết nối với ví dụ thực tế"
            ]
          }
        },
        performance: {
          weeklyStats: [
            { week: "Tuần 1", accuracy: 65, questions: 45 },
            { week: "Tuần 2", accuracy: 72, questions: 62 },
            { week: "Tuần 3", accuracy: 78, questions: 58 },
            { week: "Tuần 4", accuracy: 84, questions: 71 }
          ],
          topicMastery: [
            { topic: "Số học cơ bản", mastery: 95, questions: 89 },
            { topic: "Phân số", mastery: 78, questions: 56 },
            { topic: "Hình học", mastery: 92, questions: 67 },
            { topic: "Phương trình bậc 1", mastery: 85, questions: 43 },
            { topic: "Phương trình bậc 2", mastery: 62, questions: 34 },
            { topic: "Hệ phương trình", mastery: 58, questions: 28 }
          ]
        },
        achievements: [
          {
            id: "streak_master",
            name: "Bậc thầy chuỗi thắng",
            description: "15 câu đúng liên tiếp",
            icon: "🔥",
            rarity: "epic",
            unlockedAt: "2024-01-20T15:30:00Z"
          },
          {
            id: "speed_demon",
            name: "Tốc độ ánh sáng",
            description: "Trả lời đúng trong 3 giây",
            icon: "⚡",
            rarity: "rare",
            unlockedAt: "2024-01-18T10:45:00Z"
          },
          {
            id: "geometry_guru",
            name: "Guru Hình học",
            description: "90% thành thạo hình học",
            icon: "📐",
            rarity: "legendary",
            unlockedAt: "2024-01-15T14:20:00Z"
          }
        ],
        insights: [
          {
            type: "strength",
            title: "Điểm mạnh nhận thức",
            content: "Bạn thể hiện xuất sắc trong việc nhận dạng patterns và suy luận logic.",
            recommendation: "Hãy thử các bài toán nâng cao để phát triển thêm kỹ năng này."
          },
          {
            type: "improvement",
            title: "Cơ hội cải thiện",
            content: "Thời gian phản ứng với phương trình bậc 2 vẫn còn chậm.",
            recommendation: "Luyện tập thêm với các bài tập cơ bản để tăng tốc độ."
          },
          {
            type: "pattern",
            title: "Mẫu học tập",
            content: "Bạn học hiệu quả nhất vào buổi chiều (14:00-16:00).",
            recommendation: "Sắp xếp các chủ đề khó trong khung giờ này."
          }
        ]
      };

      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", name: "Tổng quan", icon: Eye },
    { id: "cognitive", name: "Nhận thức", icon: Brain },
    { id: "performance", name: "Hiệu suất", icon: BarChart3 },
    { id: "achievements", name: "Thành tích", icon: Award },
    { id: "insights", name: "Phân tích", icon: TrendingUp }
  ];

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải phân tích học tập...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg mb-4">
            <Activity size={16} className="mr-2" />
            Bảng điều khiển Phân tích Học tập
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600">Theo dõi tiến độ và tối ưu hóa quá trình học tập của bạn</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200"
                }`}
              >
                <TabIcon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <StaggeredList staggerDelay={0.1}>
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6 text-center">
                    <Clock size={32} className="mx-auto mb-3" />
                    <div className="text-2xl font-bold">{analyticsData.overview.totalStudyTime}</div>
                    <div className="text-blue-100">Thời gian học</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6 text-center">
                    <Target size={32} className="mx-auto mb-3" />
                    <div className="text-2xl font-bold">{analyticsData.overview.questionsCompleted}</div>
                    <div className="text-green-100">Câu hỏi hoàn thành</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6 text-center">
                    <BookOpen size={32} className="mx-auto mb-3" />
                    <div className="text-2xl font-bold">{analyticsData.overview.topicsStudied}</div>
                    <div className="text-purple-100">Chủ đề đã học</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6 text-center">
                    <Flame size={32} className="mx-auto mb-3" />
                    <div className="text-2xl font-bold">{analyticsData.overview.streakRecord}</div>
                    <div className="text-orange-100">Kỷ lục chuỗi thắng</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-xl border-0 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center text-indigo-900">
                      <Medal size={20} className="mr-2" />
                      Tiến độ Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {analyticsData.overview.level}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">Level {analyticsData.overview.level}</div>
                            <div className="text-sm text-gray-600">Học sinh xuất sắc</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-600">{analyticsData.overview.totalXP} XP</div>
                          <div className="text-sm text-gray-500">/ {analyticsData.overview.nextLevelXP} XP</div>
                        </div>
                      </div>
                      
                      <AnimatedProgressBar 
                        value={(analyticsData.overview.totalXP / analyticsData.overview.nextLevelXP) * 100}
                        color="bg-gradient-to-r from-yellow-400 to-orange-500"
                        className="mb-2"
                      />
                      
                      <div className="text-sm text-gray-600 text-center">
                        Còn {analyticsData.overview.nextLevelXP - analyticsData.overview.totalXP} XP để lên level {analyticsData.overview.level + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center text-indigo-900">
                      <Target size={20} className="mr-2" />
                      Mục tiêu tuần
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Tiến độ hoàn thành</span>
                        <span className="font-bold text-indigo-600">{analyticsData.overview.weeklyGoalProgress}%</span>
                      </div>
                      
                      <AnimatedProgressBar 
                        value={analyticsData.overview.weeklyGoalProgress}
                        color="bg-gradient-to-r from-green-400 to-blue-500"
                      />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="font-bold text-gray-800">47/60</div>
                          <div className="text-gray-600">Câu hỏi</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="font-bold text-gray-800">5.2/7</div>
                          <div className="text-gray-600">Giờ học</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </StaggeredList>
          )}

          {/* Cognitive Tab */}
          {activeTab === "cognitive" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-xl border-0 bg-white/95">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Thời gian phản ứng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Math.round(analyticsData.cognitive.responseTime.average / 1000)}s
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Trung bình</div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        {analyticsData.cognitive.responseTime.improvement} cải thiện
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-white/95">
                  <CardHeader>
                    <CardTitle className="text-green-900">Mức độ tự tin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {analyticsData.cognitive.confidence.level}%
                      </div>
                      <AnimatedProgressBar value={analyticsData.cognitive.confidence.level} color="bg-green-500" className="mb-3" />
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        {analyticsData.cognitive.confidence.change} tuần này
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-white/95">
                  <CardHeader>
                    <CardTitle className="text-purple-900">Phong cách học</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 mb-2">
                        {analyticsData.cognitive.learningStyle.primary}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Hiệu quả {analyticsData.cognitive.learningStyle.effectiveness}%</div>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                        Phù hợp cao
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-xl border-0 bg-white/95">
                  <CardHeader>
                    <CardTitle className="text-green-900">Chủ đề mạnh</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.cognitive.confidence.strongTopics.map((topic: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-green-800">{topic}</span>
                          <Star size={16} className="text-green-600" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-white/95">
                  <CardHeader>
                    <CardTitle className="text-orange-900">Khu vực cải thiện</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.cognitive.confidence.weakTopics.map((topic: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium text-orange-800">{topic}</span>
                          <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
                            Luyện tập
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-8">
              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader>
                  <CardTitle className="flex items-center text-indigo-900">
                    <LineChart size={20} className="mr-2" />
                    Xu hướng tuần qua
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {analyticsData.performance.weeklyStats.map((week: any, index: number) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-800 mb-2">{week.week}</div>
                        <div className="text-2xl font-bold text-indigo-600 mb-1">{week.accuracy}%</div>
                        <div className="text-sm text-gray-600">{week.questions} câu</div>
                        <AnimatedProgressBar value={week.accuracy} className="mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader>
                  <CardTitle className="flex items-center text-indigo-900">
                    <PieChart size={20} className="mr-2" />
                    Mức thành thạo theo chủ đề
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.performance.topicMastery.map((topic: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{topic.topic}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{topic.questions} câu</span>
                            <Badge variant="outline" className={
                              topic.mastery >= 90 ? "bg-green-50 text-green-700 border-green-300" :
                              topic.mastery >= 75 ? "bg-yellow-50 text-yellow-700 border-yellow-300" :
                              "bg-red-50 text-red-700 border-red-300"
                            }>
                              {topic.mastery}%
                            </Badge>
                          </div>
                        </div>
                        <AnimatedProgressBar 
                          value={topic.mastery} 
                          color={
                            topic.mastery >= 90 ? "bg-green-500" :
                            topic.mastery >= 75 ? "bg-yellow-500" :
                            "bg-red-500"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="grid md:grid-cols-3 gap-6">
              {analyticsData.achievements.map((achievement: any, index: number) => (
                <Card key={index} className="shadow-xl border-0 bg-white/95 hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{achievement.icon}</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    <Badge variant="outline" className={
                      achievement.rarity === "legendary" ? "bg-yellow-50 text-yellow-700 border-yellow-300" :
                      achievement.rarity === "epic" ? "bg-purple-50 text-purple-700 border-purple-300" :
                      "bg-blue-50 text-blue-700 border-blue-300"
                    }>
                      {achievement.rarity === "legendary" ? "Huyền thoại" :
                       achievement.rarity === "epic" ? "Sử thi" : "Hiếm"}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-2">
                      Đạt được: {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === "insights" && (
            <div className="space-y-6">
              {analyticsData.insights.map((insight: any, index: number) => (
                <Card key={index} className="shadow-xl border-0 bg-white/95">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        insight.type === "strength" ? "bg-green-100 text-green-600" :
                        insight.type === "improvement" ? "bg-orange-100 text-orange-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                        {insight.type === "strength" ? <Star size={20} /> :
                         insight.type === "improvement" ? <TrendingUp size={20} /> :
                         <Brain size={20} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{insight.title}</h3>
                        <p className="text-gray-600 mb-3">{insight.content}</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-1">💡 Khuyến nghị:</div>
                          <div className="text-sm text-gray-600">{insight.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
