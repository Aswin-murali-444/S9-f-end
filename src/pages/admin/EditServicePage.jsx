import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, UploadCloud, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import './AdminPages.css';

const EditServicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    duration: '',
    customDuration: '',
    price: '',
    offerPrice: '',
    offerPercentage: '',
    offerEnabled: false,
    active: true
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameValidationTimer, setNameValidationTimer] = useState(null);
  const [nameValidationStatus, setNameValidationStatus] = useState(null); // 'checking', 'valid', 'invalid', null

  // Duration options with suggested pricing (in Indian Rupees)
  const durationOptions = [
    { value: '30 minutes', label: '30 minutes', suggestedPrice: 200 },
    { value: '1 hour', label: '1 hour', suggestedPrice: 400 },
    { value: '1-2 hours', label: '1-2 hours', suggestedPrice: 600 },
    { value: '2-4 hours', label: '2-4 hours', suggestedPrice: 1000 },
    { value: 'Half day (4-6 hours)', label: 'Half day (4-6 hours)', suggestedPrice: 1500 },
    { value: 'Full day (6-8 hours)', label: 'Full day (6-8 hours)', suggestedPrice: 2500 },
    { value: 'custom', label: 'Custom Duration', suggestedPrice: 0 }
  ];

  // Fetch categories and service data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const categoriesData = await apiService.getCategories();
        const activeCategories = Array.isArray(categoriesData) ? categoriesData.filter(cat => cat.active) : [];
        setCategories(activeCategories);
        
        // Fetch service data
        const serviceData = await apiService.getService(id);
        
        const categoryId = serviceData.category_id || serviceData.categoryId || serviceData.category || serviceData.service_categories?.id || '';
        
        // Check if duration is custom (not in predefined options)
        const isCustomDuration = serviceData.duration && !durationOptions.some(option => option.value === serviceData.duration);
        
        setFormData({
          categoryId: categoryId,
          name: serviceData.name || '',
          description: serviceData.description || '',
          duration: isCustomDuration ? 'custom' : (serviceData.duration || ''),
          customDuration: isCustomDuration ? (serviceData.duration || '') : '',
          price: serviceData.price ? serviceData.price.toString() : '',
          offerPrice: serviceData.offer_price ? serviceData.offer_price.toString() : '',
          offerPercentage: serviceData.offer_percentage ? serviceData.offer_percentage.toString() : '',
          offerEnabled: serviceData.offer_enabled || false,
          active: serviceData.active !== undefined ? serviceData.active : true
        });
        
        // Set existing icon if available
        if (serviceData.icon_url) {
          setIconPreview(serviceData.icon_url);
        }
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load service data');
        navigate('/dashboard/admin?tab=services');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (nameValidationTimer) {
        clearTimeout(nameValidationTimer);
      }
    };
  }, [nameValidationTimer]);

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'categoryId':
        if (!value || value.trim() === '') {
          newErrors.categoryId = 'Please select a category';
        } else {
          delete newErrors.categoryId;
        }
        break;
      case 'name':
        if (!value || value.trim() === '') {
          newErrors.name = 'Service name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Service name must be at least 2 characters';
        } else if (value.trim().length > 200) {
          newErrors.name = 'Service name must be less than 200 characters';
        } else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(value.trim())) {
          newErrors.name = 'Service name can only contain letters, numbers, spaces, hyphens, ampersands, commas, periods, and parentheses';
        } else if (value.trim().startsWith(' ') || value.trim().endsWith(' ')) {
          newErrors.name = 'Service name cannot start or end with spaces';
        } else if (/\s{2,}/.test(value.trim())) {
          newErrors.name = 'Service name cannot contain multiple consecutive spaces';
        } else {
          delete newErrors.name;
        }
        break;
      case 'description':
        if (value && value.trim().length > 1000) {
          newErrors.description = 'Description must be less than 1000 characters';
        } else {
          delete newErrors.description;
        }
        break;
      case 'duration':
        if (!value || value.trim() === '') {
          newErrors.duration = 'Please select a duration or choose Custom';
        } else if (value && value.trim().length > 100) {
          newErrors.duration = 'Duration must be less than 100 characters';
        } else if (value && value.trim().startsWith(' ')) {
          newErrors.duration = 'Duration cannot start with spaces';
        } else if (value && value.trim().endsWith(' ')) {
          newErrors.duration = 'Duration cannot end with spaces';
        } else if (value && /\s{2,}/.test(value.trim())) {
          newErrors.duration = 'Duration cannot contain multiple consecutive spaces';
        } else {
          delete newErrors.duration;
        }
        break;
      case 'customDuration':
        if (value && value.trim() !== '') {
          if (value.trim().length > 100) {
            newErrors.customDuration = 'Custom duration must be less than 100 characters';
          } else if (value.trim().startsWith(' ')) {
            newErrors.customDuration = 'Custom duration cannot start with spaces';
          } else if (value.trim().endsWith(' ')) {
            newErrors.customDuration = 'Custom duration cannot end with spaces';
          } else if (/\s{2,}/.test(value.trim())) {
            newErrors.customDuration = 'Custom duration cannot contain multiple consecutive spaces';
          } else {
            delete newErrors.customDuration;
          }
        } else if (formData.duration === 'custom') {
          newErrors.customDuration = 'Custom duration is required when custom option is selected';
        } else {
          delete newErrors.customDuration;
        }
        break;
      case 'price':
        if (!value || value.trim() === '') {
          newErrors.price = 'Price is required';
        } else {
          const priceValue = parseFloat(value);
          if (isNaN(priceValue) || priceValue < 0) {
            newErrors.price = 'Price must be a valid positive number';
          } else if (priceValue > 99999) {
            newErrors.price = 'Price cannot exceed ₹99,999';
          } else {
            delete newErrors.price;
          }
        }
        break;
      case 'offerPrice':
        if (value && value.trim() !== '') {
          const offerValue = parseFloat(value);
          const priceValue = parseFloat(formData.price) || 0;
          if (isNaN(offerValue) || offerValue < 0) {
            newErrors.offerPrice = 'Offer price must be a valid positive number';
          } else if (offerValue > 99999) {
            newErrors.offerPrice = 'Offer price cannot exceed ₹99,999';
          } else if (priceValue > 0 && offerValue >= priceValue) {
            newErrors.offerPrice = 'Offer price must be less than regular price';
          } else {
            delete newErrors.offerPrice;
          }
        } else {
          delete newErrors.offerPrice;
        }
        break;
      case 'offerPercentage':
        if (value && value.trim() !== '') {
          const percentageValue = parseFloat(value);
          if (isNaN(percentageValue) || percentageValue < 0) {
            newErrors.offerPercentage = 'Offer percentage must be a valid positive number';
          } else if (percentageValue > 100) {
            newErrors.offerPercentage = 'Offer percentage cannot exceed 100%';
          } else {
            delete newErrors.offerPercentage;
          }
        } else {
          delete newErrors.offerPercentage;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate field if it has been touched
    if (touched[name]) {
      validateField(name, newValue);
    }

    // Special handling for service name with debounced validation
    if (name === 'name' && formData.categoryId) {
      // Reset validation status when user starts typing
      setNameValidationStatus(null);
      
      // Clear existing timer
      if (nameValidationTimer) {
        clearTimeout(nameValidationTimer);
      }
      
      // Set new timer for debounced validation
      const timer = setTimeout(() => {
        checkServiceNameAvailability(newValue, formData.categoryId);
      }, 800); // 800ms delay for better responsiveness
      
      setNameValidationTimer(timer);
    }

    // Special handling for category change - check name availability if name is already entered
    if (name === 'categoryId' && formData.name && formData.name.trim().length >= 2) {
      // Clear existing timer
      if (nameValidationTimer) {
        clearTimeout(nameValidationTimer);
      }
      
      // Set new timer for debounced validation
      const timer = setTimeout(() => {
        checkServiceNameAvailability(formData.name, newValue);
      }, 500); // Shorter delay for category change
      
      setNameValidationTimer(timer);
    }
  };

  const handleDurationChange = (e) => {
    const { value } = e.target;
    const selectedOption = durationOptions.find(option => option.value === value);
    
    setFormData(prev => ({
      ...prev,
      duration: value,
      // Clear custom duration when selecting predefined option
      customDuration: value === 'custom' ? prev.customDuration : '',
      // Auto-populate price if a predefined duration is selected
      price: selectedOption && selectedOption.suggestedPrice > 0 ? selectedOption.suggestedPrice.toString() : prev.price
    }));
    
    // Validate both fields
    if (touched.duration) {
      validateField('duration', value);
    }
    if (touched.price && selectedOption && selectedOption.suggestedPrice > 0) {
      validateField('price', selectedOption.suggestedPrice.toString());
    }
  };

  const handleCustomDurationChange = (e) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      customDuration: value
    }));
    
    // Validate the field
    if (touched.customDuration) {
      validateField('customDuration', value);
    }
  };

  const calculateOfferPrice = (price, percentage) => {
    if (!price || !percentage) return '';
    const originalPrice = parseFloat(price);
    const discountPercentage = parseFloat(percentage);
    const discountAmount = (originalPrice * discountPercentage) / 100;
    const finalPrice = originalPrice - discountAmount;
    return Math.round(finalPrice).toString();
  };

  const handleOfferPercentageChange = (e) => {
    const { value } = e.target;
    const price = formData.price;
    
    setFormData(prev => ({
      ...prev,
      offerPercentage: value,
      // Auto-calculate offer price if both price and percentage are available
      offerPrice: price && value ? calculateOfferPrice(price, value) : prev.offerPrice
    }));
    
    // Validate the field
    if (touched.offerPercentage) {
      validateField('offerPercentage', value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Debounced service name validation
  const checkServiceNameAvailability = async (name, categoryId) => {
    if (!name || !categoryId || name.trim().length < 2) {
      setNameValidationStatus(null);
      return;
    }

    setIsCheckingName(true);
    setNameValidationStatus('checking');
    
    try {
      const result = await apiService.checkServiceNameAvailability(name, categoryId, id);
      if (!result.available) {
        setErrors(prev => ({
          ...prev,
          name: result.message
        }));
        setNameValidationStatus('invalid');
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.name === result.message) {
            delete newErrors.name;
          }
          return newErrors;
        });
        setNameValidationStatus('valid');
      }
    } catch (error) {
      console.error('Error checking service name:', error);
      setNameValidationStatus('invalid');
      setErrors(prev => ({
        ...prev,
        name: 'Unable to verify name availability. Please try again.'
      }));
    } finally {
      setIsCheckingName(false);
    }
  };


  const handleIconChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const isImage = /^image\/(png|jpe?g)$/i.test(file.type || '');
    const under2mb = file.size <= 2 * 1024 * 1024;
    if (!isImage || !under2mb) {
      toast.error('Please select a PNG or JPG up to 2MB.');
      return;
    }
    setIconFile(file);
    try {
      const reader = new FileReader();
      reader.onload = () => setIconPreview(String(reader.result || ''));
      reader.readAsDataURL(file);
    } catch (_) {}
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    const allTouched = {
      categoryId: true,
      name: true,
      description: true,
      duration: true,
      customDuration: true,
      price: true,
      offerPrice: true,
      offerPercentage: true
    };
    setTouched(allTouched);
    
    // Minimal required validation to prevent false blocks when only duration changes
    const resolvedDuration = formData.duration === 'custom' ? formData.customDuration : formData.duration;
    const hasCategory = Boolean(formData.categoryId && formData.categoryId.trim());
    const hasName = Boolean(formData.name && formData.name.trim().length >= 2 && formData.name.trim().length <= 200);
    const hasDuration = Boolean(resolvedDuration && String(resolvedDuration).trim());
    const priceValue = formData.price && formData.price.trim() !== '' ? parseFloat(formData.price) : NaN;
    const hasPrice = !Number.isNaN(priceValue) && priceValue >= 0;

    if (!hasCategory || !hasName || !hasDuration || !hasPrice) {
      toast.error('Please complete required fields: category, name, duration, price');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const serviceData = {
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description,
        duration: formData.duration === 'custom' ? formData.customDuration : formData.duration,
        price: formData.price && formData.price.trim() !== '' ? parseFloat(formData.price) : null,
        offerPrice: formData.offerPrice && formData.offerPrice.trim() !== '' ? parseFloat(formData.offerPrice) : null,
        offerPercentage: formData.offerPercentage && formData.offerPercentage.trim() !== '' ? parseFloat(formData.offerPercentage) : null,
        offerEnabled: formData.offerEnabled,
        active: formData.active,
        iconBase64: iconFile ? iconPreview.split(',')[1] : null, // Remove data:image/...;base64, prefix
        iconFileName: iconFile?.name || null,
        iconMimeType: iconFile?.type || null
      };
      
      // Safety: ensure duration is non-empty
      if (!serviceData.duration || String(serviceData.duration).trim() === '') {
        throw new Error('Duration cannot be empty');
      }

      await apiService.updateService(id, serviceData);
      toast.success('Service updated successfully!');
      
      // Navigate back to services tab
      navigate('/dashboard/admin?tab=services');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
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
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-page-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Loading service data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div 
        className="admin-page-content" 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
      >
        <motion.div className="page-header" variants={itemVariants}>
          <div className="page-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/dashboard/admin?tab=services')}
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
            <h1>Edit Service</h1>
            <p>Update service information and settings</p>
          </div>
        </motion.div>

        <motion.form
          className="admin-form"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="categoryId">Select Category *</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={touched.categoryId && errors.categoryId ? 'error' : ''}
                    required
                  >
                    <option value="">Choose a category</option>
                    {categories.filter(cat => cat.active).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {touched.categoryId && errors.categoryId && (
                    <span className="error-message">{errors.categoryId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="name">Service Name *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g., Plumbing Repair"
                      className={`${touched.name && errors.name ? 'error' : ''} ${nameValidationStatus === 'valid' ? 'success' : ''}`}
                      required
                    />
                    <div style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {nameValidationStatus === 'checking' && (
                        <div className="checking-status">
                          <Loader2 size={16} className="animate-spin" style={{ color: '#64748b' }} />
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Checking...</span>
                        </div>
                      )}
                      {nameValidationStatus === 'valid' && (
                        <div className="validation-status">
                          <CheckCircle size={16} style={{ color: '#10b981' }} />
                          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>Available</span>
                        </div>
                      )}
                      {nameValidationStatus === 'invalid' && (
                        <div className="validation-status">
                          <XCircle size={16} style={{ color: '#ef4444' }} />
                          <span style={{ 
                            color: '#ef4444', 
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>Already exists</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {touched.name && errors.name && (
                    <div className="validation-error" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '0.5rem',
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      <XCircle size={14} />
                      <span>{errors.name}</span>
                    </div>
                  )}
                  {nameValidationStatus === 'valid' && !errors.name && (
                    <div className="validation-success" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '0.5rem',
                      padding: '8px 12px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '6px',
                      color: '#10b981',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      <CheckCircle size={14} />
                      <span>Service name is available and ready to use</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration *</label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleDurationChange}
                    onBlur={handleBlur}
                    className={touched.duration && errors.duration ? 'error' : ''}
                    required
                  >
                    <option value="">Select duration</option>
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.suggestedPrice > 0 && ` (Suggested: ₹${option.suggestedPrice})`}
                      </option>
                    ))}
                  </select>
                  {touched.duration && errors.duration && (
                    <span className="error-message">{errors.duration}</span>
                  )}
                </div>

                {formData.duration === 'custom' && (
                  <div className="form-group">
                    <label htmlFor="customDuration">Custom Duration *</label>
                    <input
                      id="customDuration"
                      name="customDuration"
                      type="text"
                      value={formData.customDuration}
                      onChange={handleCustomDurationChange}
                      onBlur={handleBlur}
                      placeholder="e.g., 45 minutes, 3 hours, 1.5 days, etc."
                      className={touched.customDuration && errors.customDuration ? 'error' : ''}
                      required
                    />
                    {touched.customDuration && errors.customDuration && (
                      <span className="error-message">{errors.customDuration}</span>
                    )}
                    <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                      Enter a custom duration description (e.g., "2.5 hours", "1 day", "30 minutes")
                    </small>
                  </div>
                )}

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows="4"
                    placeholder="Detailed description of the service, what's included, requirements..."
                    className={touched.description && errors.description ? 'error' : ''}
                  />
                  {touched.description && errors.description && (
                    <span className="error-message">{errors.description}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="form-section">
              <h3>Pricing Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="price">Regular Price *</label>
                  <div className="price-input-container">
                    <span className="currency-symbol">₹</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="1"
                      min="0"
                      max="99999"
                      value={formData.price}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="0"
                      className={touched.price && errors.price ? 'error' : ''}
                      required
                    />
                  </div>
                  {touched.price && errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                  <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Base price for this service
                  </small>
                </div>

                <div className="form-group">
                  <label>Offer Settings</label>
                  <div className="offer-toggle-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="offerEnabled"
                        checked={formData.offerEnabled}
                        onChange={handleInputChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-label ${formData.offerEnabled ? 'active' : 'inactive'}`}>
                      {formData.offerEnabled ? 'Enable Offer' : 'Disable Offer'}
                    </span>
                  </div>
                  <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Toggle to enable/disable percentage-based offers
                  </small>
                </div>

                {formData.offerEnabled && (
                  <>
                    <div className="form-group">
                      <label htmlFor="offerPercentage">Offer Percentage *</label>
                      <div className="percentage-input-container">
                        <input
                          id="offerPercentage"
                          name="offerPercentage"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.offerPercentage}
                          onChange={handleOfferPercentageChange}
                          onBlur={handleBlur}
                          placeholder="0"
                          className={touched.offerPercentage && errors.offerPercentage ? 'error' : ''}
                          required
                        />
                        <span className="percentage-symbol">%</span>
                      </div>
                      {touched.offerPercentage && errors.offerPercentage && (
                        <span className="error-message">{errors.offerPercentage}</span>
                      )}
                      <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Discount percentage (0-100%)
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="offerPrice">Calculated Offer Price</label>
                      <div className="price-input-container">
                        <span className="currency-symbol">₹</span>
                        <input
                          id="offerPrice"
                          name="offerPrice"
                          type="number"
                          step="1"
                          min="0"
                          max="99999"
                          value={formData.offerPrice}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="0"
                          className={touched.offerPrice && errors.offerPrice ? 'error' : ''}
                          readOnly
                        />
                      </div>
                      {touched.offerPrice && errors.offerPrice && (
                        <span className="error-message">{errors.offerPrice}</span>
                      )}
                      <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Automatically calculated based on percentage
                      </small>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Visual & Settings */}
            <div className="form-section">
              <h3>Visual & Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="icon">Service Icon</label>
                  <div className="icon-upload-area">
                    {iconPreview ? (
                      <div className="icon-preview">
                        <img src={iconPreview} alt="Service Icon Preview" />
                        <button type="button" className="remove-icon" onClick={removeIcon}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="icon" className="upload-placeholder">
                        <UploadCloud size={24} color="#64748b" />
                        <span>Upload Icon</span>
                        <small>PNG, JPG up to 2MB</small>
                        <input
                          id="icon"
                          name="icon"
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleIconChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Service Status</label>
                  <div className="toggle-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-label ${formData.active ? 'active' : 'inactive'}`}>
                      {formData.active ? 'Active & Available' : 'Inactive'}
                    </span>
                  </div>
                  <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    {formData.active
                      ? 'Service will be visible and bookable by customers'
                      : 'Service will be hidden from customers'
                    }
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <motion.div className="form-actions" variants={itemVariants}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard/admin?tab=services')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !formData.name.trim() || !formData.categoryId}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Service
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </AdminLayout>
  );
};

export default EditServicePage;
