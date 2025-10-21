import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/header/Navbar';
import useUser from '../hooks/userHook';
import { Box } from '@mui/material';
import Sidebar from '../components/sidebar/sidebar';
import Loading from '../components/notify/Loading';
import Response from '../components/notify/Response';

const MainLayout = () => {
  const { logout, loading } = useUser();

  const handleLogout = async () => {
    await logout()
  }
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onLogout={handleLogout} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Loading />
      <Response />
    </Box>
  );
};

export default MainLayout;
