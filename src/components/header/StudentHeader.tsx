import React, { useRef, useState } from "react";
import {
  FiSearch,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiCreditCard,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";
import CreditDisplay from "../CreditDisplay"; 

const StudentHeader: React.FC = () => {
  const { userInfo, handleLogout } = useAuth(); 
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const notificationCount = 3;

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
    navigate(paths.login, { replace: true });
  };



  return (
    <header className="bg-white shadow-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 rounded-b-2xl border-b border-gray-100">
      {/* Search */}
      <div className="relative max-w-sm w-full">
        <input
          placeholder="Tìm kiếm khóa học, kỳ thi..."
          className="pl-11 pr-4 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm w-full"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
      </div>

      <div className="flex items-center gap-6">
        {/* Credit Display */}
        <CreditDisplay />

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-green-100 hover:text-green-600 rounded-full transition duration-200">
          <FiBell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-600 hover:bg-green-100 hover:text-green-600 rounded-full transition duration-200">
          <FiSettings className="h-5 w-5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 p-2 pl-3 rounded-full text-gray-700 hover:bg-green-50 transition duration-150 focus:ring-2 focus:ring-green-400"
          >
            <img
              src={
                userInfo?.avatarUrl ||
                "https://placehold.co/32x32/cccccc/ffffff?text=MA"
              }
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
            <span
              className="hidden md:block text-sm font-medium truncate max-w-[160px]"
              title={userInfo?.fullName}
            >
              {userInfo?.fullName || "Người dùng"}
            </span>

            {isProfileDropdownOpen ? (
              <FiChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 shadow-xl rounded-2xl py-3 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Họ và tên:</strong> {userInfo?.fullName || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo?.email || "N/A"}
                </p>
                <p>
                  <strong>Điện thoại:</strong> {userInfo?.phone || "N/A"}
                </p>
                <p>
                  <strong>Vai trò:</strong> {userInfo?.roleName || "N/A"}
                </p>
              </div>
              <div className="border-t my-2" />
              <button
                onClick={() => {
                  navigate(paths.student_profile);
                  setIsProfileDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
              >
                Xem hồ sơ
              </button>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
