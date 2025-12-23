import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Container, Stack, Typography, Button, Card, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PatientsFilter from '../../components/psychologist/patients/PatientsFilter';
import PatientsTableList from '../../components/psychologist/patients/PatientsTableList';
import PatientsPagination from '../../components/psychologist/patients/PatientsPagination';
import AddPatientModal from '../../components/psychologist/patients/AddPatientModal';
import EditPatientModal from '../../components/psychologist/patients/EditPatientModal';
import usePatients from '../../hooks/patientHook';
import { showGlobalDialog } from '../../store/uiSlice';

export default function PatientsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list,
    pagination,
    loading,
    filters,
    success,
    error,
    loadPatients,
    createPatient,
    updatePatient,
    softDeletePatient,
    restorePatient,
    updateFilter,
    clearAllMessages,
    resetCurrentPatient
  } = usePatients();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
    return () => {
      resetCurrentPatient();
      clearAllMessages();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltersChange = useCallback(
    (nextFilters) => {
      updateFilter(nextFilters);
      loadPatients(nextFilters);
    },
    [loadPatients, updateFilter]
  );

  const handlePageChange = useCallback(
    (page) => {
      const next = { ...filters, page };
      updateFilter({ page });
      loadPatients(next);
    },
    [filters, loadPatients, updateFilter]
  );

  const handleCreatePatient = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setAddModalOpen(false);
  }, []);

  const handleCreated = useCallback(() => {
    loadPatients(filters);
  }, [filters, loadPatients]);

  const handleViewPatient = useCallback((patient) => {
    console.log('TODO: view client', patient);
  }, []);

  const handleViewTriage = useCallback((patient) => {
    navigate(`/psychologist/patients/history/${patient._id}`);
  }, [navigate]);

  const handleEditPatient = useCallback((patient) => {
    setSelectedPatient(patient);
    setEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setSelectedPatient(null);
  }, []);

  const handleUpdated = useCallback(() => {
    loadPatients(filters);
  }, [filters, loadPatients]);

  // Handlers that only open the GlobalDialog - the actual action happens in onConfirm callback
  const handleDeletePatient = useCallback(
    (patient) => {
      // Only opens the dialog - does NOT perform the delete action
      dispatch(
        showGlobalDialog({
          type: 'danger',
          title: 'Archive Client',
          message: `Are you sure you want to archive "${patient.name}"? This action can be undone later.`,
          confirmText: 'Archive',
          cancelText: 'Cancel',
          // The actual delete action only happens when user clicks "Archive" in the dialog
          onConfirm: async () => {
            const result = await softDeletePatient(patient._id);
            if (result?.meta?.requestStatus === 'fulfilled') {
              loadPatients(filters);
            }
          }
        })
      );
    },
    [dispatch, filters, loadPatients, softDeletePatient]
  );

  const handleRestorePatient = useCallback(
    (patient) => {
      // Only opens the dialog - does NOT perform the restore action
      dispatch(
        showGlobalDialog({
          type: 'info',
          title: 'Restore Client',
          message: `Are you sure you want to restore "${patient.name}"? The client will be active again.`,
          confirmText: 'Restore',
          cancelText: 'Cancel',
          // The actual restore action only happens when user clicks "Restore" in the dialog
          onConfirm: async () => {
            const result = await restorePatient(patient._id);
            if (result?.meta?.requestStatus === 'fulfilled') {
              loadPatients(filters);
            }
          }
        })
      );
    },
    [dispatch, filters, loadPatients, restorePatient]
  );

  const appliedFiltersSummary = useMemo(() => {
    const summary = [];
    if (filters.search) summary.push(`Search: "${filters.search}"`);
    if (filters.status) summary.push(`Status: ${filters.status}`);
    if (filters.includeDeleted === 'true') summary.push('Showing archived');
    if (filters.sortBy && (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc')) {
      const sortLabel = filters.sortBy === 'name' ? 'Name' : 'Created date';
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
              mb: 0.3
            }}
          >
            Clients
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              letterSpacing: 0.2,
              opacity: 0.8
            }}
          >
            Manage and triage your clients
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={() => loadPatients(filters)}
            variant="outlined"
            startIcon={<RefreshOutlinedIcon sx={{ fontSize: 18 }} />}
            component={motion.button}
            whileHover={{
              scale: 1.02
            }}
            whileTap={{ scale: 0.98 }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 1.5,
              px: 2,
              py: 0.8,
              minHeight: 36
            }}
          >
            Refresh
          </Button>
          <Button
            onClick={handleCreatePatient}
            variant="contained"
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
            component={motion.button}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
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
                transform: 'translateY(-1px)'
              }
            }}
          >
            New client
          </Button>
        </Stack>
      </Stack>

      <Card elevation={0} sx={{ p: 1.5, mb: 1.5 }}>
        <PatientsFilter filters={filters} onChange={handleFiltersChange} onReset={handleFiltersChange} />
        {appliedFiltersSummary.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              Applied filters: {appliedFiltersSummary.join(' • ')}
            </Typography>
          </>
        )}
      </Card>

      <PatientsTableList
        rows={list}
        loading={loading}
        onViewPatient={handleViewPatient}
        onViewTriage={handleViewTriage}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
        onRestore={handleRestorePatient}
      />
      <PatientsPagination
        page={pagination.currentPage}
        pages={pagination.totalPages}
        total={pagination.totalItems}
        onChange={handlePageChange}
      />

      <AddPatientModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onCreated={handleCreated}
      />

      <EditPatientModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        data={selectedPatient}
        onUpdated={handleUpdated}
      />
    </Container>
  );
}