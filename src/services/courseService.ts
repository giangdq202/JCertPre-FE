import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_COURSE_URL,
  GET_COURSE_BY_ID_URL,
  CREATE_COURSE_URL,
  UPDATE_COURSE_URL,
  UPDATE_COURSE_STATUS_URL,
  ADD_INSTRUCTOR_TO_COURSE_URL,
  REMOVE_INSTRUCTOR_FROM_COURSE_URL,
} from "../consts/apiUrl/baseUrl";
import { Pagination } from "../types/pagination"; // Ensure this path is correct
import { DocumentDto } from "./documentService"; // Ensure this path is correct (needed for LessonDto)

export enum CourseStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
  Suspended = 3,
}

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum CourseType {
  Online = 0,
  Offline = 1,
  Hybrid = 2,
}

export interface CourseQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string | null;
  instructorId?: string | null; // GUID trong C# thường được biểu diễn bằng string trong TS
  status?: CourseStatus | null;
  level?: CourseLevel | null;
  courseType?: CourseType | null;
}

export interface InstructorInfoDto {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface CourseListDto {
  courseId: string;
  title: string;
  description: string;
  level: CourseLevel;
  courseType: CourseType;
  price: number;
  thumbnailUrl: string;
  status: CourseStatus;
  createdAt: string; // ISO 8601 string
  enrollmentsCount: number;
  instructorsCount: number;
}
export interface CourseDto {
  courseId: string;
  title: string;
  description: string;
  level: CourseLevel;
  courseType: CourseType;
  price: number;
  thumbnailUrl: string;
  status: CourseStatus;
  createdAt: string; // ISO 8601 string
  lessonsCount: number;
  livestreamsCount: number;
  enrollmentsCount: number;
  instructors: InstructorInfoDto[]; // Danh sách các giảng viên
  // Assuming LessonDto is defined elsewhere and includes documents
  lessons: {
    lessonId: string;
    courseId: string;
    title: string;
    lessonOrder: number;
    content: string;
    documents: DocumentDto[]; // Include documents in CourseDto if fetched with course
  }[];
}

export interface CreateCourseDto {
  title: string;
  description: string;
  level: CourseLevel;
  courseType: CourseType;
  price: number;
  thumbnailUrl?: string | null;
}
export interface UpdateCourseDto {
  title?: string | null;
  description?: string | null;
  level?: CourseLevel | null;
  courseType?: CourseType | null;
  price?: number | null;
  thumbnailUrl?: string | null;
  status?: CourseStatus | null;
}

export const getCourses = async (
  queryParameters: CourseQueryParameters
): Promise<Pagination<CourseListDto>> => {
  try {
    // Xây dựng chuỗi truy vấn từ các tham số
    const params = new URLSearchParams();
    if (queryParameters.pageNumber !== undefined) {
      params.append("PageNumber", queryParameters.pageNumber.toString());
    }
    if (queryParameters.pageSize !== undefined) {
      params.append("PageSize", queryParameters.pageSize.toString());
    }
    if (queryParameters.searchTerm) {
      params.append("SearchTerm", queryParameters.searchTerm);
    }
    if (queryParameters.instructorId) {
      params.append("InstructorId", queryParameters.instructorId);
    }
    if (queryParameters.status !== undefined && queryParameters.status !== null) {
      params.append("Status", CourseStatus[queryParameters.status]); // Chuyển enum sang string
    }
    if (queryParameters.level !== undefined && queryParameters.level !== null) {
      params.append("Level", CourseLevel[queryParameters.level]); // Chuyển enum sang string
    }
    if (queryParameters.courseType !== undefined && queryParameters.courseType !== null) {
      params.append("CourseType", CourseType[queryParameters.courseType]); // Chuyển enum sang string
    }

    // Gửi yêu cầu GET đến API khóa học
    const response = await axiosInstance.get<Pagination<CourseListDto>>(
      `${GET_COURSE_URL}?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("GetCourses API error:", error);
    throw error; // Ném lỗi để component gọi có thể bắt và xử lý
  }
};

export const getCourseById = async (courseId: string): Promise<CourseDto> => {
  try {
    // Gửi yêu cầu GET đến API khóa học với ID cụ thể, sử dụng URL từ baseUrl.ts
    const response = await axiosInstance.get<CourseDto>(GET_COURSE_BY_ID_URL(courseId));
    return response.data;
  } catch (error) {
    console.error(`GetCourseById API error for ID ${courseId}:`, error);
    throw error; // Ném lỗi để component gọi có thể bắt và xử lý
  }
};

export const createCourse = async (
  createCourseDto: CreateCourseDto
): Promise<CourseDto> => {
  try {
    // Gửi yêu cầu POST đến API khóa học
    const response = await axiosInstance.post<CourseDto>(
      CREATE_COURSE_URL,
      createCourseDto
    );
    return response.data;
  } catch (error) {
    console.error("CreateCourse API error:", error);
    throw error; // Ném lỗi để component gọi có thể bắt và xử lý
  }
};

export const updateCourse = async (
  id: string,
  updateCourseDto: UpdateCourseDto
): Promise<CourseDto> => {
  try {
    // Gửi yêu cầu PUT đến API khóa học với ID cụ thể, sử dụng URL từ baseUrl.ts
    const response = await axiosInstance.put<CourseDto>(
      UPDATE_COURSE_URL(id),
      updateCourseDto
    );
    return response.data;
  } catch (error) {
    console.error(`UpdateCourse API error for ID ${id}:`, error);
    throw error; // Ném lỗi để component gọi có thể bắt và xử lý
  }
};

export const updateCourseStatus = async (courseId: string, status: CourseStatus): Promise<void> => {
  try {
    // Gửi yêu cầu PATCH với giá trị số của enum TRỰC TIẾP trong body
    // Backend đang mong đợi một giá trị số nguyên đơn lẻ (raw integer)
    await axiosInstance.patch(`/course/${courseId}/status`, status); // Gửi trực tiếp giá trị 'status' (là một số)
  } catch (error: any) {
    console.error(`UpdateCourseStatus API error for ID ${courseId}:`, error);
    // Log response data for more specific error details
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    //message.error("Failed to update course status.");
    throw error;
  }
};

export const addInstructorToCourse = async (
  courseId: string,
  instructorId: string
): Promise<void> => {
  try {
    // Gửi yêu cầu POST đến API để gán giảng viên vào khóa học, sử dụng URL từ baseUrl.ts
    await axiosInstance.post(ADD_INSTRUCTOR_TO_COURSE_URL(courseId, instructorId));
    console.log(`Instructor ${instructorId} assigned to course ${courseId} successfully.`);
  } catch (error) {
    console.error(`AddInstructorToCourse API error for course ${courseId} and instructor ${instructorId}:`, error);
    throw error; // Ném lỗi để component gọi có thể bắt và xử lý
  }
};

export const removeInstructorFromCourse = async (
  courseId: string,
  instructorId: string
): Promise<void> => {
  try {
    // Gửi yêu cầu DELETE đến API để gỡ giảng viên khỏi khóa học, sử dụng URL từ baseUrl.ts
    await axiosInstance.delete(REMOVE_INSTRUCTOR_FROM_COURSE_URL(courseId, instructorId));
    console.log(`Instructor ${instructorId} removed from course ${courseId} successfully.`);
  } catch (error) {
    console.error(`RemoveInstructorFromCourse API error for course ${courseId} and instructor ${instructorId}:`, error);
    throw error; // Ném lỗi để component gọi có thể bắt và xử lý
  }
};
