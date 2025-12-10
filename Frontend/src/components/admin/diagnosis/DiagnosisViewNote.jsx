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
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { CloseOutlined, VisibilityOutlined } from '@mui/icons-material';

const ownershipColorMap = {
  owned: 'primary',
  organization: 'warning',
  individual: 'default',
  global: 'success',
};

const DiagnosisViewNote = ({ open, onClose, note }) => {
  if (!note) return null;

  const { content, metadata, createdAt, updatedAt } = note;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <VisibilityOutlined sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              View Note
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
            aria-label="Close"
          >
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip
                size="small"
                label={metadata?.ownership || 'individual'}
                color={ownershipColorMap[metadata?.ownership] || 'default'}
                sx={{ fontWeight: 600 }}
              />
              {metadata?.type && metadata.type !== metadata.ownership && (
                <Chip
                  size="small"
                  label={metadata.type}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Stack>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.7,
                color: 'text.primary',
              }}
            >
              {content}
            </Typography>
          </Box>

          <Divider />

          <Stack direction="row" spacing={2} sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {createdAt && (
              <Typography variant="caption">
                Created: {new Date(createdAt).toLocaleString()}
              </Typography>
            )}
            {updatedAt && updatedAt !== createdAt && (
              <Typography variant="caption">
                Updated: {new Date(updatedAt).toLocaleString()}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={onClose} variant="contained" color="primary" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosisViewNote;

