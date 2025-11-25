import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Container, Stack, Typography, Button, Card, Divider, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import HistoryFilters from '../../components/psychologist/history/HistoryFilters';
import HistoryTableList from '../../components/psychologist/history/HistoryTableList';
import HistoryPagination from '../../components/psychologist/history/HistoryPagination';
import useTriage from '../../hooks/triageHook';
import usePatients from '../../hooks/patientHook';

export default function PatientsTriageHistory() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const {
    triageHistory,
    triageHistoryPagination,
    loading,
    getTriageHistory,
    clearHistory,
    clearAllMessages
  } = useTriage();
  const { currentPatient, loadPatientById, loading: patientLoading } = usePatients();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (!patientId) {
      navigate('/psychologist/patients');
      return;
    }

    loadPatientById(patientId);
    loadTriageHistory();

    return () => {
      clearHistory();
      clearAllMessages();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      loadTriageHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadTriageHistory = useCallback(() => {
    if (!patientId) return;
    getTriageHistory(patientId, filters);
  }, [patientId, filters, getTriageHistory]);

  const handleFiltersChange = useCallback(
    (nextFilters) => {
      setFilters((prev) => ({ ...prev, ...nextFilters, page: 1 }));
    },
    []
  );

  const handlePageChange = useCallback(
    (page) => {
      setFilters((prev) => ({ ...prev, page }));
    },
    []
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const appliedFiltersSummary = useMemo(() => {
    const summary = [];
    if (filters.search) summary.push(`Search: "${filters.search}"`);
    if (filters.sortBy && (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc')) {
      const sortLabels = {
        createdAt: 'Created date',
        updatedAt: 'Updated date',
        severityLevel: 'Severity',
        preliminaryDiagnosis: 'Diagnosis'
      };
      summary.push(`Sort: ${sortLabels[filters.sortBy] || filters.sortBy} (${filters.sortOrder || 'desc'})`);
    }
    return summary;
  }, [filters]);

  if (!patientId) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Patient Info Card */}
      {currentPatient && (
        <Card
          elevation={0}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  fontSize: '1.2rem',
                  fontWeight: 600
                }}
              >
                {currentPatient.name?.charAt(0).toUpperCase() || 'P'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 0.25 }}>
                  {currentPatient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {currentPatient.age} years old • {currentPatient.gender || 'N/A'}
                  {currentPatient.contactInfo?.email && ` • ${currentPatient.contactInfo.email}`}
                </Typography>
              </Box>
            </Stack>
            <Button
              onClick={handleBack}
              variant="outlined"
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.5,
                minHeight: 32,
                minWidth: 'auto'
              }}
            >
              Back
            </Button>
          </Stack>
        </Card>
      )}

      <Card elevation={0} sx={{ p: 1.5, mb: 1.5 }}>
        <HistoryFilters filters={filters} onChange={handleFiltersChange} onReset={handleFiltersChange} />
        {appliedFiltersSummary.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              Applied filters: {appliedFiltersSummary.join(' • ')}
            </Typography>
          </>
        )}
      </Card>

      <HistoryTableList rows={triageHistory} loading={loading || patientLoading} />
      {triageHistoryPagination && (
        <HistoryPagination
          page={triageHistoryPagination.currentPage}
          pages={triageHistoryPagination.totalPages}
          total={triageHistoryPagination.totalItems}
          onChange={handlePageChange}
        />
      )}
    </Container>
  );
}

