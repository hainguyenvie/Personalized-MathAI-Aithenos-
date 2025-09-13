import OpenAI from "openai";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for the adaptive learning system
export interface Question {
  id: string;
  lesson_id: number;
  difficulty: 'N' | 'H' | 'V';
  difficulty_name: string;
  content: string;
  type: 'multiple_choice';
  choices: string[];
  correct_answer: number;
  explanation: string;
  topic?: string;
  problem_type?: string;
}

export interface Session {
  id: string;
  student_name: string;
  grade: string;
  current_state: SessionState;
  current_difficulty: 'N' | 'H' | 'V';
  current_bundle: Question[];
  current_question_index: number;
  answers: Answer[];
  weak_lessons: number[];
  asked_question_ids: Set<string>;
  supplementary_bundles: { [lesson: number]: Question[] };
  tutor_sessions: TutorSession[];
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
  lesson_id: number;
  difficulty: 'N' | 'H' | 'V';
  problem_type: string;
  hints_used: number;
  max_hints: number;
  current_step: number;
  completed: boolean;
  retest_questions: Question[];
  retest_answers: Answer[];
}

export type SessionState = 
  | 'INIT'
  | 'BUNDLE_N' | 'EVAL_N' | 'SUPP_N' | 'TUTOR_N'
  | 'BUNDLE_H' | 'EVAL_H' | 'SUPP_H' | 'TUTOR_H'
  | 'BUNDLE_V' | 'EVAL_V' | 'SUPP_V' | 'TUTOR_V'
  | 'END';

// Question database loader
export class QuestionDatabase {
  private questions: Question[] = [];
  private questionsByLesson: { [lesson: number]: Question[] } = {};
  private questionsByDifficulty: { [difficulty: string]: Question[] } = {};

  constructor() {
    this.loadQuestions();
  }

  private loadQuestions() {
    try {
      const dataPath = path.join(process.cwd(), 'data_adaptive_learn', 'questions_indexed.json');
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      this.questions = data.questions;
      this.indexQuestions();
    } catch (error) {
      console.error('Error loading questions:', error);
      this.questions = [];
    }
  }

  private indexQuestions() {
    // Index by lesson
    this.questionsByLesson = {};
    this.questions.forEach(q => {
      if (!this.questionsByLesson[q.lesson_id]) {
        this.questionsByLesson[q.lesson_id] = [];
      }
      this.questionsByLesson[q.lesson_id].push(q);
    });

    // Index by difficulty
    this.questionsByDifficulty = {};
    this.questions.forEach(q => {
      if (!this.questionsByDifficulty[q.difficulty]) {
        this.questionsByDifficulty[q.difficulty] = [];
      }
      this.questionsByDifficulty[q.difficulty].push(q);
    });
  }

  getQuestionsByLesson(lessonId: number): Question[] {
    return this.questionsByLesson[lessonId] || [];
  }

  getQuestionsByDifficulty(difficulty: string): Question[] {
    return this.questionsByDifficulty[difficulty] || [];
  }

  getAvailableQuestions(difficulty: string, lessonIds: number[], excludeIds: Set<string>): Question[] {
    return this.questions.filter(q => 
      q.difficulty === difficulty && 
      lessonIds.includes(q.lesson_id) && 
      !excludeIds.has(q.id)
    );
  }

  getAllQuestions(): Question[] {
    return this.questions;
  }
}

// AI Question Generator
export class AIQuestionGenerator {
  private questionDB: QuestionDatabase;

  constructor(questionDB: QuestionDatabase) {
    this.questionDB = questionDB;
  }

