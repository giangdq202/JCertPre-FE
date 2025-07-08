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
  { label: "User Inquiry", icon: <UserOutlined />, key: "/staff/inquiries" },
  { label: "Study Plan", icon: <SnippetsOutlined />, key: "/staff/study-plan" },
  { label: "Course Management", icon: <BookOutlined />, key: "/staff/courses" },
  
  { label: "User Report", icon: <BarChartOutlined />, key: "/staff/reports" },
  { label: "Tag Management", icon: <TagsOutlined />, key: "/staff/tags" },
  { label: "Question Management", icon: <QuestionCircleOutlined />, key: "/staff/questions" },
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
