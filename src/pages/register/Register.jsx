import React from "react";
import register from "../../assets/register.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${register})` }}
    >
      <div className="bg-white/90 p-8 rounded-md w-full max-w-md shadow-lg font-['Noto_Serif_JP']">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Chào mừng bạn đến với JCertPre!
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Bắt đầu học tiếng Nhật ngay hôm nay. <br />
          <span className="font-semibold text-black">
            Làm bài kiểm tra trình độ miễn phí!
          </span>
        </p>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">
              Tên tài khoản
            </label>
            <input
              type="text"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium">Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              className="mt-1 w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
            <span
              className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium">
              Xác nhận mật khẩu
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="mt-1 w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
            <span
              className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium transition duration-300"
          >
            Tiếp tục
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-4 text-center">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-red-500 font-medium underline">
            Đăng nhập
          </a>
        </p>

        <p className="text-xs text-gray-600 mt-4">
          Dữ liệu của bạn được bảo vệ bởi{" "}
          <a href="#" className="text-red-500 underline">
            Chính sách bảo mật
          </a>
          .<br />
          Khi tiếp tục, bạn đồng ý với{" "}
          <a href="#" className="text-red-500 underline">
            Điều khoản dịch vụ
          </a>
        </p>
      </div>
    </div>
  );
}
