import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, UserX, Mail, Phone, Filter, Download, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import './AdminPages.css';

const ManageProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sortKey, setSortKey] = useState('created_desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const run = async () => {
      try {
        const data = await apiService.listProviders();
        setProviders(data.providers || []);
      } catch (e) {
        console.error('Failed to fetch providers', e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return providers.filter(p => {
      const name = `${p.user_profiles?.first_name || ''} ${p.user_profiles?.last_name || ''}`.trim().toLowerCase();
      const email = (p.email || '').toLowerCase();
      const matchesQuery = !q || name.includes(q) || email.includes(q);
      const matchesStatus = !status || (p.status === status || p.service_provider_details?.status === status);
      return matchesQuery && matchesStatus;
    });
  }, [providers, query, status]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortKey) {
      case 'name_asc':
        return arr.sort((a,b) => (`${a.user_profiles?.first_name||''} ${a.user_profiles?.last_name||''}`).localeCompare(`${b.user_profiles?.first_name||''} ${b.user_profiles?.last_name||''}`));
      case 'name_desc':
        return arr.sort((a,b) => (`${b.user_profiles?.first_name||''} ${b.user_profiles?.last_name||''}`).localeCompare(`${a.user_profiles?.first_name||''} ${a.user_profiles?.last_name||''}`));
      case 'created_asc':
        return arr.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
      case 'created_desc':
      default:
        return arr.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => sorted.slice((page-1)*pageSize, page*pageSize), [sorted, page]);

  const changeStatus = async (userId, nextStatus) => {
    try {
      await apiService.updateUserStatus(userId, nextStatus);
      setProviders(prev => prev.map(p => p.id === userId ? { ...p, status: nextStatus } : p));
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const exportCsv = () => {
    const lines = [
      ['Name','Email','Phone','Status','Specialization','Created At'].join(',')
    ];
    sorted.forEach(p => {
      const name = `${p.user_profiles?.first_name||''} ${p.user_profiles?.last_name||''}`.trim();
      const row = [name, p.email||'', p.user_profiles?.phone||'', p.status||'', p.service_provider_details?.specialization||'', p.created_at||'']
        .map(v => `"${String(v).replace(/"/g,'"')}"`).join(',');
      lines.push(row);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'providers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Manage Service Providers" onBack={() => window.history.back()}>
      <div className="admin-page-container">
        <div className="page-title">
          <h1>Manage Service Providers</h1>
          <p>Search, filter and review all provider accounts</p>
        </div>

        <div className="providers-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search providers"
            />
          </div>
          <div className="filter-select-wrap">
            <Filter size={16} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="filter-select-wrap">
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Sort providers">
              <option value="created_desc">Newest</option>
              <option value="created_asc">Oldest</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={exportCsv}><Download size={16} /> Export CSV</button>
        </div>

        {loading ? (
          <div className="loading-center">Loading providers...</div>
        ) : (
          <div className="providers-table">
            <div className="table-header">
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Status</div>
              <div>Specialization</div>
              <div>Actions</div>
            </div>
            {paginated.map(p => (
              <motion.div className="table-row" key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="name-cell">{p.user_profiles?.first_name} {p.user_profiles?.last_name}</div>
                <div className="email-cell"><Mail size={14} /> {p.email}</div>
                <div className="phone-cell"><Phone size={14} /> {p.user_profiles?.phone || '—'}</div>
                <div className={`status-cell ${p.status}`}>{p.status}</div>
                <div className="spec-cell">{p.service_provider_details?.specialization || '—'}</div>
                <div className="actions-cell">
                  <button className="btn-secondary small" onClick={() => window.location.assign(`/admin/users/${p.id}`)}><Eye size={14} /> View</button>
                  {p.status === 'active' ? (
                    <button className="btn-secondary small" onClick={() => changeStatus(p.id, 'suspended')}><UserX size={14} /> Suspend</button>
                  ) : (
                    <button className="btn-secondary small" onClick={() => changeStatus(p.id, 'active')}><UserCheck size={14} /> Activate</button>
                  )}
                </div>
              </motion.div>
            ))}
            <div className="table-pagination">
              <button className="btn-secondary small" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
              <span>Page {page} / {totalPages}</span>
              <button className="btn-secondary small" disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageProvidersPage;

