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
  MenuItem
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlineIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlineIcon from '@mui/icons-material/PhoneOutlined';
import CakeOutlineIcon from '@mui/icons-material/CakeOutlined';
import usePatients from '../../../hooks/patientHook';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

export default function EditPatientModal({ open, onClose, data, onUpdated }) {
  const { updatePatient, loadPatients, pagination, filters } = usePatients();
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'other',
    contactInfo: {
      email: '',
      phone: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && data) {
      setForm({
        name: data.name || '',
        age: data.age?.toString() || '',
        gender: data.gender || 'other',
        contactInfo: {
          email: data.contactInfo?.email || '',
          phone: data.contactInfo?.phone || ''
        }
      });
      setErrors({});
    }
    if (!open) {
      setForm({
        name: '',
        age: '',
        gender: 'other',
        contactInfo: {
          email: '',
          phone: ''
        }
      });
      setErrors({});
    }
  }, [open, data]);

  const handleChange = useCallback((key, value) => {
    if (key === 'email' || key === 'phone') {
      setForm((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [key]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
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

    if (form.age !== undefined) {
      if (!form.age || form.age === '') {
        newErrors.age = 'Age is required';
      } else {
        const ageNum = Number(form.age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
          newErrors.age = 'Age must be between 0 and 130';
        }
      }
    }

    if (form.contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      if (form.name !== (data.name || '')) {
        updateData.name = form.name.trim();
      }

      if (form.age !== (data.age?.toString() || '')) {
        updateData.age = Number(form.age);
      }

      if (form.gender !== (data.gender || 'other')) {
        updateData.gender = form.gender;
      }

      const contactChanged =
        form.contactInfo.email !== (data.contactInfo?.email || '') ||
        form.contactInfo.phone !== (data.contactInfo?.phone || '');

      if (contactChanged) {
        updateData.contactInfo = {
          email: form.contactInfo.email.trim() || undefined,
          phone: form.contactInfo.phone.trim() || undefined
        };
        // Remove undefined values
        if (!updateData.contactInfo.email) delete updateData.contactInfo.email;
        if (!updateData.contactInfo.phone) delete updateData.contactInfo.phone;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        onClose?.();
        return;
      }

      const result = await updatePatient(data._id, updateData);

      if (result?.meta?.requestStatus === 'fulfilled') {
        await loadPatients({ ...filters, page: pagination?.currentPage || 1 });
        onUpdated?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Error updating Client:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges =
    form.name !== (data?.name || '') ||
    form.age !== (data?.age?.toString() || '') ||
    form.gender !== (data?.gender || 'other') ||
    form.contactInfo.email !== (data?.contactInfo?.email || '') ||
    form.contactInfo.phone !== (data?.contactInfo?.phone || '');

  const isValid =
    (!form.name || form.name.trim()) &&
    (!form.age || (Number(form.age) >= 0 && Number(form.age) <= 130)) &&
    (!form.contactInfo.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactInfo.email));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Edit Client Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          Update client details for {data?.name || 'this client'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Client Name"
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
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Age"
              type="number"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              size="small"
              fullWidth
              required
              inputProps={{ min: 0, max: 130, step: 1 }}
              error={!!errors.age}
              helperText={errors.age}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5
                }
              }}
            />

            <TextField
              select
              label="Gender"
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5
                },
                '& .MuiInputBase-input': { fontSize: '.85em' },
                '& .MuiInputLabel-root': { fontSize: '.85em' },
                '& .MuiMenuItem-root': { fontSize: '.85em' }
              }}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Email"
            type="email"
            value={form.contactInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            size="small"
            fullWidth
            error={!!errors.email}
            helperText={errors.email || 'Optional'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />

          <TextField
            label="Phone"
            type="tel"
            value={form.contactInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            size="small"
            fullWidth
            helperText="Optional"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2
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
            fontWeight: 600
          }}
        >
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

