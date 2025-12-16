import React from 'react';
import { Card, CardContent, Box, Typography, Stack, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const SubscriptionCardStatus = ({ organization, loading = false }) => {
  if (!organization) {
    return null;
  }

  const {
    subscription_status,
    subscriptionEndDate,
    psychologistSeats,
    seats_limit,
    subscriptionStartDate,
    is_paid,
  } = organization;

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!subscriptionEndDate) return null;
    const endDate = new Date(subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status color and label
  const getStatusInfo = () => {
    switch (subscription_status) {
      case 'active':
        return { color: 'success', label: 'Active', icon: CheckCircleIcon };
      case 'past_due':
        return { color: 'warning', label: 'Past Due', icon: ScheduleIcon };
      case 'canceled':
        return { color: 'error', label: 'Canceled', icon: ScheduleIcon };
      case 'incomplete':
        return { color: 'warning', label: 'Incomplete', icon: ScheduleIcon };
      default:
        return { color: 'default', label: 'Unknown', icon: ScheduleIcon };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        borderRadius: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                Subscription Status
              </Typography>
              <Chip
                icon={<StatusIcon sx={{ fontSize: 16 }} />}
                label={statusInfo.label}
                color={statusInfo.color}
                size="small"
                sx={{
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  fontSize: '0.75rem',
                }}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Current Seats */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <PeopleIcon sx={{ color: 'primary.main', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                Current Seats
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.5rem' }}>
              {psychologistSeats || seats_limit || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.muted', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
              Maximum psychologists allowed
            </Typography>
          </Box>

          <Divider />

          {/* Billing Information */}
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <CalendarTodayIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                  Next Billing Date
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem' }}>
                {formatDate(subscriptionEndDate)}
              </Typography>
            </Box>

            {daysRemaining !== null && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  <ScheduleIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                    Days Remaining
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem' }}>
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </Typography>
              </Box>
            )}

            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <CreditCardIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                  Payment Status
                </Typography>
              </Stack>
              <Chip
                label={is_paid ? 'Paid' : 'Unpaid'}
                color={is_paid ? 'success' : 'warning'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCardStatus;

