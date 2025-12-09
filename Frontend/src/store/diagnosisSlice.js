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

export const fetchSymptoms = createAsyncThunk(
    'diagnosis/fetchSymptoms',
    async (_, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.getAllSymptoms();
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.error);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to load symptoms');
        }
    }
);

// Notes thunks
export const fetchDiagnosisNotes = createAsyncThunk(
    'diagnosis/fetchDiagnosisNotes',
    async (diagnosisId, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.getDiagnosisNotes(diagnosisId);
            if (result.success) {
                return result.data;
            }
            return rejectWithValue(result.error);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to load notes');
        }
    }
);

export const addDiagnosisNote = createAsyncThunk(
    'diagnosis/addDiagnosisNote',
    async ({ diagnosisId, content }, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.addDiagnosisNote(diagnosisId, content);
            if (result.success) {
                return result.data;
            }
            return rejectWithValue(result.error);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add note');
        }
    }
);

export const updateDiagnosisNote = createAsyncThunk(
    'diagnosis/updateDiagnosisNote',
    async ({ diagnosisId, noteId, content }, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.updateDiagnosisNote(diagnosisId, noteId, content);
            if (result.success) {
                return result.data;
            }
            return rejectWithValue(result.error);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update note');
        }
    }
);

export const deleteDiagnosisNote = createAsyncThunk(
    'diagnosis/deleteDiagnosisNote',
    async ({ diagnosisId, noteId }, { rejectWithValue }) => {
        try {
            const result = await diagnosisService.deleteDiagnosisNote(diagnosisId, noteId);
            if (result.success) {
                return { noteId };
            }
            return rejectWithValue(result.error);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete note');
        }
    }
);

const initialState = {
    diagnoses: [],
    currentDiagnosis: null,
    notes: [],
    pagination: {
        page: 1,
        limit: 5,
        total: 0,
        pages: 0
    },
    loading: false,
    notesLoading: false,
    error: null,
    notesError: null,
    success: null,
    filters: {
        search: '',
        system: '',
        type: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    },
    symptoms: [] // add to state
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
            state.notesError = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearCurrentDiagnosis: (state) => {
            state.currentDiagnosis = null;
            state.notes = [];
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
                // Remove from frontend state immediately for instant UI feedback
                const deletedId = action.payload.id;
                state.diagnoses = state.diagnoses.filter(d => d._id !== deletedId);
                
                // Clear current diagnosis if it was deleted
                if (state.currentDiagnosis && state.currentDiagnosis._id === deletedId) {
                    state.currentDiagnosis = null;
                }
                
                state.success = action.payload.message;
                state.error = null;
                // Note: Pagination will be updated when fetchDiagnoses is called after deletion
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
            })
            // Fetch symptoms
            .addCase(fetchSymptoms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSymptoms.fulfilled, (state, action) => {
                state.loading = false;
                state.symptoms = action.payload;
                state.error = null;
            })
            .addCase(fetchSymptoms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Notes: fetch
            .addCase(fetchDiagnosisNotes.pending, (state) => {
                state.notesLoading = true;
                state.notesError = null;
            })
            .addCase(fetchDiagnosisNotes.fulfilled, (state, action) => {
                state.notesLoading = false;
                state.notes = action.payload || [];
            })
            .addCase(fetchDiagnosisNotes.rejected, (state, action) => {
                state.notesLoading = false;
                state.notesError = action.payload;
            })
            // Notes: add
            .addCase(addDiagnosisNote.pending, (state) => {
                state.notesLoading = true;
                state.notesError = null;
            })
            .addCase(addDiagnosisNote.fulfilled, (state, action) => {
                state.notesLoading = false;
                state.notes = [action.payload, ...(state.notes || [])];
            })
            .addCase(addDiagnosisNote.rejected, (state, action) => {
                state.notesLoading = false;
                state.notesError = action.payload;
            })
            // Notes: update
            .addCase(updateDiagnosisNote.pending, (state) => {
                state.notesLoading = true;
                state.notesError = null;
            })
            .addCase(updateDiagnosisNote.fulfilled, (state, action) => {
                state.notesLoading = false;
                const idx = state.notes.findIndex((n) => n._id === action.payload._id);
                if (idx !== -1) {
                    state.notes[idx] = action.payload;
                }
            })
            .addCase(updateDiagnosisNote.rejected, (state, action) => {
                state.notesLoading = false;
                state.notesError = action.payload;
            })
            // Notes: delete
            .addCase(deleteDiagnosisNote.pending, (state) => {
                state.notesLoading = true;
                state.notesError = null;
            })
            .addCase(deleteDiagnosisNote.fulfilled, (state, action) => {
                state.notesLoading = false;
                const { noteId } = action.payload;
                state.notes = state.notes.filter((n) => n._id !== noteId);
            })
            .addCase(deleteDiagnosisNote.rejected, (state, action) => {
                state.notesLoading = false;
                state.notesError = action.payload;
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


