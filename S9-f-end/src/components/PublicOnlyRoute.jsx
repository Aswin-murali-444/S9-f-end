import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectTimeoutRef = useRef(null);
  const lastRedirectRef = useRef(null);

  // Reset redirect state when location changes
  useEffect(() => {
    setHasRedirected(false);
    lastRedirectRef.current = null;
  }, [location.pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // Don't redirect if we're on login page and just logged in (let the form handle it)
  if (location.pathname === '/login' && !isAuthenticated && !isAuthFromStorage) {
    return children;
  }

  // Prevent redirect loops by checking if we've already redirected
  if ((isAuthenticated && user) || (isAuthFromStorage && userFromStorage)) {
    if (hasRedirected) {
      return children; // Prevent infinite redirects
    }

    const currentUser = user || (userFromStorage ? JSON.parse(userFromStorage) : null);
    const authState = isAuthenticated || isAuthFromStorage;

    // On auth pages, avoid premature defaulting; wait for a definitive target
    if (isAuthPage) {
      let targetPath = localStorage.getItem('dashboard_path');
      if (!targetPath || targetPath === '/' || targetPath === '/dashboard') {
        const userRole = localStorage.getItem('user_role');
        if (userRole === 'service_provider') targetPath = '/dashboard/provider';
        else if (userRole === 'customer') targetPath = '/dashboard/customer';
        else if (userRole === 'admin') targetPath = '/dashboard/admin';
        else if (userRole === 'supervisor') targetPath = '/dashboard/supervisor';
        else if (userRole === 'driver') targetPath = '/dashboard/driver';
      }

      // If we still don't have a definitive target, show a brief loader and
      // let the login/register page logic perform its own redirect once ready.
      if (!targetPath) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <LoadingSpinner size="large" />
          </div>
        );
      }

      // Debounce redirects to prevent rapid navigation
      const now = Date.now();
      if (lastRedirectRef.current && (now - lastRedirectRef.current) < 1000) {
        console.log('🚀 PublicOnlyRoute: Debouncing redirect to prevent rapid navigation');
        return children;
      }
      lastRedirectRef.current = now;

      console.log('🚀 PublicOnlyRoute(AuthPage): Redirecting to:', targetPath, {
        user: currentUser?.email,
        isAuthenticated: authState,
        location: location.pathname
      });
      
      // Set redirect flag to prevent loops
      setHasRedirected(true);
      
      return <Navigate to={targetPath} replace state={{ from: location }} />;
    }

    // For any other public-only route (if used), redirect to a known target
    let targetPath = localStorage.getItem('dashboard_path');
    if (!targetPath || targetPath === '/' || targetPath === '/dashboard') {
      const userRole = localStorage.getItem('user_role');
      if (userRole === 'service_provider') targetPath = '/dashboard/provider';
      else if (userRole === 'customer') targetPath = '/dashboard/customer';
      else if (userRole === 'admin') targetPath = '/dashboard/admin';
      else if (userRole === 'supervisor') targetPath = '/dashboard/supervisor';
      else if (userRole === 'driver') targetPath = '/dashboard/driver';
      else targetPath = '/dashboard/customer'; // Default to customer dashboard instead of home page
    }

    // Debounce redirects to prevent rapid navigation
    const now = Date.now();
    if (lastRedirectRef.current && (now - lastRedirectRef.current) < 1000) {
      console.log('🚀 PublicOnlyRoute: Debouncing redirect to prevent rapid navigation');
      return children;
    }
    lastRedirectRef.current = now;

    console.log('🚀 PublicOnlyRoute: Redirecting to:', targetPath, {
      user: currentUser?.email,
      isAuthenticated: authState,
      location: location.pathname
    });
    
    // Set redirect flag to prevent loops
    setHasRedirected(true);
    
    return <Navigate to={targetPath} replace state={{ from: location }} />;
  }

  // User is not authenticated, show the public page
  return children;
};

export default PublicOnlyRoute;
