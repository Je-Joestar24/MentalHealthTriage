import React from 'react';
import { Box, Card, Typography, Stack, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import {
  PeopleOutline,
  MonitorHeartOutlined,
  BusinessCenterOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';

const SummaryCard = ({ icon: Icon, title, value, subtitle, delay = 0, color = 'primary' }) => {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        style={{ height: '100%' }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            height: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Icon sx={{ fontSize: 24, color: `${color}.main` }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                }}
              >
                {title}
              </Typography>
            </Stack>
            <Typography
              variant="h4"
              sx={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value || 0}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  color: 'text.secondary',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Card>
      </motion.div>
    </Box>
  );
};

const CompanyDashboardSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        <SummaryCard
          icon={BusinessCenterOutlined}
          title="Psychologists"
          value={summary.totalPsychologists}
          subtitle={`${summary.activePsychologists} active`}
          delay={0.1}
          color="primary"
        />
        <SummaryCard
          icon={PeopleOutline}
          title="Clients"
          value={summary.totalPatients}
          subtitle={`${summary.activePatients} active`}
          delay={0.2}
          color="secondary"
        />
        <SummaryCard
          icon={MonitorHeartOutlined}
          title="Triages"
          value={summary.totalTriages}
          subtitle={`${summary.triagesThisMonth} this month`}
          delay={0.3}
          color="warning"
        />
        <SummaryCard
          icon={DescriptionOutlined}
          title="Diagnoses"
          value={summary.accessibleDiagnoses}
          subtitle={`${summary.organizationDiagnoses} organization`}
          delay={0.4}
          color="success"
        />
      </Box>
    </Box>
  );
};

export default CompanyDashboardSummary;

