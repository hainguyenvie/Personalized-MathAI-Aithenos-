import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getChatResponse(message: string, context?: string): Promise<string> {
  try {
    const systemPrompt = `Bạn là một trợ lý AI thông minh chuyên về toán học cho học sinh Việt Nam lớp 9. 
    Hãy trả lời bằng tiếng Việt, thân thiện và dễ hiểu. 
    Giải thích từng bước một cách chi tiết khi giải toán.
    Khuyến khích học sinh suy nghĩ và đưa ra gợi ý thay vì đưa ra đáp án trực tiếp.
    ${context ? `\nBối cảnh: ${context}` : ''}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.";
  }
}

export async function generateMiniQuiz(topic: string, difficulty: number): Promise<{
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}[]> {
  try {
    const prompt = `Tạo 3 câu hỏi trắc nghiệm toán học về chủ đề "${topic}" với độ khó ${difficulty}/5 cho học sinh lớp 9. 
    Trả lời dưới dạng JSON với format:
    {
      "questions": [
        {
          "question": "câu hỏi",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "đáp án đúng",
          "explanation": "giải thích chi tiết"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Bạn là chuyên gia tạo câu hỏi toán học. Hãy trả lời bằng JSON hợp lệ."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    return result.questions || [];
  } catch (error) {
    console.error("Error generating mini quiz:", error);
    return [];
  }
}