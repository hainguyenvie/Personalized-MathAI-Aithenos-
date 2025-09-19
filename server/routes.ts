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
        // For now, we'll use a simulated screenshot approach
        // In a real implementation, you'd capture the screen area inside the shape
        const visualContext = `${context}\nHình dạng được chọn: ${shapeData?.type || 'unknown'}\nVị trí: x=${shapeData?.x || 0}, y=${shapeData?.y || 0}`;
        
        if (imageData) {
          // If we have actual image data, analyze it
          const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
          const response = await analyzeMathDrawing(base64Image, visualContext);
          return res.json({ response });
        } else {
          // If we only have shape data, provide a contextual response
          const response = `Tôi thấy bạn đã khoanh vùng một ${shapeData.type === 'circle' ? 'vùng tròn' : 'vùng chữ nhật'} trong video. 

Dựa trên vị trí và bối cảnh bài học "${context}", đây có thể là phần bạn đang thắc mắc về:

📚 **Giải thích khái niệm:**
Phần này thường liên quan đến các bước giải toán hoặc khái niệm cần làm rõ. 

🔍 **Gợi ý học tập:**
- Hãy tạm dừng video và ghi chú lại điểm chưa hiểu
- Thử làm lại từ đầu với các bước nhỏ hơn
- Tham khảo ví dụ tương tự trong bài học

💡 **Bạn có thể hỏi cụ thể hơn:**
"Tại sao ở bước này lại làm như vậy?" hoặc "Có cách nào khác để giải không?"

Bạn có muốn mô tả chi tiết hơn về phần nào khiến bạn bối rối không?`;
          
          return res.json({ response });
        }
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
