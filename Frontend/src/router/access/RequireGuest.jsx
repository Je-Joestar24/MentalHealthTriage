import { Navigate } from "react-router-dom";
import useUser from "../../hooks/userHook";

export default function RequireGuest({ children }) {
    const { user, userLogged, loading } = useUser();

    if (loading) return null;

    if (userLogged || user) {
        return <Navigate to="/superadmin/dashboard" replace />;
    }

    return children;
}