import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineSettings,
  MdOutlineReport, // For Reports
  MdOutlineQuestionAnswer, // For Inquiries
  MdOutlineAssignment, // For Study Plan (Staff perspective)
  MdOutlineCategory, // For Tags (Exam Structure)
  MdOutlineQuiz, // For Questions (Question Bank)
  MdOutlinePerson, // For Staff Profile
} from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa"; // For Course Management
import logo from "../../assets/logo.png"; // Assuming logo asset exists
import paths from "../../routes/path";

const menuItems = [
  {
    name: "Tổng quan",
    icon: <MdDashboard size={20} />,
    path: paths.staff_home,
  },
  {
    name: "Quản lý khóa học",
    icon: <FaChalkboardTeacher size={20} />,
    path: "/course-management",
  },
  {
    name: "Yêu cầu tư vấn",
    icon: <MdOutlineQuestionAnswer size={20} />,
    path: "/staff/inquiries",
  },
  {
    name: "Kế hoạch học tập", // Staff can manage study plans
    icon: <MdOutlineAssignment size={20} />,
    path: "/staff/study-plan",
  },
  {
    name: "Quản lý khiếu nại",
    icon: <MdOutlineReport size={20} />,
    path: "/staff/reports",
  },
  {
    name: "Cấu trúc câu hỏi", // Tags for exam structure
    icon: <MdOutlineCategory size={20} />,
    path: paths.staff_sub_content_management,
  },
  {
    name: "Ngân hàng câu hỏi",
    icon: <MdOutlineQuiz size={20} />,
      path: paths.question_management,
    },
    // {
  //   name: "Hồ sơ nhân viên",
  //   icon: <MdOutlinePerson size={20} />,
  //   path: "/nhan-vien/ho-so",
  // },
  // {
  //   name: "Cài đặt",
  //   icon: <MdOutlineSettings size={20} />,
  //   path: "/staff/settings", // Assuming staff also has a settings page
  // },
];

const StaffSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-full lg:w-64 min-h-screen bg-gradient-to-b from-orange-500 to-orange-600 text-white border-r border-orange-700 shadow-xl px-4 py-6 flex flex-col transition-all">
      {/* Logo */}
      <div className="flex items-center justify-center mb-10">
        <div className="bg-white rounded-full p-2 shadow-xl">
          <img
            src={logo}
            alt="Logo"
            className="w-36 h-36 object-cover rounded-full border-4 border-orange-700"
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
                        ? "bg-orange-300 text-white font-semibold shadow-md"
                        : "text-white hover:bg-orange-400 hover:pl-5"
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

export default StaffSidebar;
