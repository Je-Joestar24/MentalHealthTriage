import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as diagnosisService from '../services/admin/diagnosisService';

// Async thunks for diagnosis operations
export const fetchDiagnoses = createAsyncThunk(
    'diagnosis/fetchDiagnoses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.getAllDiagnoses(params);
            if (result.success) {
                return result;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch diagnoses');
        }
    }
);

export const fetchDiagnosisById = createAsyncThunk(
    'diagnosis/fetchDiagnosisById',
    async (id, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.getDiagnosisById(id);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch diagnosis');
        }
    }
);

export const createDiagnosis = createAsyncThunk(
    'diagnosis/createDiagnosis',
    async (payload, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.createDiagnosis(payload);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create diagnosis');
        }
    }
);

export const updateDiagnosis = createAsyncThunk(
    'diagnosis/updateDiagnosis',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.updateDiagnosis(id, updateData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update diagnosis');
        }
    }
);

export const deleteDiagnosis = createAsyncThunk(
    'diagnosis/deleteDiagnosis',
    async (id, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.deleteDiagnosis(id);
            if (result.success) {
                return { id, message: result.message };
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete diagnosis');
        }
    }
);

export const bulkImportDiagnoses = createAsyncThunk(
    'diagnosis/bulkImportDiagnoses',
    async (bulkPayload, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.bulkImportDiagnoses(bulkPayload);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to bulk import diagnoses');
        }
    }
);

const initialState = {
    diagnoses: [],
    currentDiagnosis: null,
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
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }
};

const diagnosisSlice = createSlice({
    name: 'diagnosis',
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
        clearCurrentDiagnosis: (state) => {
            state.currentDiagnosis = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch diagnoses
            .addCase(fetchDiagnoses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiagnoses.fulfilled, (state, action) => {
                state.loading = false;
                state.diagnoses = action.payload.data;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchDiagnoses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch diagnosis by ID
            .addCase(fetchDiagnosisById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiagnosisById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDiagnosis = action.payload;
                state.error = null;
            })
            .addCase(fetchDiagnosisById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create diagnosis
            .addCase(createDiagnosis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDiagnosis.fulfilled, (state, action) => {
                state.loading = false;
                state.diagnoses.unshift(action.payload);
                state.success = 'Diagnosis created successfully';
                state.error = null;
            })
            .addCase(createDiagnosis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update diagnosis
            .addCase(updateDiagnosis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDiagnosis.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.diagnoses.findIndex(d => d._id === action.payload._id);
                if (index !== -1) {
                    state.diagnoses[index] = action.payload;
                }
                if (state.currentDiagnosis && state.currentDiagnosis._id === action.payload._id) {
                    state.currentDiagnosis = action.payload;
                }
                state.success = 'Diagnosis updated successfully';
                state.error = null;
            })
            .addCase(updateDiagnosis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete diagnosis
            .addCase(deleteDiagnosis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDiagnosis.fulfilled, (state, action) => {
                state.loading = false;
                state.diagnoses = state.diagnoses.filter(d => d._id !== action.payload.id);
                if (state.currentDiagnosis && state.currentDiagnosis._id === action.payload.id) {
                    state.currentDiagnosis = null;
                }
                state.success = action.payload.message;
                state.error = null;
            })
            .addCase(deleteDiagnosis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Bulk import
            .addCase(bulkImportDiagnoses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkImportDiagnoses.fulfilled, (state, action) => {
                state.loading = false;
                // Prepend or merge imported items
                const imported = Array.isArray(action.payload) ? action.payload : [action.payload];
                state.diagnoses = [...imported, ...state.diagnoses];
                state.success = 'Diagnoses imported successfully';
                state.error = null;
            })
            .addCase(bulkImportDiagnoses.rejected, (state, action) => {
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
    clearCurrentDiagnosis
} = diagnosisSlice.actions;

export default diagnosisSlice.reducer;


