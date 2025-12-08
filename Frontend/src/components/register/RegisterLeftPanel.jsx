import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { CheckCircle, Security, Group, Payment } from '@mui/icons-material';

/**
 * Decorative left-side panel for the registration page.
 * Enhanced with decorative elements, micro-animations, and full-width design.
 */
const RegisterLeftPanel = () => {
    const theme = useTheme();

    const benefits = [
        {
            icon: <CheckCircle />,
            title: 'Real-time triage',
            description: 'Designed for psychologists and mental health teams.',
            delay: 0,
        },
        {
            icon: <Security />,
            title: 'Secure by design',
            description: 'Role-based access with organization-level controls.',
            delay: 0.1,
        },
        {
            icon: <Group />,
            title: 'Flexible seats',
            description: 'Start with 4 psychologists and scale with your team.',
            delay: 0.2,
        },
        {
            icon: <Payment />,
            title: 'Stripe billing',
            description: 'Secure monthly billing handled by Stripe checkout.',
            delay: 0.3,
        },
    ];

    return (
        <Box
            role="complementary"
            aria-label="Registration information panel"
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                px: { xs: 4, md: 6 },
                py: { xs: 5, md: 8 },
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}15 0%, 
                    ${theme.palette.secondary.main}10 50%,
                    ${theme.palette.primary.light}08 100%)`,
                '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(5deg)' },
                },
                '@keyframes floatReverse': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(20px) rotate(-5deg)' },
                },
                '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                    '50%': { opacity: 0.6, transform: 'scale(1.1)' },
                },
                '@keyframes slideInLeft': {
                    from: { opacity: 0, transform: 'translateX(-30px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                },
                '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            {/* Animated Background Decorations */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}40, ${theme.palette.primary.main}20)`,
                    filter: 'blur(40px)',
                    animation: 'float 8s ease-in-out infinite',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '8%',
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}40, ${theme.palette.secondary.light}20)`,
                    filter: 'blur(50px)',
                    animation: 'floatReverse 10s ease-in-out infinite',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${theme.palette.primary.main}15, transparent 70%)`,
                    filter: 'blur(60px)',
                    animation: 'pulse 6s ease-in-out infinite',
                    zIndex: 0,
                }}
            />

            {/* Geometric Shapes */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '15%',
                    width: 60,
                    height: 60,
                    border: `2px solid ${theme.palette.primary.light}30`,
                    borderRadius: '12px',
                    transform: 'rotate(45deg)',
                    animation: 'float 7s ease-in-out infinite',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '12%',
                    width: 40,
                    height: 40,
                    border: `2px solid ${theme.palette.secondary.light}30`,
                    borderRadius: '50%',
                    animation: 'floatReverse 9s ease-in-out infinite',
                    zIndex: 0,
                }}
            />

            {/* Main Content */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 520,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    animation: 'slideInLeft 0.6s ease-out',
                }}
            >
                {/* Header Section */}
                <Box sx={{ mb: 1 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'fadeInUp 0.8s ease-out',
                        }}
                    >
                        Create your Mental Health Triage workspace
                    </Typography>

                    <Typography
                        component="p"
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            lineHeight: 1.7,
                            fontSize: 16,
                            animation: 'fadeInUp 0.8s ease-out 0.1s both',
                        }}
                    >
                        Choose between an individual psychologist account or an organization workspace
                        with multiple seats. Your data is secured, and billing is handled via Stripe.
                    </Typography>
                </Box>

                {/* Benefits Grid */}
                <Box
                    component="ul"
                    aria-label="Key registration benefits"
                    sx={{
                        listStyle: 'none',
                        p: 0,
                        m: 0,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2.5,
                        width: '100%',
                    }}
                >
                    {benefits.map((benefit, index) => (
                        <Box
                            key={index}
                            component="li"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                p: 2.5,
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid',
                                borderColor: 'divider',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                animation: `fadeInUp 0.6s ease-out ${benefit.delay}s both`,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'primary.light',
                                    boxShadow: `0 8px 24px ${theme.palette.primary.main}15`,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 0.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}15)`,
                                        color: 'primary.main',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1) rotate(5deg)',
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.secondary.main}20)`,
                                        },
                                    }}
                                >
                                    {benefit.icon}
                                </Box>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 15,
                                        color: 'text.primary',
                                    }}
                                >
                                    {benefit.title}
                                </Typography>
                            </Box>
                            <Typography
                                component="p"
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    pl: 6.5,
                                }}
                            >
                                {benefit.description}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Decorative Bottom Accent */}
                <Box
                    sx={{
                        mt: 2,
                        height: 4,
                        width: '60%',
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        opacity: 0.6,
                        animation: 'fadeInUp 0.8s ease-out 0.4s both',
                    }}
                />
            </Box>
        </Box>
    );
};

export default RegisterLeftPanel;
