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

const statusColorMap = {
  active: 'success',
  expired: 'warning',
  suspended: 'error',
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
                  <TableCell sx={{ py: 1 }}>Status</TableCell>
                  <TableCell sx={{ py: 1 }}>Ends</TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
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
                          const adminEmail = typeof admin === 'object' ? (admin?.email || '') : '';
                          return (
                            <>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{adminName}</Typography>
                              <Typography variant="caption" color="text.secondary">{adminEmail || row.contactPhone || '—'}</Typography>
                            </>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.subscriptionStatus} color={statusColorMap[row.subscriptionStatus] || 'default'} />
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
                            <IconButton color="primary" onClick={() => onViewStats?.(row)}>
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
                ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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


