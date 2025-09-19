import { useState } from "react";
import { Play, Clock, User, Eye, MessageCircle, Save, CheckCircle, ChevronRight, Focus, Timer, Volume2, VolumeX } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const currentLesson = {
  id: "lesson-8",
  title: "Bài 8: Đồ thị hàm số bậc nhất",
  description: "Học cách vẽ và phân tích đồ thị của hàm số bậc nhất y = ax + b",
  duration: "7:45",
  teacher: "Cô Minh Thư",
  views: 1234,
  // Real educational YouTube video about linear functions
  videoId: "dQw4w9WgXcQ", // This would be replaced with actual educational content
  // Backup videos for different topics
  alternativeVideos: [
    { id: "8pTEmbeENF4", title: "Kiến thức cơ bản về hàm số bậc nhất" },
    { id: "YQHsXMglC9A", title: "Cách vẽ đồ thị hàm số bậc nhất" },
    { id: "fJ9rUzIMcZQ", title: "Bài tập thực hành hàm số bậc nhất" }
  ]
};

const quizQuestion = {
  question: "Hàm số y = 2x + 3 có hệ số góc là bao nhiêu?",
  options: ["2", "3", "5", "1"],
  correctAnswer: "2",
  explanation: "Trong hàm số y = ax + b, hệ số góc chính là hệ số a. Với y = 2x + 3, hệ số góc là 2."
};

const lessonProgress = [
  { id: 1, title: "Khái niệm hàm số", completed: true },
  { id: 2, title: "Tính chất hàm số bậc nhất", completed: true },
  { id: 3, title: "Đồ thị hàm số bậc nhất", completed: false, current: true },
  { id: 4, title: "Ứng dụng thực tế", completed: false },
];

