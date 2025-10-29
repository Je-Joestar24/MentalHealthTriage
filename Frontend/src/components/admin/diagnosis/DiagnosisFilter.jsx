import React, { useCallback, useState, useEffect } from 'react';
import { Box, Stack, TextField, MenuItem, InputAdornment, Button, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function DiagnosisFilter({ defaultValues = {}, onChange, onReset }) {
  const [local, setLocal] = useState({
    search: defaultValues.search || '',
    system: defaultValues.system || 'all',
    type: defaultValues.type || 'all',
    sortBy: defaultValues.sortBy || 'createdAt',
    sortOrder: defaultValues.sortOrder || 'desc',
  });

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      search: defaultValues.search || '',
      system: defaultValues.system || 'all',
      type: defaultValues.type || 'all',
      sortBy: defaultValues.sortBy || 'createdAt',
      sortOrder: defaultValues.sortOrder || 'desc',
    }));
  }, [defaultValues.search, defaultValues.system, defaultValues.type, defaultValues.sortBy, defaultValues.sortOrder]);

  const handleChange = useCallback((key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  }, [local, onChange]);

  const handleReset = useCallback(() => {
    const defaults = { search: '', system: 'all', type: 'all', sortBy: 'createdAt', sortOrder: 'desc' };
    setLocal(defaults);
    onReset?.(defaults);
  }, [onReset]);

  return (
    <Fade in timeout={300}>
      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            fullWidth
            size="small"
            value={local.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by name, code, or symptom"
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
            label="System"
            value={local.system}
            onChange={(e) => handleChange('system', e.target.value)}
            size="small"
            sx={{ minWidth: 140, '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.3 }, '& .MuiInputLabel-root': { fontSize: '0.8rem', top: '-4px' } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="DSM-5">DSM-5</MenuItem>
            <MenuItem value="ICD-10">ICD-10</MenuItem>
          </TextField>

          <TextField
            select
            label="Type"
            value={local.type}
            onChange={(e) => handleChange('type', e.target.value)}
            size="small"
            sx={{ minWidth: 130, '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.3 }, '& .MuiInputLabel-root': { fontSize: '0.8rem', top: '-4px' } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="global">Global</MenuItem>
            <MenuItem value="organization">Organization</MenuItem>
          </TextField>

          <TextField
            select
            label="Sort by"
            value={local.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            size="small"
            sx={{ minWidth: 140, '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.3 }, '& .MuiInputLabel-root': { fontSize: '0.8rem' } }}
          >
            <MenuItem value="createdAt">Created date</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="code">Code</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </TextField>

          <TextField
            select
            label="Order"
            value={local.sortOrder}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
            size="small"
            sx={{ minWidth: 100, '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.3 }, '& .MuiInputLabel-root': { fontSize: '0.8rem' } }}
          >
            <MenuItem value="desc">Desc</MenuItem>
            <MenuItem value="asc">Asc</MenuItem>
          </TextField>

          <Button size="small" variant="text" color="secondary" onClick={handleReset} sx={{ fontSize: '0.8rem', textTransform: 'none', minWidth: 'auto', px: 1 }}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Fade>
  );
}
