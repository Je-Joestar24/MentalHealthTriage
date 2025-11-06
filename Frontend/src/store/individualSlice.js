import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as individualService from '../services/admin/individualService';

// Async thunks for individual psychologist operations
export const fetchIndividuals = createAsyncThunk(
    'individual/fetchIndividuals',
    async (params = {}, { rejectWithValue }) => {
        try {
            const result = await individualService.getAllIndividuals(params);
            if (result.success) {
                return result;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch individual psychologists');
        }
    }
);

export const createIndividual = createAsyncThunk(
    'individual/createIndividual',
    async (accountData, { rejectWithValue }) => {
        try {
            const result = await individualService.createIndividual(accountData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create individual account');
        }
    }
);

export const extendSubscriptionMonths = createAsyncThunk(
    'individual/extendSubscriptionMonths',
    async ({ id, months }, { rejectWithValue }) => {
        try {
            const result = await individualService.extendSubscriptionMonths(id, months);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to extend subscription');
        }
    }
);

export const updateIndividual = createAsyncThunk(
    'individual/updateIndividual',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const result = await individualService.updateIndividual(id, updateData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update individual account');
        }
    }
);

export const updateIndividualStatus = createAsyncThunk(
    'individual/updateIndividualStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const result = await individualService.updateIndividualStatus(id, isActive);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update individual status');
        }
    }
);

const initialState = {
    individuals: [],
    pagination: {
        page: 1,
        limit: 5,
        total: 0,
        pages: 0
    },
    loading: false,
    error: null,
    success: null,
    filters: {
        search: '',
        status: '',
        isActive: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }
};

const individualSlice = createSlice({
    name: 'individual',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = !!action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload || null;
        },
        setSuccess: (state, action) => {
            state.success = action.payload || null;
        },
        clearMessages: (state) => {
            state.error = null;
            state.success = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch individuals
            .addCase(fetchIndividuals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIndividuals.fulfilled, (state, action) => {
                state.loading = false;
                state.individuals = action.payload.data;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchIndividuals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create individual
            .addCase(createIndividual.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createIndividual.fulfilled, (state, action) => {
                state.loading = false;
                state.individuals.unshift(action.payload);
                state.success = 'Individual account created successfully';
                state.error = null;
            })
            .addCase(createIndividual.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Extend subscription months
            .addCase(extendSubscriptionMonths.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(extendSubscriptionMonths.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.individuals.findIndex(ind => ind._id === action.payload._id);
                if (index !== -1) {
                    state.individuals[index] = action.payload;
                }
                state.success = 'Subscription extended successfully';
                state.error = null;
            })
            .addCase(extendSubscriptionMonths.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update individual
            .addCase(updateIndividual.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateIndividual.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.individuals.findIndex(ind => ind._id === action.payload._id);
                if (index !== -1) {
                    state.individuals[index] = action.payload;
                }
                state.success = 'Individual account updated successfully';
                state.error = null;
            })
            .addCase(updateIndividual.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update individual status
            .addCase(updateIndividualStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateIndividualStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.individuals.findIndex(ind => ind._id === action.payload._id);
                if (index !== -1) {
                    state.individuals[index] = action.payload;
                }
                state.success = `Individual account ${action.payload.isActive ? 'activated' : 'deactivated'} successfully`;
                state.error = null;
            })
            .addCase(updateIndividualStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    setLoading,
    setError,
    setSuccess,
    clearMessages,
    setFilters
} = individualSlice.actions;

export default individualSlice.reducer;

