# Hệ thống Adaptive Learning - Aithenos

## Tổng quan

Hệ thống Adaptive Learning là một tính năng tiên tiến của Aithenos, sử dụng AI để tạo ra trải nghiệm học tập cá nhân hóa cho học sinh lớp 12. Hệ thống tự động điều chỉnh độ khó và nội dung học tập dựa trên khả năng của từng học sinh.

## Kiến trúc hệ thống

### 1. State Machine Flow

```
INIT → BUNDLE_N → EVAL_N → (SUPP_N → TUTOR_N)* → REVIEW_N → BUNDLE_H → EVAL_H → (SUPP_H → TUTOR_H)* → REVIEW_H → BUNDLE_V → EVAL_V → (SUPP_V → TUTOR_V)* → REVIEW_V → END
```

**Các trạng thái chính:**

- `INIT`: Khởi tạo phiên học tập
- `BUNDLE_X`: Tạo gói 5 câu hỏi cho độ khó X (N/H/V)
- `EVAL_X`: Đánh giá kết quả gói câu hỏi
- `SUPP_X`: Tạo gói bổ sung khi điểm < 4/5
- `TUTOR_X`: Kích hoạt gia sư AI khi vẫn không đạt
- `REVIEW_X`: Tổng kết và đánh giá sau khi hoàn thành độ khó X
- `END`: Kết thúc phiên học tập

### 2. Độ khó học tập

- **N (Nhận biết)**: Các câu hỏi cơ bản, kiểm tra khả năng nhận biết khái niệm
- **H (Thông hiểu)**: Các câu hỏi trung bình, kiểm tra khả năng hiểu và áp dụng
- **V (Vận dụng)**: Các câu hỏi nâng cao, kiểm tra khả năng vận dụng sáng tạo

### 3. AI Tutor System

Gia sư AI sử dụng phương pháp Socratic để hướng dẫn học sinh:

- **Hint 1**: Nhắc lại khái niệm cơ bản
- **Hint 2**: Gợi ý phương pháp giải
- **Hint 3**: Kiểm tra lỗi phổ biến
- **Final**: Đưa ra lời giải và bài tương tự

## Cách sử dụng

### 1. Khởi tạo phiên học tập

```bash
POST /api/adaptive/sessions
{
  "student_name": "Tên học sinh",
  "grade": "Lớp"
}
```

### 2. Bắt đầu gói câu hỏi đầu tiên

```bash
POST /api/adaptive/sessions/{sessionId}/start
```

### 3. Nộp câu trả lời

```bash
POST /api/adaptive/sessions/{sessionId}/answers
{
  "answers": [
    {
      "question_id": "1_H_1_1",
      "student_answer": 1,
      "is_correct": true,
      "time_spent": 30
    }
  ]
}
```

### 4. Tương tác với gia sư AI

```bash
# Bắt đầu phiên gia sư
POST /api/adaptive/sessions/{sessionId}/tutor/start
{
  "question_id": "1_H_1_1",
  "student_answer": 2
}

# Lấy gợi ý
POST /api/adaptive/sessions/{sessionId}/tutor/{tutorSessionId}/hint
{
  "student_response": "Câu trả lời của học sinh"
}

# Kiểm tra câu trả lời
POST /api/adaptive/sessions/{sessionId}/tutor/{tutorSessionId}/check
{
  "student_response": "Câu trả lời của học sinh"
}
```

### 5. Tạo câu hỏi kiểm tra lại

```bash
POST /api/adaptive/sessions/{sessionId}/tutor/{tutorSessionId}/retest
```

### 6. Xem báo cáo kết quả

```bash
GET /api/adaptive/sessions/{sessionId}/report
```

## Tính năng chính

### 1. Question Generation

- Tự động tạo câu hỏi isomorphic từ dữ liệu có sẵn
- Sử dụng OpenAI GPT-4 để tạo câu hỏi chất lượng cao
- Đảm bảo độ khó và dạng bài tương đương

### 2. Backup System (MỚI)

- **Tự động phát hiện câu hỏi thiếu đáp án**: Hệ thống tự động kiểm tra và phát hiện câu hỏi không có choices
- **Sinh câu hỏi backup**: Sử dụng OpenAI để tạo câu hỏi mới với đầy đủ 4 đáp án
- **Fallback thông minh**: Khi không có câu hỏi cho chủ đề nào đó, tự động sinh câu hỏi mới
- **Đảm bảo chất lượng**: Tất cả câu hỏi đều có đáp án hợp lý và giải thích chi tiết

### 3. Adaptive Assessment

- Tự động điều chỉnh độ khó dựa trên kết quả
- Phát hiện các chủ đề yếu của học sinh
- Tạo gói câu hỏi bổ sung phù hợp

### 4. AI Tutoring

- Hướng dẫn từng bước bằng phương pháp Socratic
- Cung cấp lý thuyết và ví dụ minh họa
- Tạo câu hỏi kiểm tra lại sau khi hướng dẫn

### 5. Review System (MỚI)

- **Tổng kết sau mỗi độ khó**: Phân tích chi tiết kết quả học tập
- **Đánh giá theo bài học**: Xác định điểm mạnh/yếu cho từng chủ đề
- **Khuyến nghị AI**: Sử dụng GPT-4 để đưa ra lời khuyên cá nhân hóa
- **Chuẩn bị độ khó tiếp theo**: Hướng dẫn cụ thể để tiến lên mức cao hơn

### 6. Progress Tracking

