import axios from 'axios';
import toast from 'react-hot-toast';
import { getStoredToken, setStoredToken, removeStoredToken, getStoredUser } from './storage';

// Check if we're in production and API_URL is set
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const API_URL = process.env.REACT_APP_API_URL;

// In production, API_URL must be set
if (IS_PRODUCTION && !API_URL) {
  console.error('❌ REACT_APP_API_URL is not set in production!');
  // You might want to show a user-friendly message here
}

const api = axios.create({
  baseURL: API_URL || 'http://localhost:1000/api', // Fallback only for development
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // INCREASED to 30 seconds for slower networks/Render wake-up
  withCredentials: true, // Important for CORS with credentials
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
    
    // Add timestamp to prevent caching issues
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
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

// ============================================
// FIXED: Response interceptor with timeout handling
// ============================================
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

    // Log errors always (even in production for debugging)
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      url: originalRequest?.url,
      baseURL: API_URL
    });

    // ============================================
    // FIX: Handle Timeout Errors (ECONNABORTED)
    // ============================================
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('⏰ Request timeout for:', originalRequest?.url);
      
      // Don't retry auth endpoints on timeout
      if (originalRequest?.url?.includes('/auth/')) {
        toast.error('Server is taking too long to respond. Please try again.');
        return Promise.reject(error);
      }
      
      // Retry logic for non-auth endpoints
      originalRequest._retryCount = originalRequest._retryCount || 0;
      const MAX_RETRIES = 2;
      
      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount++;
        console.log(`🔄 Retry ${originalRequest._retryCount}/${MAX_RETRIES} for:`, originalRequest.url);
        
        // Exponential backoff: wait longer between retries
        const delay = originalRequest._retryCount * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return api(originalRequest);
      } else {
        toast.error(`Request timed out for ${originalRequest?.url || 'unknown endpoint'}. Please refresh the page.`);
        return Promise.reject(error);
      }
    }

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        // Use full path for refresh
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
        
        // Use window.location for redirect
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
      toast.error(`The requested resource was not found.`);
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

    // Handle CORS errors (no response)
    if (error.message === 'Network Error') {
      toast.error(`Cannot connect to server. Please check your internet connection.`);
      return Promise.reject(error);
    }

    // Handle network errors (no response)
    if (!error.response) {
      toast.error(`Network error. Cannot reach server.`);
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
    const response = await api.get('/health', { timeout: 5000 }); // Shorter timeout for health check
    return response.data;
  } catch (error) {
    return { 
      status: 'error', 
      message: 'API is not reachable',
      url: API_URL,
      error: error.message 
    };
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
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  };
};

/**
 * Wake up the backend (useful for Render free tier)
 */
export const wakeBackend = async () => {
  try {
    const response = await api.get('/health', { timeout: 10000 });
    console.log('✅ Backend is awake:', response.data);
    return true;
  } catch (error) {
    console.log('⏰ Waking backend...');
    return false;
  }
};

export default api;