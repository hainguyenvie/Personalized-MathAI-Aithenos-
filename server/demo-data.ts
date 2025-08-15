import { type User, type Assessment, type LearningPath } from "@shared/schema";

export const demoUsers: User[] = [
  {
    id: "demo-user-1",
    username: "minh_nguyen",
    password: "demo123",
    fullName: "Nguyễn Văn Minh",
    role: "student",
    grade: "9A1",
    subject: "math",
    points: 2850,
    streak: 12,
    createdAt: new Date("2024-01-15"),
    level: 4,
    totalXP: 2850,
    achievements: JSON.stringify([
      "first_correct", "streak_master", "geometry_expert", "equation_solver"
    ])
  },
  {
    id: "demo-user-2", 
    username: "linh_tran",
    password: "demo123",
    fullName: "Trần Thị Linh",
    role: "student", 
    grade: "9A2",
    subject: "math",
    points: 3420,
    streak: 8,
    createdAt: new Date("2024-01-10"),
    level: 5,
    totalXP: 3420,
    achievements: JSON.stringify([
      "first_correct", "streak_master", "quick_thinker", "problem_solver", "math_champion"
    ])
  },
  {
    id: "demo-user-3",
    username: "duc_le", 
    password: "demo123",
    fullName: "Lê Minh Đức",
    role: "student",
    grade: "9A3", 
    subject: "math",
    points: 1950,
    streak: 5,
    createdAt: new Date("2024-01-20"),
    level: 3,
    totalXP: 1950,
    achievements: JSON.stringify([
      "first_correct", "persistent_learner", "fraction_master"
    ])
  }
];

export const demoAssessments: Assessment[] = [
  {
    id: "assessment-1",
    userId: "demo-user-1", 
    subject: "math",
    score: 85,
    totalQuestions: 12,
    knowledgeMap: JSON.stringify({
      "basic-arithmetic": { score: 95, level: "Thành thạo", needsWork: false },
      "fractions": { score: 78, level: "Khá", needsWork: true },
      "geometry": { score: 90, level: "Thành thạo", needsWork: false },
      "linear-equation": { score: 82, level: "Khá", needsWork: false },
      "quadratic-equation": { score: 65, level: "Trung bình", needsWork: true }
    }),
    responses: JSON.stringify([
      {
        questionId: "arith_001",
        topic: "basic-arithmetic",
        difficulty: 1,
        selectedOption: "5 viên",
        correctAnswer: "5 viên",
        isCorrect: true,
        responseTime: 3200,
        timestamp: "2024-01-15T10:30:00Z"
      },
      {
        questionId: "frac_001", 
        topic: "fractions",
        difficulty: 2,
        selectedOption: "2/10",
        correctAnswer: "5/12", 
        isCorrect: false,
        misconceptionTag: "M-FRAC-001",
        responseTime: 8500,
        timestamp: "2024-01-15T10:32:00Z"
      },
      {
        questionId: "geo_001",
        topic: "geometry",
        difficulty: 2, 
        selectedOption: "40cm",
        correctAnswer: "40cm",
        isCorrect: true,
        responseTime: 4100,
        timestamp: "2024-01-15T10:34:00Z"
      }
    ]),
    completedAt: new Date("2024-01-15T10:45:00Z")
  },
  {
    id: "assessment-2",
    userId: "demo-user-2",
    subject: "math", 
    score: 92,
    totalQuestions: 12,
    knowledgeMap: JSON.stringify({
      "basic-arithmetic": { score: 100, level: "Thành thạo", needsWork: false },
      "fractions": { score: 88, level: "Thành thạo", needsWork: false },
      "geometry": { score: 95, level: "Thành thạo", needsWork: false },
      "linear-equation": { score: 90, level: "Thành thạo", needsWork: false },
      "quadratic-equation": { score: 85, level: "Thành thạo", needsWork: false },
      "system-equations": { score: 80, level: "Khá", needsWork: false }
    }),
    responses: JSON.stringify([
      {
        questionId: "arith_002",
        topic: "basic-arithmetic", 
        difficulty: 2,
        selectedOption: "216 chiếc",
        correctAnswer: "216 chiếc",
        isCorrect: true,
        responseTime: 2800,
        timestamp: "2024-01-10T14:20:00Z"
      },
      {
        questionId: "quad_001",
        topic: "quadratic-equation",
        difficulty: 3,
        selectedOption: "x = ±4", 
        correctAnswer: "x = ±4",
        isCorrect: true,
        responseTime: 5200,
        timestamp: "2024-01-10T14:25:00Z"
      }
    ]),
    completedAt: new Date("2024-01-10T14:40:00Z")
  }
];

