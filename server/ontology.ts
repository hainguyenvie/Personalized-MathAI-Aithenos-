export type KnowledgeFrame = {
  id: string;
  conceptName: string;
  definition: string;
  prerequisites: string[];
  learningObjectives: string[];
  commonMisconceptions: Array<{
    id: string;
    description: string;
    errorPattern: string;
    associatedPrerequisite?: string;
    scaffoldingHints: string[];
    workedExample?: string;
  }>;
};

export const FRAMES: Record<string, KnowledgeFrame> = {
  "basic-arithmetic": {
    id: "MATH-AR-01",
    conceptName: "Phép nhân và diện tích hình chữ nhật",
    definition: "Diện tích hình chữ nhật bằng tích của chiều dài và chiều rộng: S = a × b.",
    prerequisites: [],
    learningObjectives: [
      "Nhân hai số tự nhiên",
      "Liên hệ phép nhân với mô hình diện tích",
    ],
    commonMisconceptions: [
      {
        id: "M-AREA-ADD",
        description: "Cộng các cạnh để tính diện tích",
        errorPattern: "add_sides_instead_of_multiply",
        scaffoldingHints: [
          "Đếm số ô vuông trong lưới m×n để thấy đó là phép nhân, không phải cộng",
          "Hãy viết biểu thức 5×3 thay vì 5+3",
        ],
        workedExample: "Hình chữ nhật 5×3 có 15 ô vuông đơn vị → S=15",
      },
      {
        id: "M-AREA-PER",
        description: "Nhầm diện tích với chu vi",
        errorPattern: "perimeter_instead_of_area",
        scaffoldingHints: [
          "Chu vi đo 'độ dài xung quanh', diện tích đo 'phần bề mặt bên trong'",
          "Với 5 và 3: chu vi = 2×(5+3)=16, diện tích = 5×3=15",
        ],
      },
      {
        id: "M-AREA-DOUBLE",
        description: "Nhân đôi diện tích không cần thiết",
        errorPattern: "double_area_error",
        scaffoldingHints: [
          "Diện tích đã là tích của 2 cạnh, không cần nhân 2 lần nữa",
        ],
      },
    ],
  },
  "linear-equation": {
    id: "ALG1-01-01",
    conceptName: "Giải phương trình bậc nhất ax+b=c",
    definition: "Đưa về ax = c-b rồi chia 2 vế cho a (a≠0) để tìm x = (c-b)/a.",
    prerequisites: ["basic-arithmetic"],
    learningObjectives: [
      "Thao tác chuyển vế đổi dấu",
      "Chia hai vế cho cùng một số",
    ],
    commonMisconceptions: [
      {
        id: "M-TRANS-SIGN",
        description: "Sai dấu khi chuyển vế",
        errorPattern: "sign_error_transposition",
        associatedPrerequisite: "basic-arithmetic",
        scaffoldingHints: [
          "Khi chuyển +5 sang vế kia phải trở thành −5",
          "Kiểm tra lại bằng cách thế nghiệm vào phương trình ban đầu",
        ],
      },
    ],
  },
};

export function getFrameById(id: string): KnowledgeFrame | undefined {
  return FRAMES[id];
}

export function findMisconceptionFrameByError(errorPattern: string): KnowledgeFrame | undefined {
  for (const frame of Object.values(FRAMES)) {
    if (frame.commonMisconceptions.some(m => m.errorPattern === errorPattern)) return frame;
  }
  return undefined;
}



