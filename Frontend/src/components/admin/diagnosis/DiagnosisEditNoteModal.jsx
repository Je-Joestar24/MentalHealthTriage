import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { CloseOutlined, EditOutlined } from '@mui/icons-material';

const DiagnosisEditNoteModal = ({ open, onClose, onUpdate, note, loading }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setContent(note.content || '');
      setError('');
    }
  }, [note]);

  const handleSubmit = () => {
    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    setError('');
    onUpdate(content.trim());
  };

  const handleClose = () => {
    setContent('');
    setError('');
    onClose();
  };

  if (!note) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
            <EditOutlined sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Edit Note
            </Typography>
          </Stack>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: 'text.secondary' }}
            aria-label="Close"
            disabled={loading}
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
          onChange={(e) => {
            setContent(e.target.value);
            setError('');
          }}
          placeholder="Enter your note here..."
          error={!!error}
          helperText={error}
          disabled={loading}
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            size="small"
            disabled={loading || !content.trim() || content === note.content}
          >
            {loading ? 'Updating...' : 'Update Note'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosisEditNoteModal;

