import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useSubscription from '../../../hooks/subscriptionHook';

const SubscriptionCancelCard = ({ organization, onCancellationSuccess }) => {
  const {
    scheduleOrgCancellation,
    undoOrgCancellation,
    cancellationLoading,
    cancellationError,
  } = useSubscription();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [undoDialogOpen, setUndoDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Prevent early rendering errors
  if (!organization || !organization._id) {
    return null;
  }

  const organizationId = organization._id;
  const isCancellationScheduled = organization.cancel_at_period_end === true;
  const subscriptionEndDate = organization.subscriptionEndDate
    ? new Date(organization.subscriptionEndDate)
    : null;

  const handleCancelClick = useCallback(() => {
    setCancellationReason('');
    setCancelDialogOpen(true);
  }, []);

  const handleUndoCancelClick = useCallback(() => {
    setUndoDialogOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    try {
      const result = await scheduleOrgCancellation(organizationId, cancellationReason);
      if (result.success) {
        setCancelDialogOpen(false);
        setCancellationReason('');
        // Reload organization data
        if (onCancellationSuccess) {
          onCancellationSuccess();
        }
      }
    } catch (error) {
      console.error('Error scheduling cancellation:', error);
    }
  }, [organizationId, cancellationReason, scheduleOrgCancellation, onCancellationSuccess]);

  const handleConfirmUndo = useCallback(async () => {
    try {
      const result = await undoOrgCancellation(organizationId);
      if (result.success) {
        setUndoDialogOpen(false);
        // Reload organization data
        if (onCancellationSuccess) {
          onCancellationSuccess();
        }
      }
    } catch (error) {
      console.error('Error undoing cancellation:', error);
    }
  }, [organizationId, undoOrgCancellation, onCancellationSuccess]);

  const handleCloseCancelDialog = useCallback(() => {
    setCancelDialogOpen(false);
    setCancellationReason('');
  }, []);

  const handleCloseUndoDialog = useCallback(() => {
    setUndoDialogOpen(false);
  }, []);

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      sx={{
        borderRadius: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        maxWidth: '500px'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CancelIcon sx={{ color: 'error.main', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                Cancel Subscription
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '0.85rem' }}>
              Cancel your subscription at any time. Access will continue until the end of your billing period.
            </Typography>
          </Box>

          <Divider />

          {/* Cancellation Status Alert */}
          {isCancellationScheduled ? (
            <Alert
              severity="info"
              icon={<WarningAmberIcon />}
              sx={{
                borderRadius: 1.5,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.85rem' }}>
                Cancellation Scheduled
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                Your subscription is scheduled to cancel at the end of your billing period.
                {subscriptionEndDate && (
                  <> Access will continue until {subscriptionEndDate.toLocaleDateString()}.</>
                )}
              </Typography>
            </Alert>
          ) : (
            <Alert
              severity="warning"
              icon={<WarningAmberIcon />}
              sx={{
                borderRadius: 1.5,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.85rem' }}>
                Important Information
              </Typography>
              <Typography variant="body2" component="div" sx={{ fontSize: '0.8rem' }}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Your subscription will remain active until the end of your current billing period</li>
                  <li>You will lose access to all features after the billing period ends</li>
                  <li>All data will be retained for 30 days after cancellation</li>
                  <li>You can reactivate your subscription at any time</li>
                </ul>
              </Typography>
            </Alert>
          )}

          {/* Error Display */}
          {cancellationError && (
            <Alert severity="error" sx={{ borderRadius: 1.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {cancellationError}
              </Typography>
            </Alert>
          )}

          {/* Action Buttons */}
          {isCancellationScheduled ? (
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              onClick={handleUndoCancelClick}
              disabled={cancellationLoading}
              startIcon={cancellationLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
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
              {cancellationLoading ? 'Processing...' : 'Continue Subscription'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              size="large"
              onClick={handleCancelClick}
              disabled={cancellationLoading}
              startIcon={cancellationLoading ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                py: 1.25,
                borderRadius: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              {cancellationLoading ? 'Processing...' : 'Cancel Subscription'}
            </Button>
          )}

          {/* Info Note */}
          <Typography variant="caption" sx={{ color: 'text.muted', textAlign: 'center', display: 'block', fontSize: '0.75rem' }}>
            {isCancellationScheduled
              ? 'You can continue your subscription at any time before the billing period ends.'
              : 'This action cannot be undone. Please contact support if you need assistance.'}
          </Typography>
        </Stack>
      </CardContent>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="cancel-dialog-title">
          Confirm Subscription Cancellation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description" sx={{ mb: 2 }}>
            Are you sure you want to cancel your subscription? Your subscription will remain active until the end of your current billing period.
            {subscriptionEndDate && (
              <> Access will continue until {subscriptionEndDate.toLocaleDateString()}.</>
            )}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Cancellation Reason (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please let us know why you're canceling..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancellationLoading}>
            Keep Subscription
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={cancellationLoading}
            startIcon={cancellationLoading ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
          >
            {cancellationLoading ? 'Processing...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Undo Cancellation Confirmation Dialog */}
      <Dialog
        open={undoDialogOpen}
        onClose={handleCloseUndoDialog}
        aria-labelledby="undo-dialog-title"
        aria-describedby="undo-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="undo-dialog-title">
          Continue Subscription
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="undo-dialog-description">
            Are you sure you want to continue your subscription? Your subscription will remain active and continue after the current billing period ends.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUndoDialog} disabled={cancellationLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUndo}
            color="success"
            variant="contained"
            disabled={cancellationLoading}
            startIcon={cancellationLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          >
            {cancellationLoading ? 'Processing...' : 'Continue Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SubscriptionCancelCard;

