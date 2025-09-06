import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Users, Settings, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import './AdminPages.css';

const AssignProviderPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceId: '',
    providerId: '',
    priority: 'medium',
    notes: ''
  });
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setServices([
      { id: 1, name: 'Plumbing Repair', category: 'Home Maintenance', active: true },
      { id: 2, name: 'Electrical Work', category: 'Home Maintenance', active: true },
      { id: 3, name: 'Elder Care', category: 'Healthcare', active: true },
      { id: 4, name: 'Airport Transfer', category: 'Transport', active: true },
      { id: 5, name: 'Medicine Delivery', category: 'Delivery', active: true }
    ]);
    
    setProviders([
      { 
        id: 201, 
        name: 'QuickFix Co.', 
        specialization: 'Electrical', 
        rating: 4.8,
        available: true,
        completedJobs: 156,
        responseTime: '15 min avg'
      },
      { 
        id: 202, 
        name: 'SafeRide', 
        specialization: 'Transport', 
        rating: 4.6,
        available: true,
        completedJobs: 89,
        responseTime: '8 min avg'
      },
      { 
        id: 203, 
        name: 'CareFirst', 
        specialization: 'Elder Care', 
        rating: 4.9,
        available: true,
        completedJobs: 234,
        responseTime: '20 min avg'
      },
      { 
        id: 204, 
        name: 'Alpha Services', 
        specialization: 'Plumbing', 
        rating: 4.7,
        available: false,
        completedJobs: 78,
        responseTime: '12 min avg'
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrioritySelect = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Assignment data:', formData);
      
      // Navigate back to allocation tab
      navigate('/dashboard/admin?tab=allocation');
    } catch (error) {
      console.error('Error assigning provider:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
  const selectedProvider = providers.find(p => p.id === parseInt(formData.providerId));

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
            <h1>Assign Provider</h1>
            <p>Assign a service provider to handle specific services</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form 
          className="admin-form"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="form-sections">
            {/* Service Selection */}
            <div className="form-section">
              <h3>Service Selection</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="serviceId">Select Service *</label>
                  <select
                    id="serviceId"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose a service</option>
                    {services.filter(s => s.active).map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedService && (
                  <div className="form-group">
                    <label>Service Details</label>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        {selectedService.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Category: {selectedService.category}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Provider Selection */}
            <div className="form-section">
              <h3>Provider Selection</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="providerId">Select Provider *</label>
                  <select
                    id="providerId"
                    name="providerId"
                    value={formData.providerId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose a provider</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id} disabled={!provider.available}>
                        {provider.name} - {provider.specialization} 
                        {!provider.available && ' (Unavailable)'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProvider && (
                  <div className="form-group full-width">
                    <label>Provider Details</label>
                    <div style={{ 
                      padding: '1.5rem', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '1rem' 
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                            {selectedProvider.name}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {selectedProvider.specialization}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            Rating
                          </div>
                          <div style={{ fontWeight: '600' }}>
                            ⭐ {selectedProvider.rating}/5.0
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            Completed Jobs
                          </div>
                          <div style={{ fontWeight: '600' }}>
                            {selectedProvider.completedJobs}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            Response Time
                          </div>
                          <div style={{ fontWeight: '600' }}>
                            {selectedProvider.responseTime}
                          </div>
                        </div>
                      </div>
                      
                      {!selectedProvider.available && (
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.75rem',
                          background: '#fef3c7',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#92400e'
                        }}>
                          <AlertCircle size={16} />
                          <span style={{ fontSize: '0.9rem' }}>
                            This provider is currently unavailable
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority & Notes */}
            <div className="form-section">
              <h3>Assignment Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Priority Level *</label>
                  <div className="priority-grid">
                    {['high', 'medium', 'low'].map(priority => (
                      <div
                        key={priority}
                        className={`priority-option ${priority} ${formData.priority === priority ? 'selected' : ''}`}
                        onClick={() => handlePrioritySelect(priority)}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </div>
                    ))}
                  </div>
                  <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    {formData.priority === 'high' && 'Urgent - Provider will be notified immediately'}
                    {formData.priority === 'medium' && 'Normal - Standard notification process'}
                    {formData.priority === 'low' && 'Low - Provider will be notified in next batch'}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Special instructions, requirements, or additional information for the provider..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <motion.div className="form-actions" variants={itemVariants}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard/admin?tab=allocation')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !formData.serviceId || !formData.providerId || (selectedProvider && !selectedProvider.available)}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Assign Provider
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </AdminLayout>
  );
};

export default AssignProviderPage;
