import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaChartBar, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import { adminPaths } from "../../routes/path";

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { handleLogout } = useAuth();

  const menuItems = [
    {
      path: adminPaths.admin_home,
      icon: <FaHome className="text-xl" />,
      label: "Dashboard",
    },
    
    {
      path: adminPaths.admin_users,
      icon: <FaUsers className="text-xl" />,
      label: "Quản lý người dùng",
    }
  ];

  const handleLogoutClick = () => {
    handleLogout();
  };

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-500">Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "bg-orange-100 text-orange-700 border-r-4 border-orange-600"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <span className="text-orange-600">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="text-xl text-red-500" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    );
  };

export default AdminSidebar;
