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
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const EmptyState = () => (
  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      No psychologists found
    </Typography>
    <Typography variant="body2">
      Psychologists will appear here once they are added to your organization.
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

const CompanyDetailsPsychologists = ({ psychologists = [], loading }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card
      elevation={0}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Psychologists
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={`${psychologists.length} ${psychologists.length === 1 ? 'psychologist' : 'psychologists'}`}
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
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Specialization</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Experience</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <LoadingState />
          ) : psychologists.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {psychologists.map((psychologist) => (
                <TableRow
                  key={psychologist._id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {getInitials(psychologist.name)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {psychologist.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {psychologist.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {psychologist.specialization || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {psychologist.experience ? `${psychologist.experience} ${psychologist.experience === 1 ? 'year' : 'years'}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={psychologist.isActive ? <CheckCircleOutlineIcon /> : <CancelOutlinedIcon />}
                      label={psychologist.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={psychologist.isActive ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
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

export default CompanyDetailsPsychologists;

