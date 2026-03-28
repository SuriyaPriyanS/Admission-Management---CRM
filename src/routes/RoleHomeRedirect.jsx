import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export function RoleHomeRedirect() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "OFFICER") {
    return <Navigate to="/applicants" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
