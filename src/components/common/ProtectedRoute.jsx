import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on the role they were trying to access
    switch(role) {
      case 'admin':
        return <Navigate to="/admin/login" replace />;
      case 'teacher':
        return <Navigate to="/teacher/login" replace />;
      case 'learner':
        return <Navigate to="/learner/login" replace />;
      default:
        return <Navigate to="/learner/login" replace />;
    }
  }

  // Check if user has the required role
  if (role && user?.role !== role) {
    // Redirect to their own dashboard if they try to access wrong section
    switch(user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" replace />;
      case 'learner':
        return <Navigate to="/learner/dashboard" replace />;
      default:
        return <Navigate to="/learner/login" replace />;
    }
  }

  return <Outlet />;
}