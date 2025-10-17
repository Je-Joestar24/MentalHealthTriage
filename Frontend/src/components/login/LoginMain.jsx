import React from 'react';
import {
    Box,
    Container
} from '@mui/material';
import Decoration from './Decorations';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

export default function LoginMain() {
    return (
        <Box className="login-page" role="main" aria-label="Login Page">
            <Decoration />
            <Container maxWidth="xl" className="login-container">
                <Box className="login-row">
                    {/* Left Section - Clean Background Image */}
                    <LeftPanel />

                    {/* Right Section - Login Form */}
                    <RightPanel />
                </Box>
            </Container>
        </Box>
    )
}