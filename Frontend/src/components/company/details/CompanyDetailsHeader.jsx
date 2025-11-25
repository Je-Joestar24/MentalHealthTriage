import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  BusinessOutlined,
  EditOutlined,
  CheckCircleOutline,
  CancelOutlined,
  CalendarTodayOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const CompanyDetailsHeader = ({ organization, admin, onUpdate, loading }) => {
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(organization?.name || '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { globalLoading } = useSelector((state) => state.ui);

  const handleEditClick = () => {
    setEditName(organization?.name || '');
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setDialogOpen(false);
    setEditName(organization?.name || '');
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      return;
    }
    await onUpdate({ name: editName.trim() });
    setEditMode(false);
    setDialogOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'expired') return 'error';
    return 'warning';
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  };

  if (!organization) {
    return null;
  }

  return (
    <>
      <Card
        elevation={0}
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          mb: 3
        }}
      >
        <Stack spacing={2}>
          {/* Header Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1} flex={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <BusinessOutlined sx={{ fontSize: 28, color: 'primary.main' }} />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 0.25
                    }}
                  >
                    {organization.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Company Details & Overview
                  </Typography>
                </Box>
              </Stack>
            </Stack>
            <IconButton
              onClick={handleEditClick}
              disabled={loading || globalLoading}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main'
                }
              }}
            >
              <EditOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          <Divider />

          {/* Info Grid */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {/* Subscription Status */}
            <Box>
              <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                <CheckCircleOutline sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Status
                </Typography>
              </Stack>
              <Chip
                label={getStatusLabel(organization.effectiveStatus || organization.subscriptionStatus)}
                size="small"
                color={getStatusColor(organization.effectiveStatus || organization.subscriptionStatus)}
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 22 }}
              />
            </Box>

            {/* Days Remaining */}
            {organization.daysRemaining !== null && (
              <Box>
                <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                  <AccessTimeOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Days Remaining
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {organization.daysRemaining} {organization.daysRemaining === 1 ? 'day' : 'days'}
                </Typography>
              </Box>
            )}

            {/* Subscription End Date */}
            {organization.subscriptionEndDate && (
              <Box>
                <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                  <CalendarTodayOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    End Date
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {formatDate(organization.subscriptionEndDate)}
                </Typography>
              </Box>
            )}

            {/* Admin Info */}
            {admin && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                  Admin
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {admin.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {admin.email}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
              Edit Company Name
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <TextField
            fullWidth
            label="Company Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            disabled={loading || globalLoading}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCancel}
            disabled={loading || globalLoading}
            startIcon={<CancelOutlined />}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!editName.trim() || loading || globalLoading}
            startIcon={loading || globalLoading ? <CircularProgress size={16} /> : <CheckCircleOutline />}
            sx={{ textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompanyDetailsHeader;

