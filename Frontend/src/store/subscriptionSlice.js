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

// Async thunk for scheduling organization cancellation
export const scheduleOrgCancellation = createAsyncThunk(
  'subscription/scheduleOrgCancellation',
  async ({ organizationId, reason }, { rejectWithValue }) => {
    try {
      const result = await subscriptionService.scheduleOrganizationCancellation(organizationId, reason);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to schedule cancellation');
    }
  }
);

// Async thunk for undoing organization cancellation
export const undoOrgCancellation = createAsyncThunk(
  'subscription/undoOrgCancellation',
  async ({ organizationId }, { rejectWithValue }) => {
    try {
      const result = await subscriptionService.undoOrganizationCancellation(organizationId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to undo cancellation');
    }
  }
);

// Async thunk for scheduling user cancellation
export const scheduleUserCancel = createAsyncThunk(
  'subscription/scheduleUserCancel',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const result = await subscriptionService.scheduleUserCancellation(userId, reason);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to schedule cancellation');
    }
  }
);

// Async thunk for undoing user cancellation
export const undoUserCancel = createAsyncThunk(
  'subscription/undoUserCancel',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const result = await subscriptionService.undoUserCancellation(userId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to undo cancellation');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  message: null,
  lastUpgrade: null, // Stores the last successful upgrade data
  cancellationLoading: false, // Loading state for cancellation operations
  cancellationError: null, // Error state for cancellation operations
  cancellationMessage: null, // Message state for cancellation operations
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
    clearCancellationError: (state) => {
      state.cancellationError = null;
    },
    clearCancellationMessage: (state) => {
      state.cancellationMessage = null;
    },
    clearCancellationAll: (state) => {
      state.cancellationError = null;
      state.cancellationMessage = null;
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
      })
      // Schedule organization cancellation
      .addCase(scheduleOrgCancellation.pending, (state) => {
        state.cancellationLoading = true;
        state.cancellationError = null;
        state.cancellationMessage = null;
      })
      .addCase(scheduleOrgCancellation.fulfilled, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = null;
        state.cancellationMessage = 'Cancellation scheduled successfully';
      })
      .addCase(scheduleOrgCancellation.rejected, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = action.payload || 'Failed to schedule cancellation';
        state.cancellationMessage = null;
      })
      // Undo organization cancellation
      .addCase(undoOrgCancellation.pending, (state) => {
        state.cancellationLoading = true;
        state.cancellationError = null;
        state.cancellationMessage = null;
      })
      .addCase(undoOrgCancellation.fulfilled, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = null;
        state.cancellationMessage = 'Cancellation undone successfully';
      })
      .addCase(undoOrgCancellation.rejected, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = action.payload || 'Failed to undo cancellation';
        state.cancellationMessage = null;
      })
      // Schedule user cancellation
      .addCase(scheduleUserCancel.pending, (state) => {
        state.cancellationLoading = true;
        state.cancellationError = null;
        state.cancellationMessage = null;
      })
      .addCase(scheduleUserCancel.fulfilled, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = null;
        state.cancellationMessage = 'Cancellation scheduled successfully';
      })
      .addCase(scheduleUserCancel.rejected, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = action.payload || 'Failed to schedule cancellation';
        state.cancellationMessage = null;
      })
      // Undo user cancellation
      .addCase(undoUserCancel.pending, (state) => {
        state.cancellationLoading = true;
        state.cancellationError = null;
        state.cancellationMessage = null;
      })
      .addCase(undoUserCancel.fulfilled, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = null;
        state.cancellationMessage = 'Cancellation undone successfully';
      })
      .addCase(undoUserCancel.rejected, (state, action) => {
        state.cancellationLoading = false;
        state.cancellationError = action.payload || 'Failed to undo cancellation';
        state.cancellationMessage = null;
      });
  },
});

export const {
  clearError,
  clearMessage,
  clearLastUpgrade,
  clearAll,
  clearCancellationError,
  clearCancellationMessage,
  clearCancellationAll,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

