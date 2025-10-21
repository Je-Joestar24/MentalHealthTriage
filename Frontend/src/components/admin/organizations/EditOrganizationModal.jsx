import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Button, Typography } from '@mui/material';
import useOrganization from '../../../hooks/organizationHook';

const EditOrganizationModal = ({ open, onClose, organization }) => {
  const { updateOrganization, loadOrganizations, filters } = useOrganization();
  const [seats, setSeats] = useState(organization?.psychologistSeats ?? 10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSeats(organization?.psychologistSeats ?? 10);
  }, [organization]);

  const handleSubmit = async () => {
    if (!organization?._id) return onClose?.();
    setSubmitting(true);
    try {
      await updateOrganization(organization._id, { psychologistSeats: Number(seats) });
      await loadOrganizations(filters);
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit organization seats</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">{organization?.name}</Typography>
          <TextField
            label="Psychologist seats"
            type="number"
            inputProps={{ min: 0 }}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            size="small"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting} size="small">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrganizationModal;


