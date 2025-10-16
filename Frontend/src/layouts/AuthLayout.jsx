import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { Home } from '@mui/icons-material';

const AuthLayout = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="auth-layout">
      {/* Fixed Home Button */}
      <Tooltip title="Go Back Home" arrow>
        <IconButton
          className="home-button"
          onClick={handleGoHome}
          aria-label="Go back to home page"
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(226, 232, 240, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <Home sx={{ color: 'primary.main' }} />
        </IconButton>
      </Tooltip>
      
      <Outlet />
    </div>
  );
};

export default AuthLayout;
