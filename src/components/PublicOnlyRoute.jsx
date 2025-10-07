import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Check both React state and localStorage for immediate auth state
  const isAuthFromStorage = localStorage.getItem('isAuthenticated') === 'true';
  const userFromStorage = localStorage.getItem('user');
  
  // Don't redirect if we're on login page and just logged in (let the form handle it)
  if (location.pathname === '/login' && !isAuthenticated && !isAuthFromStorage) {
    return children;
  }
  
  if ((isAuthenticated && user) || (isAuthFromStorage && userFromStorage)) {
    const currentUser = user || (userFromStorage ? JSON.parse(userFromStorage) : null);
    console.log('🔄 PublicOnlyRoute: User is authenticated, redirecting...', {
      user: currentUser?.email,
      isAuthenticated: isAuthenticated || isAuthFromStorage,
      location: location.pathname
    });
    
    // Get the stored dashboard path
    let targetPath = '/';
    try {
      targetPath = localStorage.getItem('dashboard_path') || '/';
    } catch (_) {
      targetPath = '/';
    }
    
    // If no specific dashboard path, try to get role and redirect accordingly
    if (targetPath === '/' || targetPath === '/dashboard') {
      const userRole = localStorage.getItem('user_role');
      console.log('🔍 PublicOnlyRoute: No dashboard path, checking role:', userRole);
      
      if (userRole === 'service_provider') {
        targetPath = '/dashboard/provider';
      } else if (userRole === 'customer') {
        targetPath = '/dashboard/customer';
      } else if (userRole === 'admin') {
        targetPath = '/dashboard/admin';
      } else if (userRole === 'supervisor') {
        targetPath = '/dashboard/supervisor';
      } else if (userRole === 'driver') {
        targetPath = '/dashboard/driver';
      } else {
        // Default to customer dashboard instead of homepage
        targetPath = '/dashboard/customer';
        console.log('🔍 PublicOnlyRoute: No role found, defaulting to customer dashboard');
      }
    }
    
    console.log('🚀 PublicOnlyRoute: Redirecting to:', targetPath);
    return <Navigate to={targetPath} replace state={{ from: location }} />;
  }

  // User is not authenticated, show the public page
  return children;
};

export default PublicOnlyRoute;
