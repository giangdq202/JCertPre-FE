import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { refreshToken, login, logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import paths from "../routes/path";
interface UserInfoResponse {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl?: string | null; // Có trong RegisterModel, có thể có trong AppUserDto
    role: string; // Nếu role được trả về trực tiếp trong user object
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
                    navigate('/login');
                }
            } catch (err) {
                console.log(err);
            }
        }, []);
        const handleRefreshToken = async (refreshTokenValue: string) => {
        try {
            const oldAccessToken = localStorage.getItem('accessToken');
            if (!oldAccessToken) {
                setIsLoading(false);
                navigate('/login');
                return;
            }
        const response = await refreshToken(oldAccessToken, refreshTokenValue);
        if (response?.accessToken) {
            setJwtToken(response.accessToken);
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);

            // Lấy thông tin user từ phản hồi API, role đã có trong user
            await setUserInfo(response.user);
            setIsAuthenticated(true);

            // Điều hướng dựa trên role từ userInfo
            switch (response.user.role) {
            case "STUDENT":
                navigate("/");
                break;
            case "ACADEMIC_MANAGER":
                navigate(paths.staff_home);
                break;
            default:
                navigate("/");
                break;
            }
        } else {
            navigate("/login");
            setIsAuthenticated(false);
        }
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
        const responseData = await login({ email, password });
        setJwtToken(responseData.accessToken);
        localStorage.setItem("accessToken", responseData.accessToken);
        localStorage.setItem("refreshToken", responseData.refreshToken);

        // Lấy thông tin user từ phản hồi API, role đã có trong user
        setUserInfo(responseData.user);
        setIsAuthenticated(true);

        // Điều hướng dựa trên role từ userInfo
        switch (responseData.user.role) {
            case "STUDENT":
            navigate("/homepage");
            break;
            case "ACADEMIC_MANAGER":
            navigate(paths.staff_home);
            break;
            default:
            navigate("/");
            break;
        }
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