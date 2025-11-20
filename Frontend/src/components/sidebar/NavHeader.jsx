import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Person,
  KeyboardArrowDown,
  BusinessOutlined
} from '@mui/icons-material';

const NavHeader = ({ onLogout, onOpenProfile, user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const handleProfile = () => {
    handleClose();
    onOpenProfile?.();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: 64 }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            component="span" 
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '8px', 
              bgcolor: 'primary.main', 
              display: 'inline-block' 
            }} 
          />
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '1.1rem', md: '1.5rem' }
            }}
          >
            HealthTriage
          </Typography>
        </Box>

        {/* Profile Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: 'action.hover',
              '&:hover': {
                bgcolor: 'action.selected',
              },
              transition: 'all 200ms ease'
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.875rem'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            {!isMobile && (
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
                  {user?.email || 'user@example.com'}
                </Typography>
                {user?.organization?.name && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      lineHeight: 1.2,
                      fontSize: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.25
                    }}
                  >
                    <BusinessOutlined sx={{ fontSize: 12 }} />
                    {user.organization.name}
                  </Typography>
                )}
              </Box>
            )}
            <KeyboardArrowDown sx={{ fontSize: 16, color: 'text.secondary' }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                minWidth: 200,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User Info Header */}
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '1rem'
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user?.name || 'User Name'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {user?.email || 'user@example.com'}
                  </Typography>
                  {user?.organization?.name && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 0.25
                      }}
                    >
                      <BusinessOutlined sx={{ fontSize: 12 }} />
                      {user.organization.name}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
            
            <Divider />
            
            {/* Menu Items */}
            <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavHeader;