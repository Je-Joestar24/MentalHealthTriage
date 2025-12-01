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

