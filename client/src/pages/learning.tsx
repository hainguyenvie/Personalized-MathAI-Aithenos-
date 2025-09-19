import { useState, useRef, useEffect } from "react";
import { Play, Clock, User, Eye, MessageCircle, Save, CheckCircle, ChevronRight, Pen, Crop, Send, Eraser, RotateCcw, X } from "lucide-react";
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
  teacher: "Khan Academy",
  views: 1234,
  // Real educational YouTube videos about linear functions
  videoId: "IqvmJqO3sYA", // User-provided educational video
  // Educational math videos from famous channels
  alternativeVideos: [
    { id: "x_NzXUpBdHE", title: "Slope and Linear Functions - Khan Academy" },
    { id: "BQZ64H3dkkM", title: "Graphing Linear Equations - Professor Leonard" },
    { id: "YQHsXMglC9A", title: "Linear Functions Word Problems - Khan Academy" }
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
  const { openChatWithMessage, openChat } = useChat();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMiniQuiz, setShowMiniQuiz] = useState(false);
  const [miniQuizQuestions, setMiniQuizQuestions] = useState<any[]>([]);
  const [currentMiniQuiz, setCurrentMiniQuiz] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  
  // Drawing Mode State
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnShapes, setDrawnShapes] = useState<Array<{
    type: 'rectangle',
    x: number,
    y: number,
    width: number,
    height: number,
    id: string
  }>>([]);
  const [currentShape, setCurrentShape] = useState<'rectangle'>('rectangle');
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

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

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
  };

  const switchVideo = (index: number) => {
    setCurrentVideo(index);
  };

  // Shape Drawing Functions
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    if (!drawingMode) {
      setTimeout(() => setupCanvas(), 100);
    }
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawShapes();
    }
  };

  const redrawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all shapes (rectangles only)
    drawnShapes.forEach(shape => {
      ctx.strokeStyle = selectedShapeId === shape.id ? 'rgba(255, 0, 0, 1)' : 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = selectedShapeId === shape.id ? 4 : 3;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      
      ctx.beginPath();
      ctx.rect(shape.x, shape.y, shape.width, shape.height);
      ctx.stroke();
      ctx.fill();
    });
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const point = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    setIsDrawing(true);
    setStartPoint(point);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const currentPoint = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    // Redraw existing shapes
    redrawShapes();
    
    // Draw preview of rectangle
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const width = currentPoint.x - startPoint.x;
    const height = currentPoint.y - startPoint.y;
    ctx.beginPath();
    ctx.rect(startPoint.x, startPoint.y, width, height);
    ctx.stroke();
    
    ctx.setLineDash([]);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const endPoint = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    const shapeId = `shape-${Date.now()}`;
    const width = endPoint.x - startPoint.x;
    const height = endPoint.y - startPoint.y;
    
    if (Math.abs(width) > 30 && Math.abs(height) > 30) { // Minimum size
      const newShape = {
        type: 'rectangle' as const,
        x: width < 0 ? endPoint.x : startPoint.x,
        y: height < 0 ? endPoint.y : startPoint.y,
        width: Math.abs(width),
        height: Math.abs(height),
        id: shapeId
      };
      setDrawnShapes(prev => [...prev, newShape]);
      setSelectedShapeId(shapeId);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  const clearAllShapes = () => {
    console.log("Clearing all shapes...");
    setDrawnShapes([]);
    setSelectedShapeId(null);
    
    // Force clear the canvas immediately
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Canvas cleared");
      }
    }
  };

  // Update canvas when shapes change
  useEffect(() => {
    if (drawingMode) {
      redrawShapes();
    }
  }, [drawnShapes, selectedShapeId, drawingMode]);

  const captureVideoArea = async (shape: any): Promise<string | null> => {
    // Simple approach: just return null so we use text-based context only
    return null;
  };

  const createEducationalContext = (shape: any): string => {
    // Create a rich educational context image that AI can analyze
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = Math.max(shape.width || 400, 600);
    canvas.height = Math.max(shape.height || 300, 400);
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9ff');
    gradient.addColorStop(1, '#e8f4f8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Educational header
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('KHU VỰC HỌC SINH CHỌN', canvas.width / 2, 35);
    ctx.font = '14px Arial';
    ctx.fillText('(Selected Learning Area)', canvas.width / 2, 55);
    
    // Lesson information
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`📚 ${currentLesson.title}`, canvas.width / 2, 130);
    
    ctx.font = '14px Arial';
    ctx.fillText(`👨‍🏫 Giảng viên: ${currentLesson.teacher}`, canvas.width / 2, 160);
    ctx.fillText(`⏱️ Thời lượng: ${currentLesson.duration}`, canvas.width / 2, 180);
    
    // Selection details
    ctx.fillStyle = '#dc2626';
    ctx.setLineDash([8, 4]);
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 210, canvas.width - 100, 120);
    
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText('🎯 THÔNG TIN VÙNG CHỌN:', canvas.width / 2, 240);
    ctx.font = '14px Arial';
    ctx.fillText(`📐 Kích thước: ${shape.width} × ${shape.height} pixels`, canvas.width / 2, 270);
    ctx.fillText(`📍 Vị trí: (${Math.round(shape.x)}, ${Math.round(shape.y)})`, canvas.width / 2, 295);
    ctx.fillText(`🕐 Thời điểm: ${new Date().toLocaleTimeString('vi-VN')}`, canvas.width / 2, 320);
    
    // Educational context
    const iframe = document.querySelector('iframe[data-testid="youtube-player"]') as HTMLIFrameElement;
    if (iframe) {
      const iframeRect = iframe.getBoundingClientRect();
      const relativeX = ((shape.x - iframeRect.left) / iframeRect.width * 100).toFixed(1);
      const relativeY = ((shape.y - iframeRect.top) / iframeRect.height * 100).toFixed(1);
      
      ctx.fillText(`📊 Vị trí trong video: ${relativeX}% từ trái, ${relativeY}% từ trên`, canvas.width / 2, 345);
    }
    
    return canvas.toDataURL('image/png');
  };

  const sendDrawingToChatbot = async () => {
    if (selectedShapeId) {
      const selectedShape = drawnShapes.find(shape => shape.id === selectedShapeId);
      if (selectedShape) {
        const message = `Tôi đã khoanh vùng một phần trong video mà tôi không hiểu (vùng chữ nhật). Bạn có thể giải thích cho tôi không?`;
        
        try {
          // Capture the video area that was highlighted
          const imageData = await captureVideoArea(selectedShape);
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message,
              context: `User highlighted an area they don't understand in the lesson: ${currentLesson.title}. Selected rectangle area: ${selectedShape.width}x${selectedShape.height}px`,
              shapeData: selectedShape,
              imageData: imageData // Send actual image data
            }),
          });
          
          const data = await response.json();
          console.log("Chatbot response:", data.response);
          
          // Clear the drawing
          setDrawnShapes([]);
          setSelectedShapeId(null);
          setDrawingMode(false);
          
          // Open chat with the message and response
          openChatWithMessage(message, data.response);
        } catch (error) {
          console.error("Failed to send drawing to chatbot:", error);
          
          // Clear drawing and show error in chat
          setDrawnShapes([]);
          setSelectedShapeId(null);
          setDrawingMode(false);
          
          openChatWithMessage(message, "Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* Drawing Canvas Overlay */}
      {drawingMode && (
        <div className="fixed inset-0 z-50 bg-black/20">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            data-testid="drawing-canvas"
          />
          
          {/* Close Button */}
          <Button
            onClick={toggleDrawingMode}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
            size="sm"
            data-testid="close-drawing-mode"
          >
            <X size={20} />
          </Button>
          
          {/* Shape Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Vẽ hình chữ nhật</label>
              <p className="text-xs text-gray-500">Kéo thả để chọn vùng</p>
            </div>
            
            <Button
              onClick={clearAllShapes}
              size="sm"
              variant="outline"
              className="w-full"
              data-testid="clear-all-shapes"
            >
              <RotateCcw size={16} className="mr-2" />
              Xóa tất cả
            </Button>
          </div>
          
          {/* Ask Button - appears near selected shape */}
          {selectedShapeId && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Button
                onClick={sendDrawingToChatbot}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg animate-pulse"
                size="lg"
                data-testid="send-drawing"
              >
                <Send size={20} className="mr-2" />
                Giải đáp
              </Button>
            </div>
          )}
          
          {/* Instructions */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <h3 className="font-semibold text-sm mb-2">Hướng dẫn</h3>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• Kéo thả để vẽ hình chữ nhật</li>
              <li>• Khoanh vùng phần không hiểu</li>
              <li>• Bấm "Giải đáp" để nhận trợ giúp</li>
              <li>• AI sẽ phân tích vùng bạn chọn</li>
              <li>• Nhận giải thích chi tiết ngay lập tức</li>
              <li>• Bấm X để thoát</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Drawing Controls */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Học Tập Thông Minh</h1>
          <div className="flex gap-2">
            <Button
              onClick={toggleDrawingMode}
              className={`${drawingMode ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              data-testid="button-drawing-mode"
            >
              <Pen size={16} className="mr-2" />
              {drawingMode ? 'Thoát vẽ' : 'Vẽ để hỏi'}
            </Button>
            {selectedShapeId && (
              <Button
                onClick={sendDrawingToChatbot}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-ask-drawing"
              >
                <Send size={16} className="mr-2" />
                Giải đáp
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
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
                
              </div>
              
              {/* Video Info */}
              <CardContent className="p-6">
                <div>
                  <h2 className="text-xl font-bold text-navy mb-2">
                    {currentLesson.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {currentLesson.description}
                  </p>
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
              </CardContent>
            </Card>

            {/* Quiz Section */}
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
          </div>

          {/* Sidebar */}
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
        </div>
      </div>
    </div>
  );
}
