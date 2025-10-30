import api from '../../api/axios';

// Get all diagnoses with pagination and filtering
export const getAllDiagnoses = async (params = {}) => {
    try {
        const qp = { page: 1, limit: 10, ...params };
        const { data } = await api.get('/api/diagnoses', { params: qp });
        const p = data.pagination || {};
        const pagination = {
            page: p.currentPage ?? qp.page ?? 1,
            pages: p.totalPages ?? 0,
            total: p.totalItems ?? 0,
            limit: p.itemsPerPage ?? qp.limit ?? 10,
        };
        return { success: true, data: data.data, pagination };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to fetch diagnoses';
        return { success: false, error: message };
    }
};

// Get single diagnosis by ID
export const getDiagnosisById = async (id) => {
    try {
        const { data } = await api.get(`/api/diagnoses/${id}`);
        return { success: true, data: data.data };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to fetch diagnosis';
        return { success: false, error: message };
    }
};

// Create new diagnosis
export const createDiagnosis = async (payload) => {
    try {
        const { data } = await api.post('/api/diagnoses', payload);
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to create diagnosis';
        return { success: false, error: message };
    }
};

// Update diagnosis
export const updateDiagnosis = async (id, updateData) => {
    try {
        const { data } = await api.put(`/api/diagnoses/${id}`, updateData);
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to update diagnosis';
        return { success: false, error: message };
    }
};

// Delete diagnosis
export const deleteDiagnosis = async (id) => {
    try {
        const { data } = await api.delete(`/api/diagnoses/${id}`);
        return { success: true, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to delete diagnosis';
        return { success: false, error: message };
    }
};

// Bulk import diagnoses
export const bulkImportDiagnoses = async (bulkPayload) => {
    try {
        // Accept either FormData (e.g., CSV upload) or JSON array/object
        const isFormData = typeof FormData !== 'undefined' && bulkPayload instanceof FormData;
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
        const { data } = await api.post('/api/diagnoses/bulk-import', bulkPayload, config);
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to bulk import diagnoses';
        return { success: false, error: message };
    }
};

// Get all symptoms (pretty, for suggestions)
export const getAllSymptoms = async () => {
    try {
        const { data } = await api.get('/api/diagnoses/symptoms/fetch');
        return { success: true, data: data.data };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to load symptoms';
        return { success: false, error: message };
    }
};


