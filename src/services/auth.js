import api from './api';

export const authService = {
  // Teacher login
  teacherLogin: async (username, password) => {
    try {
      const response = await api.post('/auth/teacher/login', { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Learner login
  learnerLogin: async (name, regNumber) => {
    try {
      const response = await api.post('/auth/learner/login', { name, regNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;