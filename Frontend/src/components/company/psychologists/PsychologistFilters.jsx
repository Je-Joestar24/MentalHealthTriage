import React, { useCallback, useState, useEffect } from 'react';
import { Box, Stack, TextField, MenuItem, Button, InputAdornment, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

export default function PsychologistFilters({ defaultValues = {}, onChange, onReset }) {
  const [local, setLocal] = useState({
    search: defaultValues.search || '',
    isActive: defaultValues.isActive || '',
    sortBy: defaultValues.sortBy || 'createdAt',
    sortOrder: defaultValues.sortOrder || 'desc',
  });

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      search: defaultValues.search || '',
      isActive: defaultValues.isActive || '',
      sortBy: defaultValues.sortBy || 'createdAt',
      sortOrder: defaultValues.sortOrder || 'desc',
    }));
  }, [defaultValues.search, defaultValues.isActive, defaultValues.sortBy, defaultValues.sortOrder]);

  const handleChange = useCallback((key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  }, [local, onChange]);

  const handleReset = useCallback(() => {
    const defaults = {
      search: '',
      isActive: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocal(defaults);
    onReset?.(defaults);
  }, [onReset]);

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
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
            label="Status"
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
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="createdAt">Created Date</MenuItem>
            <MenuItem value="isActive">Status</MenuItem>
            <MenuItem value="specialization">Specialization</MenuItem>
            <MenuItem value="experience">Experience</MenuItem>
          </TextField>

          <TextField
            select
            label="Order"
            value={local.sortOrder}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
            size="small"
            sx={{
              minWidth: 120,
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
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            size="small"
            onClick={handleReset}
            startIcon={<RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              minWidth: 100,
              fontSize: '0.85rem',
              textTransform: 'none',
              py: 0.8,
            }}
          >
            Reset
          </Button>
        </Stack>
      </Box>
    </Fade>
  );
}

