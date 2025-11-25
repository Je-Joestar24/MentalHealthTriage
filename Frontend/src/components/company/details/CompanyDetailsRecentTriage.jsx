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
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';

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
  return <Chip label={label} size="small" color={color} variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />;
};

const EmptyState = () => (
  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      No recent triages found
    </Typography>
    <Typography variant="body2">
      Recent triage records will appear here once they are created.
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

const CompanyDetailsRecentTriage = ({ recentTriages = [], loading }) => {
  return (
    <Card
      elevation={0}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryEduOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Recent Triages
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={`${recentTriages.length} ${recentTriages.length === 1 ? 'record' : 'records'}`}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.75rem', height: 22 }}
          />
        </Stack>
      </Box>
      <Divider />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Symptoms</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Preliminary Diagnosis</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <LoadingState />
          ) : recentTriages.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {recentTriages.map((triage) => (
                <TableRow
                  key={triage._id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {formatDate(triage.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {triage.symptoms && triage.symptoms.length > 0 ? (
                        triage.symptoms.slice(0, 3).map((symptom, idx) => (
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
                      {triage.symptoms && triage.symptoms.length > 3 && (
                        <Chip
                          label={`+${triage.symptoms.length - 3} more`}
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
                    <SeverityChip severity={triage.severityLevel} />
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
                      {triage.preliminaryDiagnosis || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {triage.duration ? (
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {triage.duration} {triage.durationUnit || 'months'}
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
                      {triage.notes || '—'}
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

export default CompanyDetailsRecentTriage;

