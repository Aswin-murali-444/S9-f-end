import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { validationUtils } from '../utils/validation';
import { apiService } from '../services/api';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose, userId }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [validation, setValidation] = useState({
    currentPassword: { isValid: true, error: null },
    newPassword: { isValid: true, error: null },
    confirmPassword: { isValid: true, error: null }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    let validationResult = { isValid: true, error: null };

    switch (field) {
      case 'currentPassword':
        if (value && value.length < 1) {
          validationResult = { isValid: false, error: 'Current password is required' };
        }
        break;
      case 'newPassword':
        validationResult = validationUtils.validatePassword(value);
        break;
      case 'confirmPassword':
        if (value && value !== formData.newPassword) {
          validationResult = { isValid: false, error: 'Passwords do not match' };
        } else if (value && formData.newPassword && value === formData.newPassword) {
          validationResult = { isValid: true, error: null };
        }
        break;
    }

    setValidation(prev => ({
      ...prev,
      [field]: validationResult
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isFormValid = Object.values(validation).every(v => v.isValid) &&
                       formData.currentPassword &&
                       formData.newPassword &&
                       formData.confirmPassword;

    if (!isFormValid) {
      toast.error('Please fix all validation errors');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to change password
      const response = await apiService.changePassword({
        userId,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.success) {
        toast.success('Password changed successfully');
        handleClose();
      } else {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else if (error.response?.status === 400) {
        toast.error('Invalid password format or requirements not met');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to change this password');
      } else {
        toast.error(error.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setValidation({
      currentPassword: { isValid: true, error: null },
      newPassword: { isValid: true, error: null },
      confirmPassword: { isValid: true, error: null }
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="change-password-modal-overlay">
      <div className="change-password-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Lock size={20} />
            <h3>Change Password</h3>
          </div>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Enter your current password"
                className={`password-input ${!validation.currentPassword.isValid ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validation.currentPassword.error && (
              <div className="error-message">
                <AlertCircle size={14} />
                <span>{validation.currentPassword.error}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter your new password"
                className={`password-input ${!validation.newPassword.isValid ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validation.newPassword.error && (
              <div className="error-message">
                <AlertCircle size={14} />
                <span>{validation.newPassword.error}</span>
              </div>
            )}
            {validation.newPassword.isValid && formData.newPassword && (
              <div className="success-message">
                <CheckCircle size={14} />
                <span>Password meets requirements</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your new password"
                className={`password-input ${!validation.confirmPassword.isValid ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validation.confirmPassword.error && (
              <div className="error-message">
                <AlertCircle size={14} />
                <span>{validation.confirmPassword.error}</span>
              </div>
            )}
            {validation.confirmPassword.isValid && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <div className="success-message">
                <CheckCircle size={14} />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.newPassword.length >= 8 ? 'valid' : 'invalid'}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                One lowercase letter
              </li>
              <li className={/\d/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                One number
              </li>
              <li className={/[@$!%*?&]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading || !Object.values(validation).every(v => v.isValid) || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
