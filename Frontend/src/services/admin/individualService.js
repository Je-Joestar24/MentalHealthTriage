import api from '../../api/axios';

// Get all individual psychologists with pagination, search, sort, and filter
export const getAllIndividuals = async (params = {}) => {
    try {
        const qp = { page: 1, limit: 5, ...params };
        const { data } = await api.get('/api/admin/individuals', { params: qp });
        const p = data.pagination || {};
        const pagination = {
            page: p.currentPage ?? qp.page ?? 1,
            pages: p.totalPages ?? 0,
            total: p.totalItems ?? 0,
            limit: p.itemsPerPage ?? qp.limit ?? 5,
        };
        return { success: true, data: data.data, pagination };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to fetch individual psychologists';
        return { success: false, error: message };
    }
};

// Create new individual psychologist account
export const createIndividual = async (accountData) => {
    try {
        const { data } = await api.post('/api/admin/individuals', accountData);
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to create individual account';
        return { success: false, error: message };
    }
};

// Extend subscription months for individual psychologist
export const extendSubscriptionMonths = async (id, months) => {
    try {
        const { data } = await api.patch(`/api/admin/individuals/${id}/extend`, { months });
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to extend subscription';
        return { success: false, error: message };
    }
};

// Update individual psychologist account details (name, email, password)
export const updateIndividual = async (id, updateData) => {
    try {
        const { data } = await api.patch(`/api/admin/individuals/${id}`, updateData);
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to update individual account';
        return { success: false, error: message };
    }
};

// Update individual psychologist status (isActive)
export const updateIndividualStatus = async (id, isActive) => {
    try {
        const { data } = await api.patch(`/api/admin/individuals/${id}/status`, { isActive });
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to update individual status';
        return { success: false, error: message };
    }
};

