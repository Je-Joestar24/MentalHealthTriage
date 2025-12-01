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
  Skeleton,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const StatusChip = ({ isActive }) => {
  const color = isActive ? 'success' : 'default';
  const label = isActive ? 'Active' : 'Inactive';
  return <Chip label={label} size="small" color={color} variant="outlined" sx={{ fontSize: '0.75rem' }} />;
};

const EmptyState = () => (
  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
    <PersonOutlineIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      No psychologists found
    </Typography>
    <Typography variant="body2">
      Try adjusting your filters or check back later.
    </Typography>
  </Box>
);

const LoadingState = () => (
  <TableBody>
    {Array.from({ length: 10 }).map((_, idx) => (
      <TableRow key={`loading-${idx}`}>
        <TableCell>
          <Skeleton variant="rounded" height={40} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="60%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="40%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="50%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="rounded" width={60} height={24} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="80%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="60%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="60%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="rounded" width={100} height={32} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const PsychologistTableList = ({
  rows = [],
  loading = false,
  onEdit,
  onDelete,
  onViewPatients,
}) => {
  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Psychologist</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Organization</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }} align="center">Triages</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }} align="center">Diagnoses</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <LoadingState />
          </Table>
        </TableContainer>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <EmptyState />
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Psychologist</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Organization</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Specialization</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Experience</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }} align="center">Triages</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }} align="center">Diagnoses</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((psychologist) => (
              <TableRow
                key={psychologist._id}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {psychologist.name?.charAt(0).toUpperCase() || 'P'}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {psychologist.name || '—'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {psychologist.email || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {psychologist.organization ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <BusinessOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {psychologist.organization.name || '—'}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                      Individual
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {psychologist.specialization || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip isActive={psychologist.isActive} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {psychologist.experience > 0 ? `${psychologist.experience} years` : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={psychologist.triageCount || 0}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      minWidth: 40,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={psychologist.diagnosisCount || 0}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      minWidth: 40,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Edit Psychologist">
                      <IconButton
                        size="small"
                        onClick={() => onEdit?.(psychologist)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                          },
                        }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Psychologist">
                      <IconButton
                        size="small"
                        onClick={() => onDelete?.(psychologist)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.dark',
                          },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Diagnosed Patients (Coming Soon)">
                      <span>
                        <IconButton
                          size="small"
                          disabled
                          onClick={() => onViewPatients?.(psychologist)}
                          sx={{
                            color: 'text.disabled',
                            cursor: 'not-allowed',
                          }}
                        >
                          <PeopleOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default PsychologistTableList;

