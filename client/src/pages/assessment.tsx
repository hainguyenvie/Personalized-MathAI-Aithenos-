import { useState, useEffect } from "react";
import { ClipboardCheck, ChevronLeft, ChevronRight, SkipForward, Info, Brain, Eye, Zap, Target, Award, TrendingUp, Activity, CheckCircle, AlertCircle, Clock, Sparkles, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import KnowledgeMap from "@/components/knowledge-map";

// Display names and base-knowledge for AI guidance per topic
const topicDisplayNames: { [key: string]: string } = {
  'basic-arithmetic': 'Phép tính cơ bản',
  'linear-equation': 'Phương trình bậc nhất',
  'linear-function': 'Hàm số bậc nhất',
  'quadratic-function': 'Hàm số bậc hai',
  'geometry': 'Hình học',
  'system-equations': 'Hệ phương trình'
};

const topicKnowledgeBases: { [key: string]: string } = {
  'basic-arithmetic': 'Muốn cộng/trừ/nhân/chia nhanh, hãy xếp thẳng hàng các chữ số theo hàng đơn vị, chục, trăm... và thực hiện lần lượt từ phải sang trái. Kiểm tra lại bằng phép tính ngược nếu có thể.',
  'linear-equation': 'Phương trình bậc nhất một ẩn có dạng ax + b = 0 (a ≠ 0). Quy tắc giải: Chuyển vế đổi dấu để đưa về ax = -b, sau đó chia hai vế cho a để được x = -b/a.',
  'linear-function': 'Hàm số bậc nhất có dạng y = ax + b. Hệ số góc a cho biết độ dốc của đường thẳng: a > 0 thì đồng biến, a < 0 thì nghịch biến; b là tung độ gốc (điểm cắt trục Oy).',
  'quadratic-function': 'Hàm số bậc hai y = ax² + bx + c (a ≠ 0). Đỉnh parabol có hoành độ x = -b/(2a) và tung độ y = f(x). Trục đối xứng là x = -b/(2a).',
  'geometry': 'Trong tam giác vuông, định lý Pythagoras: a² + b² = c² (c là cạnh huyền). Với tam giác, lưu ý các công thức chu vi, diện tích, và các hệ thức lượng trong tam giác vuông.',
  'system-equations': 'Giải hệ phương trình thường dùng phương pháp thế hoặc cộng đại số. Quy tắc: Quy đồng/nhân hệ số để khử một ẩn, sau đó thế ngược lại để tìm ẩn còn lại.'
};

const assessmentQuestions = [
  {
    id: 1,
    question: "Phép tính 15 + 23 có kết quả là:",
    options: ["38", "42", "35", "40"],
    correctAnswer: "38",
    explanation: "15 + 23 = 38",
    topic: "basic-arithmetic",
    difficulty: 1
  },
  {
    id: 2,
    question: "Phương trình x + 12 = 20 có nghiệm là:",
    options: ["x = 8", "x = 32", "x = 12", "x = 20"],
    correctAnswer: "x = 8",
    explanation: "x = 20 - 12 = 8",
    topic: "linear-equation",
    difficulty: 2
  },
  {
    id: 3,
    question: "Hàm số y = 2x + 1 khi x = 4 có giá trị y là:",
    options: ["9", "8", "7", "10"],
    correctAnswer: "9",
    explanation: "y = 2(4) + 1 = 8 + 1 = 9",
    topic: "linear-function",
    difficulty: 2
  },
  {
    id: 4,
    question: "Một hình chữ nhật có chiều dài 5cm và chiều rộng 3cm. Diện tích của hình chữ nhật đó là bao nhiêu?",
    options: ["15cm²", "16cm", "8cm²", "30cm²"],
    correctAnswer: "15cm²",
    explanation: "Diện tích hình chữ nhật = chiều dài × chiều rộng = 5cm × 3cm = 15cm².",
    topic: "geometry",
    difficulty: 3,
    distractors: {
      "16cm": "perimeter_instead_of_area",
      "8cm²": "add_sides_instead_of_multiply", 
      "30cm²": "double_area_error",
    }
  },
  {
    id: 5,
    question: "Phương trình 2x - 8 = 0 có nghiệm là:",
    options: ["x = 4", "x = -4", "x = 8", "x = -8"],
    correctAnswer: "x = 4",
    explanation: "2x = 8 ⟹ x = 4",
    topic: "linear-equation",
    difficulty: 2
  },
  {
    id: 6,
    question: "Hàm số nào dưới đây là hàm số bậc nhất?",
    options: ["y = x²", "y = 3x + 2", "y = 1/x", "y = x³ - 1"],
    correctAnswer: "y = 3x + 2",
    explanation: "Hàm số bậc nhất có dạng y = ax + b với a ≠ 0",
    topic: "linear-function",
    difficulty: 2
  },
  {
    id: 7,
    question: "Giải hệ phương trình: x + y = 5; x - y = 1",
    options: ["x = 3, y = 2", "x = 2, y = 3", "x = 4, y = 1", "x = 1, y = 4"],
    correctAnswer: "x = 3, y = 2",
    explanation: "Cộng hai phương trình: 2x = 6 ⟹ x = 3; thế vào: y = 2",
    topic: "system-equations",
    difficulty: 3
  }
];

// Prerequisite mapping for adaptive logic
const prereqOf: { [key: string]: string } = {
  'linear-equation': 'basic-arithmetic',
  'linear-function': 'linear-equation',
  'quadratic-function': 'linear-function',
  'system-equations': 'linear-equation',
  'geometry': 'basic-arithmetic'
};

export default function Assessment() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [knowledgeMap, setKnowledgeMap] = useState<any>({});
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [responseLogs, setResponseLogs] = useState<any[]>([]);
  
  // Remediation state
  const [remediationMode, setRemediationMode] = useState(false);
  const [remediationTopic, setRemediationTopic] = useState<string>("");
  const [remediationQuestions, setRemediationQuestions] = useState<any[]>([]);
  const [remediationIndex, setRemediationIndex] = useState(0);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [lastIncorrect, setLastIncorrect] = useState<any>(null);

  // Real-time cognitive analysis
  const [cognitiveMetrics, setCognitiveMetrics] = useState({
    responseTime: 0,
    confidence: 0,
    patternRecognition: 0,
    conceptualUnderstanding: 0
  });
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const TARGET_QUESTIONS = 12;

  useEffect(() => {
    if (started && sessionQuestions.length === 0) {
      seedFirstQuestion();
    }
  }, [started]);

  useEffect(() => {
    if (started && !remediationMode) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, started, remediationMode]);

  const seedFirstQuestion = async () => {
    try {
      const res = await fetch('/api/questions/math?count=1&difficulty=2');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize the question format
          const normalized = {
            ...data[0],
            options: Array.isArray(data[0].options) ? data[0].options : JSON.parse(data[0].options || '[]'),
            misconceptions: data[0].misconceptions ? JSON.parse(data[0].misconceptions) : []
          };
          setSessionQuestions([normalized]);
          console.log('Loaded first question from API:', normalized.question);
        } else {
          setSessionQuestions([assessmentQuestions[0]]);
          console.log('Using fallback first question');
        }
      } else {
        setSessionQuestions([assessmentQuestions[0]]);
        console.log('API failed, using fallback');
      }
    } catch (error) {
      console.error('Error loading first question:', error);
      setSessionQuestions([assessmentQuestions[0]]);
    }
  };

  const calculateCognitiveMetrics = (responseTime: number, isCorrect: boolean, questionDifficulty: number) => {
    const timeScore = Math.max(0, 100 - (responseTime / 1000) * 2); // Faster = higher score
    const confidenceScore = isCorrect ? Math.min(100, timeScore + 20) : Math.max(0, timeScore - 30);
    const patternScore = isCorrect ? Math.min(100, (questionDifficulty * 20) + timeScore) : Math.max(0, timeScore - 20);
    const conceptualScore = isCorrect ? Math.min(100, questionDifficulty * 25) : Math.max(0, questionDifficulty * 10);

    return {
      responseTime: Math.round(responseTime),
      confidence: Math.round(confidenceScore),
      patternRecognition: Math.round(patternScore),
      conceptualUnderstanding: Math.round(conceptualScore)
    };
  };

  const handleNext = async () => {
    if (!selectedAnswer) return;

    const responseTime = Date.now() - questionStartTime;
    const current = remediationMode ? remediationQuestions[remediationIndex] : sessionQuestions[currentQuestion];
    const wasCorrect = selectedAnswer === current.correctAnswer;
    
    // Calculate cognitive metrics
    const metrics = calculateCognitiveMetrics(responseTime, wasCorrect, current.difficulty || 2);
    setCognitiveMetrics(metrics);

    if (remediationMode) {
      handleRemediationNext(wasCorrect);
      return;
    }

    // Log detailed response data with enhanced misconception detection
    let misconceptionTag = null;
    if (!wasCorrect && current.misconceptions) {
      const matchedMisconception = current.misconceptions.find((m: any) => m.distractor === selectedAnswer);
      if (matchedMisconception) {
        misconceptionTag = matchedMisconception.id;
      }
    }
    
    const currentResponse = {
      questionId: current.id,
      topic: current.topic,
      difficulty: current.difficulty,
      selectedOption: selectedAnswer,
      correctAnswer: current.correctAnswer,
      isCorrect: wasCorrect,
      misconceptionTag,
      responseTime,
      cognitiveMetrics: metrics,
      timestamp: new Date().toISOString(),
    };
    setResponseLogs(prevLogs => [...prevLogs, currentResponse]);

    const newResponse = {
      question: current.question,
      selectedAnswer,
      correctAnswer: current.correctAnswer,
      isCorrect: wasCorrect,
      topic: current.topic,
      explanation: current.explanation
    };
    setResponses(prev => [...prev, newResponse]);

    if (currentQuestion + 1 >= TARGET_QUESTIONS) {
      completeAssessment();
      return;
    }

    // Adaptive logic with misconception awareness
    let nextTopic = current.topic;
    if (!wasCorrect && misconceptionTag) {
      nextTopic = current.topic; // Stay on topic to probe misconception
    } else if (!wasCorrect && prereqOf[current.topic]) {
      nextTopic = prereqOf[current.topic] as string;
    }

    let nextDifficulty = current.difficulty || 2;
    nextDifficulty = Math.max(1, Math.min(5, nextDifficulty + (wasCorrect ? 1 : -1)));

    try {
      const res = await fetch(`/api/questions/math?topic=${nextTopic}&count=1&difficulty=${nextDifficulty}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize the question format
          const normalized = {
            ...data[0],
            options: Array.isArray(data[0].options) ? data[0].options : JSON.parse(data[0].options || '[]'),
            misconceptions: data[0].misconceptions ? JSON.parse(data[0].misconceptions) : []
          };
          setSessionQuestions(prev => [...prev, normalized]);
          console.log('Loaded next question from API:', normalized.question);
        } else {
          const fallback = assessmentQuestions.find(q => q.topic === nextTopic) || assessmentQuestions[Math.min(currentQuestion + 1, assessmentQuestions.length - 1)];
          setSessionQuestions(prev => [...prev, fallback]);
          console.log('Using fallback question for topic:', nextTopic);
        }
      } else {
        const fallback = assessmentQuestions[Math.min(currentQuestion + 1, assessmentQuestions.length - 1)];
        setSessionQuestions(prev => [...prev, fallback]);
        console.log('API failed, using fallback');
      }
    } catch (error) {
      console.error('Error loading next question:', error);
      const fallback = assessmentQuestions[Math.min(currentQuestion + 1, assessmentQuestions.length - 1)];
      setSessionQuestions(prev => [...prev, fallback]);
    }

    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer("");
  };

  const generateKnowledgeMap = () => {
    const topicScores: { [key: string]: { correct: number; total: number } } = {};
    
    // Ensure we have responses to analyze
    if (responses.length === 0) {
      console.warn("No responses available for knowledge map generation");
      return {};
    }
    
    responses.forEach(response => {
      if (!topicScores[response.topic]) {
        topicScores[response.topic] = { correct: 0, total: 0 };
      }
      topicScores[response.topic].total++;
      if (response.isCorrect) {
        topicScores[response.topic].correct++;
      }
    });

    const map: { [key: string]: { score: number; level: string; needsWork: boolean } } = {};
    
    Object.entries(topicScores).forEach(([topic, stats]) => {
      const score = Math.round((stats.correct / stats.total) * 100);
      let level = "Cần ôn tập";
      if (score >= 80) level = "Thành thạo";
      else if (score >= 60) level = "Khá";
      else if (score >= 40) level = "Trung bình";
      
      map[topic] = {
        score,
        level,
        needsWork: score < 70
      };
    });
    
    console.log("Generated knowledge map:", map);
    setKnowledgeMap(map);
    return map;
  };

  const completeAssessment = () => {
    const map = generateKnowledgeMap();
    setShowResults(true);
  };

  const handleRemediationNext = (wasCorrect: boolean) => {
    if (remediationIndex + 1 >= remediationQuestions.length) {
      finishRemediation();
      return;
    }
    setRemediationIndex(prev => prev + 1);
    setSelectedAnswer("");
  };

  const startRemediationForTopic = async (topic: string) => {
    console.log('Starting remediation for topic:', topic);
    setRemediationMode(true);
    setRemediationTopic(topic);
    setRemediationIndex(0);
    setSelectedAnswer(""); // Clear any previous answer
    setShowResults(false); // Hide results section
    
    // Automatically open AI tutor with context-aware welcome message
    setTutorOpen(true);
    
    // Generate intelligent welcome message based on test analytics
    const topicErrors = responseLogs.filter(log => log.topic === topic && log.misconceptionTag);
    const errorCounts: { [key: string]: number } = {};
    topicErrors.forEach(log => {
      if (log.misconceptionTag) {
        errorCounts[log.misconceptionTag] = (errorCounts[log.misconceptionTag] || 0) + 1;
      }
    });
    const topError = Object.entries(errorCounts).sort(([,a], [,b]) => b - a)[0];
    const avgTime = topicErrors.length > 0 
      ? topicErrors.reduce((sum, log) => sum + (log.responseTime || 0), 0) / topicErrors.length / 1000
      : 0;
    
    let intelligentWelcome = `Chào bạn! 👋 Tôi đã phân tích kết quả kiểm tra của bạn và thấy bạn cần cải thiện ở chủ đề **${topicDisplayNames[topic]}**.

📊 **Phân tích từ bài kiểm tra:**`;
    
    if (topError) {
      intelligentWelcome += `\n• Lỗi chính: Bạn đã mắc lỗi "${topError[0]}" ${topError[1]} lần`;
    }
    
    if (avgTime > 0) {
      intelligentWelcome += `\n• Thời gian phản ứng: Trung bình ${avgTime.toFixed(1)}s (${avgTime > 5 ? 'hơi chậm' : 'bình thường'})`;
    }
    
    intelligentWelcome += `

🎯 **Kế hoạch học tập:**
1. Đọc kỹ kiến thức cơ bản bên phải
2. Thử giải bài tập bên trái
3. Thảo luận với tôi nếu gặp khó khăn

Hãy bắt đầu bằng việc đọc phần "Kiến thức cơ bản" bên phải, sau đó thử giải câu hỏi đầu tiên nhé! 💪`;

    setTutorMessages([
      {
        role: "system",
        content: "Bạn là trợ lý AI Socratic thông minh. Hãy hướng dẫn học sinh khám phá ra lỗi của mình thay vì đưa ra đáp án trực tiếp."
      },
      {
        role: "assistant", 
        content: intelligentWelcome
      }
    ]);
    
    try {
      const res = await fetch(`/api/questions/math?topic=${topic}&count=3&difficulty=2`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize questions from API
          const normalized = data.map((q: any) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
            misconceptions: q.misconceptions ? JSON.parse(q.misconceptions) : []
          }));
          setRemediationQuestions(normalized);
          console.log('Loaded remediation questions from API:', normalized.length);
        } else {
          const fallbacks = assessmentQuestions.filter(q => q.topic === topic).slice(0, 3);
          setRemediationQuestions(fallbacks);
          console.log('Using fallback remediation questions for topic:', topic);
        }
      } else {
        const fallbacks = assessmentQuestions.filter(q => q.topic === topic).slice(0, 3);
        setRemediationQuestions(fallbacks);
      }
    } catch (error) {
      console.error('Error loading remediation questions:', error);
      const fallbacks = assessmentQuestions.filter(q => q.topic === topic).slice(0, 3);
      setRemediationQuestions(fallbacks);
    }
  };

  const finishRemediation = () => {
    const remediationScore = responses.filter(r => r.topic === remediationTopic && r.isCorrect).length;
    const totalRemediation = responses.filter(r => r.topic === remediationTopic).length;
    const percentage = totalRemediation > 0 ? (remediationScore / totalRemediation) * 100 : 0;
    
    if (percentage < 80) {
      openTutorWithContext(remediationTopic);
    } else {
      setRemediationMode(false);
      setShowResults(true);
    }
  };

  const openTutorWithContext = (topic: string) => {
    setTutorOpen(true);
    const baseKnowledge = topicKnowledgeBases[topic] || "";
    const lastIncorrectQ = responses.filter(r => r.topic === topic && !r.isCorrect).pop();
    setLastIncorrect(lastIncorrectQ);
    
    const recentLogs = responseLogs.slice(-3);
    const context = `
Topic: ${topicDisplayNames[topic]}
Base Knowledge: ${baseKnowledge}
Last Incorrect: ${lastIncorrectQ ? `Q: ${lastIncorrectQ.question}, Selected: ${lastIncorrectQ.selectedAnswer}, Correct: ${lastIncorrectQ.correctAnswer}` : 'None'}
Recent Response Log Summary: ${recentLogs.map(log => `${log.topic}:${log.isCorrect ? 'correct' : 'incorrect'}${log.misconceptionTag ? `:${log.misconceptionTag}` : ''}`).join(', ')}
    `.trim();
    
    setTutorMessages([
      {
        role: "system",
        content: "Bạn là trợ lý AI Socratic thông minh. Hãy hướng dẫn học sinh khám phá ra lỗi của mình thay vì đưa ra đáp án trực tiếp."
      },
      {
        role: "assistant", 
        content: `Chào bạn! Tôi thấy bạn đang gặp khó khăn với chủ đề ${topicDisplayNames[topic]}. Hãy kể cho tôi nghe về cách bạn tiếp cận bài toán vừa rồi nhé. Bạn đã nghĩ gì khi làm bài?`
      }
    ]);
  };

  const sendTutorMessage = async () => {
    if (!tutorInput.trim()) return;
    
    setTutorLoading(true);
    const userMessage = { role: "user", content: tutorInput };
    setTutorMessages(prev => [...prev, userMessage]);
    
    try {
      const baseKnowledge = topicKnowledgeBases[remediationTopic] || "";
      const context = `
Topic: ${topicDisplayNames[remediationTopic]}
Base Knowledge: ${baseKnowledge}
Last Incorrect: ${lastIncorrect ? `Q: ${lastIncorrect.question}, Selected: ${lastIncorrect.selectedAnswer}, Correct: ${lastIncorrect.correctAnswer}` : 'None'}
      `.trim();

      // Prepare error patterns for enhanced AI context
      const errorPatterns = responseLogs
        .filter(log => !log.isCorrect && log.misconceptionTag)
        .slice(-3) // Get last 3 errors
        .map(log => ({
          misconceptionId: log.misconceptionTag,
          question: sessionQuestions.find(q => q.id === log.questionId)?.question || '',
          chosen: log.selectedOption,
          correct: log.correctAnswer
        }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: tutorInput,
          context,
          errorPatterns
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTutorMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      setTutorMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Tôi hiểu bạn đang gặp khó khăn. Hãy thử chia nhỏ bài toán và giải từng bước một cách cẩn thận nhé." 
      }]);
    }
    
    setTutorInput("");
    setTutorLoading(false);
  };

  const saveAssessmentResults = async () => {
    setSaving(true);
    try {
      // Ensure we have data to save
      if (responses.length === 0) {
        alert("Không có dữ liệu để lưu. Vui lòng hoàn thành bài đánh giá trước.");
        setSaving(false);
        return;
      }

      console.log("Saving assessment with data:", {
        responses: responses.length,
        knowledgeMap: Object.keys(knowledgeMap).length,
        responseLogs: responseLogs.length
      });

      const assessmentData = {
        userId: "sample-user-1",
        subject: "math",
        score: Math.round(responses.filter(r => r.isCorrect).length / responses.length * 100),
        totalQuestions: responses.length,
        knowledgeMap: JSON.stringify(knowledgeMap),
        responses: JSON.stringify(responseLogs)
      };

      const assessmentResponse = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (!assessmentResponse.ok) {
        throw new Error(`Assessment save failed: ${assessmentResponse.status}`);
      }

      console.log("Assessment saved successfully");

      // Auto-generate learning path
      const weakTopics = Object.entries(knowledgeMap)
        .filter(([topic, data]: any) => data.needsWork)
        .map(([topic]) => topic);

      if (weakTopics.length > 0) {
        console.log("Creating learning path for weak topics:", weakTopics);
        
        const learningPathData = {
          userId: "sample-user-1",
          subject: "math",
          duration: Math.max(1, Math.ceil(weakTopics.length / 2)), // Estimate duration in months
          title: `Lộ trình cải thiện ${weakTopics.map(t => topicDisplayNames[t] || t).join(', ')}`,
          topics: JSON.stringify(weakTopics),
          priority: "foundational-gaps",
          estimatedDuration: `${Math.max(2, weakTopics.length)} tuần`,
          status: "active"
        };

        const learningPathResponse = await fetch('/api/learning-paths', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(learningPathData)
        });

        if (!learningPathResponse.ok) {
          throw new Error(`Learning path creation failed: ${learningPathResponse.status}`);
        }

        console.log("Learning path created successfully");
      }

      // Show success message and redirect to roadmap
      alert("🎉 Kết quả đã được lưu thành công! Đang chuyển đến lộ trình học tập...");
      
      // Redirect to the learning roadmap page
      setTimeout(() => {
        window.location.href = '/learning-roadmap';
      }, 1500);
      
    } catch (error) {
      console.error("Failed to save assessment:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("❌ Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại. Lỗi: " + errorMessage);
    }
    setSaving(false);
  };

  const question = remediationMode ? remediationQuestions[remediationIndex] : sessionQuestions[currentQuestion];
  const progress = remediationMode 
    ? ((remediationIndex + 1) / remediationQuestions.length) * 100
    : ((currentQuestion + 1) / TARGET_QUESTIONS) * 100;

  if (!started) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <Brain size={48} />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Chẩn đoán Nhận thức Toán học
              </h1>
              <div className="flex justify-center space-x-4 mb-6">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Zap size={14} className="mr-1" />
                  Thích ứng theo câu trả lời
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Eye size={14} className="mr-1" />
                  Phát hiện lỗ hổng & ngộ nhận
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Target size={14} className="mr-1" />
                  Lộ trình cá nhân hóa
                </Badge>
              </div>
            </div>

          <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <h3 className="font-bold text-indigo-900 mb-3 flex items-center">
                      <Activity size={20} className="mr-2" />
                      Quy trình chẩn đoán
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span>Bắt đầu với câu hỏi cơ bản</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span>Điều chỉnh độ khó theo từng câu trả lời</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span>Phân tích ngộ nhận và lỗ hổng kiến thức</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <span>Tạo bản đồ tri thức cá nhân</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                    <h3 className="font-bold text-emerald-900 mb-3 flex items-center">
                      <Award size={20} className="mr-2" />
                      Phân tích đa chiều
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-emerald-200">
                        <div className="font-semibold text-emerald-700">Thời gian phản ứng</div>
                        <div className="text-gray-600">Tốc độ xử lý thông tin</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200">
                        <div className="font-semibold text-emerald-700">Mức độ tự tin</div>
                        <div className="text-gray-600">Đánh giá độ chắc chắn</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200">
                        <div className="font-semibold text-emerald-700">Nhận dạng mẫu</div>
                        <div className="text-gray-600">Khả năng tìm quy luật</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200">
                        <div className="font-semibold text-emerald-700">Hiểu khái niệm</div>
                        <div className="text-gray-600">Độ sâu nắm bắt ý tưởng</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                    <h3 className="font-bold text-purple-900 mb-3 flex items-center">
                      <TrendingUp size={20} className="mr-2" />
                      Đặc điểm nổi bật
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CheckCircle size={16} className="text-green-600 mr-2" />
                        <span>Thích ứng theo thời gian thực</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle size={16} className="text-green-600 mr-2" />
                        <span>AI Tutor hỗ trợ Socratic</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle size={16} className="text-green-600 mr-2" />
                        <span>Bản đồ tri thức trực quan</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle size={16} className="text-green-600 mr-2" />
                        <span>Phân tích ngộ nhận sâu</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle size={16} className="text-green-600 mr-2" />
                        <span>Lộ trình học tập cá nhân</span>
                      </div>
              </div>
            </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
                    <h3 className="font-bold text-orange-900 mb-3 flex items-center">
                      <Clock size={20} className="mr-2" />
                      Thông tin test
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Số câu hỏi:</span>
                        <span className="font-semibold">{TARGET_QUESTIONS} câu</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời gian dự kiến:</span>
                        <span className="font-semibold">15-20 phút</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Điều chỉnh độ khó:</span>
                        <span className="font-semibold">Tự động</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phân tích:</span>
                        <span className="font-semibold">Thời gian thực</span>
                      </div>
              </div>
            </div>

                  <Button 
                    onClick={() => setStarted(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 text-lg font-bold shadow-lg"
                  >
                    <Sparkles size={20} className="mr-2" />
                    Bắt đầu chẩn đoán nhận thức
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
              <div className="text-center">
                <Award size={48} className="mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Kết quả Chẩn đoán Nhận thức</h1>
                <p className="text-lg opacity-90">Phân tích hoàn tất • Bản đồ tri thức đã được tạo</p>
              </div>
                </div>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center">
                      <Activity size={20} className="mr-2" />
                      Phân tích nhận thức chi tiết
                  </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="text-2xl font-bold text-indigo-600">{cognitiveMetrics.responseTime}ms</div>
                        <div className="text-sm text-gray-600">Thời gian phản ứng trung bình</div>
                        <div className="mt-2">
                          <Progress value={Math.max(0, 100 - cognitiveMetrics.responseTime / 100)} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="text-2xl font-bold text-green-600">{cognitiveMetrics.confidence}%</div>
                        <div className="text-sm text-gray-600">Mức độ tự tin</div>
                        <div className="mt-2">
                          <Progress value={cognitiveMetrics.confidence} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="text-2xl font-bold text-purple-600">{cognitiveMetrics.patternRecognition}%</div>
                        <div className="text-sm text-gray-600">Nhận dạng mẫu</div>
                        <div className="mt-2">
                          <Progress value={cognitiveMetrics.patternRecognition} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="text-2xl font-bold text-orange-600">{cognitiveMetrics.conceptualUnderstanding}%</div>
                        <div className="text-sm text-gray-600">Hiểu khái niệm</div>
                        <div className="mt-2">
                          <Progress value={cognitiveMetrics.conceptualUnderstanding} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                    <h3 className="font-bold text-emerald-900 mb-4">Ngộ nhận được phát hiện</h3>
{(() => {
                      const misconceptions = responseLogs
                        .filter(log => log.misconceptionTag)
                        .reduce((acc, log) => {
                          acc[log.misconceptionTag] = (acc[log.misconceptionTag] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                      
                      const misconceptionNames: Record<string, string> = {
                        "perimeter_instead_of_area": "Nhầm chu vi với diện tích",
                        "add_sides_instead_of_multiply": "Cộng thay vì nhân",
                        "double_area_error": "Nhân đôi diện tích",
                        "sign_error_transposition": "Sai dấu khi chuyển vế"
                      };

                      return Object.entries(misconceptions).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(misconceptions).map(([tag, count]) => (
                            <div key={tag} className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200">
                              <span className="text-sm font-medium">{misconceptionNames[tag] || tag}</span>
                              <Badge variant="outline" className="bg-red-50 text-red-700">×{count as number}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-600 text-sm">Không phát hiện ngộ nhận đặc thù.</div>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-6">
                  <KnowledgeMap knowledgeMap={knowledgeMap} />
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                    <h3 className="font-bold text-purple-900 mb-4">Chủ đề cần cải thiện</h3>
                    <div className="space-y-3">
                      {Object.entries(knowledgeMap).filter(([topic, data]: any) => data.needsWork).map(([topic, data]: any) => (
                        <div key={topic} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                          <div>
                            <div className="font-medium">{topicDisplayNames[topic]}</div>
                            <div className="text-sm text-gray-600">{data.level} • {data.score}%</div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => startRemediationForTopic(topic)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Ôn tập
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={saveAssessmentResults} 
                      disabled={saving}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 font-semibold"
                    >
                      {saving ? "Đang lưu..." : "Lưu kết quả & Tạo lộ trình học tập"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/learning'}
                      className="py-3"
                    >
                      Tiếp tục với lộ trình cá nhân hóa
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi tiếp theo...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header với progress và metrics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                {remediationMode ? `Ôn tập: ${topicDisplayNames[remediationTopic]}` : 'Chẩn đoán nhận thức'}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                Câu {remediationMode ? remediationIndex + 1 : currentQuestion + 1}/{remediationMode ? remediationQuestions.length : TARGET_QUESTIONS}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-500" />
                <span>{Math.round((Date.now() - questionStartTime) / 1000)}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-green-500" />
                <span>Độ tin: {cognitiveMetrics.confidence}%</span>
                </div>
              </div>
            </div>

          <Progress value={progress} className="h-3 bg-gray-200" />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{Math.round(progress)}% hoàn thành</span>
            <span>Chủ đề: {topicDisplayNames[question.topic] || question.topic}</span>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                     <CardHeader className={`${remediationMode 
             ? 'bg-gradient-to-r from-orange-500 to-red-600' 
             : 'bg-gradient-to-r from-indigo-500 to-blue-600'
           } text-white`}>
             <CardTitle className="text-xl font-bold flex items-center justify-between">
               <div className="flex items-center">
                 <Brain size={24} className="mr-2" />
                 {remediationMode ? 'Bài tập ôn tập - Cải thiện kiến thức' : 'Phân tích nhận thức'}
               </div>
               {remediationMode && (
                 <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                   AI Hướng dẫn
                 </Badge>
               )}
             </CardTitle>
             {remediationMode && (
               <div className="text-sm text-orange-100 mt-1">
                 🎯 Tập trung vào: {topicDisplayNames[remediationTopic]} • Có AI Tutor hỗ trợ
               </div>
             )}
           </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{question.question}</h3>
                  {question.difficulty && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      Độ khó: {question.difficulty}/5
                    </Badge>
                  )}
                </div>
                
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
                  {question.options?.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Real-time cognitive feedback */}
              {selectedAnswer && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
                    <Zap size={16} className="mr-2" />
                    Phân tích thời gian thực
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                      <div className="font-bold text-emerald-600">{Math.round((Date.now() - questionStartTime) / 1000)}s</div>
                      <div className="text-gray-600 text-xs">Thời gian</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                      <div className="font-bold text-blue-600">Trung bình</div>
                      <div className="text-gray-600 text-xs">Tốc độ</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                      <div className="font-bold text-purple-600">Đang xử lý</div>
                      <div className="text-gray-600 text-xs">Độ tin</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                      <div className="font-bold text-orange-600">Cấp {question.difficulty || 2}</div>
                      <div className="text-gray-600 text-xs">Độ khó</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
              <Button
                variant="outline"
                  disabled={currentQuestion === 0 && !remediationMode}
                  className="px-6"
              >
                <ChevronLeft size={16} className="mr-1" />
                Câu trước
              </Button>

              <div className="flex space-x-3">
                  {!remediationMode && (
                <Button
                  variant="outline"
                      onClick={() => {
                        setSelectedAnswer(question.correctAnswer);
                        setTimeout(handleNext, 100);
                      }}
                      disabled={!question}
                      className="px-4"
                >
                  <SkipForward size={16} className="mr-1" />
                  Bỏ qua
                </Button>
                  )}
                  
                <Button
                  onClick={handleNext}
                    disabled={!selectedAnswer}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6"
                >
                    Tiếp tục
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

                 {/* Enhanced AI Tutor for Remediation */}
         {(tutorOpen || remediationMode) && (
           <div className="grid lg:grid-cols-2 gap-6 mt-6">
             {/* AI Tutor Chat */}
             <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
               <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                 <CardTitle className="text-lg font-bold flex items-center justify-between">
                   <div className="flex items-center">
                     <Sparkles size={20} className="mr-2" />
                     AI Tutor - Hướng dẫn Thích ứng
                   </div>
                   {!remediationMode && (
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setTutorOpen(false)}
                       className="text-white hover:bg-white/20"
                     >
                       ✕
                     </Button>
                   )}
                 </CardTitle>
                 <div className="text-sm text-purple-100 mt-2">
                   💡 Dựa trên phân tích kết quả kiểm tra của bạn
                 </div>
               </CardHeader>
               
               <CardContent className="p-6">
                 {remediationMode && (
                   <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                     <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                       <Brain size={16} className="mr-2" />
                       Phân tích từ bài kiểm tra
                     </h4>
                     <div className="text-sm text-blue-800 space-y-1">
                       <div>• Chủ đề yếu: <strong>{topicDisplayNames[remediationTopic] || remediationTopic}</strong></div>
                       <div>• Lỗi phổ biến: {(() => {
                         const topicErrors = responseLogs.filter(log => log.topic === remediationTopic && log.misconceptionTag);
                         const errorCounts: { [key: string]: number } = {};
                         topicErrors.forEach(log => {
                           if (log.misconceptionTag) {
                             errorCounts[log.misconceptionTag] = (errorCounts[log.misconceptionTag] || 0) + 1;
                           }
                         });
                         const topError = Object.entries(errorCounts).sort(([,a], [,b]) => b - a)[0];
                         return topError ? `${topError[1]} lần mắc lỗi ${topError[0]}` : 'Chưa xác định';
                       })()}</div>
                       <div>• Thời gian phản ứng TB: {(() => {
                         const topicLogs = responseLogs.filter(log => log.topic === remediationTopic);
                         const avgTime = topicLogs.length > 0 
                           ? topicLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / topicLogs.length / 1000
                           : 0;
                         return `${avgTime.toFixed(1)}s`;
                       })()}</div>
                     </div>
                   </div>
                 )}

                 <div className="space-y-4 max-h-60 overflow-y-auto">
                   {tutorMessages.filter(msg => msg.role !== 'system').map((msg, idx) => (
                     <div 
                       key={idx} 
                       className={`p-3 rounded-lg ${
                         msg.role === 'user' 
                           ? 'bg-blue-50 border-l-4 border-blue-500 ml-8' 
                           : 'bg-purple-50 border-l-4 border-purple-500 mr-8'
                       }`}
                     >
                       <div className="text-sm font-semibold mb-1">
                         {msg.role === 'user' ? '🧑‍🎓 Bạn' : '🤖 AI Tutor'}
                       </div>
                       <div className="text-gray-700">{msg.content}</div>
                     </div>
                   ))}
                   
                   {remediationMode && tutorMessages.filter(msg => msg.role !== 'system').length === 0 && (
                     <div className="bg-purple-50 border-l-4 border-purple-500 mr-8 p-3 rounded-lg">
                       <div className="text-sm font-semibold mb-1">🤖 AI Tutor</div>
                       <div className="text-gray-700">
                         Chào bạn! Tôi đã phân tích kết quả kiểm tra của bạn và thấy bạn cần cải thiện ở chủ đề <strong>{topicDisplayNames[remediationTopic]}</strong>. 
                         Hãy đọc kỹ kiến thức cơ bản bên phải, sau đó thử giải bài tập. Tôi sẽ hướng dẫn bạn từng bước! 💪
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <div className="flex space-x-2 mt-4">
                   <Input 
                     value={tutorInput}
                     onChange={(e) => setTutorInput(e.target.value)}
                     placeholder="Chia sẻ suy nghĩ của bạn hoặc hỏi thắc mắc..."
                     onKeyPress={(e) => e.key === 'Enter' && sendTutorMessage()}
                     className="flex-1"
                   />
                   <Button 
                     onClick={sendTutorMessage} 
                     disabled={tutorLoading || !tutorInput.trim()}
                     className="bg-purple-600 hover:bg-purple-700"
                   >
                     {tutorLoading ? '...' : 'Gửi'}
                   </Button>
                 </div>
               </CardContent>
             </Card>

             {/* Base Knowledge Panel */}
             <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
               <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                 <CardTitle className="text-lg font-bold flex items-center">
                   <BookOpen size={20} className="mr-2" />
                   Kiến thức cơ bản - {topicDisplayNames[remediationTopic] || remediationTopic}
                 </CardTitle>
                 <div className="text-sm text-emerald-100 mt-2">
                   📚 Ôn tập kiến thức nền tảng trước khi làm bài
                 </div>
               </CardHeader>
               
               <CardContent className="p-6">
                 {(() => {
                   const getTopicKnowledge = (topic: string) => {
                     const knowledgeBase: { [key: string]: any } = {
                       'basic-arithmetic': {
                         title: 'Phép tính cơ bản',
                         concepts: [
                           {
                             name: 'Thứ tự thực hiện phép tính',
                             content: 'Nhớ quy tắc: Ngoặc → Lũy thừa → Nhân/Chia → Cộng/Trừ (từ trái sang phải)',
                             example: 'Ví dụ: 2 + 3 × 4 = 2 + 12 = 14 (không phải 20)'
                           },
                           {
                             name: 'Tính chất giao hoán',
                             content: 'a + b = b + a và a × b = b × a',
                             example: 'Ví dụ: 5 + 3 = 3 + 5 = 8'
                           },
                           {
                             name: 'Kiểm tra kết quả',
                             content: 'Luôn kiểm tra bằng phép tính ngược lại',
                             example: 'Cộng thì kiểm tra bằng trừ: 15 + 23 = 38 → 38 - 23 = 15 ✓'
                           }
                         ],
                         tips: [
                           'Tính từ từ, không vội vàng',
                           'Viết rõ ràng từng bước',
                           'Kiểm tra lại kết quả cuối'
                         ]
                       },
                       'fractions': {
                         title: 'Phân số',
                         concepts: [
                           {
                             name: 'Ý nghĩa phân số',
                             content: 'Phân số a/b biểu thị a phần của tổng thể được chia thành b phần bằng nhau',
                             example: 'Ví dụ: 3/4 có nghĩa là lấy 3 phần trong tổng số 4 phần bằng nhau'
                           },
                           {
                             name: 'Quy đồng mẫu số',
                             content: 'Để cộng/trừ phân số, phải đưa về cùng mẫu số',
                             example: 'Ví dụ: 1/4 + 1/6 = 3/12 + 2/12 = 5/12'
                           },
                           {
                             name: 'Rút gọn phân số',
                             content: 'Chia cả tử và mẫu cho ước chung lớn nhất',
                             example: 'Ví dụ: 6/8 = 3/4 (chia cả tử và mẫu cho 2)'
                           }
                         ],
                         tips: [
                           'Tìm mẫu chung nhỏ nhất khi cộng/trừ',
                           'Luôn rút gọn kết quả cuối',
                           'Hình dung phân số bằng hình tròn hoặc thanh'
                         ]
                       },
                       'geometry': {
                         title: 'Hình học',
                         concepts: [
                           {
                             name: 'Chu vi vs Diện tích',
                             content: 'Chu vi = tổng độ dài các cạnh (đơn vị: cm, m). Diện tích = bề mặt bên trong (đơn vị: cm², m²)',
                             example: 'Hình chữ nhật 5×3: Chu vi = 2×(5+3) = 16cm, Diện tích = 5×3 = 15cm²'
                           },
                           {
                             name: 'Định lý Pythagoras',
                             content: 'Trong tam giác vuông: a² + b² = c² (c là cạnh huyền)',
                             example: 'Tam giác vuông cạnh 3, 4: c² = 3² + 4² = 9 + 16 = 25 → c = 5'
                           },
                           {
                             name: 'Công thức diện tích',
                             content: 'Hình chữ nhật: S = dài × rộng. Tam giác: S = (đáy × cao)/2. Hình tròn: S = π × r²',
                             example: 'Hình tròn bán kính 3: S = 3.14 × 3² = 3.14 × 9 = 28.26'
                           }
                         ],
                         tips: [
                           'Vẽ hình để dễ hình dung',
                           'Chú ý đơn vị đo (cm, cm², m, m²)',
                           'Kiểm tra kết quả có hợp lý không'
                         ]
                       },
                       'linear-equation': {
                         title: 'Phương trình bậc nhất',
                         concepts: [
                           {
                             name: 'Quy tắc chuyển vế',
                             content: 'Chuyển vế phải đổi dấu: + thành -, - thành +',
                             example: 'x + 5 = 8 → x = 8 - 5 → x = 3'
                           },
                           {
                             name: 'Mục tiêu giải phương trình',
                             content: 'Đưa tất cả ẩn số về một vế, số về vế kia',
                             example: '2x + 3 = 7 → 2x = 7 - 3 → 2x = 4 → x = 2'
                           },
                           {
                             name: 'Kiểm tra nghiệm',
                             content: 'Thế nghiệm vào phương trình gốc để kiểm tra',
                             example: 'x = 2: 2(2) + 3 = 4 + 3 = 7 ✓'
                           }
                         ],
                         tips: [
                           'Luôn nhớ đổi dấu khi chuyển vế',
                           'Thực hiện từng bước một cách rõ ràng',
                           'Kiểm tra nghiệm bằng cách thế ngược lại'
                         ]
                       },
                       'quadratic-equation': {
                         title: 'Phương trình bậc hai',
                         concepts: [
                           {
                             name: 'Dạng tổng quát',
                             content: 'ax² + bx + c = 0 với a ≠ 0',
                             example: 'Ví dụ: 2x² - 5x + 3 = 0 (a=2, b=-5, c=3)'
                           },
                           {
                             name: 'Biệt thức Delta',
                             content: 'Δ = b² - 4ac. Nếu Δ ≥ 0 thì có nghiệm thực',
                             example: '2x² - 5x + 3 = 0: Δ = (-5)² - 4(2)(3) = 25 - 24 = 1 > 0'
                           },
                           {
                             name: 'Công thức nghiệm',
                             content: 'x = (-b ± √Δ) / 2a',
                             example: 'x = (5 ± √1) / 4 = (5 ± 1) / 4 → x₁ = 1.5, x₂ = 1'
                           }
                         ],
                         tips: [
                           'Tính Delta trước để biết có nghiệm không',
                           'Nhớ dấu ± trong công thức nghiệm',
                           'Kiểm tra nghiệm bằng cách thế vào'
                         ]
                       }
                     };
                     return knowledgeBase[topic] || {
                       title: topic,
                       concepts: [{ name: 'Kiến thức cơ bản', content: 'Đang cập nhật...', example: '' }],
                       tips: ['Đọc kỹ đề bài', 'Làm từng bước', 'Kiểm tra kết quả']
                     };
                   };

                   const knowledge = getTopicKnowledge(remediationTopic);
                   
                   return (
                     <div className="space-y-6">
                       {/* Concepts */}
                       <div>
                         <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                           <Target size={16} className="mr-2 text-emerald-600" />
                           Khái niệm cốt lõi
                         </h4>
                         <div className="space-y-4">
                           {knowledge.concepts.map((concept: any, index: number) => (
                             <div key={index} className="border-l-4 border-emerald-400 pl-4 bg-emerald-50 p-3 rounded-r-lg">
                               <h5 className="font-semibold text-emerald-800 mb-2">{concept.name}</h5>
                               <p className="text-gray-700 text-sm mb-2">{concept.content}</p>
                               {concept.example && (
                                 <div className="bg-white p-2 rounded text-sm">
                                   <span className="font-medium text-blue-600">💡 {concept.example}</span>
                                 </div>
                               )}
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Tips */}
                       <div>
                         <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                           <Zap size={16} className="mr-2 text-yellow-600" />
                           Mẹo quan trọng
                         </h4>
                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                           <ul className="space-y-2">
                             {knowledge.tips.map((tip: string, index: number) => (
                               <li key={index} className="flex items-start text-sm">
                                 <span className="text-yellow-600 mr-2">✓</span>
                                 <span className="text-gray-700">{tip}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                       </div>

                       {/* Quick Reference */}
                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                         <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                           <Clock size={14} className="mr-1" />
                           Tham khảo nhanh
                         </h5>
                         <div className="text-xs text-gray-600">
                           Dựa trên phân tích: Bạn thường mất {(() => {
                             const topicLogs = responseLogs.filter(log => log.topic === remediationTopic);
                             const avgTime = topicLogs.length > 0 
                               ? topicLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / topicLogs.length / 1000
                               : 4.5;
                             return avgTime.toFixed(1);
                           })()}s cho chủ đề này. Hãy đọc kỹ kiến thức trước khi làm bài!
                         </div>
                       </div>
                     </div>
                   );
                 })()}
               </CardContent>
             </Card>
           </div>
         )}

        {/* Results Section */}
            {showResults && (
          <Card className="mt-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardTitle className="text-xl font-bold flex items-center">
                <CheckCircle size={24} className="mr-3" />
                Kết quả Đánh giá Nhận thức
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                    {/* Overall Score */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <Award size={20} className="mr-2" />
                    Điểm số tổng quát
                  </h3>
                  <div className="text-3xl font-black text-blue-600 mb-2">
                    {Math.round(responses.filter(r => r.isCorrect).length / responses.length * 100)}%
                  </div>
                  <div className="text-sm text-blue-700">
                    {responses.filter(r => r.isCorrect).length}/{responses.length} câu đúng
                      </div>
                    </div>

                {/* Cognitive Analysis */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                    <Brain size={20} className="mr-2" />
                    Phân tích nhận thức
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tốc độ phản ứng:</span>
                      <span className="font-semibold">{cognitiveMetrics.responseTime > 0 ? `${Math.round(cognitiveMetrics.responseTime)}%` : 'Tốt'}</span>
                          </div>
                    <div className="flex justify-between">
                      <span>Độ tự tin:</span>
                      <span className="font-semibold">{cognitiveMetrics.confidence > 0 ? `${Math.round(cognitiveMetrics.confidence)}%` : 'Cao'}</span>
                      </div>
                    <div className="flex justify-between">
                      <span>Nhận dạng mẫu:</span>
                      <span className="font-semibold">{cognitiveMetrics.patternRecognition > 0 ? `${Math.round(cognitiveMetrics.patternRecognition)}%` : 'Tốt'}</span>
                        </div>
                        </div>
                      </div>
                    </div>

              {/* Misconception Analysis */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                  <AlertCircle size={20} className="mr-2" />
                  Phân tích lỗi thường gặp
                </h3>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 mb-3">
                    💡 <strong>Giải thích:</strong> Phần này giúp bạn hiểu những lỗi suy nghĩ phổ biến mà bạn đã mắc phải, từ đó có thể tránh được trong tương lai.
                  </p>
                  {(() => {
                    const misconceptionCounts: { [key: string]: number } = {};
                    responseLogs.forEach((log: any) => {
                      if (log.misconceptionTag) {
                        misconceptionCounts[log.misconceptionTag] = (misconceptionCounts[log.misconceptionTag] || 0) + 1;
                      }
                    });
                    
                    const topMisconceptions = Object.entries(misconceptionCounts)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3);
                    
                    return topMisconceptions.length > 0 ? (
                      <div className="space-y-2">
                        {topMisconceptions.map(([tag, count]) => (
                          <div key={tag} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                                  <div>
                              <span className="text-sm font-medium text-purple-900">
                                {tag === 'M-FRAC-001' ? 'Cộng phân số sai cách' :
                                 tag === 'M-GEO-001' ? 'Nhầm lẫn chu vi và diện tích' :
                                 tag === 'M-LINEAR-001' ? 'Sai dấu khi chuyển vế' :
                                 tag === 'M-ARITH-001' ? 'Lỗi tính toán cơ bản' :
                                 'Lỗi khác'}
                              </span>
                              <div className="text-xs text-purple-600 mt-1">
                                {tag === 'M-FRAC-001' ? 'Cộng tử số với tử số, mẫu số với mẫu số' :
                                 tag === 'M-GEO-001' ? 'Sử dụng công thức diện tích khi hỏi chu vi' :
                                 tag === 'M-LINEAR-001' ? 'Quên đổi dấu khi chuyển số sang vế khác' :
                                 tag === 'M-ARITH-001' ? 'Sai sót trong phép tính cộng, trừ, nhân, chia' :
                                 'Mô tả lỗi chưa xác định'}
                                  </div>
                                </div>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                              {count} lần
                            </Badge>
                                </div>
                        ))}
                              </div>
                    ) : (
                      <div className="text-center py-4 text-purple-600">
                        <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                        <p className="font-medium">Tuyệt vời! Không phát hiện lỗi suy nghĩ nào.</p>
                        <p className="text-sm">Bạn đã trả lời rất cẩn thận và chính xác.</p>
                            </div>
                    );
                  })()}
                      </div>
                    </div>

              {/* Knowledge Map */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Target size={20} className="mr-2" />
                  Bản đồ tri thức
                </h3>
                <KnowledgeMap knowledgeMap={knowledgeMap} />
              </div>

              {/* Subjects Need Improvement */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                  <TrendingUp size={20} className="mr-2" />
                  Chủ đề cần cải thiện
                </h3>
                {Object.entries(knowledgeMap).filter(([topic, data]: any) => data.needsWork).length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(knowledgeMap)
                      .filter(([topic, data]: any) => data.needsWork)
                      .map(([topic, data]: any) => (
                        <div key={topic} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-orange-900">{topicDisplayNames[topic] || topic}</h4>
                            <Badge variant="outline" className="bg-orange-100 text-orange-700">
                              {data.score}%
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => startRemediationForTopic(topic)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            Luyện tập ngay
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
                    <p>Tuyệt vời! Bạn đã nắm vững tất cả chủ đề.</p>
                  </div>
                )}
              </div>

                    {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
                      <Button 
                  onClick={saveAssessmentResults}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 text-lg font-semibold"
                      >
                  <Activity size={20} className="mr-2" />
                  {saving ? 'Đang lưu...' : 'Lưu kết quả & Tạo Lộ trình học tập'}
                      </Button>
                
                      <Button 
                  onClick={() => {
                    // Navigate to learning page - you might need to import useLocation
                    window.location.href = '/learning';
                  }}
                        variant="outline"
                  className="flex-1 py-4 text-lg border-gray-300 hover:bg-gray-50"
                      >
                  <Eye size={20} className="mr-2" />
                  Xem lộ trình học tập
                      </Button>
                
                      <Button 
                  onClick={() => window.location.reload()}
                        variant="outline"
                  className="flex-1 py-4 text-lg border-gray-300 hover:bg-gray-50"
                      >
                  <ClipboardCheck size={20} className="mr-2" />
                  Làm lại bài đánh giá
                      </Button>
                    </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
