import api from '../../api/axios';

/**
 * Check email availability for registration
 * @param {string} email - Email to check
 * @returns {Promise<{success: boolean, available?: boolean, error?: string}>}
 */
export async function checkEmail(email) {
    try {
        const { data } = await api.post('/api/auth/check-email', { email });
        return {
            success: true,
            available: data.available,
            message: data.message,
        };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to check email';
        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Create temporary user before payment
 * @param {Object} userData - User registration data
 * @param {string} userData.accountType - 'individual' or 'organization'
 * @param {string} userData.name - User name (for individual) or admin name (for organization)
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} [userData.companyName] - Company name (for organization)
 * @param {string} [userData.adminName] - Admin name (for organization, can use name)
 * @param {number} [userData.seats] - Number of seats (for organization, minimum 4)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function createTempUser(userData) {
    try {
        const { data } = await api.post('/api/auth/create-temp-user', userData);
        return {
            success: true,
            data: data.data,
            message: data.message,
        };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to create user';
        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Create Stripe checkout session
 * @param {Object} sessionData - Checkout session data
 * @param {string} sessionData.userId - User ID
 * @param {string} [sessionData.organizationId] - Organization ID (for organization accounts)
 * @param {string} sessionData.accountType - 'individual' or 'organization'
 * @param {number} [sessionData.seats] - Number of seats (for organization)
 * @param {string} sessionData.successUrl - Success redirect URL
 * @param {string} sessionData.cancelUrl - Cancel redirect URL
 * @returns {Promise<{success: boolean, data?: {sessionId: string, url: string}, error?: string}>}
 */
export async function createCheckoutSession(sessionData) {
    try {
        const { data } = await api.post('/api/auth/create-checkout-session', sessionData);
        return {
            success: true,
            data: data.data,
            message: data.message,
        };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Failed to create checkout session';
        return {
            success: false,
            error: message,
        };
    }
}

export default {
    checkEmail,
    createTempUser,
    createCheckoutSession,
};

