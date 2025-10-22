import React, { useCallback } from 'react';
import { Box, Container, Stack, Typography, Button, Card, Divider, alpha } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useOrganization from '../../hooks/organizationHook';
import Filters from '../../components/admin/organizations/Filters';
import { motion } from 'framer-motion';
import TableList from '../../components/admin/organizations/TableList';
import AddOrganizationModal from '../../components/admin/organizations/AddOrginizationModal';
import EditOrganizationModal from '../../components/admin/organizations/EditOrganizationModal';
import Pagination from '../../components/admin/organizations/Pagination';

const Organizations = () => {
  const {
    rows,
    loading,
    error,
    success,
    filters,
    pagination,
    updateFilters,
    loadOrganizations,
    confirmDeleteOrganization,
  } = useOrganization();

  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const handleApplyFilters = useCallback((next) => {
    updateFilters(next);
    loadOrganizations(next);
  }, [updateFilters, loadOrganizations]);

  const handleResetFilters = useCallback((defaults) => {
    updateFilters(defaults);
    loadOrganizations(defaults);
  }, [updateFilters, loadOrganizations]);

  const handlePageChange = useCallback((page) => {
    const next = { ...filters, page };
    loadOrganizations(next);
  }, [filters, loadOrganizations]);

  const handleDelete = useCallback((row) => {
    confirmDeleteOrganization(row, () => {
      loadOrganizations(filters);
    });
  }, [confirmDeleteOrganization, loadOrganizations, filters]);

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
            Organizations
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
            Manage organizations, subscriptions and statuses
          </Typography>
        </Box>

        <Button
        onClick={() => setOpenAdd(true)}
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
          New organization
        </Button>
      </Stack>

      <Card elevation={0} sx={{ p: 1.5, mb: 1.5 }}>
        <Filters defaultValues={filters} onChange={handleApplyFilters} onReset={handleResetFilters} />
      </Card>

      <TableList
        rows={rows}
        loading={loading}
        onEdit={(row) => { setSelected(row); setOpenEdit(true); }}
        onDelete={handleDelete}
        onViewStats={(row) => console.log('Stats', row)}
      />

      <Divider sx={{ my: 2 }} />

      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        onChange={handlePageChange}
      />

      <AddOrganizationModal open={openAdd} onClose={() => setOpenAdd(false)} />
      <EditOrganizationModal open={openEdit} onClose={() => setOpenEdit(false)} organization={selected} />
    </Container>
  );
};

export default Organizations;


