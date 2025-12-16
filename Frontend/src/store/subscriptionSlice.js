import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subscriptionService from '../services/organization/subscriptionService';

// Async thunk for upgrading organization seats
export const upgradeSeats = createAsyncThunk(
  'subscription/upgradeSeats',
  async ({ organizationId, additionalSeats }, { rejectWithValue }) => {
    try {
      const result = await subscriptionService.upgradeOrganizationSeats(organizationId, additionalSeats);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upgrade seats');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  message: null,
  lastUpgrade: null, // Stores the last successful upgrade data
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearLastUpgrade: (state) => {
      state.lastUpgrade = null;
    },
    clearAll: (state) => {
      state.error = null;
      state.message = null;
      state.lastUpgrade = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upgrade seats
      .addCase(upgradeSeats.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(upgradeSeats.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = 'Seats upgraded successfully';
        state.lastUpgrade = action.payload;
      })
      .addCase(upgradeSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to upgrade seats';
        state.message = null;
      });
  },
});

export const { clearError, clearMessage, clearLastUpgrade, clearAll } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

