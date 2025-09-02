import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_COURSE_URL,
  GET_COURSE_BY_ID_URL,
  CREATE_COURSE_URL,
  UPDATE_COURSE_URL,
  UPDATE_COURSE_STATUS_URL,
  ADD_INSTRUCTOR_TO_COURSE_URL,
  REMOVE_INSTRUCTOR_FROM_COURSE_URL,
  GET_COURSE_INSTRUCTORS_URL,
  GET_COURSE_INSTRUCTOR_HISTORY_URL,
  CREATE_PERSONAL_COURSE_URL,
  GET_PERSONAL_COURSE_DETAIL_URL,
  GET_PERSONAL_COURSES_LIST_URL,
} from "../consts/apiUrl/baseUrl";
import { Pagination } from "../types/pagination"; // Ensure this path is correct
import { DocumentDto } from "./documentService"; // Ensure this path is correct (needed for LessonDto)
import { UserDto } from "./userService";

export enum CourseStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum CourseType {
  Personal = 0,
  Public = 1,
}

export interface CourseQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string | null;
  instructorId?: string | null; // GUID trong C# thường được biểu diễn bằng string trong TS
  status?: CourseStatus | null;
  level?: CourseLevel | null;
  courseType?: CourseType | null;
  startDate?: string | null; // ISO 8601 date string
  endDate?: string | null; // ISO 8601 date string
}

export interface InstructorInfoDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  userName?: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  credit?: number;
  lastLogin?: string | null;
  status?: number;
  roleId?: string;
  roleName?: string;
}

export interface CourseListDto {
  courseId: string;
  title: string;
  description: string;
  level: CourseLevel;
  courseType: CourseType;
  price: number; // Keep as number for frontend compatibility
  thumbnailUrl: string;
  status: CourseStatus;
  createdAt: string; // ISO 8601 string
  startDate: string; // ISO 8601 string
  endDate: string; // ISO 8601 string
  enrollmentsCount: number;
  instructorsCount: number;
}
export interface CourseDto {
  courseId: string;
  title: string;
  description: string;
  level: CourseLevel;
  courseType: CourseType;
  price: number; // Keep as number for frontend compatibility
  thumbnailUrl: string;
  status: CourseStatus;
  createdAt: string; // ISO 8601 string
  startDate: string; // ISO 8601 string
  endDate: string; // ISO 8601 string
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
  price: number; // Keep as number for frontend compatibility
  startDate: string; // ISO 8601 string
  endDate: string; // ISO 8601 string
  thumbnailFile?: File | null;
  thumbnailUrl?: string | null;
}

export interface UpdateCourseDto {
  title?: string | null;
  description?: string | null;
  level?: CourseLevel | null;
  courseType?: CourseType | null;
  price?: number | null; // Keep as number for frontend compatibility
  startDate?: string | null; // ISO 8601 string
  endDate?: string | null; // ISO 8601 string
  thumbnailFile?: File | null;
  thumbnailUrl?: string | null;
  status?: CourseStatus | null;
}

