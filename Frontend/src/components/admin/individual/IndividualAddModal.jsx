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
  Box
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlineIcon from '@mui/icons-material/EmailOutlined';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import useIndividual from '../../../hooks/individualHook';

const DEFAULT_FORM = {
  name: '',
  email: '',
  password: '',
  months: 6,
};

export default function IndividualAddModal({ open, onClose, onCreated }) {
  const { createIndividual, loadIndividuals, pagination, filters } = useIndividual();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setForm(DEFAULT_FORM);
      setErrors({});
    }
  }, [open]);

  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (form.months === '' || form.months === null || form.months === undefined) {
      newErrors.months = 'Months is required';
    } else if (form.months < 0) {
      newErrors.months = 'Months must be a non-negative number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        months: Number(form.months),
      };

      const result = await createIndividual(payload);
      
      if (result?.meta?.requestStatus === 'fulfilled') {
        await loadIndividuals({ page: pagination?.page || 1, limit: pagination?.limit || 5, ...filters });
        onCreated?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Error creating individual:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.name.trim() && form.email.trim() && form.password && form.password.length >= 8 && form.months >= 0;

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
          Add Individual Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          Create a new individual psychologist account
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            size="small"
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            size="small"
            fullWidth
            required
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            size="small"
            fullWidth
            required
            error={!!errors.password}
            helperText={errors.password || 'Minimum 8 characters'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />

          <Box>
            <TextField
              label="Subscription Duration (Months)"
              type="number"
              value={form.months}
              onChange={(e) => handleChange('months', e.target.value ? Number(e.target.value) : '')}
              size="small"
              fullWidth
              required
              inputProps={{ min: 0, step: 1 }}
              error={!!errors.months}
              helperText={errors.months || 'Enter 0 for unlimited subscription'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {form.months === 0 ? 'Unlimited' : form.months === 1 ? 'month' : 'months'}
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
            {form.months > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Subscription will expire on approximately {new Date(Date.now() + form.months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </Typography>
            )}
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
          {submitting ? 'Creating…' : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

