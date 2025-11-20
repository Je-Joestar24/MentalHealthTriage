import React, { useEffect, useMemo, useState } from 'react';
import {
    Drawer,
    Box,
    Stack,
    Typography,
    Avatar,
    Chip,
    TextField,
    Button,
    Divider,
    CircularProgress,
    IconButton,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import useProfile from '../../hooks/profileHooks';

const drawerWidth = 360;

const ProfileSidebar = ({ open, onClose, onLogout }) => {
    const { user, loading, updateProfile } = useProfile();
    const [form, setForm] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setErrors({});
            setShowPassword(false);
        }
    }, [user, open]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const hasFieldChanges = useMemo(() => {
        if (!user) return false;
        const nameChanged = form.name.trim() !== (user.name || '');
        const emailChanged = form.email.trim() !== (user.email || '');
        const passwordChanged =
            form.currentPassword || form.newPassword || form.confirmPassword;
        return nameChanged || emailChanged || !!passwordChanged;
    }, [form, user]);

    const validate = () => {
        const nextErrors = {};

        if (!form.name.trim()) {
            nextErrors.name = 'Name is required';
        }
        if (!form.email.trim()) {
            nextErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nextErrors.email = 'Enter a valid email address';
        }

        if (showPassword || form.newPassword || form.currentPassword || form.confirmPassword) {
            if (!form.currentPassword) {
                nextErrors.currentPassword = 'Current password is required';
            }
            if (!form.newPassword) {
                nextErrors.newPassword = 'New password is required';
            } else if (form.newPassword.length < 8) {
                nextErrors.newPassword = 'New password must be at least 8 characters';
            }
            if (!form.confirmPassword) {
                nextErrors.confirmPassword = 'Confirm new password';
            } else if (form.newPassword !== form.confirmPassword) {
                nextErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const payload = {
            name: form.name.trim(),
            email: form.email.trim()
        };

        const userId = user?.id || user?._id;
        if (userId) {
            payload.id = userId;
        }

        if (form.newPassword) {
            payload.current_password = form.currentPassword;
            payload.new_password = form.newPassword;
        }

        const result = await updateProfile(payload);
        if (result.meta?.requestStatus === 'fulfilled') {
            setShowPassword(false);
            setForm((prev) => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        }
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        if (onClose) onClose();
    };

    const joinedDate = useMemo(() => {
        if (!user?.createdAt) return null;
        return new Date(user.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, [user]);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: drawerWidth },
                    borderRadius: { sm: '20px 0 0 20px' },
                    borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <Box sx={{ p: 3, pt: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Profile
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>

                <Stack spacing={2.5} sx={{ mt: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {user?.name || 'User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email || 'user@example.com'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
                        <Chip
                            label={user?.role?.replace('_', ' ') || 'Role'}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                        />
                        {user?.organization?.name && (
                            <Chip
                                icon={<BusinessOutlinedIcon sx={{ fontSize: 14 }} />}
                                label={user.organization.name}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.7rem',
                                    height: 22,
                                    borderColor: 'divider',
                                    color: 'text.secondary',
                                }}
                            />
                        )}
                        {joinedDate && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <TodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    Joined {joinedDate}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
                <Stack spacing={3}>
                    <Stack spacing={2.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Personal Information
                        </Typography>
                        <TextField
                            label="Full Name"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            size="small"
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            label="Email Address"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            size="small"
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Stack>

                    <Divider />

                    <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Security
                            </Typography>
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<LockOutlinedIcon sx={{ fontSize: 18 }} />}
                                onClick={() => {
                                    setShowPassword((prev) => !prev);
                                    setForm((prev) => ({
                                        ...prev,
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    }));
                                }}
                            >
                                {showPassword ? 'Cancel' : 'Change Password'}
                            </Button>
                        </Stack>

                        {showPassword && (
                            <Stack spacing={1.5}>
                                <TextField
                                    label="Current Password"
                                    type="password"
                                    value={form.currentPassword}
                                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                                    size="small"
                                    fullWidth
                                    error={!!errors.currentPassword}
                                    helperText={errors.currentPassword}
                                />
                                <TextField
                                    label="New Password"
                                    type="password"
                                    value={form.newPassword}
                                    onChange={(e) => handleChange('newPassword', e.target.value)}
                                    size="small"
                                    fullWidth
                                    error={!!errors.newPassword}
                                    helperText={errors.newPassword || 'Minimum 8 characters'}
                                />
                                <TextField
                                    label="Confirm New Password"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    size="small"
                                    fullWidth
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword}
                                />
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                    {loading ? (
                        <Button variant="contained" fullWidth disabled startIcon={<CircularProgress size={18} />}>
                            Saving...
                        </Button>
                    ) : (
                        hasFieldChanges && (
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<EditOutlinedIcon />}
                                onClick={handleSave}
                            >
                                Save Changes
                            </Button>
                        )
                    )}
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
};

export default ProfileSidebar;

