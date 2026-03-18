// services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://eduportal-backend-vctg.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // INCREASED: Render needs time to wake up (cold start)
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

let isRefreshing = false;
let failedQueue = [];
const MAX_RETRIES = 3;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. HANDLE TIMEOUTS (The "Render" fix)
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error("⏱️ Timeout: Server is likely waking up. Please wait.");
      toast.error('Server is taking a moment to wake up. Retrying...', { id: 'timeout' });
      // Optional: You could add a manual retry here
      return Promise.reject(error);
    }

    // 2. PREVENT INFINITE RETRIES
    originalRequest._retryCount = originalRequest._retryCount || 0;
    if (originalRequest._retryCount >= MAX_RETRIES) {
      toast.error('Connection lost. Please refresh the page.');
      return Promise.reject(error);
    }

    // 3. HANDLE 401 UNAUTHORIZED
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/refresh') {
        localStorage.clear();
        window.location.href = '/learner/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      originalRequest._retryCount++;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, {
          withCredentials: true,
          timeout: 10000
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
          processQueue(null, response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
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