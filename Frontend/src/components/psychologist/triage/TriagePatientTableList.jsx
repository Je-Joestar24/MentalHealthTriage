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
  ButtonBase
} from '@mui/material';
import { motion } from 'framer-motion';

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
      No clients found
    </Typography>
    <Typography variant="body2">
      Try adjusting your filters to find clients.
    </Typography>
  </Box>
);

const LoadingState = () => (
  <TableBody>
    {Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={`loading-${idx}`}>
        <TableCell colSpan={5}>
          <Skeleton variant="rounded" height={48} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const TriagePatientTableList = ({
  rows = [],
  loading = false,
  onSelectPatient
}) => {
  if (!loading && rows.length === 0) {
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
              <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Psychologist</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <LoadingState />
          ) : (
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row._id}
                  onClick={() => onSelectPatient?.(row)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.action.hover
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell
                    component={ButtonBase}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.age} years old • {row.gender || 'N/A'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {row.contactInfo?.email && (
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {row.contactInfo.email}
                        </Typography>
                      )}
                      {row.contactInfo?.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {row.contactInfo.phone}
                        </Typography>
                      )}
                      {!row.contactInfo?.email && !row.contactInfo?.phone && (
                        <Typography variant="caption" color="text.secondary">
                          No contact info
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {row.assignedPsychologist ? (
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {typeof row.assignedPsychologist === 'object'
                          ? row.assignedPsychologist.name
                          : 'N/A'}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} isDeleted={row.isDeleted} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {formatDate(row.createdAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TriagePatientTableList;

