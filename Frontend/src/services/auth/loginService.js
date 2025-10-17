import api from '../../api/axios';

export default async function loginService(email, password) {
    try {
        const { data } = await api.post('/api/auth/login', { email, password });
        return { success: true, data };
    } catch (error) {
        const message = error?.response?.data?.error || error.message || 'Login failed';
        return { success: false, error: message };
    }
}


