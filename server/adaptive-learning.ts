import OpenAI from "openai";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { questionBackupGenerator, BackupQuestion } from "./question-backup";

// Initialize OpenAI client only if the API key is present
const apiKey = process.env.OPENAI_API_KEY;
const openaiEnabled = Boolean(apiKey);
const openai = openaiEnabled ? new OpenAI({ apiKey }) : null;

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
  answers_by_difficulty: { [difficulty: string]: Answer[] };
  weak_lessons: number[];
  asked_question_ids: Set<string>;
  supplementary_bundles: { [key: string]: Question[] };
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
  | 'BUNDLE_H' | 'EVAL_H' | 'SUPP_H' | 'TUTOR_H' | 'REVIEW_H' | 'REVIEW_FAIL_H' | 'REVIEW_SUPP_H' | 'REVIEW_SUPP_FAIL_H'
  | 'BUNDLE_V' | 'EVAL_V' | 'SUPP_V' | 'TUTOR_V' | 'REVIEW_V' | 'REVIEW_FAIL_V' | 'REVIEW_SUPP_V' | 'REVIEW_SUPP_FAIL_V'
  | 'END';

// New state flow logic:
// INIT -> BUNDLE_N -> EVAL_N -> (REVIEW_N -> BUNDLE_H) | (REVIEW_FAIL_N -> SUPP_N -> EVAL_SUPP_N -> REVIEW_SUPP_N -> BUNDLE_H) | (TUTOR_N -> BUNDLE_H)
// BUNDLE_H -> EVAL_H -> (REVIEW_H -> BUNDLE_V) | (REVIEW_FAIL_H -> SUPP_H -> EVAL_SUPP_H -> REVIEW_SUPP_H -> BUNDLE_V) | (TUTOR_H -> BUNDLE_V)
// BUNDLE_V -> EVAL_V -> (REVIEW_V -> END) | (REVIEW_FAIL_V -> SUPP_V -> EVAL_SUPP_V -> REVIEW_SUPP_V -> END) | (TUTOR_V -> END)

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
      console.log('Loading questions from:', dataPath);
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      this.questions = data.questions;
      console.log('Loaded', this.questions.length, 'questions');
      
      // Debug: Check first few questions
      this.questions.slice(0, 3).forEach((q, i) => {
        console.log(`Question ${i + 1}:`, {
          id: q.id,
          difficulty: q.difficulty,
          lesson_id: q.lesson_id,
          choices: q.choices?.length || 0,
          content: q.content?.substring(0, 50) + '...'
        });
      });
      
      this.indexQuestions();
    } catch (error) {
      console.error('Error loading questions:', error);
      this.questions = [];
    }
  }

  private indexQuestions() {
    // Index by lesson
    this.questionsByLesson = {};
    for (const q of this.questions) {
      if (!this.questionsByLesson[q.lesson_id]) {
        this.questionsByLesson[q.lesson_id] = [];
      }
      this.questionsByLesson[q.lesson_id].push(q);
    }

    // Index by difficulty
    this.questionsByDifficulty = {};
    for (const q of this.questions) {
      if (!this.questionsByDifficulty[q.difficulty]) {
        this.questionsByDifficulty[q.difficulty] = [];
      }
      this.questionsByDifficulty[q.difficulty].push(q);
    }
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
5. Trả về dưới dạng JSON với format:
{
  "questions": [
    {
      "id": "generated_1",
      "lesson_id": ${originalQuestion.lesson_id},
      "difficulty": "${originalQuestion.difficulty}",
      "difficulty_name": "${originalQuestion.difficulty_name}",
      "content": "Nội dung câu hỏi mới",
      "type": "multiple_choice",
      "choices": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correct_answer": 0,
      "explanation": "Giải thích chi tiết"
    }
  ]
}
`;

      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia tạo câu hỏi toán học. Hãy tạo các câu hỏi isomorphic chất lượng cao, giữ nguyên độ khó và dạng bài nhưng thay đổi số liệu. Đảm bảo mỗi câu hỏi có đầy đủ 4 đáp án."
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

  // Fallback method when OpenAI is not available
  private generateFallbackQuestions(originalQuestion: Question, count: number): Question[] {
    const fallbackQuestions: Question[] = [];
    
    // Ensure we have valid choices
    const baseChoices = originalQuestion.choices && originalQuestion.choices.length >= 4 
      ? originalQuestion.choices 
      : ['A', 'B', 'C', 'D'];
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      fallbackQuestions.push({
        id: `fallback_${originalQuestion.id}_${i + 1}`,
        lesson_id: originalQuestion.lesson_id,
        difficulty: originalQuestion.difficulty,
        difficulty_name: originalQuestion.difficulty_name,
        content: `${originalQuestion.content} (Câu hỏi tương tự ${i + 1})`,
        type: 'multiple_choice',
        choices: baseChoices,
        correct_answer: originalQuestion.correct_answer || 0,
        explanation: originalQuestion.explanation || 'Giải thích sẽ được cập nhật'
      });
    }
    
    console.log(`Generated ${fallbackQuestions.length} fallback questions`);
    return fallbackQuestions;
  }

  async generateSupplementaryQuestions(weakLessons: number[], difficulty: string, problemTypes: string[], excludeIds: Set<string>): Promise<Question[]> {
    try {
      console.log(`Generating supplementary questions for lessons: ${weakLessons.join(', ')}, difficulty: ${difficulty}`);
      
      // Get sample questions from weak lessons
      const sampleQuestions = this.questionDB.getAvailableQuestions(difficulty, weakLessons, excludeIds);
      console.log(`Found ${sampleQuestions.length} sample questions`);
      
      if (sampleQuestions.length === 0) {
        console.log('No sample questions found, trying to get any questions for these lessons');
        // Try to get any questions for these lessons, regardless of difficulty
        for (const lessonId of weakLessons) {
          const anyQuestions = this.questionDB.getQuestionsByLesson(lessonId);
          if (anyQuestions.length > 0) {
            console.log(`Found ${anyQuestions.length} questions for lesson ${lessonId} (any difficulty)`);
            // Use the first question as sample
            const sampleQuestion = anyQuestions[0]!;
            const generated = await this.generateIsomorphicQuestions(sampleQuestion, 2);
            if (generated.length > 0) {
              return generated;
            }
          }
        }
        return [];
      }

      // Generate 2 supplementary questions for each weak lesson
      const supplementaryQuestions: Question[] = [];
      
      for (const lessonId of weakLessons) {
        const lessonQuestions = sampleQuestions.filter(q => q.lesson_id === lessonId);
        console.log(`Lesson ${lessonId}: ${lessonQuestions.length} questions available`);
        
        if (lessonQuestions.length > 0) {
          const sampleQuestion = lessonQuestions[0]!;
          console.log(`Using sample question for lesson ${lessonId}:`, sampleQuestion.id);
          
          const generated = await this.generateIsomorphicQuestions(sampleQuestion, 2);
          console.log(`Generated ${generated.length} questions for lesson ${lessonId}`);
          supplementaryQuestions.push(...generated);
        }
      }

      console.log(`Total supplementary questions generated: ${supplementaryQuestions.length}`);
      return supplementaryQuestions;
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
  private sessions: Map<string, Session>;

  constructor() {
    this.questionDB = new QuestionDatabase();
    this.aiGenerator = new AIQuestionGenerator(this.questionDB);
    this.sessions = new Map<string, Session>();
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
      answers_by_difficulty: { 'N': [], 'H': [], 'V': [] },
      weak_lessons: [],
      asked_question_ids: new Set(),
      supplementary_bundles: {},
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

  // Generate initial bundle (5 questions covering all 5 lessons)
  async generateInitialBundle(difficulty: 'N' | 'H' | 'V', excludeIds: Set<string>): Promise<Question[]> {
    const bundle: Question[] = [];
    const lessons = [1, 2, 3, 4, 5];

    console.log(`Generating initial bundle for difficulty: ${difficulty}`);

    for (const lessonId of lessons) {
      const availableQuestions = this.questionDB.getAvailableQuestions(difficulty, [lessonId], excludeIds);
      console.log(`Lesson ${lessonId}: ${availableQuestions.length} available questions`);
      
      if (availableQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const randomQuestion = availableQuestions[randomIndex]!;
        console.log(`Selected question for lesson ${lessonId}:`, {
          id: randomQuestion.id,
          choices: randomQuestion.choices?.length || 0,
          content: randomQuestion.content?.substring(0, 50) + '...'
        });
        
        // Check if question has choices, if not generate backup
        if (!randomQuestion.choices || randomQuestion.choices.length === 0) {
          console.log(`Question ${randomQuestion.id} has no choices, generating backup...`);
          try {
            const backupQuestion = await questionBackupGenerator.generateBackupQuestion(randomQuestion);
            // Convert BackupQuestion to Question
            const convertedQuestion: Question = {
              id: backupQuestion.id,
              lesson_id: backupQuestion.lesson_id,
              difficulty: backupQuestion.difficulty as 'N' | 'H' | 'V',
              difficulty_name: backupQuestion.difficulty === 'N' ? 'Nhận biết' : backupQuestion.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng',
              content: backupQuestion.content,
              type: 'multiple_choice',
              choices: backupQuestion.choices,
              correct_answer: backupQuestion.correct_answer,
              explanation: backupQuestion.explanation
            };
            bundle.push(convertedQuestion);
            excludeIds.add(randomQuestion.id);
          } catch (error) {
            console.error(`Failed to generate backup for ${randomQuestion.id}:`, error);
            // Skip this question and try to generate a new one for this lesson
            const topicQuestions = await questionBackupGenerator.generateTopicQuestions(lessonId, difficulty, 1);
            if (topicQuestions.length > 0) {
            const convertedQuestion: Question = {
              id: topicQuestions[0]!.id,
              lesson_id: topicQuestions[0]!.lesson_id,
              difficulty: topicQuestions[0]!.difficulty as 'N' | 'H' | 'V',
              difficulty_name: topicQuestions[0]!.difficulty === 'N' ? 'Nhận biết' : topicQuestions[0]!.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng',
              content: topicQuestions[0]!.content,
              type: 'multiple_choice',
              choices: topicQuestions[0]!.choices,
              correct_answer: topicQuestions[0]!.correct_answer,
              explanation: topicQuestions[0]!.explanation
            };
              bundle.push(convertedQuestion);
            }
          }
        } else {
          bundle.push(randomQuestion);
          excludeIds.add(randomQuestion.id);
        }
      } else {
        console.warn(`No questions available for lesson ${lessonId} with difficulty ${difficulty}, generating new questions...`);
        // Generate new questions for this lesson
        const topicQuestions = await questionBackupGenerator.generateTopicQuestions(lessonId, difficulty, 1);
        if (topicQuestions.length > 0) {
            const convertedQuestion: Question = {
              id: topicQuestions[0]!.id,
              lesson_id: topicQuestions[0]!.lesson_id,
              difficulty: topicQuestions[0]!.difficulty as 'N' | 'H' | 'V',
              difficulty_name: topicQuestions[0]!.difficulty === 'N' ? 'Nhận biết' : topicQuestions[0]!.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng',
              content: topicQuestions[0]!.content,
              type: 'multiple_choice',
              choices: topicQuestions[0]!.choices,
              correct_answer: topicQuestions[0]!.correct_answer,
              explanation: topicQuestions[0]!.explanation
            };
          bundle.push(convertedQuestion);
        }
      }
    }

    console.log(`Generated bundle with ${bundle.length} questions`);
    return bundle;
  }

  // Evaluate answers and determine next state
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
    
    const weakLessons = wrongAnswers
      .map(a => {
        const question = session.current_bundle.find(q => q.id === a.question_id);
        return question?.lesson_id;
      })
      .filter((lessonId): lessonId is number => lessonId !== undefined)
      .filter((lessonId, index, arr) => arr.indexOf(lessonId) === index); // Remove duplicates

    let nextState: SessionState;
    let passed = false;
    
    // New logic: Need 4/5 correct to pass
    if (score >= 4) {
      passed = true;
      // Go to review for current difficulty
      switch (session.current_difficulty) {
        case 'N':
          nextState = 'REVIEW_N';
          break;
        case 'H':
          nextState = 'REVIEW_H';
          break;
        case 'V':
          nextState = 'REVIEW_V';
          break;
        default:
          nextState = 'END';
      }
    } else {
      passed = false;
      // Go to fail review first, then supplementary questions
      switch (session.current_difficulty) {
        case 'N':
          nextState = 'REVIEW_FAIL_N';
          break;
        case 'H':
          nextState = 'REVIEW_FAIL_H';
          break;
        case 'V':
          nextState = 'REVIEW_FAIL_V';
          break;
        default:
          nextState = 'END';
      }
    }

    return { score, weakLessons, nextState, passed, wrongAnswers };
  }

  // Generate supplementary bundle - 2 questions per wrong answer
  async generateSupplementaryBundle(sessionId: string, wrongAnswers: Answer[], difficulty: 'N' | 'H' | 'V'): Promise<Question[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Create a unique key based on wrong answers
    const wrongAnswerIds = wrongAnswers.map(a => a.question_id).sort();
    const bundleKey = wrongAnswerIds.join(',');
    
    // Check if we already generated supplementary questions for these wrong answers
    if (session.supplementary_bundles[bundleKey]) {
      return session.supplementary_bundles[bundleKey];
    }

    const supplementaryQuestions: Question[] = [];
    const weakLessons = new Set<number>();

    console.log(`Generating supplementary questions for ${wrongAnswers.length} wrong answers`);

    // Generate 2 supplementary questions for each wrong answer
    for (const wrongAnswer of wrongAnswers) {
      const originalQuestion = session.current_bundle.find(q => q.id === wrongAnswer.question_id);
      console.log(`Processing wrong answer ${wrongAnswer.question_id}, found original question:`, !!originalQuestion);
      
      if (originalQuestion) {
        weakLessons.add(originalQuestion.lesson_id);
        
        try {
          // Generate 2 isomorphic questions based on the wrong answer
          const generatedQuestions = await this.aiGenerator.generateIsomorphicQuestions(originalQuestion, 2);
          console.log(`Generated ${generatedQuestions.length} isomorphic questions for ${wrongAnswer.question_id}`);
          
          if (generatedQuestions.length > 0) {
            supplementaryQuestions.push(...generatedQuestions);
          } else {
            console.log(`No isomorphic questions generated, trying fallback for ${wrongAnswer.question_id}`);
            // Fallback: generate topic-based questions
            const topicQuestions = await this.aiGenerator.generateSupplementaryQuestions(
              [originalQuestion.lesson_id],
              difficulty,
              [],
              session.asked_question_ids
            );
            console.log(`Fallback generated ${topicQuestions.length} topic questions`);
            supplementaryQuestions.push(...topicQuestions.slice(0, 2));
          }
        } catch (error) {
          console.error(`Error generating supplementary questions for ${wrongAnswer.question_id}:`, error);
          // Fallback: generate topic-based questions
          const topicQuestions = await this.aiGenerator.generateSupplementaryQuestions(
            [originalQuestion.lesson_id],
            difficulty,
            [],
            session.asked_question_ids
          );
          console.log(`Error fallback generated ${topicQuestions.length} topic questions`);
          supplementaryQuestions.push(...topicQuestions.slice(0, 2));
        }
      } else {
        console.error(`Original question not found for ${wrongAnswer.question_id}`);
      }
    }

    // If we still don't have enough questions, try to generate from weak lessons
    if (supplementaryQuestions.length < wrongAnswers.length * 2) {
      console.log(`Not enough supplementary questions (${supplementaryQuestions.length}), generating from weak lessons:`, Array.from(weakLessons));
      
      try {
        const additionalQuestions = await this.aiGenerator.generateSupplementaryQuestions(
          Array.from(weakLessons),
          difficulty,
          [],
          session.asked_question_ids
        );
        console.log(`Generated ${additionalQuestions.length} additional questions from weak lessons`);
        supplementaryQuestions.push(...additionalQuestions);
      } catch (error) {
        console.error('Error generating additional questions from weak lessons:', error);
      }
    }

    // Final fallback: use backup question generator
    if (supplementaryQuestions.length === 0) {
      console.log('No supplementary questions generated, using backup generator');
      try {
        const { questionBackupGenerator } = await import('./question-backup');
        for (const lessonId of weakLessons) {
          const backupQuestions = await questionBackupGenerator.generateTopicQuestions(lessonId, difficulty, 2);
          console.log(`Backup generator created ${backupQuestions.length} questions for lesson ${lessonId}`);
          
          // Convert BackupQuestion to Question
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
      } catch (error) {
        console.error('Error using backup generator:', error);
      }
    }

    // Store in session
    session.supplementary_bundles[bundleKey] = supplementaryQuestions;
    supplementaryQuestions.forEach(q => session.asked_question_ids.add(q.id));

    console.log(`Final result: Generated ${supplementaryQuestions.length} supplementary questions for ${wrongAnswers.length} wrong answers`);
    return supplementaryQuestions;
  }

  // Process state transitions
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
    
    console.log('Added answers to session:', {
      sessionId,
      newAnswers: answers.length,
      totalAnswers: session.answers.length,
      currentState: session.current_state,
      currentDifficulty: session.current_difficulty,
      answersByDifficulty: session.answers_by_difficulty,
      answers: answers.map(a => ({ question_id: a.question_id, is_correct: a.is_correct, time_spent: a.time_spent }))
    });

    let nextBundle: Question[] | undefined;
    let needsTutor = false;
    let needsReview = false;
    let wrongAnswers: Answer[] = [];

    switch (session.current_state) {
      case 'BUNDLE_N':
      case 'BUNDLE_H':
      case 'BUNDLE_V':
        const evaluation = this.evaluateBundle(sessionId, answers);
        session.current_state = evaluation.nextState;
        session.weak_lessons = evaluation.weakLessons;
        wrongAnswers = evaluation.wrongAnswers;

        if (evaluation.passed) {
          // Passed (4/5), go to review
          needsReview = true;
        } else {
          // Failed (<4/5), go to fail review first
          needsReview = true;
        }
        break;

      case 'SUPP_N':
      case 'SUPP_H':
      case 'SUPP_V':
        const suppEvaluation = this.evaluateBundle(sessionId, answers);
        
        // Calculate percentage for supplementary questions (80% threshold)
        const totalSuppQuestions = answers.length;
        const correctSuppAnswers = suppEvaluation.score;
        const suppPercentage = (correctSuppAnswers / totalSuppQuestions) * 100;
        
        // Always go to review after supplementary questions
        needsReview = true;
        wrongAnswers = suppEvaluation.wrongAnswers;
        
        if (suppPercentage >= 80) {
          // Passed supplementary (80%+), move to success review then next difficulty
          switch (session.current_difficulty) {
            case 'N':
              session.current_state = 'REVIEW_SUPP_N';
              break;
            case 'H':
              session.current_state = 'REVIEW_SUPP_H';
              break;
            case 'V':
              session.current_state = 'REVIEW_SUPP_V';
              break;
          }
        } else {
          // Failed supplementary (<80%), move to detailed review then next difficulty
          switch (session.current_difficulty) {
            case 'N':
              session.current_state = 'REVIEW_SUPP_FAIL_N';
              break;
            case 'H':
              session.current_state = 'REVIEW_SUPP_FAIL_H';
              break;
            case 'V':
              session.current_state = 'REVIEW_SUPP_FAIL_V';
              break;
          }
        }
        break;

      case 'TUTOR_N':
      case 'TUTOR_H':
      case 'TUTOR_V':
        // Tutor session completed, move to next difficulty
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
        // Review state - do nothing here, let frontend handle review display
        // The review will be generated when frontend calls the review API
        // The decision to go to next difficulty will be made in continueAfterReview
        needsReview = true;
        break;

      case 'REVIEW_FAIL_N':
      case 'REVIEW_FAIL_H':
      case 'REVIEW_FAIL_V':
        // Fail review state - do nothing here, let frontend handle review display
        // The review will be generated when frontend calls the review API
        // The decision to go to supplementary questions will be made in continueAfterFailReview
        needsReview = true;
        break;

      case 'REVIEW_SUPP_N':
      case 'REVIEW_SUPP_H':
      case 'REVIEW_SUPP_V':
        // Review supplementary success state - wait for frontend to call continueAfterReview
        // Don't change difficulty yet, just indicate that review is needed
        needsReview = true;
        break;

      case 'REVIEW_SUPP_FAIL_N':
      case 'REVIEW_SUPP_FAIL_H':
      case 'REVIEW_SUPP_FAIL_V':
        // Review supplementary fail state - show detailed review then move to next difficulty
        const reviewSuppFailDifficulty = session.current_difficulty;
        if (reviewSuppFailDifficulty === 'N') {
          session.current_state = 'BUNDLE_H';
          session.current_difficulty = 'H';
          nextBundle = await this.generateInitialBundle('H', session.asked_question_ids);
        } else if (reviewSuppFailDifficulty === 'H') {
          session.current_state = 'BUNDLE_V';
          session.current_difficulty = 'V';
          nextBundle = await this.generateInitialBundle('V', session.asked_question_ids);
        } else {
          session.current_state = 'END';
        }
        break;
    }

    this.sessions.set(sessionId, session);
    return { session, nextBundle, needsTutor, needsReview, wrongAnswers };
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
      [lastTutorSession.context.lesson_id],
      session.asked_question_ids
    );

    if (sampleQuestions.length === 0) return [];

    // Generate isomorphic questions
    const retestQuestions = await this.aiGenerator.generateIsomorphicQuestions(sampleQuestions[0]!, 5);
    
    retestQuestions.forEach(q => session.asked_question_ids.add(q.id));

    return retestQuestions;
  }

  // Start a new bundle
  async startBundle(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<Question[]> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const bundle = await this.generateInitialBundle(difficulty, session.asked_question_ids);
    session.current_bundle = bundle;
    session.current_question_index = 0;
    session.current_difficulty = difficulty;
    session.current_state = `BUNDLE_${difficulty}` as SessionState;
    
    // Save bundle for review purposes
    session.used_bundles[difficulty] = [...bundle]; // Create a copy
    console.log(`Saved bundle for difficulty ${difficulty}: ${bundle.length} questions`);

    this.sessions.set(sessionId, session);
    return bundle;
  }

  // Generate detailed review session for supplementary questions (when failed)
  async generateDetailedSupplementaryReview(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<ReviewSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Get supplementary questions answers
    const supplementaryAnswers = session.answers_by_difficulty[difficulty] || [];
    const wrongAnswers = supplementaryAnswers.filter(a => !a.is_correct);

    // Get wrong questions from supplementary bundle
    const wrongQuestions = wrongAnswers.map(answer => {
      return session.current_bundle.find(q => q.id === answer.question_id);
    }).filter(q => q !== undefined);

    // Generate detailed explanations for wrong questions
    const detailedExplanations = await this.generateDetailedExplanations(wrongQuestions);

    // Create lesson summary focusing on weak areas
    const lesson_summary: { [lesson: number]: any } = {};
    const topicMap: { [key: number]: string } = {
      1: "Tính đơn điệu và cực trị của hàm số",
      2: "Giá trị lớn nhất - nhỏ nhất của hàm số", 
      3: "Đường tiệm cận của đồ thị hàm số",
      4: "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
      5: "Ứng dụng đạo hàm và khảo sát hàm số để giải quyết bài toán thực tế"
    };

    // Group wrong answers by lesson
    const wrongAnswersByLesson: { [lesson: number]: any[] } = {};
    wrongAnswers.forEach(answer => {
      const question = session.current_bundle.find(q => q.id === answer.question_id);
      if (question) {
        if (!wrongAnswersByLesson[question.lesson_id]) {
          wrongAnswersByLesson[question.lesson_id] = [];
        }
        wrongAnswersByLesson[question.lesson_id].push(answer);
      }
    });

    // Create detailed lesson summary
    for (const [lesson, answers] of Object.entries(wrongAnswersByLesson)) {
      const lessonNum = parseInt(lesson);
      lesson_summary[lessonNum] = {
        total_questions: answers.length,
        correct_answers: 0,
        accuracy: 0,
        weak_topics: [topicMap[lessonNum]],
        strong_topics: [],
        detailed_explanations: detailedExplanations.filter(exp => exp.lesson_id === lessonNum)
      };
    }

    // Calculate overall performance
    const totalQuestions = supplementaryAnswers.length;
    const correctAnswers = supplementaryAnswers.filter(a => a.is_correct).length;
    const totalTimeSpent = supplementaryAnswers.reduce((sum, a) => sum + a.time_spent, 0);

    // Generate recommendations for detailed review
    const recommendations = await this.generateDetailedReviewRecommendations(lesson_summary, difficulty);
    const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const nextDifficultyPreparation = await this.generateNextDifficultyPreparation(difficulty, overallAccuracy);

    const reviewSession: ReviewSession = {
      id: `detailed_review_${sessionId}_${difficulty}_${Date.now()}`,
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
      if (!openaiEnabled || !openai) {
        return wrongQuestions.map(q => ({
          question_id: q.id,
          lesson_id: q.lesson_id,
          content: q.content,
          explanation: q.explanation || "Giải thích sẽ được cập nhật",
          theory_summary: "Lý thuyết liên quan sẽ được cập nhật",
          step_by_step_solution: "Lời giải từng bước sẽ được cập nhật"
        }));
      }

      const explanations = [];
      for (const question of wrongQuestions) {
        const prompt = `
Tạo giải thích chi tiết cho câu hỏi toán học lớp 12:

CÂU HỎI: ${question.content}
ĐÁP ÁN ĐÚNG: ${question.choices[question.correct_answer]}
GIẢI THÍCH HIỆN TẠI: ${question.explanation}
BÀI: ${question.lesson_id}
ĐỘ KHÓ: ${question.difficulty}

YÊU CẦU:
1. Tóm tắt lý thuyết liên quan (ngắn gọn, dễ hiểu)
2. Giải từng bước chi tiết với giải thích tại sao làm như vậy
3. Chỉ ra các lỗi thường gặp và cách tránh
4. Đưa ra bài tập tương tự để luyện tập

Trả về JSON:
{
  "theory_summary": "Tóm tắt lý thuyết",
  "step_by_step_solution": "Lời giải từng bước chi tiết",
  "common_mistakes": "Các lỗi thường gặp",
  "similar_exercises": "Bài tập tương tự"
}
`;

        const response = await openai!.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Bạn là giáo viên toán học có kinh nghiệm. Hãy tạo giải thích chi tiết và dễ hiểu cho học sinh lớp 12."
            },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        
        explanations.push({
          question_id: question.id,
          lesson_id: question.lesson_id,
          content: question.content,
          explanation: question.explanation,
          theory_summary: result.theory_summary || "Lý thuyết liên quan",
          step_by_step_solution: result.step_by_step_solution || "Lời giải từng bước",
          common_mistakes: result.common_mistakes || "Các lỗi thường gặp",
          similar_exercises: result.similar_exercises || "Bài tập tương tự"
        });
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

  // Generate detailed review recommendations
  private async generateDetailedReviewRecommendations(lesson_summary: any, difficulty: string): Promise<string[]> {
    try {
      if (!openaiEnabled || !openai) {
        return [
          "Hãy xem lại lý thuyết và lời giải chi tiết cho các câu sai",
          "Làm thêm bài tập tương tự để củng cố kiến thức",
          "Chú ý các lỗi thường gặp để tránh mắc phải",
          "Chuẩn bị tốt cho độ khó tiếp theo"
        ];
      }

      const prompt = `
Đưa ra khuyến nghị chi tiết cho học sinh sau khi làm sai nhiều câu trong bài tập bổ sung:

KẾT QUẢ BÀI TẬP BỔ SUNG:
${JSON.stringify(lesson_summary, null, 2)}

ĐỘ KHÓ HIỆN TẠI: ${difficulty === 'N' ? 'Nhận biết' : difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}

YÊU CẦU:
1. Đưa ra 4-5 khuyến nghị cụ thể để cải thiện
2. Tập trung vào việc xem lại lý thuyết và lời giải chi tiết
3. Động viên và tích cực
4. Hướng dẫn cách học hiệu quả cho độ khó tiếp theo

Trả về JSON:
{
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2", "Khuyến nghị 3", "Khuyến nghị 4"]
}
`;

      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên toán học có kinh nghiệm. Hãy đưa ra khuyến nghị học tập tích cực và cụ thể cho học sinh."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating detailed review recommendations:', error);
      return [
        "Hãy xem lại lý thuyết và lời giải chi tiết cho các câu sai",
        "Làm thêm bài tập tương tự để củng cố kiến thức",
        "Chú ý các lỗi thường gặp để tránh mắc phải",
        "Chuẩn bị tốt cho độ khó tiếp theo"
      ];
    }
  }

  // Generate review session for current difficulty
  async generateReviewSession(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<ReviewSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Analyze performance by lesson for current difficulty
    const lessonStats: { [lesson: number]: { total: number; correct: number; time_spent: number } } = {};
    const difficultyAnswers = session.answers_by_difficulty[difficulty] || [];

    console.log('Review session debug:', {
      difficulty,
      totalAnswers: session.answers.length,
      difficultyAnswers: difficultyAnswers.length,
      answersByDifficulty: session.answers_by_difficulty,
      currentBundle: session.current_bundle.length,
      supplementaryBundles: Object.keys(session.supplementary_bundles).length
    });

    // Group answers by lesson
    for (const answer of difficultyAnswers) {
      let question = null;
      
      // Try to find question in multiple sources
      // 1. Current bundle
      question = session.current_bundle.find(q => q.id === answer.question_id);
      
      // 2. Used bundles for this difficulty
      if (!question) {
        const bundle = session.used_bundles[difficulty];
        question = bundle?.find(q => q.id === answer.question_id);
      }
      
      // 3. Supplementary bundles
      if (!question) {
        for (const [key, suppBundle] of Object.entries(session.supplementary_bundles)) {
          question = suppBundle.find(q => q.id === answer.question_id);
          if (question) break;
        }
      }
      
      // 4. All answers from session (fallback)
      if (!question) {
        // Try to get lesson_id from answer metadata or use a default
        const lessonId = answer.question_id ? parseInt(answer.question_id.split('_')[1]) || 1 : 1;
        question = { lesson_id: lessonId, difficulty: difficulty };
      }
      
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
        
        console.log(`Answer ${answer.question_id}: lesson ${lessonId}, correct: ${answer.is_correct}`);
      } else {
        console.error(`Question not found for answer ${answer.question_id}`);
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

    console.log('Review performance:', {
      totalQuestions,
      correctAnswers,
      totalTimeSpent,
      lessonStats
    });

    // Generate recommendations using AI
    const recommendations = await this.generateReviewRecommendations(lesson_summary, difficulty);
    const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const nextDifficultyPreparation = await this.generateNextDifficultyPreparation(difficulty, overallAccuracy);

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
    this.sessions.set(sessionId, session);

    return reviewSession;
  }

  // Generate AI-powered recommendations for review
  private async generateReviewRecommendations(lesson_summary: any, difficulty: string): Promise<string[]> {
    try {
      if (!openaiEnabled || !openai) {
        console.log('OpenAI not available, using fallback recommendations');
        return [
          "Tiếp tục ôn tập các chủ đề đã học",
          "Làm thêm bài tập để củng cố kiến thức",
          "Chuẩn bị tốt cho độ khó tiếp theo"
        ];
      }

      const prompt = `
      Phân tích kết quả học tập và đưa ra khuyến nghị cho học sinh lớp 12:

      KẾT QUẢ HỌC TẬP:
      ${JSON.stringify(lesson_summary, null, 2)}

      ĐỘ KHÓ HIỆN TẠI: ${difficulty === 'N' ? 'Nhận biết' : difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}

      YÊU CẦU:
      1. Đưa ra 3-5 khuyến nghị cụ thể cho việc học tập tiếp theo
      2. Tập trung vào các chủ đề yếu (accuracy < 70%)
      3. Động viên và tích cực
      4. Phù hợp với trình độ học sinh lớp 12

      Trả về JSON:
      {
        "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2", "Khuyến nghị 3"]
      }
      `;

      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên toán học có kinh nghiệm. Hãy đưa ra khuyến nghị học tập tích cực và cụ thể cho học sinh."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating review recommendations:', error);
      return [
        "Tiếp tục ôn tập các chủ đề đã học",
        "Làm thêm bài tập để củng cố kiến thức",
        "Chuẩn bị tốt cho độ khó tiếp theo"
      ];
    }
  }

  // Generate preparation tips for next difficulty
  private async generateNextDifficultyPreparation(currentDifficulty: string, accuracy: number): Promise<string[]> {
    try {
      if (!openaiEnabled || !openai) {
        console.log('OpenAI not available, using fallback preparation tips');
        return [
          "Ôn tập lại các khái niệm cơ bản",
          "Làm thêm bài tập để củng cố kiến thức",
          "Chuẩn bị tinh thần cho độ khó cao hơn"
        ];
      }

      const nextDifficulty = currentDifficulty === 'N' ? 'H' : currentDifficulty === 'H' ? 'V' : 'END';
      
      if (nextDifficulty === 'END') {
        return ["Chúc mừng bạn đã hoàn thành tất cả các độ khó!"];
      }

      const prompt = `
      Đưa ra lời khuyên chuẩn bị cho độ khó tiếp theo:

      ĐỘ KHÓ HIỆN TẠI: ${currentDifficulty === 'N' ? 'Nhận biết' : currentDifficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}
      ĐỘ KHÓ TIẾP THEO: ${nextDifficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}
      ĐỘ CHÍNH XÁC HIỆN TẠI: ${accuracy.toFixed(1)}%

      YÊU CẦU:
      1. Đưa ra 3-4 lời khuyên cụ thể để chuẩn bị cho độ khó tiếp theo
      2. Dựa trên độ chính xác hiện tại để đưa ra lời khuyên phù hợp
      3. Tích cực và động viên học sinh

      Trả về JSON:
      {
        "preparation_tips": ["Lời khuyên 1", "Lời khuyên 2", "Lời khuyên 3"]
      }
      `;

      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên toán học có kinh nghiệm. Hãy đưa ra lời khuyên chuẩn bị tích cực cho học sinh."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{"preparation_tips": []}');
      return result.preparation_tips || [];
    } catch (error) {
      console.error('Error generating next difficulty preparation:', error);
      return [
        "Ôn tập lại các khái niệm cơ bản",
        "Làm thêm bài tập để củng cố kiến thức",
        "Chuẩn bị tinh thần cho độ khó cao hơn"
      ];
    }
  }

  // Continue after review - move to next difficulty
  async continueAfterReview(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<{ session: Session; nextBundle?: Question[] }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    console.log('Continue after review debug:', {
      difficulty,
      currentState: session.current_state,
      currentDifficulty: session.current_difficulty
    });

    let nextBundle: Question[] | undefined;

    // Move to next difficulty after review
    if (difficulty === 'N') {
      session.current_state = 'BUNDLE_H';
      session.current_difficulty = 'H';
      nextBundle = await this.generateInitialBundle('H', session.asked_question_ids);
      // Save the new bundle
      session.used_bundles['H'] = [...nextBundle];
      session.current_bundle = nextBundle;
      session.current_question_index = 0;
    } else if (difficulty === 'H') {
      session.current_state = 'BUNDLE_V';
      session.current_difficulty = 'V';
      nextBundle = await this.generateInitialBundle('V', session.asked_question_ids);
      // Save the new bundle
      session.used_bundles['V'] = [...nextBundle];
      session.current_bundle = nextBundle;
      session.current_question_index = 0;
    } else {
      session.current_state = 'END';
    }

    this.sessions.set(sessionId, session);
    return { session, nextBundle };
  }

  // Continue after fail review - move to supplementary questions
  async continueAfterFailReview(sessionId: string, difficulty: 'N' | 'H' | 'V'): Promise<{ session: Session; nextBundle?: Question[] }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    console.log('Continue after fail review debug:', {
      difficulty,
      currentState: session.current_state,
      currentDifficulty: session.current_difficulty
    });

    // Get the wrong answers from the initial bundle
    const initialBundleAnswers = session.answers_by_difficulty[difficulty] || [];
    const wrongAnswers = initialBundleAnswers.filter(a => !a.is_correct);

    // Generate supplementary questions based on wrong answers
    const supplementaryBundle = await this.generateSupplementaryBundle(sessionId, wrongAnswers, difficulty);
    
    // Update session state to supplementary questions
    switch (difficulty) {
      case 'N':
        session.current_state = 'SUPP_N';
        break;
      case 'H':
        session.current_state = 'SUPP_H';
        break;
      case 'V':
        session.current_state = 'SUPP_V';
        break;
    }

    // Set the supplementary bundle as current bundle
    session.current_bundle = supplementaryBundle;
    session.current_question_index = 0;

    this.sessions.set(sessionId, session);
    return { session, nextBundle: supplementaryBundle };
  }

  // Generate mastery report
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

    // Generate mastery heatmap
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
}

// Export singleton instance
export const adaptiveLearningManager = new AdaptiveLearningManager();
