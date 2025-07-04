import axios from 'axios';
import { BASE_URL } from "../apiUrl/baseUrl.ts";
import { refreshToken } from "../../services/authService.ts";
// Creating an instance of Axios with a base URL
const axiosInstance = axios.create({
    baseURL: BASE_URL
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// Adding a response interceptor to the Axios instance
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalConfig = error.config; // Store original request config
        if (error.response && error.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true; // Mark this request as a retry

            // Lấy token hiện tại từ localStorage
            const oldAccessToken = localStorage.getItem('accessToken');
            const oldRefreshToken = localStorage.getItem('refreshToken');

            if (oldAccessToken && oldRefreshToken) {
                try {
                    // Gọi hàm refreshToken đã được cập nhật, truyền cả 2 token
                    const refreshResponse = await refreshToken(oldAccessToken, oldRefreshToken);
                    
                    // Lấy token mới từ phản hồi
                    const newAccessToken = refreshResponse.accessToken;
                    const newRefreshToken = refreshResponse.refreshToken; // Lấy newRefreshToken

                    if (newAccessToken && newRefreshToken) {
                        // Cập nhật local storage với token mới
                        localStorage.setItem('accessToken', newAccessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);
                        
                        // Cập nhật header Authorization cho request gốc
                        originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        // Thử lại request gốc
                        return axiosInstance(originalConfig);
                    } else {
                        console.error('Refresh token API did not return new tokens.');
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    console.error('Failed to refresh token. Redirecting to login.', refreshError);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    return Promise.reject(refreshError);
                }
            } else {
                console.warn('No existing access/refresh tokens found in localStorage.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;