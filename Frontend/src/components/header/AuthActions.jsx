// import { useUI } from "../../hooks/useUI"

export default function AuthActions() {
    // const { openModal } = useUI();

    return (
        <div className="nav-actions" role="group" aria-label="Authentication Actions">
            <button
                onClick={() => { /* openModal("login") */ }}
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