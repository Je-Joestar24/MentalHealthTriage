import React, { useCallback, useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Stack, 
  Button,
  InputAdornment,
  Typography,
  Box,
  Card,
  CardContent
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import useIndividual from '../../../hooks/individualHook';

export default function ExtendModal({ open, onClose, data, onExtended }) {
  const { extendSubscriptionMonths, loadIndividuals, pagination, filters } = useIndividual();
  const [months, setMonths] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setMonths(3);
      setError('');
    }
  }, [open]);

  const handleChange = useCallback((value) => {
    const numValue = value ? Number(value) : '';
    setMonths(numValue);
    if (error) setError('');
  }, [error]);

  const validateForm = () => {
    if (!months || months <= 0) {
      setError('Months must be a positive number');
      return false;
    }
    return true;
  };

  const calculateNewEndDate = () => {
    if (!data?.subscriptionEndDate || !months) return null;
    
    const currentEndDate = new Date(data.subscriptionEndDate);
    const now = new Date();
    
    // If subscription is still active, extend from current end date
    // Otherwise, extend from now
    const baseDate = currentEndDate > now ? currentEndDate : now;
    const newEndDate = new Date(baseDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    
    return newEndDate;
  };

  const handleSubmit = async () => {
    if (!data?._id) return;
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await extendSubscriptionMonths(data._id, months);
      
      if (result?.meta?.requestStatus === 'fulfilled') {
        await loadIndividuals({ page: pagination?.page || 1, limit: pagination?.limit || 5, ...filters });
        onExtended?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Error extending subscription:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const newEndDate = calculateNewEndDate();
  const isValid = months > 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Extend Subscription
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          Add months to {data?.name || 'this account'}'s subscription
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {data && (
            <Card 
              variant="outlined" 
              sx={{ 
                bgcolor: 'background.default',
                borderRadius: 1.5,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data.name}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Current end date: {data.subscriptionEndDate 
                        ? new Date(data.subscriptionEndDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Unlimited'}
                    </Typography>
                  </Stack>
                  
                  {data.daysRemaining !== null && (
                    <Typography variant="caption" color="text.secondary">
                      Days remaining: {data.daysRemaining} {data.daysRemaining === 1 ? 'day' : 'days'}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          <TextField
            label="Months to Extend"
            type="number"
            value={months}
            onChange={(e) => handleChange(e.target.value)}
            size="small"
            fullWidth
            required
            inputProps={{ min: 1, step: 1 }}
            error={!!error}
            helperText={error || 'Enter the number of months to add to the subscription'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    {months === 1 ? 'month' : 'months'}
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />

          {newEndDate && (
            <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 1.5, opacity: 0.1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  New end date: {newEndDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Note:</strong> If the subscription is currently active, months will be added from the current end date. 
              If expired, months will be added from today.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button 
          onClick={onClose} 
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2,
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={submitting || !isValid} 
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2,
            fontWeight: 600,
          }}
        >
          {submitting ? 'Extending…' : `Extend by ${months} ${months === 1 ? 'Month' : 'Months'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

