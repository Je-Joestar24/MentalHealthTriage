import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as triageService from '../services/psychologist/triageService';
import { displayNotification } from './uiSlice';

/**
 * Match diagnoses based on symptoms
 */
export const matchDiagnoses = createAsyncThunk(
  'triage/matchDiagnoses',
  async ({ symptoms, system }, { rejectWithValue, dispatch }) => {
    try {
      const result = await triageService.matchDiagnoses(symptoms, system);
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to match diagnoses', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to match diagnoses');
      }
      return result;
    } catch (error) {
      const message = error?.message || 'Failed to match diagnoses';
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

const initialState = {
  matchedDiagnoses: [],
  matchCount: 0,
  matchQuery: null,
  currentTriage: null,
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
    },
    clearCurrentTriage: (state) => {
      state.currentTriage = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
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
        state.matchedDiagnoses = [];
        state.matchCount = 0;
      })
      .addCase(matchDiagnoses.fulfilled, (state, action) => {
        state.loading = false;
        state.matchedDiagnoses = action.payload.data || [];
        state.matchCount = action.payload.count || 0;
        state.matchQuery = action.payload.query || null;
        state.error = null;
      })
      .addCase(matchDiagnoses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.matchedDiagnoses = [];
        state.matchCount = 0;
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
      });
  }
});

export const { 
  clearMatchedDiagnoses, 
  clearCurrentTriage, 
  clearMessages, 
  setLoading 
} = triageSlice.actions;

export default triageSlice.reducer;

