import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, UploadCloud, ArrowLeft } from 'lucide-react';
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
    active: true
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
        
        setFormData({
          categoryId: categoryId,
          name: serviceData.name || '',
          description: serviceData.description || '',
          duration: serviceData.duration || '',
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
