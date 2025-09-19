import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAssessmentSchema, insertGameScoreSchema, insertLearningPathSchema, User, Assessment } from "@shared/schema";
import { getChatResponse, generateMiniQuiz, buildOntologyContext } from "./openai";
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
      const { message, context, errorPatterns } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check for learning intent keywords
      const learningKeywords = ['muốn học', 'muốn được học', 'học môn', 'tôi muốn học', 'em muốn học', 'hôm nay tôi muốn', 'hôm nay em muốn'];
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

      const augmented = [context, buildOntologyContext(context)].filter(Boolean).join("\n\n");
      const response = await getChatResponse(message, augmented, errorPatterns);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Enhanced Learning Path Generation
  app.post("/api/learning-paths/generate", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get user's latest assessment and onboarding data
      const assessments = await storage.getAssessmentsByUser(userId);
      const latestAssessment = assessments[assessments.length - 1];
      
      if (!latestAssessment) {
        return res.status(400).json({ message: "No assessment found. Please complete assessment first." });
      }

      const knowledgeMap = JSON.parse(latestAssessment.knowledgeMap);
      
      // Get user data for personalization
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Generate personalized roadmap topics
      const personalizedTopics = generatePersonalizedTopics(knowledgeMap, user);
      
      // Create enhanced learning path
      const learningPathData = {
        userId,
        title: `Lộ trình cá nhân hóa cho ${user.fullName}`,
        subject: "math",
        duration: 12, // 12 weeks
        topics: JSON.stringify(personalizedTopics),
        priority: "personalized",
        progress: 0,
        estimatedDuration: "3 tháng",
        status: "active"
      };

      const learningPath = await storage.createLearningPath(learningPathData);
      res.json(learningPath);
    } catch (error) {
      console.error("Learning path generation error:", error);
      res.status(500).json({ message: "Failed to generate personalized learning path" });
    }
  });

  // Get personalized roadmap with progress
  app.get("/api/learning-paths/:userId/roadmap", async (req, res) => {
    try {
      const { userId } = req.params;
      const learningPaths = await storage.getLearningPathsByUser(userId);
      const activePath = learningPaths.find(p => p.status === "active");
      
      if (!activePath) {
        return res.status(404).json({ message: "No active learning path found" });
      }

      // Get user and assessment data for personalization context
      const user = await storage.getUser(userId);
      const assessments = await storage.getAssessmentsByUser(userId);
      const latestAssessment = assessments[assessments.length - 1];

      const roadmapData = {
        learningPath: activePath,
        user: user,
        assessment: latestAssessment,
        personalizedReasons: generatePersonalizedReasons(user, latestAssessment)
      };

      res.json(roadmapData);
    } catch (error) {
      console.error("Roadmap fetch error:", error);
      res.status(500).json({ message: "Failed to fetch roadmap" });
    }
  });

  // Update topic progress in roadmap
  app.patch("/api/learning-paths/:id/topic/:topicId", async (req, res) => {
    try {
      const { id, topicId } = req.params;
      const { status, progress } = req.body;

      // Get all learning paths and find the one with matching id
      const allPaths = await Promise.all([
        storage.getLearningPathsByUser("sample-user-1"),
        // Could add more users here, but for demo we'll find by searching
      ]);
      const targetPath = allPaths.flat().find(p => p.id === id);
      
      if (!targetPath) {
        return res.status(404).json({ message: "Learning path not found" });
      }

      const topics = JSON.parse(targetPath.topics);
      const topicIndex = topics.findIndex((t: any) => t.id === topicId);
      
      if (topicIndex === -1) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // Update topic
      topics[topicIndex] = { ...topics[topicIndex], status, progress };
      
      // Calculate overall progress
      const totalProgress = topics.reduce((sum: number, topic: any) => sum + (topic.progress || 0), 0) / topics.length;

      const updatedPath = await storage.updateLearningPath(id, {
        topics: JSON.stringify(topics),
        progress: Math.round(totalProgress)
      });

      res.json(updatedPath);
    } catch (error) {
      console.error("Topic progress update error:", error);
      res.status(500).json({ message: "Failed to update topic progress" });
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

// Helper functions for personalized learning path generation
function generatePersonalizedTopics(knowledgeMap: any, user: User) {
  // Get onboarding preferences from localStorage (would be passed from frontend)
  // For now, use user data and create intelligent topic structure
  
  const weakAreas = Object.entries(knowledgeMap)
    .filter(([_, level]) => (level as number) < 0.6)
    .map(([topic, _]) => topic);
  
  const strongAreas = Object.entries(knowledgeMap)
    .filter(([_, level]) => (level as number) > 0.8)
    .map(([topic, _]) => topic);

  // Create personalized topic sequence
  const personalizedTopics = [
    // Foundation Lane - Address weakest areas first
    ...weakAreas.map((topic, index) => ({
      id: `foundation-${index}`,
      title: getTopicDisplayName(topic),
      category: 'foundation',
      lane: 'Nền tảng',
      mastery: knowledgeMap[topic] || 0.3,
      status: 'ready',
      nextAction: 'Học lý thuyết',
      estMinutes: 45,
      reason: `Điểm chẩn đoán thấp (${Math.round((knowledgeMap[topic] || 0.3) * 100)}%) - cần củng cố`,
      topics: [topic],
      color: 'from-red-400 to-orange-500'
    })),
    
    // Practice Lane - Reinforce with practice
    {
      id: 'practice-mixed',
      title: 'Luyện tập tổng hợp',
      category: 'practice',
      lane: 'Luyện tập',
      mastery: 0,
      status: 'locked',
      nextAction: 'Làm bài tập',
      estMinutes: 30,
      reason: 'Để kiểm tra hiểu biết và ghi nhớ lâu dài',
      topics: weakAreas.slice(0, 3),
      color: 'from-blue-400 to-cyan-500'
    },
    
    // Enhancement Lane - Build on strong areas
    ...strongAreas.slice(0, 2).map((topic, index) => ({
      id: `enhance-${index}`,
      title: `${getTopicDisplayName(topic)} nâng cao`,
      category: 'enhancement',
      lane: 'Nâng cao',
      mastery: knowledgeMap[topic] || 0.8,
      status: 'available',
      nextAction: 'Thử thách khó',
      estMinutes: 35,
      reason: `Điểm mạnh (${Math.round((knowledgeMap[topic] || 0.8) * 100)}%) - phát triển thêm`,
      topics: [topic],
      color: 'from-green-400 to-emerald-500'
    })),
    
    // Integration Lane - Combine knowledge
    {
      id: 'integration-final',
      title: 'Tích hợp kiến thức',
      category: 'integration',
      lane: 'Tích hợp',
      mastery: 0,
      status: 'locked',
      nextAction: 'Giải đề thi',
      estMinutes: 60,
      reason: 'Kết hợp tất cả kiến thức đã học',
      topics: [...weakAreas, ...strongAreas],
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return personalizedTopics;
}

function generatePersonalizedReasons(user: User | null, assessment: Assessment | null) {
  const reasons = {
    profileSummary: user ? {
      name: user.fullName,
      role: user.role,
      grade: user.grade,
      motivation: "Được thiết kế dành riêng cho bạn",
      learningStyle: "Phù hợp với phong cách học của bạn"
    } : null,
    
    whyThisPlan: [
      "Dựa trên kết quả chẩn đoán cá nhân của bạn",
      "Ưu tiên những chủ đề bạn cần củng cố nhất",
      "Kết hợp với điểm mạnh để tạo động lực",
      "Thời gian học được tối ưu theo khả năng"
    ],
    
    dailyRecommendation: assessment ? {
      title: "Gợi ý học hôm nay",
      description: `Bắt đầu với ${getRecommendedTopic(assessment)} - chỉ cần 30 phút`,
      urgency: "medium",
      icon: "🎯"
    } : null
  };
  
  return reasons;
}

function getTopicDisplayName(topic: string): string {
  const topicNames: Record<string, string> = {
    'basic-arithmetic': 'Số học cơ bản',
    'linear-equation': 'Phương trình bậc nhất',
    'linear-function': 'Hàm số bậc nhất',
    'quadratic-equation': 'Phương trình bậc hai',
    'quadratic-function': 'Hàm số bậc hai',
    'system-equations': 'Hệ phương trình',
    'geometry': 'Hình học',
    'probability': 'Xác suất',
    'statistics': 'Thống kê',
    'fractions': 'Phân số',
    'decimals': 'Số thập phân',
    'algebra': 'Đại số'
  };
  
  return topicNames[topic] || topic;
}

function getRecommendedTopic(assessment: Assessment): string {
  const knowledgeMap = JSON.parse(assessment.knowledgeMap);
  const weakestTopic = Object.entries(knowledgeMap)
    .sort(([,a], [,b]) => (a as number) - (b as number))[0];
  
  return getTopicDisplayName(weakestTopic[0]);
}
