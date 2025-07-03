import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route cha chứa Layout */}
      <Route path="/" element={<Layout />}>
        {/* Các route con được render trong Outlet */}
        <Route path="login" element={<Login />} />
      </Route>

      {/* Route không dùng layout*/}
      <Route path="register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
