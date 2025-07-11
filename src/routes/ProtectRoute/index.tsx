import { Routes, Route } from "react-router-dom";
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import Login from "../../pages/login/Login";
import Register from "../../pages/register/Register";
import Home from "../../pages/home/Home";
import  StaffHomePage  from "../../pages/staff/StaffHomePage";
import StaffCourseManagementPage from "../../pages/staff/StaffCourseManagementPage";
import CourseDetailPage from "../../pages/staff/CourseDetailPage";
import CreateCoursePage from "../../pages/staff/CreateCoursePage";
// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* Route cha có layout */}
//       <Route path="/" element={<Layout />}>
//         {/* Route con mặc định khi truy cập "/" */}
//         <Route index element={<Home />} />
//       </Route>

//       {/* Route không có layout */}
//       <Route path="/register" element={<Register />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/staff_homepage" element={<StaffHomePage />} />
//       <Route path="/course-management" element={<StaffCourseManagementPage />} />
//       <Route path="/course-detail/:courseId" element={<CourseDetailPage />} />
//       <Route path="/course-management/create-course" element={<CreateCoursePage />} />
//       {/* Thêm các route khác ở đây */}
//       {/* Route chuyển hướng */}
//     </Routes>
//   );
// };

// export default AppRoutes;
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const AppRoutes: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { userInfo, isAuthenticated } = useAuth();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  if (!userInfo || !userInfo.role || !allowedRoles.includes(userInfo.role)) {
    // Điều hướng dựa trên role
    return <Navigate to={userInfo?.role === "ACADEMIC_MANAGER" ? paths.staff_home : paths.student_home} replace />;
  }

  return <>{children}</>;
};

export default AppRoutes;