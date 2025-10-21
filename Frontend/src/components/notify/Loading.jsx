import React from 'react';
import { Box, CircularProgress, Backdrop } from '@mui/material';
import { useSelector } from 'react-redux';

const Loading = () => {
  const { loading } = useSelector((state) => state.ui);

  if (!loading) return null;

  return (
    <Backdrop
      open={loading}
      sx={{
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            color: 'primary.main',
           animation: 'spin 1s linear infinite',
         }}
       />
     </Box>
   </Backdrop>
 );
};

export default Loading;
