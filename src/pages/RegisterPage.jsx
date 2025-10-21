import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { validationUtils } from '../utils/validation';
import Logo from '../components/Logo';
import './RegisterPage.css';

// Enhanced validation schema using centralized validation utils
const registerSchema = yup.object({
  name: yup
    .string()
    .required('Full name is required')
    .test('name-format', 'Name can only contain letters, spaces, - and \' characters', function(value) {
      if (!value) return true;
      const result = validationUtils.validateName(value, 'Full name');
      return result.isValid || this.createError({ message: result.error });
    }),
  email: yup
    .string()
    .required('Email is required')
    .test('email-format', 'Please enter a valid email address', function(value) {
      if (!value) return true;
      const result = validationUtils.validateEmail(value);
      return result.isValid || this.createError({ message: result.error });
    })
    .test('email-unique', 'Email already registered', function(value) {
      // This will be validated by the custom validation logic
      return true;
    }),
  password: yup
    .string()
    .required('Password is required')
    .test('password-strength', 'Password must contain uppercase, lowercase, number, and special character', function(value) {
      if (!value) return true;
      const result = validationUtils.validatePassword(value);
      return result.isValid || this.createError({ message: result.error });
    }),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState('customer');
  const [emailValidation, setEmailValidation] = useState({
    checking: false,
    exists: false,
    message: '',
    lastChecked: ''
  });
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, touchedFields },
    watch,
    setError,
    clearErrors,
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

  // Debounced email validation
  useEffect(() => {
    const email = watchedFields.email;
    
    // Clear validation state if email is empty or too short
    if (!email || !email.includes('@') || email.length < 5) {
      setEmailValidation({
        checking: false,
        exists: false,
        message: '',
        lastChecked: ''
      });
      // Clear any email errors when field is empty
      if (errors.email) {
        clearErrors('email');
      }
      return;
    }

    // Clear previous validation errors when starting new validation
    if (emailValidation.exists) {
      clearErrors('email');
    }

    const timeoutId = setTimeout(async () => {
      // Don't re-check if we already checked this exact email
      if (email === emailValidation.lastChecked) return;
      
      setEmailValidation(prev => ({ ...prev, checking: true }));
      
      try {
        const result = await apiService.checkEmailExists(email);
        
        console.log('🔍 Email validation API response:', result);
        
        // Check if the API returned an error
        if (result.error) {
          console.log('❌ API returned error:', result.error);
                  setEmailValidation({
          checking: false,
          exists: false,
          message: 'Error checking email',
          lastChecked: email
        });
          return;
        }
        
        console.log('✅ Email validation result:', {
          exists: result.exists,
          message: result.message,
          email: email
        });
        
        setEmailValidation({
          checking: false,
          exists: result.exists,
          message: result.message,
          lastChecked: email
        });
        
        if (result.exists) {
          console.log('🚫 Email exists, setting error');
          setError('email', { 
            type: 'manual', 
            message: 'Email already registered' 
          });
        } else {
          console.log('✅ Email available, clearing errors');
          clearErrors('email');
        }
      } catch (error) {
        console.error('💥 Email validation error:', error);
        setEmailValidation({
          checking: false,
          exists: false,
          message: 'Error checking email availability',
          lastChecked: email,
          userDetails: null
        });
        // Don't set form error on network issues, just show info message
      }
    }, 800); // Increased delay to 800ms for better UX

    return () => clearTimeout(timeoutId);
  }, [watchedFields.email, emailValidation.lastChecked, setError, clearErrors, errors.email]);

  // Role selection UI removed for initial simplicity; defaulting to 'customer'.

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
    const result = await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      userType: selectedRole
    });
    
    if (result.success) {
      // Redirect to login page after successful registration
      toast.success('Registration successful! Please log in with your new account.');
      navigate('/login');
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
        {/* Role selection removed; using default role */}

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
                {!errors.email && touchedFields.email && watchedFields.email && emailValidation.lastChecked === watchedFields.email && !emailValidation.exists && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    <span>Email available</span>
                  </div>
                )}
                {emailValidation.checking && (
                  <div className="info-message">
                    <span>Checking email...</span>
                  </div>
                )}
                {emailValidation.lastChecked === watchedFields.email && emailValidation.message && !emailValidation.checking && emailValidation.exists && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>Email already registered</span>
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
                  disabled={loading || isSubmitting || Object.keys(errors).length > 0}
                  className={`submit-btn ${Object.keys(errors).length > 0 ? 'disabled' : ''}`}
                >
                  <UserPlus size={18} />
                  {(loading || isSubmitting) ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

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