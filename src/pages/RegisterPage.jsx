import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Home, Wrench, Heart, Truck, UserCheck, AlertCircle, CheckCircle, Shield, Users, Star, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './RegisterPage.css';

// Validation schema
const registerSchema = yup.object({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const { register: registerUser, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, touchedFields },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedFields = watch();

  // Enhanced role definitions with more detailed information
  const userRoles = [
    {
      id: 'customer',
      title: 'Customer (Resident)',
      description: 'Smart home management and service booking',
      icon: Home,
      features: [
        'Book home repairs, elder care, delivery services',
        'Real-time home monitoring via smart cameras',
        'Track service progress and manage billing',
        'Provide feedback and rate service quality',
        'Schedule recurring maintenance tasks',
        'Access emergency support 24/7'
      ],
      benefits: ['Convenience', 'Peace of Mind', 'Cost Control'],
      color: '#3b82f6',
      highlights: ['Easy Booking', 'Live Monitoring', '24/7 Support']
    },
    {
      id: 'service-provider',
      title: 'Service Provider',
      description: 'Professional maintenance, repair, and delivery services',
      icon: Wrench,
      features: [
        'Perform plumbing, electrical, and general repairs',
        'Deliver groceries, medicines, and packages',
        'AI route optimization and live delivery status updates',
        'Accept and manage service requests efficiently',
        'Update job status with detailed notes and photos',
        'Earn ratings and build reputation'
      ],
      benefits: ['Flexible Work', 'Good Pay', 'Growth Opportunities'],
      color: '#10b981',
      highlights: ['Flexible Hours', 'Good Pay', 'Build Reputation']
    },
    {
      id: 'caretaker',
      title: 'Caretaker (Elder Care)',
      description: 'Compassionate elderly care and support',
      icon: Heart,
      features: [
        'Assist with daily routines and medication management',
        'Provide health monitoring and updates',
        'Raise emergency alerts when needed',
        'Maintain detailed care reports and logs',
        'Coordinate with family members',
        'Access training and support resources'
      ],
      benefits: ['Meaningful Work', 'Flexible Hours', 'Training Support'],
      color: '#ef4444',
      highlights: ['Meaningful Work', 'Training Provided', 'Flexible Schedule']
    },
    {
      id: 'driver',
      title: 'Driver',
      description: 'Safe and reliable transportation',
      icon: Truck,
      features: [
        'Transport elderly to medical appointments safely',
        'Provide real-time trip status updates',
        'Handle multiple trip routes efficiently',
        'Maintain vehicle safety standards',
        'Build customer relationships'
      ],
      benefits: ['Flexible Schedule', 'Good Earnings', 'Independent Work'],
      color: '#f59e0b',
      highlights: ['Flexible Hours', 'Good Earnings', 'Independent Work']
    }
  ];

  // Clear form on component mount and prevent autofill
  useEffect(() => {
    reset();
    
    // Force clear any autofilled values
    setTimeout(() => {
      const nameInput = document.querySelector('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      
      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
      passwordInputs.forEach(input => {
        if (input) input.value = '';
      });
    }, 100);
  }, [reset]);

  const onSubmit = async (data) => {
    if (!selectedRole) {
      toast.error('Please select a user role');
      return;
    }

    const result = await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      userType: selectedRole
    });
    
    if (result.success) {
      if (result.dashboardPath) {
        navigate(result.dashboardPath);
      } else {
        navigate('/');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle(selectedRole);
    if (result.success) {
      // Redirect will happen automatically via Supabase
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

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: 'Enter password' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
    
    return {
      strength,
      label: labels[Math.min(strength - 1, 4)] || 'Very Weak',
      color: colors[Math.min(strength - 1, 4)] || '#ef4444',
      checks
    };
  };

  const passwordStrength = getPasswordStrength(watchedFields.password);

  return (
    <div className="register-container">
      <div className="register-content">
        {/* Compact Role Selection Section */}
        <div className="role-selection-section">
          <div className="role-selection-header">
            <div className="role-header-icon">
              <Users size={24} />
            </div>
            <h2>Select Your Role</h2>
            <p>Choose how you'll use our platform</p>
          </div>
          
          <div className="role-cards-grid">
            {userRoles.map((role) => {
              const IconComponent = role.icon;
              return (
                <div
                  key={role.id}
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                  style={{ '--role-color': role.color }}
                >
                  <div className="role-card-header">
                    <div className="role-icon" style={{ backgroundColor: role.color }}>
                      <IconComponent size={20} />
                    </div>
                    <div className="role-check">
                      {selectedRole === role.id && <CheckCircle size={18} />}
                    </div>
                  </div>
                  
                  <div className="role-content">
                    <h4>{role.title}</h4>
                    <p className="role-description">{role.description}</p>
                    
                    <div className="role-features-compact">
                      {role.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="feature-item">
                          <CheckCircle size={14} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Form Section */}
        <div className="register-form-section">
          <div className="register-box">
            <div className="register-logo">
              <Logo size="large" />
              <div className="register-subtitle">Create Your Account</div>
            </div>
            
            <div className="form-header">
              <div className="form-header-icon">
                <UserPlus size={20} />
              </div>
              <h3>Get Started Today</h3>
              <p>Join thousands of users already benefiting from our platform</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={`input-group ${getFieldClass('name')}`}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="Enter your full name"
                  disabled={loading || isSubmitting}
                  className={errors.name ? 'input-error' : ''}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {errors.name && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{errors.name.message}</span>
                  </div>
                )}
                {!errors.name && touchedFields.name && watchedFields.name && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    <span>Valid name</span>
                  </div>
                )}
              </div>

              <div className={`input-group ${getFieldClass('email')}`}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email address"
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
                  placeholder="Create a strong password"
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
                {watchedFields.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      />
                    </div>
                    <span style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                    <div className="password-checks">
                      <span className={passwordStrength.checks.length ? 'check-valid' : 'check-invalid'}>
                        {passwordStrength.checks.length ? '✓' : '✗'} 8+ characters
                      </span>
                      <span className={passwordStrength.checks.uppercase ? 'check-valid' : 'check-invalid'}>
                        {passwordStrength.checks.uppercase ? '✓' : '✗'} Uppercase
                      </span>
                      <span className={passwordStrength.checks.lowercase ? 'check-valid' : 'check-invalid'}>
                        {passwordStrength.checks.lowercase ? '✓' : '✗'} Lowercase
                      </span>
                      <span className={passwordStrength.checks.number ? 'check-valid' : 'check-invalid'}>
                        {passwordStrength.checks.number ? '✓' : '✗'} Number
                      </span>
                      <span className={passwordStrength.checks.special ? 'check-valid' : 'check-invalid'}>
                        {passwordStrength.checks.special ? '✓' : '✗'} Special char
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={`input-group ${getFieldClass('confirmPassword')}`}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Confirm your password"
                  disabled={loading || isSubmitting}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {errors.confirmPassword && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{errors.confirmPassword.message}</span>
                  </div>
                )}
                {!errors.confirmPassword && touchedFields.confirmPassword && watchedFields.confirmPassword && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={loading || isSubmitting || Object.keys(errors).length > 0 || !selectedRole}
                  className={`submit-btn ${Object.keys(errors).length > 0 || !selectedRole ? 'disabled' : ''}`}
                >
                  <UserPlus size={18} />
                  {(loading || isSubmitting) ? 'Creating Account...' : 'Create Account'}
                </button>
                
                {!selectedRole && (
                  <div className="role-reminder">
                    <AlertCircle size={16} />
                    <span>Please select a user role from the side panel</span>
                  </div>
                )}
              </div>
            </form>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <button 
              type="button" 
              className="google-btn" 
              onClick={handleGoogleSignIn}  
              disabled={loading || isSubmitting}
            >
              <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {(loading || isSubmitting) ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div className="register-footer">
              <p>
                Already have an account? <Link to="/login">Sign in here</Link>
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

export default RegisterPage;