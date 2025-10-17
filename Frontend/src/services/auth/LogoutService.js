import api from '../../api/axios';

export default async function logoutService() {
    try {
        await api.post('/api/auth/logout');
        return { success: true };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Logout failed';
        return { success: false, error: message };
    }
}

