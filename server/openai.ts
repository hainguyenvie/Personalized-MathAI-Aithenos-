import OpenAI from "openai";
import { getFrameById, findMisconceptionFrameByError } from "./ontology";
import { tutorKnowledgeBase, selectTutorResponse } from "./ai-knowledge-base";

// Initialize OpenAI client only if the API key is present, so the app can run without AI features
const apiKey = process.env.OPENAI_API_KEY;
const openaiEnabled = Boolean(apiKey);
const openai = openaiEnabled ? new OpenAI({ apiKey }) : null;

export async function getChatResponse(
  message: string, 
  context?: string, 
  errorPatterns?: { misconceptionId: string; question: string; chosen: string; correct: string; }[]
): Promise<string> {
  try {
    if (!openaiEnabled || !openai) {
      // Use knowledge base for offline responses
      const misconceptionId = errorPatterns?.[0]?.misconceptionId;
      return selectTutorResponse(message, misconceptionId, 'confused', 'intermediate');
    }

    // Enhanced context building with knowledge base
    let enhancedContext = context || '';
    let knowledgeContext = '';
    
    if (errorPatterns && errorPatterns.length > 0) {
      const recentError = errorPatterns[0];
      const topic = extractTopicFromMisconception(recentError.misconceptionId);
      
      if (topic && tutorKnowledgeBase.topicFrames[topic]) {
        const frame = tutorKnowledgeBase.topicFrames[topic];
        knowledgeContext = `
KHUNG KIẾN THỨC CHỦ ĐỀ: ${topic}
Nguyên lý cốt lõi: ${frame.keyPrinciples.join('; ')}
Lỗi thường gặp: ${frame.commonErrors.join('; ')}
Bước hướng dẫn: ${frame.scaffoldingSteps?.join('; ') || 'Theo từng bước cơ bản'}

CHI TIẾT LỖI:
Câu hỏi: "${recentError.question}"
Học sinh chọn: "${recentError.chosen}"
Đáp án đúng: "${recentError.correct}"
        `;
      }
      
      // Add misconception-specific intervention
      if (tutorKnowledgeBase.misconceptionInterventions[recentError.misconceptionId]) {
        const intervention = tutorKnowledgeBase.misconceptionInterventions[recentError.misconceptionId];
        knowledgeContext += `
PHƯƠNG PHÁP KHẮC PHỤC:
Giải thích: ${intervention.explanation}
Ví dụ tương tự: ${intervention.analogy}
Cách làm đúng: ${intervention.correctMethod}
        `;
      }
    }

    const systemPrompt = `Bạn là Stella - một trợ lý AI Socratic thông minh và thân thiện, chuyên về toán học cho học sinh Việt Nam lớp 9.

NGUYÊN TẮC CỐT LÕI:
- Sử dụng phương pháp Socratic: đặt câu hỏi để dẫn dắt học sinh tự khám phá
- KHÔNG bao giờ đưa ra đáp án trực tiếp
- Khuyến khích học sinh giải thích suy nghĩ của mình
- Thể hiện sự kiên nhẫn và động viên
- Sử dụng ví dụ cụ thể và hình ảnh trực quan
- Kết nối với thực tế để tạo ý nghĩa

PHONG CÁCH GIAO TIẾP:
- Thân thiện, gần gũi như một người bạn thông minh
- Sử dụng emoji phù hợp để tạo không khí tích cực  
- Đặt câu hỏi mở để khích lệ suy nghĩ
- Thể hiện sự hào hứng khi học sinh tiến bộ

${enhancedContext ? `\nBối cảnh bài toán: ${enhancedContext}` : ''}
${knowledgeContext}

Hãy phản hồi theo phong cách Socratic, giúp học sinh tự khám phá ra lỗi sai và cách sửa chữa.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      max_tokens: 600,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return response.choices[0].message.content || "Hmm, có vẻ như tôi cần suy nghĩ thêm về câu hỏi này. Bạn có thể chia sẻ thêm về cách bạn tiếp cận bài toán này không? 🤔";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Xin lỗi, tôi đang gặp một chút khó khăn kỹ thuật. Nhưng đừng lo! Hãy thử chia nhỏ bài toán thành các bước đơn giản hơn và làm từng bước một nhé! 💪";
  }
}

// Helper function to extract topic from misconception ID
function extractTopicFromMisconception(misconceptionId: string): string | null {
  const topicMap: { [key: string]: string } = {
    'M-FRAC': 'fractions',
    'M-GEO': 'geometry', 
    'M-LINEAR': 'linear-equation',
    'M-QUAD': 'quadratic-equation',
    'M-ARITH': 'basic-arithmetic'
  };
  
  for (const [prefix, topic] of Object.entries(topicMap)) {
    if (misconceptionId.startsWith(prefix)) {
      return topic;
    }
  }
  return null;
}

export async function generateMiniQuiz(topic: string, difficulty: number): Promise<{
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}[]> {
  try {
    if (!openaiEnabled || !openai) {
      // Provide a simple fallback so the app remains usable without an API key
      return [
        {
          question: `Câu hỏi mẫu về chủ đề "${topic}": Giá trị của 2x khi x = ${difficulty + 1} là bao nhiêu?`,
          options: ["2", "4", `${2 * (difficulty + 1)}`, "8"],
          correctAnswer: `${2 * (difficulty + 1)}`,
          explanation: `Thay x = ${difficulty + 1} vào biểu thức 2x, ta được 2 * ${difficulty + 1} = ${2 * (difficulty + 1)}.`
        },
        {
          question: `Câu hỏi mẫu: Nếu a + b = ${difficulty + 5} và a = 2, thì b bằng bao nhiêu?`,
          options: ["1", `${difficulty + 3}`, "5", "7"],
          correctAnswer: `${difficulty + 3}`,
          explanation: `b = ${difficulty + 5} - 2 = ${difficulty + 3}.`
        },
        {
          question: `Câu hỏi mẫu: Diện tích hình chữ nhật có chiều dài ${difficulty + 3} và chiều rộng 2 là bao nhiêu?`,
          options: ["2", `${2 * (difficulty + 3)}`, "6", "8"],
          correctAnswer: `${2 * (difficulty + 3)}`,
          explanation: `S = dài * rộng = ${difficulty + 3} * 2 = ${2 * (difficulty + 3)}.`
        }
      ];
    }
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
      model: "gpt-4o-mini",
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

// Build RAG-like context from ontology using a simple errorPattern or concept id found in the context string
export function buildOntologyContext(rawContext?: string): string | undefined {
  if (!rawContext) return undefined;
  try {
    // naive extraction: look for errorPattern tokens used in our demo maps
    const patterns = [
      'perimeter_instead_of_area',
      'add_sides_instead_of_multiply',
      'double_area_error',
      'sign_error_transposition',
    ];
    const found = patterns.find(p => rawContext.includes(p));
    if (found) {
      const frame = findMisconceptionFrameByError(found);
      if (frame) {
        const hints = frame.commonMisconceptions.find(m => m.errorPattern === found)?.scaffoldingHints || [];
        return `Khung kiến thức: ${frame.conceptName}\nĐịnh nghĩa: ${frame.definition}\nGợi ý: ${hints.join(' | ')}`;
      }
    }
    // fallback: find by simple frame id
    const idMatch = rawContext.match(/FRAME:([A-Z0-9\-]+)/);
    if (idMatch) {
      const fr = getFrameById(idMatch[1]);
      if (fr) return `Khung kiến thức: ${fr.conceptName}\nĐịnh nghĩa: ${fr.definition}`;
    }
  } catch {}
  return undefined;
}