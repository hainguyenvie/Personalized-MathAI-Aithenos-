import { Flame, Star, Clock, User, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import KnowledgeMap from "@/components/knowledge-map";
import { mockUser, mockLearningTopics, mockAchievements } from "@/data/mock-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-navy to-navy/80 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Chào mừng trở lại, <span className="text-gold">{mockUser.fullName}!</span>
              </h1>
              <p className="text-lg mb-6 opacity-90">
                Hôm nay là ngày tuyệt vời để chinh phục kiến thức mới. Bạn đã sẵn sàng chưa?
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-teal px-4 py-2 rounded-lg">
                  <div className="text-sm opacity-90">Chuỗi học tập</div>
                  <div className="text-xl font-bold">{mockUser.streak} ngày</div>
                </div>
                <div className="bg-gold/20 px-4 py-2 rounded-lg">
                  <div className="text-sm opacity-90">Điểm tích lũy</div>
                  <div className="text-xl font-bold text-gold">{mockUser.points.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Sinh viên Việt Nam học tập cùng nhau" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Learning Path */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-navy">Lộ trình học tập của bạn</h2>
                  <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-medium">
                    Toán lớp 9
                  </span>
                </div>
                
                {/* Progress Overview */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Tiến độ tổng thể</span>
                    <span className="text-sm font-bold text-navy">68%</span>
                  </div>
                  <Progress value={68} className="h-3" />
                </div>

                {/* Learning Topics */}
                <div className="space-y-4">
                  {mockLearningTopics.map((topic) => {
                    const isCompleted = topic.status === "completed";
                    const isCurrent = topic.status === "current";
                    const isLocked = topic.status === "locked";
                    
                    return (
                      <div 
                        key={topic.id}
                        className={`border rounded-lg p-4 transition-all cursor-pointer ${
                          isCurrent 
                            ? 'border-2 border-teal bg-teal/5' 
                            : isCompleted
                            ? 'border-gray-200 hover:shadow-md'
                            : 'border-gray-200 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-100' 
                                : isCurrent 
                                ? 'bg-teal' 
                                : 'bg-gray-100'
                            }`}>
                              {isCompleted && <i className="fas fa-check text-green-600"></i>}
                              {isCurrent && <i className="fas fa-play text-white"></i>}
                              {isLocked && <i className="fas fa-lock text-gray-400"></i>}
                            </div>
                            <div>
                              <h3 className={`font-semibold ${isLocked ? 'text-gray-600' : 'text-navy'}`}>
                                {topic.name}
                              </h3>
                              <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                                {topic.description}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold ${
                            isCompleted 
                              ? 'text-green-600' 
                              : isCurrent 
                              ? 'text-teal' 
                              : 'text-gray-400'
                          }`}>
                            {topic.progress}%
                          </div>
                        </div>
                        {isCurrent && (
                          <div className="mt-3">
                            <Progress value={topic.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full mt-6 bg-teal hover:bg-teal/90 transition-colors">
                  Tiếp tục học tập
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-navy mb-4">Thống kê tuần này</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Thời gian học</span>
                    <span className="font-bold text-navy">4h 32m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bài học hoàn thành</span>
                    <span className="font-bold text-navy">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Điểm trung bình</span>
                    <span className="font-bold text-green-600">8.5/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Map Preview */}
            <KnowledgeMap />

            {/* Achievements */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-navy mb-4">Thành tích mới nhất</h3>
                <div className="space-y-3">
                  {mockAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.color === 'gold' ? 'bg-gold' : 'bg-green-500'
                      }`}>
                        {achievement.icon === 'fire' && <Flame className="text-white" size={16} />}
                        {achievement.icon === 'star' && <Star className="text-white" size={16} />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{achievement.name}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
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