- Theo dõi tiến độ học tập theo thời gian thực
- Tạo báo cáo chi tiết về điểm mạnh/yếu
- Đưa ra khuyến nghị học tập cá nhân hóa

## Cấu trúc dữ liệu

### Question Database

- **Nguồn**: `data_adaptive_learn/questions_indexed.json`
- **Format**: JSON với 2999 câu hỏi đã phân loại
- **Phân loại**: Theo bài (1-5), độ khó (N/H/V), dạng bài

### Theory Content

- **Nguồn**: `data_adaptive_learn/markdown_theory/`
- **Format**: Markdown files cho từng chương
- **Nội dung**: Lý thuyết, ví dụ, phương pháp giải

## API Endpoints

### Session Management

- `POST /api/adaptive/sessions` - Tạo phiên mới
- `GET /api/adaptive/sessions/{id}` - Lấy thông tin phiên
- `GET /api/adaptive/sessions/{id}/progress` - Xem tiến độ

### Question Flow

- `POST /api/adaptive/sessions/{id}/start` - Bắt đầu gói câu hỏi
- `POST /api/adaptive/sessions/{id}/answers` - Nộp câu trả lời

### AI Tutoring

- `POST /api/adaptive/sessions/{id}/tutor/start` - Bắt đầu gia sư
- `POST /api/adaptive/sessions/{id}/tutor/{tutorId}/hint` - Lấy gợi ý
- `POST /api/adaptive/sessions/{id}/tutor/{tutorId}/check` - Kiểm tra câu trả lời
- `POST /api/adaptive/sessions/{id}/tutor/{tutorId}/retest` - Tạo câu hỏi kiểm tra

### Theory & Examples

- `GET /api/adaptive/theory/{lessonId}/summary` - Tóm tắt lý thuyết
- `GET /api/adaptive/theory/{lessonId}/example` - Ví dụ minh họa

### Review System

- `POST /api/adaptive/sessions/{id}/review` - Tạo phiên tổng kết
- `GET /api/adaptive/sessions/{id}/review/{reviewId}` - Lấy thông tin tổng kết
- `POST /api/adaptive/sessions/{id}/review/{reviewId}/continue` - Tiếp tục sau tổng kết

### Reports

- `GET /api/adaptive/sessions/{id}/report` - Báo cáo kết quả

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment variables

```bash
# .env
OPENAI_API_KEY=your_openai_api_key
```

### 3. Chạy server

**Cách 1: Chạy tự động (Windows)**

```bash
start-dev.bat
```

**Cách 2: Chạy thủ công**

```bash
# Terminal 1 - Backend Server
npx tsx server/index.ts

# Terminal 2 - Frontend Server
cd client
npx vite --port 5173
```

### 4. Truy cập ứng dụng

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Adaptive Learning: http://localhost:5173/adaptive-learning

## Lưu ý quan trọng

1. **Dữ liệu câu hỏi**: Đảm bảo file `questions_indexed.json` có đủ câu hỏi cho tất cả các bài và độ khó
2. **OpenAI API**: Cần có API key hợp lệ để sử dụng tính năng AI
3. **Performance**: Hệ thống sử dụng in-memory storage cho demo, cần database thực cho production
4. **Error Handling**: Tất cả API calls đều có error handling và fallback mechanisms

## Mở rộng trong tương lai

1. **Database Integration**: Tích hợp với PostgreSQL để lưu trữ persistent
2. **Advanced Analytics**: Thêm phân tích hành vi học tập chi tiết
3. **Multi-language Support**: Hỗ trợ nhiều ngôn ngữ
4. **Mobile App**: Phát triển ứng dụng mobile
5. **Teacher Dashboard**: Tạo dashboard cho giáo viên theo dõi học sinh

## Troubleshooting

### Lỗi thường gặp

1. **"Session not found"**: Kiểm tra session ID có đúng không
2. **"Failed to generate questions"**: Kiểm tra OpenAI API key và quota
3. **"No questions available"**: Kiểm tra dữ liệu câu hỏi có đủ không

### Debug mode

Thêm `console.log` vào các function để debug:

```typescript
console.log("Debug:", { sessionId, currentState, answers });
```

## Backup System - Tính năng mới

### Vấn đề được giải quyết

- **Câu hỏi thiếu đáp án**: Một số câu hỏi trong database không có choices (đáp án)
- **Thiếu câu hỏi cho chủ đề**: Không đủ câu hỏi cho một số bài học
- **Chất lượng không đồng đều**: Một số câu hỏi có chất lượng thấp

### Giải pháp Backup System

1. **Tự động phát hiện**: Hệ thống kiểm tra mỗi câu hỏi có đủ 4 đáp án không
2. **Sinh câu hỏi backup**: Sử dụng OpenAI GPT-4 để tạo câu hỏi mới với đầy đủ đáp án
3. **Fallback thông minh**: Khi không có câu hỏi cho chủ đề, tự động sinh câu hỏi mới
4. **Đảm bảo chất lượng**: Tất cả câu hỏi đều có giải thích chi tiết

### API Test Backup System

```bash
POST /api/adaptive/test/backup-question
{
  "lesson_id": 1,
  "difficulty": "N"
}
```

### Cách chạy với Backup System

```bash
# Chạy tự động (Windows)
start-servers.bat

# Hoặc chạy thủ công
npx tsx server/index.ts  # Backend
npx vite --port 5173     # Frontend
```

## Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository hoặc liên hệ team phát triển.