export const demoLearningPaths: LearningPath[] = [
  {
    id: "path-1",
    userId: "demo-user-1",
    title: "Lộ trình cải thiện Phân số & Phương trình bậc 2",
    topics: JSON.stringify([
      "fractions", "quadratic-equation", "system-equations"
    ]), 
    priority: "foundational-gaps",
    progress: 35,
    estimatedDuration: "3 tuần",
    createdAt: new Date("2024-01-15T11:00:00Z"),
    status: "active"
  },
  {
    id: "path-2", 
    userId: "demo-user-2",
    title: "Lộ trình nâng cao Toán học lớp 9",
    topics: JSON.stringify([
      "advanced-geometry", "complex-equations", "probability", "statistics"
    ]),
    priority: "enrichment",
    progress: 65,
    estimatedDuration: "4 tuần", 
    createdAt: new Date("2024-01-10T15:00:00Z"),
    status: "active"
  }
];

export const demoMisconceptions = [
  {
    id: "M-FRAC-001",
    name: "Cộng tử số và mẫu số riêng biệt",
    description: "Học sinh cộng tử số với tử số, mẫu số với mẫu số thay vì quy đồng",
    frequency: 8,
    severity: "high" as const,
    remediation: "Thực hành với mô hình hình học, nhấn mạnh việc quy đồng mẫu số"
  },
  {
    id: "M-GEO-001", 
    name: "Nhầm lẫn diện tích và chu vi",
    description: "Học sinh sử dụng công thức diện tích khi hỏi chu vi và ngược lại",
    frequency: 12,
    severity: "high" as const,
    remediation: "Sử dụng hình ảnh trực quan, phân biệt rõ 'bao quanh' vs 'bề mặt'"
  },
  {
    id: "M-LINEAR-001",
    name: "Sai dấu khi chuyển vế", 
    description: "Học sinh quên đổi dấu khi chuyển số hạng sang vế khác",
    frequency: 15,
    severity: "medium" as const,
    remediation: "Luyện tập quy tắc 'chuyển vế đổi dấu' với nhiều ví dụ"
  },
  {
    id: "M-QUAD-001",
    name: "Thiếu nghiệm âm trong phương trình bậc 2",
    description: "Học sinh chỉ tìm nghiệm dương khi giải x² = a",
    frequency: 6,
    severity: "medium" as const, 
    remediation: "Nhấn mạnh khái niệm ±√a, luyện tập với nhiều ví dụ"
  }
];

export const demoAchievements = [
  {
    id: "first_correct",
    name: "Bước đầu tiên", 
    description: "Trả lời đúng câu hỏi đầu tiên",
    icon: "⭐",
    rarity: "common" as const,
    category: "learning" as const,
    unlocked: true,
    unlockedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "streak_master",
    name: "Bậc thầy chuỗi thắng",
    description: "Trả lời đúng 10 câu liên tiếp",
    icon: "🔥",
    rarity: "rare" as const,
    category: "persistence" as const, 
    unlocked: true,
    unlockedAt: "2024-01-16T14:20:00Z"
  },
  {
    id: "geometry_expert", 
    name: "Chuyên gia Hình học",
    description: "Đạt 90% trở lên trong chủ đề Hình học",
    icon: "📐",
    rarity: "epic" as const,
    category: "mastery" as const,
    unlocked: true,
    unlockedAt: "2024-01-18T16:45:00Z"
  },
  {
    id: "equation_solver",
    name: "Thần đồng Phương trình", 
    description: "Giải đúng 25 phương trình khác nhau",
    icon: "🧮",
    rarity: "rare" as const,
    category: "mastery" as const,
    unlocked: true,
    unlockedAt: "2024-01-20T11:30:00Z"
  },
  {
    id: "quick_thinker",
    name: "Tư duy nhanh",
    description: "Trả lời đúng trong vòng 5 giây",
    icon: "⚡", 
    rarity: "rare" as const,
    category: "performance" as const,
    unlocked: false,
    progress: 3,
    maxProgress: 5
  },
  {
    id: "math_champion", 
    name: "Nhà vô địch Toán học",
    description: "Đạt 95% thành thạo toàn khóa học",
    icon: "👑",
    rarity: "legendary" as const,
    category: "mastery" as const,
    unlocked: false,
    progress: 78,
    maxProgress: 95
  }
];

export const demoStudySession = {
  totalStudyTime: "2h 45m",
  questionsCompleted: 47,
  topicsStudied: ["Phân số", "Hình học", "Phương trình bậc nhất"],
  averageAccuracy: 82,
  streakRecord: 15,
  weeklyGoal: {
    target: 60,
    completed: 47,
    progress: 78
  }
};

export const demoCognitiveInsights = {
  responseTimeProfile: {
    average: 4200, // ms
    improvement: "+15%",
    comparison: "Nhanh hơn 68% học sinh cùng lớp"
  },
  confidenceLevel: {
    current: 78,
    trend: "increasing",
    strongTopics: ["Số học cơ bản", "Hình học"],
    improvingTopics: ["Phân số", "Phương trình"]
  },
  learningStyle: {
    primary: "Visual-Kinesthetic",
    effectiveness: 85,
    recommendations: [
      "Sử dụng nhiều hình ảnh và biểu đồ",
      "Thực hành với các mô hình cụ thể",
      "Áp dụng vào tình huống thực tế"
    ]
  }
};
