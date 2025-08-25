import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_STUDENT_PROFILE_URL,
  CREATE_STUDENT_PROFILE_URL,
  UPDATE_STUDENT_PROFILE_URL,
  DELETE_STUDENT_PROFILE_URL,
} from "../consts/apiUrl/baseUrl";
export interface StudentProfileDto {
  userId: string; // Guid trong C# được biểu diễn bằng string trong TypeScript
  currentLevel: string;
  learningGoals: string;
}
import axios from "axios";

// Interface cho các tham số đầu vào khi tạo hồ sơ, sử dụng cho các tham số [FromQuery]
export interface CreateStudentProfileParams {
  userId: string;
  currentLevel: string;
  learningGoals: string;
}

export interface UpdateStudentProfileParams {
  userId: string;
  currentLevel?: string;
  learningGoals?: string;
}

/**
 * Lấy hồ sơ sinh viên dựa trên userId.
 * Tương ứng với GET /api/studentprofile/{userId}
 * * @param userId ID của sinh viên (GUID).
 * @returns StudentProfileDto
 */
export const getStudentProfile = async (
  userId: string
): Promise<StudentProfileDto | null> => {
  try {
    const response = await axiosInstance.get<StudentProfileDto>(
      GET_STUDENT_PROFILE_URL(userId)
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Không log lỗi 404 nữa, chỉ trả null
      return null;
    }

    // Những lỗi khác vẫn log để biết có vấn đề thật sự
    console.error(`GetStudentProfile API error for userId ${userId}:`, error);
    throw error;
  }
};

/**
 * Tạo hồ sơ sinh viên mới.
 * Tương ứng với POST /api/studentprofile/create
 * Lưu ý: Backend sử dụng [FromQuery] nên chúng ta sẽ truyền tham số qua query string.
 * * @param createParams Các tham số để tạo hồ sơ (userId, currentLevel, learningGoals).
 * @returns StudentProfileDto của hồ sơ vừa tạo.
 */
export const createStudentProfile = async (
  createParams: CreateStudentProfileParams
): Promise<StudentProfileDto> => {
  try {
    // Gửi yêu cầu POST với các tham số được truyền qua query string (params)
    const response = await axiosInstance.post<StudentProfileDto>(
      CREATE_STUDENT_PROFILE_URL,
      null, // Body của request POST có thể để null hoặc empty vì tham số được truyền qua query string
      {
        params: {
          userId: createParams.userId,
          currentLevel: createParams.currentLevel,
          learningGoals: createParams.learningGoals,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("CreateStudentProfile API error:", error);
    throw error; // Ném lỗi để component gọi có thể xử lý
  }
};

/**
 * Cập nhật hồ sơ sinh viên.
 * Tương ứng với PUT /api/studentprofile/update
 * @param updateParams Các tham số để cập nhật hồ sơ
 * @returns StudentProfileDto của hồ sơ đã cập nhật
 */
export const updateStudentProfile = async (
  updateParams: UpdateStudentProfileParams
): Promise<StudentProfileDto> => {
  try {
    const response = await axiosInstance.put<StudentProfileDto>(
      UPDATE_STUDENT_PROFILE_URL(updateParams.userId),
      null,
      {
        params: {
          ...(updateParams.currentLevel && { currentLevel: updateParams.currentLevel }),
          ...(updateParams.learningGoals && { learningGoals: updateParams.learningGoals }),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("UpdateStudentProfile API error:", error);
    throw error;
  }
};

/**
 * Cập nhật chỉ current level của student khi họ pass test cao hơn
 * @param userId ID của sinh viên
 * @param newLevel Trình độ mới
 * @returns StudentProfileDto đã cập nhật
 */
export const updateStudentLevel = async (
  userId: string,
  newLevel: string
): Promise<StudentProfileDto> => {
  try {
    // Get current profile first
    const currentProfile = await getStudentProfile(userId);
    if (!currentProfile) {
      throw new Error("Student profile not found");
    }

    // Update only the level, keep existing learning goals
    return await updateStudentProfile({
      userId,
      currentLevel: newLevel,
      learningGoals: currentProfile.learningGoals,
    });
  } catch (error) {
    console.error("UpdateStudentLevel API error:", error);
    throw error;
  }
};
