# LessonProgress API Documentation

## 📋 **Tổng quan**

LessonProgress API cho phép theo dõi tiến độ học tập của học viên trong từng bài học và khóa học. API này cung cấp các chức năng CRUD đầy đủ cho việc quản lý tiến độ học tập.

## 🔗 **API Endpoints**

### **Base URL**: `/api/lesson-progress`

| Method   | Endpoint                                               | Description                                    |
| -------- | ------------------------------------------------------ | ---------------------------------------------- |
| `GET`    | `/by-user-course?userId={userId}&courseId={courseId}`  | Lấy tất cả tiến độ của user trong một khóa học |
| `GET`    | `/by-user-lesson?userId={userId}&lessonId={lessonId}`  | Lấy tiến độ của user cho một bài học cụ thể    |
| `POST`   | `/`                                                    | Tạo tiến độ mới                                |
| `PUT`    | `/{progressId}`                                        | Cập nhật tiến độ                               |
| `DELETE` | `/{progressId}`                                        | Xóa tiến độ                                    |
| `GET`    | `/completion-rate?userId={userId}&courseId={courseId}` | Lấy tỷ lệ hoàn thành khóa học                  |

## 📊 **Data Models**

### **CreateLessonProgressDto**

```typescript
interface CreateLessonProgressDto {
  userId: string; // ID của học viên
  lessonId: string; // ID của bài học
  courseId: string; // ID của khóa học
}
```

### **UpdateLessonProgressDto**

```typescript
interface UpdateLessonProgressDto {
  completionRate: number; // Phần trăm hoàn thành (0-100)
}
```

### **LessonProgressDto**

```typescript
interface LessonProgressDto {
  progressId: string; // ID của tiến độ
  userId: string; // ID của học viên
  lessonId: string; // ID của bài học
  courseId: string; // ID của khóa học
  completionRate: number; // Phần trăm hoàn thành (0-100)
  userFullName?: string; // Tên học viên
  lessonTitle?: string; // Tiêu đề bài học
}
```

## 🚀 **Frontend Implementation**

### **1. Service Layer**

```typescript
// src/services/lessonProgressService.ts
import {
  getLessonProgressByUserAndCourse,
  getLessonProgressByUserAndLesson,
  createLessonProgress,
  updateLessonProgress,
  deleteLessonProgress,
  getUserCourseCompletionRate,
  markLessonAsCompleted,
  updateLessonProgressRate,
} from "../services/lessonProgressService";

// Sử dụng service
const progress = await getLessonProgressByUserAndLesson(userId, lessonId);
const courseProgress = await getUserCourseCompletionRate(userId, courseId);
```

### **2. Custom Hook**

```typescript
// src/hooks/useLessonProgress.ts
import { useLessonProgress } from "../hooks/useLessonProgress";

const MyComponent = () => {
  const {
    loading,
    error,
    getProgressByUserAndLesson,
    markLessonCompleted,
    updateLessonProgressRate,
  } = useLessonProgress();

  const handleCompleteLesson = async () => {
    try {
      await markLessonCompleted(lessonId, courseId);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
};
```

### **3. UI Components**

```typescript
// src/components/LessonProgressTracker.tsx
import { LessonProgressTracker, CourseProgressSummary } from '../components/LessonProgressTracker';

// Sử dụng component
<LessonProgressTracker
  courseId="course-123"
  lessonId="lesson-456"
  lessonTitle="Bài 1: Giới thiệu"
  onProgressUpdate={(rate) => console.log('Progress updated:', rate)}
/>

<CourseProgressSummary
  courseId="course-123"
  totalLessons={10}
/>
```

## 📝 **Usage Examples**

### **1. Tạo tiến độ mới**

```typescript
const createProgress = async () => {
  try {
    const newProgress = await createLessonProgress({
      userId: "user-123",
      lessonId: "lesson-456",
      courseId: "course-789",
    });
    console.log("Progress created:", newProgress);
  } catch (error) {
    console.error("Failed to create progress:", error);
  }
};
```

### **2. Cập nhật tiến độ**

```typescript
const updateProgress = async () => {
  try {
    const updatedProgress = await updateLessonProgress("progress-123", {
      completionRate: 75, // 75%
    });
    console.log("Progress updated:", updatedProgress);
  } catch (error) {
    console.error("Failed to update progress:", error);
  }
};
```

