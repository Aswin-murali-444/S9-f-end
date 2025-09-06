import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Phone, MapPin, Key, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import './AdminPages.css';

const AddUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    department: '',
    autoPassword: true,
    manualPassword: '',
    active: true,
    assignedServices: []
  });
  const [services, setServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setServices([
      { id: 1, name: 'Plumbing Repair', category: 'Home Maintenance' },
      { id: 2, name: 'Electrical Work', category: 'Home Maintenance' },
      { id: 3, name: 'Elder Care', category: 'Healthcare' },
      { id: 4, name: 'Airport Transfer', category: 'Transport' },
      { id: 5, name: 'Medicine Delivery', category: 'Delivery' }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      assignedServices: prev.assignedServices.includes(serviceId)
        ? prev.assignedServices.filter(id => id !== serviceId)
        : [...prev.assignedServices, serviceId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        ...formData,
        password: formData.autoPassword ? 'AUTO_GENERATED' : formData.manualPassword
      };
      
      console.log('User data:', userData);
      
      // Navigate back to users tab
      navigate('/dashboard/admin?tab=users');
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: 'customer', label: 'Customer', description: 'End user who books services' },
    { value: 'service_provider', label: 'Service Provider', description: 'Provides services to customers' },
    { value: 'driver', label: 'Driver', description: 'Handles delivery and transport services' },
    { value: 'supervisor', label: 'Supervisor', description: 'Manages operations and staff' },
    { value: 'admin', label: 'Admin', description: 'Full system access and management' }
  ];

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

  const isServiceProvider = formData.role === 'service_provider';

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
            <h1>Add User</h1>
            <p>Create a new user account with role-based permissions</p>
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
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="form-section">
              <h3>Role & Department</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {formData.role && (
                    <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                      {roles.find(r => r.value === formData.role)?.description}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Operations, IT, Customer Service, etc."
                  />
                </div>
              </div>
            </div>

            {/* Password Settings */}
            <div className="form-section">
              <h3>Password Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Password Generation</label>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="autoPassword"
                      name="autoPassword"
                      checked={formData.autoPassword}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="autoPassword" style={{ margin: 0, cursor: 'pointer' }}>
                      Auto-generate secure password
                    </label>
                  </div>
                  <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    {formData.autoPassword 
                      ? 'A secure password will be generated and sent to the user via email'
                      : 'You will set a manual password for this user'
                    }
                  </small>
                </div>

                {!formData.autoPassword && (
                  <div className="form-group">
                    <label htmlFor="manualPassword">Manual Password *</label>
                    <input
                      id="manualPassword"
                      name="manualPassword"
                      type="password"
                      value={formData.manualPassword}
                      onChange={handleInputChange}
                      placeholder="Enter secure password"
                      required={!formData.autoPassword}
                      minLength="8"
                    />
                    <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                      Minimum 8 characters, include letters, numbers, and symbols
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Service Provider Settings */}
            {isServiceProvider && (
              <div className="form-section">
                <h3>Service Provider Settings</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Assigned Services</label>
                    <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
                      {services.map(service => (
                        <div key={service.id} className="checkbox-group">
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={formData.assignedServices.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                          />
                          <label htmlFor={`service-${service.id}`} style={{ margin: 0, cursor: 'pointer' }}>
                            <strong>{service.name}</strong>
                            <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                              ({service.category})
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                      Select which services this provider can offer
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="form-section">
              <h3>Account Status</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Account Status</label>
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
                      {formData.active ? 'Active Account' : 'Inactive Account'}
                    </span>
                  </div>
                  <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    {formData.active 
                      ? 'User can log in and access the platform'
                      : 'User account will be suspended'
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
              onClick={() => navigate('/dashboard/admin?tab=users')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !formData.fullName.trim() || !formData.email.trim() || !formData.role}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create User
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </AdminLayout>
  );
};

export default AddUserPage;
