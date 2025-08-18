import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, finalizeOAuthRoleSync } = useAuth();

  useEffect(() => {
    const run = async () => {
      const result = await finalizeOAuthRoleSync();
      if (result?.success && result?.dashboardPath) {
        navigate(result.dashboardPath);
        return;
      }
      // Fallback: if already authenticated, go home; otherwise go login
      if (isAuthenticated) {
        navigate('/');
      } else {
        navigate('/login');
      }
    };
    run();
  }, [isAuthenticated, navigate, finalizeOAuthRoleSync]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <LoadingSpinner size="large" />
      <p>Completing sign in...</p>
    </div>
  );
};

export default AuthCallback; 