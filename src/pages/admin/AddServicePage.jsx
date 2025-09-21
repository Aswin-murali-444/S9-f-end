import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, UploadCloud, Bell, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import './AdminPages.css';

const AddServicePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    duration: '',
    active: true
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mock notifications data
  const notifications = [
    { id: 1, type: 'security', title: 'Security Alert', message: 'Failed login attempts detected', severity: 'high', timestamp: '2 min ago' },
    { id: 2, type: 'performance', title: 'Performance', message: 'High CPU usage detected', severity: 'medium', timestamp: '5 min ago' },
    { id: 3, type: 'system', title: 'System', message: 'Backup completed successfully', severity: 'low', timestamp: '10 min ago' }
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.getCategories();
        const activeCategories = Array.isArray(data) ? data.filter(cat => cat.active) : [];
        setCategories(activeCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array
        setCategories([]);
      }
    };
    
    fetchCategories();
  }, []);

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
        } else if (/\d/.test(value.trim())) {
          newErrors.name = 'Service name cannot contain numbers';
        } else if (!/^[a-zA-Z\s\-&.,()]+$/.test(value.trim())) {
          newErrors.name = 'Service name can only contain letters, spaces, hyphens, ampersands, commas, periods, and parentheses';
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
        if (value && value.trim().length > 100) {
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
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleIconChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const isImage = /^image\/(png|jpe?g)$/i.test(file.type || '');
    const under2mb = file.size <= 2 * 1024 * 1024;
    if (!isImage || !under2mb) {
      alert('Please select a PNG or JPG up to 2MB.');
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
      duration: true
    };
    setTouched(allTouched);
    
    // Validate all fields
    const isCategoryValid = validateField('categoryId', formData.categoryId);
    const isNameValid = validateField('name', formData.name);
    const isDescriptionValid = validateField('description', formData.description);
    const isDurationValid = validateField('duration', formData.duration);
    
    if (!isCategoryValid || !isNameValid || !isDescriptionValid || !isDurationValid) {
      return; // Don't submit if there are validation errors
    }
    
    setIsSubmitting(true);
    
    try {
      const serviceData = {
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        active: formData.active,
        iconBase64: iconFile ? iconPreview.split(',')[1] : null, // Remove data:image/...;base64, prefix
        iconFileName: iconFile?.name || null,
        iconMimeType: iconFile?.type || null
      };
      
      await apiService.createService(serviceData);
      toast.success('Service created successfully!');
      
      // Navigate back to services tab
      navigate('/dashboard/admin?tab=services');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
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
            <h1>Add Service</h1>
            <p>Create a new service offering for your platform</p>
          </div>
          
        </motion.div>

        {/* Form */}
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
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Plumbing Repair"
                    className={touched.name && errors.name ? 'error' : ''}
                    required
                  />
                  {touched.name && errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <input
                    id="duration"
                    name="duration"
                    type="text"
                    value={formData.duration}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="e.g., 1-2 hours, 30 minutes, Full day, 2-4 hours"
                    className={touched.duration && errors.duration ? 'error' : ''}
                  />
                  {touched.duration && errors.duration && (
                    <span className="error-message">{errors.duration}</span>
                  )}
                </div>

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

            {/* Visual & Settings */}
            <div className="form-section">
              <h3>Visual & Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Service Icon</label>
                  <div className="icon-upload-area">
                    {!iconPreview ? (
                      <label className="upload-placeholder" htmlFor="service-icon-input">
                        <span>Upload Icon</span>
                        <small>PNG, JPG up to 2MB</small>
                      </label>
                    ) : (
                      <div className="icon-preview">
                        <img src={iconPreview} alt="Service icon" />
                        <button type="button" className="remove-icon" onClick={removeIcon}>
                          <X aria-hidden="true" size={14} />
                        </button>
                      </div>
                    )}
                    <input
                      id="service-icon-input"
                      type="file"
                      accept="image/png,image/jpeg"
                      style={{ display: 'none' }}
                      onChange={handleIconChange}
                    />
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
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Service
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </AdminLayout>
  );
};

export default AddServicePage;
