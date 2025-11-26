import React from 'react';
import { Box, Card, Typography, Stack, Divider, Chip, CircularProgress, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { PeopleOutline, CheckCircle, Cancel } from '@mui/icons-material';

const CompanyDashboardPsychologists = ({ psychologists, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!psychologists || !psychologists.list || psychologists.list.length === 0) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        style={{ height: '100%' }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            height: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            maxHeight: '500px',
            overflow: 'auto',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PeopleOutline sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                Psychologists ({psychologists.total})
              </Typography>
            </Stack>
            <Divider />
            <Stack spacing={1.5}>
              {psychologists.list.slice(0, 10).map((psychologist, index) => (
                <motion.div
                  key={psychologist._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                        }}
                      >
                        {getInitials(psychologist.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 0.25,
                          }}
                          noWrap
                        >
                          {psychologist.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                          }}
                          noWrap
                        >
                          {psychologist.email}
                        </Typography>
                        {psychologist.specialization && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                              mt: 0.25,
                            }}
                          >
                            {psychologist.specialization} • {psychologist.experience || 0} years
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        icon={psychologist.isActive ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
                        label={psychologist.isActive ? 'Active' : 'Inactive'}
                        color={psychologist.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 24,
                        }}
                      />
                    </Stack>
                  </Box>
                </motion.div>
              ))}
              {psychologists.list.length > 10 && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textAlign: 'center',
                    pt: 1,
                  }}
                >
                  +{psychologists.list.length - 10} more psychologists
                </Typography>
              )}
            </Stack>
          </Stack>
        </Card>
      </motion.div>
    </Box>
  );
};

export default CompanyDashboardPsychologists;

