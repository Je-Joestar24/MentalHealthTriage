import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Stack, Typography, ButtonBase, Divider, IconButton, Tooltip } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const NavItem = ({ to, icon: Icon, label }) => (
  <ButtonBase
    component={NavLink}
    to={to}
    sx={{
      width: '100%',
      borderRadius: 2,
      px: 1.5,
      py: 1,
      justifyContent: 'flex-start',
      transition: 'all 200ms ease',
      '&.active': {
        bgcolor: (theme) => theme.palette.primary.light,
        color: 'white',
      },
      '&:hover': {
        bgcolor: (theme) => theme.palette.action.hover,
      },
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Icon />
      <Typography variant="body1" sx={{ fontWeight: 600 }}>{label}</Typography>
    </Stack>
  </ButtonBase>
);

const Sidebar = ({ onLogout }) => {
  return (
    <Box sx={{
      width: 260,
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
      p: 2,
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Box component="span" sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'primary.main', display: 'inline-block' }} />
        <Typography variant="h6">MHT Admin</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1} sx={{ flex: 1 }}>
        <NavItem to="/super/dashboard" icon={DashboardOutlinedIcon} label="Dashboard" />
        <NavItem to="/super/diagnosis" icon={InsightsOutlinedIcon} label="Diagnosis list" />
        <NavItem to="/super/organizations" icon={GroupOutlinedIcon} label="Organizations" />
        <NavItem to="/super/accounts" icon={PersonOutlinedIcon} label="Individual accounts" />
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Tooltip title="Logout" placement="right">
        <IconButton color="error" onClick={onLogout} sx={{ alignSelf: 'flex-start' }}>
          <LogoutOutlinedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Sidebar;


