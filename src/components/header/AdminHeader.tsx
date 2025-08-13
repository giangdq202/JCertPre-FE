import React, { useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import paths from "../../routes/path";

const AdminHeader: React.FC = () => {
  const { userInfo, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
    navigate(paths.login, { replace: true });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Quản trị hệ thống JCertPre</p>
        </div>

        {/* Right side - User info and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors duration-200">
            <FaBell className="text-xl" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-3 p-2 pl-3 rounded-full text-gray-700 hover:bg-orange-50 transition duration-150 focus:ring-2 focus:ring-orange-400"
            >
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-xl" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {userInfo?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
              {isProfileDropdownOpen ? (
                <FaChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-500" />
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
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
