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
  timeout: 10000, // Add timeout to prevent hanging requests
});

// Request interceptor
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
// URGENT FIX: Prevent infinite retry loops
// ============================================
let isRefreshing = false;
let failedQueue = [];
let requestCount = 0;
const MAX_RETRIES = 3;

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
    
    // Track retry count
    originalRequest._retryCount = originalRequest._retryCount || 0;
    
    // CRITICAL: Don't retry if we've already tried too many times
    if (originalRequest._retryCount >= MAX_RETRIES) {
      console.error(`❌ Max retries (${MAX_RETRIES}) reached for:`, originalRequest.url);
      
      // Show user-friendly message
      if (originalRequest.url !== '/auth/refresh') {
        toast.error('Connection issues. Please refresh the page.');
      }
      
      return Promise.reject(error);
    }
    
    // Don't retry on 429 (rate limit) - wait and let user refresh
    if (error.response?.status === 429) {
      console.error('⛔ Rate limited. Stopping all requests.');
      
      // Clear any pending requests
      toast.error('Too many requests. Please wait a moment and refresh the page.');
      
      // Don't retry - just reject
      return Promise.reject(error);
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Special case: Don't try to refresh the refresh endpoint
      if (originalRequest.url === '/auth/refresh') {
        console.log('❌ Refresh token failed - logging out');
        localStorage.clear();
        window.location.href = '/learner/login';
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // Queue this request
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
      originalRequest._retryCount++;
      isRefreshing = true;

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
          api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
          processQueue(null, response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        } else {
          throw new Error('No token in response');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        
        // Only redirect if not on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/learner/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;