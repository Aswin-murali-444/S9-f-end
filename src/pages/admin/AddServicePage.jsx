import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Clock, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import './AdminPages.css';

const AddServicePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    basePrice: '',
    duration: '60m',
    customDuration: '',
    pricingModel: 'fixed',
    active: true,
    assignedProviders: []
  });
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setCategories([
      { id: 1, name: 'Home Maintenance', active: true },
      { id: 2, name: 'Elder Care', active: true },
      { id: 3, name: 'Transport', active: true },
      { id: 4, name: 'Delivery', active: true }
    ]);
    
    setProviders([
      { id: 201, name: 'QuickFix Co.', specialization: 'Electrical', available: true },
      { id: 202, name: 'SafeRide', specialization: 'Transport', available: true },
      { id: 203, name: 'CareFirst', specialization: 'Elder Care', available: true },
      { id: 204, name: 'Alpha Services', specialization: 'Plumbing', available: true }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProviderToggle = (providerId) => {
    setFormData(prev => ({
      ...prev,
      assignedProviders: prev.assignedProviders.includes(providerId)
        ? prev.assignedProviders.filter(id => id !== providerId)
        : [...prev.assignedProviders, providerId]
    }));
  };

  const handleDurationSelect = (duration) => {
    setFormData(prev => ({
      ...prev,
      duration,
      customDuration: duration === 'custom' ? prev.customDuration : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const serviceData = {
        ...formData,
        duration: formData.duration === 'custom' ? formData.customDuration : formData.duration
      };
      
      console.log('Service data:', serviceData);
      
      // Navigate back to services tab
      navigate('/dashboard/admin?tab=services');
    } catch (error) {
      console.error('Error creating service:', error);
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
                    required
                  >
                    <option value="">Choose a category</option>
                    {categories.filter(cat => cat.active).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Service Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Plumbing Repair"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Detailed description of the service, what's included, requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Duration */}
            <div className="form-section">
              <h3>Pricing & Duration</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="pricingModel">Pricing Model *</label>
                  <select
                    id="pricingModel"
                    name="pricingModel"
                    value={formData.pricingModel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="per_km">Per Kilometer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="basePrice">
                    Base Price / Rate *
                    <span style={{ color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                      ({formData.pricingModel === 'hourly' ? 'per hour' : 
                        formData.pricingModel === 'per_km' ? 'per km' : 'fixed'})
                    </span>
                  </label>
                  <div className="price-input-group">
                    <input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Estimated Duration</label>
                  <div className="duration-grid">
                    {['30m', '60m', '120m', 'custom'].map(duration => (
                      <div
                        key={duration}
                        className={`duration-option ${formData.duration === duration ? 'selected' : ''}`}
                        onClick={() => handleDurationSelect(duration)}
                      >
                        <Clock size={16} />
                        {duration === '30m' && '30 min'}
                        {duration === '60m' && '1 hour'}
                        {duration === '120m' && '2 hours'}
                        {duration === 'custom' && 'Custom'}
                      </div>
                    ))}
                  </div>
                  {formData.duration === 'custom' && (
                    <input
                      type="text"
                      name="customDuration"
                      value={formData.customDuration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3-4 hours, Half day, etc."
                      style={{ marginTop: '1rem' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Provider Assignment */}
            <div className="form-section">
              <h3>Provider Assignment</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Assigned Providers</label>
                  <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {providers.filter(p => p.available).map(provider => (
                      <div key={provider.id} className="checkbox-group">
                        <input
                          type="checkbox"
                          id={`provider-${provider.id}`}
                          checked={formData.assignedProviders.includes(provider.id)}
                          onChange={() => handleProviderToggle(provider.id)}
                        />
                        <label htmlFor={`provider-${provider.id}`} style={{ margin: 0, cursor: 'pointer' }}>
                          <strong>{provider.name}</strong>
                          <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                            ({provider.specialization})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="form-section">
              <h3>Status & Visibility</h3>
              <div className="form-grid">
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
              disabled={isSubmitting || !formData.name.trim() || !formData.categoryId || !formData.basePrice}
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
