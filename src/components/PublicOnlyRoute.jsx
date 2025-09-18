import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  // Only honor stored dashboard path when authenticated to avoid loops
  const stored = typeof window !== 'undefined' ? localStorage.getItem('dashboard_path') : null;
  if (isAuthenticated && stored) {
    return <Navigate to={stored} replace />;
  }

  // After initialization, if authenticated but without a stored path, send to default dashboard
  if (isInitialized && isAuthenticated) {
    return <Navigate to="/dashboard/customer" replace />;
  }

  return children || null;
};

export default PublicOnlyRoute;


