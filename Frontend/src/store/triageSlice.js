import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as triageService from '../services/psychologist/triageService';
import { displayNotification } from './uiSlice';

/**
 * Match diagnoses based on symptoms and triage filters
 */
export const matchDiagnoses = createAsyncThunk(
  'triage/matchDiagnoses',
  async ({ symptoms, system, queryParams, triageFilters }, { rejectWithValue, dispatch }) => {
    try {
      const result = await triageService.matchDiagnoses(symptoms, system, queryParams, triageFilters || {});
      if (!result.success) {
        // Ensure error is always a string
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : (result.error?.message || 'Failed to match diagnoses');
        dispatch(displayNotification({ 
          message: errorMessage, 
          type: 'error' 
        }));
        return rejectWithValue(errorMessage);
      }
      return result;
    } catch (error) {
      // Ensure error message is always a string
      const message = typeof error?.message === 'string' 
        ? error.message 
        : (error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to match diagnoses');
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

/**
 * Get triage history for a patient
 */
export const getTriageHistory = createAsyncThunk(
  'triage/getTriageHistory',
  async ({ patientId, queryParams = {} }, { rejectWithValue, dispatch }) => {
    try {
      const result = await triageService.getTriageHistory(patientId, queryParams);
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to fetch triage history', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to fetch triage history');
      }
      return result;
    } catch (error) {
      const message = error?.message || 'Failed to fetch triage history';
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

/**
 * Get a single triage record by ID
 */
export const getTriageById = createAsyncThunk(
  'triage/getTriageById',
  async ({ patientId, triageId }, { rejectWithValue, dispatch }) => {
    try {
      const result = await triageService.getTriageById(patientId, triageId);
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to fetch triage record', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to fetch triage record');
      }
      return result.data;
    } catch (error) {
      const message = error?.message || 'Failed to fetch triage record';
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

/**
 * Create a new triage record
 */
export const createTriage = createAsyncThunk(
  'triage/createTriage',
  async ({ patientId, triageData }, { rejectWithValue, dispatch }) => {
    try {
      const result = await triageService.createTriage(patientId, triageData);
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to create triage record', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to create triage record');
      }
      dispatch(displayNotification({ 
        message: result.message || 'Triage record created successfully', 
        type: 'success' 
      }));
      return result.data;
    } catch (error) {
      const message = error?.message || 'Failed to create triage record';
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

/**
 * Duplicate a triage record (create a copy with optional modifications)
 */
export const duplicateTriage = createAsyncThunk(
  'triage/duplicateTriage',
  async ({ patientId, triageId, triageData }, { rejectWithValue, dispatch }) => {
    try {
      const result = await triageService.duplicateTriage(patientId, triageId, triageData || {});
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to duplicate triage record', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to duplicate triage record');
      }
      dispatch(displayNotification({ 
        message: result.message || 'Triage record duplicated successfully', 
        type: 'success' 
      }));
      return result.data;
    } catch (error) {
      const message = error?.message || 'Failed to duplicate triage record';
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  matchedDiagnoses: [],
  matchCount: 0,
  matchQuery: null,
  matchPagination: null,
  currentTriage: null,
  selectedTriage: null, // For viewing a single triage record
  triageHistory: [],
  triageHistoryPagination: null,
  triageHistoryCount: 0,
  loading: false,
  error: null,
  success: null
};

const triageSlice = createSlice({
  name: 'triage',
  initialState,
  reducers: {
    clearMatchedDiagnoses: (state) => {
      state.matchedDiagnoses = [];
      state.matchCount = 0;
      state.matchQuery = null;
      state.matchPagination = null;
    },
    clearCurrentTriage: (state) => {
      state.currentTriage = null;
    },
    clearSelectedTriage: (state) => {
      state.selectedTriage = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearTriageHistory: (state) => {
      state.triageHistory = [];
      state.triageHistoryPagination = null;
      state.triageHistoryCount = 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Match diagnoses
      .addCase(matchDiagnoses.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Don't clear matchedDiagnoses on pending to avoid flickering during pagination
      })
      .addCase(matchDiagnoses.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure all values are properly structured
        state.matchedDiagnoses = Array.isArray(action.payload?.data) ? action.payload.data : [];
        state.matchCount = typeof action.payload?.count === 'number' ? action.payload.count : 0;
        state.matchQuery = action.payload?.query && typeof action.payload.query === 'object' ? action.payload.query : null;
        state.matchPagination = action.payload?.pagination && typeof action.payload.pagination === 'object' ? action.payload.pagination : null;
        state.error = null;
      })
      .addCase(matchDiagnoses.rejected, (state, action) => {
        state.loading = false;
        // Ensure error is always a string, not an object
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload?.message || 'Failed to match diagnoses');
        state.matchedDiagnoses = [];
        state.matchCount = 0;
        state.matchPagination = null;
        state.matchQuery = null;
      })
      // Create triage
      .addCase(createTriage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createTriage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTriage = action.payload;
        state.success = 'Triage record created successfully';
        state.error = null;
      })
      .addCase(createTriage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      // Get triage by ID
      .addCase(getTriageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTriageById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTriage = action.payload;
        state.error = null;
      })
      .addCase(getTriageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedTriage = null;
      })
      // Get triage history
      .addCase(getTriageHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTriageHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.triageHistory = action.payload.data || [];
        state.triageHistoryPagination = action.payload.pagination || null;
        state.triageHistoryCount = action.payload.count || 0;
        state.error = null;
      })
      .addCase(getTriageHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.triageHistory = [];
        state.triageHistoryPagination = null;
        state.triageHistoryCount = 0;
      })
      // Duplicate triage
      .addCase(duplicateTriage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(duplicateTriage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTriage = action.payload;
        state.success = 'Triage record duplicated successfully';
        state.error = null;
      })
      .addCase(duplicateTriage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });
  }
});

export const { 
  clearMatchedDiagnoses, 
  clearCurrentTriage,
  clearSelectedTriage, 
  clearMessages,
  clearTriageHistory,
  setLoading 
} = triageSlice.actions;

export default triageSlice.reducer;

