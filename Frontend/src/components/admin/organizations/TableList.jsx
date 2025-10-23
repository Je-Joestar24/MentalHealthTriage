import React from 'react';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Stack,
  Fade,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Avatar,
  Zoom,
  Divider,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LinearProgress from '@mui/material/LinearProgress';
import GroupIcon from '@mui/icons-material/Group';

const statusColorMap = {
  active: 'success',
  expired: 'warning',
  inactive: 'error',
};

const getSeatUsageColor = (takenPercentage) => {
  if (takenPercentage >= 90) return 'error';
  if (takenPercentage >= 75) return 'warning';
  return 'success';
};

const TableList = ({ rows = [], loading, onEdit, onDelete, onViewStats }) => {
  return (
    <Card elevation={0} sx={{ p: 1.5, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">Organizations</Typography>
        <Chip size="small" label={`${rows.length} results`} color="primary" variant="outlined" />
      </Stack>
      <Divider sx={{ mb: 1 }} />
      <Fade in timeout={400}>
        <Box>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1 }}>Name</TableCell>
                  <TableCell sx={{ py: 1 }}>Admin</TableCell>
                  <TableCell sx={{ py: 1 }}>Seat Availability</TableCell>
                  <TableCell sx={{ py: 1 }}>Status</TableCell>
                  <TableCell sx={{ py: 1 }}>Ends</TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => {
                  const seatsTotal = row.seats_total || row.psychologistSeats || 0;
                  const seatsTaken = row.seats_taken || (row.psychologists?.length || 0);
                  const seatsAvailable = row.seats_available || (seatsTotal - seatsTaken);
                  const usagePercentage = (seatsTaken / seatsTotal) * 100;
                  const seatUsageColor = getSeatUsageColor(usagePercentage);
                  
                  // Determine effective status (expired if past end date)
                  const effectiveStatus = row.effectiveStatus || 
                    (row.subscriptionEndDate && new Date() < new Date(row.subscriptionEndDate) ? 'expired' : row.subscriptionStatus);
                  console.log((new Date()), (new Date(row.subscriptionEndDate)))

                  return (
                    <Zoom in style={{ transitionDelay: `${idx * 25}ms` }} key={row._id || idx}>
                      <TableRow hover sx={{ transition: 'all 200ms ease', '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.06) } }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {row.name?.[0]?.toUpperCase() || 'O'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{row.contactEmail || '—'}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const admin = row.admin;
                            const adminName = typeof admin === 'string' ? admin : (admin?.name || admin?.email || '—');
                            return (
                              <>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{adminName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.psychologistSeats ? `${row.psychologistSeats} seats` : '—'}
                                </Typography>
                              </>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <GroupIcon fontSize="small" color={seatUsageColor} />
                              <Typography variant="body2">
                                {seatsTaken}/{seatsTotal} seats used
                              </Typography>
                            </Stack>
                            <Stack spacing={1}>
                              <LinearProgress 
                                variant="determinate" 
                                value={usagePercentage} 
                                color={seatUsageColor}
                                sx={{ height: 6, borderRadius: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {seatsAvailable} {seatsAvailable === 1 ? 'seat' : 'seats'} available
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={effectiveStatus} color={statusColorMap[effectiveStatus] || 'default'} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeOutlinedIcon fontSize="small" color="action" />
                            <Typography variant="caption">{row.subscriptionEndDate ? new Date(row.subscriptionEndDate).toLocaleDateString() : '—'}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View stats" arrow>
                              <IconButton disabled color="primary" onClick={() => onViewStats?.(row)}>
                                <QueryStatsOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton onClick={() => onEdit?.(row)}>
                                <EditOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton color="error" onClick={() => onDelete?.(row)}>
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    </Zoom>
                  );
                })}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No organizations found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Fade>
    </Card>
  );
};

export default TableList;


