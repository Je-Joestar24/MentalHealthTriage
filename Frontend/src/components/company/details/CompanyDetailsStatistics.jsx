import React from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PeopleOutline,
  MonitorHeartOutlined,
  DescriptionOutlined,
  BusinessCenterOutlined
} from '@mui/icons-material';

const StatCard = ({ icon: Icon, title, stats, delay = 0 }) => {
  return (
    <Grid item xs={12} sm={6} md={3}>
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

const CompanyDetailsStatistics = ({ statistics, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Grid container spacing={2}>
        {/* Psychologists */}
        <StatCard
          icon={PeopleOutline}
          title="Psychologists"
          delay={0.1}
          stats={[
            { label: 'Total', value: statistics.psychologists?.total || 0 },
            { label: 'Active', value: statistics.psychologists?.active || 0 },
            { label: 'Seats Taken', value: statistics.psychologists?.seats?.taken || 0 },
            { label: 'Seats Available', value: statistics.psychologists?.seats?.available || 0 },
            { label: 'Total Seats', value: statistics.psychologists?.seats?.total || 0 },
          ]}
        />

        {/* Patients */}
        <StatCard
          icon={MonitorHeartOutlined}
          title="Patients"
          delay={0.2}
          stats={[
            { label: 'Total', value: statistics.patients?.total || 0 },
            { label: 'Active', value: statistics.patients?.active || 0 },
          ]}
        />

        {/* Diagnoses */}
        <StatCard
          icon={DescriptionOutlined}
          title="Diagnoses"
          delay={0.3}
          stats={[
            { label: 'Organization', value: statistics.diagnoses?.organization || 0 },
          ]}
        />

        {/* Triages */}
        <StatCard
          icon={BusinessCenterOutlined}
          title="Triages"
          delay={0.4}
          stats={[
            { label: 'Total', value: statistics.triages?.total || 0 },
          ]}
        />
      </Grid>
    </Box>
  );
};

export default CompanyDetailsStatistics;

