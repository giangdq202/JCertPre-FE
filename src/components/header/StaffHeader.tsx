import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import logo from "../../assets/logo.png";
import paths from "../../routes/path";

const StaffHeader = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { userInfo, handleLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    <header className="bg-white shadow-md p-4 flex items-center justify-end rounded-b-xl lg:rounded-none">
      <div className="flex items-center space-x-4">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm..." // Simplified placeholder for staff
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" // Changed focus ring to red
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        {/* Notification button (optional, keeping for consistency) */}
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
        </button>
        {/* Settings button (optional, keeping for consistency) */}
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
          </svg>
        </button>
        {/* Profile Dropdown Integration */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
          >
            <img
              src="https://placehold.co/32x32/ef4444/ffffff?text=QL"
              alt="User Avatar"
              className="rounded-full"
            />{" "}
            {/* Changed color to red for staff theme */}
            <span className="text-gray-700 font-medium hidden md:block">
              {userInfo?.fullName || "Người dùng"}
            </span>
            {isProfileDropdownOpen ? (
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 15l7-7 7 7"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            )}
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50">
              <div className="px-4 py-2 text-sm text-gray-700">
                <p>
                  <strong>Họ và tên:</strong> {userInfo?.fullName || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo?.email || "N/A"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {userInfo?.phone || "N/A"}
                </p>
                <p>
                  <strong>Vai trò:</strong> {userInfo?.roleName || "N/A"}
                </p>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <button
                onClick={() => {
                  navigate(paths.student_profile); // Changed to staff_profile path
                  setIsProfileDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700" // Changed hover color to red
              >
                Xem Hồ sơ
              </button>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700" // Changed hover color to red
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

export default StaffHeader;
