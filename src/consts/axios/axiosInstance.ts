
import axios from 'axios';
import { BASE_URL, REFRESH_TOKEN } from "../apiUrl/baseUrl.ts";
import { refreshToken } from "../../services/authService.ts";
let onLogoutCallback: (() => void) | null = null;
export const setOnLogoutCallback = (callback: () => void) => {
    onLogoutCallback = callback;
};

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
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
        
        // Log request for debugging
        if (config.url?.includes('feedbacks')) {
            console.log('Axios Request:', {
                method: config.method,
                url: config.url,
                baseURL: config.baseURL,
                fullURL: `${config.baseURL}${config.url}`,
                data: config.data,
                headers: config.headers
            });
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
        // Log feedback errors for debugging
        if (error.config?.url?.includes('feedbacks')) {
            console.log('Axios Response Error:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method,
                requestData: error.config?.data
            });
        }
        const originalConfig = error.config; // Lưu cấu hình của request gốc
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
        if (error.response && error.response.status === 401 && isAuthRefreshEndpoint) {
            console.error('Refresh token endpoint itself returned 401. Session is truly expired. Logging out.');
            if (onLogoutCallback) {
                onLogoutCallback(); // Kích hoạt đăng xuất toàn cục
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;