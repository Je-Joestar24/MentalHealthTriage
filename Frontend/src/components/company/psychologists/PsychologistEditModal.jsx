import React, { useState, useEffect, useCallback } from 'react';
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
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import usePsychologists from '../../../hooks/psychologistsHook';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function PsychologistEditModal({ open, onClose, psychologist, onUpdated }) {
  const { editPsychologist } = usePsychologists();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && psychologist) {
      setForm({
        name: psychologist.name || '',
        email: psychologist.email || '',
        password: '',
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [open, psychologist]);

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
    if (form.password && form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!psychologist?._id) return;
      if (!validate()) return;

      setSubmitting(true);
      try {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
        };
        if (form.password) {
          payload.password = form.password;
        }
        const resultAction = await editPsychologist(psychologist._id, payload);
        if (resultAction?.meta?.requestStatus === 'fulfilled') {
          if (onUpdated) onUpdated(resultAction.payload);
          onClose?.();
        }
      } finally {
        setSubmitting(false);
      }
    },
    [editPsychologist, form, onClose, onUpdated, psychologist, validate]
  );

  if (!psychologist) {
    return null;
  }

  const statusLabel = psychologist.isActive ? 'Active' : 'Inactive';
  const statusColor = psychologist.isActive ? 'success' : 'default';

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="edit-psychologist-title"
    >
      <DialogTitle id="edit-psychologist-title">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <EditOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Edit Psychologist
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ mt: 1 }}
        >
          {/* Profile summary */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              p: 2,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'primary.main',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                  }}
                >
                  {psychologist.name?.charAt(0).toUpperCase() || 'P'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {psychologist.name || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {psychologist.email || '—'}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={statusLabel}
                  color={statusColor}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                />
                {psychologist.organization && (
                  <Chip
                    icon={<BusinessOutlinedIcon sx={{ fontSize: 16 }} />}
                    label={psychologist.organization.name || 'Organization'}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Profile Details
                </Typography>
                <Typography variant="body2">
                  <strong>Specialization:</strong>{' '}
                  {psychologist.specialization || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Experience:</strong>{' '}
                  {psychologist.experience > 0
                    ? `${psychologist.experience} years`
                    : 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDate(psychologist.createdAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {formatDate(psychologist.updatedAt)}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Editable fields */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              p: 2,
            }}
          >
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  You can update the psychologist&apos;s name, email, and optionally set a new password.
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

                <TextField
                  label="New Password (optional)"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  fullWidth
                  size="small"
                  error={!!errors.password}
                  helperText={errors.password || 'Leave blank to keep the current password'}
                />
              </Stack>
            </Box>
          </Box>
        </Stack>
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
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


