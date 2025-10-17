import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import loginService from '../services/auth/loginService';
import { setAuth, clearAuth, setLoading, setError } from '../store/userSlice';
import logoutService from '../services/auth/LogoutService';

export default function useUser() {
    const dispatch = useDispatch();
    const userState = useSelector((state) => state.user);

    const login = useCallback(async (email, password) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const result = await loginService(email, password);
        if (result.success) {
            const { token, user } = result.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
            dispatch(setAuth({ token, user }));
        } else {
            dispatch(setError(result.error || 'Login failed'));
        }
        dispatch(setLoading(false));
        return result;
    }, [dispatch]);

    const logout = useCallback(async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const result = await logoutService();
        // Regardless of API result, clear client state to ensure logout UX
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        dispatch(clearAuth());
        if (!result.success) {
            dispatch(setError(result.error || 'Logout failed'));
        }
        dispatch(setLoading(false));
        return result.success;
    }, [dispatch]);

    return { ...userState, login, logout };
}

