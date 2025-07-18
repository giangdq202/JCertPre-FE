import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineSettings,
  MdOutlineSchedule,
} from "react-icons/md";
import { GiGraduateCap } from "react-icons/gi";
import { PiExamBold } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import logo from "../../assets/logo.png";

const menuItems = [
  {
    name: "Tổng quan",
    icon: <MdDashboard size={20} />,
    path: "/student/home",
  },
  {
    name: "Khóa học",
    icon: <FaChalkboardTeacher size={20} />,
    path: "/student/courses",
  },

  {
    name: "Lịch trình học tập",
    icon: <MdOutlineSchedule size={20} />,
    path: "/student/schedule",
  },
  {
    name: "Thi thử JLPT",
    icon: <PiExamBold size={20} />,
    path: "/student/exam-simulations",
  },
  {
    name: "Học từ vựng",
    icon: <LuClipboardList size={20} />,
    path: "/student/vocabulary",
  },

  {
    name: "Theo dõi tiến độ",
    icon: <GiGraduateCap size={20} />,
    path: "/student/progress",
  },
  {
    name: "Tin nhắn",
    icon: <HiOutlineChatBubbleLeftRight size={20} />,
    path: "/student/messages",
  },

  {
    name: "Cài đặt",
    icon: <MdOutlineSettings size={20} />,
    path: "/student/settings",
  },
];

const StudentSideBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-full lg:w-64 min-h-screen bg-gradient-to-b from-green-500 to-green-500 text-white border-r shadow-xl px-4 py-6 flex flex-col transition-all">
      {/* Logo */}
      <div className="flex items-center justify-center mb-10">
        <div className="bg-white rounded-full p-2 shadow-xl">
          <img
            src={logo}
            alt="Logo"
            className="w-36 h-36 object-cover rounded-full border-4 border-green-600"
          />
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto">
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
          ? "bg-green-300 text-white font-semibold shadow-md"
          : "text-white hover:bg-green-400 hover:pl-5"
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
        © 2025 JCertPre
      </div>
    </aside>
  );
};

export default StudentSideBar;
