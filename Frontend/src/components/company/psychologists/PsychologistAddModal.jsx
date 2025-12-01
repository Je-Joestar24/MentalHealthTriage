import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import usePsychologists from '../../../hooks/psychologistsHook';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function PsychologistAddModal({ open, onClose, onCreated }) {
  const { addPsychologist } = usePsychologists();
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm the password';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!validate()) return;

      setSubmitting(true);
      try {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          // organization is intentionally omitted; backend will auto-assign for company_admin
        };
        const resultAction = await addPsychologist(payload);
        if (resultAction?.meta?.requestStatus === 'fulfilled') {
          if (onCreated) onCreated(resultAction.payload);
          onClose?.();
        }
      } finally {
        setSubmitting(false);
      }
    },
    [addPsychologist, form, onCreated, onClose, validate]
  );

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-psychologist-title"
    >
      <DialogTitle id="add-psychologist-title">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <PersonAddAltOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Add New Psychologist
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Create a new psychologist account. Organization is optional and will be auto-assigned
              when created by a company admin.
            </Typography>

            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              size="small"
              required
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              size="small"
              required
              error={!!errors.email}
              helperText={errors.email}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                fullWidth
                size="small"
                required
                error={!!errors.password}
                helperText={errors.password || 'Minimum 8 characters'}
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                fullWidth
                size="small"
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none', fontSize: '0.85rem' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={submitting}
          sx={{ textTransform: 'none', fontSize: '0.85rem' }}
        >
          {submitting ? 'Saving...' : 'Create Psychologist'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


