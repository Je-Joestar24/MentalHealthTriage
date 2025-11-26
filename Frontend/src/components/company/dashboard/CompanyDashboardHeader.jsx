import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { BusinessOutlined, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { motion } from 'framer-motion';

const CompanyDashboardHeader = ({ organization, loading }) => {
  if (loading || !organization) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'expired':
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return <Schedule sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <BusinessOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {organization.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                color: 'text.secondary',
              }}
            >
              Organization Dashboard
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              icon={getStatusIcon(organization.effectiveStatus)}
              label={organization.effectiveStatus?.toUpperCase()}
              color={getStatusColor(organization.effectiveStatus)}
              size="small"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                height: 28,
              }}
            />
            {organization.daysRemaining !== null && (
              <Chip
                label={`${organization.daysRemaining} days remaining`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  height: 28,
                }}
              />
            )}
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
};

export default CompanyDashboardHeader;

