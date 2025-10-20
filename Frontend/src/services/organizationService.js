import api from '../api/axios';

// Get all organizations with pagination and filtering
export const getAllOrganizations = async (params = {}) => {
    try {
        const qp = { page: 1, limit: 10, ...params };
        
        // Handle status filtering - only add subscriptionStatus if status is not 'all' or empty
        if (qp.status && qp.status !== '' && qp.status !== 'all') {
            qp.subscriptionStatus = qp.status; // backend expects subscriptionStatus
        }
        // Remove the status field since backend expects subscriptionStatus
        delete qp.status;
        
        const { data } = await api.get('/api/admin/organizations', { params: qp });
        const p = data.pagination || {};
        const pagination = {
            page: p.currentPage ?? qp.page ?? 1,
            pages: p.totalPages ?? 0,
            total: p.totalItems ?? 0,
            limit: p.itemsPerPage ?? qp.limit ?? 10,
        };
        return { success: true, data: data.data, pagination };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to fetch organizations';
        return { success: false, error: message };
    }
};

// Get single organization by ID
export const getOrganizationById = async (id) => {
    try {
        const { data } = await api.get(`/api/admin/organizations/${id}`);
        return { success: true, data: data.data };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to fetch organization';
        return { success: false, error: message };
    }
};

// Create new organization
export const createOrganization = async (organizationData) => {
    try {
        const { data } = await api.post('/api/admin/organizations', organizationData);
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to create organization';
        return { success: false, error: message };
    }
};

// Update organization
export const updateOrganization = async (id, updateData) => {
    try {
        const { data } = await api.put(`/api/admin/organizations/${id}`, updateData);
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to update organization';
        return { success: false, error: message };
    }
};

// Delete organization
export const deleteOrganization = async (id) => {
    try {
        const { data } = await api.delete(`/api/admin/organizations/${id}`);
        return { success: true, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to delete organization';
        return { success: false, error: message };
    }
};

// Update organization subscription status
export const updateOrganizationStatus = async (id, subscriptionStatus, subscriptionEndDate) => {
    try {
        const { data } = await api.patch(`/api/admin/organizations/${id}/status`, {
            subscriptionStatus,
            subscriptionEndDate
        });
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to update organization status';
        return { success: false, error: message };
    }
};

// Extend organization subscription
export const extendSubscription = async (id, subscriptionEndDate) => {
    try {
        const { data } = await api.post(`/api/admin/organizations/${id}/extend`, {
            subscriptionEndDate
        });
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to extend subscription';
        return { success: false, error: message };
    }
};

// Get organization statistics
export const getOrganizationStats = async (id) => {
    try {
        const { data } = await api.get(`/api/admin/organizations/${id}/stats`);
        return { success: true, data: data.data };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to fetch organization stats';
        return { success: false, error: message };
    }
};

// Check and update expired subscriptions
export const checkExpiredSubscriptions = async () => {
    try {
        const { data } = await api.post('/api/admin/organizations/check-expired');
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to check expired subscriptions';
        return { success: false, error: message };
    }
};

// Helper function to format organization data for forms
export const formatOrganizationForForm = (organization) => {
    return {
        name: organization?.name || '',
        admin: organization?.admin || '',
        subscriptionStatus: organization?.subscriptionStatus || 'active',
        subscriptionEndDate: organization?.subscriptionEndDate || '',
        contactEmail: organization?.contactEmail || '',
        contactPhone: organization?.contactPhone || '',
        address: organization?.address || '',
        description: organization?.description || '',
        settings: organization?.settings || {}
    };
};

// Helper function to validate organization data
export const validateOrganizationData = (data) => {
    const errors = {};
    
    if (!data.name || data.name.trim() === '') {
        errors.name = 'Organization name is required';
    }
    
    if (!data.admin || data.admin.trim() === '') {
        errors.admin = 'Admin is required';
    }
    
    if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address';
    }
    
    if (data.subscriptionEndDate && new Date(data.subscriptionEndDate) < new Date()) {
        errors.subscriptionEndDate = 'Subscription end date cannot be in the past';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

