import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Card,
    CardContent,
    Chip,
    Stack
} from '@mui/material';
import {
    Psychology,
    HealthAndSafety,
    Visibility,
    ArrowForward,
    People,
    TrendingUp,
    Security,
    Speed,
    CheckCircle,
    Star
} from '@mui/icons-material';
import heroImage from '../../assets/images/hero.png';
import { getPublicStats } from '../../services/public/publicService';

const HeroSection = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { number: "--", label: "Professionals" },
        { number: "--", label: "Clients Served" },
        { number: "99.9%", label: "Uptime" }
    ]);
    const [loadingStats, setLoadingStats] = useState(true);

    const features = [
        { icon: <Speed />, text: "Fast Triage Process" },
        { icon: <Security />, text: "Secure" },
        { icon: <TrendingUp />, text: "Analytics & Insights" }
    ];

    // Format number by rounding down and adding "+" suffix (display-only manipulation)
    // Examples: 214 → "200+", 49 → "40+", 1234 → "1,200+"
    const formatNumber = (num) => {
        if (num === null || num === undefined) return "--";
        if (num === 0) return "0";
        
        // Round down to appropriate magnitude based on number size
        let rounded;
        
        if (num < 10) {
            // For numbers < 10, round down to nearest 1
            rounded = Math.ceil(num);
        } else if (num < 100) {
            // For numbers 10-99, round down to nearest 10
            rounded = Math.ceil(num / 10) * 10;
        } else if (num < 1000) {
            // For numbers 100-999, round down to nearest 100
            rounded = Math.ceil(num / 100) * 100;
        } else if (num < 10000) {
            // For numbers 1000-9999, round down to nearest 1000
            rounded = Math.ceil(num / 1000) * 1000;
        } else {
            // For numbers >= 10000, round down to nearest 1000
            rounded = Math.ceil(num / 1000) * 1000;
        }
        
        // Convert to string with commas and add "+" suffix
        return rounded.toLocaleString('en-US') + '+';
    };

    // Fetch public statistics on component mount
    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const result = await getPublicStats();
                if (result.success && result.data) {
                    setStats([
                        { number: formatNumber(result.data.professionals), label: "Professionals" },
                        { number: formatNumber(result.data.clients), label: "Clients Served" },
                        { number: "99.9%", label: "Uptime" }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching public stats:', error);
                // Keep default "--" values on error
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Box className="hero-section" role="banner" aria-label="Mental Health Triage System Hero Section">
            {/* Background Elements */}
            <Box className="hero-background">
                <Box className="floating-shapes">
                    <Box className="shape shape-1"></Box>
                    <Box className="shape shape-2"></Box>
                    <Box className="shape shape-3"></Box>
                    <Box className="shape shape-4"></Box>
                </Box>
            </Box>

            <Container maxWidth="xl" className="hero-container">
                <Box className="hero-row" sx={{ width: '100%', maxWidth: '1200px'}}>
                    {/* Left Section - Text Content */}
                    <Box className="hero-col hero-text">
                        <Box className="hero-badge">
                            <Chip
                                icon={<Star />}
                                label="Trusted by Professionals"
                                color="primary"
                                variant="outlined"
                                sx={{
                                    mb: 3,
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.05)' },
                                        '100%': { transform: 'scale(1)' }
                                    }
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h1"
                            component="h1"
                            className="hero-title"
                            sx={{
                                fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
                                fontWeight: 600,
                                lineHeight: 1.1,
                                mb: 3,
                                background: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #2563eb 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                animation: 'titleGlow 3s ease-in-out infinite alternate'
                            }}
                        >
                            Transform Mental Health Care with
                            <Box component="span" sx={{
                                display: 'block',
                                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Digital Triage Excellence
                            </Box>
                        </Typography>

                        <Typography
                            variant="h5"
                            component="p"
                            className="hero-subtitle"
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 100,
                                color: 'text.secondary',
                                mb: 6,
                                lineHeight: 1.6,
                                maxWidth: '90%'
                            }}
                        >
                            Streamline Client assessments, enhance diagnostic accuracy, and improve care coordination with our comprehensive mental health triage platform.
                        </Typography>

                        {/* Feature Chips */}
                        <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                            {features.map((feature, index) => (
                                <Chip
                                    key={index}
                                    icon={feature.icon}
                                    label={feature.text}
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Stack>

                        <Box className="hero-cta">
                            <Button
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForward />}
                                className="cta-button"
                                onClick={() => navigate('/auth/register')}
                                sx={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                    px: 4,
                                    py: 1,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    borderRadius: 4,
                                    textTransform: 'none',
                                    mr: 3,
                                    mb: 2,
                                    boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 12px 40px rgba(37, 99, 235, 0.4)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                                aria-label="Get started with registration"
                            >
                                Get Started
                            </Button>
                        </Box>

                        {/* Stats */}
                        <Box className="hero-stats" sx={{ mt: 6 }}>
                            <Box className="stats-row">
                                {stats.map((stat, index) => (
                                    <Box key={index} className="stat-item">
                                        <Typography
                                            variant="h3"
                                            component="div"
                                            sx={{
                                                fontWeight: 800,
                                                color: 'primary.main',
                                                mb: 0.5,
                                                textAlign: 'center'
                                            }}
                                        >
                                            {stat.number}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontWeight: 500, textAlign: 'center' }}
                                        >
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Section - Hero Image */}
                    <Box className="hero-col hero-image">
                        <Box className="hero-image-container">
                            <Box className="image-wrapper">
                                <img
                                    src={heroImage}
                                    alt="Mental health professionals working together in a supportive environment"
                                    className="hero-main-image"
                                />

                                {/* Floating Cards */}
                                <Card className="floating-card card-1" elevation={8}>
                                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                        <Psychology sx={{ color: 'primary.main', mb: 1 }} />
                                        <Typography variant="body2" fontWeight={600}>
                                            Client Assessment
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Card className="floating-card card-2" elevation={8}>
                                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                        <HealthAndSafety sx={{ color: 'success.main', mb: 1 }} />
                                        <Typography variant="body2" fontWeight={600}>
                                            Secure Records
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Card className="floating-card card-3" elevation={8}>
                                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                        <TrendingUp sx={{ color: 'warning.main', mb: 1 }} />
                                        <Typography variant="body2" fontWeight={600}>
                                            Analytics
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default HeroSection;
