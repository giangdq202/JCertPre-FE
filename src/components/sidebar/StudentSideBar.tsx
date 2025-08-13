import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineSettings,
  MdOutlineSchedule,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { GiGraduateCap } from "react-icons/gi";
import { PiExamBold } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { BsBookmark } from "react-icons/bs";
import logo from "../../assets/logo.png";

const menuItems = [
  {
    name: "Tổng quan",
    icon: <MdDashboard size={20} />,
    path: "/student/home",
  },
  {
    name: "Khóa học",
    icon: <FaChalkboardTeacher size={20} />,
    path: null, // No direct path, has submenu
    submenu: [
      {
        name: "Khóa học của tôi",
        icon: <BsBookmark size={16} />,
        path: "/student/my-courses",
      },
      {
        name: "Danh sách khóa học",
        icon: <LuClipboardList size={16} />,
        path: "/student/courses",
      },
    ],
  },
  {
    name: "Lịch trình học tập",
    icon: <MdOutlineSchedule size={20} />,
    path: "/student/schedule",
  },
  {
    name: "Kế hoạch học tập",
    icon: <LuClipboardList size={20} />,
    path: "/student/study-plans",
  },
  {
    name: "Thi thử JLPT",
    icon: <PiExamBold size={20} />,
    path: "/student/exam-simulations",
  },
  // {
  //   name: "Học từ vựng",
  //   icon: <LuClipboardList size={20} />,
  //   path: "/student/vocabulary",
  // },
  {
    name: "Câu hỏi",
    icon: <GiGraduateCap size={20} />,
    path: "/question-management",
  },
  {
    name: "Tin nhắn",
    icon: <HiOutlineChatBubbleLeftRight size={20} />,
    path: "/student/messages",
  },
];

const StudentSideBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleMenuClick = (item: any) => {
    if (item.submenu) {
      // Toggle submenu
      setExpandedMenu(expandedMenu === item.name ? null : item.name);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isMenuActive = (item: any) => {
    if (item.submenu) {
      return item.submenu.some((subItem: any) => location.pathname === subItem.path);
    }
    return location.pathname === item.path;
  };

  const isSubmenuActive = (subItem: any) => {
    return location.pathname === subItem.path;
  };

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
            const isActive = isMenuActive(item);
            const isExpanded = expandedMenu === item.name;

            return (
              <li key={index}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] transition-all duration-200
                    ${
                      isActive
                        ? "bg-green-300 text-white font-semibold shadow-md"
                        : "text-white hover:bg-green-400 hover:pl-5"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="truncate hidden sm:inline">{item.name}</span>
                  </div>
                  {item.submenu && (
                    <span className="text-xl">
                      {isExpanded ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.submenu.map((subItem: any, subIndex: number) => {
                      const isSubActive = isSubmenuActive(subItem);
                      return (
                        <li key={subIndex}>
                          <button
                            onClick={() => navigate(subItem.path)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[14px] transition-all duration-200
                              ${
                                isSubActive
                                  ? "bg-green-200 text-white font-semibold"
                                  : "text-white hover:bg-green-300 hover:pl-2"
                              }`}
                          >
                            <span className="text-lg">{subItem.icon}</span>
                            <span className="truncate hidden sm:inline">{subItem.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
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
