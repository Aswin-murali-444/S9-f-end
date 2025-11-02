import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AlertCircle, Mail, Send, Shield, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './LoginPage.css';

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email')
});

const ForgotPassword = () => {
  const { requestPasswordReset, loading } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting, touchedFields }, watch } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '' }
  });

  const watched = watch();

  const onSubmit = async (data) => {
    await requestPasswordReset(data.email);
  };

  const getFieldClass = (field) => {
    const hasError = errors[field];
    const isTouched = touchedFields[field];
    const hasValue = watched[field];
    if (hasError && isTouched) return 'error';
    if (!hasError && isTouched && hasValue) return 'success';
    return '';
  };

  return (
    <div className="login-container auth-enhanced">
      <div className="decor-bubbles">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
      </div>
      <div className="login-form-section" style={{ width: '100%' }}>
        <div className="login-box beauty-card">
          <div className="login-logo">
            <Logo size="large" />
            <div className="login-subtitle">Reset your password</div>
          </div>

          <div className="info-banner">
            <Shield size={16} />
            <span>We'll email you a secure link to reset your password.</span>
          </div>

          <div className="form-header">
            <div className="form-header-icon pulse">
              <Mail size={20} />
            </div>
            <h3>Forgot Password</h3>
            <p>Enter the email associated with your account</p>
          </div>

          <div className="steps">
            <div className="step-item">
              <div className="step-icon"><Mail size={16} /></div>
              <div className="step-text">Request link</div>
            </div>
            <div className="step-sep" />
            <div className="step-item">
              <div className="step-icon"><CheckCircle size={16} /></div>
              <div className="step-text">Check inbox</div>
            </div>
            <div className="step-sep" />
            <div className="step-item">
              <div className="step-icon"><Lock size={16} /></div>
              <div className="step-text">Set new password</div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={`input-group ${getFieldClass('email')}`}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={loading || isSubmitting}
                {...register('email')}
              />
              {errors.email && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.email.message}</span>
                </div>
              )}
              <div className="helper-text">We respect your privacy. Reset emails are one-time and secure.</div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`submit-btn ${Object.keys(errors).length > 0 ? 'disabled' : ''}`}
                disabled={loading || isSubmitting || Object.keys(errors).length > 0}
              >
                <Send size={18} />
                {(loading || isSubmitting) ? 'Sending...' : 'Send reset link'}
              </button>
            </div>
          </form>

          <div className="trust-badges">
            <div className="badge"><Shield size={14} /><span>Secure</span></div>
            <div className="badge"><CheckCircle size={14} /><span>No spam</span></div>
            <div className="badge"><Lock size={14} /><span>Encrypted</span></div>
          </div>

          <div className="divider"><span>or</span></div>

          <a className="link-btn" href="/login">
            <ArrowLeft size={16} />
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
