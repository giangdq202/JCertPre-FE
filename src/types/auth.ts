export interface UserInfo {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    roleName?: string;
}

export interface AuthContextType {
    userInfo: UserInfo | null;
    setUserInfo: (userInfo: UserInfo | null) => void;
    isLoading: boolean;
}
