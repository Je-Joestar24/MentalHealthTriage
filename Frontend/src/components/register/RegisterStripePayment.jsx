import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
} from '@mui/material';
import useUser from '../../hooks/userHook';

/**
 * Stripe payment step.
 * For now we always use the monthly backend price IDs,
 * but the UI exposes a monthly / yearly toggle to prepare for future plans.
 */
const RegisterStripePayment = ({ accountType, seats = 4, onBack }) => {
    const { registration, createCheckoutSession } = useUser();
    const [billingInterval, setBillingInterval] = useState('monthly');
    const [localError, setLocalError] = useState('');

    const tempUser = registration?.tempUser;
    const tempOrganization = registration?.tempOrganization;

    const handleBillingChange = (_, value) => {
        if (value) {
            setBillingInterval(value);
        }
    };

    const handleProceed = async () => {
        setLocalError('');

        if (!tempUser?._id) {
            setLocalError('Temporary user not found. Please go back and try again.');
            return;
        }

        const sessionData = {
            userId: tempUser._id,
            accountType,
            seats,
            // Success / cancel URLs can be adjusted to match your frontend routes
            successUrl: `${window.location.origin}/auth/register?status=success`,
            cancelUrl: `${window.location.origin}/auth/register?status=cancelled`,
        };

        if (accountType === 'organization' && tempOrganization?._id) {
            sessionData.organizationId = tempOrganization._id;
        }

        // We keep billingInterval client‑side for now; backend can be extended later
        // to support yearly price IDs based on this flag.

        const result = await createCheckoutSession(sessionData);
        if (!result.success) {
            setLocalError(result.error || 'Unable to create checkout session');
            return;
        }

        const url = result.data?.url;
        if (url) {
            window.location.href = url;
        } else {
            setLocalError('Checkout URL not received from server.');
        }
    };

    const seatCount = accountType === 'organization' ? seats : 1;

    return (
        <Box
            component="section"
            role="region"
            aria-label="Stripe payment selection"
            sx={{ width: '100%' }}
        >
            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
                Review your plan
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                You will be redirected to a secure Stripe checkout page to complete your payment.
            </Typography>

            {localError && (
                <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-label="Payment error">
                    {localError}
                </Alert>
            )}
            {registration?.error && !localError && (
                <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-label="Payment error">
                    {registration.error}
                </Alert>
            )}

            <Box
                sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {accountType === 'organization' ? 'Organization plan' : 'Individual plan'}
                </Typography>

                <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Billing interval
                    </Typography>
                    <ToggleButtonGroup
                        exclusive
                        value={billingInterval}
                        onChange={handleBillingChange}
                        aria-label="Billing interval"
                        size="small"
                    >
                        <ToggleButton value="monthly" aria-label="Monthly billing">
                            Monthly
                        </ToggleButton>
                        <ToggleButton value="yearly" aria-label="Yearly billing (coming soon)" disabled>
                            Yearly (coming soon)
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Psychologist seats
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {seatCount}
                        </Typography>
                        {accountType === 'organization' && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Company admin is not counted towards seats.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onBack}
                    aria-label="Go back to previous step"
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleProceed}
                    disabled={registration?.loading}
                    aria-label="Proceed to Stripe checkout"
                >
                    {registration?.loading ? 'Redirecting...' : 'Proceed to secure payment'}
                </Button>
            </Box>
        </Box>
    );
};

export default RegisterStripePayment;


