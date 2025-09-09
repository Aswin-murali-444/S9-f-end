import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  // If we already know the user's intended dashboard, redirect immediately
  const stored = typeof window !== 'undefined' ? localStorage.getItem('dashboard_path') : null;
  if (stored) {
    return <Navigate to={stored} replace />;
  }

  // After initialization, if authenticated but without a stored path, fall back to home
  if (isInitialized && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children || null;
};

export default PublicOnlyRoute;


