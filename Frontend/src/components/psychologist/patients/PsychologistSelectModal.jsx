import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
  InputAdornment,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Card,
  Chip,
  Skeleton,
  Box,
  Pagination,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlineIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import usePsychologists from '../../../hooks/psychologistsHook';

const LoadingState = () => (
  <TableBody>
    {Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={`loading-${idx}`}>
        <TableCell colSpan={4}>
          <Skeleton variant="rounded" height={48} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const EmptyState = () => (
  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      No psychologists found
    </Typography>
    <Typography variant="body2">
      Try adjusting your search or filters.
    </Typography>
  </Box>
);

export default function PsychologistSelectModal({ open, onClose, patient, onAssign }) {
  const {
    psychologists,
    pagination,
    loading,
    filters,
    loadPsychologists,
    search,
    goToPage
  } = usePsychologists();

  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      // Load psychologists when modal opens
      loadPsychologists({ isActive: 'true', limit: 10 });
      setSelectedPsychologist(null);
      setSearchTerm('');
    }
  }, [open, loadPsychologists]);

  useEffect(() => {
    if (!open) return;
    
    const timeoutId = setTimeout(() => {
      search(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, open, search]);

  const handleSearchChange = useCallback(
    (e) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handlePageChange = useCallback(
    (event, page) => {
      goToPage(page);
    },
    [goToPage]
  );

  const handleSelectPsychologist = useCallback(
    (psychologist) => {
      setSelectedPsychologist(psychologist);
    },
    []
  );

  const handleAssign = useCallback(async () => {
    if (!selectedPsychologist || !patient) return;
    
    try {
      await onAssign?.(patient._id, selectedPsychologist._id);
      onClose?.();
      setSelectedPsychologist(null);
    } catch (error) {
      console.error('Error assigning psychologist:', error);
    }
  }, [selectedPsychologist, patient, onAssign, onClose]);

  const isCurrentlyAssigned = patient?.assignedPsychologist?._id || patient?.assignedPsychologist;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Assign Psychologist
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          Select a psychologist to assign to {patient?.name || 'this client'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2}>
          {/* Search Field */}
          <TextField
            placeholder="Search psychologists by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />

          {/* Psychologists Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '50px' }}>Select</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                {loading ? (
                  <LoadingState />
                ) : (
                  <TableBody>
                    {psychologists.map((psychologist) => {
                      const isSelected = selectedPsychologist?._id === psychologist._id;
                      const isCurrent = isCurrentlyAssigned === psychologist._id;
                      
                      return (
                        <TableRow
                          key={psychologist._id}
                          hover
                          onClick={() => handleSelectPsychologist(psychologist)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'action.selected' : 'transparent',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <TableCell>
                            {isSelected ? (
                              <Tooltip title="Selected">
                                <CheckCircleOutlineIcon
                                  sx={{ color: 'primary.main', fontSize: 24 }}
                                />
                              </Tooltip>
                            ) : (
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor: 'divider',
                                  bgcolor: 'background.paper'
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PersonOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                {psychologist.name}
                              </Typography>
                              {isCurrent && (
                                <Chip
                                  label="Current"
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <EmailOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {psychologist.email}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={psychologist.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={psychologist.isActive ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!loading && psychologists.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <EmptyState />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ pt: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Showing page {pagination.currentPage} of {pagination.totalPages} • Total: {pagination.totalItems}
              </Typography>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
                shape="rounded"
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedPsychologist}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2,
            fontWeight: 600
          }}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

