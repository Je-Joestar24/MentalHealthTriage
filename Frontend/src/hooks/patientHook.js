import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPatients,
  fetchPatientById,
  createPatient as createPatientThunk,
  updatePatient as updatePatientThunk,
  softDeletePatient as softDeletePatientThunk,
  restorePatient as restorePatientThunk,
  setFilters,
  clearMessages,
  clearCurrentPatient
} from '../store/patientSlice';
import { displayNotification, setLoading as setGlobalLoading } from '../store/uiSlice';

const usePatients = () => {
  const dispatch = useDispatch();
  const patientState = useSelector((state) => state.patients);

  const loadPatients = useCallback(
    (params = {}) => {
      const merged = { ...patientState.filters, ...params };
      dispatch(setFilters(merged));
      dispatch(fetchPatients(merged));
    },
    [dispatch, patientState.filters]
  );

  const loadPatientById = useCallback(
    (id) => {
      dispatch(fetchPatientById(id));
    },
    [dispatch]
  );

  const createPatient = useCallback(
    async (payload) => {
      dispatch(setGlobalLoading(true));
      try {
        const result = await dispatch(createPatientThunk(payload));
        if (createPatientThunk.fulfilled.match(result)) {
          dispatch(displayNotification({ message: 'Patient created successfully', type: 'success' }));
        } else {
          const message =
            typeof result.payload === 'string'
              ? result.payload
              : result.payload?.message || 'Failed to create patient';
          dispatch(displayNotification({ message, type: 'error' }));
        }
        return result;
      } finally {
        dispatch(setGlobalLoading(false));
      }
    },
    [dispatch]
  );

  const updatePatient = useCallback(
    async (id, payload) => {
      dispatch(setGlobalLoading(true));
      try {
        const result = await dispatch(updatePatientThunk({ id, payload }));
        if (updatePatientThunk.fulfilled.match(result)) {
          dispatch(displayNotification({ message: 'Patient updated successfully', type: 'success' }));
        } else {
          const message =
            typeof result.payload === 'string'
              ? result.payload
              : result.payload?.message || 'Failed to update patient';
          dispatch(displayNotification({ message, type: 'error' }));
        }
        return result;
      } finally {
        dispatch(setGlobalLoading(false));
      }
    },
    [dispatch]
  );

  const softDeletePatient = useCallback(
    async (id) => {
      dispatch(setGlobalLoading(true));
      try {
        const result = await dispatch(softDeletePatientThunk(id));
        if (softDeletePatientThunk.fulfilled.match(result)) {
          dispatch(displayNotification({ message: 'Patient deleted successfully', type: 'success' }));
        } else {
          const message =
            typeof result.payload === 'string'
              ? result.payload
              : result.payload?.message || 'Failed to delete patient';
          dispatch(displayNotification({ message, type: 'error' }));
        }
        return result;
      } finally {
        dispatch(setGlobalLoading(false));
      }
    },
    [dispatch]
  );

  const restorePatient = useCallback(
    async (id) => {
      dispatch(setGlobalLoading(true));
      try {
        const result = await dispatch(restorePatientThunk(id));
        if (restorePatientThunk.fulfilled.match(result)) {
          dispatch(displayNotification({ message: 'Patient restored successfully', type: 'success' }));
        } else {
          const message =
            typeof result.payload === 'string'
              ? result.payload
              : result.payload?.message || 'Failed to restore patient';
          dispatch(displayNotification({ message, type: 'error' }));
        }
        return result;
      } finally {
        dispatch(setGlobalLoading(false));
      }
    },
    [dispatch]
  );

  const updateFilter = useCallback(
    (nextFilters) => {
      dispatch(setFilters(nextFilters));
    },
    [dispatch]
  );

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const resetCurrentPatient = useCallback(() => {
    dispatch(clearCurrentPatient());
  }, [dispatch]);

  return {
    ...patientState,
    loadPatients,
    loadPatientById,
    createPatient,
    updatePatient,
    softDeletePatient,
    restorePatient,
    updateFilter,
    clearAllMessages,
    resetCurrentPatient
  };
};

export default usePatients;


