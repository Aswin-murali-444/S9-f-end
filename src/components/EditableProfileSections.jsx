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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});

  useEffect(() => {
    if (providerId) {
      loadProfileData();
    }
  }, [providerId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProviderProfile(providerId);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
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
    const currentValue = profileData?.[fieldName] || '';
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

  if (loading) {
    return (
      <div className="editable-profile-sections loading">
        <div className="loading-spinner">
          <Clock size={24} className="animate-spin" />
          <span>Loading profile data...</span>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="editable-profile-sections error">
        <AlertCircle size={24} />
        <span>Failed to load profile data</span>
      </div>
    );
  }

  // Check if profile status is active
  const isProfileActive = profileData.status === 'active';

  if (!isProfileActive) {
    return (
      <div className="editable-profile-sections inactive-profile">
        <div className="inactive-profile-content">
          <div className="inactive-icon">
            <AlertCircle size={48} />
          </div>
          <h3>Complete Your Profile</h3>
          <p>
            Your profile status is currently <strong>{profileData.status}</strong>. 
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
            {profileData?.profile_photo_url ? (
              <img 
                src={profileData.profile_photo_url} 
                alt="Profile" 
                className="profile-photo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="profile-photo-placeholder" style={{ display: profileData?.profile_photo_url ? 'none' : 'flex' }}>
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
            <h3>{profileData?.first_name} {profileData?.last_name}</h3>
            <div className="profile-subtitle">
              <Briefcase size={14} />
              <span>Service Provider</span>
              {profileData?.service_category_name ? (
                <>
                  <span className="dot-sep">•</span>
                  <span>{profileData.service_category_name}</span>
                </>
              ) : null}
            </div>
            <div className="profile-badges">
              {profileData?.specialization ? (
                <span className="badge">
                  {profileData.specialization}
                </span>
              ) : null}
              {profileData?.service_name ? (
                <span className="badge">
                  {profileData.service_name}
                </span>
              ) : null}
              {Number.isFinite(Number(profileData?.years_of_experience)) ? (
                <span className="badge subtle">
                  {profileData.years_of_experience} yrs exp
                </span>
              ) : null}
            </div>
            <div className="profile-contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>{profileData?.email || 'Email not available'}</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>{profileData?.phone || 'Phone not available'}</span>
              </div>
            </div>
            
            {/* Service Provider Information */}
            <div className="service-provider-info">
              <div className="provider-role">
                <Briefcase size={16} />
                <span>Service Provider</span>
              </div>
              
              {profileData?.specialization && (
                <div className="provider-detail">
                  <span className="detail-label">Specialization:</span>
                  <span className="detail-value">{profileData.specialization}</span>
                </div>
              )}
              
              {profileData?.service_category_name && (
                <div className="provider-detail">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{profileData.service_category_name}</span>
                </div>
              )}
              
              {profileData?.service_name && (
                <div className="provider-detail">
                  <span className="detail-label">Service:</span>
                  <span className="detail-value">{profileData.service_name}</span>
                </div>
              )}
              
              {profileData?.years_of_experience !== undefined && (
                <div className="provider-detail">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{profileData.years_of_experience} years</span>
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
                  value={profileData.email || 'Not available'}
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
                  value={profileData?.service_category_name || 'Not selected'}
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
                  value={profileData?.service_name || 'Not selected'}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <small className="help-text">Specific service from your profile</small>
            </div>
            {renderEditableField('years_of_experience', 'Years of Experience', Award, 'number', '0')}
            {renderEditableField('hourly_rate', 'Hourly Rate (₹)', DollarSign, 'number', '0')}
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
