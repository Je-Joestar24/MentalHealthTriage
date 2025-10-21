import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Button } from '@mui/material';
import useOrganization from '../../../hooks/organizationHook';

const AddOrganizationModal = ({ open, onClose }) => {
  const { createOrganization, loadOrganizations, filters } = useOrganization();
  const [form, setForm] = useState({
    name: '',
    admin: { name: '', email: '', password: '' },
    subscriptionEndDate: '',
    psychologistSeats: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ name: '', admin: { name: '', email: '', password: '' }, subscriptionEndDate: '', psychologistSeats: 5 });
    }
  }, [open]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createOrganization(form);
      await loadOrganizations(filters);
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Organization</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Organization name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} size="small" fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField label="Admin name" value={form.admin.name} onChange={(e) => setForm((p) => ({ ...p, admin: { ...p.admin, name: e.target.value } }))} size="small" fullWidth />
            <TextField label="Admin email" value={form.admin.email} onChange={(e) => setForm((p) => ({ ...p, admin: { ...p.admin, email: e.target.value } }))} size="small" fullWidth />
          </Stack>
          <TextField label="Admin password" type="password" value={form.admin.password} onChange={(e) => setForm((p) => ({ ...p, admin: { ...p.admin, password: e.target.value } }))} size="small" fullWidth />
          <TextField
            label="Subscription end date"
            type="date"
            value={form.subscriptionEndDate}
            onChange={(e) => handleChange('subscriptionEndDate', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Psychologist seats"
            type="number"
            inputProps={{ min: 0 }}
            value={form.psychologistSeats}
            onChange={(e) => handleChange('psychologistSeats', Number(e.target.value))}
            size="small"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting} size="small">Create</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrganizationModal;


