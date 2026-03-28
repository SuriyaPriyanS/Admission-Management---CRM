import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export function ProtectedRoute({ allowedRoles = [] }) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

