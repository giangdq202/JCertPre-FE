import axiosInstance from "../consts/axios/axiosInstance";
import { BASE_URL } from "../consts/apiUrl/baseUrl";

// API URLs
const INSTRUCTOR_PROFILE_BASE_URL = `${BASE_URL}/instructor-profile`;

// Types
export interface InstructorProfileDto {
  userId: string;
  introduction: string;
  experience?: string;
  teachingStyle?: string;
}

export interface CreateInstructorProfileRequest {
  userId: string;
  introduction: string;
  experience?: string;
  teachingStyle?: string;
}

export interface UpdateInstructorProfileRequest {
  introduction: string;
  experience?: string;
  teachingStyle?: string;
}

// Service functions
export const createInstructorProfile = async (request: CreateInstructorProfileRequest): Promise<InstructorProfileDto> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('userId', request.userId);
    queryParams.append('introduction', request.introduction);
    if (request.experience) {
      queryParams.append('experience', request.experience);
    }
    if (request.teachingStyle) {
      queryParams.append('teachingStyle', request.teachingStyle);
    }

    const url = `${INSTRUCTOR_PROFILE_BASE_URL}/create?${queryParams.toString()}`;
    const response = await axiosInstance.post<InstructorProfileDto>(url);
    return response.data;
  } catch (error) {
    console.error("Create instructor profile API error:", error);
    throw error;
  }
};

export const getInstructorProfile = async (userId: string): Promise<InstructorProfileDto> => {
  try {
    const response = await axiosInstance.get<InstructorProfileDto>(`${INSTRUCTOR_PROFILE_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get instructor profile API error:", error);
    throw error;
  }
};

export const updateInstructorProfile = async (userId: string, request: UpdateInstructorProfileRequest): Promise<InstructorProfileDto> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('introduction', request.introduction);
    if (request.experience) {
      queryParams.append('experience', request.experience);
    }
    if (request.teachingStyle) {
      queryParams.append('teachingStyle', request.teachingStyle);
    }

    const url = `${INSTRUCTOR_PROFILE_BASE_URL}/update/${userId}?${queryParams.toString()}`;
    const response = await axiosInstance.put<InstructorProfileDto>(url);
    return response.data;
  } catch (error) {
    console.error("Update instructor profile API error:", error);
    throw error;
  }
};

export const deleteInstructorProfile = async (userId: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`${INSTRUCTOR_PROFILE_BASE_URL}/delete/${userId}`);
    return true;
  } catch (error) {
    console.error("Delete instructor profile API error:", error);
    throw error;
  }
}; 