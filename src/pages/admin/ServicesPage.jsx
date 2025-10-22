import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Ban, RotateCcw, Save, X, Search, Filter, Users, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import { formatServicePricing } from '../../utils/pricingUtils';
import './AdminPages.css';

// NOTE: Backend services endpoints are assumed; if missing, wire later

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await apiService.getServices();
      const list = Array.isArray(data) ? data : [];
      setServices(list);
    } catch (e) {
      toast.error('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Auto-refresh when page becomes visible (useful when data is updated in another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchServices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Refresh when returning to this page (useful after editing)
  useEffect(() => {
    const handleFocus = () => {
      fetchServices();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Filter and sort services
  useEffect(() => {
    let filtered = [...services];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.category_name && service.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Service type filter
    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(service => service.service_type === serviceTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => {
        if (statusFilter === 'active') return service.active === true;
        if (statusFilter === 'inactive') return service.active === false;
        return true;
      });
    }

    // Sort services
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.service_type || 'individual';
          bValue = b.service_type || 'individual';
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredServices(filtered);
  }, [services, searchQuery, serviceTypeFilter, statusFilter, sortBy, sortOrder]);

  const openEdit = (svc) => {
    navigate(`/admin/services/${encodeURIComponent(svc.id)}`);
  };

  const toggleSuspend = async (svc) => {
    // If we're in delete confirmation for this row, ignore suspend clicks
    if (confirmingId === svc.id) return;
    try {
      const isSuspended = svc.active === false;
      
      if (isSuspended) {
        await apiService.unblockService(svc.id);
        toast.success('Service activated successfully');
      } else {
        await apiService.blockService(svc.id);
        toast.success('Service suspended successfully');
      }
      
      // Refresh services data to update statistics
      await fetchServices();
    } catch (e) {
      toast.error(e?.message || 'Action failed');
    }
  };

  const doDelete = async (svc) => {
    try {
      await apiService.deleteService(svc.id);
      toast.success('Service deleted successfully');
      setServices(prev => prev.filter(s => s.id !== svc.id));
      setConfirmingId(null);
    } catch (e) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  // Add refresh function for manual refresh
  const refreshServices = async () => {
    setIsRefreshing(true);
    try {
      await fetchServices();
      toast.success('Services refreshed');
    } catch (error) {
      toast.error('Failed to refresh services');
    } finally {
      setIsRefreshing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  const statusBadge = (svc) => {
    if (svc.active === true) return 'status-badge active';
    if (svc.active === false) return 'status-badge warning';
    return 'status-badge inactive';
  };

  // Get service statistics
  const getServiceStats = () => {
    const total = services.length;
    // Fix: Count services that are individual OR don't have service_type set (default to individual)
    const individual = services.filter(s => s.service_type === 'individual' || !s.service_type).length;
    const group = services.filter(s => s.service_type === 'group').length;
    const active = services.filter(s => s.active === true).length;
    const inactive = services.filter(s => s.active === false).length;
    
    return { total, individual, group, active, inactive };
  };

  const stats = getServiceStats();

  const formatPricing = (svc) => {
    const pricing = formatServicePricing(svc);
    
    if (!pricing.originalPrice) return '—';
    
    if (pricing.hasOffer) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '600', color: '#059669' }}>₹{pricing.offerPrice}</span>
            <span style={{ textDecoration: 'line-through', color: '#6b7280', fontSize: '0.875rem' }}>₹{pricing.originalPrice}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
            {pricing.discountPercentage}% OFF
          </div>
        </div>
      );
    }
    
    return <span style={{ fontWeight: '600' }}>₹{pricing.originalPrice}</span>;
  };

  return (
    <AdminLayout>
      <motion.div className="admin-page-content" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="page-header" variants={itemVariants}>
          <div className="page-title">
            <h1>Manage Services</h1>
            <p>Create, edit, delete, and suspend services</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="btn-secondary" 
              onClick={refreshServices}
              disabled={isRefreshing}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                opacity: isRefreshing ? 0.7 : 1
              }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="btn-primary" onClick={() => navigate('/admin/add-service')}>Add Service</button>
          </div>
        </motion.div>

        {/* Service Statistics */}
        <motion.div className="stats-grid" variants={itemVariants} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.total}</h3>
            <p style={{ margin: 0, opacity: 1, color: 'white', fontWeight: '500' }}>Total Services</p>
          </div>
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.individual}</h3>
            <p style={{ margin: 0, opacity: 1, color: 'white', fontWeight: '500' }}>Individual Services</p>
          </div>
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.group}</h3>
            <p style={{ margin: 0, opacity: 1, color: 'white', fontWeight: '500' }}>Group Services</p>
          </div>
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.active}</h3>
            <p style={{ margin: 0, opacity: 1, color: 'white', fontWeight: '500' }}>Active Services</p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div className="filters-section" variants={itemVariants} style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              />
            </div>

            {/* Service Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#64748b' }} />
              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: '#64748b' }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
                <option value="price">Sort by Price</option>
                <option value="created">Sort by Created</option>
                <option value="updated">Sort by Updated</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Clear Filters */}
            {(searchQuery || serviceTypeFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setServiceTypeFilter('all');
                  setStatusFilter('all');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div style={{ marginTop: '1rem', fontSize: '14px', color: '#64748b' }}>
            Showing {filteredServices.length} of {services.length} services
            {searchQuery && ` matching "${searchQuery}"`}
            {serviceTypeFilter !== 'all' && ` • Type: ${serviceTypeFilter}`}
            {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
          </div>
        </motion.div>

        <motion.div className="admin-form" variants={itemVariants}>
          {loading ? (
            <div style={{ padding: '1rem' }}>Loading…</div>
          ) : (
            <div className="list-table services-table">
              <div className="table-header">
                <div className="header-cell">Service</div>
                <div className="header-cell">Category</div>
                <div className="header-cell">Type</div>
                <div className="header-cell">Duration</div>
                <div className="header-cell">Pricing</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Updated</div>
                <div className="header-cell">Actions</div>
              </div>
              <div className="table-body">
                {filteredServices.length === 0 && (
                  <div className="table-row">
                    <div className="table-cell" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                      {services.length === 0 ? 'No services found' : 'No services match your filters'}
                    </div>
                  </div>
                )}
                {filteredServices.map(svc => (
                  <div key={svc.id} className="table-row">
                    <div className="table-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {svc.icon_url ? (
                          <img
                            src={svc.icon_url}
                            alt=""
                            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : null}
                        <span style={{ fontWeight: 600 }}>{svc.name}</span>
                      </div>
                    </div>
                    <div className="table-cell">{svc.category_name || svc.category || '—'}</div>
                    <div className="table-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {svc.service_type === 'group' ? (
                          <Users size={16} style={{ color: '#1e40af' }} />
                        ) : (
                          <User size={16} style={{ color: '#166534' }} />
                        )}
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          backgroundColor: svc.service_type === 'group' ? '#dbeafe' : '#f0fdf4',
                          color: svc.service_type === 'group' ? '#1e40af' : '#166534'
                        }}>
                          {svc.service_type === 'group' ? 'Group' : 'Individual'}
                        </span>
                      </div>
                    </div>
                    <div className="table-cell">{svc.duration || '—'}</div>
                    <div className="table-cell">{formatPricing(svc)}</div>
                    <div className="table-cell"><span className={statusBadge(svc)}>{svc.active ? 'Active' : 'Suspended'}</span></div>
                    <div className="table-cell">{svc.updated_at ? new Date(svc.updated_at).toLocaleString() : '—'}</div>
                    <div className="table-cell actions">
                      {confirmingId === svc.id ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#64748b' }}>Confirm delete?</span>
                          <button className="btn-secondary" title="Cancel" onClick={() => setConfirmingId(null)}>Cancel</button>
                          <button className="btn-danger" title={`Delete ${svc.name}`} onClick={() => doDelete(svc)}>Delete</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn-icon" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(svc); }}><Edit size={16} /></button>
                          <button className="btn-icon danger" title="Delete" onClick={(e) => { e.stopPropagation(); setConfirmingId(svc.id); }}><Trash2 size={16} /></button>
                          {svc.active === false ? (
                            <button className="btn-icon success" title="Activate" onClick={(e) => { e.stopPropagation(); toggleSuspend(svc); }}><RotateCcw size={16} /></button>
                          ) : (
                            <button className="btn-icon warning" title="Suspend" onClick={(e) => { e.stopPropagation(); toggleSuspend(svc); }}><Ban size={16} /></button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default ServicesPage;