export default function Learning() {
  const { openChat } = useChat();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMiniQuiz, setShowMiniQuiz] = useState(false);
  const [miniQuizQuestions, setMiniQuizQuestions] = useState<any[]>([]);
  const [currentMiniQuiz, setCurrentMiniQuiz] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  
  // Focus Mode State
  const [focusMode, setFocusMode] = useState(false);
  const [focusTimer, setFocusTimer] = useState(25); // 25 minutes default
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [ambientSound, setAmbientSound] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const handleQuizSubmit = async () => {
    setShowAnswer(true);
    
    if (selectedAnswer !== quizQuestion.correctAnswer) {
      console.log("Incorrect answer - triggering Smart Reinforcement Loop");
      
      // Generate mini-quiz with similar questions
      try {
        const response = await fetch('/api/mini-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: "hàm số bậc nhất", 
            difficulty: 2 
          }),
        });
        
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setMiniQuizQuestions(data.questions);
          setShowMiniQuiz(true);
          setCurrentMiniQuiz(0);
        }
      } catch (error) {
        console.error("Failed to generate mini quiz:", error);
        setNeedsReview(true);
      }
    } else {
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      console.log("Correct answer - showing celebration");
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Focus Mode Functions
  const toggleFocusMode = () => {
    if (!focusMode) {
      setFocusStartTime(new Date());
    } else {
      setFocusStartTime(null);
    }
    setFocusMode(!focusMode);
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
  };

  const switchVideo = (index: number) => {
    setCurrentVideo(index);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${focusMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      {/* Focus Mode Overlay */}
      {focusMode && (
        <div className="fixed inset-0 bg-black/50 z-10 pointer-events-none" />
      )}
      
      <div className={`max-w-6xl mx-auto px-4 relative z-20 ${focusMode ? 'max-w-4xl' : ''}`}>
        {/* Focus Mode Controls */}
        {!focusMode && (
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Học Tập Tập Trung</h1>
            <div className="flex gap-2">
              <Button
                onClick={toggleFocusMode}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-focus-mode"
              >
                <Focus size={16} className="mr-2" />
                Chế độ tập trung
              </Button>
            </div>
          </div>
        )}

        <div className={`grid gap-8 ${focusMode ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg overflow-hidden">
              {/* Video Player */}
              <div className="relative bg-black aspect-video">
                {isPlaying ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(currentVideo === 0 ? currentLesson.videoId : currentLesson.alternativeVideos[currentVideo - 1].id)}
                    title="Video giảng dạy toán học về hàm số"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    data-testid="youtube-player"
                  />
                ) : (
                  <>
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="mb-4">
                          <svg className="w-20 h-20 mx-auto mb-4 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{currentLesson.title}</h3>
                        <p className="text-blue-200 text-sm">{currentLesson.teacher}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        onClick={handleVideoPlay}
                        className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center"
                        data-testid="video-play-button"
                      >
                        <Play className="text-navy ml-1" size={24} />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {currentLesson.duration}
                    </div>
                  </>
                )}
                
                {/* Focus Mode Timer */}
                {focusMode && focusStartTime && (
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Timer size={16} />
                      <span className="text-sm font-mono">
                        {Math.max(0, focusTimer - Math.floor((new Date().getTime() - focusStartTime.getTime()) / 60000))}:00
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Info */}
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-navy mb-2">
                      {currentLesson.title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {currentLesson.description}
                    </p>
                  </div>
                  
                  {/* Focus Mode Controls */}
                  {focusMode && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setAmbientSound(!ambientSound)}
                        variant="outline"
                        size="sm"
                        data-testid="ambient-sound-toggle"
                      >
                        {ambientSound ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </Button>
                      <Button
                        onClick={toggleFocusMode}
                        variant="outline"
                        size="sm"
                        data-testid="exit-focus-mode"
                      >
                        Thoát chế độ tập trung
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {currentLesson.duration}
                  </span>
                  <span className="flex items-center">
                    <User size={16} className="mr-1" />
                    {currentLesson.teacher}
                  </span>
                  <span className="flex items-center">
                    <Eye size={16} className="mr-1" />
                    {currentLesson.views.toLocaleString()} lượt xem
                  </span>
                </div>

                {/* Alternative Videos */}
                {!focusMode && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Video liên quan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        onClick={() => switchVideo(0)}
                        variant={currentVideo === 0 ? "default" : "outline"}
                        className="text-left h-auto p-3"
                        data-testid="video-main"
                      >
                        <div>
                          <p className="font-medium text-sm">Video chính</p>
                          <p className="text-xs text-gray-500">{currentLesson.title}</p>
                        </div>
                      </Button>
                      {currentLesson.alternativeVideos.map((video, index) => (
                        <Button
                          key={video.id}
                          onClick={() => switchVideo(index + 1)}
                          variant={currentVideo === index + 1 ? "default" : "outline"}
                          className="text-left h-auto p-3"
                          data-testid={`video-alt-${index}`}
                        >
                          <div>
                            <p className="font-medium text-sm">Video {index + 2}</p>
                            <p className="text-xs text-gray-500">{video.title}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz Section - Hidden in Focus Mode */}
            {!focusMode && (
              <Card className="shadow-lg mt-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-navy">Kiểm tra hiểu bài</h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-navy mb-4">
                    Câu 1: {quizQuestion.question}
                  </h4>
                  
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    <div className="space-y-3">
                      {quizQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors">
                          <RadioGroupItem value={option} id={`quiz-option-${index}`} className="text-teal" />
                          <Label htmlFor={`quiz-option-${index}`} className="cursor-pointer flex-1">
                            {String.fromCharCode(65 + index)}. {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  
                  <Button 
                    onClick={handleQuizSubmit}
                    className="w-full mt-4 bg-teal hover:bg-teal/90"
                    disabled={!selectedAnswer}
                  >
                    Kiểm tra đáp án
                  </Button>

                  {showAnswer && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      selectedAnswer === quizQuestion.correctAnswer 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className={`font-semibold mb-2 ${
                        selectedAnswer === quizQuestion.correctAnswer 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        {selectedAnswer === quizQuestion.correctAnswer 
                          ? '🎉 Chính xác!' 
                          : '❌ Chưa đúng'
                        }
                      </div>
                      <p className={`text-sm ${
                        selectedAnswer === quizQuestion.correctAnswer 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {quizQuestion.explanation}
                      </p>

                      {/* Smart Reinforcement Actions */}
                      {selectedAnswer !== quizQuestion.correctAnswer && (
                        <div className="mt-4 space-y-2">
                          <Button 
                            onClick={() => setShowMiniQuiz(true)}
                            className="w-full bg-teal hover:bg-teal/90"
                          >
                            Luyện tập thêm với câu hỏi tương tự
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setNeedsReview(true)}
                            className="w-full"
                          >
                            Xem lại kiến thức cốt lõi
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Celebration Animation */}
                  {showCelebration && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="bg-white rounded-xl p-8 text-center animate-bounce">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">Xuất sắc!</h3>
                        <p className="text-gray-600">Bạn đã trả lời đúng!</p>
                      </div>
                    </div>
                  )}

                  {/* Mini Quiz Modal */}
                  {showMiniQuiz && miniQuizQuestions.length > 0 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-navy">Luyện tập tăng cường</h3>
                            <Button
                              variant="ghost"
                              onClick={() => setShowMiniQuiz(false)}
                              className="p-2"
                            >
                              ✕
                            </Button>
                          </div>
                          
                          {miniQuizQuestions[currentMiniQuiz] && (
                            <div className="space-y-4">
                              <p className="font-semibold">{miniQuizQuestions[currentMiniQuiz].question}</p>
                              <div className="space-y-2">
                                {miniQuizQuestions[currentMiniQuiz].options.map((option: string, index: number) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    className="w-full text-left justify-start"
                                    onClick={() => {
                                      // Handle mini quiz answer
                                      if (currentMiniQuiz < miniQuizQuestions.length - 1) {
                                        setCurrentMiniQuiz(currentMiniQuiz + 1);
                                      } else {
                                        setShowMiniQuiz(false);
                                        setShowCelebration(true);
                                        setTimeout(() => setShowCelebration(false), 2000);
                                      }
                                    }}
                                  >
                                    {String.fromCharCode(65 + index)}. {option}
                                  </Button>
                                ))}
                              </div>
                              <p className="text-sm text-gray-600">
                                Câu {currentMiniQuiz + 1} / {miniQuizQuestions.length}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Knowledge Review Modal */}
                  {needsReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white rounded-xl max-w-2xl w-full">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-navy">Ôn tập kiến thức</h3>
                            <Button
                              variant="ghost"
                              onClick={() => setNeedsReview(false)}
                              className="p-2"
                            >
                              ✕
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            <p className="text-gray-600">
                              Có vẻ bạn đang gặp khó khăn với chủ đề này. Hãy xem lại kiến thức cốt lõi nhé!
                            </p>
                            
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2">Kiến thức cần nhớ:</h4>
                              <p className="text-blue-700 text-sm">
                                Trong hàm số y = ax + b, hệ số a được gọi là hệ số góc. 
                                Nó quyết định độ dốc của đường thẳng trên mặt phẳng tọa độ.
                              </p>
                            </div>

                            <Button 
                              onClick={() => {
                                setNeedsReview(false);
                                // Replay video or show knowledge card
                                console.log("Replaying video content");
                              }}
                              className="w-full bg-teal hover:bg-teal/90"
                            >
                              Xem lại video bài giảng
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Sidebar - Hidden in Focus Mode */}
          {!focusMode && (
            <div className="space-y-6">
            {/* Lesson Progress */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-navy mb-4">Tiến độ bài học</h3>
                <div className="space-y-3">
                  {lessonProgress.map((lesson) => (
                    <div key={lesson.id} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        lesson.completed 
                          ? 'bg-green-500' 
                          : lesson.current 
                          ? 'bg-teal' 
                          : 'bg-gray-300'
                      }`}>
                        {lesson.completed ? (
                          <CheckCircle className="text-white" size={12} />
                        ) : lesson.current ? (
                          <Play className="text-white" size={12} />
                        ) : (
                          <span className="text-gray-600 text-xs">{lesson.id}</span>
                        )}
                      </div>
                      <span className={`text-sm ${lesson.current ? 'font-semibold' : ''}`}>
                        {lesson.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-navy">Trợ lý AI</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Cần giúp đỡ với bài học? Hỏi tôi bất cứ điều gì!
                </p>
                <Button 
                  onClick={openChat}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  data-testid="button-start-chat"
                >
                  Bắt đầu chat
                </Button>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-navy mb-4">Ghi chú của bạn</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-none"
                  rows={4}
                  placeholder="Viết ghi chú cho bài học này..."
                />
                <Button 
                  className="w-full mt-3 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  variant="outline"
                >
                  <Save size={16} className="mr-2" />
                  Lưu ghi chú
                </Button>
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
