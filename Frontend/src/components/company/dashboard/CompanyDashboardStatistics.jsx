import React from 'react';
import { Box, Card, Typography, Stack, Divider, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import {
  PeopleOutline,
  MonitorHeartOutlined,
  DescriptionOutlined,
  BusinessCenterOutlined,
} from '@mui/icons-material';

const StatCard = ({ icon: Icon, title, stats, delay = 0 }) => {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        style={{ height: '100%' }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            height: '100%',
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
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Icon sx={{ fontSize: 22, color: 'primary.main' }} />
              <Typography
                variant="body1"
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
            </Stack>
            <Divider sx={{ my: 0.5 }} />
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
                        fontSize: '0.85rem',
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
    </Box>
  );
};

const CompanyDashboardStatistics = ({ stats, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Main Statistics Row - All 6 cards in one row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        {/* Psychologists */}
        <StatCard
          icon={BusinessCenterOutlined}
          title="Psychologists"
          delay={0.1}
          stats={[
            { label: 'Total', value: stats.psychologists?.total },
            { label: 'Active', value: stats.psychologists?.active },
            { label: 'Inactive', value: stats.psychologists?.inactive },
            { label: 'Recent (30d)', value: stats.psychologists?.recent },
            { label: 'Seats Used', value: `${stats.psychologists?.seats?.taken || 0}/${stats.psychologists?.seats?.total || 0}` },
            { label: 'Utilization', value: `${stats.psychologists?.seats?.utilization || 0}%` },
          ]}
        />

        {/* Patients */}
        <StatCard
          icon={PeopleOutline}
          title="Clients"
          delay={0.2}
          stats={[
            { label: 'Total', value: stats.patients?.total },
            { label: 'Active', value: stats.patients?.active },
            { label: 'Inactive', value: stats.patients?.inactive },
            { label: 'Deleted', value: stats.patients?.deleted },
            { label: 'Recent (30d)', value: stats.patients?.recent },
          ]}
        />

        {/* Triages */}
        <StatCard
          icon={MonitorHeartOutlined}
          title="Triages"
          delay={0.3}
          stats={[
            { label: 'Total', value: stats.triages?.total },
            { label: 'Today', value: stats.triages?.today },
            { label: 'This Week', value: stats.triages?.thisWeek },
            { label: 'This Month', value: stats.triages?.thisMonth },
            { label: 'This Year', value: stats.triages?.thisYear },
            { label: 'Avg/Client', value: stats.triages?.averagePerPatient?.toFixed(2) || 0 },
          ]}
        />

        {/* Diagnoses */}
        <StatCard
          icon={DescriptionOutlined}
          title="Diagnoses"
          delay={0.4}
          stats={[
            { label: 'Organization', value: stats.diagnoses?.organization },
            { label: 'Global', value: stats.diagnoses?.global },
            { label: 'Personal (Org)', value: stats.diagnoses?.personalFromOrg },
            { label: 'Accessible', value: stats.diagnoses?.accessible },
            { label: 'Recent (30d)', value: stats.diagnoses?.recent },
          ]}
        />

        {/* Triage Severity Breakdown */}
        <StatCard
          icon={MonitorHeartOutlined}
          title="Triage Severity"
          delay={0.5}
          stats={[
            { label: 'Low', value: stats.triages?.bySeverity?.low },
            { label: 'Moderate', value: stats.triages?.bySeverity?.moderate },
            { label: 'High', value: stats.triages?.bySeverity?.high },
          ]}
        />

        {/* Patient Demographics - Gender */}
        {stats.patients?.byGender && Object.keys(stats.patients.byGender).length > 0 && (
          <StatCard
            icon={PeopleOutline}
            title="Clients by Gender"
            delay={0.6}
            stats={Object.entries(stats.patients.byGender).map(([gender, count]) => ({
              label: gender.charAt(0).toUpperCase() + gender.slice(1),
              value: count,
            }))}
          />
        )}
      </Box>
    </Box>
  );
};

export default CompanyDashboardStatistics;

