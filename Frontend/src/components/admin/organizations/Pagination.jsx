import React from 'react';
import { Stack, Pagination as MuiPagination, Typography, Fade } from '@mui/material';

const Pagination = ({ page = 1, pages = 0, total = 0, onChange }) => {
  if (!pages || Number.isNaN(pages)) return null;
  return (
    <Fade in timeout={300}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ py: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Total: {total}
        </Typography>
        <MuiPagination
          count={pages}
          page={page}
          shape="rounded"
          onChange={(_, value) => onChange?.(value)}
          color="primary"
        />
      </Stack>
    </Fade>
  );
};

export default Pagination;


