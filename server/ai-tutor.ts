import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TutorContext {
  lesson_id: number;
  difficulty: 'N' | 'H' | 'V';
  problem_type: string;
  student_answer: string;
  correct_answer: string;
  question_content: string;
  explanation: string;
  theory_content?: string;
}

export interface TutorHint {
  id: string;
  level: number;
  content: string;
  type: 'concept' | 'step' | 'check' | 'solution';
  is_final: boolean;
}

export interface TutorSession {
  id: string;
  context: TutorContext;
  hints_used: TutorHint[];
  current_step: number;
  max_steps: number;
  completed: boolean;
  student_responses: string[];
  created_at: Date;
}

export class AITutor {
  private theoryContent: { [lesson: number]: string } = {};

  constructor() {
    this.loadTheoryContent();
  }

  private loadTheoryContent() {
    try {
      // Load theory content from markdown files
      const theoryFiles = [
        { lesson: 1, file: 'C1.md' },
        { lesson: 2, file: 'C23.md' },
        { lesson: 3, file: 'C23.md' },
        { lesson: 4, file: 'C4.md' },
        { lesson: 5, file: 'C56.md' }
      ];

      theoryFiles.forEach(({ lesson, file }) => {
        const filePath = path.join(process.cwd(), 'data_adaptive_learn', 'markdown_theory', file);
        if (fs.existsSync(filePath)) {
          this.theoryContent[lesson] = fs.readFileSync(filePath, 'utf-8');
        }
      });
    } catch (error) {
      console.error('Error loading theory content:', error);
    }
  }

  async createTutorSession(context: TutorContext): Promise<TutorSession> {
    const session: TutorSession = {
      id: `tutor_${Date.now()}`,
      context,
      hints_used: [],
      current_step: 0,
      max_steps: 4,
      completed: false,
      student_responses: [],
      created_at: new Date()
    };

    return session;
  }

