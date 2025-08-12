import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineSchedule,
} from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import logo from "../../assets/logo.png";
import paths from "../../routes/path";

const menuItems = [
  {
    name: "Lịch trình dạy học",
    icon: <MdOutlineSchedule size={20} />,
    path: paths.instructor_schedule,
  },
  {
    name: "Quản lý khóa học",
    icon: <FaChalkboardTeacher size={20} />,
    path: paths.instructor_courses,
  },
];

const InstructorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-full lg:w-64 min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 text-white border-r border-blue-700 shadow-xl px-4 py-6 flex flex-col transition-all">
      {/* Logo */}
      <div className="flex items-center justify-center mb-10">
        <div className="bg-white rounded-full p-2 shadow-xl">
          <img
            src={logo}
            alt="Logo"
            className="w-36 h-36 object-cover rounded-full border-4 border-blue-700"
          />
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] transition-all duration-200
                    ${
                      isActive
                        ? "bg-blue-300 text-white font-semibold shadow-md"
                        : "text-white hover:bg-blue-400 hover:pl-5"
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="truncate hidden sm:inline">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Version */}
      <div className="mt-6 text-sm text-white text-center hidden lg:block">
        © 2025 JCertPre - Instructor
      </div>
    </aside>
  );
};

export default InstructorSidebar;
