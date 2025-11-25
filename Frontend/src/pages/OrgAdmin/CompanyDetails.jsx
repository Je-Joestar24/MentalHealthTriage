import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import useCompany from '../../hooks/companyHook';
import CompanyDetailsBody from '../../components/company/details/CompanyDetailsBody';
import { useSelector } from 'react-redux';

export default function CompanyDetails() {
  const {
    organization,
    admin,
    statistics,
    psychologists,
    recentTriages,
    loading,
    error,
    loadCompanyDetails,
    updateDetails
  } = useCompany();

  const { globalLoading } = useSelector((state) => state.ui);

  useEffect(() => {
    loadCompanyDetails();
  }, [loadCompanyDetails]);

  if (loading && !organization) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
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
          color: 'error.main'
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Error Loading Company Details
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <CompanyDetailsBody
      organization={organization}
      admin={admin}
      statistics={statistics}
      psychologists={psychologists}
      recentTriages={recentTriages}
      loading={loading || globalLoading}
      onUpdate={updateDetails}
    />
  );
}
