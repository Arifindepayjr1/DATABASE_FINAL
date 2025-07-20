import { Navigate, Outlet } from "react-router-dom";

function AuthWrapper() {
  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default AuthWrapper;
