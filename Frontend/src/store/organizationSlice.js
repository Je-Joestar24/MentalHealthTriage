import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as organizationService from '../services/organizationService';

// Async thunks for organization operations
export const fetchOrganizations = createAsyncThunk(
    'organization/fetchOrganizations',
    async (params = {}, { rejectWithValue }) => {
        try {
            const result = await organizationService.getAllOrganizations(params);
            if (result.success) {
                return result;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch organizations');
        }
    }
);

export const fetchOrganizationById = createAsyncThunk(
    'organization/fetchOrganizationById',
    async (id, { rejectWithValue }) => {
        try {
            const result = await organizationService.getOrganizationById(id);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch organization');
        }
    }
);

export const createOrganization = createAsyncThunk(
    'organization/createOrganization',
    async (organizationData, { rejectWithValue }) => {
        try {
            const result = await organizationService.createOrganization(organizationData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create organization');
        }
    }
);

export const updateOrganization = createAsyncThunk(
    'organization/updateOrganization',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const result = await organizationService.updateOrganization(id, updateData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update organization');
        }
    }
);

export const deleteOrganization = createAsyncThunk(
    'organization/deleteOrganization',
    async (id, { rejectWithValue }) => {
        try {
            const result = await organizationService.deleteOrganization(id);
            if (result.success) {
                return { id, message: result.message };
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete organization');
        }
    }
);

export const updateOrganizationStatus = createAsyncThunk(
    'organization/updateOrganizationStatus',
    async ({ id, subscriptionStatus, subscriptionEndDate }, { rejectWithValue }) => {
        try {
            const result = await organizationService.updateOrganizationStatus(id, subscriptionStatus, subscriptionEndDate);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update organization status');
        }
    }
);

export const extendSubscription = createAsyncThunk(
    'organization/extendSubscription',
    async ({ id, subscriptionEndDate }, { rejectWithValue }) => {
        try {
            const result = await organizationService.extendSubscription(id, subscriptionEndDate);
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

export const getOrganizationStats = createAsyncThunk(
    'organization/getOrganizationStats',
    async (id, { rejectWithValue }) => {
        try {
            const result = await organizationService.getOrganizationStats(id);
            if (result.success) {
                return { id, stats: result.data };
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch organization stats');
        }
    }
);

export const checkExpiredSubscriptions = createAsyncThunk(
    'organization/checkExpiredSubscriptions',
    async (_, { rejectWithValue }) => {
        try {
            const result = await organizationService.checkExpiredSubscriptions();
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to check expired subscriptions');
        }
    }
);

const initialState = {
    organizations: [],
    currentOrganization: null,
    organizationStats: {},
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    },
    loading: false,
    error: null,
    success: null,
    filters: {
        search: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }
};

const organizationSlice = createSlice({
    name: 'organization',
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
        },
        clearCurrentOrganization: (state) => {
            state.currentOrganization = null;
        },
        clearOrganizationStats: (state) => {
            state.organizationStats = {};
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch organizations
            .addCase(fetchOrganizations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrganizations.fulfilled, (state, action) => {
                state.loading = false;
                state.organizations = action.payload.data;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchOrganizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch organization by ID
            .addCase(fetchOrganizationById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrganizationById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrganization = action.payload;
                state.error = null;
            })
            .addCase(fetchOrganizationById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create organization
            .addCase(createOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrganization.fulfilled, (state, action) => {
                state.loading = false;
                state.organizations.unshift(action.payload);
                state.success = 'Organization created successfully';
                state.error = null;
            })
            .addCase(createOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update organization
            .addCase(updateOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrganization.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.organizations.findIndex(org => org._id === action.payload._id);
                if (index !== -1) {
                    state.organizations[index] = action.payload;
                }
                if (state.currentOrganization && state.currentOrganization._id === action.payload._id) {
                    state.currentOrganization = action.payload;
                }
                state.success = 'Organization updated successfully';
                state.error = null;
            })
            .addCase(updateOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete organization
            .addCase(deleteOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteOrganization.fulfilled, (state, action) => {
                state.loading = false;
                state.organizations = state.organizations.filter(org => org._id !== action.payload.id);
                if (state.currentOrganization && state.currentOrganization._id === action.payload.id) {
                    state.currentOrganization = null;
                }
                state.success = action.payload.message;
                state.error = null;
            })
            .addCase(deleteOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update organization status
            .addCase(updateOrganizationStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrganizationStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.organizations.findIndex(org => org._id === action.payload._id);
                if (index !== -1) {
                    state.organizations[index] = action.payload;
                }
                if (state.currentOrganization && state.currentOrganization._id === action.payload._id) {
                    state.currentOrganization = action.payload;
                }
                state.success = 'Organization status updated successfully';
                state.error = null;
            })
            .addCase(updateOrganizationStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Extend subscription
            .addCase(extendSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(extendSubscription.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.organizations.findIndex(org => org._id === action.payload._id);
                if (index !== -1) {
                    state.organizations[index] = action.payload;
                }
                if (state.currentOrganization && state.currentOrganization._id === action.payload._id) {
                    state.currentOrganization = action.payload;
                }
                state.success = 'Subscription extended successfully';
                state.error = null;
            })
            .addCase(extendSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get organization stats
            .addCase(getOrganizationStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrganizationStats.fulfilled, (state, action) => {
                state.loading = false;
                state.organizationStats[action.payload.id] = action.payload.stats;
                state.error = null;
            })
            .addCase(getOrganizationStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check expired subscriptions
            .addCase(checkExpiredSubscriptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkExpiredSubscriptions.fulfilled, (state, action) => {
                state.loading = false;
                state.success = `Checked and updated ${action.payload.updatedCount} expired subscriptions`;
                state.error = null;
            })
            .addCase(checkExpiredSubscriptions.rejected, (state, action) => {
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
    setFilters,
    clearCurrentOrganization,
    clearOrganizationStats
} = organizationSlice.actions;

export default organizationSlice.reducer;

