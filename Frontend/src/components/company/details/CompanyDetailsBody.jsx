import React from 'react';
import { Container, Box, Stack } from '@mui/material';
import CompanyDetailsHeader from './CompanyDetailsHeader';
import CompanyDetailsStatistics from './CompanyDetailsStatistics';
import CompanyDetailsPsychologists from './CompanyDetailsPsychologists';
import CompanyDetailsRecentTriage from './CompanyDetailsRecentTriage';

const CompanyDetailsBody = ({
  organization,
  admin,
  statistics,
  psychologists,
  recentTriages,
  loading,
  onUpdate
}) => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <CompanyDetailsHeader
          organization={organization}
          admin={admin}
          onUpdate={onUpdate}
          loading={loading}
        />

        {/* Statistics */}
        <CompanyDetailsStatistics
          statistics={statistics}
          loading={loading}
        />

        {/* Psychologists */}
        <CompanyDetailsPsychologists
          psychologists={psychologists}
          loading={loading}
        />

        {/* Recent Triages */}
        <CompanyDetailsRecentTriage
          recentTriages={recentTriages}
          loading={loading}
        />
      </Stack>
    </Container>
  );
};

export default CompanyDetailsBody;

