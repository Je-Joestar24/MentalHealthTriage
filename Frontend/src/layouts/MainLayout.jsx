import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import useUser from '../hooks/userHook';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/sidebar/sidebar';
import NavHeader from '../components/sidebar/NavHeader';
import Loading from '../components/notify/Loading';
import Response from '../components/notify/Response';
import GlobalDialog from '../components/dialogbox/GlobalDialog';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';

const MainLayout = () => {
  const { logout, loading, user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    await logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'grey.50', overflow: 'hidden' }}>
      {/* NavHeader - spans full width */}
      <NavHeader
        onLogout={handleLogout}
        onOpenProfile={() => setProfileOpen(true)}
        user={user}
      />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 20,
              left: 20,
              zIndex: theme.zIndex.drawer + 2,
              bgcolor: 'background.paper',
              boxShadow: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'scale(1.05)',
              },
              transition: 'all 200ms ease',
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Sidebar */}
        <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
        
        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            width: { md: `calc(100% - 280px)` },
            height: 'calc(100vh - 64px)',
            bgcolor: 'grey.50',
            overflow: 'auto',
            ml: { md: '280px' }, // Add left margin to account for fixed sidebar
          }}
        >
          <Box sx={{ p: 3 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
      
      <Loading />
      <Response />
      <GlobalDialog />
      <ProfileSidebar
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
      />
    </Box>
  );
};

export default MainLayout;
