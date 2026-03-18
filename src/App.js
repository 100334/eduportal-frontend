// services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://eduportal-backend-vctg.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor - just add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - simplified
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, { 
          refreshToken 
        }, {
          withCredentials: true,
          timeout: 5000
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear everything and redirect
        localStorage.clear();
        window.location.href = '/learner/login';
        return Promise.reject(refreshError);
      }
    }

    // Simple error message - don't show on 401 (handled above)
    if (error.response?.status !== 401 && error.code !== 'ERR_CANCELED') {
      // You can show a toast here if you want, but do it outside the interceptor
      console.error('API Error:', error);
    }

    return Promise.reject(error);
  }
);

export default api;