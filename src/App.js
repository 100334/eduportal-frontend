// services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://eduportal-backend-vctg.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add token to every request
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

// ============================================
// FIXED: Response interceptor with loop prevention
// ============================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop on refresh endpoint itself
    if (originalRequest.url === '/auth/refresh') {
      console.log('❌ Refresh token failed - clearing auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/learner/login';
      }
      return Promise.reject(error);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, { 
          refreshToken 
        }, {
          withCredentials: true
        });

        if (response.data.token) {
          // Store new token
          localStorage.setItem('token', response.data.token);
          
          // Update authorization header
          api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
          
          // Process queued requests
          processQueue(null, response.data.token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        } else {
          throw new Error('No token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed - clear everything
        processQueue(refreshError, null);
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        
        // Only redirect if not on login page
        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/learner/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      toast.error('You do not have permission to access this resource');
    } else if (error.response?.status === 429) {
      console.error('Rate limited:', error.response.data);
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;