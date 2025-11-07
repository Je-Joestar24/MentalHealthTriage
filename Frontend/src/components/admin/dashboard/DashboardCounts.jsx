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
  BusinessOutlined,
  PersonOutline,
  DescriptionOutlined,
  PeopleOutline
} from '@mui/icons-material';

const MainStatCard = ({ 
  icon: Icon, 
  title,
  stats,
  delay = 0
}) => {
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
            p: 2.5,
            height: '100%',
            minWidth: '360px',
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
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Icon sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
            </Stack>

            <Divider />

            {/* Stats */}
            <Stack spacing={1.5}>
              {stats.map((stat, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      {stat.value?.toLocaleString() || 0}
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

export default function DashboardCounts({ stats, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* Organizations */}
        <MainStatCard
          icon={BusinessOutlined}
          title="Organizations"
          delay={0.1}
          stats={[
            { label: 'Total', value: stats.organizations?.total },
            { label: 'Active', value: stats.organizations?.active },
            { label: 'Expired', value: stats.organizations?.expired },
            { label: 'Inactive', value: stats.organizations?.inactive },
          ]}
        />

        {/* Individual Accounts */}
        <MainStatCard
          icon={PersonOutline}
          title="Individual Accounts"
          delay={0.2}
          stats={[
            { label: 'Total', value: stats.individualAccounts?.total },
            { label: 'Active', value: stats.individualAccounts?.active },
            { label: 'Expired', value: stats.individualAccounts?.expired },
            { label: 'Inactive', value: stats.individualAccounts?.inactive },
          ]}
        />

        {/* Diagnoses */}
        <MainStatCard
          icon={DescriptionOutlined}
          title="Diagnoses"
          delay={0.3}
          stats={[
            { label: 'Total', value: stats.diagnoses?.total },
            { label: 'Global', value: stats.diagnoses?.global },
            { label: 'Organization', value: stats.diagnoses?.organization },
            { label: 'Personal', value: stats.diagnoses?.personal },
          ]}
        />

        {/* Users */}
        <MainStatCard
          icon={PeopleOutline}
          title="Users"
          delay={0.4}
          stats={[
            { label: 'Total Users', value: stats.users?.total },
            { label: 'Psychologists', value: stats.users?.psychologists },
            { label: 'Org-based Psychologists', value: stats.users?.organizationPsychologists },
            { label: 'Individual Psychologists', value: stats.users?.individualPsychologists },
/*             { label: 'Company Admins', value: stats.users?.companyAdmins },
            { label: 'Super Admins', value: stats.users?.superAdmins }, */
          ]}
        />
      </Grid>
    </Box>
  );
}

