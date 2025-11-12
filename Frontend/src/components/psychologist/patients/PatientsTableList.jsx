import React from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const StatusChip = ({ status = 'inactive', isDeleted = false }) => {
  if (isDeleted) {
    return <Chip label="Archived" size="small" color="default" variant="outlined" />;
  }

  const color = status === 'active' ? 'success' : 'warning';
  const label = status === 'active' ? 'Active' : 'Inactive';
  return <Chip label={label} size="small" color={color} variant="outlined" />;
};

const EmptyState = () => (
  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      No patients found
    </Typography>
    <Typography variant="body2">
      Try adjusting your filters or add a new patient.
    </Typography>
  </Box>
);

const LoadingState = () => (
  <TableBody>
    {Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={`loading-${idx}`}>
        <TableCell colSpan={7}>
          <Skeleton variant="rounded" height={48} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const PatientsTableList = ({
  rows = [],
  loading = false,
  onViewPatient,
  onViewTriage,
  onEdit,
  onDelete,
  onRestore
}) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Psychologist</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <LoadingState />
          ) : (
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : '—'} • Age{' '}
                        {row.age ?? '—'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{row.contactInfo?.email || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {row.contactInfo?.phone || '—'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.assignedPsychologist?.name || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.assignedPsychologist?.email || '—'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.organization?.name || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} isDeleted={row.isDeleted} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(row.createdAt)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View triage records">
                        <span>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{py:'1px'}}
                            startIcon={<HistoryEduOutlinedIcon />}
                            onClick={() => onViewTriage?.(row)}
                          >
                            Triage
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title="View details">
                        <span>
                          <IconButton size="small" onClick={() => onViewPatient?.(row)}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {row.isDeleted ? (
                        <Tooltip title="Restore patient">
                          <span>
                            <IconButton size="small" onClick={() => onRestore?.(row)}>
                              <RestoreOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title="Edit patient">
                            <span>
                          <IconButton size="small" onClick={() => onEdit?.(row)}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Archive patient">
                            <span>
                              <IconButton size="small" color="error" onClick={() => onDelete?.(row)}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Card>
  );
};

export default PatientsTableList;


