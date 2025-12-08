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
 * Individual psychologist registration details (name + password).
 */
const RegisterIndividual = ({ email, onNext, existingStatus }) => {
    const { registration, createTempUser } = useUser();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalError('');

        if (!name.trim()) {
            setLocalError('Full name is required');
            return;
        }
        if (!password || password.length < 8) {
            setLocalError('Password must be at least 8 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        // Store credentials temporarily for auto-login after payment
        sessionStorage.setItem('pendingRegistration', JSON.stringify({
            email,
            password,
            accountType: 'individual',
        }));

        const result = await createTempUser({
            accountType: 'individual',
            name: name.trim(),
            email,
            password,
        });

        if (!result.success) {
            setLocalError(result.error || 'Unable to create account');
            // Clear stored credentials on error
            sessionStorage.removeItem('pendingRegistration');
            return;
        }

        if (onNext) {
            onNext(result);
        }
    };

    return (
        <Box
            component="section"
            role="form"
            aria-label="Individual psychologist registration form"
            sx={{ width: '100%' }}
        >
            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
                Tell us about you
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                We found{' '}
                <Typography component="span" sx={{ fontWeight: 600 }}>
                    {email}
                </Typography>
                {existingStatus === 'unpaid_existing'
                    ? ' with an incomplete signup. Complete your details to continue to payment.'
                    : '. Complete your details to finish setting up your account.'}
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
                    label="Full name"
                    aria-label="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <TextField
                    required
                    fullWidth
                    type="password"
                    label="Password"
                    aria-label="Password"
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

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={registration?.loading}
                    aria-label="Continue to payment"
                >
                    {registration?.loading ? 'Saving...' : 'Continue to payment'}
                </Button>
            </Box>
        </Box>
    );
};

export default RegisterIndividual;


