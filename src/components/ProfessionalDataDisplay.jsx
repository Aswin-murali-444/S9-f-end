import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Settings, Clock, DollarSign, Eye, Edit, Trash2, Ban, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import { formatServicePricing } from '../utils/pricingUtils';
import './ProfessionalDataDisplay.css';

const ProfessionalDataDisplay = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmingType, setConfirmingType] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, servicesData] = await Promise.all([
        apiService.getCategories(),
        apiService.getServices()
      ]);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, type) => {
    try {
      if (type === 'category') {
        await apiService.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Category deleted successfully');
      } else {
        await apiService.deleteService(id);
        setServices(prev => prev.filter(s => s.id !== id));
        toast.success('Service deleted successfully');
      }
      setConfirmingId(null);
      setConfirmingType(null);
    } catch (error) {
      toast.error(error?.message || 'Delete failed');
    }
  };

  const handleToggleStatus = async (id, type, currentStatus) => {
    try {
      if (type === 'category') {
        if (currentStatus === 'suspended' || currentStatus === false) {
          await apiService.unblockCategory(id);
          toast.success('Category activated');
        } else {
          await apiService.blockCategory(id);
          toast.success('Category suspended');
        }
      } else {
        if (currentStatus === false) {
          await apiService.unblockService(id);
          toast.success('Service activated');
        } else {
          await apiService.blockService(id);
          toast.success('Service suspended');
        }
      }
      await fetchData();
    } catch (error) {
      toast.error(error?.message || 'Action failed');
    }
  };

  const getStatusColor = (status, active) => {
    const val = status || (active ? 'active' : 'inactive');
    if (val === 'active' || val === true) return 'status-active';
    if (val === 'suspended' || val === false) return 'status-suspended';
    return 'status-inactive';
  };

  const formatPricing = (service) => {
    const pricing = formatServicePricing(service);
    
    if (!pricing.originalPrice) return '—';
    
    if (pricing.hasOffer) {
      return (
        <div className="pricing-container">
          <div className="pricing-row">
            <span className="offer-price">₹{pricing.offerPrice}</span>
            <span className="original-price">₹{pricing.originalPrice}</span>
          </div>
          <div className="discount-badge">
            {pricing.discountPercentage}% OFF
          </div>
        </div>
      );
    }
    
    return <span className="regular-price">₹{pricing.originalPrice}</span>;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="professional-display">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="professional-display"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="display-header" variants={itemVariants}>
        <div className="header-content">
          <div className="title-section">
            <h1>Service Management Dashboard</h1>
            <p>Comprehensive view of categories and services</p>
          </div>
          <div className="stats-section">
            <div className="stat-card">
              <Package className="stat-icon" />
              <div>
                <span className="stat-number">{categories.length}</span>
                <span className="stat-label">Categories</span>
              </div>
            </div>
            <div className="stat-card">
              <Settings className="stat-icon" />
              <div>
                <span className="stat-number">{services.length}</span>
                <span className="stat-label">Services</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="tab-navigation" variants={itemVariants}>
        <button 
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Package size={20} />
          Categories ({categories.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Settings size={20} />
          Services ({services.length})
        </button>
      </motion.div>

      <motion.div className="data-section" variants={itemVariants}>
        {activeTab === 'categories' && (
          <div className="data-table">
            <div className="table-header">
              <div className="header-cell">Category</div>
              <div className="header-cell">Description</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Updated</div>
              <div className="header-cell">Actions</div>
            </div>
            <div className="table-body">
              {categories.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <h3>No Categories Found</h3>
                  <p>No categories have been created yet.</p>
                </div>
              ) : (
                categories.map(category => (
                  <div key={category.id} className="table-row">
                    <div className="table-cell">
                      <div className="cell-content">
                        {category.icon_url && (
                          <img 
                            src={category.icon_url} 
                            alt={category.name}
                            className="category-icon"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="text-content">
                          <span className="primary-text">{category.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="description-text">
                        {category.description || 'No description'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${getStatusColor(category.status, category.active)}`}>
                        {category.status || (category.active ? 'Active' : 'Inactive')}
                      </span>
                    </div>
                    <div className="table-cell">
                      <span className="date-text">
                        {category.updated_at ? new Date(category.updated_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        {confirmingId === category.id && confirmingType === 'category' ? (
                          <div className="confirmation-buttons">
                            <span className="confirm-text">Delete?</span>
                            <button 
                              className="btn-cancel"
                              onClick={() => {
                                setConfirmingId(null);
                                setConfirmingType(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDelete(category.id, 'category')}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              className="action-btn view"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="action-btn edit"
                              title="Edit Category"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-btn delete"
                              title="Delete Category"
                              onClick={() => {
                                setConfirmingId(category.id);
                                setConfirmingType('category');
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button 
                              className={`action-btn ${category.active ? 'suspend' : 'activate'}`}
                              title={category.active ? 'Suspend' : 'Activate'}
                              onClick={() => handleToggleStatus(category.id, 'category', category.status)}
                            >
                              {category.active ? <Ban size={16} /> : <RotateCcw size={16} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="data-table">
            <div className="table-header">
              <div className="header-cell">Service</div>
              <div className="header-cell">Category</div>
              <div className="header-cell">Duration</div>
              <div className="header-cell">Pricing</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Updated</div>
              <div className="header-cell">Actions</div>
            </div>
            <div className="table-body">
              {services.length === 0 ? (
                <div className="empty-state">
                  <Settings size={48} />
                  <h3>No Services Found</h3>
                  <p>No services have been created yet.</p>
                </div>
              ) : (
                services.map(service => (
                  <div key={service.id} className="table-row">
                    <div className="table-cell">
                      <div className="cell-content">
                        {service.icon_url && (
                          <img 
                            src={service.icon_url} 
                            alt={service.name}
                            className="service-icon"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="text-content">
                          <span className="primary-text">{service.name}</span>
                          {service.description && (
                            <span className="secondary-text">{service.description}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="category-text">
                        {service.category_name || 'Uncategorized'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="duration-content">
                        <Clock size={14} />
                        <span>{service.duration || '—'}</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      {formatPricing(service)}
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${getStatusColor(service.active)}`}>
                        {service.active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <span className="date-text">
                        {service.updated_at ? new Date(service.updated_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        {confirmingId === service.id && confirmingType === 'service' ? (
                          <div className="confirmation-buttons">
                            <span className="confirm-text">Delete?</span>
                            <button 
                              className="btn-cancel"
                              onClick={() => {
                                setConfirmingId(null);
                                setConfirmingType(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDelete(service.id, 'service')}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              className="action-btn view"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="action-btn edit"
                              title="Edit Service"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-btn delete"
                              title="Delete Service"
                              onClick={() => {
                                setConfirmingId(service.id);
                                setConfirmingType('service');
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button 
                              className={`action-btn ${service.active ? 'suspend' : 'activate'}`}
                              title={service.active ? 'Suspend' : 'Activate'}
                              onClick={() => handleToggleStatus(service.id, 'service', service.active)}
                            >
                              {service.active ? <Ban size={16} /> : <RotateCcw size={16} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProfessionalDataDisplay;
