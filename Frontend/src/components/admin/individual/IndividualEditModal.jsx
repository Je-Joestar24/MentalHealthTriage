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
  Divider
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlineIcon from '@mui/icons-material/EmailOutlined';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import useIndividual from '../../../hooks/individualHook';

export default function IndividualEditModal({ open, onClose, data, onUpdated }) {
  const { updateIndividual } = useIndividual();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    if (open && data) {
      setForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
      });
      setShowPasswordField(false);
      setErrors({});
    }
    if (!open) {
      setForm({ name: '', email: '', password: '' });
      setShowPasswordField(false);
      setErrors({});
    }
  }, [open, data]);

  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    
    if (form.name !== undefined && !form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (form.email !== undefined) {
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (showPasswordField && form.password) {
      if (form.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!data?._id) return;
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {};
      
      // Only include fields that have changed
      if (form.name !== data.name) {
        updateData.name = form.name.trim();
      }
      
      if (form.email !== data.email) {
        updateData.email = form.email.trim();
      }
      
      if (showPasswordField) {
        if (!form.password || !form.password.trim()) {
          setErrors((prev) => ({ ...prev, password: 'Password is required' }));
          setSubmitting(false);
          return;
        }
        updateData.password = form.password.trim();
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        onClose?.();
        return;
      }

      const result = await updateIndividual(data._id, updateData);
      
      if (result?.meta?.requestStatus === 'fulfilled') {
        onUpdated?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Error updating individual:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = form.name !== (data?.name || '') || 
                     form.email !== (data?.email || '') || 
                     (showPasswordField && form.password);

  const isValid = (!form.name || form.name.trim()) && 
                  (!form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) &&
                  (!showPasswordField || !form.password || form.password.length >= 8);

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
          Edit Individual Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          Update account details for {data?.name || 'this account'}
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

          <Divider sx={{ my: 1 }} />

          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowPasswordField(!showPasswordField)}
              sx={{
                textTransform: 'none',
                mb: 1.5,
                borderRadius: 1.5,
              }}
            >
              {showPasswordField ? 'Cancel Password Change' : 'Change Password'}
            </Button>

            {showPasswordField && (
              <TextField
                label="New Password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                size="small"
                fullWidth
                error={!!errors.password}
                helperText={errors.password || 'Leave empty to keep current password'}
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
            )}
          </Box>

          <Box sx={{ mt: 1, p: 1.5, bgcolor: 'background.default', borderRadius: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              <strong>Note:</strong> Subscription details cannot be edited here. Use the "Extend" button to modify subscription duration.
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
          disabled={submitting || !isValid || !hasChanges} 
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2,
            fontWeight: 600,
          }}
        >
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

