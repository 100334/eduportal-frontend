import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { getStoredUser, setStoredUser, removeStoredUser, getStoredToken, setStoredToken, removeStoredToken } from '../services/storage';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getStoredToken());
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = getStoredUser();
        const storedToken = getStoredToken();
        
        if (storedUser && storedToken) {
          // Validate token by fetching current user
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
              setUser(response.data.user);
              setToken(storedToken);
              console.log('✅ Auth initialized for:', response.data.user.role);
            } else {
              // Token invalid - clear storage
              console.log('❌ Token invalid, clearing auth');
              removeStoredUser();
              removeStoredToken();
              delete api.defaults.headers.common['Authorization'];
            }
          } catch (error) {
            console.log('❌ Auth validation failed:', error.message);
            // Token might be expired - try refresh
            try {
              const refreshResponse = await api.post('/auth/refresh');
              if (refreshResponse.data.token) {
                const newToken = refreshResponse.data.token;
                setStoredToken(newToken);
                setToken(newToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                
                // Fetch user with new token
                const userResponse = await api.get('/auth/me');
                if (userResponse.data.success) {
                  setUser(userResponse.data.user);
                  setStoredUser(userResponse.data.user);
                  console.log('✅ Token refreshed successfully');
                }
              } else {
                throw new Error('Refresh failed');
              }
            } catch (refreshError) {
              console.log('❌ Token refresh failed:', refreshError.message);
              removeStoredUser();
              removeStoredToken();
              delete api.defaults.headers.common['Authorization'];
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (userData, authToken) => {
    try {
      setUser(userData);
      setToken(authToken);
      setStoredUser(userData);
      setStoredToken(authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      // Log role for debugging
      console.log('✅ User logged in:', { 
        role: userData.role, 
        name: userData.name || userData.username,
        id: userData.id
      });

      // Store user role in localStorage for quick access
      localStorage.setItem('userRole', userData.role);
      
      return true;
    } catch (error) {
      console.error('Login error in context:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      await api.post('/auth/logout').catch(() => {});
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setToken(null);
      removeStoredUser();
      removeStoredToken();
      localStorage.removeItem('userRole');
      delete api.defaults.headers.common['Authorization'];
      
      console.log('✅ User logged out');
      
      // Show logout message
      toast.success('Logged out successfully');
    }
  };

  // Helper function to check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Teacher permissions
    if (user.role === 'teacher') {
      const teacherPermissions = {
        'view_learners': true,
        'manage_learners': true,
        'create_reports': true,
        'edit_reports': true,
        'delete_reports': false, // Teachers cannot delete reports
        'take_attendance': true,
        'edit_attendance': true,
        'view_own_classes': true,
        'view_all_classes': false,
        'manage_subjects': false,
        'access_admin': false
      };
      return teacherPermissions[permission] || false;
    }
    
    // Learner permissions
    if (user.role === 'learner') {
      const learnerPermissions = {
        'view_own_reports': true,
        'view_own_attendance': true,
        'view_own_profile': true,
        'edit_own_profile': false,
        'view_other_learners': false,
        'access_teacher_panel': false,
        'access_admin': false
      };
      return learnerPermissions[permission] || false;
    }
    
    return false;
  };

  // Check if user can access a specific route
  const canAccessRoute = (requiredRole) => {
    if (!user) return false;
    if (!requiredRole) return true;
    
    if (requiredRole === 'admin' && user.role === 'admin') return true;
    if (requiredRole === 'teacher' && (user.role === 'teacher' || user.role === 'admin')) return true;
    if (requiredRole === 'learner' && (user.role === 'learner' || user.role === 'admin' || user.role === 'teacher')) return true;
    
    return user.role === requiredRole;
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

  // Refresh user data from API
  const refreshUserData = async () => {
    if (!token) return null;
    
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        setStoredUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
    return null;
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    initialized,
    hasPermission,
    canAccessRoute,
    getDashboardPath,
    refreshUserData,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isLearner: user?.role === 'learner',
    
    // Convenience getters
    userId: user?.id,
    userName: user?.name || user?.username || '',
    userEmail: user?.email || '',
    userRole: user?.role,
    userRegNumber: user?.regNumber || user?.reg_number || '',
    userGrade: user?.grade || '',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}