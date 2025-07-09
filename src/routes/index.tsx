import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import paths from "./path";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import StaffHomePage from "../pages/home/StaffHomePage"; // Assuming this is the staff home page component
import StaffCourseManagementPage from "../pages/staff/StaffCourseManagementPage";
import CourseDetailPage from "../pages/staff/CourseDetailPage";
import CreateCoursePage from "../pages/staff/CreateCoursePage";
const AppRoutes: React.FC = () => {
  return (
    <div className="w-full">
      <Routes>
        {/* No auth routes */}
        {/* <Route path="/login-google" element={<LoginGoogle />} /> */}
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route path={paths.staff_home} element={<StaffHomePage />} />
        <Route path={paths.course_management} element={<StaffCourseManagementPage />} />
        <Route path={paths.staff_home} element={<CourseDetailPage />} />
        <Route path={paths.create_course} element={<CreateCoursePage />} />
        {/* General routes */}
        <Route path="/" element={<Navigate to={paths.home} replace />} />
        <Route path={paths.home} element={<Home />} />

        
      </Routes>



    </div>
  );
};

export default AppRoutes;
