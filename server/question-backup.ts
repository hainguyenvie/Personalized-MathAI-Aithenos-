import OpenAI from "openai";

// Initialize OpenAI client only if the API key is present
const apiKey = process.env.OPENAI_API_KEY;
const openaiEnabled = Boolean(apiKey);
const openai = openaiEnabled ? new OpenAI({ apiKey }) : null;

export interface BackupQuestion {
  id: string;
  content: string;
  choices: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
  lesson_id: number;
}

export class QuestionBackupGenerator {
  
  async generateBackupQuestion(originalQuestion: any): Promise<BackupQuestion> {
    try {
      if (!openaiEnabled || !openai) {
        console.log('OpenAI not available, using fallback backup question');
        return {
          id: `backup_${originalQuestion.id}`,
          content: originalQuestion.content,
          choices: ["A", "B", "C", "D"],
          correct_answer: 0,
          explanation: "Câu hỏi này đang được cập nhật",
          difficulty: originalQuestion.difficulty,
          lesson_id: originalQuestion.lesson_id
        };
      }

      const prompt = `
Tạo câu hỏi trắc nghiệm hoàn chỉnh dựa trên nội dung câu hỏi gốc sau:

CÂU HỎI GỐC:
- Nội dung: ${originalQuestion.content}
- Độ khó: ${originalQuestion.difficulty}
- Bài: ${originalQuestion.lesson_id}
- ID: ${originalQuestion.id}

YÊU CẦU:
1. Tạo 4 đáp án trắc nghiệm (A, B, C, D)
2. Đảm bảo có 1 đáp án đúng và 3 đáp án sai hợp lý
3. Giữ nguyên độ khó và chủ đề
4. Tạo giải thích chi tiết cho đáp án đúng
5. Đảm bảo câu hỏi có ý nghĩa và logic

Trả về JSON với format:
{
  "content": "Nội dung câu hỏi đã được làm rõ",
  "choices": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
  "correct_answer": 0,
  "explanation": "Giải thích chi tiết tại sao đáp án này đúng"
}
`;

      const response = await openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia tạo câu hỏi toán học lớp 12. Hãy tạo câu hỏi trắc nghiệm chất lượng cao với đáp án hợp lý."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        id: `backup_${originalQuestion.id}`,
        content: result.content || originalQuestion.content,
        choices: result.choices || ["A", "B", "C", "D"],
        correct_answer: result.correct_answer || 0,
        explanation: result.explanation || "Giải thích sẽ được cập nhật",
        difficulty: originalQuestion.difficulty,
        lesson_id: originalQuestion.lesson_id
      };
    } catch (error) {
      console.error('Error generating backup question:', error);
      
      // Fallback: Create simple backup
      return {
        id: `backup_${originalQuestion.id}`,
        content: originalQuestion.content,
        choices: ["A", "B", "C", "D"],
        correct_answer: 0,
        explanation: "Câu hỏi này đang được cập nhật",
        difficulty: originalQuestion.difficulty,
        lesson_id: originalQuestion.lesson_id
      };
    }
  }

  async generateMultipleBackupQuestions(originalQuestions: any[], count: number = 5): Promise<BackupQuestion[]> {
    const backupQuestions: BackupQuestion[] = [];
    
    for (const question of originalQuestions.slice(0, count)) {
      try {
        const backup = await this.generateBackupQuestion(question);
        backupQuestions.push(backup);
      } catch (error) {
        console.error(`Error generating backup for question ${question.id}:`, error);
      }
    }
    
    return backupQuestions;
  }

  // Generate questions for specific topics
  async generateTopicQuestions(lessonId: number, difficulty: string, count: number = 5): Promise<BackupQuestion[]> {
    try {
      const topicMap: { [key: number]: string } = {
        1: "Tính đơn điệu và cực trị của hàm số",
        2: "Giá trị lớn nhất - nhỏ nhất của hàm số", 
        3: "Đường tiệm cận của đồ thị hàm số",
        4: "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
        5: "Ứng dụng đạo hàm và khảo sát hàm số để giải quyết bài toán thực tế"
      };

      const topic = topicMap[lessonId] || "Toán học lớp 12";
      
      const prompt = `
Tạo ${count} câu hỏi trắc nghiệm toán học lớp 12 với các yêu cầu sau:

CHỦ ĐỀ: ${topic}
ĐỘ KHÓ: ${difficulty === 'N' ? 'Nhận biết' : difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}
SỐ CÂU: ${count}

YÊU CẦU:
1. Mỗi câu có 4 đáp án trắc nghiệm (A, B, C, D)
2. Đảm bảo có 1 đáp án đúng và 3 đáp án sai hợp lý
3. Phù hợp với chương trình toán lớp 12
4. Có giải thích chi tiết cho đáp án đúng
5. Sử dụng ký hiệu toán học LaTeX khi cần

Trả về JSON với format:
{
  "questions": [
    {
      "content": "Nội dung câu hỏi",
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
            content: "Bạn là giáo viên toán học có kinh nghiệm. Hãy tạo câu hỏi trắc nghiệm chất lượng cao, phù hợp với chương trình lớp 12."
          },
          {
            role: "user",
            content: prompt
          }
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
        difficulty: difficulty,
        lesson_id: lessonId
      }));
    } catch (error) {
      console.error('Error generating topic questions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const questionBackupGenerator = new QuestionBackupGenerator();
