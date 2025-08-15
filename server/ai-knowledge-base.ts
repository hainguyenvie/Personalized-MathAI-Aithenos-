export const tutorKnowledgeBase = {
  // Socratic question templates organized by cognitive level
  socraticQuestions: {
    clarification: [
      "Bạn có thể giải thích rõ hơn cách bạn đã nghĩ về bài này?",
      "Khi bạn nói '{student_answer}', bạn có ý gì chính xác?",
      "Bạn có thể cho tôi một ví dụ cụ thể về điều bạn vừa nói?",
      "Bạn nghĩ rằng điều gì là quan trọng nhất trong bài toán này?"
    ],
    assumptions: [
      "Tại sao bạn nghĩ rằng {assumption} là đúng?",
      "Bạn có chắc chắn về giả thiết này không? Hãy kiểm tra lại.",
      "Nếu {assumption} không đúng thì sao?",
      "Còn cách nào khác để tiếp cận bài toán này không?"
    ],
    evidence: [
      "Bằng chứng nào hỗ trợ cho cách làm này?",
      "Làm thế nào bạn biết được {student_claim}?",
      "Quy tắc toán học nào áp dụng ở đây?",
      "Bạn có thể kiểm tra lại kết quả này bằng cách nào?"
    ],
    implications: [
      "Nếu kết quả này đúng, điều gì sẽ xảy ra tiếp theo?",
      "Kết quả này có hợp lý với những gì chúng ta đã biết không?",
      "Hãy thử thế kết quả vào bài toán gốc xem có đúng không?",
      "Cách làm này có áp dụng được cho các bài tương tự không?"
    ],
    perspectives: [
      "Có cách nào khác để giải bài này không?",
      "Nếu một bạn khác làm khác bạn, ai đúng và tại sao?",
      "Phương pháp nào đơn giản hơn và tại sao?",
      "Bạn nghĩ thầy cô sẽ làm như thế nào?"
    ]
  },

  // Topic-specific knowledge frames
  topicFrames: {
    "basic-arithmetic": {
      keyPrinciples: [
        "Thứ tự thực hiện phép tính: ngoặc, lũy thừa, nhân chia, cộng trừ",
        "Tính chất giao hoán và kết hợp của phép cộng và nhân",
        "Quan hệ nghịch đảo giữa cộng-trừ và nhân-chia"
      ],
      commonErrors: [
        "Quên quy tắc thứ tự phép tính",
        "Nhầm lẫn giữa cộng và nhân trong bài toán có lời văn",
        "Sai sót trong tính nhẩm các phép tính cơ bản"
      ],
      scaffoldingSteps: [
        "Xác định phép tính nào cần làm trước",
        "Chia nhỏ các phép tính phức tạp",
        "Kiểm tra kết quả bằng phép tính nghịch đảo"
      ]
    },
    
    "fractions": {
      keyPrinciples: [
        "Phân số biểu thị mối quan hệ giữa phần và tổng thể",
        "Để cộng trừ phân số phải quy đồng mẫu số",
        "Nhân phân số: nhân tử với tử, mẫu với mẫu",
        "Chia phân số: nhân với nghịch đảo"
      ],
      commonErrors: [
        "Cộng trừ tử số và mẫu số riêng biệt",
        "Quên rút gọn phân số kết quả",
        "Nhầm lẫn giữa phép nhân và chia phân số"
      ],
      visualizations: [
        "Hình tròn chia thành các phần bằng nhau",
        "Thanh số chia đoạn để thể hiện phân số",
        "Lưới vuông để minh họa phép nhân phân số"
      ]
    },

    "geometry": {
      keyPrinciples: [
        "Chu vi là tổng độ dài các cạnh xung quanh hình",
        "Diện tích là số đo bề mặt bên trong hình",
        "Định lý Pythagoras: a² + b² = c² (tam giác vuông)",
        "Đơn vị chu vi là độ dài, đơn vị diện tích là bình phương độ dài"
      ],
      commonErrors: [
        "Nhầm lẫn công thức chu vi và diện tích",
        "Quên nhân 2 trong công thức chu vi hình chữ nhật", 
        "Sử dụng sai đơn vị đo lường"
      ],
      realWorldConnections: [
        "Chu vi: độ dài hàng rào quanh sân",
        "Diện tích: lượng sơn cần để sơn tường",
        "Thể tích: lượng nước chứa trong bể"
      ]
    },

    "linear-equation": {
      keyPrinciples: [
        "Phương trình là đẳng thức có chứa ẩn số",
        "Quy tắc chuyển vế: chuyển vế phải đổi dấu",
        "Mục tiêu: đưa ẩn số về một vế, số về vế kia",
        "Nghiệm là giá trị làm cho phương trình thành đẳng thức đúng"
      ],
      commonErrors: [
        "Quên đổi dấu khi chuyển vế",
        "Nhầm lẫn giữa cộng và nhân khi giải",
        "Không kiểm tra lại nghiệm tìm được"
      ],
      problemSolvingSteps: [
        "1. Chuyển các hạng tử chứa x về một vế",
        "2. Chuyển các số về vế còn lại",
        "3. Chia cả hai vế cho hệ số của x",
        "4. Kiểm tra nghiệm bằng cách thế vào phương trình gốc"
      ]
    },

    "quadratic-equation": {
      keyPrinciples: [
        "Phương trình bậc 2 có dạng ax² + bx + c = 0 (a ≠ 0)",
        "Có thể có 0, 1, hoặc 2 nghiệm thực",
        "Discriminant Δ = b² - 4ac quyết định số nghiệm",
        "Công thức nghiệm: x = (-b ± √Δ) / 2a"
      ],
      commonErrors: [
        "Quên nghiệm âm khi giải x² = a",
        "Nhầm lẫn dấu trong công thức nghiệm",
        "Không xét điều kiện Δ ≥ 0"
      ],
      solutionMethods: [
        "Phân tích thành nhân tử",
        "Công thức nghiệm (căn thức)",
        "Phương pháp hoàn thành bình phương"
      ]
    }
  },

  // Misconception-specific interventions
  misconceptionInterventions: {
    "M-FRAC-001": {
      explanation: "Khi cộng phân số, ta không thể cộng tử số với tử số và mẫu số với mẫu số riêng biệt.",
      analogy: "Giống như bạn không thể cộng 2 quả táo + 3 quả cam = 5 quả 'táo-cam'. Phải chuyển về cùng đơn vị trước.",
      correctMethod: "Để cộng phân số, ta phải quy đồng mẫu số trước, rồi cộng các tử số.",
      practice: "Hãy thử với 1/2 + 1/3. Đầu tiên tìm mẫu chung: 6. Sau đó: 3/6 + 2/6 = 5/6"
    },
    
    "M-GEO-001": {
      explanation: "Chu vi và diện tích là hai khái niệm hoàn toàn khác nhau.",
      analogy: "Chu vi như chiều dài dây kẽm quanh một mảnh vườn. Diện tích như lượng cỏ cần để trải đều trong vườn.",
      visualization: "Hãy tưởng tượng bạn đi bộ quanh biên của một hình - đó là chu vi. Còn diện tích là toàn bộ không gian bên trong.",
      checkMethod: "Kiểm tra đơn vị: chu vi đo bằng cm, m... còn diện tích đo bằng cm², m²..."
    },

    "M-LINEAR-001": {
      explanation: "Khi chuyển một số hạng từ vế này sang vế kia, phải đổi dấu của nó.",
      reasoning: "Vì bản chất ta đang cộng/trừ cùng một số ở cả hai vế để giữ nguyên đẳng thức.",
      mnemonic: "Nhớ câu: 'Chuyển vế phải đổi dấu, quy tắc vàng không bao giờ sai'",
      practice: "Ví dụ: x + 5 = 8. Chuyển +5 sang vế phải thành -5: x = 8 - 5 = 3"
    }
  },

  // Encouraging responses based on student emotional state
  emotionalSupport: {
    frustrated: [
      "Tôi hiểu bạn đang cảm thấy khó khăn. Hãy dừng lại một chút và thở sâu.",
      "Không sao cả, mọi người đều gặp khó khăn khi học toán. Điều quan trọng là không bỏ cuộc.",
      "Hãy chia nhỏ bài toán thành các bước đơn giản hơn. Chúng ta sẽ từng bước một."
    ],
    confused: [
      "Tôi thấy bạn đang băn khoăn. Hãy cùng xem lại từ đầu với cách tiếp cận khác.",
      "Có vẻ như có điều gì đó chưa rõ. Bạn có thể chỉ ra phần nào khó hiểu nhất?",
      "Đừng lo, sự nhầm lẫn là một phần tự nhiên của quá trình học. Hãy cùng làm rõ."
    ],
    confident: [
      "Tuyệt vời! Tôi thấy bạn đã nắm được ý tưởng. Hãy tiếp tục với bước tiếp theo.",
      "Bạn đang làm rất tốt! Sự tự tin này sẽ giúp bạn giải quyết những bài khó hơn.",
      "Chính xác! Bây giờ hãy thử áp dụng cách làm này vào một bài tương tự."
    ],
    improving: [
      "Tôi thấy bạn đang tiến bộ! Cách làm lần này đã tốt hơn nhiều.",
      "Tuyệt vời! Bạn đã sửa được lỗi từ lần trước. Điều này cho thấy bạn đang học hỏi.",
      "Có thể thấy rõ sự cải thiện trong cách suy nghĩ của bạn. Hãy tiếp tục như vậy!"
    ]
  },

  // Adaptive hints based on student proficiency level
  adaptiveHints: {
    beginner: [
      "Hãy đọc lại đề bài cẩn thận và gạch chân các thông tin quan trọng.",
      "Bạn có nhớ công thức hoặc quy tắc nào liên quan đến dạng bài này?",
      "Hãy thử vẽ hình hoặc viết ra những gì bạn biết trước."
    ],
    intermediate: [
      "Bạn đã biết các bước cơ bản. Hãy suy nghĩ xem bước nào áp dụng đầu tiên.",
      "Có vẻ như bạn đang đi đúng hướng. Hãy kiểm tra lại tính toán.",
      "Thử nghĩ xem có cách nào khác để tiếp cận bài toán này không?"
    ],
    advanced: [
      "Bạn có thể giải thích logic đằng sau cách làm này không?",
      "Hãy thử tối ưu hóa cách giải hoặc tìm phương pháp thanh lịch hơn.",
      "Bài toán này có thể mở rộng thành dạng tổng quát như thế nào?"
    ]
  }
};

// Helper function to select appropriate response
export function selectTutorResponse(
  studentInput: string, 
  misconceptionId?: string, 
  emotionalState?: string,
  proficiencyLevel?: string
): string {
  const kb = tutorKnowledgeBase;
  
  if (misconceptionId && kb.misconceptionInterventions[misconceptionId]) {
    const intervention = kb.misconceptionInterventions[misconceptionId];
    return `${intervention.explanation} ${intervention.analogy} ${intervention.correctMethod}`;
  }
  
  if (emotionalState && kb.emotionalSupport[emotionalState]) {
    const responses = kb.emotionalSupport[emotionalState];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default Socratic question
  const questionTypes = Object.keys(kb.socraticQuestions);
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  const questions = kb.socraticQuestions[randomType];
  return questions[Math.floor(Math.random() * questions.length)]
    .replace('{student_answer}', studentInput)
    .replace('{assumption}', 'giả thiết này')
    .replace('{student_claim}', 'điều bạn vừa nói');
}
