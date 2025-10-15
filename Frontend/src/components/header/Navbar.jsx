import AuthActions from "./AuthActions"
import Logo from "./Logo"

export default function Navbar() {
    return (
        <header role="banner" aria-label="Primary Navigation" className="nav-root">
            <nav className="nav-container" aria-label="Main">
                <div className="nav-left">
                    <Logo />
                    <ul className="nav-links" role="menubar">
                        <li role="none"><a role="menuitem" href="#solutions" className="nav-link">Solutions</a></li>
                        <li role="none"><a role="menuitem" href="#pricing" className="nav-link">Pricing</a></li>
                        {/* <li role="none"><a role="menuitem" href="#docs" className="nav-link">Docs</a></li> */}
                    </ul>
                </div>
                <div className="nav-right">
                    <AuthActions />
                </div>
            </nav>
        </header>
    )
}