### **3. Đánh dấu hoàn thành**

```typescript
const markCompleted = async () => {
  try {
    const completedProgress = await markLessonAsCompleted(
      "user-123",
      "lesson-456",
      "course-789"
    );
    console.log("Lesson marked as completed:", completedProgress);
  } catch (error) {
    console.error("Failed to mark as completed:", error);
  }
};
```

### **4. Lấy tiến độ khóa học**

```typescript
const getCourseProgress = async () => {
  try {
    const progressList = await getLessonProgressByUserAndCourse(
      "user-123",
      "course-789"
    );
    const completionRate = await getUserCourseCompletionRate(
      "user-123",
      "course-789"
    );

    console.log("Course progress:", progressList);
    console.log("Completion rate:", completionRate);
  } catch (error) {
    console.error("Failed to get course progress:", error);
  }
};
```

## 🎯 **Business Logic**

### **1. Validation Rules**

- **User Enrollment**: Chỉ học viên đã đăng ký khóa học mới có thể tạo tiến độ
- **Lesson Existence**: Bài học phải tồn tại trong khóa học
- **Completion Rate**: Phải trong khoảng 0-100%
- **Duplicate Prevention**: Không cho phép tạo tiến độ trùng lặp

### **2. Auto-calculation**

- **Course Completion Rate**: Tự động tính tỷ lệ hoàn thành khóa học dựa trên số bài học đã hoàn thành
- **Progress Tracking**: Theo dõi tiến độ theo thời gian thực

### **3. Error Handling**

```typescript
// Common error scenarios
- LESSON_PROGRESS_EXISTS: User already has progress for this lesson
- USER_NOT_ENROLLED: User is not enrolled in the course
- LESSON_NOT_FOUND: Lesson doesn't exist
- PROGRESS_NOT_FOUND: Progress record not found
```

## 🔧 **Integration with Other Services**

### **1. Enrollment Service**

```typescript
// Kiểm tra đăng ký trước khi tạo tiến độ
const isEnrolled = await checkEnrollmentStatus(courseId);
if (!isEnrolled) {
  throw new Error("User not enrolled in course");
}
```

### **2. Course Service**

```typescript
// Lấy thông tin khóa học và bài học
const course = await getCourseById(courseId);
const lesson = await getLessonById(lessonId);
```

### **3. User Service**

```typescript
// Lấy thông tin học viên
const user = await getUserById(userId);
```

## 📊 **Analytics & Reporting**

### **1. Progress Analytics**

- Tỷ lệ hoàn thành theo khóa học
- Thời gian học tập trung bình
- Số bài học đã hoàn thành
- Tiến độ học tập theo thời gian

### **2. Performance Metrics**

- Completion rate trends
- Learning velocity
- Drop-off points
- Success indicators

## 🚀 **Best Practices**

### **1. Performance Optimization**

- Cache progress data locally
- Batch update operations
- Lazy load progress data
- Optimistic updates

### **2. User Experience**

- Real-time progress updates
- Visual progress indicators
- Achievement notifications
- Progress milestones

### **3. Data Consistency**

- Atomic operations
- Transaction handling
- Conflict resolution
- Data validation

## 🔍 **Testing**

### **1. Unit Tests**

```typescript
describe("LessonProgressService", () => {
  it("should create lesson progress", async () => {
    const progress = await createLessonProgress(mockData);
    expect(progress.completionRate).toBe(0);
  });

  it("should update lesson progress", async () => {
    const updated = await updateLessonProgress(id, { completionRate: 50 });
    expect(updated.completionRate).toBe(50);
  });
});
```

### **2. Integration Tests**

```typescript
describe("LessonProgress Integration", () => {
  it("should handle complete lesson flow", async () => {
    // Create progress
    const progress = await createLessonProgress(data);

    // Update to complete
    const completed = await updateLessonProgress(progress.id, {
      completionRate: 100,
    });

    // Verify course completion rate updated
    const courseRate = await getUserCourseCompletionRate(userId, courseId);
    expect(courseRate).toBeGreaterThan(0);
  });
});
```

## 📚 **Related Documentation**

- [Course API Documentation](./COURSE_API.md)
- [Enrollment API Documentation](./ENROLLMENT_API.md)
- [User API Documentation](./USER_API.md)
- [Authentication Guide](./AUTH_GUIDE.md)
