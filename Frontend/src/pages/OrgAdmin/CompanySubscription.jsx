import React, { useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import useCompany from '../../hooks/companyHook';
import SubscriptionMainDisplay from '../../components/company/subscription/SubscriptionMainDisplay';
import { useSelector } from 'react-redux';

export default function CompanySubscription() {
  const {
    organization,
    loading,
    error,
    loadCompanyDetails,
  } = useCompany();

  const { globalLoading } = useSelector((state) => state.ui);

  useEffect(() => {
    loadCompanyDetails();
  }, [loadCompanyDetails]);

  const handleUpgradeSuccess = useCallback(() => {
    // Reload company details after successful upgrade
    loadCompanyDetails();
  }, [loadCompanyDetails]);

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

  if (error && !organization) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          color: 'error.main',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Error Loading Subscription Information
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <SubscriptionMainDisplay
      organization={organization}
      loading={loading || globalLoading}
      onUpgradeSuccess={handleUpgradeSuccess}
    />
  );
}

