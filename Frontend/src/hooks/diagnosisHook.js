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
  clearMessages
} from '../store/diagnosisSlice';
import { setLoading, displayNotification, showGlobalDialog } from '../store/uiSlice';

const useDiagnosis = () => {
  const dispatch = useDispatch();
  const diagnosisState = useSelector((state) => state.diagnosis);

  const loadDiagnoses = useCallback((params = {}) => {
    const qp = { page: 1, limit: 10, ...diagnosisState.filters, ...params };
    dispatch(fetchDiagnoses(qp));
  }, [dispatch, diagnosisState.filters]);

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
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to delete diagnosis');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const confirmDeleteDiagnosis = useCallback((diagnosis, onConfirm) => {
    dispatch(showGlobalDialog({
      type: 'danger',
      title: 'Delete Diagnosis',
      message: `Are you sure you want to delete "${diagnosis?.name || 'this diagnosis'}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteDiagnosis(diagnosis._id);
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
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const pagination = diagnosisState.pagination;

  const rows = useMemo(() => diagnosisState.diagnoses || [], [diagnosisState.diagnoses]);

  useEffect(() => {
    if (!rows.length) {
      dispatch(fetchDiagnoses({ page: 1, limit: 10, ...diagnosisState.filters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // state
    ...diagnosisState,
    rows,
    pagination,

    // actions
    loadDiagnoses,
    loadDiagnosis,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    confirmDeleteDiagnosis,
    bulkImportDiagnoses,
    updateFilters,
    clearAllMessages
  };
};

export default useDiagnosis;


