import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    Slider,
    Stack,
} from '@mui/material';
import useUser from '../../hooks/userHook';

/**
 * Organization registration details: company name, admin name, password, seats.
 */
const RegisterCompany = ({ email, onNext, existingStatus }) => {
    const { registration, createTempUser } = useUser();
    const [companyName, setCompanyName] = useState('');
    const [adminName, setAdminName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [seats, setSeats] = useState(4);
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalError('');

        if (!companyName.trim()) {
            setLocalError('Organization name is required');
            return;
        }
        if (!adminName.trim()) {
            setLocalError('Admin name is required');
            return;
        }
        if (!password || password.length < 8) {
            setLocalError('Admin password must be at least 8 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }
        if (seats < 4) {
            setLocalError('Minimum of 4 psychologist seats is required');
            return;
        }

        const result = await createTempUser({
            accountType: 'organization',
            companyName: companyName.trim(),
            adminName: adminName.trim(),
            email,
            password,
            seats,
        });

        if (!result.success) {
            setLocalError(result.error || 'Unable to create organization account');
            return;
        }

        if (onNext) {
            onNext({ ...result, seats });
        }
    };

    return (
        <Box
            component="section"
            role="form"
            aria-label="Organization registration form"
            sx={{ width: '100%' }}
        >
            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
                Set up your organization
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Admin email:{' '}
                <Typography component="span" sx={{ fontWeight: 600 }}>
                    {email}
                </Typography>
                {existingStatus === 'unpaid_existing'
                    ? ' has an incomplete organization signup. Complete the details to continue to payment.'
                    : '. Provide your company details and choose the number of psychologist seats.'}
            </Typography>

            {localError && (
                <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-label="Registration error">
                    {localError}
                </Alert>
            )}
            {registration?.error && !localError && (
                <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-label="Registration error">
                    {registration.error}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <TextField
                    required
                    fullWidth
                    label="Organization name"
                    aria-label="Organization name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                />

                <TextField
                    required
                    fullWidth
                    label="Admin full name"
                    aria-label="Admin full name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                />

                <TextField
                    required
                    fullWidth
                    type="password"
                    label="Admin password"
                    aria-label="Admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="At least 8 characters"
                    autoComplete="new-password"
                />

                <TextField
                    required
                    fullWidth
                    type="password"
                    label="Confirm password"
                    aria-label="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                />

                <Box sx={{ mt: 1 }}>
                    <Typography
                        id="seats-slider-label"
                        variant="body2"
                        sx={{ mb: 1, fontWeight: 500 }}
                    >
                        Psychologist seats (minimum 4)
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Slider
                            aria-labelledby="seats-slider-label"
                            value={seats}
                            onChange={(_, value) => setSeats(value)}
                            min={4}
                            max={40}
                            step={1}
                            valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" sx={{ width: 32, textAlign: 'right' }}>
                            {seats}
                        </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Billing is based on psychologist seats. Company admin is not counted.
                    </Typography>
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={registration?.loading}
                    aria-label="Continue to payment"
                    sx={{ mt: 1 }}
                >
                    {registration?.loading ? 'Saving...' : 'Continue to payment'}
                </Button>
            </Box>
        </Box>
    );
};

export default RegisterCompany;


