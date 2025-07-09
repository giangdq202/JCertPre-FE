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

const staffMenu = [
  { label: "Yêu cầu tư vấn", icon: <UserOutlined />, key: "/staff/inquiries" },
  { label: "Kế hoạch học tập", icon: <SnippetsOutlined />, key: "/staff/study-plan" },
  { label: "Quản lý khóa học", icon: <BookOutlined />, key: "/course-management" },
  
  { label: "Quản lý khiếu nại", icon: <BarChartOutlined />, key: "/staff/reports" },
  { label: "Cấu trúc đề thi", icon: <TagsOutlined />, key: "/staff/tags" },
  { label: "Ngân hàng câu hỏi", icon: <QuestionCircleOutlined />, key: "/staff/questions" },
];

const StaffSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen w-64 bg-white border-r border-gray-200 shadow-sm pt-6">
      <Menu
  mode="inline"
  selectedKeys={[location.pathname]}
  items={staffMenu}
  onClick={({ key }) => navigate(key)}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 30,
    fontSize: 18,
  }}
  className="border-none"
/>
    </div>
  );
};

export default StaffSidebar;
