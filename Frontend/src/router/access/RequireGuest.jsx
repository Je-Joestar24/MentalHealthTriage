import { Navigate } from "react-router-dom";
import { useUserAuth } from "../../hooks/useAuth";

export default function RequireGuest({ children }) {
    const { user, userLogged } = useUserAuth();

    if (userLogged || user) {
        return <Navigate to="/products/" replace />;
    }

    return children;
}