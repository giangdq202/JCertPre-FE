import axiosInstance from "../consts/axios/axiosInstance";
import { BASE_URL } from "../consts/apiUrl/baseUrl";
import { isAxiosError } from "axios";

// API URLs
const USERS_BASE_URL = `${BASE_URL}/users`;

// Types
export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  credit: number;
  createdAt: string;
  lastLogin: string;
  status: UserStatus;
  roleId: string;
  roleName?: string;
}

export enum UserStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2
}

export interface UserQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  searchQuery?: string;
  status?: UserStatus;
  roleId?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface PaginatedUserResponse {
  items: UserDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  avatarFile?: File;
}

export interface ApiErrorResponse {
  message: string;
  errors?: string[];
}

// Service functions
export const getAllUsers = async (parameters: UserQueryParameters = {}): Promise<PaginatedUserResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (parameters.pageNumber) queryParams.append('pageNumber', parameters.pageNumber.toString());
    if (parameters.pageSize) queryParams.append('pageSize', parameters.pageSize.toString());
    if (parameters.searchQuery) queryParams.append('searchQuery', parameters.searchQuery);
    if (parameters.status !== undefined) queryParams.append('status', parameters.status.toString());
    if (parameters.roleId) queryParams.append('roleId', parameters.roleId);
    if (parameters.sortBy) queryParams.append('sortBy', parameters.sortBy);
    if (parameters.sortDescending !== undefined) queryParams.append('sortDescending', parameters.sortDescending.toString());

    const url = `${USERS_BASE_URL}?${queryParams.toString()}`;
    const response = await axiosInstance.get<PaginatedUserResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Get all users API error:", error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<UserDto> => {
  try {
    const response = await axiosInstance.get<UserDto>(`${USERS_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get user by ID API error:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, updateData: UpdateUserDto): Promise<UserDto> => {
  try {
    const formData = new FormData();
    
    if (updateData.fullName) {
      formData.append('fullName', updateData.fullName);
    }
    if (updateData.phone) {
      formData.append('phone', updateData.phone);
    }
    if (updateData.avatarFile) {
      formData.append('avatarFile', updateData.avatarFile);
    }

    const response = await axiosInstance.put<UserDto>(`${USERS_BASE_URL}/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update user API error:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`${USERS_BASE_URL}/${userId}`);
    return true;
  } catch (error) {
    console.error("Delete user API error:", error);
    throw error;
  }
};

export const updateUserAvatar = async (userId: string, avatarFile: File): Promise<UserDto> => {
  try {
    const formData = new FormData();
    formData.append('avatarFile', avatarFile);

    const response = await axiosInstance.put<UserDto>(`${USERS_BASE_URL}/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update user avatar API error:", error);
    throw error;
  }
};

export const userExists = async (userId: string): Promise<boolean> => {
  try {
    await axiosInstance.head(`${USERS_BASE_URL}/${userId}`);
    return true;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return false;
    }
    console.error("User exists API error:", error);
    throw error;
  }
}; 