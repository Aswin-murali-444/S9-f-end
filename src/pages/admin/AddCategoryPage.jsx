import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import './AdminPages.css';

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameAvailable, setNameAvailable] = useState(false);
  const [iconError, setIconError] = useState('');

  // Live validate category name (length, characters, uniqueness)
  useEffect(() => {
    const raw = formData.name || '';
    const name = raw.trim();
    setNameAvailable(false);
    // Immediate local validations
    if (!name) {
      setNameError('');
      setCheckingName(false);
      return;
    }
    if (name.length < 3) {
      setNameError('Name must be at least 3 characters');
      setCheckingName(false);
      return;
    }
    // Disallow any digits in category name
    if (/\d/.test(name)) {
      setNameError('Numbers are not allowed in category name');
      setCheckingName(false);
      return;
    }
    // Allow letters, spaces, hyphens, ampersands, and basic punctuation (no numbers)
    const allowed = /^[A-Za-z \-&_()\/.,]+$/;
    if (!allowed.test(name)) {
      setNameError('Only letters, spaces and - & _ ( ) / . , allowed');
      setCheckingName(false);
      return;
    }

    let isCancelled = false;
    setCheckingName(true);
    setNameError('');
    const timer = setTimeout(async () => {
      try {
        // Check uniqueness against existing categories
        const list = await apiService.getCategories();
        const exists = Array.isArray(list) && list.some((c) => String(c?.name || '').trim().toLowerCase() === name.toLowerCase());
        if (isCancelled) return;
        if (exists) {
          setNameError('A category with this name already exists');
          setNameAvailable(false);
        } else {
          setNameError('');
          setNameAvailable(true);
        }
      } catch (e) {
        if (!isCancelled) {
          setNameError('Unable to validate name right now');
          setNameAvailable(false);
        }
      } finally {
        if (!isCancelled) setCheckingName(false);
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formData.name]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate type & size (<= 2MB)
      if (!file.type?.startsWith('image/')) {
        setIconError('Invalid file type. Please upload an image.');
        toast.error('Invalid file type. Please upload an image.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setIconError('File too large. Max size is 2MB.');
        toast.error('File too large. Max size is 2MB.');
        return;
      }
      setIconError('');
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
      }
      const url = URL.createObjectURL(file);
      setIconPreview(url);
      setIconFile(file);
    }
  };

  const removeIcon = () => {
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconPreview(null);
    setIconFile(null);
    // Reset file input
    const fileInput = document.getElementById('icon-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (checkingName) {
      toast.error('Please wait for name check to complete');
      return;
    }
    if (nameError) {
      toast.error(nameError);
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Optional visual settings
      const iconUrl = null; // File upload not implemented yet; pass null
      const settings = null; // Additional settings optional
      const created = await apiService.createCategory({
        name: formData.name?.trim(),
        description: formData.description || null,
        // Derive boolean active from selected status for compatibility
        active: String(formData.status).toLowerCase() === 'active',
        status: String(formData.status).toLowerCase(),
        iconUrl,
        settings
      });
      toast.success(`Category "${created?.name || formData.name}" created`);
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      const msg = (error && error.message) ? error.message : 'Failed to create category';
      toast.error(msg);
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
            <h1>Add Service Category</h1>
            <p>Create a new service category for your platform</p>
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
                  <label htmlFor="name">Category Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Home Maintenance"
                    required
                  />
                  {checkingName && (
                    <small style={{ color: '#64748b' }}>Checking availability…</small>
                  )}
                  {!checkingName && nameError && (
                    <small style={{ color: '#ef4444', fontWeight: 600 }}>{nameError}</small>
                  )}
                  {!checkingName && !nameError && formData.name.trim() && (
                    <small style={{ color: '#10b981' }}>Name looks good</small>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Detailed description of this service category..."
                  />
                </div>
              </div>
            </div>

            {/* Visual & Settings */}
            <div className="form-section">
              <h3>Visual & Settings</h3>
              <div className="form-grid">
                {/* Icon Upload */}
                <div className="form-group">
                  <label>Category Icon</label>
                  <div className="icon-upload-area">
                    {iconPreview ? (
                      <div className="icon-preview">
                        <img src={iconPreview} alt="Category icon" />
                        <button
                          type="button"
                          className="remove-icon"
                          onClick={removeIcon}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="icon-upload" className="upload-placeholder">
                        <Upload size={24} />
                        <span>Upload Icon</span>
                        <small>PNG, JPG up to 2MB</small>
                      </label>
                    )}
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      hidden
                    />
                  </div>
                  {iconError && (
                    <small style={{ color: '#ef4444', fontWeight: 600 }}>{iconError}</small>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
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
              disabled={isSubmitting || checkingName || !!nameError || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Category
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </AdminLayout>
  );
};

export default AddCategoryPage;
