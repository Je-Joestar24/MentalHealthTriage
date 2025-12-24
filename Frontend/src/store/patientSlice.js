import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as patientsService from '../services/psychologist/patientsService';

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (params = {}, { rejectWithValue }) => {
    const result = await patientsService.getPatients(params);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to fetch patients');
    }
    return result;
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (id, { rejectWithValue }) => {
    const result = await patientsService.getPatientById(id);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to fetch patient');
    }
    return result.data;
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (payload, { rejectWithValue }) => {
    const result = await patientsService.createPatient(payload);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to create patient');
    }
    return result.data;
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, payload }, { rejectWithValue }) => {
    const result = await patientsService.updatePatient(id, payload);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to update patient');
    }
    return result.data;
  }
);

export const softDeletePatient = createAsyncThunk(
  'patients/softDeletePatient',
  async (id, { rejectWithValue }) => {
    const result = await patientsService.softDeletePatient(id);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to delete patient');
    }
    return result.data;
  }
);

export const restorePatient = createAsyncThunk(
  'patients/restorePatient',
  async (id, { rejectWithValue }) => {
    const result = await patientsService.restorePatient(id);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to restore patient');
    }
    return result.data;
  }
);

export const reassignPsychologist = createAsyncThunk(
  'patients/reassignPsychologist',
  async ({ patientId, psychologistId }, { rejectWithValue }) => {
    const result = await patientsService.reassignPsychologist(patientId, psychologistId);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to reassign psychologist');
    }
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
  currentPatient: null,
  loading: false,
  error: null,
  success: null,
  filters: {
    search: '',
    status: '',
    psychologist: '',
    organization: '',
    includeDeleted: 'false',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 5
  }
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch patient by ID
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload;
        state.error = null;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create patient
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.success = 'Patient created successfully';
        state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update patient
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((patient) => patient._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentPatient && state.currentPatient._id === action.payload._id) {
          state.currentPatient = action.payload;
        }
        state.success = 'Patient updated successfully';
        state.error = null;
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Soft delete patient
      .addCase(softDeletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softDeletePatient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((patient) => patient._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentPatient && state.currentPatient._id === action.payload._id) {
          state.currentPatient = action.payload;
        }
        state.success = 'Patient deleted successfully';
        state.error = null;
      })
      .addCase(softDeletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore patient
      .addCase(restorePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restorePatient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((patient) => patient._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentPatient && state.currentPatient._id === action.payload._id) {
          state.currentPatient = action.payload;
        }
        state.success = 'Patient restored successfully';
        state.error = null;
      })
      .addCase(restorePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reassign psychologist
      .addCase(reassignPsychologist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reassignPsychologist.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((patient) => patient._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentPatient && state.currentPatient._id === action.payload._id) {
          state.currentPatient = action.payload;
        }
        state.success = 'Psychologist reassigned successfully';
        state.error = null;
      })
      .addCase(reassignPsychologist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearMessages, clearCurrentPatient } = patientSlice.actions;
export default patientSlice.reducer;


