export default function Logo() {
    return (
        <a href="#home" className="logo" aria-label="Mental Health Triage - Home">
            <span className="logo-mark" aria-hidden="true">
                {/* SVG mark */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="lg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2563eb"/>
                            <stop offset="100%" stopColor="#3b82f6"/>
                        </linearGradient>
                    </defs>
                    <path d="M3 12c3-5 6-5 9 0 3-5 6-5 9 0" stroke="url(#lg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 12h3l2-4 2 8 1-4h4" stroke="url(#lg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </span>
            <span className="logo-text">
                MentalHealthTriage
            </span>
        </a>
    )
}