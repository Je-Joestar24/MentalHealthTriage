import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  NotesOutlined,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutline,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import useUser from '../../../hooks/userHook';
import DiagnosisViewNote from './DiagnosisViewNote';
import DiagnosisEditNoteModal from './DiagnosisEditNoteModal';

const ownershipColorMap = {
  owned: 'primary',
  organization: 'warning',
  individual: 'default',
  global: 'success',
};

const DiagnosisNotesList = ({
  diagnosisId,
  notes = [],
  loading = false,
  error = null,
  onEditNote,
  onDeleteNote,
}) => {
  const { user } = useUser();
  const [expanded, setExpanded] = useState(true); // Expanded by default when in dialog
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const userId = user?.id || user?._id;

  const handleViewNote = (note) => {
    setViewingNote(note);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
  };

  const handleDeleteNote = (note) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote?.(diagnosisId, note._id);
    }
  };

  const handleUpdateNote = (content) => {
    if (editingNote) {
      onEditNote?.(diagnosisId, editingNote._id, content);
      setEditingNote(null);
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.light',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)',
          },
        }}
      >
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            p: 1.5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': {
              backgroundColor: alpha('#2563eb', 0.04),
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <NotesOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Notes
            </Typography>
            {notes.length > 0 && (
              <Chip
                size="small"
                label={notes.length}
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Stack>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Divider />
          <CardContent sx={{ p: 2, pt: 2, maxHeight: 400, overflowY: 'auto' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && notes.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No notes yet. Add your first note!
              </Typography>
            )}

            {!loading && notes.length > 0 && (
              <Stack spacing={1.5}>
                {notes.map((note) => {
                  // Handle both metadata structure and direct properties
                  const isOwned = note.metadata?.isOwned ?? note.isOwned ?? false;
                  const ownership = note.metadata?.ownership ?? note.ownership ?? 'individual';
                  const isLong = note.content?.length > 80;

                  return (
                    <Box
                      key={note._id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: isOwned ? 'primary.light' : 'divider',
                        backgroundColor: isOwned
                          ? alpha('#2563eb', 0.04)
                          : 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: alpha('#2563eb', 0.06),
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Chip
                              size="small"
                              label={ownership}
                              color={ownershipColorMap[ownership] || 'default'}
                              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                            />
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.primary',
                              lineHeight: 1.6,
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {isLong ? truncateText(note.content) : note.content}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                          <Tooltip title="View full note" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewNote(note)}
                              sx={{ color: 'primary.main' }}
                            >
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {isOwned && (
                            <>
                              <Tooltip title="Edit note" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditNote(note)}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <EditOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete note" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteNote(note)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Collapse>
      </Card>

      <DiagnosisViewNote
        open={!!viewingNote}
        onClose={() => setViewingNote(null)}
        note={viewingNote}
      />

      <DiagnosisEditNoteModal
        open={!!editingNote}
        onClose={() => setEditingNote(null)}
        onUpdate={handleUpdateNote}
        note={editingNote}
        loading={loading}
      />
    </>
  );
};

export default DiagnosisNotesList;

