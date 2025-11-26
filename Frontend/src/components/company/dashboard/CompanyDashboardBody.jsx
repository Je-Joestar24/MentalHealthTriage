import React from 'react';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import CompanyDashboardHeader from './CompanyDashboardHeader';
import CompanyDashboardSummary from './CompanyDashboardSummery';
import CompanyDashboardStatistics from './CompanyDashboardStatistics';
import CompanyDashboardDetails from './CompanyDashboardDetails';
import CompanyDashboardPsychologists from './CompanyDashboardPsychologists';
import CompanyDashboardTriage from './CompanyDashboardTriage';

const CompanyDashboardBody = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={50} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'error.light',
            color: 'error.contrastText',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
            Error Loading Dashboard
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          No data available
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <CompanyDashboardHeader organization={stats.organization} loading={loading} />

      {/* Summary Cards */}
      <CompanyDashboardSummary summary={stats.summary} loading={loading} />

      {/* Statistics Cards */}
      <CompanyDashboardStatistics stats={stats} loading={loading} />

      {/* Details and Psychologists */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        <CompanyDashboardDetails organization={stats.organization} loading={loading} />
        <CompanyDashboardPsychologists psychologists={stats.psychologists} loading={loading} />
      </Box>

      {/* Triage Activity */}
      <CompanyDashboardTriage activity={stats.activity} loading={loading} />
    </Container>
  );
};

export default CompanyDashboardBody;

