import React from 'react';
import { Box, Container, Grid, Typography, Stack, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import SubscriptionCardStatus from './SubscriptionCardStatus';
import SubscriptionUpgrade from './SubscriptionUpgrade';
import SubscriptionCancelCard from './SubscriptionCancelCard';

const SubscriptionMainDisplay = ({
    organization,
    loading = false,
    onUpgradeSuccess,
}) => {
    if (loading && !organization) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!organization) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box
                    sx={{
                        textAlign: 'center',
                        p: 4,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                        No subscription information available
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={4}>
                {/* Page Header */}
                <Stack
                    component={motion.div}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        mb: 2.5,
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 0.3
                            }}
                        >
                            Subscription Management
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: '0.8rem',
                                letterSpacing: 0.2,
                                opacity: 0.8
                            }}
                        >
                            Manage your organization's subscription, upgrade seats, and view billing information.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                    </Stack>
                </Stack>

                {/* Main Content Grid */}
                <Grid container spacing={3}>
                    {/* Left Column - Status Card */}
                    <Grid item xs={12} md={4}>
                        <SubscriptionCardStatus organization={organization} loading={loading} />
                    </Grid>

                    {/* Middle Column - Upgrade Card */}
                    <Grid item xs={12} md={4}>
                        <SubscriptionUpgrade
                            organization={organization}
                            onUpgradeSuccess={onUpgradeSuccess}
                        />
                    </Grid>

                    {/* Right Column - Cancel Card */}
                    <Grid item xs={12} md={4}>
                        <SubscriptionCancelCard organization={organization} />
                    </Grid>
                </Grid>
            </Stack>
        </Container>
    );
};

export default SubscriptionMainDisplay;

