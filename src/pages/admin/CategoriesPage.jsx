import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Ban, RotateCcw, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import { supabase } from '../../hooks/useAuth';
import './AdminPages.css';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null); // legacy modal state (no longer used)
  const [editData, setEditData] = useState({ name: '', description: '', status: 'active' });
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCategories();
      const raw = Array.isArray(data) ? data : [];
      // Resolve icon_url storage paths to public/signed URLs
      const resolved = await Promise.all(raw.map(async (cat) => {
        try {
          let icon = cat.icon_url || '';
          if (icon && !/^https?:\/\//i.test(icon)) {
            const match = String(icon).match(/^([^\/]+)\/(.+)$/);
            if (match) {
              const bucket = match[1];
              const key = match[2];
              try {
                const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
                if (pub?.publicUrl) icon = pub.publicUrl;
              } catch (_) {}
              if (!/^https?:\/\//i.test(icon)) {
                try {
                  const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(key, 3600);
                  if (signed?.signedUrl) icon = signed.signedUrl;
                } catch (_) {}
              }
            }
          }
          return { ...cat, icon_resolved: icon };
        } catch (_) {
          return { ...cat, icon_resolved: '' };
        }
      }));
      setCategories(resolved);
    } catch (e) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openEdit = (cat) => {
    navigate(`/admin/categories/${encodeURIComponent(cat.id)}`);
  };

  const closeModal = () => {};

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!selected) return;
    if (!editData.name || !editData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      await apiService.updateCategory(selected.id, {
        name: editData.name.trim(),
        description: editData.description || null,
        status: String(editData.status).toLowerCase(),
        active: String(editData.status).toLowerCase() === 'active'
      });
      toast.success('Category updated');
      await fetchCategories();
      closeModal();
    } catch (e) {
      toast.error(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async (cat) => {
    try {
      await apiService.deleteCategory(cat.id);
      toast.success('Category deleted');
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      setConfirmingId(null);
    } catch (e) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  const toggleSuspend = async (cat) => {
    try {
      if (String(cat.status).toLowerCase() === 'suspended' || cat.active === false) {
        await apiService.unblockCategory(cat.id);
        toast.success('Category activated');
      } else {
        await apiService.blockCategory(cat.id);
        toast.success('Category suspended');
      }
      await fetchCategories();
    } catch (e) {
      toast.error(e?.message || 'Action failed');
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

  const statusColor = (s, active) => {
    const val = (s || (active ? 'active' : 'inactive')).toLowerCase();
    if (val === 'active') return 'status-badge active';
    if (val === 'suspended') return 'status-badge warning';
    return 'status-badge inactive';
  };

  return (
    <AdminLayout>
      <motion.div className="admin-page-content" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="page-header" variants={itemVariants}>
          <div className="page-title">
            <h1>Manage Categories</h1>
            <p>View, edit, delete, and suspend categories</p>
          </div>
          <div>
            <button className="btn-secondary" onClick={() => navigate('/admin/add-category')}>Add Category</button>
          </div>
        </motion.div>

        <motion.div className="admin-form" variants={itemVariants}>
          {loading ? (
            <div style={{ padding: '1rem' }}>Loading…</div>
          ) : (
            <div className="list-table">
              <div className="table-header">
                <div className="header-cell">Name</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Updated</div>
                <div className="header-cell">Actions</div>
              </div>
              <div className="table-body">
                {categories.length === 0 && (
                  <div className="table-row"><div className="table-cell" style={{ gridColumn: '1 / -1' }}>No categories</div></div>
                )}
                {categories.map(cat => (
                  <div key={cat.id} className="table-row">
                    <div className="table-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {cat.icon_resolved ? (
                          <img
                            src={cat.icon_resolved}
                            alt=""
                            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : null}
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </div>
                    </div>
                    <div className="table-cell"><span className={statusColor(cat.status, cat.active)}>{(cat.status || (cat.active ? 'active' : 'inactive')).toString()}</span></div>
                    <div className="table-cell">{cat.updated_at ? new Date(cat.updated_at).toLocaleString() : '—'}</div>
                    <div className="table-cell actions">
                      {confirmingId === cat.id ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#64748b' }}>Confirm delete?</span>
                          <button
                            className="btn-secondary"
                            title="Cancel"
                            onClick={() => setConfirmingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-danger"
                            title={`Delete ${cat.name}`}
                            onClick={() => doDelete(cat)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <>
                          <button className="btn-icon" title="Edit" onClick={() => openEdit(cat)}><Edit size={16} /></button>
                          <button
                            className="btn-icon danger"
                            title="Delete"
                            onClick={() => setConfirmingId(cat.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                          {String(cat.status).toLowerCase() === 'suspended' || cat.active === false ? (
                            <button className="btn-icon success" title="Activate" onClick={() => toggleSuspend(cat)}><RotateCcw size={16} /></button>
                          ) : (
                            <button className="btn-icon warning" title="Suspend" onClick={() => toggleSuspend(cat)}><Ban size={16} /></button>
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

        {/* Modal removed; editing navigates to dedicated page */}
      </motion.div>
    </AdminLayout>
  );
};

export default CategoriesPage;


