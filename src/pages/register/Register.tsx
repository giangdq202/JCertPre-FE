import React, { useState, ChangeEvent } from "react";
import registerBg from "../../assets/register.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Lottie from "lottie-react";
import sakuraAnimation from "../../animations/sakura.json";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [phone, setPhone] = useState("");

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatar(e.target.files[0]);
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

      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full transform scale-x-[-1] scale-[1.2]">
          <Lottie animationData={sakuraAnimation} loop autoplay />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12 relative z-20">
        <div className="w-full max-w-sm">
          <div className="mb-1">
            <h1 className="text-3xl font-bold text-gray-800 text-left">
              Tạo tài khoản
            </h1>
          </div>

          <form className="space-y-6">
            {[
              { type: "text", name: "fullname", placeholder: "Họ và tên" },
              { type: "email", name: "email", placeholder: "Email" },
              {
                type: "tel",
                name: "phone",
                placeholder: "Số điện thoại",
                value: phone,
              },
            ].map(({ type, name, placeholder, value }) => (
              <div key={name} className="relative group">
                <input
                  type={type}
                  name={name}
                  value={value ?? undefined}
                  onChange={
                    name === "phone"
                      ? (e) => setPhone(e.target.value)
                      : undefined
                  }
                  placeholder={placeholder}
                  required
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
                  isShown: showPassword,
                  toggle: setShowPassword,
                },
                {
                  label: "Xác nhận mật khẩu",
                  isShown: showConfirmPassword,
                  toggle: setShowConfirmPassword,
                },
              ].map(({ label, isShown, toggle }, idx) => (
                <div key={idx} className="relative group w-1/2">
                  <input
                    type={isShown ? "text" : "password"}
                    placeholder={label}
                    required
                    className="peer w-full px-4 py-3 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-transparent transition-all duration-200"
                  />
                  <label
                    className="absolute left-3 top-3 text-sm text-gray-500 pointer-events-none transition-all duration-200 ease-in-out 
                        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                        peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-red-500 bg-white px-1"
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
                Ảnh đại diện
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
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-full font-semibold shadow-md transition duration-300"
            >
              Tạo tài khoản
            </button>
          </form>

          <p className="text-sm text-gray-700 mt-1 text-center">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-red-500 font-semibold underline">
              Đăng Nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
