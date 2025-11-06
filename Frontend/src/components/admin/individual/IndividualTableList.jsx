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
  Button,
  LinearProgress,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ExtendSubscriptionIcon from '@mui/icons-material/AddCircleOutline';

const statusColorMap = {
  active: 'success',
  expired: 'warning',
  inactive: 'error',
};

const IndividualTableList = ({ 
  rows = [], 
  loading, 
  onExtend, 
  onToggleStatus,
  onEdit 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDaysRemaining = (days) => {
    if (days === null) return 'Unlimited';
    if (days === 0) return 'Expired';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const getStatusColor = (row) => {
    if (!row.isActive) return 'error';
    if (row.isSubscriptionExpired || row.effectiveStatus === 'expired') return 'warning';
    return 'success';
  };

  const getStatusLabel = (row) => {
    if (!row.isActive) return 'Inactive';
    if (row.isSubscriptionExpired || row.effectiveStatus === 'expired') return 'Expired';
    return 'Active';
  };

  return (
    <Card elevation={0} sx={{ p: 1.5, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Individual Accounts
        </Typography>
        <Chip 
          size="small" 
          label={`${rows.length} result${rows.length !== 1 ? 's' : ''}`} 
          color="primary" 
          variant="outlined" 
        />
      </Stack>
      <Divider sx={{ mb: 1 }} />
      <Fade in timeout={400}>
        <Box>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1, fontWeight: 600 }}>Name & Email</TableCell>
                  <TableCell sx={{ py: 1, fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ py: 1, fontWeight: 600 }}>Subscription</TableCell>
                  <TableCell sx={{ py: 1, fontWeight: 600 }}>Days Remaining</TableCell>
                  <TableCell sx={{ py: 1, fontWeight: 600 }}>End Date</TableCell>
                  <TableCell align="right" sx={{ py: 1, fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <LinearProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Loading...
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && rows.map((row, idx) => {
                  const statusColor = getStatusColor(row);
                  const statusLabel = getStatusLabel(row);
                  const daysRemaining = row.daysRemaining;

                  return (
                    <Zoom in style={{ transitionDelay: `${idx * 25}ms` }} key={row._id || idx}>
                      <TableRow 
                        hover 
                        sx={{ 
                          transition: 'all 200ms ease', 
                          '&:hover': { 
                            backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.06) 
                          } 
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.main',
                                width: 40,
                                height: 40,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                              }}
                            >
                              {row.name?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ fontWeight: 600, mb: 0.3 }}
                              >
                                {row.name || '—'}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                              >
                                <PersonOutlinedIcon sx={{ fontSize: 14 }} />
                                {row.email || '—'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={statusLabel}
                            color={statusColor}
                            icon={
                              statusColor === 'success' ? (
                                <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                              ) : (
                                <CancelOutlinedIcon sx={{ fontSize: 14 }} />
                              )
                            }
                            sx={{ 
                              fontWeight: 600,
                              '& .MuiChip-icon': {
                                color: 'inherit',
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {row.effectiveStatus === 'active' ? 'Active' : 'Expired'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.subscriptionStartDate 
                                ? `Started: ${formatDate(row.subscriptionStartDate)}`
                                : '—'
                              }
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeOutlinedIcon 
                              fontSize="small" 
                              color={daysRemaining === null ? 'primary' : daysRemaining === 0 ? 'error' : 'action'} 
                            />
                            <Typography 
                              variant="body2"
                              color={
                                daysRemaining === null 
                                  ? 'primary.main' 
                                  : daysRemaining === 0 
                                    ? 'error.main'
                                    : daysRemaining <= 30
                                      ? 'warning.main'
                                      : 'text.primary'
                              }
                              sx={{ fontWeight: 600 }}
                            >
                              {formatDaysRemaining(daysRemaining)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayOutlinedIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(row.subscriptionEndDate)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Extend Subscription" arrow>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<ExtendSubscriptionIcon />}
                                onClick={() => onExtend?.(row)}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  px: 1,
                                  py: 0.5,
                                  minWidth: 'auto',
                                }}
                              >
                                Extend
                              </Button>
                            </Tooltip>
                            <Tooltip title={row.isActive ? 'Deactivate' : 'Activate'} arrow>
                              <IconButton
                                size="small"
                                color={row.isActive ? 'error' : 'success'}
                                onClick={() => onToggleStatus?.(row)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: row.isActive 
                                      ? alpha('#ef4444', 0.1)
                                      : alpha('#10b981', 0.1),
                                  },
                                }}
                              >
                                {row.isActive ? (
                                  <CancelOutlinedIcon fontSize="small" />
                                ) : (
                                  <CheckCircleOutlineIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                size="small"
                                onClick={() => onEdit?.(row)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha('#2563eb', 0.1),
                                  },
                                }}
                              >
                                <EditOutlinedIcon fontSize="small" />
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
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No individual accounts found.
                      </Typography>
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

export default IndividualTableList;

