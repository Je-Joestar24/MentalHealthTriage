import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  matchDiagnoses as matchDiagnosesThunk,
  createTriage as createTriageThunk,
  getTriageHistory as getTriageHistoryThunk,
  clearMatchedDiagnoses,
  clearCurrentTriage,
  clearMessages,
  clearTriageHistory,
  setLoading
} from '../store/triageSlice';
import { displayNotification, setLoading as setGlobalLoading } from '../store/uiSlice';

const useTriage = () => {
  const dispatch = useDispatch();
  const triageState = useSelector((state) => state.triage);

  /**
   * Match diagnoses based on symptoms
   * @param {Array<string>} symptoms - Array of symptom strings (optional if showAll=true)
   * @param {string} system - Optional: 'DSM-5' or 'ICD-10'
   * @param {Object} queryParams - Optional: { page, limit, showAll }
   */
  const matchDiagnoses = useCallback(
    async (symptoms = [], system = null, queryParams = {}) => {
      // Allow empty symptoms if showAll is true
      if (!queryParams.showAll && (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0)) {
        dispatch(displayNotification({ 
          message: 'Please provide at least one symptom', 
          type: 'warning' 
        }));
        return { success: false, error: 'No symptoms provided' };
      }

      const result = await dispatch(matchDiagnosesThunk({ symptoms, system, queryParams }));
      return result;
    },
    [dispatch]
  );

  /**
   * Create a new triage record
   * @param {string} patientId - Patient ID
   * @param {Object} triageData - Triage data
   */
  const createTriage = useCallback(
    async (patientId, triageData) => {
      if (!patientId) {
        dispatch(displayNotification({ 
          message: 'Client ID is required', 
          type: 'error' 
        }));
        return { success: false, error: 'Client ID is required' };
      }

      if (!triageData.severityLevel) {
        dispatch(displayNotification({ 
          message: 'Severity level is required', 
          type: 'error' 
        }));
        return { success: false, error: 'Severity level is required' };
      }

      if (!Array.isArray(triageData.symptoms)) {
        dispatch(displayNotification({ 
          message: 'Symptoms must be an array', 
          type: 'error' 
        }));
        return { success: false, error: 'Symptoms must be an array' };
      }

      dispatch(setGlobalLoading(true));
      try {
        const result = await dispatch(createTriageThunk({ patientId, triageData }));
        return result;
      } finally {
        dispatch(setGlobalLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Clear matched diagnoses
   */
  const clearMatched = useCallback(() => {
    dispatch(clearMatchedDiagnoses());
  }, [dispatch]);

  /**
   * Clear current triage
   */
  const clearTriage = useCallback(() => {
    dispatch(clearCurrentTriage());
  }, [dispatch]);

  /**
   * Get triage history for a patient
   * @param {string} patientId - Patient ID
   * @param {Object} queryParams - Query parameters (page, limit, search, sortBy, sortOrder)
   */
  const getTriageHistory = useCallback(
    async (patientId, queryParams = {}) => {
      if (!patientId) {
        dispatch(displayNotification({ 
          message: 'Client ID is required', 
          type: 'error' 
        }));
        return { success: false, error: 'Client ID is required' };
      }

      const result = await dispatch(getTriageHistoryThunk({ patientId, queryParams }));
      return result;
    },
    [dispatch]
  );

  /**
   * Clear all messages
   */
  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  /**
   * Clear triage history
   */
  const clearHistory = useCallback(() => {
    dispatch(clearTriageHistory());
  }, [dispatch]);

  return {
    // State
    matchedDiagnoses: triageState.matchedDiagnoses,
    matchCount: triageState.matchCount,
    matchQuery: triageState.matchQuery,
    matchPagination: triageState.matchPagination,
    currentTriage: triageState.currentTriage,
    triageHistory: triageState.triageHistory,
    triageHistoryPagination: triageState.triageHistoryPagination,
    triageHistoryCount: triageState.triageHistoryCount,
    loading: triageState.loading,
    error: triageState.error,
    success: triageState.success,
    
    // Actions
    matchDiagnoses,
    createTriage,
    getTriageHistory,
    clearMatched,
    clearTriage,
    clearHistory,
    clearAllMessages
  };
};

export default useTriage;