export interface CourseInstructorHistoryDto {
  instructorId: string;
  instructorName: string;
  assignedOn: string;
  leftOn?: string | null;
  isActive: boolean;
  notes?: string | null;
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
      params.append("Status", queryParameters.status.toString()); // Send as number
    }
    if (queryParameters.level !== undefined && queryParameters.level !== null) {
      params.append("Level", queryParameters.level.toString()); // Send as number
    }
    if (queryParameters.courseType !== undefined && queryParameters.courseType !== null) {
      params.append("CourseType", queryParameters.courseType.toString()); // Send as number
    }
    if (queryParameters.startDate) {
      params.append("StartDate", queryParameters.startDate);
    }
    if (queryParameters.endDate) {
      params.append("EndDate", queryParameters.endDate);
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
    // Validate courseId format
    if (!courseId || courseId.trim() === '') {
      throw new Error('CourseId is empty or invalid');
    }
    
    // Log the URL being called
    const url = GET_COURSE_BY_ID_URL(courseId);
    console.log(`Calling getCourseById with URL: ${url}`);
    console.log(`CourseId: ${courseId}`);
    console.log(`CourseId type: ${typeof courseId}`);
    console.log(`CourseId length: ${courseId.length}`);
    
    const response = await axiosInstance.get<CourseDto>(url);
    return response.data;
  } catch (error: any) {
    console.error(`GetCourseById API error for ID ${courseId}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      console.error("Full error response:", JSON.stringify(error.response, null, 2));
    } else if (error.request) {
      console.error("Request was made but no response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

export const createCourse = async (
  createCourseDto: CreateCourseDto
): Promise<CourseDto> => {
  try {
    const formData = new FormData();
    formData.append("Title", createCourseDto.title);
    formData.append("Description", createCourseDto.description);
    formData.append("Level", createCourseDto.level.toString());
    formData.append("CourseType", createCourseDto.courseType.toString());
    // Revert back to .toString() as per working version
    formData.append("Price", createCourseDto.price.toString());
    formData.append("StartDate", createCourseDto.startDate);
    formData.append("EndDate", createCourseDto.endDate);
    if (createCourseDto.thumbnailFile) {
      formData.append("ThumbnailFile", createCourseDto.thumbnailFile);
    }
    if (createCourseDto.thumbnailUrl) {
      formData.append("ThumbnailUrl", createCourseDto.thumbnailUrl);
    }

    // Gửi yêu cầu POST đến API khóa học
    const response = await axiosInstance.post<CourseDto>(
      CREATE_COURSE_URL,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
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
    const formData = new FormData();
    
    // Only append non-null and non-undefined values
    if (updateCourseDto.title !== undefined && updateCourseDto.title !== null) {
      formData.append("Title", updateCourseDto.title);
    }
    if (updateCourseDto.description !== undefined && updateCourseDto.description !== null) {
      formData.append("Description", updateCourseDto.description);
    }
    if (updateCourseDto.level !== undefined && updateCourseDto.level !== null) {
      formData.append("Level", updateCourseDto.level.toString());
    }
    if (updateCourseDto.courseType !== undefined && updateCourseDto.courseType !== null) {
      formData.append("CourseType", updateCourseDto.courseType.toString());
    }
    if (updateCourseDto.price !== undefined && updateCourseDto.price !== null) {
      // Revert back to .toString() as per working version
      formData.append("Price", updateCourseDto.price.toString());
    }
    if (updateCourseDto.thumbnailFile) {
      formData.append("ThumbnailFile", updateCourseDto.thumbnailFile);
    }
    if (updateCourseDto.thumbnailUrl !== undefined) {
      // Allow setting thumbnailUrl to null by sending empty string or the actual URL
      formData.append("ThumbnailUrl", updateCourseDto.thumbnailUrl || "");
    }
    if (updateCourseDto.startDate !== undefined && updateCourseDto.startDate !== null) {
      formData.append("StartDate", updateCourseDto.startDate);
    }
    if (updateCourseDto.endDate !== undefined && updateCourseDto.endDate !== null) {
      formData.append("EndDate", updateCourseDto.endDate);
    }
    if (updateCourseDto.status !== undefined && updateCourseDto.status !== null) {
      formData.append("Status", updateCourseDto.status.toString());
    }

    // Remove the detailed logging to match working version
    const response = await axiosInstance.put<CourseDto>(
      UPDATE_COURSE_URL(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`UpdateCourse API error for ID ${id}:`, error);
    throw error;
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

export const getCourseInstructors = async (courseId: string): Promise<InstructorInfoDto[]> => {
  try {
    // Validate courseId format
    if (!courseId || courseId.trim() === '') {
      throw new Error('CourseId is empty or invalid');
    }
    
    const url = GET_COURSE_INSTRUCTORS_URL(courseId);
    console.log(`Calling getCourseInstructors with URL: ${url}`);
    console.log(`CourseId: ${courseId}`);
    
    const { data } = await axiosInstance.get<InstructorInfoDto[]>(url);
    return data;
  } catch (error: any) {
    console.error(`GetCourseInstructors API error for ID ${courseId}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

export const getCourseInstructorHistory = async (courseId: string): Promise<CourseInstructorHistoryDto[]> => {
  const { data } = await axiosInstance.get<CourseInstructorHistoryDto[]>(GET_COURSE_INSTRUCTOR_HISTORY_URL(courseId));
  return data;
};

export const createPersonalCourse = async (
  userPersonalId: string,
  createCourseDto: CreateCourseDto
): Promise<CourseDto> => {
  try {
    const formData = new FormData();
    formData.append("Title", createCourseDto.title);
    formData.append("Description", createCourseDto.description);
    formData.append("Level", createCourseDto.level.toString());
    formData.append("CourseType", createCourseDto.courseType.toString());
    formData.append("Price", createCourseDto.price.toString());
    formData.append("StartDate", createCourseDto.startDate);
    formData.append("EndDate", createCourseDto.endDate);
    if (createCourseDto.thumbnailFile) {
      formData.append("ThumbnailFile", createCourseDto.thumbnailFile);
    }
    if (createCourseDto.thumbnailUrl) {
      formData.append("ThumbnailUrl", createCourseDto.thumbnailUrl);
    }

    // Gửi yêu cầu POST đến API khóa học cá nhân
    const response = await axiosInstance.post<CourseDto>(
      CREATE_PERSONAL_COURSE_URL(userPersonalId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`CreatePersonalCourse API error for user ${userPersonalId}:`, error);
    throw error; // Ném lỗi để component gọi có thể bắt và xử lý
  }
};

export const getPersonalCourseDetail = async (courseId: string): Promise<CourseDto> => {
  try {
    // Validate courseId format
    if (!courseId || courseId.trim() === '') {
      throw new Error('CourseId is empty or invalid');
    }
    
    // Log the URL being called
    const url = GET_PERSONAL_COURSE_DETAIL_URL(courseId);
    console.log(`Calling getPersonalCourseDetail with URL: ${url}`);
    console.log(`CourseId: ${courseId}`);
    
    const response = await axiosInstance.get<CourseDto>(url);
    return response.data;
  } catch (error: any) {
    console.error(`GetPersonalCourseDetail API error for ID ${courseId}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request was made but no response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

export const getPersonalCoursesList = async (userPersonalId: string): Promise<CourseDto[]> => {
  try {
    // Validate userPersonalId format
    if (!userPersonalId || userPersonalId.trim() === '') {
      throw new Error('UserPersonalId is empty or invalid');
    }
    
    // Log the URL being called
    const url = GET_PERSONAL_COURSES_LIST_URL(userPersonalId);
    console.log(`Calling getPersonalCoursesList with URL: ${url}`);
    console.log(`UserPersonalId: ${userPersonalId}`);
    
    const response = await axiosInstance.get<CourseDto[]>(url);
    return response.data;
  } catch (error: any) {
    console.error(`GetPersonalCoursesList API error for user ${userPersonalId}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request was made but no response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};
