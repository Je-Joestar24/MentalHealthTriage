import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/header/Navbar';
import useUser from '../hooks/userHook';
import { Button } from '@mui/material';

const MainLayout = () => {
  const { logout, loading } = useUser();

  const handleLogout = async () => {
    await logout()
  }
  return (
    <div className="main-layout">
      <main>
        <Outlet />
      </main>
      <Button onClick={handleLogout}>Logout</Button>
      <footer>
        <small>© 2025 Mental Health Triage App</small>
      </footer>
    </div>
  );
};

export default MainLayout;
