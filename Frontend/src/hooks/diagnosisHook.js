import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDiagnoses,
  fetchDiagnosisById,
  createDiagnosis as createDiagnosisThunk,
  updateDiagnosis as updateDiagnosisThunk,
  deleteDiagnosis as deleteDiagnosisThunk,
  bulkImportDiagnoses as bulkImportDiagnosesThunk,
  setFilters,
  clearMessages,
  fetchSymptoms
} from '../store/diagnosisSlice';
import { setLoading, displayNotification, showGlobalDialog } from '../store/uiSlice';

const useDiagnosis = () => {
  const dispatch = useDispatch();
  const diagnosisState = useSelector((state) => state.diagnosis);

  const sanitizeFilters = useCallback((input) => {
    const next = { ...input };
    if (next.system === 'all') next.system = '';
    if (next.type === 'all') next.type = '';
    return next;
  }, []);

  const loadDiagnoses = useCallback((params = {}) => {
    const merged = { page: 1, limit: 5, ...diagnosisState.filters, ...params };
    const qp = sanitizeFilters(merged);
    dispatch(fetchDiagnoses(qp));
  }, [dispatch, diagnosisState.filters, sanitizeFilters]);

  const loadDiagnosis = useCallback((id) => {
    dispatch(fetchDiagnosisById(id));
  }, [dispatch]);

  const createDiagnosis = useCallback(async (payload) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(createDiagnosisThunk(payload));
      if (createDiagnosisThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Diagnosis created successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to create diagnosis');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateDiagnosis = useCallback(async (id, updateData) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(updateDiagnosisThunk({ id, updateData }));
      if (updateDiagnosisThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Diagnosis updated successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to update diagnosis');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteDiagnosis = useCallback(async (id) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(deleteDiagnosisThunk(id));
      if (deleteDiagnosisThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Diagnosis deleted successfully', type: 'success' }));
        // Reload diagnoses after successful deletion to sync pagination
        const currentParams = { page: diagnosisState.pagination.page, limit: diagnosisState.pagination.limit, ...diagnosisState.filters };
        await dispatch(fetchDiagnoses(sanitizeFilters(currentParams)));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to delete diagnosis');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, diagnosisState.pagination, diagnosisState.filters, sanitizeFilters]);

  const confirmDeleteDiagnosis = useCallback((diagnosis, onConfirm) => {
    dispatch(showGlobalDialog({
      type: 'danger',
      title: 'Delete Diagnosis',
      message: `Are you sure you want to delete "${diagnosis?.name || 'this diagnosis'}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        // DeleteDiagnosis now handles reload internally after successful deletion
        await deleteDiagnosis(diagnosis._id);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {}
    }));
  }, [dispatch, deleteDiagnosis]);

  const bulkImportDiagnoses = useCallback(async (bulkPayload) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(bulkImportDiagnosesThunk(bulkPayload));
      if (bulkImportDiagnosesThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Diagnoses imported successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to import diagnoses');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(sanitizeFilters(newFilters)));
  }, [dispatch, sanitizeFilters]);

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const loadSymptoms = useCallback(() => {
    dispatch(fetchSymptoms());
  }, [dispatch]);
  const symptoms = diagnosisState.symptoms;

  const pagination = diagnosisState.pagination;

  const rows = useMemo(() => diagnosisState.diagnoses || [], [diagnosisState.diagnoses]);

  useEffect(() => {
    if (!rows.length) {
      dispatch(fetchDiagnoses(sanitizeFilters({ page: 1, limit: 5, ...diagnosisState.filters })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // state
    ...diagnosisState,
    rows,
    pagination,
    symptoms,

    // actions
    loadDiagnoses,
    loadDiagnosis,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    confirmDeleteDiagnosis,
    bulkImportDiagnoses,
    updateFilters,
    clearAllMessages,
    loadSymptoms
  };
};

export default useDiagnosis;


