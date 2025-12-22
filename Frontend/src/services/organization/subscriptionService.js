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

/**
 * Schedule organization subscription cancellation at period end
 * @param {string} organizationId - Organization ID
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const scheduleOrganizationCancellation = async (organizationId, reason = '') => {
  try {
    if (!organizationId) {
      return { success: false, error: 'Organization ID is required' };
    }

    const { data } = await api.post(
      `/api/subscription/organizations/${organizationId}/cancel-at-period-end`,
      { reason }
    );

    return {
      success: true,
      data: data.data,
      message: data.message || 'Cancellation scheduled successfully',
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to schedule cancellation';
    return { success: false, error: message };
  }
};

/**
 * Undo scheduled organization subscription cancellation
 * @param {string} organizationId - Organization ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const undoOrganizationCancellation = async (organizationId) => {
  try {
    if (!organizationId) {
      return { success: false, error: 'Organization ID is required' };
    }

    const { data } = await api.post(
      `/api/subscription/organizations/${organizationId}/undo-cancel`
    );

    return {
      success: true,
      data: data.data,
      message: data.message || 'Cancellation undone successfully',
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to undo cancellation';
    return { success: false, error: message };
  }
};

/**
 * Schedule individual user subscription cancellation at period end
 * @param {string} userId - User ID
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const scheduleUserCancellation = async (userId, reason = '') => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const { data } = await api.post(
      `/api/subscription/users/${userId}/cancel-at-period-end`,
      { reason }
    );

    return {
      success: true,
      data: data.data,
      message: data.message || 'Cancellation scheduled successfully',
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to schedule cancellation';
    return { success: false, error: message };
  }
};

/**
 * Undo scheduled individual user subscription cancellation
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const undoUserCancellation = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const { data } = await api.post(
      `/api/subscription/users/${userId}/undo-cancel`
    );

    return {
      success: true,
      data: data.data,
      message: data.message || 'Cancellation undone successfully',
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to undo cancellation';
    return { success: false, error: message };
  }
};

