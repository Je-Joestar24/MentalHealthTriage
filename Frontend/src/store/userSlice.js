import { createSlice/* , createAsyncThunk */ } from '@reduxjs/toolkit';
//import loginService from '../services/auth/login';
// import signupService from '../services/auth/signup';
//import logoutService from '../services/auth/logout';


// Async thunk for login
/* export const login = createAsyncThunk(
    'user/login',
    async ({ email, password }, { rejectWithValue }) => {
        const result = await loginService(email, password);
        if (result.success) {
            // Store token in localStorage
            if (result.data.access_token) localStorage.setItem('token', result.data.access_token);
            if (result.data.user) localStorage.setItem('user', JSON.stringify(result.data.user));

            return {
                user: result.data.user || null,
                token: result.data.access_token || null,
            };
        } else {
            return rejectWithValue(result.error);
        }
    }
);

export const logout = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue }) => {
        const result = await logoutService();
        if (result.success) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {};
        } else {
            return rejectWithValue(result.error);
        }
    }
);

// Async thunk for signup
export const signup = createAsyncThunk(
    'user/signup',
    async ({ name, email, password, password_confirmation }, { rejectWithValue }) => {
        const result = await signupService(name, email, password, password_confirmation);
        if (result.success) {
            if (result.data.access_token) localStorage.setItem('token', result.data.access_token);
            if (result.data.user) localStorage.setItem('user', JSON.stringify(result.data.user));
            return {
                user: result.data.user || null,
                token: result.data.access_token || null,
                message: result.data.message || 'Registration successful.',
            };
        } else {
            // Pass both error message and field errors
            return rejectWithValue({
                error: result.error,
                errors: result.errors,
            });
        }
    }
);

 */

const initialState = {
    user: JSON.parse(sessionStorage.getItem('user')) || null,
    token: sessionStorage.getItem('token') || null,
    userLogged: !!sessionStorage.getItem('token'),
    loading: false,
    error: null,
    signupErrors: null,
    signupMessage: null,
};
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = !!action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload || null;
        },
        setAuth: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.userLogged = !!action.payload.token;
            state.error = null;
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.userLogged = false;
            state.error = null;
        },
    },
/*     extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.userLogged = !!action.payload.token;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
            })
            // Signup reducers
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.signupErrors = null;
                state.signupMessage = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.userLogged = !!action.payload.token;
                state.signupMessage = action.payload.message;
                state.signupErrors = null;
                state.error = null;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Signup failed';
                state.signupErrors = action.payload?.errors || null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.userLogged = false;
                state.loading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Logout failed';
            });
    }, */
});

export const { setAuth, clearAuth, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;