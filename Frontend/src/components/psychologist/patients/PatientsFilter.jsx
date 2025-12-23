import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Stack,
    TextField,
    MenuItem,
    Button,
    InputAdornment,
    Fade,
    FormControlLabel,
    Switch
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
];

const defaultState = {
    search: '',
    status: '',
    includeDeleted: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
};

const normalizeFilters = (state = defaultState) => ({
    search: state.search || '',
    status: state.status || '',
    includeDeleted: state.includeDeleted ? 'true' : 'false',
    sortBy: state.sortBy || 'createdAt',
    sortOrder: state.sortOrder || 'desc',
    page: 1
});

const PatientsFilter = ({ filters = {}, onChange, onReset }) => {
    const debounceRef = useRef();
    const [local, setLocal] = useState({
        search: filters.search || '',
        status: filters.status || '',
        includeDeleted: filters.includeDeleted === 'true',
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc'
    });

    useEffect(() => {
        setLocal({
            search: filters.search || '',
            status: filters.status || '',
            includeDeleted: filters.includeDeleted === 'true',
            sortBy: filters.sortBy || 'createdAt',
            sortOrder: filters.sortOrder || 'desc'
        });
    }, [filters.search, filters.status, filters.includeDeleted, filters.sortBy, filters.sortOrder]);

    const emitChange = useCallback((nextState, debounce = false) => {
        if (debounce) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onChange?.(normalizeFilters(nextState));
            }, 350);
        } else {
            onChange?.(normalizeFilters(nextState));
        }
    }, [onChange]);

    const handleChange = useCallback((key, value, debounce = false) => {
        setLocal((prev) => {
            const next = { ...prev, [key]: value };
            emitChange(next, debounce);
            return next;
        });
    }, [emitChange]);

    const handleReset = useCallback(() => {
        setLocal(defaultState);
        const normalized = normalizeFilters(defaultState);
        onReset?.(normalized);
        onChange?.(normalized);
    }, [onReset, onChange]);

    const isDirty = useMemo(() => {
        return (
            (filters.search || '') !== local.search ||
            (filters.status || '') !== local.status ||
            (filters.includeDeleted === 'true') !== local.includeDeleted ||
            (filters.sortBy || 'createdAt') !== local.sortBy ||
            (filters.sortOrder || 'desc') !== local.sortOrder
        );
    }, [filters, local]);

    return (
        <Fade in timeout={300}>
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper'
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'stretch', md: 'flex-end' }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        label="Search clients"
                        placeholder="Search by name, email, or phone"
                        value={local.search}
                        onChange={(e) => handleChange('search', e.target.value, true)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18 }} color="action" />
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={local.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        sx={{
                            minWidth: 180,
                            '& .MuiInputBase-input': { fontSize: '.85em' },   // input text
                            '& .MuiInputLabel-root': { fontSize: '.85em' },   // label
                            '& .MuiMenuItem-root': { fontSize: '.85em' },     // menu items
                        }}
                    >
                        {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>


                    <FormControlLabel
                        control={
                            <Switch
                                checked={local.includeDeleted}
                                onChange={(e) => handleChange('includeDeleted', e.target.checked)}
                                size="small"
                            />
                        }
                        label="Include archived"
                        componentsProps={{
                            typography: { sx: { fontSize: '.75em' } },
                        }}
                    />


                    <TextField
                        select
                        size="small"
                        label="Sort by"
                        value={local.sortBy}
                        onChange={(e) => handleChange('sortBy', e.target.value)}
                        sx={{
                            minWidth: 180,
                            '& .MuiInputBase-input': { fontSize: '.85em' },
                            '& .MuiInputLabel-root': { fontSize: '.85em' },
                            '& .MuiMenuItem-root': { fontSize: '.85em' },
                        }}
                    >
                        <MenuItem value="createdAt">Created date</MenuItem>
                        <MenuItem value="name">Name</MenuItem>
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Sort order"
                        value={local.sortOrder}
                        onChange={(e) => handleChange('sortOrder', e.target.value)}
                        sx={{
                            minWidth: 140,
                            '& .MuiInputBase-input': { fontSize: '.85em' },
                            '& .MuiInputLabel-root': { fontSize: '.85em' },
                            '& .MuiMenuItem-root': { fontSize: '.85em' },
                        }}
                    >
                        <MenuItem value="desc">Descending</MenuItem>
                        <MenuItem value="asc">Ascending</MenuItem>
                    </TextField>

                    <Stack direction="row" spacing={1} sx={{maxHeight: '2.5em'}}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            sx={{ fontSize: '.7em' }}
                            startIcon={<RefreshIcon />}
                            onClick={handleReset}
                            disabled={!isDirty}
                        >
                            Reset
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Fade>
    );
};

export default PatientsFilter;

