import api from '../../api/axios';

const BASE_URL = '/api/public';

/**
 * Get public statistics (professionals and clients count)
 * @returns {Promise<{success: boolean, data?: {professionals: number, clients: number}, error?: string}>}
 */
export const getPublicStats = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/stats`);
    return {
      success: data.success ?? true,
      data: data.data,
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to fetch statistics';
    return { success: false, error: message };
  }
};

