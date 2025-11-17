import React, { useCallback, useEffect } from 'react';
import { Container, Box, Stack, Typography, Card } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PatientsFilter from '../patients/PatientsFilter';
import PatientsPagination from '../patients/PatientsPagination';
import TriagePatientTableList from './TriagePatientTableList';
import usePatients from '../../../hooks/patientHook';

export default function SelectPatients() {
  const navigate = useNavigate();
  const {
    list,
    pagination,
    loading,
    filters,
    loadPatients,
    updateFilter,
    clearAllMessages,
    resetCurrentPatient
  } = usePatients();

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

  const handleSelectPatient = useCallback(
    (patient) => {
      navigate(`/psychologist/triage/${patient._id}`);
    },
    [navigate]
  );

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
            Select Patient for Triage
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
            Choose a patient to begin triage assessment
          </Typography>
        </Box>
      </Stack>

      <Card elevation={0} sx={{ p: 1.5, mb: 1.5 }}>
        <PatientsFilter filters={filters} onChange={handleFiltersChange} onReset={handleFiltersChange} />
      </Card>

      <TriagePatientTableList
        rows={list}
        loading={loading}
        onSelectPatient={handleSelectPatient}
      />

      <PatientsPagination
        page={pagination.currentPage}
        pages={pagination.totalPages}
        total={pagination.totalItems}
        onChange={handlePageChange}
      />
    </Container>
  );
}

