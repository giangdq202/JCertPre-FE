import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaAngleDown, FaAngleUp, FaSearch } from "react-icons/fa";
import logo from "../../assets/logo.png"; // Ensure the path to the logo is correct

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event : MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target &&
        !dropdownRef.current.contains(event.target as HTMLElement)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <header className="bg-[#062530] text-white font-['Noto_Serif_JP'] relative z-50">
      <div className="max-w-[1280px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
        {/* Left: Khám phá + Search */}
        <div className="flex items-center gap-4 sm:gap-6 ml-2 sm:ml-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 transition ${
                isDropdownOpen ? "border-b-2 border-red-500" : ""
              }`}
            >
              Khám phá{" "}
              {isDropdownOpen ? (
                <FaAngleUp size={12} />
              ) : (
                <FaAngleDown size={12} />
              )}
            </button>
          </div>

          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="px-3 py-1.5 pl-8 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <FaSearch className="absolute left-2 top-2 text-gray-500 text-sm" />
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="JCertPre logo"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-lg font-semibold">JCertPre</span>
        </div>

        {/* Right: Links */}
        <nav className="flex items-center gap-6 text-sm font-semibold mr-2 sm:mr-4 mt-2 sm:mt-0">
          <Link
            to="/about"
            className="text-white hover:underline hover:decoration-white"
          >
            Về chúng tôi
          </Link>
          <Link
            to="/register"
            className="bg-red-500 text-white px-4 py-2 rounded-md transition border-2 border-transparent hover:border-white"
          >
            Đăng ký
          </Link>
          <Link
            to="/login"
            className="text-white hover:underline hover:decoration-white"
          >
            Đăng nhập
          </Link>
        </nav>
      </div>

      {/* Full Width Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 w-screen bg-white text-black z-40 py-10 shadow-xl">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Column 1 */}
            <div>
              <h3 className="font-bold text-sm mb-2">Khoá học</h3>
              <Link to="/course/n1" className="block py-1 hover:text-red-500">
                N1: Thành thạo ngữ pháp, đọc hiểu nâng cao JLPT
              </Link>
              <Link to="/course/n2" className="block py-1 hover:text-red-500">
                N2: Tăng tốc luyện đề trung cấp
              </Link>
              <Link to="/course/n3" className="block py-1 hover:text-red-500">
                N3: Củng cố nền tảng thi JLPT
              </Link>
              <Link to="/course/n4" className="block py-1 hover:text-red-500">
                N4: Học cơ bản ngữ pháp, từ vựng
              </Link>
              <Link to="/course/n5" className="block py-1 hover:text-red-500">
                N5: Nhập môn tiếng Nhật
              </Link>
            </div>
            {/* Column 2 */}
            <div>
              <h3 className="font-bold text-sm mb-2">Livestream</h3>
              <Link
                to="/livestream/n1"
                className="block py-1 hover:text-red-500"
              >
                N1: Giải đề thực chiến
              </Link>
              <Link
                to="/livestream/n2"
                className="block py-1 hover:text-red-500"
              >
                N2: Luyện nghe đọc hiểu
              </Link>
              <Link
                to="/livestream/n3"
                className="block py-1 hover:text-red-500"
              >
                N3: Trọng điểm ngữ pháp
              </Link>
              <Link
                to="/livestream/n4"
                className="block py-1 hover:text-red-500"
              >
                N4: Kiến thức nền tảng
              </Link>
              <Link
                to="/livestream/n5"
                className="block py-1 hover:text-red-500"
              >
                N5: Luyện từ vựng
              </Link>
            </div>
            {/* Column 3 */}
            <div>
              <h3 className="font-bold text-sm mb-2">Tài nguyên khác</h3>
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