  async generateHint(session: TutorSession, studentResponse?: string): Promise<TutorHint> {
    const { context } = session;
    
    // Add student response to session
    if (studentResponse) {
      session.student_responses.push(studentResponse);
    }

    const nextStep = session.current_step + 1;
    const isFinal = nextStep >= session.max_steps;

    try {
      const theoryContent = this.theoryContent[context.lesson_id] || '';
      
      const prompt = `
Bạn là gia sư AI thông minh, chuyên về toán học lớp 12. Hãy tạo gợi ý theo phương pháp Socratic để hướng dẫn học sinh tự khám phá ra lỗi sai.

THÔNG TIN BÀI TOÁN:
- Câu hỏi: ${context.question_content}
- Đáp án học sinh chọn: ${context.student_answer}
- Đáp án đúng: ${context.correct_answer}
- Giải thích: ${context.explanation}
- Độ khó: ${context.difficulty}
- Bài: ${context.lesson_id}

LÝ THUYẾT LIÊN QUAN:
${theoryContent.substring(0, 2000)}...

BƯỚC HIỆN TẠI: ${nextStep}/${session.max_steps}
${isFinal ? 'ĐÂY LÀ BƯỚC CUỐI CÙNG' : ''}

YÊU CẦU:
1. Nếu là bước đầu (step 1): Nhắc lại khái niệm cơ bản và hướng dẫn phân tích bài toán
2. Nếu là bước 2: Gợi ý phương pháp giải hoặc công thức áp dụng
3. Nếu là bước 3: Kiểm tra các lỗi phổ biến (dấu, điều kiện, miền xác định...)
4. Nếu là bước cuối: Đưa ra lời giải rút gọn và bài tương tự để luyện tập

PHONG CÁCH:
- Thân thiện, động viên
- Sử dụng phương pháp Socratic (đặt câu hỏi để học sinh tự suy nghĩ)
- KHÔNG đưa ra đáp án trực tiếp
- Sử dụng ví dụ cụ thể và hình ảnh trực quan

Trả về JSON với format:
{
  "content": "Nội dung gợi ý",
  "type": "concept|step|check|solution",
  "is_final": ${isFinal}
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là gia sư AI thông minh, chuyên về toán học. Hãy sử dụng phương pháp Socratic để hướng dẫn học sinh tự khám phá ra lỗi sai thay vì đưa ra đáp án trực tiếp."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const result = JSON.parse(response.choices[0].message.content || '{"content": "Hãy thử lại nhé!", "type": "concept", "is_final": false}');
      
      const hint: TutorHint = {
        id: `hint_${session.id}_${nextStep}`,
        level: nextStep,
        content: result.content,
        type: result.type || 'concept',
        is_final: result.is_final || isFinal
      };

      session.hints_used.push(hint);
      session.current_step = nextStep;
      session.completed = isFinal;

      return hint;
    } catch (error) {
      console.error('Error generating hint:', error);
      
      // Fallback hint
      const fallbackHints = [
        "Hãy đọc lại đề bài cẩn thận và xác định những gì đề bài yêu cầu.",
        "Thử nghĩ về các công thức hoặc phương pháp có thể áp dụng cho bài này.",
        "Kiểm tra lại các bước tính toán và chú ý đến dấu, điều kiện.",
        "Hãy thử giải bài tương tự với số liệu đơn giản hơn để hiểu rõ phương pháp."
      ];

      const hint: TutorHint = {
        id: `hint_${session.id}_${nextStep}`,
        level: nextStep,
        content: fallbackHints[nextStep - 1] || "Hãy thử lại nhé!",
        type: 'concept',
        is_final: isFinal
      };

      session.hints_used.push(hint);
      session.current_step = nextStep;
      session.completed = isFinal;

      return hint;
    }
  }

  async checkStudentResponse(session: TutorSession, studentResponse: string): Promise<{
    is_correct: boolean;
    feedback: string;
    needs_more_hints: boolean;
  }> {
    try {
      const { context } = session;
      
      const prompt = `
Kiểm tra câu trả lời của học sinh:

BÀI TOÁN: ${context.question_content}
ĐÁP ÁN ĐÚNG: ${context.correct_answer}
CÂU TRẢ LỜI CỦA HỌC SINH: ${studentResponse}
GIẢI THÍCH: ${context.explanation}

Yêu cầu:
1. Đánh giá xem câu trả lời có đúng không (đúng/sai/gần đúng)
2. Đưa ra phản hồi ngắn gọn, động viên
3. Xác định xem có cần thêm gợi ý không

Trả về JSON:
{
  "is_correct": true/false,
  "feedback": "Phản hồi ngắn gọn",
  "needs_more_hints": true/false
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên toán học. Hãy đánh giá câu trả lời của học sinh một cách công bằng và động viên."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{"is_correct": false, "feedback": "Hãy thử lại!", "needs_more_hints": true}');
      
      return {
        is_correct: result.is_correct || false,
        feedback: result.feedback || "Hãy thử lại!",
        needs_more_hints: result.needs_more_hints !== false
      };
    } catch (error) {
      console.error('Error checking student response:', error);
      
      return {
        is_correct: false,
        feedback: "Hãy thử lại nhé!",
        needs_more_hints: true
      };
    }
  }

  async generateRetestQuestions(session: TutorSession, count: number = 5): Promise<any[]> {
    try {
      const { context } = session;
      
      const prompt = `
Tạo ${count} câu hỏi isomorphic (cùng dạng, cùng độ khó) để kiểm tra lại sau khi học sinh đã được hướng dẫn:

BÀI TOÁN GỐC: ${context.question_content}
ĐÁP ÁN ĐÚNG: ${context.correct_answer}
GIẢI THÍCH: ${context.explanation}
ĐỘ KHÓ: ${context.difficulty}
BÀI: ${context.lesson_id}

Yêu cầu:
1. Giữ nguyên dạng bài và độ khó
2. Thay đổi số liệu, biến số, hoặc ngữ cảnh
3. Đảm bảo độ khó tương đương
4. Tạo câu hỏi trắc nghiệm với 4 đáp án

Trả về JSON:
{
  "questions": [
    {
      "id": "retest_1",
      "lesson_id": ${context.lesson_id},
      "difficulty": "${context.difficulty}",
      "difficulty_name": "${context.difficulty === 'N' ? 'Nhận biết' : context.difficulty === 'H' ? 'Thông hiểu' : 'Vận dụng'}",
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
            content: "Bạn là chuyên gia tạo câu hỏi toán học. Hãy tạo các câu hỏi isomorphic chất lượng cao để kiểm tra khả năng áp dụng kiến thức của học sinh."
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
      console.error('Error generating retest questions:', error);
      return [];
    }
  }

  async generateTheorySummary(lessonId: number, problemType: string): Promise<string> {
    try {
      const theoryContent = this.theoryContent[lessonId] || '';
      
      const prompt = `
Tóm tắt lý thuyết cho Bài ${lessonId}, dạng bài ${problemType}:

NỘI DUNG LÝ THUYẾT:
${theoryContent.substring(0, 3000)}...

Yêu cầu:
1. Tóm tắt ngắn gọn các khái niệm cốt lõi
2. Liệt kê các công thức quan trọng
3. Nêu các bước giải cơ bản
4. Chỉ ra các lỗi thường gặp
5. Đưa ra ví dụ minh họa

Trả về nội dung tóm tắt bằng tiếng Việt, dễ hiểu cho học sinh lớp 12.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên toán học có kinh nghiệm. Hãy tóm tắt lý thuyết một cách dễ hiểu và có cấu trúc."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5
      });

      return response.choices[0].message.content || "Không thể tạo tóm tắt lý thuyết.";
    } catch (error) {
      console.error('Error generating theory summary:', error);
      return "Không thể tạo tóm tắt lý thuyết.";
    }
  }

  async generateWorkedExample(lessonId: number, problemType: string): Promise<string> {
    try {
      const theoryContent = this.theoryContent[lessonId] || '';
      
      const prompt = `
Tạo ví dụ minh họa cho Bài ${lessonId}, dạng bài ${problemType}:

NỘI DUNG LÝ THUYẾT:
${theoryContent.substring(0, 2000)}...

Yêu cầu:
1. Tạo một bài toán cụ thể
2. Giải từng bước một cách chi tiết
3. Giải thích tại sao làm như vậy
4. Chỉ ra các điểm cần chú ý
5. Đưa ra kết luận

Trả về ví dụ minh họa bằng tiếng Việt, dễ hiểu cho học sinh lớp 12.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên toán học có kinh nghiệm. Hãy tạo ví dụ minh họa chi tiết và dễ hiểu."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6
      });

      return response.choices[0].message.content || "Không thể tạo ví dụ minh họa.";
    } catch (error) {
      console.error('Error generating worked example:', error);
      return "Không thể tạo ví dụ minh họa.";
    }
  }
}

// Export singleton instance
export const aiTutor = new AITutor();
