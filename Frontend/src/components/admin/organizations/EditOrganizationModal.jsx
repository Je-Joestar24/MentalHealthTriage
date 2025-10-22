import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Stack, 
  Button, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Box
} from '@mui/material';
import useOrganization from '../../../hooks/organizationHook';

const EditOrganizationModal = ({ open, onClose, organization }) => {
  const { updateOrganization, loadOrganizations, filters } = useOrganization();
  const [formData, setFormData] = useState({
    name: '',
    psychologistSeats: 10,
    subscriptionStatus: 'active',
    subscriptionEndDate: '',
    admin: {
      name: '',
      email: '',
      password: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        psychologistSeats: organization.psychologistSeats || 10,
        subscriptionStatus: organization.subscriptionStatus || 'active',
        subscriptionEndDate: organization.subscriptionEndDate ? 
          new Date(organization.subscriptionEndDate).toISOString().split('T')[0] : '',
        admin: {
          name: organization.admin?.name || '',
          email: organization.admin?.email || '',
          password: ''
        }
      });
    }
  }, [organization]);

  const handleInputChange = (field, value) => {
    if (field.startsWith('admin.')) {
      const adminField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        admin: {
          ...prev.admin,
          [adminField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!organization?._id) return onClose?.();
    setSubmitting(true);
    try {
      const updateData = {
        name: formData.name,
        psychologistSeats: Number(formData.psychologistSeats),
        subscriptionStatus: formData.subscriptionStatus,
        subscriptionEndDate: formData.subscriptionEndDate ? new Date(formData.subscriptionEndDate) : null,
        admin: {
          name: formData.admin.name,
          email: formData.admin.email,
          ...(formData.admin.password && { password: formData.admin.password })
        }
      };

      await updateOrganization(organization._id, updateData);
      await loadOrganizations(filters);
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Organization</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Organization Details */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Organization Details</Typography>
            <Stack spacing={2}>
              <TextField
                label="Organization Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Psychologist Seats"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.psychologistSeats}
                onChange={(e) => handleInputChange('psychologistSeats', e.target.value)}
                size="small"
                fullWidth
              />
            </Stack>
          </Box>

          <Divider />

          {/* Subscription Details */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Subscription Details</Typography>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.subscriptionStatus}
                  label="Status"
                  onChange={(e) => handleInputChange('subscriptionStatus', e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Subscription End Date"
                type="date"
                value={formData.subscriptionEndDate}
                onChange={(e) => handleInputChange('subscriptionEndDate', e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Admin Details */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Admin Details</Typography>
            <Stack spacing={2}>
              <TextField
                label="Admin Name"
                value={formData.admin.name}
                onChange={(e) => handleInputChange('admin.name', e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Admin Email"
                type="email"
                value={formData.admin.email}
                onChange={(e) => handleInputChange('admin.email', e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="New Password (leave blank to keep current)"
                type="password"
                value={formData.admin.password}
                onChange={(e) => handleInputChange('admin.password', e.target.value)}
                size="small"
                fullWidth
                helperText="Only enter a new password if you want to change it"
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting} size="small">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrganizationModal;


