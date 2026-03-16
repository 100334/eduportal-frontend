import axios from 'axios';
import toast from 'react-hot-toast';
import { getStoredToken, setStoredToken, removeStoredToken, getStoredUser } from './storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user role header for admin tracking
    const user = getStoredUser();
    if (user?.role) {
      config.headers['X-User-Role'] = user.role;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        data: config.data || '',
        params: config.params || '',
        role: user?.role || 'public'
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', {
        status: response.status,
        data: response.data,
        url: response.config.url
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: originalRequest?.url
      });
    }

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await api.post('/auth/refresh');
        const { token } = response.data;

        setStoredToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        removeStoredToken();
        localStorage.removeItem('user');
        
        // Get current user role for redirect
        const user = getStoredUser();
        const redirectPath = user?.role === 'admin' ? '/admin/login' : 
                            user?.role === 'teacher' ? '/teacher/login' : 
                            '/learner/login';
        
        window.location.href = redirectPath;
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden errors (permission denied)
    if (error.response?.status === 403) {
      const user = getStoredUser();
      toast.error(`Access denied. You don't have permission to perform this action.`);
      
      // Redirect based on role
      if (user?.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (user?.role === 'teacher') {
        window.location.href = '/teacher/dashboard';
      } else {
        window.location.href = '/learner/dashboard';
      }
      return Promise.reject(error);
    }

    // Handle 429 Too Many Requests (rate limiting)
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment before trying again.');
      return Promise.reject(error);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later or contact support.');
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', originalRequest?.url);
      toast.error('The requested resource was not found.');
      return Promise.reject(error);
    }

    // Handle 400 Bad Request with validation errors
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      if (Array.isArray(validationErrors)) {
        validationErrors.forEach(err => {
          toast.error(err.msg || err.message || 'Validation error');
        });
      } else {
        toast.error(error.response.data.message || 'Bad request');
      }
      return Promise.reject(error);
    }

    // Handle network errors (no response)
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error('Network error. Cannot reach server.');
      return Promise.reject(error);
    }

    // Handle other errors with custom message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Don't show toast for 401 errors (handled above)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTIONS FOR API CALLS
// ============================================

/**
 * Make a GET request with error handling
 */
export const get = async (url, params = {}, showToast = true) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    if (!showToast) throw error;
    throw error;
  }
};

/**
 * Make a POST request with error handling
 */
export const post = async (url, data = {}, showToast = true) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    if (!showToast) throw error;
    throw error;
  }
};

/**
 * Make a PUT request with error handling
 */
export const put = async (url, data = {}, showToast = true) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    if (!showToast) throw error;
    throw error;
  }
};

/**
 * Make a DELETE request with error handling
 */
export const del = async (url, showToast = true) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    if (!showToast) throw error;
    throw error;
  }
};

/**
 * Check if API is healthy
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'error', message: 'API is not reachable' };
  }
};

/**
 * Get API status with role info
 */
export const getApiStatus = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  
  return {
    isConnected: !!token,
    baseURL: API_URL,
    userRole: user?.role || null,
    isAuthenticated: !!token,
    timestamp: new Date().toISOString()
  };
};

export default api;