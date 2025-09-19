import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAssessmentSchema, insertGameScoreSchema, insertLearningPathSchema } from "@shared/schema";
import { getChatResponse, generateMiniQuiz, buildOntologyContext, analyzeMathDrawing } from "./openai";
import adaptiveRoutes from "./adaptive-routes";
import optimizedAdaptiveRoutes from "./optimized-adaptive-routes";
import performanceRoutes from "./performance-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Adaptive Learning routes (original)
  app.use("/api/adaptive", adaptiveRoutes);
  
  // Optimized Adaptive Learning routes
  app.use("/api/adaptive-optimized", optimizedAdaptiveRoutes);
  
  // Performance monitoring routes
  app.use("/api/performance", performanceRoutes);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assessment data" });
    }
  });

  app.get("/api/assessments/user/:userId", async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByUser(req.params.userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get assessments" });
    }
  });

  // Learning path routes
  app.post("/api/learning-paths", async (req, res) => {
    try {
      const learningPathData = insertLearningPathSchema.parse(req.body);
      const path = await storage.createLearningPath(learningPathData);
      res.json(path);
    } catch (error) {
      res.status(400).json({ message: "Invalid learning path data" });
    }
  });

  app.get("/api/learning-paths/user/:userId", async (req, res) => {
    try {
      const paths = await storage.getLearningPathsByUser(req.params.userId);
      res.json(paths);
    } catch (error) {
      res.status(500).json({ message: "Failed to get learning paths" });
    }
  });

  // Question routes
  app.get("/api/questions/:subject", async (req, res) => {
    try {
      const { subject } = req.params;
      const { topic, count, difficulty } = req.query;
      
      if (count) {
        const questions = await storage.getRandomQuestions(
          subject, 
          parseInt(count as string), 
          difficulty ? parseInt(difficulty as string) : undefined
        );
        res.json(questions);
      } else {
        const questions = await storage.getQuestionsBySubjectAndTopic(subject, topic as string);
        res.json(questions);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions" });
    }
  });

  // Game score routes
  app.post("/api/game-scores", async (req, res) => {
    try {
      const scoreData = insertGameScoreSchema.parse(req.body);
      const score = await storage.createGameScore(scoreData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { limit } = req.query;
      const scores = await storage.getTopGameScores(limit ? parseInt(limit as string) : 10);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // AI Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, errorPatterns, shapeData, imageData } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check for learning intent keywords
      const learningKeywords = ['muốn học', 'muốn được học', 'học môn', 'học', 'tôi muốn học', 'em muốn học', 'hôm nay tôi muốn', 'hôm nay em muốn'];
      const messageLower = message.toLowerCase();
      const hasLearningIntent = learningKeywords.some(keyword => messageLower.includes(keyword));

      if (hasLearningIntent) {
        return res.json({ 
          response: "Tôi rất sẵn lòng được giúp bạn! Hãy bấm vào tính năng để tôi được hiểu bạn và tạo lộ trình học tập phù hợp nhất nhé! 🎯✨",
          cta: {
            text: "Bắt đầu cá nhân hoá",
            href: "/onboarding"
          }
        });
      }

      // Handle visual questions with shape data or image data
      if (shapeData || imageData) {
        // Mock responses for different math topics based on lesson content
        const mockMathResponses = [
          {
            content: `📐 **Hàm số bậc nhất** - Phần bạn đã chọn

🎯 **Khái niệm chính:**
Hàm số bậc nhất có dạng y = ax + b (a ≠ 0)
- a: hệ số góc (độ dốc của đường thẳng)
- b: tung độ gốc (điểm cắt trục y)

📊 **Đặc điểm đồ thị:**
- Đồ thị là đường thẳng
- Nếu a > 0: hàm số đồng biến
- Nếu a < 0: hàm số nghịch biến

💡 **Ví dụ thực tế:**
y = 2x + 3 có nghĩa là:
- Mỗi khi x tăng 1, y tăng 2
- Khi x = 0, y = 3

🤔 **Câu hỏi kiểm tra hiểu:**
Với hàm số y = -x + 5, hãy tìm giá trị y khi x = 2?`
          },
          {
            content: `📈 **Cách vẽ đồ thị hàm số bậc nhất**

🎯 **Bước 1: Tìm 2 điểm**
- Cho x = 0 → tìm y
- Cho y = 0 → tìm x

📝 **Bước 2: Vẽ đường thẳng**
- Nối 2 điểm vừa tìm được
- Kéo dài thành đường thẳng

💡 **Mẹo nhớ:**
- Hệ số a dương: đường thẳng đi lên từ trái sang phải
- Hệ số a âm: đường thẳng đi xuống từ trái sang phải

🔍 **Lưu ý quan trọng:**
Đồ thị hàm số bậc nhất luôn là đường thẳng không qua gốc tọa độ (trừ khi b = 0)`
          },
          {
            content: `⚡ **Tìm giao điểm của hai đường thẳng**

🎯 **Phương pháp:**
Cho y₁ = a₁x + b₁ và y₂ = a₂x + b₂
Tại giao điểm: y₁ = y₂

📝 **Các bước giải:**
1. Lập phương trình: a₁x + b₁ = a₂x + b₂
2. Giải phương trình tìm x
3. Thay x vào một trong hai hàm để tìm y

💡 **Ví dụ cụ thể:**
y = 2x + 1 và y = -x + 4
→ 2x + 1 = -x + 4
→ 3x = 3
→ x = 1, y = 3
→ Giao điểm: (1; 3)

🤓 **Kiến thức mở rộng:**
Hai đường thẳng song song khi a₁ = a₂ nhưng b₁ ≠ b₂`
          }
        ];
        
        // Select random response or based on position
        const responseIndex = Math.floor(Math.random() * mockMathResponses.length);
        const selectedResponse = mockMathResponses[responseIndex];
        
        return res.json({ response: selectedResponse.content });
      }

      const augmented = [context, buildOntologyContext(context)].filter(Boolean).join("\n\n");
      const response = await getChatResponse(message, augmented, errorPatterns);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Generate mini quiz for reinforcement learning
  app.post("/api/mini-quiz", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      if (!topic || !difficulty) {
        return res.status(400).json({ message: "Topic and difficulty are required" });
      }
      
      const questions = await generateMiniQuiz(topic, difficulty);
      res.json({ questions });
    } catch (error) {
      console.error("Mini quiz generation error:", error);
      res.status(500).json({ message: "Failed to generate mini quiz" });
    }
  });

  // Demo: reset user progress/state
  app.post("/api/demo/reset", async (req, res) => {
    try {
      const { userId } = req.body || {};
      if (!userId) return res.status(400).json({ message: "userId is required" });
      await storage.resetUserData(userId);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
