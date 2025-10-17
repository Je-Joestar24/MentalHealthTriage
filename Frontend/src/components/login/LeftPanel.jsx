import { Box } from "@mui/material"
import loginImage from '../../assets/images/login.png';

export default function LeftPanel() {
    return (<>
        <Box className="login-col login-decorative">
            <Box className="decorative-content">
                {/* Background Image */}
                <Box className="background-image">
                    <img
                        src={loginImage}
                        alt="Professional workspace background"
                        className="main-image"
                    />
                </Box>

                {/* Subtle Overlay */}
                <Box className="image-overlay"></Box>
            </Box>
        </Box></>)
}