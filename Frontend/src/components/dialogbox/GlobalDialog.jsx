import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Stack
} from '@mui/material';
import {
  InfoOutlined,
  WarningAmberOutlined,
  CheckCircleOutlined,
  CloseOutlined
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { hideGlobalDialog, clearGlobalDialog } from '../../store/uiSlice';

const GlobalDialog = () => {
  const dispatch = useDispatch();
  const { globalDialog } = useSelector((state) => state.ui);

  const getIcon = () => {
    if (globalDialog.icon) {
      return globalDialog.icon;
    }

    switch (globalDialog.type) {
      case 'danger':
        return <WarningAmberOutlined sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'success':
        return <CheckCircleOutlined sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'info':
      default:
        return <InfoOutlined sx={{ fontSize: 40, color: 'info.main' }} />;
    }
  };

  const getButtonColor = () => {
    switch (globalDialog.type) {
      case 'danger':
        return 'error';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'primary';
    }
  };

  const handleClose = () => {
    dispatch(hideGlobalDialog());
  };

  const handleCancel = () => {
    if (globalDialog.onCancel) {
      globalDialog.onCancel();
    }
    dispatch(clearGlobalDialog());
  };

  const handleConfirm = () => {
    if (globalDialog.onConfirm) {
      globalDialog.onConfirm();
    }
    dispatch(clearGlobalDialog());
  };

  return (
    <Dialog
      open={globalDialog.open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            {getIcon()}
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {globalDialog.title}
            </Typography>
          </Stack>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {globalDialog.message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleCancel}
            variant="outlined"
            size="small"
            sx={{ px: 1.5, py: .5 }}
          >
            {globalDialog.cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={getButtonColor()}
            size="small"
            sx={{ px: 1.5, py: .5 }}
          >
            {globalDialog.confirmText}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalDialog;
