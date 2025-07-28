import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const AppRoutes: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { userInfo, isAuthenticated } = useAuth();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  if (!userInfo || !userInfo.roleName || !allowedRoles.includes(userInfo.roleName)) {
    // Điều hướng dựa trên role
    return (
      <Navigate
        to={
          userInfo?.roleName === "ACADEMIC_MANAGER"
            ? paths.staff_home
            : paths.student_home
        }
        replace
      />
    );
  }

  return <>{children}</>;
};

export default AppRoutes;
