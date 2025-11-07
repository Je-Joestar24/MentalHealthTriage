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
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

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

  const navigationItems = [
    { to: "/super/dashboard", icon: DashboardOutlinedIcon, label: "Dashboard" },
    { to: "/super/organizations", icon: GroupOutlinedIcon, label: "Organizations" },
    { to: "/super/diagnosis", icon: InsightsOutlinedIcon, label: "Diagnosis List" },
    { to: "/super/accounts", icon: PersonOutlinedIcon, label: "Individual Accounts" },
    /* { to: "/super/reports", icon: AssessmentOutlinedIcon, label: "Reports" }, */
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
          {navigationItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={isMobile ? onMobileClose : undefined}
            />
          ))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          HealthTriage Admin Panel
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


