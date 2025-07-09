import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaAngleDown, FaAngleUp, FaSearch, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, userInfo, handleLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target &&
        !dropdownRef.current.contains(event.target as HTMLElement)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        event.target &&
        !profileDropdownRef.current.contains(event.target as HTMLElement)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
    navigate(paths.login, { replace: true });
  };

  return (
    <header className="bg-gradient-to-r from-red-100 via-white to-red-100/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-md border-b border-gray-200 font-['Noto_Serif_JP'] transition-all duration-300">
      <div className="w-full py-3 px-4 flex items-center justify-between">
        <div
          className="flex items-center gap-4 justify-start flex-grow-0"
          ref={dropdownRef}
        >
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="JCertPre logo"
              className="h-14 w-14 rounded-full object-cover border border-red-300"
            />
            <span className="text-lg font-bold text-red-600 tracking-tight hidden sm:inline">
              JCertPre
            </span>
          </Link>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full transition border font-['Merriweather'] tracking-wide uppercase
            ${
              isDropdownOpen
                ? "bg-red-100 text-red-700 border-red-300"
                : "text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            Khám phá{" "}
            {isDropdownOpen ? (
              <FaAngleUp size={12} />
            ) : (
              <FaAngleDown size={12} />
            )}
          </button>

          <div className="relative hidden sm:block font-['Merriweather']">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-9 pr-3 py-2 rounded-full text-sm border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-gray-700 shadow-md placeholder-gray-400 transition duration-200"
            />
            <FaSearch className="absolute left-3 top-2.5 text-red-400 text-sm" />
          </div>
        </div>

        <nav className="flex justify-center flex-grow gap-6 text-sm font-semibold font-['Merriweather'] whitespace-nowrap">
          {[
            ["Trang chủ", "/"],
            ["Khoá học", "/courses"],
            ["Lớp học trực tuyến", "/live-classes"],
            ["Thi thử", "/mocktest"],
            ["Về chúng tôi", "/about"],
            ["Hỗ trợ", "/support"],
          ].map(([label, path], idx) => (
            <Link
              key={idx}
              to={path}
              className="text-gray-700 uppercase transition duration-200 relative hover:text-red-600"
            >
              <span className="relative z-10">{label}</span>
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-red-400 scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 justify-end flex-grow-0 ml-2">
          {isAuthenticated ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full transition border border-gray-300 hover:bg-red-50 hover:text-red-600 font-['Merriweather']"
              >
                <FaUserCircle size={20} className="text-gray-700" />
                <span>{userInfo?.fullName || "User"}</span>
                {isProfileDropdownOpen ? (
                  <FaAngleUp size={12} />
                ) : (
                  <FaAngleDown size={12} />
                )}
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50">
                  <Link
                    to="/student/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-1.5 rounded-full transition hover:from-red-600 hover:to-red-700 text-sm shadow-md font-['Merriweather'] font-semibold"
              >
                Đăng Ký
              </Link>
              <Link
                to="/login"
                className="text-gray-700 px-5 py-1.5 rounded-full transition hover:bg-white hover:text-red-600 border border-gray-300 text-sm shadow-sm font-['Merriweather'] font-semibold"
              >
                Đăng Nhập
              </Link>
            </>
          )}
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 w-screen bg-white py-10 border-t border-red-100 shadow-2xl z-40 animate-slide-down">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-sm text-gray-800">
            <div>
              <h3 className="font-bold text-red-600 mb-2">Khoá học</h3>
              {["n1", "n2", "n3", "n4", "n5"].map((level, i) => (
                <Link
                  key={i}
                  to={`/course/${level}`}
                  className="block py-1 hover:text-red-500 transition"
                >
                  {`N${i + 1}: ${
                    [
                      "Thành thạo ngữ pháp, đọc hiểu nâng cao",
                      "Tăng tốc luyện đề trung cấp",
                      "Củng cố nền tảng thi JLPT",
                      "Học cơ bản ngữ pháp, từ vựng",
                      "Nhập môn tiếng Nhật",
                    ][i]
                  }`}
                </Link>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-red-600 mb-2">Livestream</h3>
              {["n1", "n2", "n3", "n4", "n5"].map((level, i) => (
                <Link
                  key={i}
                  to={`/livestream/${level}`}
                  className="block py-1 hover:text-red-500 transition"
                >
                  {`N${i + 1}: ${
                    [
                      "Giải đề thực chiến",
                      "Luyện nghe đọc hiểu",
                      "Trọng điểm ngữ pháp",
                      "Kiến thức nền tảng",
                      "Luyện từ vựng",
                    ][i]
                  }`}
                </Link>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-red-600 mb-2">Tài nguyên</h3>
              <Link to="/grammar" className="block py-1 hover:text-red-500">
                Ngữ pháp JLPT
              </Link>
              <Link to="/vocabulary" className="block py-1 hover:text-red-500">
                Từ vựng
              </Link>
              <Link to="/kanji" className="block py-1 hover:text-red-500">
                Hán tự
              </Link>
              <Link to="/practice" className="block py-1 hover:text-red-500">
                Luyện đề
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;