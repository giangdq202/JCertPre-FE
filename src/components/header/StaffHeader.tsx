import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaAngleDown, FaAngleUp, FaBell, FaCog } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext"; // Assuming AuthContext provides userInfo and handleLogout
import paths from "../../routes/path";

const StaffHeader: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const { userInfo, handleLogout } = useAuth(); // Assuming useAuth hook provides this
  const navigate = useNavigate();
  const notificationCount = 3; // Example notification count for staff

  // Close dropdown when clicking outside
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
    handleLogout(); // Call the logout function from AuthContext
    setIsProfileDropdownOpen(false);
    navigate(paths.login, { replace: true }); // Redirect to login page
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-40 bg-white shadow-md py-3 px-6 flex items-center justify-between transition-all duration-300">
      {/* Left section: Placeholder for future elements or page title */}
      <div className="flex items-center">
        {/* The "Staff Panel" text has been removed from here */}
      </div>

      {/* Right section: Icons and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon */}
        <div className="relative">
          <button className="text-gray-600 hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-gray-100">
            <FaBell size={20} />
          </button>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </div>

        {/* Settings Icon */}
        <button
          onClick={() => navigate(paths.home)} // Assuming a staff settings path
          className="text-gray-600 hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <FaCog size={20} />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaUserCircle size={28} className="text-orange-500" />
            <span className="font-medium text-gray-700 hidden md:block">
              {userInfo?.fullName || "Staff User"}
            </span>
            {isProfileDropdownOpen ? (
              <FaAngleUp size={16} className="text-gray-500" />
            ) : (
              <FaAngleDown size={16} className="text-gray-500" />
            )}
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 animate-fade-in-down">
              <Link
                to={paths.student_profile} // Assuming a staff profile path
                onClick={() => setIsProfileDropdownOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hồ sơ của tôi
              </Link>
              <button
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border-t border-gray-100 mt-1 pt-2"
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
