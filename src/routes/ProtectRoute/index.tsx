import { Routes, Route } from "react-router-dom";
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import Login from "../../pages/login/Login";
import Register from "../../pages/register/Register";
import Home from "../../pages/home/Home";
import  StaffHomePage  from "../../pages/home/StaffHomePage";
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route cha có layout */}
      <Route path="/" element={<Layout />}>
        {/* Route con mặc định khi truy cập "/" */}
        <Route index element={<Home />} />
      </Route>

      {/* Route không có layout */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff_homepage" element={<StaffHomePage />} />
    </Routes>
  );
};

export default AppRoutes;
// import { useAuth } from "../../auth/AuthContext";

// interface ProtectedRouteProps {
//   children: ReactNode;
//   allowedRoles: string[];
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
//   const { userInfo, isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   if (!userInfo) {
//     return <Navigate to="/hompage" />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;