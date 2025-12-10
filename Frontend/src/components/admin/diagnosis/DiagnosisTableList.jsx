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
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import useUser from '../../../hooks/userHook';
import useDiagnosis from '../../../hooks/diagnosisHook';

const systemColorMap = {
  'DSM-5': 'primary',
  'ICD-10': 'secondary',
};

const typeColorMap = {
  global: 'success',
  organization: 'warning',
};

const DiagnosisTableList = ({ rows = [], loading, onEdit, onDelete }) => {
  const { user } = useUser();
  const { handleAddNote, handleViewNotes } = useDiagnosis();
  
  return (
    <Card elevation={0} sx={{ p: 1.5, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">Diagnoses</Typography>
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
                  <TableCell sx={{ py: 1 }}>System</TableCell>
                  <TableCell sx={{ py: 1 }}>Code(s)</TableCell>
                  <TableCell sx={{ py: 1 }}>Symptoms</TableCell>
                  <TableCell sx={{ py: 1 }}>Type</TableCell>
                  <TableCell sx={{ py: 1 }}>Created</TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => {
                  const initials = row.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DX';
                  const created = row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—';
                  const symptoms = Array.isArray(row.symptoms) ? row.symptoms.slice(0, 3).join(', ').replaceAll('_', ' ') : '—';
                  const hasDual = Boolean(row.dsm5Code || row.icd10Code);
                  const codeDisplay = hasDual ? (
                    <>
                      {row.dsm5Code && <Typography variant="body2">DSM-5: {row.dsm5Code}</Typography>}
                      {row.icd10Code && <Typography variant="body2">ICD-10: {row.icd10Code}</Typography>}
                    </>
                  ) : (
                    <Typography variant="body2">{row.code || '—'}</Typography>
                  );

                  return (
                    <Zoom in style={{ transitionDelay: `${idx * 25}ms` }} key={row._id || idx}>
                      <TableRow hover sx={{ transition: 'all 200ms ease', '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.06) } }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {initials}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{row.fullCriteriaSummary || row.keySymptomsSummary || row.notes || '—'}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {hasDual ? (
                            <Stack direction="column" spacing={0.5}>
                              {row.dsm5Code && (
                                <Chip size="small" color={systemColorMap['DSM-5']} label="DSM-5" />
                              )}
                              {row.icd10Code && (
                                <Chip size="small" color={systemColorMap['ICD-10']} label="ICD-10" />
                              )}
                            </Stack>
                          ) : (
                            <Chip
                              size="small"
                              color={systemColorMap[row.system] || 'default'}
                              label={row.system || '—'}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {codeDisplay}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{symptoms}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" color={typeColorMap[row.type] || 'default'} label={row.type || '—'} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{created}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {(user?.role == 'super_admin' || 
                              (user?.role == 'psychologist' && row.type == 'personal' && user?.id == row?.createdBy?._id) ||
                              (user?.role == 'company_admin' && row.type == 'organization')) && (<><Tooltip title="Edit" arrow>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit?.(row);
                                }} 
                                size="small"
                                aria-label="Edit diagnosis"
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton 
                                color="error" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete?.(row);
                                }} 
                                size="small"
                                aria-label="Delete diagnosis"
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip></>)}
                            
                            <Tooltip title="Add Note" arrow>
                              <IconButton 
                                color="primary" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (handleAddNote && typeof handleAddNote === 'function') {
                                    handleAddNote(row);
                                  }
                                }} 
                                size="small"
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: alpha('#2563eb', 0.1) 
                                  } 
                                }}
                                aria-label="Add note"
                              >
                                <NoteAddOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View Notes" arrow>
                              <IconButton 
                                color="primary" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (handleViewNotes && typeof handleViewNotes === 'function') {
                                    handleViewNotes(row);
                                  }
                                }} 
                                size="small"
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: alpha('#2563eb', 0.1) 
                                  } 
                                }}
                                aria-label="View notes"
                              >
                                <NotesOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Insights" arrow>
                              <IconButton disabled color="primary" size="small">
                                <ScienceOutlinedIcon fontSize="small" />
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
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No diagnoses found.</Typography>
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

export default DiagnosisTableList;
