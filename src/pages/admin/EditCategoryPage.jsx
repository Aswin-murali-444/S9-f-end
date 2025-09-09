import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, Trash2, Ban, RotateCcw, ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import './AdminPages.css';

const EditCategoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [category, setCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiService.getCategory(id);
        setCategory(data);
        setName(data?.name || '');
        setDescription(data?.description || '');
        setStatus((data?.status || (data?.active ? 'active' : 'inactive')));
      } catch (e) {
        toast.error('Failed to load category');
        navigate('/admin/categories');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const validateName = (value) => {
    const v = (value || '').trim();
    if (!v) return 'Name is required';
    if (v.length < 3) return 'Name must be at least 3 characters';
    if (/\d/.test(v)) return 'Numbers are not allowed in category name';
    const allowed = /^[A-Za-z \-&_()\/.,]+$/;
    if (!allowed.test(v)) return 'Only letters, spaces and - & _ ( ) / . , allowed';
    return '';
  };

  useEffect(() => {
    setNameError(validateName(name));
  }, [name]);

  const updatedSummary = useMemo(() => {
    const fields = [];
    if (name !== (category?.name || '')) fields.push('name');
    if ((description || '') !== (category?.description || '')) fields.push('description');
    const currentStatus = (category?.status || (category?.active ? 'active' : 'inactive'));
    if (status !== currentStatus) fields.push('status');
    return fields.join(', ');
  }, [name, description, status, category]);

  const save = async () => {
    const err = validateName(name);
    if (err) {
      setNameError(err);
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      await apiService.updateCategory(id, {
        name: name.trim(),
        description: description || null,
        status: String(status).toLowerCase(),
        active: String(status).toLowerCase() === 'active'
      });
      toast.success('Category saved');
      navigate('/admin/categories');
    } catch (e) {
      toast.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await apiService.deleteCategory(id);
      toast.success('Category deleted');
      navigate('/admin/categories');
    } catch (e) {
      toast.error(e?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSuspend = async () => {
    try {
      if (String(status).toLowerCase() === 'suspended') {
        await apiService.unblockCategory(id);
        setStatus('active');
        toast.success('Category activated');
      } else {
        await apiService.blockCategory(id);
        setStatus('suspended');
        toast.success('Category suspended');
      }
    } catch (e) {
      toast.error(e?.message || 'Action failed');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-content">
        <div className="page-header">
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-secondary" onClick={() => navigate('/admin/categories')}>
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <h1>Edit Category</h1>
              <p>Update details, delete, or change status</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => navigate('/admin/categories')}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving || !!nameError}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '1rem' }}>Loading…</div>
        ) : (
          <div className="admin-form">
            <div className="form-sections">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    {nameError && <small style={{ color: '#ef4444', fontWeight: 600 }}>{nameError}</small>}
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Status</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {String(status).toLowerCase() === 'suspended' ? (
                    <button className="btn-primary" onClick={toggleSuspend}><RotateCcw size={16} /> Activate</button>
                  ) : (
                    <button className="btn-secondary" onClick={toggleSuspend}><Ban size={16} /> Suspend</button>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>Danger Zone</h3>
                <div className="admin-form-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Delete category</div>
                    <div style={{ color: '#64748b' }}>This action cannot be undone.</div>
                  </div>
                  {confirmingDelete ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn-secondary" onClick={() => setConfirmingDelete(false)} disabled={deleting}>Cancel</button>
                      <button className="btn-danger" onClick={doDelete} disabled={deleting}>
                        <Trash2 size={16} /> {deleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  ) : (
                    <button className="btn-danger" onClick={() => setConfirmingDelete(true)} disabled={deleting}>
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>

            {updatedSummary && (
              <div style={{ marginTop: 12, color: '#64748b' }}>Pending changes: {updatedSummary || 'None'}</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EditCategoryPage;


