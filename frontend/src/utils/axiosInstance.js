import axios from 'axios';

import {BASE_URL} from "./apiPaths";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

    //Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
    //Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors
        if (error.response) {
            if (error.response.status === 401) {
                // Handle unauthorized access, e.g., redirect to login
                window.location.href = '/';
            }else if (error.response.status === 500) {
                console.error('Server Error:', error.response.data.message);
            }
        }else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout. Please try again.');
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;