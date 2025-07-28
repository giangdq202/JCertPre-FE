import React from "react";
import { FaTwitter, FaDiscord, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white via-red-50 to-blue-50/30 border-t border-gray-200 mt-20 font-['Noto_Serif_JP'] text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={logo}
              alt="logo"
              className="w-16 h-16 rounded-full border border-gray-300 shadow-sm object-cover"
            />
            <div>
              <h2 className="text-2xl font-extrabold text-red-600">JCertPre</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Học tiếng Nhật dễ dàng
              </p>
            </div>
          </div>

          <p className="text-sm mt-2 mb-3">
            Ứng dụng chính thức trên điện thoại:
          </p>
          <div className="flex gap-3">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                className="h-10 hover:scale-105 transition-transform"
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
                className="h-10 hover:scale-105 transition-transform"
              />
            </a>
          </div>

          <h3 className="mt-6 text-base font-semibold text-gray-800">
            Kết nối với chúng tôi
          </h3>
          <div className="flex gap-3 mt-3 text-xl">
            <a
              href="#"
              title="Twitter"
              className="p-2 rounded-full border border-gray-300 hover:bg-blue-50 transition"
            >
              <FaTwitter className="text-[#1DA1F2]" />
            </a>
            <a
              href="#"
              title="Discord"
              className="p-2 rounded-full border border-gray-300 hover:bg-indigo-50 transition"
            >
              <FaDiscord className="text-[#5865F2]" />
            </a>
            <a
              href="#"
              title="Instagram"
              className="p-2 rounded-full border border-gray-300 hover:bg-pink-50 transition"
            >
              <FaInstagram className="text-pink-500" />
            </a>
            <a
              href="#"
              title="YouTube"
              className="p-2 rounded-full border border-gray-300 hover:bg-red-50 transition"
            >
              <FaYoutube className="text-[#FF0000]" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-red-600 mb-2">Điều hướng</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="hover:text-red-500">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Tin tức
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Danh mục
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Về chúng tôi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-red-600 mb-2">Tiếng Nhật</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="hover:text-red-500">
                  Diễn đàn chính thức
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Tìm kiếm nội dung
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Luyện đọc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Danh sách ngữ pháp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-red-600 mb-2">Hỗ trợ</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="hover:text-red-500">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Chính sách
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Trợ giúp & FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 text-center text-xs text-gray-500 py-4">
        © 2025 JCertPre —{" "}
        <a href="#" className="text-red-500 underline hover:text-red-600">
          Điều khoản dịch vụ
        </a>{" "}
        &{" "}
        <a href="#" className="text-red-500 underline hover:text-red-600">
          Chính sách bảo mật
        </a>
        .
      </div>
    </footer>
  );
}
