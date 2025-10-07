import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserCheck, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './LoginPage.css';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

const LoginPage = () => {
  const { login, signInWithGoogle, loading, isAuthenticated, user, isInitialized, debugUserRole, testSupabaseConnection, testLoginFlow } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, touchedFields },
    watch,
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const watchedFields = watch();

  // Clear form on component mount and prevent autofill
  useEffect(() => {
    // Clear form when component mounts
    reset();
    
    // Force clear any autofilled values
    setTimeout(() => {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    }, 100);
  }, [reset]);

  const onSubmit = async (data) => {
    console.log('🔐 Attempting login for:', data.email);
    
    try {
      const result = await login({ 
        email: data.email, 
        password: data.password
      });
      
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        console.log('🚀 Login successful, forcing immediate redirect');
        
        // Get the dashboard path from result or localStorage
        let targetPath = result.dashboardPath;
        if (!targetPath) {
          targetPath = localStorage.getItem('dashboard_path') || '/dashboard/provider';
        }
        
        // Force immediate redirect without any delay
        console.log('🚀 Immediate redirect to:', targetPath);
        window.location.replace(targetPath);
        
      } else {
        console.error('❌ Login failed:', result.error);
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      // Redirect will happen automatically via Supabase
    }
  };

  const debugServiceProvider = async () => {
    const email = watchedFields.email;
    if (!email) {
      toast.error('Please enter an email address first');
      return;
    }
    
    console.log('🔍 Debugging service provider status for:', email);
    const debugResult = await debugUserRole(email);
    console.log('🔍 Debug result:', debugResult);
    
    if (debugResult.user) {
      const actualRole = debugResult.actualRole || 'unknown';
      const databaseRole = debugResult.databaseRole || 'unknown';
      const hasSPDetails = debugResult.isServiceProvider ? 'Yes' : 'No';
      
      let message;
      if (debugResult.shouldRedirectToProvider) {
        message = `✅ Service Provider - DB Role: ${databaseRole} → Corrected: ${actualRole}, SP Details: ${hasSPDetails}, Dashboard: ${debugResult.expectedDashboard}`;
      } else {
        message = `ℹ️ Role: ${actualRole}, SP Details: ${hasSPDetails}, Dashboard: ${debugResult.expectedDashboard}`;
      }
      
      toast.success(message);
    } else {
      toast.error('User not found in database');
    }
  };


  const getFieldClass = (fieldName) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watchedFields[fieldName];
    
    if (hasError && isTouched) return 'error';
    if (!hasError && isTouched && hasValue) return 'success';
    return '';
  };

  // Show loading screen only when app is initializing
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Please wait while we check your authentication</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Login Form Section */}
        <div className="login-form-section">
          <div className="login-box">
            <div className="login-logo">
              <Logo size="large" />
              <div className="login-subtitle">Sign In to Your Account</div>
            </div>
            
            <div className="form-header">
              <h3>Access Your Dashboard</h3>
              <p>Enter your credentials to continue</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}>
              <div className={`input-group ${getFieldClass('email')}`}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email"
                  disabled={loading || isSubmitting}
                  className={errors.email ? 'input-error' : ''}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {errors.email && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{errors.email.message}</span>
                  </div>
                )}
                {!errors.email && touchedFields.email && watchedFields.email && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    <span>Valid email address</span>
                  </div>
                )}
              </div>

              <div className={`input-group ${getFieldClass('password')}`}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Enter your password"
                  disabled={loading || isSubmitting}
                  className={errors.password ? 'input-error' : ''}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {errors.password && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{errors.password.message}</span>
                  </div>
                )}
                {!errors.password && touchedFields.password && watchedFields.password && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    <span>Strong password</span>
                  </div>
                )}
                <div className="forgot-container">
                  <a className="forgot-link" href="/forgot-password">Forgot password?</a>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={loading || isSubmitting || Object.keys(errors).length > 0}
                  className={`submit-btn ${Object.keys(errors).length > 0 ? 'disabled' : ''}`}
                >
                  <LogIn size={18} />
                  {(loading || isSubmitting) ? 'Signing In...' : 'Sign In'}
                </button>
                
                {/* Debug buttons - only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button 
                      type="button" 
                      onClick={debugServiceProvider}
                      disabled={loading || isSubmitting || !watchedFields.email}
                      className="debug-btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      🔍 Debug Service Provider Status
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        console.log('🔍 Current auth state:', { isAuthenticated, user: !!user, isInitialized });
                        console.log('🔍 LocalStorage dashboard_path:', localStorage.getItem('dashboard_path'));
                        console.log('🔍 LocalStorage user_role:', localStorage.getItem('user_role'));
                        toast.success(`Auth: ${isAuthenticated}, User: ${!!user}, Dashboard: ${localStorage.getItem('dashboard_path') || 'none'}`);
                      }}
                      disabled={loading || isSubmitting}
                      className="debug-btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      🔍 Check Auth State
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const userRole = localStorage.getItem('user_role');
                        const dashboardPath = localStorage.getItem('dashboard_path');
                        console.log('🚀 Manual redirect test:', { userRole, dashboardPath });
                        
                        if (userRole === 'service_provider') {
                          navigate('/dashboard/provider', { replace: true });
                          toast.success('Redirecting to service provider dashboard...');
                        } else if (dashboardPath) {
                          navigate(dashboardPath, { replace: true });
                          toast.success(`Redirecting to: ${dashboardPath}`);
                        } else {
                          toast.error('No dashboard path found!');
                        }
                      }}
                      disabled={loading || isSubmitting}
                      className="debug-btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      🚀 Force Redirect to Dashboard
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        const email = watchedFields.email;
                        if (!email) {
                          toast.error('Please enter an email address first');
                          return;
                        }
                        
                        try {
                          // This would normally be done server-side, but for testing:
                          toast.success('Note: Database role will be fixed automatically on next login');
                          console.log('🔧 Manual fix: User will be corrected to service_provider role on next login');
                        } catch (error) {
                          toast.error('Fix failed: ' + error.message);
                        }
                      }}
                      disabled={loading || isSubmitting || !watchedFields.email}
                      className="debug-btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        background: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      🔧 Fix Database Role
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        console.log('🔍 Testing Supabase connection...');
                        const result = await testSupabaseConnection();
                        console.log('🔍 Connection test result:', result);
                      }}
                      disabled={loading || isSubmitting}
                      className="debug-btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        background: '#0891b2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      🔌 Test Database Connection
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        console.log('🔍 Testing login flow...');
                        const result = await testLoginFlow();
                        console.log('🔍 Login flow test result:', result);
                      }}
                      disabled={loading || isSubmitting}
                      className="debug-btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        background: '#ea580c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      🔐 Test Login Flow
                    </button>
                  </div>
                )}
              </div>
            </form>
            
            <div className="divider">
              <span>or continue with</span>
            </div>
            
            <div className="google-auth-section">
              <button 
                type="button" 
                className="google-btn" 
                onClick={handleGoogleSignIn}
                disabled={loading || isSubmitting}
              >
                <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {(loading || isSubmitting) ? 'Signing in...' : 'Continue with Google'}
              </button>
              <div className="google-auth-note">
                <UserCheck size={14} />
                <span>Google sign-in is for customers only</span>
              </div>
            </div>
            
            <div className="login-footer">
              <p>
                Don't have an account? <Link to="/register">Get Started</Link>
              </p>
              <div className="security-info">
                <Shield size={16} />
                <span>Your data is protected with enterprise-grade security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;