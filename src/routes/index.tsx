import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import ProtectedRoute from "../routes/ProtectRoute";
import Login from "../pages/login/Login";
import Layout from "../layouts/Layout";
import Register from "../pages/register/Register";
import Home from "../pages/home/Home";
import StaffHomePage from "../pages/home/StaffHomePage";
import StaffCourseManagementPage from "../pages/staff/StaffCourseManagementPage";
import CourseDetailPage from "../pages/staff/CourseDetailPage";
import CreateCoursePage from "../pages/staff/CreateCoursePage";
// import GoogleAuthCallback from "../components/Auth/GoogleAuthCallback";
import paths from "./path";
import ProfilePage from "../pages/student/ProfilePage";

const AppRoutes: React.FC = () => {
  return (
    <div className="w-full">
      <Routes>
        {/* Route công khai */}
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        {/* <Route path={paths.callback} element={<GoogleAuthCallback />} /> */}

        {/* Route được bảo vệ */}
        <Route
          path="/"
          element={<Navigate to={paths.home} replace />}
        />
        <Route element={<Layout />}>
        
          <Route
          path={paths.home}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        </Route>
        <Route
          path={paths.student_profile}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path={paths.home}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Home />
            </ProtectedRoute>
          }
        /> */}
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;