import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Ban, RotateCcw, Save, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

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

  const openEdit = (svc) => {
    navigate(`/admin/services/${encodeURIComponent(svc.id)}`);
  };

  const toggleSuspend = async (svc) => {
    try {
      const isSuspended = svc.active === false;
      
      if (isSuspended) {
        await apiService.unblockService(svc.id);
        toast.success('Service activated successfully');
      } else {
        await apiService.blockService(svc.id);
        toast.success('Service suspended successfully');
      }
      
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
          <div>
            <button className="btn-secondary" onClick={() => navigate('/admin/add-service')}>Add Service</button>
          </div>
        </motion.div>

        <motion.div className="admin-form" variants={itemVariants}>
          {loading ? (
            <div style={{ padding: '1rem' }}>Loading…</div>
          ) : (
            <div className="list-table">
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
                {services.length === 0 && (
                  <div className="table-row"><div className="table-cell" style={{ gridColumn: '1 / -1' }}>No services</div></div>
                )}
                {services.map(svc => (
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
                          <button className="btn-icon" title="Edit" onClick={() => openEdit(svc)}><Edit size={16} /></button>
                          <button className="btn-icon danger" title="Delete" onClick={() => setConfirmingId(svc.id)}><Trash2 size={16} /></button>
                          {svc.active === false ? (
                            <button className="btn-icon success" title="Activate" onClick={() => toggleSuspend(svc)}><RotateCcw size={16} /></button>
                          ) : (
                            <button className="btn-icon warning" title="Suspend" onClick={() => toggleSuspend(svc)}><Ban size={16} /></button>
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


