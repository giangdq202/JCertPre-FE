// src/components/header/StaffHeader.tsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const StaffHeader: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-red-100 via-white to-red-100/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-md border-b border-gray-200 font-['Noto_Serif_JP'] transition-all duration-300">
      <Link to="/" className="flex items-center gap-2">
        <img
          src={logo}
          alt="JCertPre logo"
          className="h-18 w-10 rounded-full object-cover border border-pink-200"
        />
        <span className="text-lg font-bold text-white tracking-tight hidden sm:inline">
          JCertPre
        </span>
      </Link>
    </header>
  );
};

export default StaffHeader;
