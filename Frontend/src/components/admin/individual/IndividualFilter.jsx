import React, { useCallback, useState, useEffect } from 'react';
import { Box, Stack, TextField, MenuItem, Button, InputAdornment, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function IndividualFilter({ defaultValues = {}, onChange, onReset }) {
  const [local, setLocal] = useState({
    search: defaultValues.search || '',
    status: defaultValues.status || '',
    isActive: defaultValues.isActive || '',
    sortBy: defaultValues.sortBy || 'createdAt',
    sortOrder: defaultValues.sortOrder || 'desc',
  });

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      search: defaultValues.search || '',
      status: defaultValues.status || '',
      isActive: defaultValues.isActive || '',
      sortBy: defaultValues.sortBy || 'createdAt',
      sortOrder: defaultValues.sortOrder || 'desc',
    }));
  }, [defaultValues.search, defaultValues.status, defaultValues.isActive, defaultValues.sortBy, defaultValues.sortOrder]);

  const handleChange = useCallback((key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  }, [local, onChange]);

  const handleReset = useCallback(() => {
    const defaults = { 
      search: '', 
      status: '', 
      isActive: '', 
      sortBy: 'createdAt', 
      sortOrder: 'desc' 
    };
    setLocal(defaults);
    onReset?.(defaults);
  }, [onReset]);

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          p: 1,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <TextField
            fullWidth
            size="small"
            value={local.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by name or email"
            InputProps={{
              sx: { fontSize: '0.85rem', py: 0.3 },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="Subscription Status"
            value={local.status}
            onChange={(e) => handleChange('status', e.target.value)}
            size="small"
            sx={{
              minWidth: 160,
              '& .MuiInputBase-input': {
                fontSize: '0.85rem',
                py: 0.3,
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.8rem',
                top: '-4px',
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </TextField>

          <TextField
            select
            label="Account Status"
            value={local.isActive}
            onChange={(e) => handleChange('isActive', e.target.value)}
            size="small"
            sx={{
              minWidth: 140,
              '& .MuiInputBase-input': {
                fontSize: '0.85rem',
                py: 0.3,
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.8rem',
                top: '-4px',
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>

          <TextField
            select
            label="Sort by"
            value={local.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            size="small"
            sx={{
              minWidth: 130,
              '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.3 },
              '& .MuiInputLabel-root': { fontSize: '0.8rem' },
            }}
          >
            <MenuItem value="createdAt">Created date</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="subscriptionEndDate">End date</MenuItem>
          </TextField>

          <TextField
            select
            label="Order"
            value={local.sortOrder}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
            size="small"
            sx={{
              minWidth: 100,
              '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.3 },
              '& .MuiInputLabel-root': { fontSize: '0.8rem' },
            }}
          >
            <MenuItem value="desc">Desc</MenuItem>
            <MenuItem value="asc">Asc</MenuItem>
          </TextField>

          <Button
            size="small"
            variant="text"
            color="secondary"
            onClick={handleReset}
            sx={{
              fontSize: '0.8rem',
              textTransform: 'none',
              minWidth: 'auto',
              px: 1,
            }}
          >
            Reset
          </Button>
        </Stack>
      </Box>
    </Fade>
  );
}

