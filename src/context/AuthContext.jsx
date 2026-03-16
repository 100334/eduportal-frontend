import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { getStoredUser, setStoredUser, removeStoredUser, getStoredToken, setStoredToken, removeStoredToken } from '../services/storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getStoredToken());

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      if (storedUser && token) {
        setUser(storedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setStoredUser(userData);
    setStoredToken(authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // Log role for debugging
    console.log('User logged in:', { role: userData.role, name: userData.name || userData.username });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStoredUser();
    removeStoredToken();
    delete api.defaults.headers.common['Authorization'];
  };

  // Helper function to check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Teacher permissions
    if (user.role === 'teacher') {
      const teacherPermissions = [
        'view_learners',
        'create_reports',
        'take_attendance',
        'view_own_classes'
      ];
      return teacherPermissions.includes(permission);
    }
    
    // Learner permissions
    if (user.role === 'learner') {
      const learnerPermissions = [
        'view_own_reports',
        'view_own_attendance',
        'view_own_profile'
      ];
      return learnerPermissions.includes(permission);
    }
    
    return false;
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/learner/login';
    
    switch(user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'learner':
        return '/learner/dashboard';
      default:
        return '/learner/login';
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    hasPermission,
    getDashboardPath,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isLearner: user?.role === 'learner',
    
    // Convenience getters
    userId: user?.id,
    userName: user?.name || user?.username,
    userEmail: user?.email,
    userRole: user?.role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}