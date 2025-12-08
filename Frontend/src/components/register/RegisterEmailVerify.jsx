import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
} from '@mui/material';
import useUser from '../../hooks/userHook';

/**
 * First step: user enters email, we check availability.
 * Parent controls navigation via onResult callback.
 */
const RegisterEmailVerify = ({ accountType, onResult }) => {
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const { registration, checkEmail } = useUser();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalError('');

        const trimmed = email.trim();
        if (!trimmed) {
            setLocalError('Email is required');
            return;
        }

        const result = await checkEmail(trimmed);
        if (!result.success) {
            setLocalError(result.error || 'Unable to check email');
            return;
        }

        if (result.status === 'exists_paid') {
            setLocalError('This email is already registered. Please log in to continue.');
            // No navigation – user should go to login page
            if (onResult) {
                onResult({
                    email: trimmed,
                    status: result.status,
                    redirectToPayment: false,
                    accountType: result.accountType || accountType,
                });
            }
            return;
        }

        if (onResult) {
            onResult({
                email: trimmed,
                status: result.status,
                redirectToPayment: !!result.redirect_to_payment,
                accountType: result.accountType || accountType,
            });
        }
    };

    const helperText =
        accountType === 'organization'
            ? 'Use the email address for the organization admin.'
            : 'Use your professional email address if possible.';

    return (
        <Box
            component="section"
            role="form"
            aria-label="Registration email verification"
            sx={{ width: '100%' }}
        >
            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
                {accountType === 'organization'
                    ? 'Start your organization workspace'
                    : 'Create your psychologist account'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Enter your email so we can check if you already have an account or need to complete
                your signup.
            </Typography>

            {localError && (
                <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-label="Email error">
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
                    type="email"
                    label="Email address"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    helperText={helperText}
                    autoComplete="email"
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={registration?.loading}
                    aria-label="Check email and continue"
                >
                    {registration?.loading ? 'Checking...' : 'Continue'}
                </Button>
            </Box>
        </Box>
    );
};

export default RegisterEmailVerify;


