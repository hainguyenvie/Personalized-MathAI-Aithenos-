import { type User, type InsertUser, type Assessment, type InsertAssessment, type LearningPath, type InsertLearningPath, type GameScore, type InsertGameScore, type Question, type InsertQuestion } from "@shared/schema";
import { randomUUID } from "crypto";
import { enhancedQuestions } from "./enhanced-questions";
import { demoUsers, demoAssessments, demoLearningPaths } from "./demo-data";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Assessment methods
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessmentsByUser(userId: string): Promise<Assessment[]>;
  
  // Learning path methods
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  getLearningPathsByUser(userId: string): Promise<LearningPath[]>;
  updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<LearningPath>;
  
  // Game score methods
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  getTopGameScores(limit?: number): Promise<GameScore[]>;
  
  // Question methods
  getQuestionsBySubjectAndTopic(subject: string, topic?: string): Promise<Question[]>;
  getRandomQuestions(subject: string, count: number, difficulty?: number): Promise<Question[]>;

  // Demo utilities
  resetUserData(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assessments: Map<string, Assessment>;
  private learningPaths: Map<string, LearningPath>;
  private gameScores: Map<string, GameScore>;
  private questions: Map<string, Question>;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.learningPaths = new Map();
    this.gameScores = new Map();
    this.questions = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add demo users with rich data
    const sampleUser: User = {
      id: "sample-user-1",
      username: "annguyen",
      password: "password123",
      fullName: "An Nguyễn",
      role: "student",
      grade: "9A3",
      subject: "math",
      points: 1250,
      streak: 7,
      createdAt: new Date(),
      level: 3,
      totalXP: 1250,
      achievements: JSON.stringify(["first_correct", "streak_master"])
    };
    this.users.set(sampleUser.id, sampleUser);

    // Add additional demo users for realistic leaderboard
    demoUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    // Add enhanced questions for math
    const sampleQuestions: Question[] = [
      ...enhancedQuestions,
      // Easy questions (difficulty 1-2)
      {
        id: "q1",
        subject: "math",
        topic: "basic-arithmetic",
        difficulty: 1,
        question: "Phép tính 5 + 3 có kết quả là:",
        options: JSON.stringify(["8", "7", "6", "9"]),
        correctAnswer: "8",
        explanation: "5 + 3 = 8"
      },
      {
        id: "q2",
        subject: "math",
        topic: "basic-arithmetic",
        difficulty: 1,
        question: "Phép tính 12 ÷ 4 có kết quả là:",
        options: JSON.stringify(["2", "3", "4", "6"]),
        correctAnswer: "3",
        explanation: "12 ÷ 4 = 3"
      },
      {
        id: "q3",
        subject: "math",
        topic: "linear-equation",
        difficulty: 2,
        question: "Phương trình x + 7 = 15 có nghiệm là:",
        options: JSON.stringify(["x = 8", "x = 22", "x = 7", "x = 15"]),
        correctAnswer: "x = 8",
        explanation: "x = 15 - 7 = 8"
      },
      {
        id: "q4",
        subject: "math",
        topic: "linear-function",
        difficulty: 2,
        question: "Hàm số y = 3x + 2 khi x = 1 có giá trị y là:",
        options: JSON.stringify(["y = 5", "y = 3", "y = 2", "y = 6"]),
        correctAnswer: "y = 5",
        explanation: "y = 3(1) + 2 = 3 + 2 = 5"
      },
      {
        id: "q5",
        subject: "math",
        topic: "linear-function",
        difficulty: 3,
        question: "Cho hàm số y = 2x - 1. Khi x = 3, giá trị của y là bao nhiêu?",
        options: JSON.stringify(["y = 5", "y = 7", "y = 6", "y = 4"]),
        correctAnswer: "y = 5",
        explanation: "Thay x = 3 vào hàm số: y = 2(3) - 1 = 6 - 1 = 5"
      },
      // Medium questions (difficulty 3-4)
      {
        id: "q6",
        subject: "math",
        topic: "linear-equation",
        difficulty: 3,
        question: "Phương trình 2x + 5 = 13 có nghiệm là:",
        options: JSON.stringify(["x = 4", "x = 9", "x = 6", "x = 3"]),
        correctAnswer: "x = 4",
        explanation: "Giải phương trình: 2x = 13 - 5 = 8, suy ra x = 4"
      },
      {
        id: "q7",
        subject: "math",
        topic: "quadratic-function",
        difficulty: 4,
        question: "Hàm số y = x² + 2x + 1 có đỉnh parapol tại điểm:",
        options: JSON.stringify(["(-1, 0)", "(1, 4)", "(0, 1)", "(-2, 1)"]),
        correctAnswer: "(-1, 0)",
        explanation: "Đỉnh parapol có hoành độ x = -b/2a = -2/2 = -1, tung độ y = (-1)² + 2(-1) + 1 = 0"
      },
      {
        id: "q8",
        subject: "math",
        topic: "quadratic-equation",
        difficulty: 4,
        question: "Phương trình x² - 5x + 6 = 0 có các nghiệm là:",
        options: JSON.stringify(["x = 2, x = 3", "x = 1, x = 6", "x = -2, x = -3", "x = 0, x = 5"]),
        correctAnswer: "x = 2, x = 3",
        explanation: "Phân tích: x² - 5x + 6 = (x - 2)(x - 3) = 0"
      },
      // Hard questions (difficulty 5)
      {
        id: "q9",
        subject: "math",
        topic: "system-equations",
        difficulty: 5,
        question: "Hệ phương trình {2x + y = 7; x - y = 2} có nghiệm là:",
        options: JSON.stringify(["(3, 1)", "(2, 3)", "(4, -1)", "(1, 5)"]),
        correctAnswer: "(3, 1)",
        explanation: "Từ phương trình thứ 2: y = x - 2. Thay vào phương trình 1: 2x + (x - 2) = 7 => 3x = 9 => x = 3, y = 1"
      },
      {
        id: "q10",
        subject: "math",
        topic: "geometry",
        difficulty: 5,
        question: "Trong tam giác vuông có cạnh huyền 5cm, một cạnh góc vuông 3cm. Cạnh góc vuông còn lại là:",
        options: JSON.stringify(["4cm", "6cm", "7cm", "2cm"]),
        correctAnswer: "4cm",
        explanation: "Theo định lý Pythagoras: a² + b² = c² => 3² + b² = 5² => b² = 25 - 9 = 16 => b = 4cm"
      }
      ,
      // Geometry misconception-focused (area vs perimeter)
      {
        id: "q11",
        subject: "math",
        topic: "geometry",
        difficulty: 2,
        question: "Hình chữ nhật có các cạnh 5 và 3. Diện tích hình chữ nhật là bao nhiêu?",
        options: JSON.stringify(["15", "16", "8", "30"]),
        correctAnswer: "15",
        explanation: "Diện tích = dài × rộng = 5 × 3 = 15. 16 là chu vi/nhầm lẫn, 8 là tính tổng hai cạnh, 30 là nhầm lẫn nhân đôi diện tích.",
      }
    ];

    sampleQuestions.forEach(q => this.questions.set(q.id, q));

    // Add demo assessments and learning paths
    demoAssessments.forEach(assessment => {
      this.assessments.set(assessment.id, assessment);
    });

    demoLearningPaths.forEach(path => {
      this.learningPaths.set(path.id, path);
    });

    // Add some demo game scores for leaderboard
    const gameScores = [
      {
        id: randomUUID(),
        userId: "demo-user-2",
        gameType: "quiz-master",
        score: 950,
        completedAt: new Date("2024-01-22T16:30:00Z")
      },
      {
        id: randomUUID(), 
        userId: "demo-user-1",
        gameType: "speed-math",
        score: 780,
        completedAt: new Date("2024-01-21T14:15:00Z")
      },
      {
        id: randomUUID(),
        userId: "demo-user-3", 
        gameType: "equation-solver",
        score: 650,
        completedAt: new Date("2024-01-20T10:45:00Z")
      }
    ];

    gameScores.forEach(score => {
      this.gameScores.set(score.id, score);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      points: insertUser.points || 0,
      streak: insertUser.streak || 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      completedAt: new Date()
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAssessmentsByUser(userId: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(assessment => assessment.userId === userId);
  }

  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const id = randomUUID();
    const path: LearningPath = {
      ...insertPath,
      id,
      progress: insertPath.progress || 0,
      createdAt: new Date()
    };
    this.learningPaths.set(id, path);
    return path;
  }

  async getLearningPathsByUser(userId: string): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values()).filter(path => path.userId === userId);
  }

  async updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<LearningPath> {
    const existingPath = this.learningPaths.get(id);
    if (!existingPath) {
      throw new Error("Learning path not found");
    }
    
    const updatedPath = { ...existingPath, ...updates };
    this.learningPaths.set(id, updatedPath);
    return updatedPath;
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const id = randomUUID();
    const score: GameScore = {
      ...insertScore,
      id,
      completedAt: new Date()
    };
    this.gameScores.set(id, score);
    return score;
  }

  async getTopGameScores(limit = 10): Promise<GameScore[]> {
    return Array.from(this.gameScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getQuestionsBySubjectAndTopic(subject: string, topic?: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => {
      if (q.subject !== subject) return false;
      if (topic && q.topic !== topic) return false;
      return true;
    });
  }

  async getRandomQuestions(subject: string, count: number, difficulty?: number): Promise<Question[]> {
    const filteredQuestions = Array.from(this.questions.values()).filter(q => {
      if (q.subject !== subject) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      return true;
    });

    // Shuffle and take first 'count' questions
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async resetUserData(userId: string): Promise<void> {
    // Remove assessments
    for (const [id, a] of Array.from(this.assessments.entries())) {
      if (a.userId === userId) this.assessments.delete(id);
    }
    // Remove learning paths
    for (const [id, p] of Array.from(this.learningPaths.entries())) {
      if (p.userId === userId) this.learningPaths.delete(id);
    }
    // Remove game scores
    for (const [id, s] of Array.from(this.gameScores.entries())) {
      if (s.userId === userId) this.gameScores.delete(id);
    }
  }
}

export const storage = new MemStorage();
