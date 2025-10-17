import { Navigate } from "react-router-dom";
import useUser from "../../hooks/userHook";

export default function RequireAuth({ children, roles }) {
  const { user, userLogged, loading } = useUser();

  // Still checking auth (e.g. reading token from storage, validating session)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !userLogged) {
    return <Navigate to="/auth/login" replace />;
  }

  // Role-based access control
  if (roles && Array.isArray(roles) && roles.length > 0) {
    const hasRole = roles.includes(user?.role);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
}
