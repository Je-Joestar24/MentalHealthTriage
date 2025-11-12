import React from 'react';
import { Stack, Pagination as MuiPagination, Typography, Fade } from '@mui/material';

const PatientsPagination = ({ page = 1, pages = 1, total = 0, onChange }) => {
  if (!pages) return null;

  const showControls = pages > 1;

  return (
    <Fade in timeout={300}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ py: 2, px: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          {showControls
            ? `Showing page ${page} of ${pages} • Total patients: ${total}`
            : `Total patients: ${total}`}
        </Typography>
        {showControls && (
          <MuiPagination
            count={pages}
            page={page}
            shape="rounded"
            color="primary"
            size="small"
            onChange={(_, value) => onChange?.(value)}
          />
        )}
      </Stack>
    </Fade>
  );
};

export default PatientsPagination;


