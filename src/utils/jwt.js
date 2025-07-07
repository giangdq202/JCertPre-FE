import jwtDecode from "jwt-decode";
import { toast } from "react-toastify";

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (err) {
    console.error("Lỗi khi decode token:", err);
    return true;
  }
};

export const getUserFromToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    toast.error("Đăng nhập thất bại!");
  }
};
