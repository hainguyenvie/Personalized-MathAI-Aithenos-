export const enhancedQuestions = [
  // ===== BASIC ARITHMETIC (Grade 6-7 Level) =====
  {
    id: "arith_001",
    subject: "math",
    topic: "basic-arithmetic", 
    difficulty: 1,
    question: "Lan có 45 viên kẹo. Cô ấy chia đều cho 9 bạn. Mỗi bạn được bao nhiêu viên?",
    options: JSON.stringify(["5 viên", "4 viên", "6 viên", "54 viên"]),
    correctAnswer: "5 viên",
    explanation: "45 ÷ 9 = 5 viên kẹo cho mỗi bạn",
    visualAid: "Hình ảnh 45 viên kẹo được chia thành 9 nhóm bằng nhau",
    misconceptions: JSON.stringify([
      { distractor: "54 viên", id: "M-ARITH-001", description: "addition_instead_division" },
      { distractor: "4 viên", id: "M-ARITH-002", description: "division_remainder_error" }
    ])
  },
  {
    id: "arith_002", 
    subject: "math",
    topic: "basic-arithmetic",
    difficulty: 2,
    question: "Một cửa hàng bán 127 chiếc áo vào buổi sáng và 89 chiếc áo vào buổi chiều. Tổng cộng bán được bao nhiêu chiếc áo?",
    options: JSON.stringify(["216 chiếc", "206 chiếc", "38 chiếc", "226 chiếc"]),
    correctAnswer: "216 chiếc", 
    explanation: "127 + 89 = 216 chiếc áo",
    misconceptions: JSON.stringify([
      { distractor: "206 chiếc", id: "M-ARITH-003", description: "addition_carrying_error" },
      { distractor: "38 chiếc", id: "M-ARITH-004", description: "subtraction_instead_addition" }
    ])
  },
  {
    id: "arith_003",
    subject: "math", 
    topic: "basic-arithmetic",
    difficulty: 3,
    question: "Một trường học có 12 lớp, mỗi lớp có 28 học sinh. Tổng số học sinh của trường là:",
    options: JSON.stringify(["336 học sinh", "40 học sinh", "296 học sinh", "346 học sinh"]),
    correctAnswer: "336 học sinh",
    explanation: "12 × 28 = 336 học sinh",
    misconceptions: JSON.stringify([
      { distractor: "40 học sinh", id: "M-ARITH-005", description: "addition_instead_multiplication" },
      { distractor: "296 học sinh", id: "M-ARITH-006", description: "multiplication_algorithm_error" }
    ])
  },

  // ===== FRACTIONS (Grade 7-8 Level) =====
  {
    id: "frac_001",
    subject: "math",
    topic: "fractions", 
    difficulty: 2,
    question: "Tính 1/4 + 1/6 = ?",
    options: JSON.stringify(["5/12", "2/10", "1/5", "6/24"]),
    correctAnswer: "5/12",
    explanation: "Quy đồng mẫu số: 1/4 = 3/12, 1/6 = 2/12. Vậy 3/12 + 2/12 = 5/12",
    misconceptions: JSON.stringify([
      { distractor: "2/10", id: "M-FRAC-001", description: "add_numerators_denominators_separately" },
      { distractor: "6/24", id: "M-FRAC-002", description: "multiply_instead_add_fractions" }
    ])
  },
  {
    id: "frac_002",
    subject: "math",
    topic: "fractions",
    difficulty: 3, 
    question: "Nam ăn 2/5 cái bánh pizza, Hương ăn 1/3 cái bánh pizza. Họ ăn tất cả bao nhiêu phần bánh?",
    options: JSON.stringify(["11/15", "3/8", "2/8", "1/2"]),
    correctAnswer: "11/15",
    explanation: "2/5 + 1/3 = 6/15 + 5/15 = 11/15 cái bánh pizza",
    visualAid: "Hình tròn chia thành 15 phần, tô màu 11 phần",
    misconceptions: JSON.stringify([
      { distractor: "3/8", id: "M-FRAC-001", description: "add_numerators_denominators_separately" },
      { distractor: "1/2", id: "M-FRAC-003", description: "estimation_instead_calculation" }
    ])
  },

  // ===== GEOMETRY (Grade 8-9 Level) =====
  {
    id: "geo_001",
    subject: "math",
    topic: "geometry",
    difficulty: 2,
    question: "Một hình chữ nhật có chiều dài 12cm và chiều rộng 8cm. Chu vi của hình chữ nhật là:",
    options: JSON.stringify(["40cm", "96cm²", "20cm", "32cm"]),
    correctAnswer: "40cm",
    explanation: "Chu vi hình chữ nhật = 2 × (chiều dài + chiều rộng) = 2 × (12 + 8) = 2 × 20 = 40cm",
    misconceptions: JSON.stringify([
      { distractor: "96cm²", id: "M-GEO-001", description: "area_instead_perimeter" },
      { distractor: "20cm", id: "M-GEO-002", description: "add_sides_no_multiply_by_2" },
      { distractor: "32cm", id: "M-GEO-003", description: "multiply_only_two_sides" }
    ])
  },
  {
    id: "geo_002", 
    subject: "math",
    topic: "geometry",
    difficulty: 3,
    question: "Một tam giác vuông có hai cạnh góc vuông là 6cm và 8cm. Cạnh huyền có độ dài:",
    options: JSON.stringify(["10cm", "14cm", "48cm", "100cm"]),
    correctAnswer: "10cm",
    explanation: "Áp dụng định lý Pythagoras: c² = a² + b² = 6² + 8² = 36 + 64 = 100, suy ra c = 10cm",
    misconceptions: JSON.stringify([
      { distractor: "14cm", id: "M-GEO-004", description: "add_legs_instead_pythagorean" },
      { distractor: "48cm", id: "M-GEO-005", description: "multiply_legs_instead_pythagorean" },
      { distractor: "100cm", id: "M-GEO-006", description: "square_sum_without_square_root" }
    ])
  },
  {
    id: "geo_003",
    subject: "math",
    topic: "geometry", 
    difficulty: 4,
    question: "Một hình tròn có bán kính 7cm. Diện tích của hình tròn là (lấy π ≈ 3.14):",
    options: JSON.stringify(["153.86cm²", "43.96cm", "49cm²", "21.98cm"]),
    correctAnswer: "153.86cm²",
    explanation: "Diện tích hình tròn = π × r² = 3.14 × 7² = 3.14 × 49 = 153.86cm²",
    misconceptions: JSON.stringify([
      { distractor: "43.96cm", id: "M-GEO-007", description: "circumference_instead_area" },
      { distractor: "49cm²", id: "M-GEO-008", description: "forgot_pi_in_area_formula" },
      { distractor: "21.98cm", id: "M-GEO-009", description: "diameter_times_pi_instead_area" }
    ])
  },

  // ===== LINEAR EQUATIONS (Grade 8-9 Level) =====
  {
    id: "linear_001",
    subject: "math", 
    topic: "linear-equation",
    difficulty: 2,
    question: "Giải phương trình: x + 15 = 23",
    options: JSON.stringify(["x = 8", "x = 38", "x = 15", "x = 23"]),
    correctAnswer: "x = 8",
    explanation: "x = 23 - 15 = 8",
    misconceptions: JSON.stringify([
      { distractor: "x = 38", id: "M-LINEAR-001", description: "add_instead_subtract_when_solving" },
      { distractor: "x = 15", id: "M-LINEAR-002", description: "copy_constant_term" },
      { distractor: "x = 23", id: "M-LINEAR-003", description: "copy_result_value" }
    ])
  },
  {
    id: "linear_002",
    subject: "math",
    topic: "linear-equation", 
    difficulty: 3,
    question: "Giải phương trình: 3x - 7 = 11",
    options: JSON.stringify(["x = 6", "x = 4", "x = 18", "x = 1"]),
    correctAnswer: "x = 6",
    explanation: "3x = 11 + 7 = 18, suy ra x = 18 ÷ 3 = 6",
    misconceptions: JSON.stringify([
      { distractor: "x = 4", id: "M-LINEAR-004", description: "subtract_instead_add_when_transposing" },
      { distractor: "x = 18", id: "M-LINEAR-005", description: "forget_to_divide_by_coefficient" },
      { distractor: "x = 1", id: "M-LINEAR-006", description: "arithmetic_error_in_division" }
    ])
  },
  {
    id: "linear_003",
    subject: "math",
    topic: "linear-equation",
    difficulty: 4,
    question: "Tuổi của bố hiện tại gấp 3 lần tuổi con. Sau 12 năm nữa, tuổi bố sẽ gấp 2 lần tuổi con. Hỏi tuổi con hiện tại?",
    options: JSON.stringify(["12 tuổi", "18 tuổi", "24 tuổi", "6 tuổi"]),
    correctAnswer: "12 tuổi", 
    explanation: "Gọi tuổi con hiện tại là x. Ta có: 3x + 12 = 2(x + 12). Giải được x = 12",
    misconceptions: JSON.stringify([
      { distractor: "18 tuổi", id: "M-LINEAR-007", description: "word_problem_setup_error" },
      { distractor: "24 tuổi", id: "M-LINEAR-008", description: "father_age_instead_child_age" },
      { distractor: "6 tuổi", id: "M-LINEAR-009", description: "arithmetic_error_in_solving" }
    ])
  },

  // ===== QUADRATIC EQUATIONS (Grade 9 Level) =====
  {
    id: "quad_001",
    subject: "math",
    topic: "quadratic-equation",
    difficulty: 3,
    question: "Giải phương trình: x² - 16 = 0",
    options: JSON.stringify(["x = ±4", "x = 4", "x = 16", "x = ±16"]),
    correctAnswer: "x = ±4",
    explanation: "x² = 16, suy ra x = ±√16 = ±4",
    misconceptions: JSON.stringify([
      { distractor: "x = 4", id: "M-QUAD-001", description: "missing_negative_solution" },
      { distractor: "x = 16", id: "M-QUAD-002", description: "no_square_root_operation" },
      { distractor: "x = ±16", id: "M-QUAD-003", description: "confusion_about_square_root" }
    ])
  },
  {
    id: "quad_002", 
    subject: "math",
    topic: "quadratic-equation",
    difficulty: 4,
    question: "Phương trình x² + 6x + 9 = 0 có nghiệm là:",
    options: JSON.stringify(["x = -3 (nghiệm kép)", "x = 3", "x = -9", "Vô nghiệm"]),
    correctAnswer: "x = -3 (nghiệm kép)",
    explanation: "x² + 6x + 9 = (x + 3)² = 0, suy ra x = -3 (nghiệm kép)",
    misconceptions: JSON.stringify([
      { distractor: "x = 3", id: "M-QUAD-004", description: "sign_error_in_factoring" },
      { distractor: "x = -9", id: "M-QUAD-005", description: "confusion_discriminant_with_root" },
      { distractor: "Vô nghiệm", id: "M-QUAD-006", description: "discriminant_misinterpretation" }
    ])
  },

  // ===== SYSTEM OF EQUATIONS (Grade 9 Level) =====
  {
    id: "system_001",
    subject: "math",
    topic: "system-equations",
    difficulty: 3,
    question: "Giải hệ phương trình: {x + y = 7; x - y = 1}",
    options: JSON.stringify(["x = 4, y = 3", "x = 3, y = 4", "x = 6, y = 1", "x = 5, y = 2"]),
    correctAnswer: "x = 4, y = 3",
    explanation: "Cộng hai phương trình: 2x = 8 → x = 4. Thay vào: y = 7 - 4 = 3",
    misconceptions: JSON.stringify([
      { distractor: "x = 3, y = 4", id: "M-SYSTEM-001", description: "swap_variable_values" },
      { distractor: "x = 6, y = 1", id: "M-SYSTEM-002", description: "substitution_error" },
      { distractor: "x = 5, y = 2", id: "M-SYSTEM-003", description: "arithmetic_error_in_solving" }
    ])
  },

  // ===== FUNCTIONS (Grade 9 Level) =====
  {
    id: "func_001",
    subject: "math",
    topic: "linear-function",
    difficulty: 3,
    question: "Cho hàm số f(x) = 2x + 3. Tính f(5):",
    options: JSON.stringify(["13", "10", "8", "25"]),
    correctAnswer: "13",
    explanation: "f(5) = 2×5 + 3 = 10 + 3 = 13",
    misconceptions: JSON.stringify([
      { distractor: "10", id: "M-FUNC-001", description: "forgot_constant_term" },
      { distractor: "8", id: "M-FUNC-002", description: "subtraction_instead_addition" },
      { distractor: "25", id: "M-FUNC-003", description: "square_input_instead_multiply" }
    ])
  },
  {
    id: "func_002",
    subject: "math", 
    topic: "quadratic-function",
    difficulty: 4,
    question: "Hàm số y = x² - 4x + 3 có đỉnh parabol tại điểm:",
    options: JSON.stringify(["(2, -1)", "(4, 3)", "(-2, 15)", "(0, 3)"]),
    correctAnswer: "(2, -1)",
    explanation: "Đỉnh có hoành độ x = -b/2a = 4/2 = 2. Tung độ y = 2² - 4×2 + 3 = -1",
    misconceptions: JSON.stringify([
      { distractor: "(4, 3)", id: "M-FUNC-004", description: "use_coefficient_as_coordinate" },
      { distractor: "(-2, 15)", id: "M-FUNC-005", description: "sign_error_in_vertex_formula" },
      { distractor: "(0, 3)", id: "M-FUNC-006", description: "y_intercept_instead_vertex" }
    ])
  },

  // ===== PROBABILITY & STATISTICS (Grade 9 Level) =====
  {
    id: "prob_001",
    subject: "math",
    topic: "probability",
    difficulty: 2,
    question: "Một hộp có 5 viên bi đỏ và 3 viên bi xanh. Xác suất lấy được viên bi đỏ là:",
    options: JSON.stringify(["5/8", "3/8", "5/3", "1/2"]),
    correctAnswer: "5/8", 
    explanation: "Tổng số bi: 5 + 3 = 8. Xác suất bi đỏ = 5/8",
    misconceptions: JSON.stringify([
      { distractor: "3/8", id: "M-PROB-001", description: "favorable_unfavorable_confusion" },
      { distractor: "5/3", id: "M-PROB-002", description: "ratio_instead_probability" },
      { distractor: "1/2", id: "M-PROB-003", description: "equal_probability_assumption" }
    ])
  },

  // ===== REAL-WORLD APPLICATIONS =====
  {
    id: "app_001",
    subject: "math",
    topic: "basic-arithmetic",
    difficulty: 3,
    question: "Một gia đình tiêu thụ trung bình 150 lít nước mỗi ngày. Trong một tháng 30 ngày, họ tiêu thụ bao nhiêu lít nước?",
    options: JSON.stringify(["4500 lít", "180 lít", "5 lít", "4000 lít"]),
    correctAnswer: "4500 lít",
    explanation: "150 lít/ngày × 30 ngày = 4500 lít",
    visualAid: "Biểu đồ cột thể hiện lượng nước tiêu thụ hàng ngày trong tháng"
  },
  {
    id: "app_002",
    subject: "math", 
    topic: "linear-equation",
    difficulty: 4,
    question: "Một cửa hàng bán điện thoại với giá gốc x đồng. Nếu tăng giá 20% rồi giảm 10%, giá cuối cùng sẽ là 2.160.000 đồng. Tìm giá gốc x:",
    options: JSON.stringify(["2.000.000 đồng", "1.800.000 đồng", "2.400.000 đồng", "1.944.000 đồng"]),
    correctAnswer: "2.000.000 đồng",
    explanation: "Giá sau tăng 20%: 1.2x. Giá sau giảm 10%: 1.2x × 0.9 = 1.08x = 2.160.000. Suy ra x = 2.000.000",
    misconceptions: JSON.stringify([
      { distractor: "1.800.000 đồng", id: "M-APP-001", description: "percentage_calculation_error" },
      { distractor: "2.400.000 đồng", id: "M-APP-002", description: "add_percentages_instead_multiply" },
      { distractor: "1.944.000 đồng", id: "M-APP-003", description: "decimal_calculation_error" }
    ])
  }
];
