import React, { useCallback } from 'react';
import { Box, Container, Stack, Typography, Button, Card, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useIndividual from '../../hooks/individualHook';
import IndividualFilter from '../../components/admin/individual/IndividualFilter';
import { motion } from 'framer-motion';
import IndividualTableList from '../../components/admin/individual/IndividualTableList';
import IndividualPagination from '../../components/admin/individual/IndividualPagination';
import { useDispatch } from 'react-redux';
import { showGlobalDialog } from '../../store/uiSlice';

const IndividualAccounts = () => {
  const dispatch = useDispatch();
  const {
    rows,
    loading,
    filters,
    pagination,
    updateFilters,
    loadIndividuals,
    extendSubscriptionMonths,
    updateIndividualStatus,
  } = useIndividual();

  const handleApplyFilters = useCallback((next) => {
    updateFilters(next);
    loadIndividuals(next);
  }, [updateFilters, loadIndividuals]);

  const handleResetFilters = useCallback((defaults) => {
    updateFilters(defaults);
    loadIndividuals(defaults);
  }, [updateFilters, loadIndividuals]);

  const handlePageChange = useCallback((page) => {
    const next = { ...filters, page };
    loadIndividuals(next);
  }, [filters, loadIndividuals]);

  const handleExtend = useCallback((row) => {
    // TODO: Open extend modal in next iteration
    console.log('Extend subscription for:', row);
  }, []);

  const handleToggleStatus = useCallback((row) => {
    const newStatus = !row.isActive;
    dispatch(showGlobalDialog({
      type: newStatus ? 'success' : 'danger',
      title: `${newStatus ? 'Activate' : 'Deactivate'} Account`,
      message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${row.name}'s account?`,
      confirmText: newStatus ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await updateIndividualStatus(row._id, newStatus);
        loadIndividuals(filters);
      },
    }));
  }, [dispatch, updateIndividualStatus, loadIndividuals, filters]);

  const handleEdit = useCallback((row) => {
    // TODO: Open edit modal in next iteration
    console.log('Edit account:', row);
  }, []);

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
            Individual Accounts
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
            Manage individual accounts, subscriptions and statuses
          </Typography>
        </Box>

        <Button
          onClick={() => {
            // TODO: Open add modal in next iteration
            console.log('Add new individual');
          }}
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
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          }}
        >
          New Individual
        </Button>
      </Stack>

      <Card elevation={0} sx={{ p: 1.5, mb: 1.5 }}>
        <IndividualFilter 
          defaultValues={filters} 
          onChange={handleApplyFilters} 
          onReset={handleResetFilters} 
        />
      </Card>

      <IndividualTableList
        rows={rows}
        loading={loading}
        onExtend={handleExtend}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEdit}
      />

      <Divider sx={{ my: 2 }} />

      <IndividualPagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        onChange={handlePageChange}
      />
    </Container>
  );
};

export default IndividualAccounts;


