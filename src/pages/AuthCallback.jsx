import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, finalizeOAuthRoleSync } = useAuth();

  useEffect(() => {
    const run = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        
        const result = await finalizeOAuthRoleSync();
        
        if (result?.success) {
          if (result?.isNewUser) {
            // New user - show welcome message and redirect to dashboard
            toast.success('Welcome! Your account has been created successfully.');
            console.log('🎉 New user created, redirecting to dashboard');
            navigate('/dashboard/customer');
            return;
          } else if (result?.dashboardPath) {
            // Existing user - redirect to dashboard
            toast.success('Welcome back!');
            console.log('🔄 Existing user logged in, redirecting to dashboard');
            navigate(result.dashboardPath);
            return;
          }
        }
        
        // Fallback: if already authenticated, go to customer dashboard; otherwise go login
        if (isAuthenticated) {
          console.log('✅ User authenticated, redirecting to customer dashboard');
          navigate('/dashboard/customer');
        } else {
          console.log('❌ User not authenticated, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('💥 OAuth callback error:', error);
        toast.error('Authentication failed. Please try again.');
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
      gap: '20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <LoadingSpinner size="large" />
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Setting up your account...</h3>
        <p style={{ color: '#64748b', margin: 0 }}>Please wait while we complete your sign-in</p>
      </div>
    </div>
  );
};

export default AuthCallback; 