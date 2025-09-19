import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Users, Sparkles, Brain, Award, TrendingUp, Zap, Star, BookOpen, GraduationCap, User2, Heart, Trophy } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("Hoàng Anh");
  const [role, setRole] = useState<"student" | "parent" | "teacher">("student");
  const [grade, setGrade] = useState("9");
  const [course, setCourse] = useState("math-9");
  const [goalPercent, setGoalPercent] = useState(80);
  const [goalDeadline, setGoalDeadline] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [motivation, setMotivation] = useState("excellence");
  const [learningStyle, setLearningStyle] = useState("balanced");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Simulate profile creation with sophisticated data
      await fetch(`/api/users/sample-user-1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          role,
          grade: `${grade}`,
          subject: "math",
        }),
      });

      // Store comprehensive onboarding config for the adaptive system
      const onboardingConfig = {
        course,
        role,
        goalPercent,
        goalDeadline,
        motivation,
        learningStyle,
        profileComplete: true,
        cognitivePreferences: {
          visualLearning: learningStyle === "visual" ? 0.8 : 0.5,
          conceptualDepth: motivation === "understanding" ? 0.9 : 0.6,
          challengePreference: goalPercent >= 90 ? 0.8 : 0.6,
        },
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("onboarding", JSON.stringify(onboardingConfig));

      setDone(true);
      setTimeout(() => {
        window.location.href = "/assessment";
      }, 1200);
    } catch (e) {
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const motivationOptions = [
    { id: "excellence", label: "Xuất sắc học tập", icon: Trophy, color: "from-yellow-400 to-orange-500", desc: "Muốn đạt điểm cao và thành tích tốt" },
    { id: "understanding", label: "Hiểu sâu bản chất", icon: Brain, color: "from-purple-400 to-pink-500", desc: "Tò mò về cách toán học hoạt động" },
    { id: "confidence", label: "Tự tin với toán", icon: Heart, color: "from-red-400 to-pink-500", desc: "Vượt qua nỗi sợ và lo lắng về toán" },
    { id: "preparation", label: "Chuẩn bị tương lai", icon: TrendingUp, color: "from-green-400 to-blue-500", desc: "Nền tảng cho các môn STEM" },
  ];

  const learningStyleOptions = [
    { id: "visual", label: "Hình ảnh & Trực quan", icon: Sparkles, desc: "Học tốt qua biểu đồ, hình vẽ, màu sắc" },
    { id: "step-by-step", label: "Từng bước chi tiết", icon: Target, desc: "Thích có hướng dẫn rõ ràng, tuần tự" },
    { id: "exploration", label: "Khám phá & Thí nghiệm", icon: Zap, desc: "Học qua thử nghiệm và tự khám phá" },
    { id: "balanced", label: "Kết hợp linh hoạt", icon: Award, desc: "Thích ứng với nhiều phương pháp khác nhau" },
  ];

  const courseInfo = {
    "math-7": { name: "Toán lớp 7", topics: 8, skills: 156, badge: "Khám phá Đại số" },
    "math-8": { name: "Toán lớp 8", topics: 9, skills: 184, badge: "Hình học Nâng cao" },
    "math-9": { name: "Toán lớp 9", topics: 10, skills: 201, badge: "Chuẩn bị Thi cử" },
    "algebra-1": { name: "Đại số 1", topics: 12, skills: 267, badge: "Nền tảng Đại học" },
  };

  const roleCards = [
    { id: "student", label: "Học sinh", icon: GraduationCap, color: "from-blue-500 to-cyan-500", desc: "Tôi đang học và muốn cải thiện kết quả" },
    { id: "parent", label: "Phụ huynh", icon: Heart, color: "from-pink-500 to-rose-500", desc: "Tôi muốn hỗ trợ con học tập hiệu quả" },
    { id: "teacher", label: "Giáo viên", icon: Users, color: "from-green-500 to-emerald-500", desc: "Tôi cần công cụ dạy học thông minh" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header with Progress */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg mb-4">
            <Sparkles size={16} className="mr-2" />
            Project Infinity • Adaptive Learning Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Khởi tạo Hành trình Học tập
          </h1>
          <p className="text-lg text-gray-600 mb-6">Hệ thống sẽ tạo ra trải nghiệm học tập hoàn toàn cá nhân hóa dành riêng cho bạn</p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Bước {step}/{totalSteps}</span>
              <span>{Math.round(progress)}% hoàn thành</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>
          
          <CardContent className="p-8 md:p-12">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <Brain className="mx-auto mb-4 text-indigo-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Thông tin cá nhân</h2>
                  <p className="text-gray-600">Giúp chúng tôi hiểu về bạn để tạo ra trải nghiệm phù hợp nhất</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold text-gray-700 mb-4 block">Vai trò của bạn</Label>
                      <div className="grid gap-3">
                        {roleCards.map((r) => {
                          const RoleIcon = r.icon;
                          return (
                            <div
                              key={r.id}
                              className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                                role === r.id
                                  ? `border-transparent bg-gradient-to-r ${r.color} text-white shadow-lg`
                                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
                              }`}
                              onClick={() => setRole(r.id as any)}
                            >
                              <div className="flex items-center space-x-3">
                                <RoleIcon size={24} />
                                <div>
                                  <div className="font-semibold">{r.label}</div>
                                  <div className={`text-sm ${role === r.id ? "text-white/90" : "text-gray-500"}`}>{r.desc}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold text-gray-700 mb-2 block">Họ và tên</Label>
                      <Input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        placeholder="Nhập họ tên đầy đủ" 
                        className="h-12 text-lg border-2 focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <Label className="text-lg font-semibold text-gray-700 mb-2 block">Khối lớp hiện tại</Label>
                      <select
                        className="w-full h-12 border-2 rounded-md px-4 text-lg focus:border-indigo-400 focus:outline-none"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                      >
                        <option value="6">Lớp 6</option>
                        <option value="7">Lớp 7</option>
                        <option value="8">Lớp 8</option>
                        <option value="9">Lớp 9</option>
                        <option value="10">Lớp 10</option>
                        <option value="11">Lớp 11</option>
                        <option value="12">Lớp 12</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Course Selection */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <BookOpen className="mx-auto mb-4 text-indigo-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Chọn khóa học</h2>
                  <p className="text-gray-600">Khóa học được thiết kế theo từng cấp độ với hàng trăm kỹ năng cần thành thạo</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(courseInfo).map(([key, info]) => (
                    <div
                      key={key}
                      className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                        course === key
                          ? "border-transparent bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg"
                      }`}
                      onClick={() => setCourse(key)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold">{info.name}</h3>
                        <Badge variant={course === key ? "secondary" : "outline"} className={course === key ? "bg-white/20 text-white" : ""}>
                          {info.badge}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Chủ đề:</span>
                          <span className="font-semibold">{info.topics} chủ đề</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Kỹ năng:</span>
                          <span className="font-semibold">{info.skills} kỹ năng</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Learning Motivation */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <Target className="mx-auto mb-4 text-indigo-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Động lực học tập</h2>
                  <p className="text-gray-600">Hiểu được mục tiêu của bạn giúp hệ thống điều chỉnh nội dung và phương pháp dạy phù hợp</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {motivationOptions.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <div
                        key={option.id}
                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                          motivation === option.id
                            ? `border-transparent bg-gradient-to-br ${option.color} text-white shadow-xl`
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg"
                        }`}
                        onClick={() => setMotivation(option.id)}
                      >
                        <OptionIcon size={32} className="mb-3" />
                        <h3 className="font-bold text-lg mb-2">{option.label}</h3>
                        <p className={`text-sm ${motivation === option.id ? "text-white/90" : "text-gray-600"}`}>{option.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Phong cách học tập ưa thích</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {learningStyleOptions.map((style) => {
                      const StyleIcon = style.icon;
                      return (
                        <div
                          key={style.id}
                          className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                            learningStyle === style.id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 bg-white hover:border-indigo-300"
                          }`}
                          onClick={() => setLearningStyle(style.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <StyleIcon size={20} className="text-indigo-600" />
                            <div>
                              <div className="font-semibold">{style.label}</div>
                              <div className="text-sm text-gray-600">{style.desc}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Goals & Timeline */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <Trophy className="mx-auto mb-4 text-indigo-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Mục tiêu thành thạo</h2>
                  <p className="text-gray-600">Đặt mục tiêu cụ thể để hệ thống có thể tạo lộ trình học tập tối ưu cho bạn</p>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl">
                  <div className="space-y-8">
                    <div>
                      <Label className="text-lg font-semibold text-gray-700 mb-4 block">Mức độ thành thạo mong muốn</Label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Mức độ hiện tại</span>
                          <Badge variant="outline">Chưa đánh giá</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Mục tiêu</span>
                          <div className="flex items-center space-x-2">
                            <Slider 
                              value={[goalPercent]} 
                              min={60} 
                              max={100} 
                              step={5} 
                              onValueChange={(v) => setGoalPercent(v[0])} 
                              className="flex-1 w-48" 
                            />
                            <div className="w-16 text-xl font-bold text-indigo-600">{goalPercent}%</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {goalPercent >= 95 && "🏆 Xuất sắc - Mức độ chuyên gia"}
                          {goalPercent >= 85 && goalPercent < 95 && "⭐ Giỏi - Hiểu sâu và vững vàng"}
                          {goalPercent >= 75 && goalPercent < 85 && "👍 Khá - Nắm vững kiến thức cơ bản"}
                          {goalPercent < 75 && "📚 Cần cải thiện - Tập trung vào nền tảng"}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                          <Calendar size={18} className="mr-2" />
                          Thời hạn hoàn thành
                        </Label>
                        <Input 
                          type="date" 
                          value={goalDeadline} 
                          onChange={(e) => setGoalDeadline(e.target.value)} 
                          className="h-12 text-lg border-2 focus:border-indigo-400"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          📅 {new Date(goalDeadline).toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-700 mb-3">Dự kiến lộ trình</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Bài chẩn đoán:</span>
                            <span className="font-semibold">15-20 phút</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Học tập hàng ngày:</span>
                            <span className="font-semibold">30-45 phút</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Đánh giá tiến độ:</span>
                            <span className="font-semibold">Hàng tuần</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={step === 1}
                className="px-6 py-3 text-lg"
              >
                ← Quay lại
              </Button>

              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i + 1 <= step ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {step < totalSteps ? (
                <Button 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 text-lg font-semibold shadow-lg"
                >
                  Tiếp tục →
                </Button>
              ) : (
                <Button 
                  onClick={saveProfile} 
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-bold shadow-lg"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang khởi tạo...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles size={18} />
                      <span>Bắt đầu chẩn đoán nhận thức</span>
                    </div>
                  )}
                </Button>
              )}
            </div>

            {done && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">Hồ sơ học tập đã được tạo thành công!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">Chuyển đến bài chẩn đoán nhận thức để bắt đầu hành trình học tập...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}