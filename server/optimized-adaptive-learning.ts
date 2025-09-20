import { randomUUID } from "crypto";
import { optimizedQuestionDB, Question } from "./optimized-question-db";
import { aiCacheManager } from "./ai-cache";
import { questionBackupGenerator, BackupQuestion } from "./question-backup";
import OpenAI from 'openai';

// Initialize OpenAI
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiEnabled = Boolean(openaiApiKey);
let openai: OpenAI | null = null;

if (openaiEnabled) {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
  console.log('✓ OpenAI enabled for optimized adaptive learning');
} else {
  console.log('⚠ OpenAI disabled - using backup question generation only');
}

// Types (reusing from original)
export interface Session {
  id: string;
  student_name: string;
  grade: string;
  current_state: SessionState;
  current_difficulty: 'N' | 'H' | 'V';
  current_bundle: Question[];
  current_question_index: number;
  answers: Answer[];
  answers_by_difficulty: { [difficulty: string]: Answer[] };
  weak_lessons: number[];
  asked_question_ids: Set<string>;
  supplementary_bundles: { [key: string]: Question[] };
  supplementary_rounds: SupplementaryRound[];
  current_supplementary_round: number;
  used_bundles: { [difficulty: string]: Question[] };
  tutor_sessions: TutorSession[];
  review_sessions: ReviewSession[];
  mastery_map: { [lesson: number]: { [difficulty: string]: boolean } };
  created_at: Date;
  updated_at: Date;
}

export interface Answer {
  question_id: string;
  student_answer: number;
  is_correct: boolean;
  time_spent: number;
  timestamp: Date;
}

export interface TutorSession {
  id: string;
  context: {
    lesson_id: number;
    difficulty: 'N' | 'H' | 'V';
    problem_type: string;
    student_answer: string;
    correct_answer: string;
    question_content: string;
    explanation: string;
  };
  hints_used: any[];
  current_step: number;
  max_steps: number;
  completed: boolean;
  student_responses: string[];
  created_at: Date;
}

export interface SupplementaryRound {
  id: string;
  round_number: number;
  original_question: Question;
  supplementary_questions: Question[];
  round_answers: Answer[];
  round_completed: boolean;
  created_at: Date;
}

export interface ReviewSession {
  id: string;
  difficulty: 'N' | 'H' | 'V';
  lesson_summary: {
    [lesson: number]: {
      total_questions: number;
      correct_answers: number;
      accuracy: number;
      weak_topics: string[];
      strong_topics: string[];
    }
  };
  overall_performance: {
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    time_spent: number;
  };
  recommendations: string[];
  next_difficulty_preparation: string[];
  created_at: Date;
}

export type SessionState =
  | 'INIT'
  | 'BUNDLE_N' | 'EVAL_N' | 'SUPP_N' | 'TUTOR_N' | 'REVIEW_N' | 'REVIEW_FAIL_N' | 'REVIEW_SUPP_N' | 'REVIEW_SUPP_FAIL_N'
  | 'SUPP_ROUND_N_1' | 'SUPP_ROUND_N_2' | 'SUPP_ROUND_N_3' | 'SUPP_ROUND_N_4' | 'SUPP_ROUND_N_5'
  | 'REVIEW_ROUND_N_1' | 'REVIEW_ROUND_N_2' | 'REVIEW_ROUND_N_3' | 'REVIEW_ROUND_N_4' | 'REVIEW_ROUND_N_5'
  | 'BUNDLE_H' | 'EVAL_H' | 'SUPP_H' | 'TUTOR_H' | 'REVIEW_H' | 'REVIEW_FAIL_H' | 'REVIEW_SUPP_H' | 'REVIEW_SUPP_FAIL_H'
  | 'SUPP_ROUND_H_1' | 'SUPP_ROUND_H_2' | 'SUPP_ROUND_H_3' | 'SUPP_ROUND_H_4' | 'SUPP_ROUND_H_5'
  | 'REVIEW_ROUND_H_1' | 'REVIEW_ROUND_H_2' | 'REVIEW_ROUND_H_3' | 'REVIEW_ROUND_H_4' | 'REVIEW_ROUND_H_5'
  | 'BUNDLE_V' | 'EVAL_V' | 'SUPP_V' | 'TUTOR_V' | 'REVIEW_V' | 'REVIEW_FAIL_V' | 'REVIEW_SUPP_V' | 'REVIEW_SUPP_FAIL_V'
  | 'SUPP_ROUND_V_1' | 'SUPP_ROUND_V_2' | 'SUPP_ROUND_V_3' | 'SUPP_ROUND_V_4' | 'SUPP_ROUND_V_5'
  | 'REVIEW_ROUND_V_1' | 'REVIEW_ROUND_V_2' | 'REVIEW_ROUND_V_3' | 'REVIEW_ROUND_V_4' | 'REVIEW_ROUND_V_5'
  | 'END';

// Optimized Adaptive Learning Manager
export class OptimizedAdaptiveLearningManager {
  private sessions: Map<string, Session> = new Map();
  private bundleCache: Map<string, Question[]> = new Map();
  private reviewCache: Map<string, ReviewSession> = new Map();

