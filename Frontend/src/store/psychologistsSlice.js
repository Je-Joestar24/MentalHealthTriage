import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as psychologistsService from '../services/organization/psychologistsService';
import { displayNotification } from './uiSlice';

/**
 * Fetch psychologists list with filters, pagination, sorting, and search
 */
export const fetchPsychologists = createAsyncThunk(
  'psychologists/fetchPsychologists',
  async (params = {}, { rejectWithValue, dispatch, getState }) => {
    try {
      // Get current filters from state if params are not provided
      const state = getState();
      const currentFilters = state.psychologists?.filters || {};
      
      // Merge params with current filters (params take precedence)
      const queryParams = {
        ...currentFilters,
        ...params
      };

      const result = await psychologistsService.getPsychologists(queryParams);
      
      if (!result.success) {
        dispatch(displayNotification({ 
          message: result.error || 'Failed to fetch psychologists', 
          type: 'error' 
        }));
        return rejectWithValue(result.error || 'Failed to fetch psychologists');
      }
      
      return {
        data: result.data || [],
        pagination: result.pagination || {},
        filters: queryParams
      };
    } catch (error) {
      const message = error?.message || 'Failed to fetch psychologists';
      dispatch(displayNotification({ message, type: 'error' }));
      return rejectWithValue(message);
    }
  }
);

/**
 * Create a new psychologist
 */
export const createPsychologist = createAsyncThunk(
  'psychologists/createPsychologist',
  async (payload, { rejectWithValue, dispatch }) => {
    const result = await psychologistsService.createPsychologist(payload);

    if (!result.success) {
      dispatch(displayNotification({
        message: result.error || 'Failed to create psychologist',
        type: 'error'
      }));
      return rejectWithValue(result.error || 'Failed to create psychologist');
    }

    dispatch(displayNotification({
      message: result.message || 'Psychologist created successfully',
      type: 'success'
    }));

    return result.data;
  }
);

/**
 * Update an existing psychologist (name, email, password)
 */
export const updatePsychologist = createAsyncThunk(
  'psychologists/updatePsychologist',
  async ({ id, payload }, { rejectWithValue, dispatch }) => {
    const result = await psychologistsService.updatePsychologist(id, payload);

    if (!result.success) {
      dispatch(displayNotification({
        message: result.error || 'Failed to update psychologist',
        type: 'error'
      }));
      return rejectWithValue(result.error || 'Failed to update psychologist');
    }

    dispatch(displayNotification({
      message: result.message || 'Psychologist updated successfully',
      type: 'success'
    }));

    return result.data;
  }
);

/**
 * Soft delete a psychologist (set isActive to false)
 */
export const deletePsychologist = createAsyncThunk(
  'psychologists/deletePsychologist',
  async (id, { rejectWithValue, dispatch }) => {
    const result = await psychologistsService.deletePsychologist(id);

    if (!result.success) {
      dispatch(displayNotification({
        message: result.error || 'Failed to delete psychologist',
        type: 'error'
      }));
      return rejectWithValue(result.error || 'Failed to delete psychologist');
    }

    dispatch(displayNotification({
      message: result.message || 'Psychologist deleted successfully',
      type: 'success'
    }));

    return result.data;
  }
);

const initialState = {
  list: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    isActive: '',
    organization: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

const psychologistsSlice = createSlice({
  name: 'psychologists',
  initialState,
  reducers: {
    /**
     * Set filters for psychologists list
     * @param {Object} action.payload - Filter values
     */
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change (except when page is explicitly set)
      if (!Object.prototype.hasOwnProperty.call(action.payload, 'page')) {
        state.filters.page = 1;
      }
    },
    
    /**
     * Reset filters to initial state
     */
    resetFilters: (state) => {
      state.filters = {
        search: '',
        isActive: '',
        organization: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10
      };
    },
    
    /**
     * Set pagination page
     * @param {number} action.payload - Page number
     */
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    
    /**
     * Set search term
     * @param {string} action.payload - Search term
     */
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1; // Reset to page 1 on search
    },
    
    /**
     * Set active status filter
     * @param {string} action.payload - 'true', 'false', or ''
     */
    setActiveFilter: (state, action) => {
      state.filters.isActive = action.payload;
      state.filters.page = 1; // Reset to page 1 on filter change
    },
    
    /**
     * Set organization filter
     * @param {string} action.payload - Organization ID or ''
     */
    setOrganizationFilter: (state, action) => {
      state.filters.organization = action.payload;
      state.filters.page = 1; // Reset to page 1 on filter change
    },
    
    /**
     * Set sort field and order
     * @param {Object} action.payload - { sortBy: string, sortOrder: 'asc' | 'desc' }
     */
    setSort: (state, action) => {
      if (action.payload.sortBy) {
        state.filters.sortBy = action.payload.sortBy;
      }
      if (action.payload.sortOrder) {
        state.filters.sortOrder = action.payload.sortOrder;
      }
    },
    
    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Clear psychologists list
     */
    clearPsychologists: (state) => {
      state.list = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch psychologists
      .addCase(fetchPsychologists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPsychologists.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.filters = action.payload.filters || state.filters;
        state.error = null;
      })
      .addCase(fetchPsychologists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch psychologists';
      })
      // Create psychologist
      .addCase(createPsychologist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPsychologist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Prepend newly created psychologist to the list
          state.list = [action.payload, ...state.list];
          // Update pagination total items if it exists
          if (state.pagination) {
            state.pagination.totalItems = (state.pagination.totalItems || 0) + 1;
          }
        }
      })
      .addCase(createPsychologist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create psychologist';
      })
      // Update psychologist
      .addCase(updatePsychologist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePsychologist.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated?._id) {
          state.list = state.list.map((item) =>
            item._id === updated._id ? { ...item, ...updated } : item
          );
        }
      })
      .addCase(updatePsychologist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update psychologist';
      })
      // Delete psychologist (soft delete)
      .addCase(deletePsychologist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePsychologist.fulfilled, (state, action) => {
        state.loading = false;
        const deleted = action.payload;
        if (deleted?._id) {
          state.list = state.list.map((item) =>
            item._id === deleted._id ? { ...item, isActive: false } : item
          );
        }
      })
      .addCase(deletePsychologist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete psychologist';
      });
  }
});

export const {
  setFilters,
  resetFilters,
  setPage,
  setSearch,
  setActiveFilter,
  setOrganizationFilter,
  setSort,
  clearError,
  clearPsychologists
} = psychologistsSlice.actions;

export default psychologistsSlice.reducer;

