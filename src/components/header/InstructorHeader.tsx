import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";

const InstructorHeader: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, handleLogout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  
  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
    navigate("/login"); // Navigate to login page after logout
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Welcome Message */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Chào mừng, <span className="text-blue-600">Giảng viên!</span>
          </h1>
        </div>

        {/* Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {userInfo?.avatarUrl ? (
              <img
                src={userInfo.avatarUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <FaUserCircle className="text-3xl text-blue-500" />
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800">
                {userInfo?.fullName || "Giảng viên"}
              </p>
              <p className="text-xs text-gray-500">
                {userInfo?.email || "instructor@example.com"}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              <button
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                onClick={() => {
                  // Navigate to profile if needed
                  setIsProfileDropdownOpen(false);
                }}
              >
                <FaUser className="text-gray-500" />
                Hồ sơ cá nhân
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogoutClick}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <FaSignOutAlt className="text-red-500" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default InstructorHeader;


