import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import googleLogo from "../../assets/Google__G__logo.svg.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log({ username, password, rememberMe });
  };

  const handleGoogleLogin = () => {
    console.log("Đăng nhập bằng Google");
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gray-100 font-['Noto_Serif_JP']">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Đăng nhập
        </h1>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu
              <a href="#" className="text-red-500 text-sm ml-2">
                (Quên mật khẩu?)
              </a>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="mr-2"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="remember" className="text-gray-700">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium transition duration-300 shadow-md"
          >
            Đăng nhập
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-sm text-gray-500">hoặc</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:shadow-md bg-white transition"
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5 mr-2" />
          <span className="text-sm text-gray-700 font-medium">
            Đăng nhập bằng Google
          </span>
        </button>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-red-500 font-medium hover:underline"
          >
            Đăng ký ngay!
          </a>
        </p>
      </div>
    </div>
  );
}
