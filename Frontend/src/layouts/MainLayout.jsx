import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/header/Navbar';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer>
        <small>© 2025 Mental Health Triage App</small>
      </footer>
    </div>
  );
};

export default MainLayout;
