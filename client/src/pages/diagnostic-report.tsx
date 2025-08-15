import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Eye, Clock, Zap, Activity, Award, AlertTriangle, CheckCircle, BarChart3, PieChart, Lightbulb, ArrowRight } from "lucide-react";
import KnowledgeMap from "@/components/knowledge-map";

interface CognitiveProfile {
  responseTime: number;
  confidence: number;
  patternRecognition: number;
  conceptualUnderstanding: number;
  adaptabilityScore: number;
  persistenceIndex: number;
}

interface MisconcepionAnalysis {
  tag: string;
  name: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  remediation: string;
}

interface DiagnosticReportProps {
  assessment?: any;
  knowledgeMap?: any;
  responseLogs?: any[];
  cognitiveMetrics?: any;
}

export default function DiagnosticReport({ 
  assessment, 
  knowledgeMap = {}, 
  responseLogs = [],
  cognitiveMetrics = { responseTime: 0, confidence: 0, patternRecognition: 0, conceptualUnderstanding: 0 }
}: DiagnosticReportProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate comprehensive cognitive profile
  const calculateCognitiveProfile = (): CognitiveProfile => {
    const avgResponseTime = responseLogs.length > 0 
      ? responseLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / responseLogs.length 
      : cognitiveMetrics.responseTime;

    const avgConfidence = responseLogs.length > 0
      ? responseLogs.reduce((sum, log) => sum + (log.cognitiveMetrics?.confidence || 50), 0) / responseLogs.length
      : cognitiveMetrics.confidence;

    const avgPatternRecognition = responseLogs.length > 0
      ? responseLogs.reduce((sum, log) => sum + (log.cognitiveMetrics?.patternRecognition || 50), 0) / responseLogs.length
      : cognitiveMetrics.patternRecognition;

    const avgConceptual = responseLogs.length > 0
      ? responseLogs.reduce((sum, log) => sum + (log.cognitiveMetrics?.conceptualUnderstanding || 50), 0) / responseLogs.length
      : cognitiveMetrics.conceptualUnderstanding;

    // Calculate derived metrics
    const adaptabilityScore = Math.min(100, Math.max(0, 
      (avgConfidence * 0.4) + (avgPatternRecognition * 0.3) + (avgConceptual * 0.3)
    ));

    const persistenceIndex = Math.min(100, Math.max(0,
      100 - (avgResponseTime / 10000 * 100) + (avgConfidence * 0.5)
    ));

    return {
      responseTime: avgResponseTime,
      confidence: avgConfidence,
      patternRecognition: avgPatternRecognition,
      conceptualUnderstanding: avgConceptual,
      adaptabilityScore,
      persistenceIndex
    };
  };

  // Analyze misconceptions in detail
  const analyzeMisconceptions = (): MisconcepionAnalysis[] => {
    const misconceptionMap = responseLogs
      .filter(log => log.misconceptionTag)
      .reduce((acc, log) => {
        const tag = log.misconceptionTag;
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const misconceptionNames: Record<string, { name: string; remediation: string }> = {
      "perimeter_instead_of_area": { 
        name: "Nhầm lẫn chu vi và diện tích", 
        remediation: "Thực hành với mô hình trực quan, nhấn mạnh khái niệm 'bề mặt' vs 'đường viền'" 
      },
      "add_sides_instead_of_multiply": { 
        name: "Cộng thay vì nhân trong diện tích", 
        remediation: "Sử dụng lưới ô vuông để thấy rõ việc nhân là đếm số ô" 
      },
      "double_area_error": { 
        name: "Nhân đôi diện tích không cần thiết", 
        remediation: "Làm rõ công thức chỉ cần nhân một lần chiều dài với chiều rộng" 
      },
      "sign_error_transposition": { 
        name: "Sai dấu khi chuyển vế", 
        remediation: "Luyện tập quy tắc chuyển vế với nhiều ví dụ từ đơn giản đến phức tạp" 
      }
    };

    return Object.entries(misconceptionMap).map(([tag, frequency]) => {
      const info = misconceptionNames[tag] || { name: tag, remediation: "Cần được xem xét thêm" };
      const severity: 'low' | 'medium' | 'high' = frequency >= 3 ? 'high' : frequency >= 2 ? 'medium' : 'low';
      
      return {
        tag,
        name: info.name,
        frequency,
        severity,
        remediation: info.remediation
      };
    }).sort((a, b) => b.frequency - a.frequency);
  };

  const cognitiveProfile = calculateCognitiveProfile();
  const misconceptions = analyzeMisconceptions();

  const tabs = [
    { id: "overview", name: "Tổng quan", icon: Eye },
    { id: "cognitive", name: "Phân tích nhận thức", icon: Brain },
    { id: "misconceptions", name: "Ngộ nhận", icon: AlertTriangle },
    { id: "knowledge", name: "Bản đồ tri thức", icon: Target },
    { id: "recommendations", name: "Khuyến nghị", icon: Lightbulb }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg mb-4">
            <Brain size={16} className="mr-2" />
            Project Infinity • Báo cáo Chẩn đoán Nhận thức
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Phân tích Toàn diện
          </h1>
          <p className="text-lg text-gray-600">Đánh giá sâu về năng lực nhận thức và bản đồ tri thức cá nhân</p>
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
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardTitle className="flex items-center">
                    <CheckCircle size={20} className="mr-2" />
                    Kết quả tổng thể
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {assessment?.score || Math.round(responseLogs.filter(r => r.isCorrect).length / Math.max(responseLogs.length, 1) * 100)}%
                      </div>
                      <div className="text-gray-600">Điểm số chung</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Câu trả lời đúng:</span>
                        <span className="font-semibold">{responseLogs.filter(r => r.isCorrect).length}/{responseLogs.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Thời gian trung bình:</span>
                        <span className="font-semibold">{Math.round(cognitiveProfile.responseTime / 1000)}s</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mức độ tự tin:</span>
                        <span className="font-semibold">{Math.round(cognitiveProfile.confidence)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center">
                    <Activity size={20} className="mr-2" />
                    Chỉ số nhận thức
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Khả năng thích ứng</span>
                        <span className="font-semibold">{Math.round(cognitiveProfile.adaptabilityScore)}%</span>
                      </div>
                      <Progress value={cognitiveProfile.adaptabilityScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tính kiên trì</span>
                        <span className="font-semibold">{Math.round(cognitiveProfile.persistenceIndex)}%</span>
                      </div>
                      <Progress value={cognitiveProfile.persistenceIndex} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Nhận dạng mẫu</span>
                        <span className="font-semibold">{Math.round(cognitiveProfile.patternRecognition)}%</span>
                      </div>
                      <Progress value={cognitiveProfile.patternRecognition} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center">
                    <AlertTriangle size={20} className="mr-2" />
                    Ngộ nhận phát hiện
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {misconceptions.length > 0 ? (
                      misconceptions.slice(0, 3).map((misconception) => (
                        <div key={misconception.tag} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="text-sm">{misconception.name}</div>
                          <Badge 
                            variant="outline" 
                            className={
                              misconception.severity === 'high' ? 'bg-red-50 text-red-700 border-red-300' :
                              misconception.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                              'bg-blue-50 text-blue-700 border-blue-300'
                            }
                          >
                            ×{misconception.frequency}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-600 text-sm text-center">Không phát hiện ngộ nhận đặc thù</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cognitive Analysis Tab */}
          {activeTab === "cognitive" && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center">
                    <Brain size={20} className="mr-2" />
                    Hồ sơ nhận thức chi tiết
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(cognitiveProfile.responseTime / 1000)}s</div>
                        <div className="text-sm text-gray-600">Thời gian phản ứng</div>
                        <div className="mt-2">
                          <Progress value={Math.max(0, 100 - cognitiveProfile.responseTime / 100)} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{Math.round(cognitiveProfile.confidence)}%</div>
                        <div className="text-sm text-gray-600">Mức độ tự tin</div>
                        <div className="mt-2">
                          <Progress value={cognitiveProfile.confidence} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{Math.round(cognitiveProfile.patternRecognition)}%</div>
                        <div className="text-sm text-gray-600">Nhận dạng mẫu</div>
                        <div className="mt-2">
                          <Progress value={cognitiveProfile.patternRecognition} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{Math.round(cognitiveProfile.conceptualUnderstanding)}%</div>
                        <div className="text-sm text-gray-600">Hiểu khái niệm</div>
                        <div className="mt-2">
                          <Progress value={cognitiveProfile.conceptualUnderstanding} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Chỉ số nâng cao</h4>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Khả năng thích ứng</span>
                          <span className="font-semibold">{Math.round(cognitiveProfile.adaptabilityScore)}%</span>
                        </div>
                        <Progress value={cognitiveProfile.adaptabilityScore} className="h-3" />
                        <div className="text-xs text-gray-500 mt-1">Khả năng điều chỉnh chiến lược học tập</div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Chỉ số kiên trì</span>
                          <span className="font-semibold">{Math.round(cognitiveProfile.persistenceIndex)}%</span>
                        </div>
                        <Progress value={cognitiveProfile.persistenceIndex} className="h-3" />
                        <div className="text-xs text-gray-500 mt-1">Khả năng duy trì nỗ lực khi gặp khó khăn</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                  <CardTitle className="flex items-center">
                    <TrendingUp size={20} className="mr-2" />
                    Phân tích xu hướng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Điểm mạnh nhận thức</h4>
                      <div className="space-y-2">
                        {[
                          { name: "Tự tin", score: cognitiveProfile.confidence },
                          { name: "Nhận dạng mẫu", score: cognitiveProfile.patternRecognition },
                          { name: "Hiểu khái niệm", score: cognitiveProfile.conceptualUnderstanding },
                          { name: "Thích ứng", score: cognitiveProfile.adaptabilityScore }
                        ]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((strength, index) => (
                          <div key={strength.name} className="flex items-center space-x-2 text-sm">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{strength.name}</span>
                            <span className="text-gray-600">({Math.round(strength.score)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Khu vực cần phát triển</h4>
                      <div className="space-y-2">
                        {[
                          { name: "Tốc độ phản ứng", score: Math.max(0, 100 - cognitiveProfile.responseTime / 100) },
                          { name: "Tự tin", score: cognitiveProfile.confidence },
                          { name: "Kiên trì", score: cognitiveProfile.persistenceIndex }
                        ]
                        .sort((a, b) => a.score - b.score)
                        .slice(0, 2)
                        .map((area) => (
                          <div key={area.name} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                            <span className="text-sm font-medium text-red-700">{area.name}</span>
                            <Badge variant="outline" className="bg-white text-red-600">
                              {Math.round(area.score)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Misconceptions Tab */}
          {activeTab === "misconceptions" && (
            <Card className="shadow-xl border-0 bg-white/95">
              <CardHeader className="bg-gradient-to-r from-red-500 to-orange-600 text-white">
                <CardTitle className="flex items-center">
                  <AlertTriangle size={20} className="mr-2" />
                  Phân tích Ngộ nhận Chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {misconceptions.length > 0 ? (
                  <div className="space-y-6">
                    {misconceptions.map((misconception, index) => (
                      <div key={misconception.tag} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">{misconception.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Xuất hiện {misconception.frequency} lần
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={
                                misconception.severity === 'high' ? 'bg-red-50 text-red-700 border-red-300' :
                                misconception.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                'bg-green-50 text-green-700 border-green-300'
                              }
                            >
                              {misconception.severity === 'high' ? 'Nghiêm trọng' : 
                               misconception.severity === 'medium' ? 'Vừa phải' : 'Nhẹ'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-2">Phương pháp khắc phục:</h5>
                          <p className="text-sm text-gray-600">{misconception.remediation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Không phát hiện ngộ nhận</h3>
                    <p className="text-gray-600">Học sinh có sự hiểu biết chính xác về các khái niệm được kiểm tra.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Knowledge Map Tab */}
          {activeTab === "knowledge" && (
            <div className="grid md:grid-cols-2 gap-8">
              <KnowledgeMap knowledgeMap={knowledgeMap} />
              
              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center">
                    <BarChart3 size={20} className="mr-2" />
                    Phân tích chủ đề
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Object.entries(knowledgeMap).map(([topic, data]: any) => (
                      <div key={topic} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 capitalize">{topic.replace('-', ' ')}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={
                              data.score >= 80 ? 'bg-green-50 text-green-700 border-green-300' :
                              data.score >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                              'bg-red-50 text-red-700 border-red-300'
                            }>
                              {data.score}%
                            </Badge>
                            <Badge variant="outline">{data.level}</Badge>
                          </div>
                        </div>
                        <Progress value={data.score} className="h-2" />
                        {data.needsWork && (
                          <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            ⚠️ Cần ôn tập và luyện tập thêm
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center">
                    <Lightbulb size={20} className="mr-2" />
                    Khuyến nghị học tập
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Ưu tiên cao</h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        {Object.entries(knowledgeMap)
                          .filter(([_, data]: any) => data.needsWork)
                          .slice(0, 3)
                          .map(([topic]) => (
                            <li key={topic} className="flex items-center space-x-2">
                              <ArrowRight size={14} />
                              <span>Tăng cường luyện tập {topic.replace('-', ' ')}</span>
                            </li>
                          ))}
                        {misconceptions.filter(m => m.severity === 'high').slice(0, 2).map(m => (
                          <li key={m.tag} className="flex items-center space-x-2">
                            <ArrowRight size={14} />
                            <span>Khắc phục ngộ nhận: {m.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Phát triển điểm mạnh</h4>
                      <ul className="space-y-2 text-sm text-green-800">
                        {Object.entries(knowledgeMap)
                          .filter(([_, data]: any) => data.score >= 80)
                          .slice(0, 2)
                          .map(([topic]) => (
                            <li key={topic} className="flex items-center space-x-2">
                              <ArrowRight size={14} />
                              <span>Mở rộng kiến thức {topic.replace('-', ' ')}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center">
                    <Target size={20} className="mr-2" />
                    Lộ trình học tập
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3">Kế hoạch 4 tuần tới</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                          <div>
                            <div className="font-medium text-gray-800">Tuần 1-2: Khắc phục ngộ nhận</div>
                            <div className="text-sm text-gray-600">Tập trung vào các lỗi sai cơ bản đã phát hiện</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                          <div>
                            <div className="font-medium text-gray-800">Tuần 3: Củng cố kiến thức yếu</div>
                            <div className="text-sm text-gray-600">Luyện tập chuyên sâu các chủ đề cần cải thiện</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                          <div>
                            <div className="font-medium text-gray-800">Tuần 4: Thử thách nâng cao</div>
                            <div className="text-sm text-gray-600">Áp dụng kiến thức vào bài tập phức tạp hơn</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 font-semibold">
                      Bắt đầu lộ trình cá nhân hóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

