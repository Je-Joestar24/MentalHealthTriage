import api from '../../api/axios';

/**
 * Upgrade organization seats (add more seats to existing subscription)
 * @param {string} organizationId - Organization ID
 * @param {number} additionalSeats - Number of additional seats to add
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const upgradeOrganizationSeats = async (organizationId, additionalSeats) => {
  try {
    if (!organizationId) {
      return { success: false, error: 'Organization ID is required' };
    }

    if (!additionalSeats || additionalSeats <= 0 || !Number.isInteger(additionalSeats)) {
      return { success: false, error: 'Additional seats must be a positive integer' };
    }

    const { data } = await api.post(
      `/api/subscription/organizations/${organizationId}/upgrade-seats`,
      { additionalSeats }
    );

    return {
      success: true,
      data: data.data,
      message: data.message || 'Seats upgraded successfully',
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to upgrade seats';
    return { success: false, error: message };
  }
};

