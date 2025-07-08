// src/pages/staff/StaffHomePage.tsx
import React from "react";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import { Carousel } from "react-responsive-carousel";
import { Link } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import backgroundImage from "../../assets/background.png";
const StaffHomePage: React.FC = () => {
  return (
    <div className="flex h-screen font-['Noto_Serif_JP']">
      {/* Sidebar */}
      <StaffSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header (logo only) */}
        <StaffHeader />

        {/* Content */}
        <main className="pt-16 p-6 bg-gray-50 h-full">
          <h1 className="text-2xl font-bold text-pink-700">Welcome, Staff!</h1>
          <p className="mt-2 text-gray-600">
            Chọn chức năng ở menu bên trái để quản lý hệ thống.
          </p>
        </main>
      </div>
    </div>
  );
};

export default StaffHomePage;