  createSession(studentName: string, grade: string): Session {
    const session: Session = {
      id: randomUUID(),
      student_name: studentName,
      grade: grade,
      current_state: 'INIT',
      current_difficulty: 'N',
      current_bundle: [],
      current_question_index: 0,
      answers: [],
      answers_by_difficulty: { 'N': [], 'H': [], 'V': [] },
      weak_lessons: [],
      asked_question_ids: new Set(),
      supplementary_bundles: {},
      supplementary_rounds: [],
      current_supplementary_round: 0,
      used_bundles: { 'N': [], 'H': [], 'V': [] },
      tutor_sessions: [],
      review_sessions: [],
      mastery_map: {},
      created_at: new Date(),
      updated_at: new Date()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, updates: Partial<Session>): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates, updated_at: new Date() };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  // Optimized bundle generation with caching
  async generateInitialBundle(difficulty: 'N' | 'H' | 'V', excludeIds: Set<string>): Promise<Question[]> {
    const cacheKey = `bundle_${difficulty}_${Array.from(excludeIds).sort().join(',')}`;
    
    // Check cache first
    const cached = this.bundleCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for bundle: ${cacheKey}`);
      return cached;
    }

    console.log(`Cache miss for bundle: ${cacheKey}`);
    
    const bundle: Question[] = [];
    const lessons = [1, 2, 3, 4, 5];

    // Parallel question generation for each lesson
    const questionPromises = lessons.map(async (lessonId) => {
      try {
        // Try to get existing questions first
        const availableQuestions = await optimizedQuestionDB.getAvailableQuestions(difficulty, [lessonId], excludeIds);
        
        if (availableQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableQuestions.length);
          const randomQuestion = availableQuestions[randomIndex]!;
          
          // Check if question has valid choices
          if (randomQuestion.choices && randomQuestion.choices.length >= 4) {
            return randomQuestion;
          }
        }

        // Generate backup question if needed
        console.log(`Generating backup question for lesson ${lessonId}, difficulty ${difficulty}`);
        const backupQuestions = await aiCacheManager.generateQuestionsWithCache(lessonId, difficulty, 1);
        
        if (backupQuestions.length > 0) {
          const backupQuestion = backupQuestions[0]!;
          return {
            id: backupQuestion.id,
            lesson_id: backupQuestion.lesson_id,
            difficulty: backupQuestion.difficulty as 'N' | 'H' | 'V',
            difficulty_name: backupQuestion.difficulty === 'N' ? 'Nhận biết' : 
                           backupQuestion.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng',
            content: backupQuestion.content,
            type: 'multiple_choice' as const,
            choices: backupQuestion.choices,
            correct_answer: backupQuestion.correct_answer,
            explanation: backupQuestion.explanation
          };
        }

        return null;
      } catch (error) {
        console.error(`Error generating question for lesson ${lessonId}:`, error);
        return null;
      }
    });

    // Wait for all questions to be generated
    const questions = await Promise.all(questionPromises);
    
    // Filter out null results
    const validQuestions = questions.filter(q => q !== null) as Question[];
    
    // Cache the result
    this.bundleCache.set(cacheKey, validQuestions);
    
    console.log(`Generated bundle with ${validQuestions.length} questions`);
    return validQuestions;
  }

  // Optimized evaluation with parallel processing
  evaluateBundle(sessionId: string, answers: Answer[]): { 
    score: number; 
    weakLessons: number[]; 
    nextState: SessionState;
    passed: boolean;
    wrongAnswers: Answer[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const correctAnswers = answers.filter(a => a.is_correct).length;
    const score = correctAnswers;
    const wrongAnswers = answers.filter(a => !a.is_correct);
    
    // Parallel processing for weak lessons identification
    const weakLessons = wrongAnswers
      .map(a => {
        const question = session.current_bundle.find(q => q.id === a.question_id);
        return question?.lesson_id;
      })
      .filter((lessonId): lessonId is number => lessonId !== undefined)
      .filter((lessonId, index, arr) => arr.indexOf(lessonId) === index); // Remove duplicates

    let nextState: SessionState;
    let passed = false;
    
    // Optimized state transition logic
    if (score >= 4) {
      passed = true;
      switch (session.current_difficulty) {
        case 'N': nextState = 'REVIEW_N'; break;
        case 'H': nextState = 'REVIEW_H'; break;
        case 'V': nextState = 'REVIEW_V'; break;
        default: nextState = 'END';
      }
    } else {
      passed = false;
      switch (session.current_difficulty) {
        case 'N': nextState = 'REVIEW_FAIL_N'; break;
        case 'H': nextState = 'REVIEW_FAIL_H'; break;
        case 'V': nextState = 'REVIEW_FAIL_V'; break;
        default: nextState = 'END';
      }
    }

    return { score, weakLessons, nextState, passed, wrongAnswers };
  }

  // Optimized supplementary bundle generation
  async generateSupplementaryBundle(sessionId: string, wrongAnswers: Answer[], difficulty: 'N' | 'H' | 'V'): Promise<Question[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Create cache key
    const wrongAnswerIds = wrongAnswers.map(a => a.question_id).sort();
    const bundleKey = wrongAnswerIds.join(',');
    
    // Check if already generated
    if (session.supplementary_bundles[bundleKey]) {
      return session.supplementary_bundles[bundleKey];
    }

    // Parallel generation for each wrong answer
    const supplementaryPromises = wrongAnswers.map(async (wrongAnswer) => {
      const originalQuestion = session.current_bundle.find(q => q.id === wrongAnswer.question_id);
      
      if (originalQuestion) {
        try {
          // Generate 2 supplementary questions in parallel
          const generatedQuestions = await aiCacheManager.generateQuestionsWithCache(
            originalQuestion.lesson_id, 
            difficulty, 
            2, 
            originalQuestion
          );
          
          return generatedQuestions.map(q => ({
            id: q.id,
            lesson_id: q.lesson_id,
            difficulty: q.difficulty as 'N' | 'H' | 'V',
            difficulty_name: q.difficulty === 'N' ? 'Nhận biết' : 
                           q.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng',
            content: q.content,
            type: 'multiple_choice' as const,
            choices: q.choices,
            correct_answer: q.correct_answer,
            explanation: q.explanation
          }));
        } catch (error) {
          console.error(`Error generating supplementary questions for ${wrongAnswer.question_id}:`, error);
          return [];
        }
      }
      return [];
    });

    // Wait for all supplementary questions
    const supplementaryResults = await Promise.all(supplementaryPromises);
    const supplementaryQuestions = supplementaryResults.flat();

    // Store in session
    session.supplementary_bundles[bundleKey] = supplementaryQuestions;
    supplementaryQuestions.forEach(q => session.asked_question_ids.add(q.id));

    console.log(`Generated ${supplementaryQuestions.length} supplementary questions`);
    return supplementaryQuestions;
  }

  // Generate isomorphic questions using OpenAI
  async generateIsomorphicQuestions(originalQuestion: Question, count: number = 5): Promise<Question[]> {
    try {
      if (!openaiEnabled || !openai) {
        console.log('OpenAI not available, using fallback questions');
        return this.generateFallbackQuestions(originalQuestion, count);
      }

      // Validate original question
      if (!originalQuestion.content || !originalQuestion.choices || originalQuestion.choices.length === 0) {
        console.log('Original question is invalid, using fallback questions');
        return this.generateFallbackQuestions(originalQuestion, count);
      }

      const prompt = `
Tạo ${count} câu hỏi isomorphic (cùng dạng, cùng độ khó) dựa trên câu hỏi mẫu sau:

Câu hỏi gốc:
- Nội dung: ${originalQuestion.content}
- Đáp án đúng: ${originalQuestion.choices[originalQuestion.correct_answer]}
- Giải thích: ${originalQuestion.explanation || 'Không có giải thích'}
- Độ khó: ${originalQuestion.difficulty_name}
- Bài: ${originalQuestion.lesson_id}

Yêu cầu:
1. Giữ nguyên dạng bài và độ khó
2. Thay đổi số liệu, biến số, hoặc ngữ cảnh
3. Đảm bảo độ khó tương đương
4. Mỗi câu hỏi phải có đầy đủ 4 đáp án A, B, C, D
5. **BẮT BUỘC**: Có lý thuyết chi tiết và giải thích đầy đủ
6. Sử dụng LaTeX cho công thức toán học trong $...$ hoặc $$...$$

Trả về dưới dạng JSON với format:
{
  "questions": [
    {
      "id": "generated_1",
      "lesson_id": ${originalQuestion.lesson_id},
      "difficulty": "${originalQuestion.difficulty}",
      "difficulty_name": "${originalQuestion.difficulty_name}",
      "content": "Nội dung câu hỏi mới (có thể có LaTeX)",
      "type": "multiple_choice",
      "choices": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correct_answer": 0,
      "theory": "Lý thuyết cần thiết để giải bài (có thể có LaTeX)",
      "explanation": "Giải thích chi tiết từng bước (có thể có LaTeX)"
    }
  ]
}
`;

      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia tạo câu hỏi toán học. Hãy tạo các câu hỏi isomorphic chất lượng cao, giữ nguyên độ khó và dạng bài nhưng thay đổi số liệu. Đảm bảo mỗi câu hỏi có đầy đủ 4 đáp án, lý thuyết chi tiết và giải thích từng bước. Sử dụng LaTeX để viết công thức toán học."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      const questions = result.questions || [];
      
      // Validate generated questions
      const validQuestions = questions.filter((q: any) => 
        q.content && 
        q.choices && 
        Array.isArray(q.choices) && 
        q.choices.length === 4 &&
        typeof q.correct_answer === 'number' &&
        q.correct_answer >= 0 &&
        q.correct_answer < 4
      );
      
      console.log(`Generated ${questions.length} questions, ${validQuestions.length} are valid`);
      
      if (validQuestions.length === 0) {
        console.log('No valid questions generated, using fallback');
        return this.generateFallbackQuestions(originalQuestion, count);
      }
      
      return validQuestions;
    } catch (error) {
      console.error('Error generating isomorphic questions:', error);
      return this.generateFallbackQuestions(originalQuestion, count);
    }
  }

  // Generate fallback questions when OpenAI fails
  private generateFallbackQuestions(originalQuestion: Question, count: number): Question[] {
    console.log(`Generating ${count} fallback questions for lesson ${originalQuestion.lesson_id}`);
    
    const topicMap: { [key: number]: string } = {
      1: "Tính đơn điệu và cực trị của hàm số",
      2: "Giá trị lớn nhất - nhỏ nhất của hàm số", 
      3: "Đường tiệm cận của đồ thị hàm số",
      4: "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
      5: "Ứng dụng đạo hàm và khảo sát hàm số để giải quyết bài toán thực tế"
    };
    
    const fallbackQuestions = [];
    for (let i = 0; i < count; i++) {
      fallbackQuestions.push({
        id: `fallback_${originalQuestion.lesson_id}_${Date.now()}_${i}`,
        lesson_id: originalQuestion.lesson_id,
        difficulty: originalQuestion.difficulty,
        difficulty_name: originalQuestion.difficulty_name,
        content: `[Fallback] Câu hỏi bổ sung ${i + 1} cho chủ đề bài ${originalQuestion.lesson_id}`,
        type: 'multiple_choice' as const,
        choices: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
        correct_answer: 0,
        theory: `Lý thuyết cơ bản về ${topicMap[originalQuestion.lesson_id] || 'chủ đề này'}: Cần được bổ sung bởi AI để có nội dung chi tiết.`,
        explanation: "Giải thích chi tiết: Câu hỏi fallback này cần được thay thế bằng câu hỏi thật từ AI với lý thuyết và giải thích đầy đủ."
      });
    }
    
    return fallbackQuestions;
  }

  // Optimized state transition processing
  async processStateTransition(sessionId: string, answers: Answer[]): Promise<{ 
    session: Session; 
    nextBundle?: Question[]; 
    needsTutor?: boolean;
    needsReview?: boolean;
    wrongAnswers?: Answer[];
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Add answers to session
    session.answers.push(...answers);
    session.answers_by_difficulty[session.current_difficulty].push(...answers);
    answers.forEach(a => session.asked_question_ids.add(a.question_id));

    let nextBundle: Question[] | undefined;
    let needsTutor = false;
    let needsReview = false;
    let wrongAnswers: Answer[] = [];

    // Optimized state processing
    switch (session.current_state) {
      case 'BUNDLE_N':
      case 'BUNDLE_H':
      case 'BUNDLE_V':
        const evaluation = this.evaluateBundle(sessionId, answers);
        session.current_state = evaluation.nextState;
        session.weak_lessons = evaluation.weakLessons;
        wrongAnswers = evaluation.wrongAnswers;

        if (evaluation.passed) {
          needsReview = true;
        } else {
          needsReview = true;
        }
        break;

      case 'SUPP_N':
      case 'SUPP_H':
      case 'SUPP_V':
        const suppEvaluation = this.evaluateBundle(sessionId, answers);
        needsReview = true;
        wrongAnswers = suppEvaluation.wrongAnswers;
        
        // Determine next state based on performance
        const totalSuppQuestions = answers.length;
        const correctSuppAnswers = suppEvaluation.score;
        const suppPercentage = (correctSuppAnswers / totalSuppQuestions) * 100;
        
        if (suppPercentage >= 80) {
          switch (session.current_difficulty) {
            case 'N': session.current_state = 'REVIEW_SUPP_N'; break;
            case 'H': session.current_state = 'REVIEW_SUPP_H'; break;
            case 'V': session.current_state = 'REVIEW_SUPP_V'; break;
          }
        } else {
          switch (session.current_difficulty) {
            case 'N': session.current_state = 'REVIEW_SUPP_FAIL_N'; break;
            case 'H': session.current_state = 'REVIEW_SUPP_FAIL_H'; break;
            case 'V': session.current_state = 'REVIEW_SUPP_FAIL_V'; break;
          }
        }
        break;

      case 'TUTOR_N':
      case 'TUTOR_H':
      case 'TUTOR_V':
        // Move to next difficulty after tutor
        const tutorDifficulty = session.current_difficulty;
        if (tutorDifficulty === 'N') {
          session.current_state = 'BUNDLE_H';
          session.current_difficulty = 'H';
          nextBundle = await this.generateInitialBundle('H', session.asked_question_ids);
        } else if (tutorDifficulty === 'H') {
          session.current_state = 'BUNDLE_V';
          session.current_difficulty = 'V';
          nextBundle = await this.generateInitialBundle('V', session.asked_question_ids);
        } else {
          session.current_state = 'END';
        }
        break;

      case 'REVIEW_N':
      case 'REVIEW_H':
      case 'REVIEW_V':
      case 'REVIEW_FAIL_N':
      case 'REVIEW_FAIL_H':
      case 'REVIEW_FAIL_V':
      case 'REVIEW_SUPP_N':
      case 'REVIEW_SUPP_H':
      case 'REVIEW_SUPP_V':
      case 'REVIEW_SUPP_FAIL_N':
      case 'REVIEW_SUPP_FAIL_H':
      case 'REVIEW_SUPP_FAIL_V':
        needsReview = true;
        break;
    }

    this.sessions.set(sessionId, session);
    return { session, nextBundle, needsTutor, needsReview, wrongAnswers };
  }

  // Generate detailed supplementary review session
  async generateDetailedSupplementaryReview(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<ReviewSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Get wrong answers from the current difficulty
    const difficultyAnswers = session.answers_by_difficulty[difficulty] || [];
    const wrongAnswers = difficultyAnswers.filter(a => !a.is_correct);

    if (wrongAnswers.length === 0) {
      throw new Error('No wrong answers found for detailed supplementary review');
    }

    // Generate detailed explanations for wrong questions
    const detailedExplanations = await this.generateDetailedExplanations(wrongAnswers);

    // Create lesson summary
    const lesson_summary: { [lesson: number]: any } = {};
    const topicMap: { [key: number]: string } = {
      1: "Tính đơn điệu và cực trị của hàm số",
      2: "Giá trị lớn nhất - nhỏ nhất của hàm số", 
      3: "Đường tiệm cận của đồ thị hàm số",
      4: "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
      5: "Ứng dụng đạo hàm và khảo sát hàm số để giải quyết bài toán thực tế"
    };

    // Calculate lesson statistics
    const lessonStats: { [lesson: number]: { total: number; correct: number; time_spent: number } } = {};
    
    for (const answer of difficultyAnswers) {
      const question = session.current_bundle.find(q => q.id === answer.question_id);
      if (question) {
        const lessonId = question.lesson_id;
        if (!lessonStats[lessonId]) {
          lessonStats[lessonId] = { total: 0, correct: 0, time_spent: 0 };
        }
        lessonStats[lessonId].total++;
        lessonStats[lessonId].time_spent += answer.time_spent;
        if (answer.is_correct) {
          lessonStats[lessonId].correct++;
        }
      }
    }

    for (const [lesson, stats] of Object.entries(lessonStats)) {
      const accuracy = (stats.correct / stats.total) * 100;
      const lessonNum = parseInt(lesson);
      
      lesson_summary[lessonNum] = {
        total_questions: stats.total,
        correct_answers: stats.correct,
        accuracy: accuracy,
        weak_topics: accuracy < 70 ? [topicMap[lessonNum]] : [],
        strong_topics: accuracy >= 80 ? [topicMap[lessonNum]] : []
      };
    }

    // Calculate overall performance
    const totalQuestions = difficultyAnswers.length;
    const correctAnswers = difficultyAnswers.filter(a => a.is_correct).length;
    const totalTimeSpent = difficultyAnswers.reduce((sum, a) => sum + a.time_spent, 0);

    // Generate recommendations using AI
    const recommendations = await aiCacheManager.generateRecommendationsWithCache(lesson_summary, difficulty);
    const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const nextDifficultyPreparation = await this.generateNextDifficultyPreparation(difficulty, overallAccuracy);

    const reviewSession: ReviewSession = {
      id: `detailed_supplementary_review_${sessionId}_${difficulty}_${Date.now()}`,
      difficulty,
      lesson_summary,
      overall_performance: {
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        accuracy: overallAccuracy,
        time_spent: totalTimeSpent
      },
      recommendations,
      next_difficulty_preparation: nextDifficultyPreparation,
      created_at: new Date()
    };

    // Store review session
    session.review_sessions.push(reviewSession);
    this.sessions.set(sessionId, session);

    return reviewSession;
  }

  // Generate detailed explanations for wrong questions
  private async generateDetailedExplanations(wrongQuestions: any[]): Promise<any[]> {
    try {
      const explanations = [];
      for (const question of wrongQuestions) {
        const explanation = {
          question_id: question.id,
          lesson_id: question.lesson_id,
          content: question.content,
          explanation: question.explanation || "Giải thích sẽ được cập nhật",
          theory_summary: "Lý thuyết liên quan sẽ được cập nhật",
          step_by_step_solution: "Lời giải từng bước sẽ được cập nhật"
        };
        explanations.push(explanation);
      }
      return explanations;
    } catch (error) {
      console.error('Error generating detailed explanations:', error);
      return wrongQuestions.map(q => ({
        question_id: q.id,
        lesson_id: q.lesson_id,
        content: q.content,
        explanation: q.explanation || "Giải thích sẽ được cập nhật",
        theory_summary: "Lý thuyết liên quan sẽ được cập nhật",
        step_by_step_solution: "Lời giải từng bước sẽ được cập nhật"
      }));
    }
  }

  // Optimized review session generation with caching
  async generateReviewSession(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<ReviewSession> {
    const cacheKey = `review_${sessionId}_${difficulty}`;
    
    // Check cache first
    const cached = this.reviewCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for review: ${cacheKey}`);
      return cached;
    }

    console.log(`Cache miss for review: ${cacheKey}`);

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Parallel processing for lesson analysis
    const lessonStats: { [lesson: number]: { total: number; correct: number; time_spent: number } } = {};
    let difficultyAnswers = session.answers_by_difficulty[difficulty] || [];

    // Check if this is a supplementary review
    const isSupplementaryReview = session.current_state?.startsWith('REVIEW_SUPP_');
    if (isSupplementaryReview) {
      difficultyAnswers = difficultyAnswers.filter(answer => 
        answer.question_id.startsWith('generated_')
      );
    }

    // Parallel processing for lesson statistics
    const lessonPromises = difficultyAnswers.map(async (answer) => {
      let question = null;
      
      // Try to find question in multiple sources
      question = session.current_bundle.find(q => q.id === answer.question_id);
      
      if (!question) {
        const bundle = session.used_bundles[difficulty];
        question = bundle?.find(q => q.id === answer.question_id);
      }
      
      if (!question) {
        for (const [key, suppBundle] of Object.entries(session.supplementary_bundles)) {
          question = suppBundle.find(q => q.id === answer.question_id);
          if (question) break;
        }
      }
      
      if (!question) {
        const lessonId = answer.question_id ? parseInt(answer.question_id.split('_')[1]) || 1 : 1;
        question = { lesson_id: lessonId, difficulty: difficulty };
      }
      
      return { answer, question };
    });

    const answerQuestionPairs = await Promise.all(lessonPromises);

    // Process results
    for (const { answer, question } of answerQuestionPairs) {
      if (question) {
        const lessonId = question.lesson_id;
        if (!lessonStats[lessonId]) {
          lessonStats[lessonId] = { total: 0, correct: 0, time_spent: 0 };
        }
        lessonStats[lessonId].total++;
        lessonStats[lessonId].time_spent += answer.time_spent;
        if (answer.is_correct) {
          lessonStats[lessonId].correct++;
        }
      }
    }

    // Create lesson summary
    const lesson_summary: { [lesson: number]: any } = {};
    const topicMap: { [key: number]: string } = {
      1: "Tính đơn điệu và cực trị của hàm số",
      2: "Giá trị lớn nhất - nhỏ nhất của hàm số", 
      3: "Đường tiệm cận của đồ thị hàm số",
      4: "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
      5: "Ứng dụng đạo hàm và khảo sát hàm số để giải quyết bài toán thực tế"
    };

    for (const [lesson, stats] of Object.entries(lessonStats)) {
      const accuracy = (stats.correct / stats.total) * 100;
      const lessonNum = parseInt(lesson);
      
      lesson_summary[lessonNum] = {
        total_questions: stats.total,
        correct_answers: stats.correct,
        accuracy: accuracy,
        weak_topics: accuracy < 70 ? [topicMap[lessonNum]] : [],
        strong_topics: accuracy >= 80 ? [topicMap[lessonNum]] : []
      };
    }

    // Calculate overall performance
    const totalQuestions = difficultyAnswers.length;
    const correctAnswers = difficultyAnswers.filter(a => a.is_correct).length;
    const totalTimeSpent = difficultyAnswers.reduce((sum, a) => sum + a.time_spent, 0);

    // Parallel AI generation for recommendations
    const [recommendations, nextDifficultyPreparation] = await Promise.all([
      aiCacheManager.generateRecommendationsWithCache(lesson_summary, difficulty),
      this.generateNextDifficultyPreparation(difficulty, (correctAnswers / totalQuestions) * 100)
    ]);

    const reviewSession: ReviewSession = {
      id: `review_${sessionId}_${difficulty}_${Date.now()}`,
      difficulty,
      lesson_summary,
      overall_performance: {
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
        time_spent: totalTimeSpent
      },
      recommendations,
      next_difficulty_preparation: nextDifficultyPreparation,
      created_at: new Date()
    };

    // Store review session
    session.review_sessions.push(reviewSession);
    this.reviewCache.set(cacheKey, reviewSession);
    this.sessions.set(sessionId, session);

    return reviewSession;
  }

  // Optimized next difficulty preparation
  private async generateNextDifficultyPreparation(currentDifficulty: string, accuracy: number): Promise<string[]> {
    try {
      const nextDifficulty = currentDifficulty === 'N' ? 'H' : currentDifficulty === 'H' ? 'V' : 'END';
      
      if (nextDifficulty === 'END') {
        return ["Chúc mừng bạn đã hoàn thành tất cả các độ khó!"];
      }

      // Use cached recommendations
      const lessonSummary = { overall_accuracy: accuracy };
      return await aiCacheManager.generateRecommendationsWithCache(lessonSummary, nextDifficulty);
    } catch (error) {
      console.error('Error generating next difficulty preparation:', error);
      return [
        "Ôn tập lại các khái niệm cơ bản",
        "Làm thêm bài tập để củng cố kiến thức",
        "Chuẩn bị tinh thần cho độ khó cao hơn"
      ];
    }
  }

  // Start bundle with optimization
  async startBundle(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<Question[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const bundle = await this.generateInitialBundle(difficulty, session.asked_question_ids);
    session.current_bundle = bundle;
    session.current_question_index = 0;
    session.current_difficulty = difficulty;
    session.current_state = `BUNDLE_${difficulty}` as SessionState;
    
    // Save bundle for review purposes
    session.used_bundles[difficulty] = [...bundle];
    console.log(`Saved bundle for difficulty ${difficulty}: ${bundle.length} questions`);

    this.sessions.set(sessionId, session);
    return bundle;
  }

  // Continue after review with optimization
  async continueAfterReview(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<{ session: Session; nextBundle?: Question[] }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    let nextBundle: Question[] | undefined;

    if (difficulty === 'N') {
      session.current_state = 'BUNDLE_H';
      session.current_difficulty = 'H';
      nextBundle = await this.generateInitialBundle('H', session.asked_question_ids);
      session.used_bundles['H'] = [...nextBundle];
      session.current_bundle = nextBundle;
      session.current_question_index = 0;
    } else if (difficulty === 'H') {
      session.current_state = 'BUNDLE_V';
      session.current_difficulty = 'V';
      nextBundle = await this.generateInitialBundle('V', session.asked_question_ids);
      session.used_bundles['V'] = [...nextBundle];
      session.current_bundle = nextBundle;
      session.current_question_index = 0;
    } else {
      session.current_state = 'END';
    }

    this.sessions.set(sessionId, session);
    return { session, nextBundle };
  }

  // Continue after fail review using new round system
  async continueAfterFailReview(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<{ session: Session; nextBundle?: Question[] }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    console.log('Continue after fail review - creating supplementary rounds:', {
      difficulty,
      currentState: session.current_state,
      currentDifficulty: session.current_difficulty
    });

    // Get the wrong answers from the initial bundle
    const initialBundleAnswers = session.answers_by_difficulty[difficulty] || [];
    const wrongAnswers = initialBundleAnswers.filter(a => !a.is_correct);

    console.log('WRONG ANSWERS DEBUG:', {
      total_answers: initialBundleAnswers.length,
      wrong_count: wrongAnswers.length,
      wrong_question_ids: wrongAnswers.map(a => a.question_id),
      all_answers: initialBundleAnswers.map(a => ({ 
        question_id: a.question_id, 
        is_correct: a.is_correct 
      }))
    });

    if (wrongAnswers.length === 0) {
      throw new Error('No wrong answers found for supplementary rounds');
    }

    // Generate supplementary rounds instead of single bundle
    await this.generateSupplementaryRounds(sessionId, wrongAnswers, difficulty);
    
    console.log(`After generateSupplementaryRounds: session.supplementary_rounds.length = ${session.supplementary_rounds.length}`);
    
    // Start first supplementary round
    session.current_state = `SUPP_ROUND_${difficulty}_1` as SessionState;
    session.current_supplementary_round = 0; // Will be incremented when getting first round
    
    console.log(`Before getCurrentSupplementaryRound: current_supplementary_round = ${session.current_supplementary_round}`);
    console.log(`First few rounds:`, session.supplementary_rounds.slice(0, 2).map(r => ({
      id: r.id, 
      round_number: r.round_number, 
      questions: r.supplementary_questions.length
    })));
    
    const firstRound = this.getCurrentSupplementaryRound(sessionId);
    console.log(`After getCurrentSupplementaryRound: firstRound = ${!!firstRound}, questions = ${firstRound?.supplementary_questions?.length || 0}`);
    
    const nextBundle = firstRound ? firstRound.supplementary_questions : [];

    session.current_bundle = nextBundle;
    session.current_question_index = 0;

    this.sessions.set(sessionId, session);
    return { session, nextBundle };
  }

  // Continue after supplementary review with optimization
  async continueAfterSupplementaryReview(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<{ session: Session; nextBundle?: Question[] }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    let nextBundle: Question[] | undefined;

    if (difficulty === 'H') {
      session.current_state = 'BUNDLE_H';
      session.current_difficulty = 'H';
      nextBundle = await this.generateInitialBundle('H', session.asked_question_ids);
      session.used_bundles['H'] = [...nextBundle];
      session.current_bundle = nextBundle;
      session.current_question_index = 0;
    } else if (difficulty === 'V') {
      session.current_state = 'BUNDLE_V';
      session.current_difficulty = 'V';
      nextBundle = await this.generateInitialBundle('V', session.asked_question_ids);
      session.used_bundles['V'] = [...nextBundle];
      session.current_bundle = nextBundle;
      session.current_question_index = 0;
    } else {
      // Should not reach here with valid difficulty values
      session.current_state = 'END';
    }

    this.sessions.set(sessionId, session);
    return { session, nextBundle };
  }

  // Generate mastery report with optimization
  generateMasteryReport(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const report: any = {
      session_id: sessionId,
      student_name: session.student_name,
      grade: session.grade,
      total_questions: session.answers.length,
      correct_answers: session.answers.filter(a => a.is_correct).length,
      accuracy: 0,
      mastery_map: {},
      weak_areas: [],
      recommendations: []
    };

    if (report.total_questions > 0) {
      report.accuracy = (report.correct_answers / report.total_questions) * 100;
    }

    // Analyze mastery by lesson and difficulty
    const lessonStats: { [lesson: number]: { [difficulty: string]: { total: number; correct: number } } } = {};
    
    for (const answer of session.answers) {
      const question = session.current_bundle.find(q => q.id === answer.question_id);
      if (question) {
        if (!lessonStats[question.lesson_id]) {
          lessonStats[question.lesson_id] = {};
        }
        if (!lessonStats[question.lesson_id][question.difficulty]) {
          lessonStats[question.lesson_id][question.difficulty] = { total: 0, correct: 0 };
        }
        lessonStats[question.lesson_id][question.difficulty].total++;
        if (answer.is_correct) {
          lessonStats[question.lesson_id][question.difficulty].correct++;
        }
      }
    }

    report.mastery_map = lessonStats;
    
    // Identify weak areas
    for (const [lesson, difficulties] of Object.entries(lessonStats)) {
      for (const [difficulty, stats] of Object.entries(difficulties)) {
        const accuracy = (stats.correct / stats.total) * 100;
        if (accuracy < 70) {
          report.weak_areas = report.weak_areas || [];
          report.weak_areas.push({
            lesson: parseInt(lesson),
            difficulty,
            accuracy,
            total_questions: stats.total,
            correct_answers: stats.correct
          });
        }
      }
    }

    // Generate recommendations
    if (report.weak_areas.length > 0) {
      report.recommendations = [
        "Tập trung ôn tập các bài có độ chính xác thấp",
        "Làm thêm bài tập bổ sung cho các chủ đề yếu"
      ];
    } else {
      report.recommendations = ["Tiếp tục học các chủ đề nâng cao"];
    }

    return report;
  }

  // Clear caches
  clearCaches(): void {
    this.bundleCache.clear();
    this.reviewCache.clear();
    aiCacheManager.clearCache();
  }

  // Get performance stats
  getPerformanceStats(): {
    sessions: number;
    bundleCache: number;
    reviewCache: number;
    aiCacheStats: any;
  } {
    return {
      sessions: this.sessions.size,
      bundleCache: this.bundleCache.size,
      reviewCache: this.reviewCache.size,
      aiCacheStats: aiCacheManager.getCacheStats()
    };
  }

  // ===== NEW ROUND-BASED SUPPLEMENTARY SYSTEM =====

  // Generate supplementary rounds for wrong answers (5 questions per round)
  async generateSupplementaryRounds(sessionId: string, wrongAnswers: Answer[], difficulty: 'N' | 'H' | 'V'): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    console.log(`Generating supplementary rounds for ${wrongAnswers.length} wrong answers`);
    
    const supplementaryRounds: SupplementaryRound[] = [];
    
    for (let i = 0; i < wrongAnswers.length; i++) {
      const wrongAnswer = wrongAnswers[i];
      const originalQuestion = session.current_bundle.find(q => q.id === wrongAnswer.question_id);
      
      if (originalQuestion) {
        console.log(`Creating round ${i + 1} for wrong answer ${wrongAnswer.question_id}`);
        
        try {
          // Generate 5 isomorphic questions for this wrong answer
          const generatedQuestions = await this.generateIsomorphicQuestions(originalQuestion, 5);
          console.log(`Generated ${generatedQuestions.length} questions for round ${i + 1}`);
          
          let supplementaryQuestions: Question[] = [];
          if (generatedQuestions.length >= 5) {
            supplementaryQuestions = generatedQuestions.slice(0, 5);
          } else {
            // If not enough questions generated, try fallback
            console.log(`Not enough questions generated, using fallback for round ${i + 1}`);
            supplementaryQuestions = generatedQuestions;
            
            // Try to generate more from topic using optimizedQuestionDB
            const topicQuestions = await optimizedQuestionDB.getAvailableQuestions(
              difficulty, 
              [originalQuestion.lesson_id], 
              session.asked_question_ids
            );
            const additionalConverted = topicQuestions.slice(0, 5 - supplementaryQuestions.length);
            supplementaryQuestions.push(...additionalConverted);
            
            // Final fallback: use backup generator
            if (supplementaryQuestions.length < 5) {
              const backupQuestions = await questionBackupGenerator.generateTopicQuestions(
                originalQuestion.lesson_id, 
                difficulty, 
                5 - supplementaryQuestions.length
              );
              
              const convertedQuestions: Question[] = backupQuestions.map(q => ({
                id: q.id,
                lesson_id: q.lesson_id,
                difficulty: q.difficulty as 'N' | 'H' | 'V',
                difficulty_name: q.difficulty === 'N' ? 'Nhận biết' : q.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng',
                content: q.content,
                type: 'multiple_choice',
                choices: q.choices,
                correct_answer: q.correct_answer,
                explanation: q.explanation
              }));
              
              supplementaryQuestions.push(...convertedQuestions);
            }
          }
          
          // Create round
          const finalQuestions = supplementaryQuestions.slice(0, 5);
          console.log(`Round ${i + 1}: Generated ${supplementaryQuestions.length} questions, using ${finalQuestions.length} questions`);
          
          if (finalQuestions.length < 5) {
            console.warn(`WARNING: Round ${i + 1} has only ${finalQuestions.length} questions instead of 5!`);
            
            // Try to fill with more questions from same lesson/difficulty
            try {
              const usedIds = new Set([...Array.from(session.asked_question_ids), ...finalQuestions.map(q => q.id)]);
              const additionalQuestions = await optimizedQuestionDB.getAvailableQuestions(
                difficulty,
                [originalQuestion.lesson_id],
                usedIds
              );
              
              const neededCount = 5 - finalQuestions.length;
              const extraQuestions = additionalQuestions.slice(0, neededCount);
              finalQuestions.push(...extraQuestions);
              
              console.log(`Added ${extraQuestions.length} more questions. Total: ${finalQuestions.length}`);
              
              // If still not enough, duplicate existing questions with modified IDs
              while (finalQuestions.length < 5 && finalQuestions.length > 0) {
                const sourceQuestion = finalQuestions[finalQuestions.length % finalQuestions.length];
                const duplicatedQuestion: Question = {
                  ...sourceQuestion,
                  id: `${sourceQuestion.id}_dup_${finalQuestions.length}`,
                  content: `[Câu bổ sung] ${sourceQuestion.content}`
                };
                finalQuestions.push(duplicatedQuestion);
                console.log(`Duplicated question to reach 5 total. Current: ${finalQuestions.length}`);
              }
            } catch (error) {
              console.error('Error adding additional questions:', error);
            }
          }
          
          // Final safety check
          if (finalQuestions.length === 0) {
            console.error(`ERROR: Round ${i + 1} has 0 questions! Skipping round.`);
            continue;
          }
          
          const round: SupplementaryRound = {
            id: randomUUID(),
            round_number: i + 1,
            original_question: originalQuestion,
            supplementary_questions: finalQuestions,
            round_answers: [],
            round_completed: false,
            created_at: new Date()
          };
          
          supplementaryRounds.push(round);
          console.log(`✅ Created round ${i + 1} for wrong answer ${wrongAnswer.question_id} with ${round.supplementary_questions.length} questions`);
          
        } catch (error) {
          console.error(`Error generating round ${i + 1}:`, error);
          // Create empty round on error
          const round: SupplementaryRound = {
            id: randomUUID(),
            round_number: i + 1,
            original_question: originalQuestion,
            supplementary_questions: [],
            round_answers: [],
            round_completed: false,
            created_at: new Date()
          };
          supplementaryRounds.push(round);
        }
      }
    }
    
    // Store rounds in session
    session.supplementary_rounds = supplementaryRounds;
    session.current_supplementary_round = 0; // Will be incremented when starting first round
    
    this.sessions.set(sessionId, session);
    console.log(`Generated ${supplementaryRounds.length} supplementary rounds total`);
  }

  // Get current supplementary round
  getCurrentSupplementaryRound(sessionId: string): SupplementaryRound | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.supplementary_rounds || session.supplementary_rounds.length === 0) {
      console.log(`getCurrentSupplementaryRound: session=${!!session}, rounds=${session?.supplementary_rounds?.length || 0}`);
      return null;
    }
    
    const currentIndex = session.current_supplementary_round;
    console.log(`getCurrentSupplementaryRound: currentIndex=${currentIndex}, totalRounds=${session.supplementary_rounds.length}`);
    
    if (currentIndex >= session.supplementary_rounds.length) {
      console.log(`getCurrentSupplementaryRound: currentIndex ${currentIndex} >= totalRounds ${session.supplementary_rounds.length}`);
      return null;
    }
    
    const round = session.supplementary_rounds[currentIndex];
    console.log(`getCurrentSupplementaryRound: found round ${round?.round_number || 'undefined'} with ${round?.supplementary_questions?.length || 0} questions`);
    
    return round;
  }

  // Submit answers for current supplementary round
  async submitSupplementaryRoundAnswers(sessionId: string, answers: Answer[]): Promise<SupplementaryRound> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    const currentRound = this.getCurrentSupplementaryRound(sessionId);
    if (!currentRound) throw new Error('No current supplementary round');
    
    console.log('submitSupplementaryRoundAnswers DEBUG:', {
      sessionId,
      current_round_number: currentRound.round_number,
      submitted_answers_count: answers.length,
      round_questions_count: currentRound.supplementary_questions.length,
      current_supplementary_round: session.current_supplementary_round,
      total_rounds: session.supplementary_rounds.length
    });
    
    // Store answers in the round
    currentRound.round_answers = answers;
    currentRound.round_completed = true;
    
    // Also store in session.answers for compatibility
    session.answers.push(...answers);
    
    this.sessions.set(sessionId, session);
    return currentRound;
  }

  // Move to next supplementary round
  moveToNextSupplementaryRound(sessionId: string): SupplementaryRound | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    session.current_supplementary_round++;
    this.sessions.set(sessionId, session);
    
    return this.getCurrentSupplementaryRound(sessionId);
  }

  // Generate individual round review
  async generateSupplementaryRoundReview(sessionId: string, roundId: string): Promise<ReviewSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    const round = session.supplementary_rounds.find(r => r.id === roundId);
    if (!round) throw new Error('Round not found');
    
    console.log(`Generating review for round ${round.round_number}`);
    
    // Analyze round performance
    const wrongAnswers = round.round_answers.filter(a => !a.is_correct);
    const correctAnswers = round.round_answers.filter(a => a.is_correct);
    
    // Create lesson summary for this specific round
    const lesson_summary: { [lesson: number]: any } = {};
    const lessonId = round.original_question.lesson_id;
    
    const topicMap: { [key: number]: string } = {
      1: "Tính đơn điệu và cực trị của hàm số",
      2: "Giá trị lớn nhất - nhỏ nhất của hàm số", 
      3: "Đường tiệm cận của đồ thị hàm số",
      4: "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
      5: "Ứng dụng đạo hàm và khảo sát hàm số để giải quyết bài toán thực tế"
    };
    
    lesson_summary[lessonId] = {
      total_questions: round.round_answers.length,
      correct_answers: correctAnswers.length,
      accuracy: round.round_answers.length > 0 ? (correctAnswers.length / round.round_answers.length) * 100 : 0,
      weak_topics: wrongAnswers.length > 0 ? [topicMap[lessonId]] : [],
      strong_topics: correctAnswers.length > 0 ? [topicMap[lessonId]] : [],
      original_question: {
        content: round.original_question.content,
        explanation: round.original_question.explanation
      },
      detailed_explanations: await this.generateDetailedExplanationsForRound(round, wrongAnswers)
    };
    
    // Generate recommendations for this round
    const recommendations = await this.generateRoundRecommendations(round, wrongAnswers.length > 0);
    
    const reviewSession: ReviewSession = {
      id: randomUUID(),
      difficulty: session.current_difficulty,
      lesson_summary,
      overall_performance: {
        total_questions: round.round_answers.length,
        correct_answers: correctAnswers.length,
        accuracy: round.round_answers.length > 0 ? (correctAnswers.length / round.round_answers.length) * 100 : 0,
        time_spent: round.round_answers.reduce((sum, a) => sum + a.time_spent, 0)
      },
      recommendations,
      next_difficulty_preparation: [
        `Hoàn thành các vòng bổ sung còn lại`,
        `Ôn luyện lý thuyết về ${topicMap[lessonId]}`,
        `Chuẩn bị cho độ khó tiếp theo`
      ],
      created_at: new Date()
    };
    
    // Store review session
    session.review_sessions.push(reviewSession);
    this.sessions.set(sessionId, session);
    
    return reviewSession;
  }

  // Helper method for generating detailed explanations for round
  private async generateDetailedExplanationsForRound(round: SupplementaryRound, wrongAnswers: Answer[]): Promise<any[]> {
    if (wrongAnswers.length === 0) return [];
    
    const explanations = [];
    
    for (const wrongAnswer of wrongAnswers) {
      const question = round.supplementary_questions.find(q => q.id === wrongAnswer.question_id);
      if (question) {
        explanations.push({
          question_id: question.id,
          question_content: question.content,
          student_answer: wrongAnswer.student_answer,
          correct_answer: question.correct_answer,
          explanation: question.explanation || "Giải thích cần được bổ sung",
          theory_reference: question.theory || `Lý thuyết: ${round.original_question.explanation || "Lý thuyết cần được bổ sung"}`
        });
      }
    }
    
    return explanations;
  }

  // Helper method for generating round recommendations
  private async generateRoundRecommendations(round: SupplementaryRound, hasWrongAnswers: boolean): Promise<string[]> {
    const baseRecommendations = [
      `Vòng ${round.round_number}: Bạn đã hoàn thành ${round.supplementary_questions.length} câu hỏi bổ sung`,
      `Chủ đề gốc: ${round.original_question.content.substring(0, 50)}...`
    ];
    
    if (hasWrongAnswers) {
      baseRecommendations.push(
        `Cần ôn lại lý thuyết cho chủ đề này`,
        `Luyện thêm các dạng bài tương tự`,
        `Xem lại lời giải chi tiết cho câu gốc`
      );
    } else {
      baseRecommendations.push(
        `Bạn đã nắm vững chủ đề này!`,
        `Tiếp tục với vòng tiếp theo`
      );
    }
    
    return baseRecommendations;
  }

  // Continue after round review
  async continueAfterRoundReview(sessionId: string): Promise<{ hasMoreRounds: boolean; nextRound?: SupplementaryRound; completed?: boolean }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    console.log('continueAfterRoundReview DEBUG:', {
      sessionId,
      current_supplementary_round: session.current_supplementary_round,
      total_rounds: session.supplementary_rounds?.length || 0,
      round_states: session.supplementary_rounds?.map((r, i) => ({
        index: i,
        id: r.id,
        round_number: r.round_number,
        questions_count: r.supplementary_questions?.length || 0,
        round_completed: r.round_completed
      }))
    });
    
    // Move to next round
    const nextRound = this.moveToNextSupplementaryRound(sessionId);
    
    console.log('moveToNextSupplementaryRound returned:', nextRound ? {
      id: nextRound.id,
      round_number: nextRound.round_number,
      questions_count: nextRound.supplementary_questions?.length || 0
    } : null);
    
    if (nextRound) {
      // Update state for next round
      const roundNumber = nextRound.round_number;
      const difficulty = session.current_difficulty;
      session.current_state = `SUPP_ROUND_${difficulty}_${roundNumber}` as SessionState;
      session.current_bundle = nextRound.supplementary_questions;
      session.current_question_index = 0;
      
      this.sessions.set(sessionId, session);
      
      return { hasMoreRounds: true, nextRound };
    } else {
      // All rounds completed - ready for final review or next difficulty
      session.current_state = `REVIEW_SUPP_${session.current_difficulty}` as SessionState;
      this.sessions.set(sessionId, session);
      
      console.log('All rounds completed - setting completed: true');
      return { hasMoreRounds: false, completed: true };
    }
  }

}

// Export singleton instance
export const optimizedAdaptiveLearningManager = new OptimizedAdaptiveLearningManager();
