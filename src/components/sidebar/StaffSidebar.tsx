// src/components/layout/StaffSidebar.tsx
import React from "react";
import {
  BookOutlined,
  TagsOutlined,
  UserOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
//import "../../components/layout/StaffSidebar.css"; // Import your custom CSS for styling

const StaffSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const staffMenu = [
    { name: "Yêu cầu tư vấn", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", path: "/staff/inquiries" }, // UserOutlined
    { name: "Kế hoạch học tập", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", path: "/staff/study-plan" }, // SnippetsOutlined
    { name: "Quản lý khóa học", icon: "M12 6.253v13.5M12 6.253c-3.118 0-6.236.002-9.354 0-.17 0-.339.01-.508.03-.314.037-.582.16-.763.364-.18.204-.27.46-.27.747v9.766c0 .287.09.543.27.747.18.204.449.327.763.364.169.02.338.03.508.03 3.118 0 6.236 0 9.354 0zm0 0c3.118 0 6.236.002 9.354 0 .17 0 .339-.01.508-.03.314-.037.582-.16.763-.364.18-.204.27-.46.27-.747V6.253z", path: "/course-management" }, // BookOutlined
    { name: "Quản lý khiếu nại", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6z", path: "/staff/reports" }, // BarChartOutlined (using a generic bar chart icon)
    { name: "Cấu trúc đề thi", icon: "M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h.01M12 17h.01M17 17h.01M4 16v-4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2z", path: "/staff/tags" }, // TagsOutlined (using a generic grid icon)
    { name: "Ngân hàng câu hỏi", icon: "M8.228 9.247a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.712 15.712a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z", path: "/staff/questions" }, // QuestionCircleOutlined (using a generic question mark icon)
  ];

  return (
    <aside className="w-64 bg-white p-6 shadow-lg flex-shrink-0 rounded-r-xl">
      <div className="flex items-center mb-8">
        <img src="https://placehold.co/40x40/dc2626/ffffff?text=J" alt="Logo" className="rounded-full mr-3" /> {/* Changed color to red for staff theme */}
        <h1 className="text-xl font-bold text-red-600">JCertPre</h1> {/* Changed text color to red */}
      </div>
      <nav>
        <ul>
          {staffMenu.map((item, index) => (
            <li key={index} className="mb-4">
              <div
                onClick={() => navigate(item.path)}
                className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors duration-200 cursor-pointer
                  ${location.pathname === item.path ? 'bg-red-50 text-red-700 font-semibold' : ''}`}
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
                {item.name}
              </div>
            </li>
          ))}
        </ul>
      </nav>
      {/* No premium button for staff */}
    </aside>
  );
};

export default StaffSidebar;
