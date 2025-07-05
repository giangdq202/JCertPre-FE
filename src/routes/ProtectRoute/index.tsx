import { Routes, Route } from "react-router-dom";
import Layout from "../../layouts/Layout";
import Login from "../../pages/login/Login";
import Register from "../../pages/register/Register";
import Home from "../../pages/home/Home";

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
      <Route path="login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
