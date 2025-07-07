import React, { useState, ChangeEvent, FormEvent } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import googleLogo from "../../assets/Google__G__logo.svg.png";
import loginImage from "../../assets/login.png";
import { Link } from "react-router-dom";
import backgroundLogin from "../../assets/background_login.jpg";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // API login logic
  };

  const handleGoogleLogin = () => {
    console.log("Đăng nhập bằng Google");
    // Google auth logic
  };

  return (
    <div className="h-screen flex font-['Merriweather'] relative">
      <Link
        to="/"
        className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 border border-gray-300 hover:border-green-500 text-gray-800 hover:text-green-600 px-4 py-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 text-sm font-medium z-40"
      >
        <FaArrowLeft className="text-green-600 text-sm" />
        Trang chủ
      </Link>

      <div className="w-1/2 hidden md:flex items-center justify-center bg-green-100">
        <img
          src={loginImage}
          alt="Login Visual"
          className="object-cover w-full h-full"
        />
      </div>

      <div
        className="w-full md:w-1/2 flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundLogin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 w-full max-w-md bg-white/90 p-10 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Đăng nhập
          </h1>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="relative group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                placeholder="Email"
                className="peer w-full px-4 py-3 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-transparent transition-all duration-200"
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-2.5 text-sm text-gray-500 bg-white px-1 pointer-events-none transition-all duration-200 ease-in-out 
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
            peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-green-600"
              >
                Email
              </label>
            </div>

            <div className="relative group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                placeholder="Mật khẩu"
                className="peer w-full px-4 py-3 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-transparent transition-all duration-200 pr-10"
              />
              <label
                htmlFor="password"
                className="absolute left-3 -top-2.5 text-sm text-gray-500 bg-white px-1 pointer-events-none transition-all duration-200 ease-in-out 
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
            peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-green-600"
              >
                Mật khẩu
              </label>
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember" className="text-gray-700 text-sm">
                Ghi nhớ đăng nhập
              </label>
              <a
                href="#"
                className="ml-auto text-green-600 text-sm font-medium hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full font-semibold shadow-md transition duration-300"
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
            <Link
              to="/register"
              className="text-green-600 font-semibold hover:underline"
            >
              Đăng Ký Ngay!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
