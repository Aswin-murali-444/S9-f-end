import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import Logo from '../../components/Logo';
import { Users, Settings, Target, Activity, DollarSign, Star, Server, Shield, PieChart, MapPin, Mail, Phone, User as UserIcon } from 'lucide-react';
import '../dashboards/SharedDashboard.css';
import '../dashboards/AdminDashboard.css';

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navItems = [
    { key: 'overview', label: 'Overview', icon: PieChart },
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'services', label: 'Services', icon: Settings },
    { key: 'allocation', label: 'Allocation', icon: Target },
    { key: 'monitoring', label: 'Monitoring', icon: Activity },
    { key: 'billing', label: 'Billing', icon: DollarSign },
    { key: 'feedback', label: 'Feedback', icon: Star },
    { key: 'system', label: 'System Health', icon: Server },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  const normalizeNumber = (val) => (val === null || val === undefined || val === '' ? null : Number(val));

  const buildMapHref = (address, lat, lon) => {
    const hasCoords = lat !== null && lon !== null && !Number.isNaN(lat) && !Number.isNaN(lon);
    if (hasCoords) return `https://www.google.com/maps?q=${lat},${lon}`;
    const query = address || '';
    if (!query) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const addCandidate = (list, label, address, lat, lon) => {
    const latitude = normalizeNumber(lat);
    const longitude = normalizeNumber(lon);
    const href = buildMapHref(address, latitude, longitude);
    if (!href) return;
    list.push({ label, address, lat: latitude, lon: longitude, href });
  };

  const extractLocations = (profile) => {
    if (!profile || typeof profile !== 'object') return [];
    const found = [];

    // Pattern A: Array of locations
    const arr = profile.locations || profile.saved_locations || profile.location_list;
    if (Array.isArray(arr)) {
      for (let i = 0; i < arr.length && found.length < 3; i++) {
        const it = arr[i] || {};
        const label = it.label || it.name || `Location ${i + 1}`;
        const addr = it.address || it.addr || it.formatted_address || [it.city, it.state, it.country].filter(Boolean).join(', ');
        const lat = it.lat ?? it.latitude ?? it.location_latitude ?? null;
        const lon = it.lon ?? it.lng ?? it.longitude ?? it.location_longitude ?? null;
        addCandidate(found, label, addr, lat, lon);
      }
    }

    // Pattern B: Indexed fields location_1_*, location1_*, address_1, etc
    for (let i = 1; i <= 3 && found.length < 3; i++) {
      const addr = profile[`location_${i}_address`] || profile[`location${i}_address`] || profile[`loc_${i}_address`] || profile[`address_${i}`] || profile[`address${i}`];
      const lat = profile[`location_${i}_latitude`] ?? profile[`location${i}_latitude`] ?? profile[`loc_${i}_lat`] ?? profile[`lat_${i}`] ?? profile[`latitude_${i}`];
      const lon = profile[`location_${i}_longitude`] ?? profile[`location${i}_longitude`] ?? profile[`loc_${i}_lon`] ?? profile[`lng_${i}`] ?? profile[`longitude_${i}`];
      const label = profile[`location_${i}_label`] || profile[`location${i}_label`] || profile[`location_${i}_name`] || profile[`location${i}_name`] || `Location ${i}`;
      if (addr || (lat !== undefined && lon !== undefined)) addCandidate(found, label, addr, lat, lon);
    }

    // Pattern C: Named locations like home/work/other/office/school
    const named = ['home', 'work', 'other', 'office', 'school'];
    for (const name of named) {
      if (found.length >= 3) break;
      const addr = profile[`${name}_address`];
      const lat = profile[`${name}_latitude`] ?? profile[`${name}_lat`];
      const lon = profile[`${name}_longitude`] ?? profile[`${name}_lon`] ?? profile[`${name}_lng`];
      if (addr || (lat !== undefined && lon !== undefined)) addCandidate(found, name.charAt(0).toUpperCase() + name.slice(1), addr, lat, lon);
    }

    // Fallback: Primary address on profile
    if (found.length === 0) {
      const parts = [profile.address, profile.city, profile.state, profile.country].filter(Boolean).join(', ');
      const lat = profile.location_latitude ?? null;
      const lon = profile.location_longitude ?? null;
      if (parts || (lat !== null && lon !== null)) addCandidate(found, 'Primary Address', parts || null, lat, lon);
    }

    return found.slice(0, 3);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const full = await apiService.getUserProfile(userId);
        const profile = full.user_profiles || full.profile || {};
        const first = profile.first_name || '';
        const last = profile.last_name || '';
        const name = [first, last].filter(Boolean).join(' ').trim() || full.email || 'Unknown';
        let avatar = full.avatar_url || profile.profile_picture_url || profile.avatar_url || '';
        if (avatar && !/^https?:\/\//i.test(avatar)) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            const base = supabaseUrl.replace(/\/$/, '');
            const path = String(avatar).replace(/^\//, '');
            avatar = `${base}/storage/v1/object/public/${path}`;
          }
        }
        const locations = extractLocations(profile);
        setUser({ ...full, name, profile, avatar, locations });
      } catch (e) {
        setError(e?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const Header = () => (
    <section className="dashboard-header">
      <div className="container">
        <div className="header-content">
          <div className="welcome-section">
            <Logo size="medium" />
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => navigate('/dashboard/admin')}>Admin Dashboard</button>
            <button className="btn-primary" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </section>
  );

  const Sidebar = () => (
    <aside className="dashboard-sidebar">
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${item.key === 'users' ? 'active' : ''}`}
            onClick={() => navigate(`/dashboard/admin?tab=${encodeURIComponent(item.key)}`)}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />
      </nav>
    </aside>
  );

  const ProfileContent = () => (
    <div className="tab-content">
      <div className="users-tab">
        <div className="users-header" style={{ justifyContent: 'space-between' }}>
          <h3>{user.name || user.email}</h3>
          <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
        </div>

        <div className="admin-forms-grid">
          <div className="admin-form-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserIcon size={18} />
              <h4 style={{ margin: 0 }}>Profile</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'center' }}>
              <div className="user-avatar" style={{ width: 124, height: 128, borderWidth: 4, margin: '0 auto' }}>
                {typeof user.avatar === 'string' && /^https?:\/\//i.test(user.avatar) ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  (user.name || user.email || 'NA').split(' ').filter(Boolean).map(p => p[0]).slice(0,2).join('').toUpperCase()
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>{user.name || user.email}</div>
                  <span className={`status-badge ${user.status || 'active'}`}>{user.status || 'active'}</span>
                </div>
                <div title={user.email} style={{ color: '#64748b', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>First Name</label>
                <div>{user.profile?.first_name || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Last Name</label>
                <div>{user.profile?.last_name || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Gender</label>
                <div>{user.profile?.gender || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Date of Birth</label>
                <div>{user.profile?.date_of_birth || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Phone</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={14} /> {user.profile?.phone || '—'}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Email</label>
                <div title={user.email} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: '100%' }}>
                  <Mail size={14} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || '—'}</span>
                </div>
              </div>
            </div>
            {user.profile?.bio && (
              <div style={{ marginTop: 6 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Bio</label>
                <div style={{ lineHeight: 1.6 }}>{user.profile.bio}</div>
              </div>
            )}
          </div>

          <div className="admin-form-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={18} />
              <h4 style={{ margin: 0 }}>Address & Locations</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 20 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Address</label>
                <div style={{ lineHeight: 1.6 }}>{user.profile?.address || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>City</label>
                <div>{user.profile?.city || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>State</label>
                <div>{user.profile?.state || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Country</label>
                <div>{user.profile?.country || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Postal Code</label>
                <div>{user.profile?.postal_code || '—'}</div>
              </div>
            </div>
            {Array.isArray(user.locations) && user.locations.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 8 }}>Saved Locations</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                  {user.locations.map((loc, idx) => (
                    <a
                      key={`${loc.label}-${idx}`}
                      href={loc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 14px',
                        textDecoration: 'none'
                      }}
                    >
                      <MapPin size={16} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.label}</span>
                        <span style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {loc.address || `${loc.lat}, ${loc.lon}`}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="admin-form-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={18} />
              <h4 style={{ margin: 0 }}>Account</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Role</label>
                <div>{user.role || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Status</label>
                <div>
                  <span className={`status-badge ${user.status || 'active'}`}>{user.status || 'active'}</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Created</label>
                <div>{user.created_at ? new Date(user.created_at).toLocaleString() : '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Last Updated</label>
                <div>{user.updated_at ? new Date(user.updated_at).toLocaleString() : '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Header />
        <section className="dashboard-content">
          <div className="container">
            <div>Loading…</div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <Header />
        <section className="dashboard-content">
          <div className="container">
            <div>{error}</div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="admin-dashboard">
      <Header />
      <section className="dashboard-content">
        <div className="container">
          <div className="dashboard-layout">
            <Sidebar />
            <ProfileContent />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminUserProfile;


