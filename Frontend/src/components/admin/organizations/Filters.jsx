import React, { useCallback, useState } from 'react';
import { Box, Stack, TextField, MenuItem, Button, InputAdornment, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

export default function Filters({ defaultValues = {}, onChange, onReset }) {
    const [local, setLocal] = useState({
        search: defaultValues.search || '',
        status: defaultValues.status || 'all',
        sortBy: defaultValues.sortBy || 'createdAt',
        sortOrder: defaultValues.sortOrder || 'desc',
    });

    const handleChange = useCallback((key, value) => {
        const next = { ...local, [key]: value };
        setLocal(next);
        onChange?.(next);
    }, [local, onChange]);

    const handleReset = useCallback(() => {
        const defaults = { search: '', status: 'all', sortBy: 'createdAt', sortOrder: 'desc' };
        setLocal(defaults);
        onReset?.(defaults);
    }, [onReset]);

    return (<Fade in timeout={300}>
        <Box
            sx={{
                p: 1, // reduced from 1.5
                borderRadius: 1.5, // slightly smaller radius
                bgcolor: 'background.paper',
            }}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1} // reduced spacing between elements
                alignItems={{ xs: 'stretch', md: 'center' }}
            >
                <TextField
                    fullWidth
                    size="small"
                    value={local.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    placeholder="Search by Organization/Company name"
                    InputProps={{
                        sx: { fontSize: '0.85rem', py: 0.3 }, // smaller text and padding
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 18 }} color="action" /> {/* smaller icon */}
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    label="Status"
                    value={local.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 130,
                        '& .MuiInputBase-input': {
                            fontSize: '0.85rem',
                            py: 0.3,
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '0.8rem',
                            top: '-4px',
                        },
                    }}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
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
                    <MenuItem value="subscriptionEndDate">End date</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Order"
                    value={local.sortOrder}
                    onChange={(e) => handleChange('sortOrder', e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 100, // reduced from 120
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
};
