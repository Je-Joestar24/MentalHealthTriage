// import { useUI } from "../../hooks/useUI"
import { useNavigate } from "react-router-dom";

export default function AuthActions() {
    // const { openModal } = useUI();

    const navigate = useNavigate();

    const handleLoginNavigation = () => {
        navigate('/auth/login');
    };
    return (
        <div className="nav-actions" role="group" aria-label="Authentication Actions">
            <button
                onClick={handleLoginNavigation}
                className="btn btn-outline"
                aria-label="Login"
            >
                Login
            </button>
            <button
                onClick={() => { /* openModal("signup") */ }}
                className="btn btn-primary"
                aria-label="Sign up"
            >
                Register
            </button>
        </div>
    )
}