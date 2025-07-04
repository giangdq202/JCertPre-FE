import React from "react";
import { FaTwitter, FaDiscord, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-300 mt-16 font-['Noto_Serif_JP']">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
        {/* Logo và ứng dụng */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img src={logo} alt="logo" className="w-20 h-20" />
            <div>
              <h2 className="text-xl font-bold text-[#cc4b4b]">JCertPre</h2>
              <p className="text-[#cc4b4b] text-sm">Học tiếng Nhật dễ dàng</p>
            </div>
          </div>

          <p className="mt-4 font-semibold">
            Ứng dụng chính thức{" "}
            <span className="text-red-500">Tìm hiểu thêm</span>
          </p>
          <div className="flex gap-3 mt-2">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                className="h-10"
              />
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                className="h-10"
              />
            </a>
          </div>

          <h3 className="font-semibold mt-2 mb-2">Kết nối với chúng tôi</h3>

          <div className="flex gap-3 mt-2 text-xl">
            <FaTwitter className="bg-[#1DA1F2] text-white rounded-full p-2 w-10 h-10 cursor-pointer hover:opacity-80" />
            <FaDiscord className="bg-[#5865F2] text-white rounded-full p-2 w-10 h-10 cursor-pointer hover:opacity-80" />
            <FaInstagram className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-full p-2 w-10 h-10 cursor-pointer hover:opacity-80" />
            <FaYoutube className="bg-[#FF0000] text-white rounded-full p-2 w-10 h-10 cursor-pointer hover:opacity-80" />
          </div>
        </div>

        {/* Cột thông tin */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <h3 className="font-bold text-[#cc4b4b] mb-2">Công ty</h3>
            <ul className="space-y-1 text-gray-700">
              <li>
                <a href="#">Tin tức</a>
              </li>
              <li>
                <a href="#">Tuyển dụng</a>
              </li>
              <li>
                <a href="#">Về chúng tôi</a>
              </li>

              <li>
                <a href="#">Dành cho giáo viên</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#cc4b4b] mb-2">Tiếng Nhật</h3>
            <ul className="space-y-1 text-gray-700">
              <li>
                <a href="#">Diễn đàn chính thức</a>
              </li>
              <li>
                <a href="#">Tìm kiếm nội dung</a>
              </li>
              <li>
                <a href="#">Luyện đọc</a>
              </li>
              <li>
                <a href="#">Danh sách ngữ pháp</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#cc4b4b] mb-2">Hỗ trợ</h3>
            <ul className="space-y-1 text-gray-700">
              <li>
                <a href="#">Liên hệ</a>
              </li>
              <li>
                <a href="#">Trợ giúp & Câu hỏi thường gặp</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dòng cuối */}
      <div className="border-t border-gray-300 mt-4 text-center text-xs text-gray-600 py-4 px-4">
        © 2025, JCertPre. Đọc thêm{" "}
        <a href="#" className="text-red-500 underline">
          Điều khoản dịch vụ
        </a>
        ,{" "}
        <a href="#" className="text-red-500 underline">
          Chính sách bảo mật
        </a>{" "}
        và{" "}
        <a href="#" className="text-red-500 underline">
          Tổng quan công ty
        </a>
        .
      </div>
    </footer>
  );
}
