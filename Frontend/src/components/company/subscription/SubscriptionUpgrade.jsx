import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalculateIcon from '@mui/icons-material/Calculate';
import useSubscription from '../../../hooks/subscriptionHook';
import useCompany from '../../../hooks/companyHook';

// TODO: Replace with actual pricing from environment or API
const SEAT_PRICE_PER_MONTH = 50.00; // Price per seat per month

const SubscriptionUpgrade = ({ organization, onUpgradeSuccess }) => {
  const { upgradeSeats, loading: upgradeLoading } = useSubscription();
  const { loadCompanyDetails } = useCompany();

  const [additionalSeats, setAdditionalSeats] = useState(1);
  const [error, setError] = useState(null);

  const currentSeats = organization?.psychologistSeats || organization?.seats_limit || 0;
  const newTotalSeats = currentSeats + additionalSeats;

  // Extra payment for this month (flat $50 per additional seat, no proration)
  const extraPaymentThisMonth = additionalSeats * SEAT_PRICE_PER_MONTH;

  // Monthly recurring price (new total seats * $50)
  const monthlyRecurringPrice = newTotalSeats * SEAT_PRICE_PER_MONTH;

  const handleSeatChange = (delta) => {
    const newValue = Math.max(1, additionalSeats + delta);
    setAdditionalSeats(newValue);
    setError(null);
  };

  const handleSeatInputChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    const validValue = Math.max(1, value);
    setAdditionalSeats(validValue);
    setError(null);
  };

  const handleUpgrade = async () => {
    if (!organization?._id) {
      setError('Organization information not available');
      return;
    }

    if (additionalSeats < 1) {
      setError('Please add at least 1 seat');
      return;
    }

    setError(null);
    const result = await upgradeSeats(organization._id, additionalSeats);

    if (result.success) {
      // Reload company details to get updated subscription info
      await loadCompanyDetails();
      if (onUpgradeSuccess) {
        onUpgradeSuccess(result.payload);
      }
      // Reset form
      setAdditionalSeats(1);
    } else {
      setError(result.error || 'Failed to upgrade seats');
    }
  };

  if (!organization) {
    return null;
  }

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
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
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                Upgrade Seats
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '0.85rem' }}>
              Add more psychologist seats to your subscription. New seats are available immediately.
            </Typography>
          </Box>

          <Divider />

          {/* Current Seats Display */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.85rem' }}>
              Current Seats
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.5rem' }}>
              {currentSeats}
            </Typography>
          </Box>

          {/* Seat Selector */}
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500, fontSize: '0.85rem' }}>
              Additional Seats to Add
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                onClick={() => handleSeatChange(-1)}
                disabled={additionalSeats <= 1}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                type="number"
                value={additionalSeats}
                onChange={handleSeatInputChange}
                inputProps={{
                  min: 1,
                  style: { textAlign: 'center', fontWeight: 600 },
                }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
              <IconButton
                onClick={() => handleSeatChange(1)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* New Total */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'rgba(37, 99, 235, 0.05)',
              border: '1px solid',
              borderColor: 'rgba(37, 99, 235, 0.2)',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.85rem' }}>
              New Total Seats
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.5rem' }}>
              {newTotalSeats}
            </Typography>
          </Box>

          <Divider />

          {/* Price Calculation */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <CalculateIcon sx={{ color: 'primary.main', fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem' }}>
                Pricing Breakdown
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              {/* Extra Payment This Month */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    Extra Payment (This Month)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                    ${extraPaymentThisMonth.toFixed(2)}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.muted', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                  ${SEAT_PRICE_PER_MONTH.toFixed(2)} × {additionalSeats} additional seat{additionalSeats !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Monthly Recurring Price */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    Monthly Recurring (Next Billing)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                    ${monthlyRecurringPrice.toFixed(2)}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.muted', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                  ${SEAT_PRICE_PER_MONTH.toFixed(2)} per seat × {newTotalSeats} total seat{newTotalSeats !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          {/* Upgrade Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleUpgrade}
            disabled={upgradeLoading || additionalSeats < 1}
            startIcon={upgradeLoading ? <CircularProgress size={20} color="inherit" /> : <TrendingUpIcon />}
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              py: 1.25,
              borderRadius: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
            }}
          >
            {upgradeLoading ? 'Processing...' : 'Upgrade Seats'}
          </Button>

          {/* Info Note */}
          <Typography variant="caption" sx={{ color: 'text.muted', textAlign: 'center', display: 'block' }}>
            New seats will be available immediately. Your billing date remains unchanged.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SubscriptionUpgrade;

