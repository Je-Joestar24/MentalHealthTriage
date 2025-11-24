import api from '../../api/axios';

const BASE_URL = '/api/company';

/**
 * Get company details for the logged-in company admin
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getCompanyDetails = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/details`);
    return {
      success: data.success ?? true,
      data: data.data
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to fetch company details';
    return { success: false, error: message };
  }
};

/**
 * Update company details (name only)
 * @param {Object} updateData - Update data
 * @param {string} updateData.name - Company name
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const updateCompanyDetails = async (updateData) => {
  try {
    const { data } = await api.put(`${BASE_URL}/details`, updateData);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Company details updated successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to update company details';
    return { success: false, error: message };
  }
};

