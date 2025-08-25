# Tính năng Level Setup và Entry Test

## Mô tả tổng quan

Tính năng mới này nâng cấp quy trình setup profile cho student đầu tiên bằng cách thêm:

1. **Chọn trình độ hiện tại** - Người dùng có thể chọn từ "Lần đầu tiên học" đến N1
2. **Bài test đầu vào** - Cho phép đánh giá chính xác trình độ thực tế
3. **Xác định mục tiêu học tập** - Ôn thi cấp độ tiếp theo hoặc ôn luyện kỹ năng hiện tại
4. **Báo cáo chi tiết kết quả** - Hiển thị điểm số từng phần và đề xuất học tập

## Cấu trúc file

### Components mới

- `src/components/modals/LevelSetupModal.tsx` - Modal setup trình độ với 4 bước
- `src/components/modals/EntryTestResultModal.tsx` - Modal hiển thị kết quả test

### Pages mới

- `src/pages/student/EntryTestPage.tsx` - Trang làm bài test đầu vào

### Routes mới

- `/student/entry-test/:testId` - Route cho bài test đầu vào

## Quy trình hoạt động

### Bước 1: Chọn trình độ

- Hiển thị 6 lựa chọn: Lần đầu tiên học, N5, N4, N3, N2, N1
- Có confirmation trước khi chuyển bước tiếp theo

### Bước 2: Lựa chọn làm test đầu vào

- **Có làm test**: Chuyển sang bước 3 để chọn mục tiêu
- **Không làm test**:
  - Nếu chọn "Lần đầu tiên học" → Bước 4 (chọn mục tiêu)
  - Nếu chọn trình độ khác → Tạo profile luôn

### Bước 3: Chọn mục tiêu test

- **Ôn luyện và cải thiện kỹ năng**: Test trình độ hiện tại để tìm điểm yếu
- **Ôn thi tới cấp độ tiếp theo**: Test trình độ cao hơn để chuẩn bị thi

### Bước 4: Chọn mục tiêu cuối cùng (chỉ cho người mới)

- Chọn từ N5 đến N1 làm mục tiêu học tập

## Logic test đầu vào

### Trình độ test được chọn:

- **Lần đầu tiên học + Ôn thi**: Test N5
- **N5 + Ôn thi**: Test N4
- **N4 + Ôn thi**: Test N3
- **N3 + Ôn thi**: Test N2
- **N2 + Ôn thi**: Test N1
- **Nx + Ôn luyện**: Test Nx (cùng trình độ)

### Kết quả test hiển thị:

- **Tổng điểm** và phần trăm
- **Chi tiết từng phần**: Kanji, Từ vựng, Ngữ pháp, Đọc hiểu, Nghe hiểu
- **Điểm yếu cần cải thiện** cho từng phần dưới 60%
- **Đánh giá và khuyến nghị** dựa trên tổng điểm
- **Danh sách khóa học đề xuất**

## Technical Implementation

### API Integration

- Sử dụng `TestType.EntryAuto` để lấy các test template phù hợp
- Tạo test tự động qua `createAutoTest()`
- Lấy kết quả chi tiết qua `getTestAttemptWithScoreSummary()`

### Navigation Flow

- `LevelSetupModal` → `EntryTestPage` → `EntryTestResultModal` → `StudentHomePage`

### State Management

- Modal states được quản lý trong `StudentHomePage`
- Test progress được handle trong `EntryTestPage`
- Kết quả test được format và hiển thị trong result modal

## UI/UX Improvements

### Design Features

- **Progress indicator** - 4 bước với visual progress
- **Confirmation steps** - Xác nhận trước khi chuyển bước
- **Loading states** - Spinner khi tải test và tạo profile
- **Error handling** - Hiển thị lỗi rõ ràng cho user
- **Responsive design** - Hoạt động tốt trên mobile và desktop

### Visual Elements

- Icons phù hợp cho từng bước (FaGraduationCap, FaTrophy, FaBookOpen)
- Color coding cho các mức điểm (green/yellow/red)
- Progress bars cho kết quả từng phần
- Cards layout cho dễ đọc

## Future Enhancements

1. **Adaptive Learning Path** - Tự động đề xuất roadmap học tập dựa trên kết quả
2. **Retake Logic** - Cho phép làm lại test sau một khoảng thời gian
3. **Detailed Analytics** - Phân tích sâu hơn về điểm yếu cụ thể
4. **AI Recommendations** - Sử dụng AI để đề xuất tài liệu học phù hợp

## Testing Notes

- Test với các trình độ khác nhau
- Verify API calls và error handling
- Check responsive design trên các screen size
- Test navigation flow và modal states
