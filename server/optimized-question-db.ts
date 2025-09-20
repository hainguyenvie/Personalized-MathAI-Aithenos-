import fs from "fs";
import path from "path";

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
  theory?: string;
  topic?: string;
  problem_type?: string;
}

// Optimized Question Database with lazy loading and caching
export class OptimizedQuestionDatabase {
  private questions: Question[] = [];
  private questionsByLesson: { [lesson: number]: Question[] } = {};
  private questionsByDifficulty: { [difficulty: string]: Question[] } = {};
  private questionsByLessonAndDifficulty: { [key: string]: Question[] } = {};
  private loaded = false;
  private loading = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    // Don't load immediately - use lazy loading
  }

  // Lazy loading with promise caching
  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }

    this.loading = true;
    this.loadPromise = this.loadQuestions();
    
    try {
      await this.loadPromise;
      this.loaded = true;
    } finally {
      this.loading = false;
    }
  }

  private async loadQuestions(): Promise<void> {
    try {
      const dataPath = path.join(process.cwd(), 'data_adaptive_learn', 'questions_indexed.json');
      console.log('Loading questions from:', dataPath);
      
      // Use async file reading
      const data = await fs.promises.readFile(dataPath, 'utf-8');
      const parsedData = JSON.parse(data);
      this.questions = parsedData.questions;
      
      console.log('Loaded', this.questions.length, 'questions');
      
      // Pre-index questions for faster access
      this.indexQuestions();
      
      // Pre-filter questions with valid choices
      this.preFilterValidQuestions();
      
    } catch (error) {
      console.error('Error loading questions:', error);
      this.questions = [];
    }
  }

  private indexQuestions(): void {
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

    // Index by lesson and difficulty combination
    this.questionsByLessonAndDifficulty = {};
    for (const q of this.questions) {
      const key = `${q.lesson_id}_${q.difficulty}`;
      if (!this.questionsByLessonAndDifficulty[key]) {
        this.questionsByLessonAndDifficulty[key] = [];
      }
      this.questionsByLessonAndDifficulty[key].push(q);
    }
  }

  private preFilterValidQuestions(): void {
    // Pre-filter questions that have valid choices
    const validQuestions = this.questions.filter(q => 
      q.choices && 
      q.choices.length >= 4 && 
      q.content && 
      q.content.trim().length > 0
    );

    console.log(`Pre-filtered ${validQuestions.length} valid questions from ${this.questions.length} total`);

    // Update all indexes with valid questions only
    this.questions = validQuestions;
    this.indexQuestions();
  }

  // Optimized getters with lazy loading
  async getQuestionsByLesson(lessonId: number): Promise<Question[]> {
    await this.ensureLoaded();
    return this.questionsByLesson[lessonId] || [];
  }

  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    await this.ensureLoaded();
    return this.questionsByDifficulty[difficulty] || [];
  }

  async getQuestionsByLessonAndDifficulty(lessonId: number, difficulty: string): Promise<Question[]> {
    await this.ensureLoaded();
    const key = `${lessonId}_${difficulty}`;
    return this.questionsByLessonAndDifficulty[key] || [];
  }

  async getAvailableQuestions(difficulty: string, lessonIds: number[], excludeIds: Set<string>): Promise<Question[]> {
    await this.ensureLoaded();
    
    // Use pre-indexed data for faster filtering
    const availableQuestions: Question[] = [];
    
    for (const lessonId of lessonIds) {
      const key = `${lessonId}_${difficulty}`;
      const lessonQuestions = this.questionsByLessonAndDifficulty[key] || [];
      
      // Filter out excluded questions
      const filteredQuestions = lessonQuestions.filter(q => !excludeIds.has(q.id));
      availableQuestions.push(...filteredQuestions);
    }
    
    return availableQuestions;
  }

  async getAllQuestions(): Promise<Question[]> {
    await this.ensureLoaded();
    return this.questions;
  }

  // Get random questions efficiently
  async getRandomQuestions(difficulty: string, lessonIds: number[], count: number, excludeIds: Set<string>): Promise<Question[]> {
    await this.ensureLoaded();
    
    const availableQuestions = await this.getAvailableQuestions(difficulty, lessonIds, excludeIds);
    
    if (availableQuestions.length === 0) {
      return [];
    }

    // Shuffle and take first N questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Get question statistics
  async getQuestionStats(): Promise<{
    total: number;
    byDifficulty: { [difficulty: string]: number };
    byLesson: { [lesson: number]: number };
    validQuestions: number;
  }> {
    await this.ensureLoaded();
    
    const stats = {
      total: this.questions.length,
      byDifficulty: {} as { [difficulty: string]: number },
      byLesson: {} as { [lesson: number]: number },
      validQuestions: this.questions.filter(q => q.choices && q.choices.length >= 4).length
    };

    // Count by difficulty
    for (const [difficulty, questions] of Object.entries(this.questionsByDifficulty)) {
      stats.byDifficulty[difficulty] = questions.length;
    }

    // Count by lesson
    for (const [lesson, questions] of Object.entries(this.questionsByLesson)) {
      stats.byLesson[parseInt(lesson)] = questions.length;
    }

    return stats;
  }

  // Check if database is loaded
  isLoaded(): boolean {
    return this.loaded;
  }

  // Force reload (useful for development)
  async reload(): Promise<void> {
    this.loaded = false;
    this.loading = false;
    this.loadPromise = null;
    this.questions = [];
    this.questionsByLesson = {};
    this.questionsByDifficulty = {};
    this.questionsByLessonAndDifficulty = {};
    
    await this.ensureLoaded();
  }
}

// Export singleton instance
export const optimizedQuestionDB = new OptimizedQuestionDatabase();
