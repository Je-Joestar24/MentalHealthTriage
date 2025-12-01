import api from '../../api/axios';

const BASE_URL = '/api/company/psychologists';

/**
 * Get list of psychologists with pagination, filtering, sorting, and search
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search by name or email
 * @param {string} params.isActive - Filter by active status ('true' or 'false')
 * @param {string} params.organization - Filter by organization ID
 * @param {string} params.sortBy - Sort field (name, email, createdAt, isActive, specialization, experience)
 * @param {string} params.sortOrder - Sort direction ('asc' or 'desc')
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string}>}
 */
export const getPsychologists = async (params = {}) => {
  try {
    // Set default limit to 10
    const queryParams = {
      page: 1,
      limit: 10,
      ...params
    };

    // Remove undefined or empty string values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => 
        value !== undefined && value !== '' && value !== null
      )
    );

    const { data } = await api.get(BASE_URL, { params: cleanParams });
    
    return {
      success: data.success ?? true,
      data: data.data || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to fetch psychologists';
    return { 
      success: false, 
      error: message,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
};

