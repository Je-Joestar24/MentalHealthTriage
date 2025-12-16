import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const SubscriptionCancelCard = ({ organization }) => {
  const handleCancelClick = () => {
    // TODO: Implement cancel subscription functionality
    console.log('Cancel subscription clicked');
  };

  if (!organization) {
    return null;
  }

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

          {/* Warning Alert */}
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

          {/* Cancel Button */}
          <Button
            variant="outlined"
            color="error"
            fullWidth
            size="large"
            onClick={handleCancelClick}
            startIcon={<CancelIcon />}
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
            Cancel Subscription
          </Button>

          {/* Info Note */}
          <Typography variant="caption" sx={{ color: 'text.muted', textAlign: 'center', display: 'block', fontSize: '0.75rem' }}>
            This action cannot be undone. Please contact support if you need assistance.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCancelCard;

