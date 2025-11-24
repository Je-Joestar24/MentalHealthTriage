import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as companyService from '../services/organization/companyService';
import { displayNotification } from './uiSlice';

/**
 * Fetch company details
 */
export const fetchCompanyDetails = createAsyncThunk(
  'company/fetchCompanyDetails',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const result = await companyService.getCompanyDetails();
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to fetch company details', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to fetch company details');
      }
      return result.data;
    } catch (error) {
      const message = error?.message || 'Failed to fetch company details';
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

/**
 * Update company details
 */
export const updateCompanyDetails = createAsyncThunk(
  'company/updateCompanyDetails',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const result = await companyService.updateCompanyDetails(updateData);
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to update company details', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to update company details');
      }
      dispatch(displayNotification({ 
        message: result.message || 'Company details updated successfully', 
        type: 'success' 
      }));
      return result.data;
    } catch (error) {
      const message = error?.message || 'Failed to update company details';
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  companyDetails: null,
  loading: false,
  error: null,
  success: null
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearCompanyDetails: (state) => {
      state.companyDetails = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setLoading: (state, action) => {
      state.loading = !!action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch company details
      .addCase(fetchCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.companyDetails = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch company details';
      })
      // Update company details
      .addCase(updateCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCompanyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.companyDetails = action.payload;
        state.success = 'Company details updated successfully';
        state.error = null;
      })
      .addCase(updateCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update company details';
        state.success = null;
      });
  }
});

export const { clearCompanyDetails, clearMessages, setLoading } = companySlice.actions;
export default companySlice.reducer;

