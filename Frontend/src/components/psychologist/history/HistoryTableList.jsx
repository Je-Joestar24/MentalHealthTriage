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
  Skeleton
} from '@mui/material';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const SeverityChip = ({ severity }) => {
  const colorMap = {
    low: 'success',
    moderate: 'warning',
    high: 'error'
  };
  const color = colorMap[severity] || 'default';
  const label = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : '—';
  return <Chip label={label} size="small" color={color} variant="outlined" />;
};

const EmptyState = () => (
  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      No triage records found
    </Typography>
    <Typography variant="body2">
      Try adjusting your filters or create a new triage record.
    </Typography>
  </Box>
);

const LoadingState = () => (
  <TableBody>
    {Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={`loading-${idx}`}>
        <TableCell colSpan={6}>
          <Skeleton variant="rounded" height={48} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const HistoryTableList = ({
  rows = [],
  loading = false
}) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Symptoms</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Preliminary Diagnosis</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <LoadingState />
          ) : rows.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {formatDate(row.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {row.symptoms && row.symptoms.length > 0 ? (
                        row.symptoms.slice(0, 3).map((symptom, idx) => (
                          <Chip
                            key={idx}
                            label={`#${symptom}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              '& .MuiChip-label': { px: 0.75 }
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          —
                        </Typography>
                      )}
                      {row.symptoms && row.symptoms.length > 3 && (
                        <Chip
                          label={`+${row.symptoms.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 20,
                            '& .MuiChip-label': { px: 0.75 }
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <SeverityChip severity={row.severityLevel} />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {row.preliminaryDiagnosis || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.duration ? (
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {row.duration} {row.durationUnit || 'months'}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.875rem',
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {row.notes || '—'}
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

export default HistoryTableList;

