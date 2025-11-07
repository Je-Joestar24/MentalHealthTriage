import React from 'react';
import { Container, Box, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import useDashboard from '../../hooks/dashboardHook';
import DashboardCounts from '../../components/admin/dashboard/DashboardCounts';

export default function AdminDashboard() {
  const { stats, loading, error, refetch } = useDashboard();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.875rem',
            opacity: 0.8,
          }}
        >
          Real-time statistics and counts for all system entities
        </Typography>
      </Stack>

      {error && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'error.light',
            opacity: 0.1,
            border: '1px solid',
            borderColor: 'error.main',
          }}
        >
          <Typography color="error.main" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      <DashboardCounts stats={stats} loading={loading} />
    </Container>
  );
}