import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { CloseOutlined, NoteAddOutlined } from '@mui/icons-material';

const DiagnosisAddNoteModal = ({ open, onClose, onAdd, loading }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal closes (following DiagnosisAddModal pattern)
  useEffect(() => {
    if (!open) {
      setContent('');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = useCallback((value) => {
    setContent(value);
    setError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    setError('');
    setSubmitting(true);
    
    try {
      if (onAdd && typeof onAdd === 'function') {
        await onAdd(content.trim());
        // Don't clear content here - let useEffect handle it when modal closes
      }
    } finally {
      setSubmitting(false);
    }
  }, [content, onAdd]);

  const handleClose = useCallback(() => {
    if (submitting) return; // Prevent closing while submitting
    onClose?.();
  }, [onClose, submitting]);

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
      aria-labelledby="add-note-title"
    >
      <DialogTitle id="add-note-title" sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <NoteAddOutlined sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Add Note
            </Typography>
          </Stack>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: 'text.secondary' }}
            aria-label="Close"
            disabled={submitting || loading}
          >
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter your note here..."
          error={!!error}
          helperText={error}
          disabled={submitting || loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            },
          }}
          autoFocus
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="small"
            disabled={submitting || loading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            size="small"
            disabled={submitting || loading || !content.trim()}
            sx={{ textTransform: 'none' }}
          >
            {submitting || loading ? 'Adding...' : 'Add Note'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosisAddNoteModal;

