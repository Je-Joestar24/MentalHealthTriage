import React from 'react';
import { Stack, Pagination as MuiPagination, Typography, Fade } from '@mui/material';

const IndividualPagination = ({ page = 1, pages = 0, total = 0, onChange }) => {
  if (!pages || Number.isNaN(pages)) return null;
  
  return (
    <Fade in timeout={300}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ py: 1.5 }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
          Total: {total} account{total !== 1 ? 's' : ''}
        </Typography>
        <MuiPagination
          count={pages}
          page={page}
          shape="rounded"
          onChange={(_, value) => onChange?.(value)}
          color="primary"
          size="medium"
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '0.875rem',
              '&.Mui-selected': {
                fontWeight: 600,
              },
            },
          }}
        />
      </Stack>
    </Fade>
  );
};

export default IndividualPagination;

