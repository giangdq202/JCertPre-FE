// src/utils/axios/axiosInstance.ts (hoặc consts/axios/axiosInstance.ts)

import axios from 'axios';
import { BASE_URL, REFRESH_TOKEN } from "../apiUrl/baseUrl.ts"; // Import REFRESH_TOKEN
import { refreshToken } from "../../services/authService.ts"; // Import hàm refreshToken đã được cập nhật

// Biến tạm để lưu trữ hàm logout từ AuthContext.
// Đây là một cách để "tiêm" hàm logout vào interceptor mà không tạo ra dependency cycle.
let onLogoutCallback: (() => void) | null = null;

/**
 * Đăng ký một hàm callback để được gọi khi phiên làm mới token thất bại
 * và người dùng cần được đăng xuất.
 * Thường được gọi từ AuthContext.
 * @param callback Hàm logout từ AuthContext.
 */
export const setOnLogoutCallback = (callback: () => void) => {
    onLogoutCallback = callback;
};

// Tạo một instance của Axios với base URL
const axiosInstance = axios.create({
    baseURL: BASE_URL
});

// Interceptor cho request: Thêm Access Token vào header Authorization
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            // Đảm bảo headers tồn tại trước khi truy cập
            if (!config.headers) {
                config.headers = new axios.AxiosHeaders();
            }
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        // Xử lý lỗi request (ví dụ: network issues)
        return Promise.reject(error);
    }
);

// Interceptor cho response: Xử lý lỗi 401 (Unauthorized) và làm mới token
axiosInstance.interceptors.response.use(
    (response) => response, // Nếu response thành công, trả về nguyên trạng
    async (error) => {
        const originalConfig = error.config; // Lưu cấu hình của request gốc

        // Điều kiện để thử làm mới token:
        // 1. Phản hồi có lỗi và status là 401 (Unauthorized)
        // 2. Yêu cầu này chưa được đánh dấu là đã thử lại (_retry)
        // 3. Endpoint của yêu cầu gốc KHÔNG PHẢI là endpoint làm mới token
        //    (Điều này rất quan trọng để tránh vòng lặp vô tận nếu chính API refresh token bị 401)
        const isAuthRefreshEndpoint = originalConfig.url?.includes(REFRESH_TOKEN); // Kiểm tra URL có chứa REFRESH_TOKEN không

        if (error.response && error.response.status === 401 && !originalConfig._retry && !isAuthRefreshEndpoint) {
            originalConfig._retry = true; // Đánh dấu request này là đã thử lại

            const oldAccessToken = localStorage.getItem('accessToken');
            const oldRefreshToken = localStorage.getItem('refreshToken');

            // Chỉ cố gắng làm mới token nếu cả access và refresh token đều tồn tại
            if (oldAccessToken && oldRefreshToken) {
                try {
                    // Gọi hàm refreshToken từ authService (đã được cập nhật để nhận cả 2 token)
                    const refreshResponse = await refreshToken(oldAccessToken, oldRefreshToken);
                    
                    const newAccessToken = refreshResponse.accessToken;
                    const newRefreshToken = refreshResponse.refreshToken;

                    // Nếu nhận được token mới hợp lệ
                    if (newAccessToken && newRefreshToken) {
                        // Cập nhật localStorage với token mới
                        localStorage.setItem('accessToken', newAccessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);
                        
                        // Cập nhật header Authorization cho request gốc với access token mới
                        // Đảm bảo headers tồn tại
                        if (!originalConfig.headers) {
                            originalConfig.headers = {};
                        }
                        originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        // Thử lại request gốc với token mới
                        return axiosInstance(originalConfig);
                    } else {
                        // Trường hợp API refresh token không trả về token mới như mong đợi
                        console.error('Refresh token API did not return new tokens. Logging out.');
                        if (onLogoutCallback) {
                            onLogoutCallback(); // Kích hoạt đăng xuất toàn cục
                        }
                        return Promise.reject(error); // Vẫn trả về lỗi gốc
                    }
                } catch (refreshError) {
                    // Xử lý lỗi khi gọi API refresh token (ví dụ: refresh token không hợp lệ/hết hạn)
                    console.error('Failed to refresh token (interceptor). Logging out.', refreshError);
                    if (onLogoutCallback) {
                        onLogoutCallback(); // Kích hoạt đăng xuất toàn cục
                    }
                    return Promise.reject(refreshError); // Trả về lỗi làm mới token
                }
            } else {
                // Không có access token hoặc refresh token trong localStorage để thử làm mới
                console.warn('No existing access/refresh tokens found in localStorage for refresh attempt. Logging out.');
                if (onLogoutCallback) {
                    onLogoutCallback(); // Kích hoạt đăng xuất toàn cục
                }
                return Promise.reject(error); // Trả về lỗi gốc
            }
        }
        
        // Trường hợp lỗi là 401 nhưng từ chính endpoint refresh token,
        // hoặc lỗi không phải 401, hoặc đã thử lại.
        // Trong trường hợp này, không cố gắng làm mới nữa, chỉ trả về lỗi.
        if (error.response && error.response.status === 401 && isAuthRefreshEndpoint) {
            console.error('Refresh token endpoint itself returned 401. Session is truly expired. Logging out.');
            if (onLogoutCallback) {
                onLogoutCallback(); // Kích hoạt đăng xuất toàn cục
            }
        }

        // Trả về lỗi cho các trường hợp khác
        return Promise.reject(error);
    }
);

export default axiosInstance;