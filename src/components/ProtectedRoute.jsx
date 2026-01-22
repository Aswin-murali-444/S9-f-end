import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const ROLE_FETCH_TIMEOUT_MS = 5000;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isInitialized, user, getUserRole } = useAuth();
  const location = useLocation();
  const [resolvedRole, setResolvedRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [hasRoleCheck, setHasRoleCheck] = useState(false);

  // Initialize role checking state safely
  useEffect(() => {
    const hasRoles = Array.isArray(allowedRoles) && allowedRoles.length > 0;
    setHasRoleCheck(hasRoles);
    setCheckingRole(hasRoles);
  }, [allowedRoles]);

  // Role fetching effect
  useEffect(() => {
    if (!hasRoleCheck || !isAuthenticated || !user?.id) {
      setCheckingRole(false);
      return;
    }

    // Check if we already have a cached role for this user
    const userId = String(user.id);
    const cachedRoleKey = `user_role_${userId}`;
    const cachedRole = localStorage.getItem(cachedRoleKey) || localStorage.getItem('user_role');
    
    if (cachedRole && Array.isArray(allowedRoles) && allowedRoles.includes(cachedRole)) {
      setResolvedRole(cachedRole);
      setCheckingRole(false);
      return;
    }

    let isActive = true;

    const fetchRole = async () => {
      try {
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve('__timeout__'), ROLE_FETCH_TIMEOUT_MS);
        });
        
        let rolePromise;
        try {
          rolePromise = getUserRole();
        } catch (error) {
          console.warn('Error calling getUserRole:', error);
          if (isActive) setResolvedRole(null);
          return;
        }
        
        if (!rolePromise || typeof rolePromise.then !== 'function') {
          console.warn('getUserRole did not return a promise:', typeof rolePromise);
          if (isActive) setResolvedRole(null);
          return;
        }
        
        const roleOrTimeout = await Promise.race([rolePromise, timeoutPromise]);
        if (!isActive) return;
        
        if (roleOrTimeout === '__timeout__') {
          setResolvedRole(null);
        } else if (typeof roleOrTimeout === 'string' || roleOrTimeout === null) {
          setResolvedRole(roleOrTimeout);
        } else {
          console.warn('getUserRole returned unexpected value:', roleOrTimeout);
          setResolvedRole(null);
        }
      } catch (error) {
        console.warn('Error in ProtectedRoute role fetch:', error);
        if (isActive) setResolvedRole(null);
      } finally {
        if (isActive) setCheckingRole(false);
      }
    };

    fetchRole();
    return () => { isActive = false; };
  }, [hasRoleCheck, isAuthenticated, user?.id, getUserRole, allowedRoles]);

  // Loading state
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // No role restrictions
  if (!hasRoleCheck) {
    return children || null;
  }

  // Role checking in progress
  if (checkingRole) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Try to use stored role if resolvedRole is not yet available
  if (!resolvedRole) {
    try {
      const storedRoleKey = user?.id ? `user_role_${user.id}` : null;
      const storedRole = (storedRoleKey && localStorage.getItem(storedRoleKey)) || localStorage.getItem('user_role');
      if (storedRole && Array.isArray(allowedRoles) && allowedRoles.includes(storedRole)) {
        return children || null;
      }
    } catch (error) {
      console.warn('Error checking stored role:', error);
    }
    
    // Show loader instead of redirecting to login when role is undetermined
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Check if resolved role is allowed
  if (Array.isArray(allowedRoles) && !allowedRoles.includes(resolvedRole)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children || null;
};

export default ProtectedRoute;