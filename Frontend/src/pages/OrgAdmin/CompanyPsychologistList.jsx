import { useCallback, useEffect, useMemo } from 'react';
import { Box, Container, Stack, Typography, Card, Divider, Button } from '@mui/material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import PsychologistFilters from '../../components/company/psychologists/PsychologistFilters';
import PsychologistTableList from '../../components/company/psychologists/PsychologistTableList';
import PsychologistPagination from '../../components/company/psychologists/PsychologistPagination';
import usePsychologists from '../../hooks/psychologistsHook';
import { setLoading } from '../../store/uiSlice';

export default function CompanyPsychologistList() {
  const dispatch = useDispatch();
  const {
    psychologists,
    pagination,
    loading,
    filters,
    error,
    loadPsychologists,
    updateFilters,
    clear,
  } = usePsychologists();

  useEffect(() => {
    dispatch(setLoading(true));
    loadPsychologists();
    return () => {
      clear();
      dispatch(setLoading(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      dispatch(setLoading(false));
    }
  }, [loading, dispatch]);

  const handleFiltersChange = useCallback(
    (nextFilters) => {
      updateFilters(nextFilters);
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (page) => {
      loadPsychologists({ ...filters, page });
    },
    [filters, loadPsychologists]
  );

  const handleRefresh = useCallback(() => {
    loadPsychologists(filters);
  }, [filters, loadPsychologists]);

  // Placeholder handlers for CRUD operations
  const handleAddPsychologist = useCallback(() => {
    // TODO: Implement add psychologist functionality
    console.log('Add psychologist - Coming soon');
  }, []);

  const handleEditPsychologist = useCallback((psychologist) => {
    // TODO: Implement edit psychologist functionality
    console.log('Edit psychologist:', psychologist);
  }, []);

  const handleDeletePsychologist = useCallback((psychologist) => {
    // TODO: Implement delete psychologist functionality
    console.log('Delete psychologist:', psychologist);
  }, []);

  const handleViewPatients = useCallback((psychologist) => {
    // TODO: Implement view diagnosed patients functionality
    console.log('View patients for psychologist:', psychologist);
  }, []);

  const appliedFiltersSummary = useMemo(() => {
    const summary = [];
    if (filters.search) summary.push(`Search: "${filters.search}"`);
    if (filters.isActive) {
      summary.push(`Status: ${filters.isActive === 'true' ? 'Active' : 'Inactive'}`);
    }
    if (filters.sortBy && (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc')) {
      const sortLabels = {
        name: 'Name',
        email: 'Email',
        createdAt: 'Created date',
        isActive: 'Status',
        specialization: 'Specialization',
        experience: 'Experience',
      };
      const sortLabel = sortLabels[filters.sortBy] || filters.sortBy;
      summary.push(`Sort: ${sortLabel} (${filters.sortOrder || 'desc'})`);
    }
    return summary;
  }, [filters]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        component={motion.div}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mb: 2.5,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'text.primary',
              mb: 0.3,
            }}
          >
            Psychologists
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              letterSpacing: 0.2,
              opacity: 0.8,
            }}
          >
            View and manage organization psychologists
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={handleAddPsychologist}
            variant="contained"
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
            component={motion.button}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
            whileTap={{ scale: 0.98 }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 1.5,
              px: 2,
              py: 0.8,
              minHeight: 36,
              transition: 'all 0.2s ease',
            }}
          >
            New Psychologist
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outlined"
            startIcon={<RefreshOutlinedIcon sx={{ fontSize: 18 }} />}
            component={motion.button}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
            }}
            whileTap={{ scale: 0.98 }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 1.5,
              px: 2,
              py: 0.8,
              minHeight: 36,
              transition: 'all 0.2s ease',
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Card elevation={0} sx={{ p: 1.5, mb: 1.5 }}>
        <PsychologistFilters
          defaultValues={filters}
          onChange={handleFiltersChange}
          onReset={(defaults) => {
            updateFilters(defaults);
            loadPsychologists(defaults);
          }}
        />
        {appliedFiltersSummary.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Applied filters: {appliedFiltersSummary.join(' • ')}
            </Typography>
          </>
        )}
      </Card>

      {error && (
        <Box
          sx={{
            p: 2,
            mb: 1.5,
            borderRadius: 1.5,
            bgcolor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      <PsychologistTableList
        rows={psychologists}
        loading={loading}
        onEdit={handleEditPsychologist}
        onDelete={handleDeletePsychologist}
        onViewPatients={handleViewPatients}
      />

      <PsychologistPagination
        page={pagination.currentPage}
        pages={pagination.totalPages}
        total={pagination.totalItems}
        onChange={handlePageChange}
      />
    </Container>
  );
}
