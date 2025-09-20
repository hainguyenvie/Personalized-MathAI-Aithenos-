import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
const openaiEnabled = Boolean(apiKey);
const openai = openaiEnabled ? new OpenAI({ apiKey }) : null;

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface BatchRequest {
  id: string;
  prompt: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

// AI Cache Manager
export class AICacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private batchQueue: BatchRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 5;
  private readonly BATCH_DELAY = 100; // ms
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Cache operations
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Generate cache key for questions
  generateQuestionKey(lessonId: number, difficulty: string, count: number): string {
    return `questions_${lessonId}_${difficulty}_${count}`;
  }

  // Generate cache key for recommendations
  generateRecommendationKey(lessonSummary: any, difficulty: string): string {
    const summaryHash = JSON.stringify(lessonSummary);
    return `recommendations_${difficulty}_${this.hashString(summaryHash)}`;
  }

  // Generate cache key for hints
  generateHintKey(context: any, step: number): string {
    const contextHash = JSON.stringify(context);
    return `hint_${this.hashString(contextHash)}_${step}`;
  }

  // Simple hash function
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Batch processing for OpenAI calls
  async batchProcess<T>(requests: BatchRequest[]): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      const batch = requests.slice(i, i + this.BATCH_SIZE);
      
      try {
        const batchResults = await this.processBatch(batch);
        results.push(...batchResults);
      } catch (error) {
        // Handle individual failures
        batch.forEach(req => req.reject(error));
      }
    }
    
    return results;
  }

  private async processBatch(batch: BatchRequest[]): Promise<any[]> {
    if (!openaiEnabled || !openai) {
      return batch.map(req => ({ content: "AI not available", type: "fallback" }));
    }

    try {
      // Create batch request
      const messages = batch.map((req, index) => ({
        role: "user" as const,
        content: req.prompt
      }));

      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia tạo câu hỏi toán học. Hãy xử lý các yêu cầu một cách hiệu quả."
          },
          ...messages
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      // Parse and return results
      const results = batch.map((req, index) => {
        try {
          const content = response.choices[index]?.message?.content || '{}';
          return JSON.parse(content);
        } catch (error) {
          return { content: "Error parsing response", type: "error" };
        }
      });

      return results;
    } catch (error) {
      throw new Error(`Batch processing failed: ${error}`);
    }
  }

  // Optimized question generation with caching
  async generateQuestionsWithCache(
    lessonId: number, 
    difficulty: string, 
    count: number,
    originalQuestion?: any
  ): Promise<any[]> {
    const cacheKey = this.generateQuestionKey(lessonId, difficulty, count);
    
    // Check cache first
    const cached = this.get<any[]>(cacheKey);
    if (cached) {
      console.log(`Cache hit for questions: ${cacheKey}`);
      return cached;
    }

    console.log(`Cache miss for questions: ${cacheKey}`);
    
    // Generate new questions
    const questions = await this.generateQuestions(lessonId, difficulty, count, originalQuestion);
    
    // Cache the results
    this.set(cacheKey, questions, 12 * 60 * 60 * 1000); // 12 hours
    
    return questions;
  }

  // Optimized recommendations with caching
  async generateRecommendationsWithCache(
    lessonSummary: any, 
    difficulty: string
  ): Promise<string[]> {
    const cacheKey = this.generateRecommendationKey(lessonSummary, difficulty);
    
    // Check cache first
    const cached = this.get<string[]>(cacheKey);
    if (cached) {
      console.log(`Cache hit for recommendations: ${cacheKey}`);
      return cached;
    }

    console.log(`Cache miss for recommendations: ${cacheKey}`);
    
    // Generate new recommendations
    const recommendations = await this.generateRecommendations(lessonSummary, difficulty);
    
    // Cache the results
    this.set(cacheKey, recommendations, 6 * 60 * 60 * 1000); // 6 hours
    
    return recommendations;
  }

  // Private methods for actual generation
  private async generateQuestions(
    lessonId: number, 
    difficulty: string, 
    count: number,
    originalQuestion?: any
  ): Promise<any[]> {
    if (!openaiEnabled || !openai) {
      return this.generateFallbackQuestions(lessonId, difficulty, count);
    }

    const topicMap: { [key: number]: string } = {
      1: "Tính đơn điệu và cực trị của hàm số",
      2: "Giá trị lớn nhất - nhỏ nhất của hàm số", 
      3: "Đường tiệm cận của đồ thị hàm số",
      4: "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
      5: "Ứng dụng đạo hàm và khảo sát hàm số để giải quyết bài toán thực tế"
    };

    const topic = topicMap[lessonId] || "Toán học lớp 12";
    
    const prompt = `
Tạo ${count} câu hỏi trắc nghiệm toán học lớp 12 chất lượng cao:

CHỦ ĐỀ: ${topic}
ĐỘ KHÓ: ${difficulty === 'N' ? 'Nhận biết' : difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}
SỐ CÂU: ${count}

YÊU CẦU QUAN TRỌNG:
1. Mỗi câu có 4 đáp án trắc nghiệm (A, B, C, D)
2. Đảm bảo có 1 đáp án đúng và 3 đáp án sai hợp lý
3. Phù hợp với chương trình toán lớp 12
4. **BẮT BUỘC**: Có giải thích chi tiết và đầy đủ cho đáp án đúng
5. **BẮT BUỘC**: Có phần lý thuyết liên quan để học sinh hiểu
6. Sử dụng ký hiệu toán học LaTeX trong $...$ hoặc $$...$$ khi cần
7. Giải thích phải đủ chi tiết để học sinh hiểu tại sao đáp án đó đúng

VÍ DỤ FORMAT MONG MUỐN:
- Nội dung: "Cho hàm số $y = x^3 - 3x + 1$. Tìm khoảng đồng biến của hàm số."
- Lý thuyết: "Hàm số đồng biến trên khoảng $(a;b)$ khi $y' > 0$ với mọi $x \\in (a;b)$"
- Giải thích: "Ta có $y' = 3x^2 - 3 = 3(x^2 - 1) = 3(x-1)(x+1)$. Hàm số đồng biến khi $y' > 0 \\Leftrightarrow (x-1)(x+1) > 0 \\Leftrightarrow x \\in (-\\infty; -1) \\cup (1; +\\infty)$"

Trả về JSON:
{
  "questions": [
    {
      "content": "Nội dung câu hỏi (có thể có LaTeX)",
      "choices": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correct_answer": 0,
      "theory": "Lý thuyết cần thiết để giải bài (có thể có LaTeX)",
      "explanation": "Giải thích chi tiết từng bước (có thể có LaTeX)"
    }
  ]
}
`;

    try {
      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên toán học có kinh nghiệm cao, chuyên gia về chương trình lớp 12. Hãy tạo câu hỏi trắc nghiệm chất lượng cao với giải thích chi tiết và lý thuyết đầy đủ. Sử dụng LaTeX để viết công thức toán học. Đảm bảo lý thuyết và giải thích phải đủ chi tiết để học sinh hiểu sâu kiến thức."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      
      return result.questions.map((q: any, index: number) => ({
        id: `generated_${lessonId}_${difficulty}_${index + 1}`,
        content: q.content,
        choices: q.choices,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        theory: q.theory || "Lý thuyết cần được bổ sung",
        difficulty: difficulty,
        lesson_id: lessonId
      }));
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.generateFallbackQuestions(lessonId, difficulty, count);
    }
  }

  private async generateRecommendations(
    lessonSummary: any, 
    difficulty: string
  ): Promise<string[]> {
    if (!openaiEnabled || !openai) {
      return this.getFallbackRecommendations();
    }

    const prompt = `
Phân tích kết quả học tập và đưa ra khuyến nghị cho học sinh lớp 12:

KẾT QUẢ HỌC TẬP:
${JSON.stringify(lessonSummary, null, 2)}

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

    try {
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
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  private generateFallbackQuestions(lessonId: number, difficulty: string, count: number): any[] {
    const fallbackQuestions = [];
    for (let i = 0; i < count; i++) {
      fallbackQuestions.push({
        id: `fallback_${lessonId}_${difficulty}_${i + 1}`,
        content: `Câu hỏi ${difficulty} cho bài ${lessonId} (Câu ${i + 1})`,
        choices: ["A", "B", "C", "D"],
        correct_answer: 0,
        explanation: "Giải thích sẽ được cập nhật",
        difficulty: difficulty,
        lesson_id: lessonId
      });
    }
    return fallbackQuestions;
  }

  private getFallbackRecommendations(): string[] {
    return [
      "Tiếp tục ôn tập các chủ đề đã học",
      "Làm thêm bài tập để củng cố kiến thức",
      "Chuẩn bị tốt cho độ khó tiếp theo"
    ];
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const aiCacheManager = new AICacheManager();
