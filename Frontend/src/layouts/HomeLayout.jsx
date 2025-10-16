import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/header/Navbar';

const HomeLayout = () => {
  return (
    <div className="home-layout">
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

export default HomeLayout;
