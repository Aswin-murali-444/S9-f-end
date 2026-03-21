import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Award, 
  DollarSign, 
  Save, 
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Target,
  Building,
  Camera,
  Upload,
  Loader2,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import { validationUtils } from '../utils/validation';
import './EditableProfileSections.css';

const EditableProfileSections = ({ providerId, onProfileUpdate }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [wageRequestData, setWageRequestData] = useState({
    requestedRate: '',
    reason: ''
  });
  const [wageRequestLoading, setWageRequestLoading] = useState(false);

  useEffect(() => {
    if (providerId) {
      loadProfileData();
    }
  }, [providerId]);

  const loadProfileData = async () => {
    try {
      // Don't set loading to true to prevent skeleton animation
      // setLoading(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const profilePromise = apiService.getProviderProfile(providerId);
      const response = await Promise.race([profilePromise, timeoutPromise]);
      
      setProfileData(response.data);
    } catch (error) {
      console.error('Error loading profile data:', error);
      
      // Don't show error toast for timeout, just log it
      if (error.message !== 'Request timeout') {
        toast.error('Failed to load profile data');
      }
      
      // Set a default profile data structure to prevent infinite loading
      setProfileData({
        status: 'inactive',
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        pincode: '',
        city: '',
        state: '',
        address: '',
        bio: '',
        years_of_experience: 0,
        hourly_rate: 0
      });
    } finally {
      // Don't set loading to false since we never set it to true
      // setLoading(false);
    }
  };

  // Validation functions
  const validateField = (fieldName, value) => {
    let validation = { isValid: true, error: null };
    
    switch (fieldName) {
      case 'first_name':
      case 'last_name':
        validation = validationUtils.validateName(value, fieldName === 'first_name' ? 'First Name' : 'Last Name');
        break;
      case 'phone':
        validation = validationUtils.validatePhone(value);
        break;
      case 'years_of_experience':
        validation = validationUtils.validateNumeric(value, {
          min: 0,
          max: 50,
          allowDecimals: false,
          fieldName: 'Years of Experience',
          required: false
        });
        break;
      case 'hourly_rate':
        validation = validationUtils.validateNumeric(value, {
          min: 0,
          max: 10000,
          allowDecimals: true,
          fieldName: 'Hourly Rate',
          required: false
        });
        break;
      case 'pincode':
        validation = validationUtils.validateTextLength(value, {
          min: 6,
          max: 6,
          fieldName: 'Pincode',
          required: false
        });
        if (validation.isValid && value && !/^\d{6}$/.test(value)) {
          validation = { isValid: false, error: 'Pincode must be 6 digits' };
        }
        break;
      case 'city':
      case 'state':
        validation = validationUtils.validateTextLength(value, {
          min: 2,
          max: 50,
          fieldName: fieldName === 'city' ? 'City' : 'State',
          required: false
        });
        break;
      case 'address':
        validation = validationUtils.validateTextLength(value, {
          min: 10,
          max: 200,
          fieldName: 'Address',
          required: false
        });
        break;
      case 'bio':
        validation = validationUtils.validateTextLength(value, {
          min: 10,
          max: 500,
          fieldName: 'Bio',
          required: false
        });
        break;
      default:
        validation = { isValid: true, error: null };
    }
    
    return validation;
  };

  const handleFieldEdit = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setTempValues(prev => ({
      ...prev,
      [fieldName]: currentValue || ''
    }));
    
    // Clear validation errors when starting to edit
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: { isValid: true, error: null }
    }));
  };

  const handleFieldSave = async (fieldName) => {
    try {
      setSaving(true);
      
      const value = tempValues[fieldName];
      
      // Validate the field before saving
      const validation = validateField(fieldName, value);
      
      if (!validation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: validation.error
        }));
        setFieldValidation(prev => ({
          ...prev,
          [fieldName]: validation
        }));
        toast.error(validation.error);
        return;
      }
      
      const updateData = {
        [fieldName]: value
      };

      console.log('🔄 Updating field:', fieldName, 'with value:', value);
      
      const response = await apiService.updateProviderProfile(providerId, updateData);
      console.log('✅ Update response:', response);
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        [fieldName]: value
      }));

      setEditingField(null);
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[fieldName];
        return newTemp;
      });

      // Clear validation errors on successful save
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
      setFieldValidation(prev => ({
        ...prev,
        [fieldName]: { isValid: true, error: null }
      }));

      toast.success('Profile updated successfully');
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Only show error toast if it's a real error
      if (error.response?.status === 403) {
        toast.error('Profile is not active. Complete your profile first.');
      } else if (error.response?.status === 404) {
        toast.error('Profile not found');
      } else if (error.message && !error.message.includes('success')) {
        toast.error(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleWageRequestChange = (field, value) => {
    setWageRequestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submitWageRequest = async () => {
    if (!providerId) {
      toast.error('Provider ID missing. Please reload the page.');
      return;
    }

    const requestedRate = parseFloat(wageRequestData.requestedRate);
    const currentRate = parseFloat(displayProfileData?.hourly_rate) || 0;

    if (!requestedRate || !Number.isFinite(requestedRate) || requestedRate <= 0) {
      toast.error('Please enter a valid hourly rate greater than 0.');
      return;
    }

    if (requestedRate <= currentRate) {
      toast.error('Requested hourly rate must be greater than your current rate.');
      return;
    }

    if (requestedRate - currentRate > maxAllowedIncrease) {
      toast.error(`You can request at most ₹${maxAllowedIncrease} increase at a time.`);
      return;
    }

    try {
      setWageRequestLoading(true);
      await apiService.createProviderWageRequest(providerId, {
        requestedHourlyRate: requestedRate,
        reason: wageRequestData.reason?.trim() || null
      });
      toast.success('Wage increase request sent to admin');
      setWageRequestData({ requestedRate: '', reason: '' });
    } catch (error) {
      console.error('Error submitting wage request:', error);
      toast.error(error?.message || 'Failed to submit wage request');
    } finally {
      setWageRequestLoading(false);
    }
  };

  const handleFieldCancel = (fieldName) => {
    setEditingField(null);
    setTempValues(prev => {
      const newTemp = { ...prev };
      delete newTemp[fieldName];
      return newTemp;
    });
  };

  const handleTempValueChange = (fieldName, value) => {
    setTempValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Real-time validation as user types
    const validation = validateField(fieldName, value);
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: validation
    }));
    
    // Clear error if validation passes
    if (validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      // Upload profile picture
      const response = await apiService.uploadProviderProfilePicture(file, providerId);
      
      if (response.success) {
        // Update local state with new photo URL
        setProfileData(prev => ({
          ...prev,
          profile_photo_url: response.data.profile_photo_url
        }));
        
        toast.success('Profile photo updated successfully');
        
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const renderEditableField = (fieldName, label, Icon, type = 'text', placeholder = '') => {
    const isEditing = editingField === fieldName;
    const currentValue = displayProfileData?.[fieldName] || '';
    const tempValue = tempValues[fieldName] || '';
    const validation = fieldValidation[fieldName] || { isValid: true, error: null };
    const hasError = !validation.isValid && tempValue !== '';
    const hasSuccess = validation.isValid && tempValue !== '' && tempValue !== currentValue;

    return (
      <div className="form-group-enhanced">
        <label>{label}</label>
        <div className="input-wrapper">
          {isEditing ? (
            <div className="editable-field-container">
              <div className="icon-container">
                <Icon size={20} />
              </div>
              <input
                type={type}
                value={tempValue}
                onChange={(e) => handleTempValueChange(fieldName, e.target.value)}
                placeholder={placeholder}
                className={`editable-input ${hasError ? 'error' : hasSuccess ? 'success' : ''}`}
                autoFocus
              />
              <div className="field-actions">
                <button
                  className="save-btn"
                  onClick={() => handleFieldSave(fieldName)}
                  disabled={saving || hasError}
                  title={hasError ? 'Fix validation errors first' : 'Save changes'}
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => handleFieldCancel(fieldName)}
                  disabled={saving}
                  title="Cancel changes"
                >
                  <AlertCircle size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="readonly-field-container">
              <div className="icon-container">
                <Icon size={20} />
              </div>
              <input
                type={type}
                value={currentValue || placeholder}
                readOnly
                className="readonly-input"
              />
              <button
                className="edit-btn"
                onClick={() => handleFieldEdit(fieldName, currentValue)}
                title="Edit field"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Validation Messages */}
        {isEditing && (
          <div className="validation-message">
            {hasError && (
              <div className="error-text">
                <XCircle size={14} />
                <span>{validation.error}</span>
              </div>
            )}
            {hasSuccess && (
              <div className="success-message">
                <CheckCircle2 size={14} />
                <span>Valid input</span>
              </div>
            )}
            {!hasError && !hasSuccess && tempValue !== '' && (
              <div className="info-message">
                <span>Press save to update</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Remove loading state entirely - show profile form immediately
  // if (loading) {
  //   return (
  //     <div className="editable-profile-sections loading">
  //       <div className="loading-spinner">
  //         <div className="loading-text">Loading profile data...</div>
  //       </div>
  //     </div>
  //   );
  // }

  if (!profileData) {
    return (
      <div className="editable-profile-sections">
        <div className="profile-loading-message">
          <span>Loading profile data...</span>
        </div>
      </div>
    );
  }

  // Show profile form with a safe fallback shape
  const displayProfileData = profileData || {
    status: 'inactive',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    pincode: '',
    city: '',
    state: '',
    address: '',
    bio: '',
    years_of_experience: 0,
    hourly_rate: 0
  };

  // Wage request derived values (relative to current hourly rate)
  const currentHourlyRate = Number(displayProfileData?.hourly_rate) || 0;
  const requestedHourlyRate = Number(wageRequestData.requestedRate) || 0;
  const wageIncrease =
    requestedHourlyRate > currentHourlyRate ? requestedHourlyRate - currentHourlyRate : 0;
  const wageIncreasePercent =
    requestedHourlyRate > currentHourlyRate && currentHourlyRate > 0
      ? ((wageIncrease / currentHourlyRate) * 100).toFixed(1)
      : null;
  const isRequestedBelowOrEqualCurrent =
    requestedHourlyRate > 0 && requestedHourlyRate <= currentHourlyRate;
  const maxAllowedIncrease = 200;
  const isIncreaseTooLarge = wageIncrease > maxAllowedIncrease;

  // Treat pending/verified/active profiles as fully set up for inline editing
  const editableStatuses = ['pending', 'active', 'verified'];
  const isProfileActive = editableStatuses.includes(displayProfileData.status);

  if (!isProfileActive) {
    return (
      <div className="editable-profile-sections inactive-profile">
        <div className="inactive-profile-content">
          <div className="inactive-icon">
            <AlertCircle size={48} />
          </div>
          <h3>Complete Your Profile</h3>
          <p>
            Your profile status is currently <strong>{displayProfileData.status}</strong>. 
            Complete your profile to access all features and start receiving service requests.
          </p>
          <div className="inactive-actions">
            <button 
              className="btn-primary btn-large"
              onClick={() => {
                // This would trigger the profile completion modal
                if (onProfileUpdate) {
                  onProfileUpdate('open-completion-modal');
                }
              }}
            >
              <User size={20} />
              Complete Profile Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editable-profile-sections">
      {/* Profile Photo Section */}
      <div className="profile-photo-section">
        <div className="profile-photo-container">
          <div className="profile-photo-wrapper avatar-elevated">
            {displayProfileData?.profile_photo_url ? (
              <img 
                src={displayProfileData.profile_photo_url} 
                alt="Profile" 
                className="profile-photo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="profile-photo-placeholder" style={{ display: displayProfileData?.profile_photo_url ? 'none' : 'flex' }}>
              <User size={48} />
            </div>
            <div className="photo-overlay">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="photo-input"
                id="profile-photo-input"
                disabled={uploadingPhoto}
              />
              <label htmlFor="profile-photo-input" className="photo-upload-btn">
                {uploadingPhoto ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Camera size={20} />
                )}
                <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
              </label>
            </div>
          </div>
          <div className="profile-photo-info">
            <h3>{displayProfileData?.first_name} {displayProfileData?.last_name}</h3>
            <div className="profile-subtitle">
              <Briefcase size={14} />
              <span>Service Provider</span>
              {displayProfileData?.service_category_name ? (
                <>
                  <span className="dot-sep">•</span>
                  <span>{displayProfileData.service_category_name}</span>
                </>
              ) : null}
            </div>
            <div className="profile-badges">
              {displayProfileData?.specialization ? (
                <span className="badge">
                  {displayProfileData.specialization}
                </span>
              ) : null}
              {displayProfileData?.service_name ? (
                <span className="badge">
                  {displayProfileData.service_name}
                </span>
              ) : null}
              {Number.isFinite(Number(displayProfileData?.years_of_experience)) ? (
                <span className="badge subtle">
                  {displayProfileData.years_of_experience} yrs exp
                </span>
              ) : null}
            </div>
            <div className="profile-contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>{displayProfileData?.email || 'Email not available'}</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>{displayProfileData?.phone || 'Phone not available'}</span>
              </div>
            </div>
            
            {/* Service Provider Information */}
            <div className="service-provider-info">
              <div className="provider-role">
                <Briefcase size={16} />
                <span>Service Provider</span>
              </div>
              
              {displayProfileData?.specialization && (
                <div className="provider-detail">
                  <span className="detail-label">Specialization:</span>
                  <span className="detail-value">{displayProfileData.specialization}</span>
                </div>
              )}
              
              {displayProfileData?.service_category_name && (
                <div className="provider-detail">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{displayProfileData.service_category_name}</span>
                </div>
              )}
              
              {displayProfileData?.service_name && (
                <div className="provider-detail">
                  <span className="detail-label">Service:</span>
                  <span className="detail-value">{displayProfileData.service_name}</span>
                </div>
              )}
              
              {displayProfileData?.years_of_experience !== undefined && (
                <div className="provider-detail">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{displayProfileData.years_of_experience} years</span>
                </div>
              )}
            </div>
            
            <p className="profile-status-text">
              <CheckCircle size={16} />
              Profile Active
            </p>
          </div>
        </div>
      </div>

      <div className="form-sections-enhanced">
        {/* Personal Information Section */}
        <div className="form-section-enhanced">
          <div className="section-header">
            <div className="section-icon">
              <User size={20} />
            </div>
            <h3>Personal Information</h3>
            <span className="completion-badge">
              <CheckCircle size={16} />
              Active
            </span>
          </div>
          <div className="form-grid-enhanced">
            {renderEditableField('first_name', 'First Name', User, 'text', 'Enter your first name')}
            {renderEditableField('last_name', 'Last Name', User, 'text', 'Enter your last name')}
            {renderEditableField('phone', 'Phone Number', Phone, 'tel', 'Enter your phone number')}
            <div className="form-group-enhanced">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  value={displayProfileData.email || 'Not available'}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <small className="help-text">Email cannot be changed</small>
            </div>
          </div>
        </div>

        {/* Service Details Section */}
        <div className="form-section-enhanced">
          <div className="section-header">
            <div className="section-icon">
              <Briefcase size={20} />
            </div>
            <h3>Service Details</h3>
            <span className="completion-badge">
              <CheckCircle size={16} />
              Active
            </span>
          </div>
          <div className="form-grid-enhanced">
            <div className="form-group-enhanced">
              <label>Service Category</label>
              <div className="input-wrapper">
                <div className="icon-container">
                  <Package size={20} />
                </div>
                <input
                  type="text"
                  value={displayProfileData?.service_category_name || 'Not selected'}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <small className="help-text">Service category from your profile</small>
            </div>
            <div className="form-group-enhanced">
              <label>Specific Service</label>
              <div className="input-wrapper">
                <div className="icon-container">
                  <Target size={20} />
                </div>
                <input
                  type="text"
                  value={displayProfileData?.service_name || 'Not selected'}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <small className="help-text">Specific service from your profile</small>
            </div>
            {renderEditableField('years_of_experience', 'Years of Experience', Award, 'number', '0')}
            <div className="form-group-enhanced">
              <label>Hourly Rate (₹)</label>
              <div className="input-wrapper">
                <div className="icon-container">
                  <DollarSign size={20} />
                </div>
                <input
                  type="number"
                  value={displayProfileData?.hourly_rate ?? 0}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <small className="help-text">
                Your current hourly rate is managed by the admin team. Use the panel below to request an update.
              </small>
              <div className="wage-request-card">
                <div className="wage-request-header">
                  <span className="wage-request-title">Request wage increase</span>
                  <span className="wage-request-chip">
                    Current: ₹{displayProfileData?.hourly_rate ?? 0}/hr
                  </span>
                </div>
                <div className="wage-request-body">
                  <div className="wage-request-field">
                    <label>Requested new rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter requested new hourly rate"
                      value={wageRequestData.requestedRate}
                      onChange={(e) => handleWageRequestChange('requestedRate', e.target.value)}
                      className={`wage-request-input${isRequestedBelowOrEqualCurrent ? ' wage-request-input-error' : ''}`}
                    />
                    <div className="wage-request-meta">
                      {isRequestedBelowOrEqualCurrent && requestedHourlyRate > 0 ? (
                        <span className="wage-request-error">
                          New rate must be higher than your current rate (₹{currentHourlyRate.toFixed(2)}).
                        </span>
                      ) : null}
                      {!isRequestedBelowOrEqualCurrent && wageIncreasePercent && requestedHourlyRate > 0 ? (
                        <span className="wage-request-hint">
                          Increase of ₹{wageIncrease.toFixed(2)} (+{wageIncreasePercent}%)
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="wage-request-field">
                    <label>Reason (optional)</label>
                    <textarea
                      placeholder="Add a short note about your experience, certifications, or performance."
                      value={wageRequestData.reason}
                      onChange={(e) => handleWageRequestChange('reason', e.target.value)}
                      className="editable-textarea"
                      rows={2}
                    />
                  </div>
                  <div className="wage-request-actions">
                    <button
                      type="button"
                      className="btn-primary wage-request-btn"
                      onClick={submitWageRequest}
                      disabled={wageRequestLoading}
                    >
                      {wageRequestLoading ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </div>
                <p className="wage-request-footnote">
                  Requests are reviewed by an admin. You will receive a notification once a decision is made.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information Section */}
        <div className="form-section-enhanced">
          <div className="section-header">
            <div className="section-icon">
              <MapPin size={20} />
            </div>
            <h3>Location Information</h3>
            <span className="completion-badge">
              <CheckCircle size={16} />
              Active
            </span>
          </div>
          <div className="form-grid-enhanced">
            {renderEditableField('pincode', 'Pincode', MapPin, 'text', 'Enter pincode')}
            {renderEditableField('city', 'City', Building, 'text', 'Enter city')}
            {renderEditableField('state', 'State', MapPin, 'text', 'Enter state')}
            {renderEditableField('address', 'Address', MapPin, 'text', 'Enter full address')}
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="form-section-enhanced">
          <div className="section-header">
            <div className="section-icon">
              <Award size={20} />
            </div>
            <h3>Professional Information</h3>
            <span className="completion-badge">
              <CheckCircle size={16} />
              Active
            </span>
          </div>
          <div className="form-grid-enhanced">
            {renderEditableField('bio', 'Bio', User, 'textarea', 'Tell us about yourself')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableProfileSections;
