import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  ButtonBase,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem
} from '@mui/material';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import useUser from '../../hooks/userHook';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <ButtonBase
    component={NavLink}
    to={to}
    onClick={onClick}
    sx={{
      width: '100%',
      borderRadius: 2,
      px: 2,
      py: 1.5,
      justifyContent: 'flex-start',
      transition: 'all 200ms ease',
      mb: 0.5,
      '&.active': {
        bgcolor: (theme) => theme.palette.primary.main,
        color: 'white',
        '& .MuiSvgIcon-root': {
          color: 'white',
        },
      },
      '&:hover': {
        bgcolor: (theme) => theme.palette.action.hover,
        transform: 'translateX(4px)',
      },
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Icon sx={{ fontSize: 20 }} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>{label}</Typography>
    </Stack>
  </ButtonBase>
);

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useUser()

  const organizationNavItems = [
    { to: "/company/dashboard", icon: SpaceDashboardOutlinedIcon, label: "Dashboard" },
    { to: "/company/details", icon: InfoOutlinedIcon, label: "Company Details" },
    { to: "/company/diagnosis/list", icon: MedicalInformationOutlinedIcon, label: "Diagnosis List" },
    { to: "/company/psychologist/list", icon: PsychologyAltOutlinedIcon, label: "Psychologists List" },
    { to: "/company/patients", icon: GroupsOutlinedIcon, label: "Clients" },
    { to: "/company/subscription", icon: CardMembershipOutlinedIcon, label: "Subscription" },
  ];

  
  const psychoNavItems = [
    { to: "/psychologist/dashboard", icon: SpaceDashboardOutlinedIcon, label: "Dashboard" },
    { to: "/psychologist/triage", icon: MonitorHeartOutlinedIcon, label: "Triage Client" },
    { to: "/psychologist/patients", icon: GroupsOutlinedIcon, label: "Clients" },
    { to: "/psychologist/diagnosis/list", icon: MedicalInformationOutlinedIcon, label: "Diagnosis List" },
  ];

  const navigationItems = [
    { to: "/super/dashboard", icon: SpaceDashboardOutlinedIcon, label: "Dashboard" },
    { to: "/super/organizations", icon: BusinessOutlinedIcon, label: "Organizations" },
    { to: "/super/diagnosis", icon: MedicalInformationOutlinedIcon, label: "Diagnosis List" },
    { to: "/super/accounts", icon: PeopleAltOutlinedIcon, label: "Individual Accounts" },
  ];

  const sidebarContent = (
    <Box sx={{
      width: 280,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      borderRight: (theme) => `1px solid ${theme.palette.divider}`,
    }}>
      {/* Navigation Items */}
      <Box sx={{ p: 3, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: 1,
            mb: 2,
            display: 'block'
          }}
        >
          Navigation
        </Typography>

        <Stack spacing={0.5}>
          {user?.role == 'super_admin' && (navigationItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={isMobile ? onMobileClose : undefined}
            />
          )))}
          {user?.role == 'company_admin' && (organizationNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={isMobile ? onMobileClose : undefined}
            />
          )))}
          {user?.role == 'psychologist' && (psychoNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={isMobile ? onMobileClose : undefined}
            />
          )))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          HealthTriage {`${user?.role?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`} Panel
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            border: 'none',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        position: 'fixed',
        top: 64, // Below the header
        left: 0,
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        zIndex: theme.zIndex.drawer,
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default Sidebar;


