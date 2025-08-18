import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Lock, AlertCircle, CheckCircle, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './LoginPage.css';

const schema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'At least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Use upper, lower, number, and special char'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

const ResetPassword = () => {
  const { updatePassword, loading } = useAuth();
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const { register, handleSubmit, formState: { errors, isSubmitting, touchedFields }, watch } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' }
  });

  const watched = watch();

  const onSubmit = async (data) => {
    setSubmitState({ status: 'submitting', message: '' });
    const result = await updatePassword(data.password);
    if (result.success) {
      setSubmitState({ status: 'success', message: 'Password updated successfully. You can now sign in with your new password.' });
      // Optionally redirect after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    } else {
      setSubmitState({ status: 'error', message: result.error || 'Failed to update password. Please try again.' });
    }
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
            <div className="login-subtitle">Choose a new password</div>
          </div>

          <div className="info-banner">
            <Shield size={16} />
            <span>Use a strong, unique password to keep your account secure.</span>
          </div>

          <div className="form-header">
            <div className="form-header-icon pulse">
              <Lock size={20} />
            </div>
            <h3>Reset Password</h3>
            <p>Enter and confirm your new password</p>
          </div>

          <div className="steps">
            <div className="step-item">
              <div className="step-icon"><CheckCircle size={16} /></div>
              <div className="step-text">Verify link</div>
            </div>
            <div className="step-sep" />
            <div className="step-item">
              <div className="step-icon"><Lock size={16} /></div>
              <div className="step-text">Set new password</div>
            </div>
            <div className="step-sep" />
            <div className="step-item">
              <div className="step-icon"><Shield size={16} /></div>
              <div className="step-text">All set</div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={`input-group ${getFieldClass('password')}`}>
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                placeholder="New password"
                disabled={loading || isSubmitting}
                {...register('password')}
              />
              {errors.password && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.password.message}</span>
                </div>
              )}
              <div className="helper-text">Minimum 8 characters, with upper, lower, number, and special character.</div>
            </div>

            <div className={`input-group ${getFieldClass('confirmPassword')}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                disabled={loading || isSubmitting}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}
              {!errors.confirmPassword && touchedFields.confirmPassword && watched.confirmPassword && (
                <div className="success-message">
                  <CheckCircle size={14} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`submit-btn ${Object.keys(errors).length > 0 ? 'disabled' : ''}`}
                disabled={loading || isSubmitting || Object.keys(errors).length > 0}
              >
                {(loading || isSubmitting) ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {submitState.status === 'error' && (
            <div className="error-banner" style={{ marginTop: 12 }}>
              <AlertCircle size={16} />
              <span>{submitState.message}</span>
            </div>
          )}
          {submitState.status === 'success' && (
            <div className="success-banner" style={{ marginTop: 12 }}>
              <CheckCircle size={16} />
              <span>{submitState.message}</span>
            </div>
          )}

          <div className="trust-badges">
            <div className="badge"><Shield size={14} /><span>Secure</span></div>
            <div className="badge"><CheckCircle size={14} /><span>Verified</span></div>
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

export default ResetPassword;
