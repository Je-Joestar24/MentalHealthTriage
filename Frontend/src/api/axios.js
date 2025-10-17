import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 30000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Attach Bearer token from sessionStorage
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;
