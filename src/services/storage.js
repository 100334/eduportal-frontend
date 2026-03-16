// src/services/storage.js

// ============================================
// USER STORAGE
// ============================================

/**
 * Get stored user data from localStorage
 * @returns {Object|null} User object or null
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

/**
 * Store user data in localStorage
 * @param {Object} user - User object to store
 */
export const setStoredUser = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
    // Also store the role separately for quick access
    if (user && user.role) {
      localStorage.setItem('userRole', user.role);
    }
  } catch (error) {
    console.error('Error setting stored user:', error);
  }
};

/**
 * Remove user data from localStorage
 */
export const removeStoredUser = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  } catch (error) {
    console.error('Error removing stored user:', error);
  }
};

// ============================================
// TOKEN STORAGE
// ============================================

/**
 * Get stored auth token from localStorage
 * @returns {string|null} Auth token or null
 */
export const getStoredToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

/**
 * Store auth token in localStorage
 * @param {string} token - Auth token to store
 */
export const setStoredToken = (token) => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting stored token:', error);
  }
};

/**
 * Remove auth token from localStorage
 */
export const removeStoredToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing stored token:', error);
  }
};

// ============================================
// ROLE-SPECIFIC STORAGE
// ============================================

/**
 * Get stored user role from localStorage
 * @returns {string|null} User role or null
 */
export const getStoredUserRole = () => {
  try {
    return localStorage.getItem('userRole');
  } catch (error) {
    console.error('Error getting stored user role:', error);
    return null;
  }
};

/**
 * Store user role in localStorage
 * @param {string} role - User role (admin, teacher, learner)
 */
export const setStoredUserRole = (role) => {
  try {
    localStorage.setItem('userRole', role);
  } catch (error) {
    console.error('Error setting stored user role:', error);
  }
};

/**
 * Remove user role from localStorage
 */
export const removeStoredUserRole = () => {
  try {
    localStorage.removeItem('userRole');
  } catch (error) {
    console.error('Error removing stored user role:', error);
  }
};

// ============================================
// ADMIN-SPECIFIC STORAGE
// ============================================

/**
 * Store admin preferences
 * @param {Object} preferences - Admin preferences object
 */
export const setAdminPreferences = (preferences) => {
  try {
    localStorage.setItem('adminPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error setting admin preferences:', error);
  }
};

/**
 * Get admin preferences from localStorage
 * @returns {Object|null} Admin preferences or null
 */
export const getAdminPreferences = () => {
  try {
    const prefs = localStorage.getItem('adminPreferences');
    return prefs ? JSON.parse(prefs) : null;
  } catch (error) {
    console.error('Error getting admin preferences:', error);
    return null;
  }
};

/**
 * Remove admin preferences from localStorage
 */
export const removeAdminPreferences = () => {
  try {
    localStorage.removeItem('adminPreferences');
  } catch (error) {
    console.error('Error removing admin preferences:', error);
  }
};

// ============================================
// TEACHER-SPECIFIC STORAGE
// ============================================

/**
 * Store teacher preferences
 * @param {Object} preferences - Teacher preferences object
 */
export const setTeacherPreferences = (preferences) => {
  try {
    localStorage.setItem('teacherPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error setting teacher preferences:', error);
  }
};

/**
 * Get teacher preferences from localStorage
 * @returns {Object|null} Teacher preferences or null
 */
export const getTeacherPreferences = () => {
  try {
    const prefs = localStorage.getItem('teacherPreferences');
    return prefs ? JSON.parse(prefs) : null;
  } catch (error) {
    console.error('Error getting teacher preferences:', error);
    return null;
  }
};

/**
 * Remove teacher preferences from localStorage
 */
export const removeTeacherPreferences = () => {
  try {
    localStorage.removeItem('teacherPreferences');
  } catch (error) {
    console.error('Error removing teacher preferences:', error);
  }
};

// ============================================
// LEARNER-SPECIFIC STORAGE
// ============================================

/**
 * Store learner preferences
 * @param {Object} preferences - Learner preferences object
 */
export const setLearnerPreferences = (preferences) => {
  try {
    localStorage.setItem('learnerPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error setting learner preferences:', error);
  }
};

/**
 * Get learner preferences from localStorage
 * @returns {Object|null} Learner preferences or null
 */
export const getLearnerPreferences = () => {
  try {
    const prefs = localStorage.getItem('learnerPreferences');
    return prefs ? JSON.parse(prefs) : null;
  } catch (error) {
    console.error('Error getting learner preferences:', error);
    return null;
  }
};

/**
 * Remove learner preferences from localStorage
 */
export const removeLearnerPreferences = () => {
  try {
    localStorage.removeItem('learnerPreferences');
  } catch (error) {
    console.error('Error removing learner preferences:', error);
  }
};

// ============================================
// SESSION STORAGE (Temporary data)
// ============================================

/**
 * Store temporary data in sessionStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const setSessionData = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting session data:', error);
  }
};

/**
 * Get temporary data from sessionStorage
 * @param {string} key - Storage key
 * @returns {any} Stored value or null
 */
export const getSessionData = (key) => {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
};

/**
 * Remove temporary data from sessionStorage
 * @param {string} key - Storage key
 */
export const removeSessionData = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing session data:', error);
  }
};

/**
 * Clear all session storage
 */
export const clearSessionData = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing session data:', error);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user is authenticated (has token and user data)
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};

/**
 * Get current user role
 * @returns {string|null} User role or null
 */
export const getCurrentUserRole = () => {
  const user = getStoredUser();
  return user?.role || null;
};

/**
 * Check if current user has specific role
 * @param {string} role - Role to check (admin, teacher, learner)
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getCurrentUserRole();
  return userRole === role;
};

/**
 * Clear all authentication data (logout)
 */
export const clearAuthData = () => {
  removeStoredUser();
  removeStoredToken();
  removeStoredUserRole();
  removeAdminPreferences();
  removeTeacherPreferences();
  removeLearnerPreferences();
  // Don't clear all localStorage as it might affect other apps
  // Use selective removal instead
};

/**
 * Clear ALL storage (use with caution)
 */
export const clearAllStorage = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Get storage usage information (for debugging)
 * @returns {Object} Storage usage stats
 */
export const getStorageInfo = () => {
  const info = {
    localStorage: {},
    sessionStorage: {}
  };

  try {
    // Local storage info
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      info.localStorage[key] = {
        size: value ? value.length : 0,
        type: typeof value
      };
    }

    // Session storage info
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      info.sessionStorage[key] = {
        size: value ? value.length : 0,
        type: typeof value
      };
    }

    return info;
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};