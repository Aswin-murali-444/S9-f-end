import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Phone, Settings, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { validationUtils } from '../../utils/validation';
import { apiService } from '../../services/api';
import './AdminPages.css';

const AddServiceProviderPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    
    // Service Provider Details
    specialization: '',
    service_category_id: '',
    service_id: '',
    basic_pay: '',
    status: 'active',
    notes: '',
    
    // Admin Settings
    sendEmail: true
  });
  
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isToggleAnimating, setIsToggleAnimating] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(true);
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });
  // Lock body scroll when modal is open
  useEffect(() => {
    if (successModal.open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [successModal.open]);

  // Reusable animated dropdown (for category and service)
  const FancySelect = ({ label, options, value, onChange, placeholder = 'Select', disabled = false, name, id }) => {
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.value === value);
    return (
      <div className={`fancy-select ${disabled ? 'disabled' : ''}`} onBlur={() => setOpen(false)}>
        <button
          type="button"
          id={id}
          name={name}
          className={`fancy-select-trigger ${open ? 'open' : ''}`}
          onClick={() => !disabled && setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span className={`placeholder ${selected ? 'has' : ''}`}>{selected ? selected.label : placeholder}</span>
          <span className="chevron" />
        </button>
        {open && (
          <ul className="fancy-select-menu" role="listbox">
            {options.map(opt => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`fancy-option ${opt.value === value ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange({ target: { name, value: opt.value, type: 'select-one' } });
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Load categories and services
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
        
        // Load services
        const servicesResponse = await fetch('/api/services');
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Debounced email availability check
  useEffect(() => {
    let timer;
    const run = async () => {
      const email = (formData.email || '').trim();
      if (!email) {
        setIsEmailAvailable(true);
        return;
      }
      setIsCheckingEmail(true);
      const result = await apiService.checkEmailExists(email);
      setIsCheckingEmail(false);
      if (result?.error) return; // ignore network/format errors silently
      setIsEmailAvailable(!result.exists);
      setValidationErrors(prev => ({
        ...prev,
        email: result.exists ? 'Email already registered' : undefined
      }));
    };
    // small debounce to avoid hammering the API
    timer = setTimeout(run, 400);
    return () => clearTimeout(timer);
  }, [formData.email]);

  // Enhanced validation with comprehensive rules
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'full_name': {
        if (!value || value.trim() === '') {
          return 'Full name is required';
        }
        if (value.trim().length < 2) {
          return 'Full name must be at least 2 characters';
        }
        if (value.trim().length > 30) {
          return 'Full name must be at most 30 characters';
        }
        if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          return 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        if (value.trim().split(' ').length < 2) {
          return 'Please enter both first and last name';
        }
        return undefined;
      }
      
      case 'email': {
        if (!value || value.trim() === '') {
          return 'Email address is required';
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        if (value.trim().length > 254) {
          return 'Email address is too long';
        }
        return undefined;
      }
      
      case 'phone': {
        if (!value || value.trim() === '') {
          return undefined; // Optional field
        }
        // Normalize: remove spaces, dashes, brackets, dots
        const stripped = value.replace(/[\s\-\(\)\.]/g, '');
        // Remove Indian prefixes +91, 91, or leading 0
        let normalized = stripped.replace(/^\+?91/, '').replace(/^0/, '');
        // If still longer than 10, keep last 10 digits (handles 0091, etc.)
        if (normalized.length > 10) {
          normalized = normalized.slice(-10);
        }
        // Must be exactly 10 digits and start with 6-9
        if (!/^[6-9][0-9]{9}$/.test(normalized)) {
          return 'Enter a valid 10‑digit Indian mobile number (starts with 6-9)';
        }
        // Reject numbers with all identical digits or obvious repeating patterns
        if (/^(\d)\1{9}$/.test(normalized)) {
          return 'Phone number cannot be all the same digit';
        }
        return undefined;
      }
      
      case 'service_category_id': {
        if (!value || value.trim() === '') {
          return 'Service category is required';
        }
        const validCategory = categories.find(cat => cat.id === value);
        if (!validCategory) {
          return 'Please select a valid service category';
        }
        return undefined;
      }
      
      case 'service_id': {
        if (!value || value.trim() === '') {
          return 'Service selection is required';
        }
        const validService = services.find(service => service.id === value);
        if (!validService) {
          return 'Please select a valid service';
        }
        return undefined;
      }
      
      case 'specialization': {
        if (!value || value.trim() === '') {
          return 'Specialization is required';
        }
        if (value.trim().length < 3) {
          return 'Specialization must be at least 3 characters';
        }
        if (value.trim().length > 200) {
          return 'Specialization must be less than 200 characters';
        }
        return undefined;
      }
      
      case 'status': {
        const validStatuses = ['active', 'pending_verification'];
        if (!value || !validStatuses.includes(value)) {
          return 'Please select a valid status';
        }
        return undefined;
      }
      
      case 'notes': {
        if (!value || value.trim() === '') {
          return undefined; // Optional field
        }
        if (value.trim().length > 1000) {
          return 'Notes must be less than 1000 characters';
        }
        return undefined;
      }
      
      default:
        return undefined;
    }
  };

  // Real-time validation for better UX
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['full_name', 'email', 'service_category_id', 'service_id', 'specialization', 'status'];
    
    // Validate required fields
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Email uniqueness guard right before submit
    if (!isEmailAvailable) {
      errors.email = 'Email already registered';
    }
    
    // Validate optional fields that have values
    const optionalFields = ['phone', 'notes'];
    optionalFields.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
        }
      }
    });
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Handle service category change - filter services
    if (name === 'service_category_id') {
      const filtered = services.filter(service => service.category === value);
      setFilteredServices(filtered);
      // Clear service selection when category changes
      setFormData(prev => ({ ...prev, service_id: '', specialization: '' }));
      setSelectedService(null);
    }
    
    // Handle service selection - update specialization and basic pay
    if (name === 'service_id') {
      const service = services.find(s => s.id === value);
      setSelectedService(service);
      if (service) {
        const getServiceRupee = (s) => {
          const v = s.price_inr ?? s.wage_inr ?? s.wage ?? s.price;
          return v ?? '';
        };
        const rupeeValue = getServiceRupee(service);
        setFormData(prev => ({ 
          ...prev, 
          specialization: service.name,
          service_category_id: service.category,
          basic_pay: rupeeValue 
        }));
      }
    }
    
    // Mark as touched and validate
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, newValue);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  // Enhanced toggle handler with animation
  const handleToggleChange = (e) => {
    setIsToggleAnimating(true);
    const newStatus = e.target.checked ? 'active' : 'pending_verification';
    
    setFormData(prev => ({ ...prev, status: newStatus }));
    setTouched(prev => ({ ...prev, status: true }));
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsToggleAnimating(false);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allFields = ['full_name', 'email', 'phone', 'service_category_id', 'service_id', 'specialization', 'status', 'notes'];
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
    
    // Validate entire form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      const result = await apiService.adminCreateProvider(formData);
      
      // apiService.request throws on non-2xx; reaching here means success
      // Treat presence of user or message as success indicator
      if (result && (result.user || result.message)) {
        const emailInfo = result.emailSent ? 'Email sent.' : (result.emailError ? `Email failed: ${result.emailError}.` : 'Email skipped.');
        setSuccessModal({
          open: true,
          title: 'Service Provider Created',
          message: `The provider account was created successfully. ${emailInfo}`
        });
        
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          specialization: '',
          service_category_id: '',
          service_id: '',
          basic_pay: '',
          status: 'active',
          notes: '',
          sendEmail: true
        });
        setTouched({});
        setValidationErrors({});
        setSelectedService(null);
        
        // Navigate back to admin dashboard
        // keep user on page until they close modal
      } else {
        setValidationErrors({ submit: 'Failed to create service provider. Please try again.' });
      }
    } catch (error) {
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('email already registered')) {
        setValidationErrors(prev => ({ ...prev, email: 'Email already registered' }));
      } else {
        setValidationErrors({ 
          submit: 'An error occurred while creating the service provider. Please check your connection and try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const statusOptions = [
    { value: 'pending_verification', label: 'Pending Verification', description: 'New provider awaiting approval' },
    { value: 'active', label: 'Active', description: 'Provider can accept jobs' },
    { value: 'suspended', label: 'Suspended', description: 'Temporarily disabled' },
    { value: 'inactive', label: 'Inactive', description: 'Permanently disabled' }
  ];

  return (
    <AdminLayout>
      <motion.div
        className="admin-page-content"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Page Header */}
        <motion.div className="page-header" variants={itemVariants}>
          <div className="page-title">
            <h1>Add Service Provider</h1>
            <p>Create a new service provider account with specialized permissions</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form 
          className="admin-form"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="form-sections">
            {/* Personal Information */}
            <div className="form-section">
              <h3>
                <User size={20} />
                Personal Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name *</label>
                  <div className="input-container">
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      onBlur={() => setTouched(prev => ({ ...prev, full_name: true }))}
                      placeholder="Enter first and last name"
                      required
                      autoComplete="off"
                      maxLength={30}
                      className={`${touched.full_name && validationErrors.full_name ? 'error' : ''} ${touched.full_name && !validationErrors.full_name ? 'valid' : ''}`}
                    />
                    <div className="input-feedback">
                      {touched.full_name && validationErrors.full_name && (
                        <small className="error-text">{validationErrors.full_name}</small>
                      )}
                      {touched.full_name && !validationErrors.full_name && formData.full_name && (
                        <small className="success-text">✓ Valid name</small>
                      )}
                      {/* counter hidden */}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-container">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                      placeholder="provider@example.com"
                      required
                      autoComplete="off"
                      maxLength={254}
                      className={`${touched.email && validationErrors.email ? 'error' : ''} ${touched.email && !validationErrors.email ? 'valid' : ''}`}
                    />
                    <div className="input-feedback">
                      {touched.email && validationErrors.email && (
                        <small className="error-text">{validationErrors.email}</small>
                      )}
                      {touched.email && !validationErrors.email && formData.email && (
                        <small className="success-text">✓ Valid email</small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-container">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                      placeholder="+91 98765 43210"
                      autoComplete="off"
                      maxLength={20}
                      className={`${touched.phone && validationErrors.phone ? 'error' : ''} ${touched.phone && !validationErrors.phone && formData.phone ? 'valid' : ''}`}
                    />
                    <div className="input-feedback">
                      {touched.phone && validationErrors.phone && (
                        <small className="error-text">{validationErrors.phone}</small>
                      )}
                      {touched.phone && !validationErrors.phone && formData.phone && (
                        <small className="success-text">✓ Valid phone number</small>
                      )}
                      <small className="field-help">Optional — Indian mobile format. Accepts +91/91/0 prefixes.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Provider Details */}
            <div className="form-section">
              <h3>
                <Briefcase size={20} />
                Service Provider Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="service_category_id">Service Category *</label>
                  <div className="input-container">
                    <FancySelect
                      id="service_category_id"
                      name="service_category_id"
                      value={formData.service_category_id}
                      onChange={handleInputChange}
                      placeholder="Select a category"
                      disabled={false}
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                    />
                    <div className="input-feedback">
                      {touched.service_category_id && validationErrors.service_category_id && (
                        <small className="error-text">{validationErrors.service_category_id}</small>
                      )}
                      {touched.service_category_id && !validationErrors.service_category_id && formData.service_category_id && (
                        <small className="success-text">✓ Category selected</small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="service_id">Specific Service *</label>
                  <div className="input-container">
                    <FancySelect
                      id="service_id"
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleInputChange}
                      placeholder="Select a service"
                      disabled={!formData.service_category_id}
                      options={filteredServices.map(s => {
                        const rupee = s.price_inr ?? s.wage_inr ?? s.wage ?? s.price;
                        const display = typeof rupee === 'number' ? `₹${rupee}` : (rupee ? `₹${rupee}` : '₹N/A');
                        return { value: s.id, label: `${s.name} - ${display}` };
                      })}
                    />
                    <div className="input-feedback">
                      {touched.service_id && validationErrors.service_id && (
                        <small className="error-text">{validationErrors.service_id}</small>
                      )}
                      {touched.service_id && !validationErrors.service_id && formData.service_id && (
                        <small className="success-text">✓ Service selected</small>
                      )}
                      {!formData.service_category_id && (
                        <small className="field-help">Please select a category first</small>
                      )}
                      {selectedService && (
                        <small className="form-help">
                          Service Price: {(() => {
                            const rupee = selectedService.price_inr ?? selectedService.wage_inr ?? selectedService.wage ?? selectedService.price;
                            return rupee ? `₹${rupee}` : 'Not set';
                          })()} | 
                          Duration: {selectedService.duration || 'Not set'}
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    onBlur={() => setTouched(prev => ({ ...prev, specialization: true }))}
                    placeholder="Auto-filled from selected service"
                    className={touched.specialization && validationErrors.specialization ? 'error' : ''}
                    readOnly
                  />
                  {touched.specialization && validationErrors.specialization && (
                    <small className="error-text">{validationErrors.specialization}</small>
                  )}
                  <small className="form-help">
                    Specialization is automatically set based on the selected service
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="basic_pay">Basic Pay (₹)</label>
                  <div className="price-input-container">
                    <span className="currency-symbol">₹</span>
                    <input
                      id="basic_pay"
                      name="basic_pay"
                      type="number"
                      value={formData.basic_pay}
                      onChange={handleInputChange}
                      onBlur={() => setTouched(prev => ({ ...prev, basic_pay: true }))}
                      placeholder="0"
                      min="0"
                      step="1"
                      className={`${touched.basic_pay && validationErrors.basic_pay ? 'error' : ''}`}
                      readOnly
                    />
                  </div>
                  <small className="form-help">Auto-filled from the selected service price</small>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <div className="status-toggle-container">
                    <div className={`status-toggle ${isToggleAnimating ? 'animating' : ''}`}>
                      <input
                        type="checkbox"
                        id="status-toggle"
                        checked={formData.status === 'active'}
                        onChange={handleToggleChange}
                      />
                      <label htmlFor="status-toggle" className="toggle-label">
                        <span className="toggle-text">
                          {formData.status === 'active' ? 'Active & Available' : 'Pending Verification'}
                        </span>
                        <span className="toggle-description">
                          {formData.status === 'active' 
                            ? 'Service provider can receive bookings and is visible to customers'
                            : 'Service provider needs verification before becoming active'
                          }
                        </span>
                      </label>
                    </div>
                  </div>
                  {touched.status && validationErrors.status && (
                    <small className="error-text">{validationErrors.status}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3>
                <FileText size={20} />
                Additional Information
              </h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    onBlur={() => setTouched(prev => ({ ...prev, notes: true }))}
                    placeholder="Additional notes about this service provider..."
                    rows={4}
                    className={touched.notes && validationErrors.notes ? 'error' : ''}
                  />
                  {touched.notes && validationErrors.notes && (
                    <small className="error-text">{validationErrors.notes}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Account Creation Settings */}
            <div className="form-section">
              <h3>
                <Settings size={20} />
                Account Creation Settings
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="sendEmail"
                      checked={formData.sendEmail}
                      onChange={handleInputChange}
                    />
                    <span>Send credentials via email</span>
                  </label>
                  <small className="form-help">
                    A secure password will be auto-generated and sent to the provider's email
                  </small>
                </div>
              </div>
              
              <div className="info-box">
                <div className="info-item">
                  <CheckCircle size={16} />
                  <span>A secure password will be auto-generated automatically</span>
                </div>
                <div className="info-item">
                  <CheckCircle size={16} />
                  <span>Credentials will be sent to the provider's email if enabled</span>
                </div>
                <div className="info-item">
                  <CheckCircle size={16} />
                  <span>Provider will be created with "pending_verification" status</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error Display */}
          {validationErrors.submit && (
            <motion.div className="submit-error" variants={itemVariants}>
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h4>Submission Error</h4>
                <p>{validationErrors.submit}</p>
              </div>
            </motion.div>
          )}

          {/* Form Actions */}
          <motion.div className="form-actions" variants={itemVariants}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard/admin')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Creating Provider...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Service Provider
                </>
              )}
            </button>
          </motion.div>
        </motion.form>

        {/* Success Modal */}
        {successModal.open && (
          <div className="provider-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setSuccessModal({ open: false, title: '', message: '' })}>
            <div className="provider-modal" onClick={(e) => e.stopPropagation()}>
              <div className="provider-modal-icon">✅</div>
              <h3 className="provider-modal-title">{successModal.title}</h3>
              <p className="provider-modal-message">{successModal.message}</p>
              <div className="provider-modal-actions">
                <button className="btn-primary" onClick={() => {
                  setSuccessModal({ open: false, title: '', message: '' });
                  navigate('/dashboard/admin');
                }}>Go to Dashboard</button>
                <button className="btn-secondary" onClick={() => setSuccessModal({ open: false, title: '', message: '' })}>Stay Here</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AddServiceProviderPage;
