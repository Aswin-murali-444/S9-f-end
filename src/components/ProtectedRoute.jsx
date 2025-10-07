import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const ROLE_FETCH_TIMEOUT_MS = 5000;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isInitialized, user, getUserRole } = useAuth();
  const location = useLocation();
  const [resolvedRole, setResolvedRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(Boolean(allowedRoles && allowedRoles.length));

  useEffect(() => {
    let isActive = true;
    const fetchRole = async () => {
      if (!allowedRoles || !allowedRoles.length) {
        setCheckingRole(false);
        return;
      }
      // Skip role fetch until authenticated to avoid flicker
      if (!isAuthenticated) {
        setCheckingRole(false);
        setResolvedRole(null);
        return;
      }
      try {
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve('__timeout__'), ROLE_FETCH_TIMEOUT_MS);
        });
        const roleOrTimeout = await Promise.race([getUserRole(), timeoutPromise]);
        if (!isActive) return;
        if (roleOrTimeout === '__timeout__') {
          setResolvedRole(null);
        } else {
          setResolvedRole(roleOrTimeout);
        }
      } catch (_) {
        if (isActive) setResolvedRole(null);
      } finally {
        if (isActive) setCheckingRole(false);
      }
    };
    fetchRole();
    return () => { isActive = false; };
  }, [allowedRoles, getUserRole, user?.id, isAuthenticated]);

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length) {
    if (checkingRole) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <LoadingSpinner size="large" />
        </div>
      );
    }
    // Try to use stored role if resolvedRole is not yet available (avoids bounce)
    if (!resolvedRole) {
      try {
        const storedRoleKey = user?.id ? `user_role_${user.id}` : null;
        const storedRole = (storedRoleKey && localStorage.getItem(storedRoleKey)) || localStorage.getItem('user_role');
        if (storedRole && allowedRoles.includes(storedRole)) {
          return children || null;
        }
      } catch (_) {}
      // Show loader instead of redirecting to login when role is undetermined
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <LoadingSpinner size="large" />
        </div>
      );
    }
    // If role is resolved but not allowed, redirect to login
    if (!allowedRoles.includes(resolvedRole)) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  return children || null;
};

export default ProtectedRoute;


