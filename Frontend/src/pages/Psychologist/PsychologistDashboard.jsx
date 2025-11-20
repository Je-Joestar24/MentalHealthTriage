import React from 'react';
import { Container, Box, Typography, Stack, Divider, Card, Grid, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import usePsychologistDashboard from '../../hooks/psychologistDashboardHook';
import DashboardCounts from '../../components/psychologist/dashboard/DashboardCounts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import useUser from '../../hooks/userHook';

export default function PsychologistDashboard() {
    const { stats, loading, error, refetch } = usePsychologistDashboard();
    const { user } = useUser();

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack
                component={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 0.5,
                    }}
                >
                    Dashboard Overview
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: '0.8rem',
                            opacity: 0.8,
                        }}
                    >
                        Your practice statistics and activity summary
                    </Typography>
                    {user?.organization?.name && (
                        <Chip
                            icon={<BusinessOutlinedIcon sx={{ fontSize: 14 }} />}
                            label={user.organization.name}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '0.75rem',
                                height: 24,
                                borderColor: 'divider',
                                color: 'text.secondary',
                            }}
                        />
                    )}
                </Stack>
            </Stack>

            {error && (
                <Box
                    sx={{
                        p: 1.5,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: 'error.light',
                        opacity: 0.1,
                        border: '1px solid',
                        borderColor: 'error.main',
                    }}
                >
                    <Typography color="error.main" variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {error}
                    </Typography>
                </Box>
            )}

            {/* Summary Cards */}
            {stats?.summary && (
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 3
                    }}
                >
                    {[
                        { label: 'Total Patients', value: stats.summary.totalPatients, delay: 0.1 },
                        { label: 'Total Triages', value: stats.summary.totalTriages, delay: 0.15 },
                        { label: 'Personal Diagnoses', value: stats.summary.totalPersonalDiagnoses, delay: 0.2 },
                        { label: 'Active Patients', value: stats.summary.activePatients, delay: 0.25 },
                        { label: 'This Month', value: stats.summary.triagesThisMonth, delay: 0.3 },
                    ].map((item, index) => (
                        <Card
                            key={index}
                            elevation={0}
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: item.delay }}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                textAlign: 'center',
                                flex: { xs: '1 1 calc(50% - 16px)', sm: '1 1 calc(33.333% - 16px)', md: '1 1 calc(20% - 16px)' },
                                minWidth: { xs: 'calc(50% - 16px)', sm: 'calc(33.333% - 16px)', md: 'calc(20% - 16px)' },
                                maxWidth: { xs: 'calc(50% - 16px)', sm: 'calc(33.333% - 16px)', md: 'calc(20% - 16px)' }
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {item.label}
                            </Typography>
                            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 0.5 }}>
                                {item.value || 0}
                            </Typography>
                        </Card>
                    ))}
                </Box>
            )}

            <DashboardCounts stats={stats} loading={loading} />

            {/* Monthly Trend */}
            {stats?.activity?.monthlyTrend && stats.activity.monthlyTrend.length > 0 && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Card
                        elevation={0}
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TrendingUpIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'text.primary',
                                    }}
                                >
                                    Monthly Triage Trend (Last 6 Months)
                                </Typography>
                            </Stack>
                            <Divider />
                            <Grid container spacing={1.5}>
                                {stats.activity.monthlyTrend.map((item, index) => (
                                    <Grid item xs={6} sm={4} md={2} key={index}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: 'background.default',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: '0.65rem', display: 'block' }}
                                            >
                                                {item.month}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    mt: 0.5
                                                }}
                                            >
                                                {item.count}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Stack>
                    </Card>
                </>
            )}
        </Container>
    );
}