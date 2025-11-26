import React from 'react';
import { Box, Card, Typography, Stack, Divider, Chip, CircularProgress, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { MonitorHeartOutlined, PersonOutline, AccessTime } from '@mui/icons-material';

const CompanyDashboardTriage = ({ activity, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!activity) {
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

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const recentTriages = activity.recentTriages || [];
  const topPsychologists = activity.topPsychologistsByTriages || [];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}
    >
      {/* Recent Triages */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
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
                <MonitorHeartOutlined sx={{ fontSize: 24, color: 'primary.main' }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Recent Triages
                </Typography>
              </Stack>
              <Divider />
              {recentTriages.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    textAlign: 'center',
                    py: 2,
                  }}
                >
                  No triages yet
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {recentTriages.map((triage, index) => (
                    <motion.div
                      key={triage._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
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
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: 'secondary.main',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {triage.patient ? getInitials(triage.patient.name) : '?'}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'text.primary',
                                  }}
                                >
                                  {triage.patient?.name || 'Unknown Patient'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.7rem',
                                    color: 'text.secondary',
                                  }}
                                >
                                  {triage.psychologist?.name || 'Unknown Psychologist'}
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              label={triage.severityLevel?.toUpperCase()}
                              color={getSeverityColor(triage.severityLevel)}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: 22,
                              }}
                            />
                          </Stack>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                color: 'text.secondary',
                              }}
                            >
                              {formatDate(triage.createdAt)}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                color: 'text.secondary',
                                ml: 'auto',
                              }}
                            >
                              {triage.symptomsCount || 0} symptoms
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        </motion.div>
      </Box>

      {/* Top Psychologists by Triages */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
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
                <PersonOutline sx={{ fontSize: 24, color: 'primary.main' }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Top Psychologists
                </Typography>
              </Stack>
              <Divider />
              {topPsychologists.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    textAlign: 'center',
                    py: 2,
                  }}
                >
                  No triage data yet
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {topPsychologists.map((psychologist, index) => (
                    <motion.div
                      key={psychologist.psychologistId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
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
                        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
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
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: 'text.primary',
                                }}
                              >
                                {psychologist.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.7rem',
                                  color: 'text.secondary',
                                }}
                              >
                                {psychologist.email}
                              </Typography>
                            </Box>
                          </Stack>
                          <Chip
                            label={`${psychologist.triageCount} triages`}
                            color="primary"
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
                </Stack>
              )}
            </Stack>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
};

export default CompanyDashboardTriage;

