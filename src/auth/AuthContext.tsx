import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { refreshToken, login, logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import paths from "../routes/path";
// import { decode } from "../consts/utils"; // Giữ lại decode cho mục đích đọc claims nếu cần
import { TokenData } from "../types/common.types"; // TokenData sẽ được dùng cho userInfo

// Định nghĩa lại UserInfoResponse để phù hợp hơn với đối tượng 'user' từ backend
// và sẽ sử dụng cho userInfo trong AuthContext.
// Đảm bảo UserInfoResponse đã được định nghĩa trong common.types.ts hoặc authService.ts
// và được export để có thể import vào đây.
interface UserInfoResponse {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    // Thêm các trường khác nếu có trong AppUserDto hoặc đối tượng 'user' trả về từ API
    avatarUrl?: string | null; // Có trong RegisterModel, có thể có trong AppUserDto
    role?: string; // Nếu role được trả về trực tiếp trong user object
}


interface AuthContextType {
    isAuthenticated: boolean;
    jwtToken: string | null;
    userInfo: UserInfoResponse | undefined; // Thay TokenData bằng UserInfoResponse
    isLoading: boolean;
    handleLogin: (email: string, password: string) => Promise<void>;
    handleLogout: () => void;
    setUserInfo: (user: UserInfoResponse) => void; // Thay TokenData bằng UserInfoResponse
    setIsAuthenticated: (auth: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfoResponse>(); // Thay TokenData bằng UserInfoResponse
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const token = localStorage.getItem('refreshToken');
            if (token) {
                handleRefreshToken(token);
            } else {
                setIsLoading(false);
            }
        } catch (err) {
            console.log(err);
        }
    }, []);

    const handleRefreshToken = async (oldRefreshToken: string) => {
        try {
            const oldAccessToken = localStorage.getItem('accessToken');
            if (!oldAccessToken) {
                setIsLoading(false);
                navigate('/login');
                return;
            }

            const refreshResponse = await refreshToken(oldAccessToken, oldRefreshToken); 
            
            setJwtToken(refreshResponse.accessToken);
            localStorage.setItem("accessToken", refreshResponse.accessToken);
            localStorage.setItem("refreshToken", refreshResponse.refreshToken);
            
            // *** CẬP NHẬT: Lưu userInfo từ phản hồi của API ***
            setUserInfo(refreshResponse.user); 
            
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Refresh token error:", error);
            navigate("/login");
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            const responseData = await login({ email, password }); // responseData là AuthSuccessResponse
            
            setJwtToken(responseData.accessToken);
            localStorage.setItem("accessToken", responseData.accessToken);
            localStorage.setItem("refreshToken", responseData.refreshToken);
            
            // *** CẬP NHẬT: Lưu userInfo từ phản hồi của API ***
            setUserInfo(responseData.user); 
            
            setIsAuthenticated(true);
            navigate(paths.home);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout(); 
        
        setJwtToken(null);
        setUserInfo(undefined);
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, jwtToken, userInfo, isLoading, handleLogin, handleLogout, setUserInfo, setIsAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};