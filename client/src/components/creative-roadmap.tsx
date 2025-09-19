import { CheckCircle, Circle, Clock, Calendar, TrendingUp, Target, BookOpen, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  week: number;
  progress: number;
  skills: string[];
  xpReward: number;
  estimatedHours: number;
}

interface CreativeRoadmapProps {
  title?: string;
  description?: string;
  totalWeeks?: number;
  currentWeek?: number;
  overallProgress?: number;
  difficulty?: string;
  estimatedCompletion?: string;
  milestones?: RoadmapMilestone[];
}

export default function CreativeRoadmap({
  title = "Lộ trình cải thiện Toán học cá nhân",
  description = "Lộ trình được thiết kế riêng dựa trên kết quả chẩn đoán của bạn",
  totalWeeks = 6,
  currentWeek = 2,
  overallProgress = 35,
  difficulty = "Trung bình",
  estimatedCompletion = "15/3/2024",
  milestones = []
}: CreativeRoadmapProps) {
  
  const defaultMilestones: RoadmapMilestone[] = [
    {
      id: "week-1",
      title: "Phân số và số thập phân",
      description: "Củng cố kiến thức cơ bản về phân số",
      status: 'completed',
      week: 1,
      progress: 100,
      skills: ["Quy đồng phân số", "Phép cộng phân số", "Rút gọn phân số"],
      xpReward: 240,
      estimatedHours: 3
    },
    {
      id: "week-2", 
      title: "Hình học phẳng cơ bản",
      description: "Chu vi, diện tích các hình cơ bản",
      status: 'current',
      week: 2,
      progress: 60,
      skills: ["Chu vi hình chữ nhật", "Diện tích tam giác", "Định lý Pythagoras"],
      xpReward: 360,
      estimatedHours: 4.5
    },
    {
      id: "week-3",
      title: "Phương trình bậc nhất",
      description: "Giải và ứng dụng phương trình bậc nhất",
      status: 'upcoming',
      week: 3,
      progress: 0,
      skills: ["Biến đổi phương trình", "Giải phương trình", "Bài toán thực tế"],
      xpReward: 420,
      estimatedHours: 5
    },
    {
      id: "week-4",
      title: "Hệ phương trình",
      description: "Giải hệ phương trình hai ẩn",
      status: 'upcoming',
      week: 4,
      progress: 0,
      skills: ["Phương pháp thế", "Phương pháp cộng", "Ứng dụng thực tế"],
      xpReward: 480,
      estimatedHours: 6
    },
    {
      id: "week-5",
      title: "Hàm số bậc nhất",
      description: "Đồ thị và tính chất hàm số",
      status: 'locked',
      week: 5,
      progress: 0,
      skills: ["Vẽ đồ thị", "Tính chất hàm số", "Giao điểm"],
      xpReward: 520,
      estimatedHours: 7
    },
    {
      id: "week-6",
      title: "Tổng hợp và ôn tập",
      description: "Kiểm tra cuối khóa và đánh giá",
      status: 'locked',
      week: 6,
      progress: 0,
      skills: ["Tổng hợp kiến thức", "Bài tập nâng cao", "Đánh giá tổng kết"],
      xpReward: 600,
      estimatedHours: 8
    }
  ];

  const roadmapData = milestones.length > 0 ? milestones : defaultMilestones;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" data-testid="icon-completed" />;
      case 'current':
        return <Circle className="w-8 h-8 text-blue-500 animate-pulse" data-testid="icon-current" />;
      case 'upcoming':
        return <Clock className="w-8 h-8 text-yellow-500" data-testid="icon-upcoming" />;
      case 'locked':
        return <Circle className="w-8 h-8 text-gray-400" data-testid="icon-locked" />;
      default:
        return <Circle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'current':
        return 'bg-blue-100 border-blue-300';
      case 'upcoming':
        return 'bg-yellow-50 border-yellow-200';
      case 'locked':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'dễ':
        return 'bg-green-100 text-green-800';
      case 'trung bình':
        return 'bg-purple-100 text-purple-800';
      case 'khó':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="w-full space-y-6" data-testid="creative-roadmap">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-2">
          <Target className="w-8 h-8" />
          <h1 className="text-2xl font-bold" data-testid="roadmap-title">{title}</h1>
        </div>
        <p className="text-purple-100" data-testid="roadmap-description">{description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600" data-testid="total-weeks">{totalWeeks} tuần</div>
            <div className="text-sm text-blue-500">Thời gian dự kiến</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600" data-testid="overall-progress">{overallProgress}%</div>
            <div className="text-sm text-green-500">Hoàn thành</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600" data-testid="difficulty-level">{difficulty}</div>
            <div className="text-sm text-purple-500">Độ khó</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4" data-testid="progress-title">Tiến độ tổng quát</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tuần {currentWeek}/{totalWeeks}</span>
              <span className="text-sm text-gray-600">Dự kiến hoàn thành: {estimatedCompletion}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
                data-testid="progress-bar"
              ></div>
            </div>
            <div className="text-sm text-gray-500">
              {overallProgress}% hoàn thành
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creative Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
        
        <div className="space-y-8">
          {roadmapData.map((milestone, index) => (
            <div key={milestone.id} className="relative flex items-start space-x-6">
              {/* Timeline Node */}
              <div className="relative z-10 flex-shrink-0">
                {getStatusIcon(milestone.status)}
                {milestone.status === 'current' && (
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
                )}
              </div>
              
              {/* Milestone Card */}
              <Card className={`flex-1 ${getStatusColor(milestone.status)} transition-all duration-300 hover:shadow-lg`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-lg" data-testid={`milestone-title-${milestone.id}`}>
                          {milestone.title}
                        </h4>
                        <Badge variant="outline">Tuần {milestone.week}</Badge>
                        {milestone.status === 'current' && (
                          <Badge className="bg-blue-500 text-white">Đang học</Badge>
                        )}
                        {milestone.status === 'completed' && (
                          <Badge className="bg-green-500 text-white">Hoàn thành</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3" data-testid={`milestone-description-${milestone.id}`}>
                        {milestone.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        {milestone.estimatedHours}h
                      </div>
                      <div className="text-sm text-yellow-600">
                        <Star className="w-4 h-4 inline mr-1" />
                        +{milestone.xpReward} XP
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Current/In-Progress */}
                  {milestone.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tiến độ</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${milestone.progress}%` }}
                          data-testid={`milestone-progress-${milestone.id}`}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Kỹ năng sẽ học:</div>
                    <div className="flex flex-wrap gap-2">
                      {milestone.skills.map((skill, skillIndex) => (
                        <Badge 
                          key={skillIndex} 
                          variant="secondary" 
                          className="text-xs"
                          data-testid={`skill-${milestone.id}-${skillIndex}`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <h3 className="font-bold text-lg mb-2">🎯 Mục tiêu cuối khóa</h3>
          <p className="text-gray-600 mb-4">
            Hoàn thành tất cả {totalWeeks} tuần học để nâng cao năng lực Toán học và đạt được mục tiêu cá nhân
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-green-600">
                {roadmapData.reduce((sum, m) => sum + m.xpReward, 0)} XP
              </div>
              <div className="text-gray-500">Tổng điểm thưởng</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">
                {roadmapData.reduce((sum, m) => sum + m.estimatedHours, 0)}h
              </div>
              <div className="text-gray-500">Tổng thời gian học</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">
                {roadmapData.reduce((sum, m) => sum + m.skills.length, 0)}
              </div>
              <div className="text-gray-500">Kỹ năng mới</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}