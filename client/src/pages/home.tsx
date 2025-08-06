import { Flame, Star, Clock, User, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import KnowledgeMap from "@/components/knowledge-map";
import { mockUser, mockLearningTopics, mockAchievements } from "@/data/mock-data";

export default function Home() {
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
                Hôm nay là ngày tuyệt vời để chinh phục kiến thức mới. Bạn đã sẵn sàng chưa?
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-teal-500 px-6 py-4 rounded-xl text-center">
                  <div className="text-sm text-teal-100">Chuỗi học tập</div>
                  <div className="text-2xl font-bold text-white">{mockUser.streak} ngày</div>
                </div>
                <div className="bg-yellow-500 px-6 py-4 rounded-xl text-center">
                  <div className="text-sm text-yellow-100">Điểm tích lũy</div>
                  <div className="text-2xl font-bold text-white">{mockUser.points.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-1">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Sinh viên Việt Nam học tập cùng nhau" 
                  className="rounded-xl w-full h-auto object-cover"
                />
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
                    Toán lớp 9
                  </span>
                </div>
                
                {/* Progress Overview */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-medium text-gray-700">Tiến độ tổng thể</span>
                    <span className="text-lg font-bold text-blue-900">68%</span>
                  </div>
                  <Progress value={68} className="h-4 bg-gray-200" />
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

                <Button className="w-full mt-8 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
                  Tiếp tục học tập
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
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

            {/* Knowledge Map Preview */}
            <KnowledgeMap />

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
