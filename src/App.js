// services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================
// FIXED: Remove trailing /api from the base URL
// ============================================
const API_URL = process.env.REACT_APP_API_URL || 'https://eduportal-backend-vctg.onrender.com';
// No '/api' at the end - your backend already has /api in routes

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // INCREASED to 30 seconds for Render wake-up
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// SIMPLIFIED: Response interceptor with better timeout handling
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        code: error.code
      });
    }

    // ============================================
    // Handle Timeout Errors (Render wake-up)
    // ============================================
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('⏰ Request timeout - Render may be waking up:', originalRequest?.url);
      
      // Don't show toast for every timeout, just log
      if (originalRequest?.url?.includes('/health')) {
        // Silent fail for health checks
        return Promise.reject(error);
      }
      
      // Show friendly message for actual requests
      toast.error('Server is waking up. Please try again in a moment.', {
        duration: 4000
      });
      
      return Promise.reject(error);
    }

    // ============================================
    // Handle 401 - Token refresh
    // ============================================
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/api/auth/refresh`, { 
          refreshToken 
        }, {
          withCredentials: true,
          timeout: 10000
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.clear();
        
        // Don't redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/learner/login';
          toast.error('Session expired. Please login again.');
        }
        
        return Promise.reject(refreshError);
      }
    }

    // ============================================
    // Handle 404 - Route not found
    // ============================================
    if (error.response?.status === 404) {
      console.error('Route not found:', `${API_URL}${originalRequest?.url}`);
      toast.error(`API endpoint not found: ${originalRequest?.url}`);
      return Promise.reject(error);
    }

    // ============================================
    // Handle 429 - Rate limited
    // ============================================
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.');
      return Promise.reject(error);
    }

    // ============================================
    // Handle 500 - Server error
    // ============================================
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // ============================================
    // Handle Network Errors (CORS, DNS, etc.)
    // ============================================
    if (error.message === 'Network Error') {
      toast.error('Cannot connect to server. Please check your connection.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER: Test API connection
// ============================================
export const testConnection = async () => {
  try {
    const response = await api.get('/test', { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      url: API_URL
    };
  }
};

// ============================================
// HELPER: Check health
// ============================================
export const checkHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      url: API_URL
    };
  }
};

export default api;