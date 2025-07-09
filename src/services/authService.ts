import axiosInstance from "../consts/axios/axiosInstance";

import {
  LOGIN_URL, 
  LOGOUT_URL,
  REGISTER_URL, 
  REFRESH_TOKEN
} from "../consts/apiUrl/baseUrl";

interface UserInfoResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role : string; // Nếu role được trả về trực tiếp trong user object
}

interface AuthSuccessResponse  {
  accessToken: string;
  refreshToken: string;
  user: UserInfoResponse;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null; 
  avatarUrl?: string | null; 
}
interface LoginPayload {
  email: string; 
  password: string;
}
interface LogoutPayload {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
}
export const register = async (registerData: RegisterPayload) => {
  try {
    const response = await axiosInstance.post<AuthSuccessResponse>(REGISTER_URL, registerData);
    
    // Lưu trữ token sau khi đăng ký thành công (giống như đăng nhập)
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error; 
  }
};


export const login = async (loginData: LoginPayload) => {
  try {
    // Gán kiểu LoginSuccessResponse cho phản hồi để TypeScript hiểu cấu trúc data
    const response = await axiosInstance.post<AuthSuccessResponse >(LOGIN_URL, loginData);
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    
    // Trả về toàn bộ data từ response (bao gồm accessToken, refreshToken, và user info)
    return response.data; 
  } catch (error) {
    console.error("Login API error:", error);
    // Ném lỗi để AuthProvider hoặc component gọi có thể bắt và xử lý cụ thể
    throw error;
  }
};

export const logout = async () => {
  try {
    // Lấy token từ localStorage
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // Chỉ gửi request nếu có token
    if (accessToken && refreshToken) {
      const logoutData: LogoutPayload = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      await axiosInstance.post(LOGOUT_URL, logoutData);
      console.log("Logged out successfully on backend.");
    } else {
      console.warn("No access/refresh token found to send to logout API.");
    }
  } catch (error) {
    console.error("Logout API error:", error);
    
  } finally {
    // Luôn xóa token khỏi localStorage dù backend có lỗi hay không
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

export const refreshToken = async (accessToken: string, oldRefreshToken: string) => {
  try {
    const payload: RefreshTokenPayload = {
      accessToken: accessToken,
      refreshToken: oldRefreshToken,
    };
    
    // Gán kiểu AuthSuccessResponse cho phản hồi
    const res = await axiosInstance.post<AuthSuccessResponse>(REFRESH_TOKEN, payload);
    return res.data; // Trả về res.data trực tiếp, chứa accessToken, refreshToken, user
  } catch (error) {
    console.error("Refresh token service error:", error);
    throw error; // Ném lỗi để interceptor có thể bắt và xử lý
  }
};

