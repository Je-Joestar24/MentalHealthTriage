import React, { useEffect } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../../store/uiSlice';

const SlideTransition = (props) => <Slide {...props} direction="up" />;

const Response = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.ui);

  const handleClose = () => {
    dispatch(clearNotification());
  };

  useEffect(() => {
    if (notification?.message) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification?.message) return null;

  return (
    <Snackbar
      open={!!notification?.message}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.type || 'info'}
        variant="filled"
        sx={{
          borderRadius: 2,
          fontWeight: 500,
          '& .MuiAlert-message': {
            fontSize: '0.9rem',
          },
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Response;
