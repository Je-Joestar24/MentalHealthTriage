import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Stack, 
  Grid, 
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PeopleOutline,
  MonitorHeartOutlined,
  DescriptionOutlined,
  TrendingUp,
  AccessTime,
  AssessmentOutlined
} from '@mui/icons-material';

const MainStatCard = ({ 
  icon: Icon, 
  title,
  stats,
  delay = 0
}) => {
  return (
    <Grid item xs={12} width={'15%'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            height: '100%',
            width: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
        >
          <Stack spacing={1.5}>
            {/* Header */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon sx={{ fontSize: 22, color: 'primary.main' }} />
              <Typography
                variant="body1"
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
            </Stack>

            <Divider sx={{ my: 0.5 }} />

            {/* Stats */}
            <Stack spacing={1.25}>
              {stats.map((stat, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value || 0}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Card>
      </motion.div>
    </Grid>
  );
};

const ActivityCard = ({ title, items, delay = 0 }) => {
  // Filter out items with zero triage counts
  const filteredItems = items?.filter(item => {
    if (item.triageCount !== undefined) {
      return item.triageCount > 0;
    }
    return true; // Keep items without triageCount (like recent triages)
  }) || [];

  if (!filteredItems || filteredItems.length === 0) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            height: '100%',
            width: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={1.5}>
            <Typography
              variant="body1"
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Divider />
            <Stack spacing={1.25}>
              {filteredItems.slice(0, 5).map((item, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.name || item.patient?.name || 'N/A'}
                      </Typography>
                      {item.age && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {item.age} years old
                          {item.gender && ` • ${item.gender}`}
                        </Typography>
                      )}
                      {item.patient && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {item.patient.age} years old
                          {item.patient.gender && ` • ${item.patient.gender}`}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ ml: 1 }}>
                      {item.triageCount !== undefined && (
                        <Chip
                          label={item.triageCount}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            minWidth: 36
                          }}
                        />
                      )}
                      {item.severityLevel && (
                        <Chip
                          label={item.severityLevel}
                          size="small"
                          color={
                            item.severityLevel === 'high' ? 'error' :
                            item.severityLevel === 'moderate' ? 'warning' :
                            'success'
                          }
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            minWidth: 60
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Card>
      </motion.div>
    </Grid>
  );
};

export default function DashboardCounts({ stats, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2} sx={12}>
        {/* Patients */}
        <MainStatCard
          icon={PeopleOutline}
          title="Patients"
          delay={0.1}
          stats={[
            { label: 'Total', value: stats.patients?.total },
            { label: 'Active', value: stats.patients?.active },
            { label: 'Inactive', value: stats.patients?.inactive },
            { label: 'Deleted', value: stats.patients?.deleted },
            { label: 'Recent (30d)', value: stats.patients?.recent },
          ]}
          
        />

        {/* Triages */}
        <MainStatCard
          icon={MonitorHeartOutlined}
          title="Triages"
          delay={0.2}
          stats={[
            { label: 'Total', value: stats.triages?.total },
            { label: 'Today', value: stats.triages?.today },
            { label: 'This Week', value: stats.triages?.thisWeek },
            { label: 'This Month', value: stats.triages?.thisMonth },
            { label: 'Avg/Patient', value: stats.triages?.averagePerPatient?.toFixed(2) },
          ]}
        />

        {/* Triage Severity */}
        <MainStatCard
          icon={AssessmentOutlined}
          title="By Severity"
          delay={0.3}
          stats={[
            { label: 'Low', value: stats.triages?.bySeverity?.low },
            { label: 'Moderate', value: stats.triages?.bySeverity?.moderate },
            { label: 'High', value: stats.triages?.bySeverity?.high },
          ]}
        />

        {/* Diagnoses */}
        <MainStatCard
          icon={DescriptionOutlined}
          title="Diagnoses"
          delay={0.4}
          stats={[
            { label: 'Personal', value: stats.diagnoses?.personal },
            { label: 'Accessible', value: stats.diagnoses?.accessible },
            { label: 'Recent (30d)', value: stats.diagnoses?.recent },
          ]}
        />

        {/* Activity - Patients with Most Triages */}
        <ActivityCard
          title="Top Patients by Triages"
          items={stats.activity?.patientsWithMostTriages || []}
          delay={0.5}
        />

        {/* Activity - Recent Triages */}
        <ActivityCard
          title="Recent Triages"
          items={stats.activity?.recentTriages || []}
          delay={0.6}
        />
      </Grid>
    </Box>
  );
}