  async generateIsomorphicQuestions(originalQuestion: Question, count: number = 5): Promise<Question[]> {
    try {
      const prompt = `
Tạo ${count} câu hỏi isomorphic (cùng dạng, cùng độ khó) dựa trên câu hỏi mẫu sau:

Câu hỏi gốc:
- Nội dung: ${originalQuestion.content}
- Đáp án đúng: ${originalQuestion.choices[originalQuestion.correct_answer]}
- Giải thích: ${originalQuestion.explanation}
- Độ khó: ${originalQuestion.difficulty_name}
- Bài: ${originalQuestion.lesson_id}

Yêu cầu:
1. Giữ nguyên dạng bài và độ khó
2. Thay đổi số liệu, biến số, hoặc ngữ cảnh
3. Đảm bảo độ khó tương đương
4. Trả về dưới dạng JSON với format:
{
  "questions": [
    {
      "id": "generated_1",
      "lesson_id": ${originalQuestion.lesson_id},
      "difficulty": "${originalQuestion.difficulty}",
      "difficulty_name": "${originalQuestion.difficulty_name}",
      "content": "Nội dung câu hỏi mới",
      "type": "multiple_choice",
      "choices": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Giải thích chi tiết"
    }
  ]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia tạo câu hỏi toán học. Hãy tạo các câu hỏi isomorphic chất lượng cao, giữ nguyên độ khó và dạng bài nhưng thay đổi số liệu."
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
      return result.questions || [];
    } catch (error) {
      console.error('Error generating isomorphic questions:', error);
      return [];
    }
  }

  async generateSupplementaryQuestions(weakLessons: number[], difficulty: string, problemTypes: string[], excludeIds: Set<string>): Promise<Question[]> {
    try {
      // Get sample questions from weak lessons
      const sampleQuestions = this.questionDB.getAvailableQuestions(difficulty, weakLessons, excludeIds);
      
      if (sampleQuestions.length === 0) {
        return [];
      }

      // Group by problem type if available
      const questionsByType = new Map<string, Question[]>();
      sampleQuestions.forEach(q => {
        const type = q.problem_type || 'general';
        if (!questionsByType.has(type)) {
          questionsByType.set(type, []);
        }
        questionsByType.get(type)!.push(q);
      });

      // Generate supplementary questions
      const supplementaryQuestions: Question[] = [];
      
      for (const [problemType, questions] of questionsByType) {
        if (questions.length > 0) {
          const sampleQuestion = questions[0];
          const generated = await this.generateIsomorphicQuestions(sampleQuestion, Math.min(2, 5 - supplementaryQuestions.length));
          supplementaryQuestions.push(...generated);
          
          if (supplementaryQuestions.length >= 5) break;
        }
      }

      return supplementaryQuestions.slice(0, 5);
    } catch (error) {
      console.error('Error generating supplementary questions:', error);
      return [];
    }
  }
}

// Adaptive Learning Session Manager
export class AdaptiveLearningManager {
  private questionDB: QuestionDatabase;
  private aiGenerator: AIQuestionGenerator;
  private sessions: Map<string, Session> = new Map();

  constructor() {
    this.questionDB = new QuestionDatabase();
    this.aiGenerator = new AIQuestionGenerator(this.questionDB);
  }

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
      weak_lessons: [],
      asked_question_ids: new Set(),
      supplementary_bundles: {},
      tutor_sessions: [],
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

  // Generate initial bundle (5 questions covering all 5 lessons)
  generateInitialBundle(difficulty: 'N' | 'H' | 'V', excludeIds: Set<string>): Question[] {
    const bundle: Question[] = [];
    const lessons = [1, 2, 3, 4, 5];

    for (const lessonId of lessons) {
      const availableQuestions = this.questionDB.getAvailableQuestions(difficulty, [lessonId], excludeIds);
      if (availableQuestions.length > 0) {
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        bundle.push(randomQuestion);
        excludeIds.add(randomQuestion.id);
      }
    }

    return bundle;
  }

  // Evaluate answers and determine next state
  evaluateBundle(sessionId: string, answers: Answer[]): { score: number; weakLessons: number[]; nextState: SessionState } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const correctAnswers = answers.filter(a => a.is_correct).length;
    const score = correctAnswers;
    const weakLessons = answers
      .filter(a => !a.is_correct)
      .map(a => {
        const question = session.current_bundle.find(q => q.id === a.question_id);
        return question?.lesson_id;
      })
      .filter((lessonId): lessonId is number => lessonId !== undefined)
      .filter((lessonId, index, arr) => arr.indexOf(lessonId) === index); // Remove duplicates

    let nextState: SessionState;
    
    if (score >= 4) {
      // Passed, move to next difficulty
      switch (session.current_difficulty) {
        case 'N':
          nextState = 'BUNDLE_H';
          break;
        case 'H':
          nextState = 'BUNDLE_V';
          break;
        case 'V':
          nextState = 'END';
          break;
        default:
          nextState = 'END';
      }
    } else {
      // Failed, need supplementary questions
      switch (session.current_difficulty) {
        case 'N':
          nextState = 'SUPP_N';
          break;
        case 'H':
          nextState = 'SUPP_H';
          break;
        case 'V':
          nextState = 'SUPP_V';
          break;
        default:
          nextState = 'END';
      }
    }

    return { score, weakLessons, nextState };
  }

  // Generate supplementary bundle
  async generateSupplementaryBundle(sessionId: string, weakLessons: number[], difficulty: 'N' | 'H' | 'V'): Promise<Question[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Check if we already generated supplementary questions for these lessons
    const bundleKey = weakLessons.sort().join(',');
    if (session.supplementary_bundles[bundleKey]) {
      return session.supplementary_bundles[bundleKey];
    }

    // Generate new supplementary questions
    const supplementaryQuestions = await this.aiGenerator.generateSupplementaryQuestions(
      weakLessons,
      difficulty,
      [], // problem types - can be enhanced later
      session.asked_question_ids
    );

    // Store in session
    session.supplementary_bundles[bundleKey] = supplementaryQuestions;
    supplementaryQuestions.forEach(q => session.asked_question_ids.add(q.id));

    return supplementaryQuestions;
  }

  // Process state transitions
  async processStateTransition(sessionId: string, answers: Answer[]): Promise<{ session: Session; nextBundle?: Question[]; needsTutor?: boolean }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Add answers to session
    session.answers.push(...answers);
    answers.forEach(a => session.asked_question_ids.add(a.question_id));

    let nextBundle: Question[] | undefined;
    let needsTutor = false;

    switch (session.current_state) {
      case 'BUNDLE_N':
      case 'BUNDLE_H':
      case 'BUNDLE_V':
        const evaluation = this.evaluateBundle(sessionId, answers);
        session.current_state = evaluation.nextState;
        session.weak_lessons = evaluation.weakLessons;

        if (evaluation.score < 4) {
          // Need supplementary questions
          nextBundle = await this.generateSupplementaryBundle(sessionId, evaluation.weakLessons, session.current_difficulty);
        } else {
          // Move to next difficulty
          if (session.current_state === 'BUNDLE_H') {
            session.current_difficulty = 'H';
            nextBundle = this.generateInitialBundle('H', session.asked_question_ids);
          } else if (session.current_state === 'BUNDLE_V') {
            session.current_difficulty = 'V';
            nextBundle = this.generateInitialBundle('V', session.asked_question_ids);
          }
        }
        break;

      case 'SUPP_N':
      case 'SUPP_H':
      case 'SUPP_V':
        const suppEvaluation = this.evaluateBundle(sessionId, answers);
        
        if (suppEvaluation.score >= 4) {
          // Passed supplementary, return to main flow
          if (session.current_difficulty === 'N') {
            session.current_state = 'BUNDLE_H';
            session.current_difficulty = 'H';
            nextBundle = this.generateInitialBundle('H', session.asked_question_ids);
          } else if (session.current_difficulty === 'H') {
            session.current_state = 'BUNDLE_V';
            session.current_difficulty = 'V';
            nextBundle = this.generateInitialBundle('V', session.asked_question_ids);
          } else {
            session.current_state = 'END';
          }
        } else {
          // Still failing, need tutor
          needsTutor = true;
          session.current_state = session.current_state.replace('SUPP', 'TUTOR') as SessionState;
        }
        break;

      case 'TUTOR_N':
      case 'TUTOR_H':
      case 'TUTOR_V':
        // Tutor session completed, generate retest questions
        const retestQuestions = await this.generateRetestQuestions(sessionId);
        nextBundle = retestQuestions;
        break;
    }

    this.sessions.set(sessionId, session);
    return { session, nextBundle, needsTutor };
  }

  // Generate retest questions after tutor session
  async generateRetestQuestions(sessionId: string): Promise<Question[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Get the most recent tutor session
    const lastTutorSession = session.tutor_sessions[session.tutor_sessions.length - 1];
    if (!lastTutorSession) return [];

    // Find a sample question from the weak lesson
    const sampleQuestions = this.questionDB.getAvailableQuestions(
      session.current_difficulty,
      [lastTutorSession.lesson_id],
      session.asked_question_ids
    );

    if (sampleQuestions.length === 0) return [];

    // Generate isomorphic questions
    const retestQuestions = await this.aiGenerator.generateIsomorphicQuestions(sampleQuestions[0], 5);
    
    // Store retest questions in tutor session
    lastTutorSession.retest_questions = retestQuestions;
    retestQuestions.forEach(q => session.asked_question_ids.add(q.id));

    return retestQuestions;
  }

  // Start a new bundle
  startBundle(sessionId: string, difficulty: 'N' | 'H' | 'V'): Question[] {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const bundle = this.generateInitialBundle(difficulty, session.asked_question_ids);
    session.current_bundle = bundle;
    session.current_question_index = 0;
    session.current_difficulty = difficulty;
    session.current_state = `BUNDLE_${difficulty}` as SessionState;

    this.sessions.set(sessionId, session);
    return bundle;
  }

  // Generate mastery report
  generateMasteryReport(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const report = {
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
    
    session.answers.forEach(answer => {
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
    });

    // Generate mastery heatmap
    report.mastery_map = lessonStats;
    
    // Identify weak areas
    Object.entries(lessonStats).forEach(([lesson, difficulties]) => {
      Object.entries(difficulties).forEach(([difficulty, stats]) => {
        const accuracy = (stats.correct / stats.total) * 100;
        if (accuracy < 70) {
          report.weak_areas.push({
            lesson: parseInt(lesson),
            difficulty,
            accuracy,
            total_questions: stats.total,
            correct_answers: stats.correct
          });
        }
      });
    });

    // Generate recommendations
    if (report.weak_areas.length > 0) {
      report.recommendations.push("Tập trung ôn tập các bài có độ chính xác thấp");
      report.recommendations.push("Làm thêm bài tập bổ sung cho các chủ đề yếu");
    } else {
      report.recommendations.push("Tiếp tục học các chủ đề nâng cao");
    }

    return report;
  }
}

// Export singleton instance
export const adaptiveLearningManager = new AdaptiveLearningManager();
