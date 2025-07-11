import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import ProtectedRoute from "../routes/ProtectRoute";
import Layout from "../layouts/Layout";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import Home from "../pages/home/Home"; // Landing page
import StudentHomePage from "../pages/student/StudentHomePage";
import StaffHomePage from "../pages/staff/StaffHomePage";
import StaffCourseManagementPage from "../pages/staff/StaffCourseManagementPage";
import CourseDetailPage from "../pages/staff/CourseDetailPage";
import CreateCoursePage from "../pages/staff/CreateCoursePage";
import ProfilePage from "../pages/student/ProfilePage";
// import GoogleAuthCallback from "../components/Auth/GoogleAuthCallback";
import paths from "./path";
import StudentCourseDetailPage from "../pages/student/StudentCourseDetailPage";

const AppRoutes: React.FC = () => {
  console.log("AppRoutes: Rendering routes");
  return (
    <div className="w-full">
      <Routes>
        {/* Route công khai */}
        <Route element={<Layout />}>   
          <Route path={paths.home}
          element={<Home />}/></Route>
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        {/* <Route path={paths.callback} element={<GoogleAuthCallback />} /> */}

        {/* Route được bảo vệ */}
        <Route
          path={paths.student_home}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_course_detail}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentCourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_profile}
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ACADEMIC_MANAGER"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.staff_home}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <StaffHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.course_management}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <StaffCourseManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.course_detail}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.create_course}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />

        {/* Route 404 */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </div>
  );
};

export default AppRoutes;