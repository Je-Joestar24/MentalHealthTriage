import React from 'react';
import { Box, Card, Typography, Stack, Divider, Chip, CircularProgress, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import {
  BusinessOutlined,
  CalendarToday,
  Schedule,
  People,
  Person,
  Email,
} from '@mui/icons-material';

const DetailItem = ({ label, value, icon: Icon, compact = false }) => (
  <Box
    sx={{
      p: compact ? 1.25 : 1.5,
      borderRadius: 1.5,
      bgcolor: 'background.default',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'primary.main',
        bgcolor: 'action.hover',
      },
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      {Icon && (
        <Icon
          sx={{
            fontSize: compact ? 20 : 22,
            color: 'primary.main',
            mt: 0.25,
            flexShrink: 0,
          }}
        />
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: compact ? '0.75rem' : '0.8rem',
            color: 'text.secondary',
            fontWeight: 500,
            display: 'block',
            mb: 0.75,
          }}
        >
          {label}
        </Typography>
        <Box sx={{ wordBreak: 'break-word' }}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography
              variant="body2"
              sx={{
                fontSize: compact ? '0.9rem' : '0.95rem',
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.5,
              }}
            >
              {value}
            </Typography>
          ) : (
            value
          )}
        </Box>
      </Box>
    </Stack>
  </Box>
);

const CompanyDashboardDetails = ({ organization, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!organization) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={{ height: '100%' }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            height: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BusinessOutlined sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                Organization Details
              </Typography>
            </Stack>
            <Divider />

            {/* Organization Name - Full Width */}
            <DetailItem
              label="Organization Name"
              value={organization.name}
              icon={BusinessOutlined}
            />

            {/* Status and Seats - Side by Side */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Subscription Status"
                  value={
                    <Chip
                      label={organization.effectiveStatus?.toUpperCase()}
                      color={getStatusColor(organization.effectiveStatus)}
                      size="small"
                      sx={{ fontSize: '0.8rem', height: 26, fontWeight: 600 }}
                    />
                  }
                  compact
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Psychologist Seats"
                  value={`${organization.psychologistSeats} seats`}
                  icon={People}
                  compact
                />
              </Grid>
            </Grid>

            {/* Subscription Period and Days Remaining - 75% / 25% */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={9}>
                <DetailItem
                  label="Subscription Period"
                  value={
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {formatDate(organization.subscriptionStartDate)}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.85rem',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        →
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {formatDate(organization.subscriptionEndDate)}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                  icon={CalendarToday}
                />
              </Grid>
              {organization.daysRemaining !== null && (
                <Grid item xs={12} md={3}>
                  <DetailItem
                    label="Days Remaining"
                    value={
                      <Chip
                        label={`${organization.daysRemaining} days`}
                        color={organization.daysRemaining > 30 ? 'success' : organization.daysRemaining > 0 ? 'warning' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.8rem', height: 26, fontWeight: 600 }}
                      />
                    }
                    compact
                  />
                </Grid>
              )}
            </Grid>

            {/* Admin Information */}
            {organization.admin && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.5,
                  }}
                >
                  Admin Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <DetailItem
                      label="Admin Name"
                      value={organization.admin.name}
                      icon={Person}
                      compact
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DetailItem
                      label="Admin Email"
                      value={organization.admin.email}
                      icon={Email}
                      compact
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Stack>
        </Card>
      </motion.div>
    </Box>
  );
};

export default CompanyDashboardDetails;

