import React, { useState, ChangeEvent, FormEvent } from "react";
import registerBg from "../../assets/register.png";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Lottie from "lottie-react";
import sakuraAnimation from "../../animations/sakura.json";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { toast } from "react-toastify";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";

interface RegisterFormState {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState<RegisterFormState>({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUserInfo, setIsAuthenticated } = useAuth();

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof RegisterFormState
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("Email", formData.email);
      payload.append("Password", formData.password);
      payload.append("FullName", formData.fullname);
      if (formData.phone) payload.append("Phone", formData.phone);
      if (avatar) payload.append("AvatarFile", avatar, avatar.name);
      
      const response = await register(payload);
      
      // Set user auth info after successful registration
      setUserInfo(response.user);
      setIsAuthenticated(true);
      
      toast.success("Đăng ký thành công!");
      
      // Navigate based on user role
      switch (response.user.roleName) {
        case "STUDENT":
          navigate(paths.student_home);
          break;
        case "ACADEMIC_MANAGER":
          navigate(paths.staff_home);
          break;
        case "INSTRUCTOR":
          navigate(paths.instructor_home);
          break;
        case "ADMIN":
          navigate(paths.admin_home);
          break;
        default:
          navigate("/");
          break;
      }
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại!");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex font-['Merriweather']">
      <Link
        to="/"
        className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 border border-gray-300 hover:border-red-500 text-gray-800 hover:text-red-600 px-4 py-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 text-sm font-medium z-40"
      >
        <FaArrowLeft className="text-sm" />
        Trang chủ
      </Link>

      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${registerBg})` }}
      />

      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute right-0 top-0 w-1/2 h-full transform scale-x-[-1] scale-[1.2]">
          <Lottie animationData={sakuraAnimation} loop autoplay />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12 relative z-20">
        <div className="w-full max-w-sm">
          <div className="mb-1">
            <h1 className="text-3xl font-bold text-gray-800 text-left mb-3">
              Tạo tài khoản
            </h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {[
              { type: "text", name: "fullname", placeholder: "Họ và tên", required: true },
              { type: "email", name: "email", placeholder: "Email", required: true },
              { type: "tel", name: "phone", placeholder: "Số điện thoại (tùy chọn)", required: false },
            ].map(({ type, name, placeholder, required }) => (
              <div key={name} className="relative group">
                <input
                  type={type}
                  name={name}
                  value={formData[name as keyof RegisterFormState]}
                  onChange={(e) => handleInputChange(e, name as keyof RegisterFormState)}
                  placeholder={placeholder}
                  required={required}
                  className="peer w-full px-4 py-3 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-transparent transition-all duration-200"
                />
                <label
                  htmlFor={name}
                  className="absolute left-3 top-3 text-sm text-gray-500 pointer-events-none transition-all duration-200 ease-in-out 
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-red-500 
                    peer-valid:top-[-10px] peer-valid:text-sm peer-valid:text-red-500 bg-white px-1"
                >
                  {placeholder}
                </label>
              </div>
            ))}

            <div className="flex gap-4">
              {[
                {
                  label: "Mật khẩu",
                  name: "password",
                  isShown: showPassword,
                  toggle: setShowPassword,
                },
                {
                  label: "Xác nhận mật khẩu",
                  name: "confirmPassword",
                  isShown: showConfirmPassword,
                  toggle: setShowConfirmPassword,
                },
              ].map(({ label, name, isShown, toggle }, idx) => (
                <div key={idx} className="relative group w-1/2">
                  <input
                    type={isShown ? "text" : "password"}
                    name={name}
                    value={formData[name as keyof RegisterFormState]}
                    onChange={(e) =>
                      handleInputChange(e, name as keyof RegisterFormState)
                    }
                    placeholder={label}
                    required
                    className="peer w-full px-4 py-3 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-transparent transition-all duration-200"
                  />
                  <label
                    className={`absolute left-3 text-sm pointer-events-none transition-all duration-200 ease-in-out bg-white px-1
    ${
      formData[name as keyof RegisterFormState]
        ? "top-[-10px] text-sm text-red-500"
        : "top-3 text-base text-gray-400 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-red-500"
    }
  `}
                  >
                    {label}
                  </label>

                  <span
                    className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                    onClick={() => toggle(!isShown)}
                  >
                    {isShown ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <label className="block text-gray-700 font-medium">
                Ảnh đại diện (tùy chọn)
              </label>
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <label
                    htmlFor="avatar-upload"
                    className="w-20 h-20 flex items-center justify-center rounded-full border-2 border-dashed border-gray-400 cursor-pointer hover:border-red-400 transition absolute inset-0 z-0"
                  >
                    <PhotoCamera className="text-2xl text-gray-500" />
                  </label>
                  {avatar && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 z-10 cursor-pointer"
                    >
                      <img
                        src={URL.createObjectURL(avatar)}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-red-400"
                      />
                    </label>
                  )}
                </div>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-full font-semibold shadow-md transition duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          <p className="text-sm text-gray-700 mt-1 text-center">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-red-500 font-semibold underline">
              Đăng Nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
