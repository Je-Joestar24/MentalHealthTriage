import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import loginService from '../services/auth/loginService';
import {
    setAuth,
    clearAuth,
    setLoading,
    setError,
    setRegistrationStep,
    setRegistrationLoading,
    setRegistrationError,
    setEmailChecked,
    setTempUser,
    setTempOrganization,
    setCheckoutSession,
    clearRegistration,
} from '../store/userSlice';
import logoutService from '../services/auth/LogoutService';
import registerService from '../services/auth/registerService';

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

    // Registration functions
    const checkEmail = useCallback(async (email) => {
        dispatch(setRegistrationLoading(true));
        dispatch(setRegistrationError(null));
        const result = await registerService.checkEmail(email);
        if (result.success) {
            dispatch(setEmailChecked(true));
            dispatch(setRegistrationStep('email'));
        } else {
            dispatch(setRegistrationError(result.error || 'Failed to check email'));
        }
        dispatch(setRegistrationLoading(false));
        return result;
    }, [dispatch]);

    const createTempUser = useCallback(async (userData) => {
        dispatch(setRegistrationLoading(true));
        dispatch(setRegistrationError(null));
        const result = await registerService.createTempUser(userData);
        if (result.success) {
            dispatch(setTempUser(result.data.user));
            if (result.data.organization) {
                dispatch(setTempOrganization(result.data.organization));
            }
            dispatch(setRegistrationStep('checkout'));
        } else {
            dispatch(setRegistrationError(result.error || 'Failed to create user'));
        }
        dispatch(setRegistrationLoading(false));
        return result;
    }, [dispatch]);

    const createCheckoutSession = useCallback(async (sessionData) => {
        dispatch(setRegistrationLoading(true));
        dispatch(setRegistrationError(null));
        const result = await registerService.createCheckoutSession(sessionData);
        if (result.success) {
            dispatch(setCheckoutSession(result.data));
            dispatch(setRegistrationStep('payment'));
        } else {
            dispatch(setRegistrationError(result.error || 'Failed to create checkout session'));
        }
        dispatch(setRegistrationLoading(false));
        return result;
    }, [dispatch]);

    const clearRegistrationState = useCallback(() => {
        dispatch(clearRegistration());
    }, [dispatch]);

    return {
        ...userState,
        login,
        logout,
        // Registration functions
        checkEmail,
        createTempUser,
        createCheckoutSession,
        clearRegistrationState,
    };
}

