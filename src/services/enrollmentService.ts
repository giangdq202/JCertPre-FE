// src/services/enrollmentService.ts

import axiosInstance from "../consts/axios/axiosInstance"; // Đảm bảo đường dẫn này đúng
import { Pagination } from "../types/pagination"; // Giả sử bạn có Pagination type chung
import {
  ENROLLMENT_BASE_URL,
  CHECK_ENROLLMENT_URL,
  ENROLL_URL,
  ENROLL_SELF_URL,
  GET_MY_ENROLLMENTS_URL,
  UNENROLL_URL,
} from "../consts/apiUrl/baseUrl";

// --- DTOs (Data Transfer Objects) ---

/**
 * DTO cho yêu cầu ghi danh một người dùng vào khóa học bởi admin.
 */
export interface EnrollmentRequestDto {
  userId: string; // Guid trong C# là string trong TS
  courseId: string; // Guid trong C# là string trong TS
}

/**
 * DTO cho yêu cầu ghi danh người dùng hiện tại vào khóa học (tự ghi danh).
 */
export interface SelfEnrollmentRequestDto {
  courseId: string; // Guid trong C# là string trong TS
}

/**
 * DTO đại diện cho thông tin về một khóa học được ghi danh.
 * Tôi sẽ đặt một số trường phổ biến để mô phỏng dữ liệu bạn có thể nhận được.
 * Bạn có thể cần điều chỉnh DTO này dựa trên cấu trúc thực tế của EnrollmentDetailDto từ backend.
 */
export interface EnrollmentDetailDto {
  enrollmentId: string; // ID của lần ghi danh
  userId: string;
  courseId: string;
  enrollmentDate: string; // Ngày ghi danh (ISO 8601 string)
  // Thêm các thông tin chi tiết về khóa học nếu API trả về (ví dụ: title, description)
  courseTitle: string;
  courseDescription: string;
  // ... các trường khác từ EnrollmentDetailDto của bạn trong C#
}

/**
 * DTO cho kết quả kiểm tra trạng thái ghi danh.
 */
export interface CheckEnrollmentStatusResult {
  isEnrolled: boolean;
  message: string;
}

/**
 * DTO cho kết quả hủy ghi danh.
 */
export interface UnenrollmentResult {
  success: boolean;
  message: string;
}

// --- API Functions ---

/**
 * Ghi danh một người dùng vào khóa học (thường dành cho Admin hoặc hệ thống).
 * POST /api/enrollment/enroll
 * @param request Chứa userId và courseId.
 * @returns Chi tiết ghi danh.
 */
export const enrollUserInCourse = async (
  request: EnrollmentRequestDto
): Promise<EnrollmentDetailDto> => {
  try {
    const response = await axiosInstance.post<EnrollmentDetailDto>(
      ENROLL_URL,
      request
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi ghi danh người dùng vào khóa học:", error);
    throw error;
  }
};

/**
 * Tự ghi danh người dùng hiện tại vào một khóa học.
 * POST /api/enrollment/enroll-self
 * @param request Chứa courseId.
 * @returns Chi tiết ghi danh.
 */
export const enrollSelfInCourse = async (
  request: SelfEnrollmentRequestDto
): Promise<EnrollmentDetailDto> => {
  try {
    const response = await axiosInstance.post<EnrollmentDetailDto>(
      ENROLL_SELF_URL,
      request
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tự ghi danh vào khóa học:", error);
    throw error;
  }
};

/**
 * Kiểm tra xem người dùng hiện tại đã ghi danh vào một khóa học cụ thể chưa.
 * GET /api/enrollment/check/{courseId}
 * @param courseId ID của khóa học.
 * @returns Trạng thái ghi danh.
 */
export const checkEnrollmentStatus = async (
  courseId: string
): Promise<CheckEnrollmentStatusResult> => {
  try {
    const response = await axiosInstance.get<CheckEnrollmentStatusResult>(
      CHECK_ENROLLMENT_URL(courseId)
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi kiểm tra trạng thái ghi danh cho khóa học ${courseId}:`, error);
    throw error;
  }
};

/**
 * Lấy tất cả các ghi danh của người dùng hiện tại.
 * GET /api/enrollment/my-enrollments
 * @returns Danh sách các ghi danh của người dùng.
 */
export const getMyEnrollments = async (): Promise<EnrollmentDetailDto[]> => {
  try {
    const response = await axiosInstance.get<EnrollmentDetailDto[]>(
      GET_MY_ENROLLMENTS_URL
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy các ghi danh của tôi:", error);
    throw error;
  }
};

/**
 * Hủy ghi danh người dùng hiện tại khỏi một khóa học.
 * DELETE /api/enrollment/unenroll/{courseId}
 * @param courseId ID của khóa học để hủy ghi danh.
 * @returns Kết quả hủy ghi danh.
 */
export const unenrollFromCourse = async (
  courseId: string
): Promise<UnenrollmentResult> => {
  try {
    const response = await axiosInstance.delete<UnenrollmentResult>(
      UNENROLL_URL(courseId)
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi hủy ghi danh khỏi khóa học ${courseId}:`, error);
    throw error;
  }
};