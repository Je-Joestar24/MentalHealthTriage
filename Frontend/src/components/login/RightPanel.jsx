import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Link
} from '@mui/material';
import {
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import useUser from '../../hooks/userHook';
import { useNavigate } from 'react-router-dom';

export default function RightPanel() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { login, loading, error, userLogged } = useUser();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData.email, formData.password);
        if (result.success) {
            const role = result.data?.user?.role;
            // role-based redirects - adjust routes as needed
            const route = role === 'super_admin' ? '/super/dashboard'
                : role === 'company_admin' ? '/company/dashboard'
                : '/psychologist/dashboard';
            navigate(route);
        }
    };

    return (<>
        <Box className="login-col login-form-section">
            <Card className="login-form-card" elevation={12}>
                <CardContent sx={{ p: 4 }}>

                    {/* Logo */}
                    <Box className="form-logo" sx={{ textAlign: 'center', mb: 4 }}>
                        <Box className="logo-icon">
                            <svg width="56" height="56" viewBox="0 0 56 56" className="logo-svg">
                                <defs>
                                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#2563eb" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                    <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#34d399" />
                                    </linearGradient>
                                </defs>
                                <rect
                                    x="8"
                                    y="8"
                                    width="40"
                                    height="40"
                                    rx="12"
                                    fill="url(#logoGradient)"
                                    className="logo-shield"
                                />
                                <circle cx="28" cy="28" r="8" fill="url(#innerGradient)" className="logo-center" />
                                <circle cx="28" cy="28" r="4" fill="white" className="logo-dot" />
                            </svg>
                        </Box>
                        <Typography variant="h4" component="h1" className="form-title" sx={{ fontWeight: 700, mt: 2, letterSpacing: '-0.02em' }}>
                            MentalHealthTriage
                        </Typography>
                    </Box>

                    {/* Form Content */}
                    <Box className="form-content">
                        <Typography variant="h5" component="h2" className="form-heading" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                            Welcome back
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="form-subtitle" sx={{ mb: 4, fontSize: '0.95rem' }}>
                            Sign in to your account to continue
                        </Typography>

                        <form onSubmit={handleSubmit} className="login-form" role="form" aria-label="Login form">
                            <Box className="input-group" sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    className="form-input"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 3,
                                            height: '56px',
                                            fontSize: '1rem',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                                borderWidth: 2,
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                                borderWidth: 2,
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: '0.95rem',
                                            }
                                        }
                                    }}
                                    inputProps={{ 'aria-label': 'Email address' }}
                                />
                            </Box>

                            <Box className="input-group" sx={{ mb: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    className="form-input"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    aria-label="toggle password visibility"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        '&:hover': {
                                                            color: 'primary.main',
                                                            backgroundColor: 'rgba(37, 99, 235, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 3,
                                            height: '56px',
                                            fontSize: '1rem',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                                borderWidth: 2,
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                                borderWidth: 2,
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: '0.95rem',
                                            }
                                        }
                                    }}
                                    inputProps={{ 'aria-label': 'Password' }}
                                />
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                className="login-button"
                                sx={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                    py: 2,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    height: '56px',
                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.35)',
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    mb: 3
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>

                            {error && (
                                <Typography role="alert" aria-live="polite" color="error" sx={{ mb: 2 }}>
                                    {error}
                                </Typography>
                            )}

                            <Box className="form-footer" sx={{ textAlign: 'center' }}>
                                <Link
                                    href="#"
                                    className="forgot-password-link"
                                    sx={{
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        '&:hover': {
                                            textDecoration: 'underline',
                                            color: 'primary.dark'
                                        }
                                    }}
                                >
                                    Forgot your password?
                                </Link>
                            </Box>
                        </form>
                    </Box>
                </CardContent>
            </Card>
        </Box></>)
}