import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api';
import Logo from '../../components/Logo';
import { Users, Settings, Target, Activity, DollarSign, Star, Server, Shield, PieChart, MapPin, Mail, Phone, User as UserIcon, ArrowLeft, Calendar, Clock, ShieldCheck } from 'lucide-react';
import '../dashboards/SharedDashboard.css';
import '../dashboards/AdminDashboard.css';
import '../HomePage.css';

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
    <section className="hero-section" style={{ padding: '60px 0 40px', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="container">
        <motion.div 
          className="header-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div className="welcome-section" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Logo size="medium" />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                {user ? `${user.name || user.email}'s Profile` : 'User Profile'}
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                {user ? `Manage ${user.name || user.email}'s details and settings` : 'Manage user details and settings'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'rgba(79, 156, 249, 0.1)', borderRadius: '12px', border: '1px solid rgba(79, 156, 249, 0.2)' }}>
                <div className="user-avatar" style={{ width: '40px', height: '40px', borderWidth: 2, margin: 0 }}>
                  {typeof user.avatar === 'string' && /^https?:\/\//i.test(user.avatar) ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    (user.name || user.email || 'NA').split(' ').filter(Boolean).map(p => p[0]).slice(0,2).join('').toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{user.name || user.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    <span className={`status-badge ${user.status || 'active'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                      {user.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary btn-animate" onClick={() => navigate('/dashboard/admin')}>
                <Users size={16} />
                Admin Dashboard
              </button>
              <button className="btn-primary btn-animate" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );


  const ProfileContent = () => (
    <div className="services-overview" style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div 
          className="section-header fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <span className="section-badge animate-bounce-in">👤 User Profile</span>
          <h2 style={{ margin: '16px 0', fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>
            {user.name || user.email}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Complete user information and account details
          </p>
        </motion.div>

        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Profile Card */}
          <motion.div 
            className="service-category card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="service-icon animate-float" style={{ marginBottom: '20px' }}>
              <UserIcon size={32} />
            </div>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>Personal Information</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div className="user-avatar" style={{ width: '80px', height: '80px', borderWidth: 3, margin: 0 }}>
                {typeof user.avatar === 'string' && /^https?:\/\//i.test(user.avatar) ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  (user.name || user.email || 'NA').split(' ').filter(Boolean).map(p => p[0]).slice(0,2).join('').toUpperCase()
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{user.name || user.email}</h4>
                  <span className={`status-badge ${user.status || 'active'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                    {user.status || 'active'}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{user.email}</p>
              </div>
            </div>

            <ul className="service-list" style={{ textAlign: 'left', margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>First Name:</span>
                <span style={{ fontWeight: 500 }}>{user.profile?.first_name || '—'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Last Name:</span>
                <span style={{ fontWeight: 500 }}>{user.profile?.last_name || '—'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Date of Birth:</span>
                <span style={{ fontWeight: 500 }}>{user.profile?.date_of_birth || '—'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Gender:</span>
                <span style={{ fontWeight: 500 }}>{user.profile?.gender || '—'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Phone:</span>
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} />
                  {user.profile?.phone || '—'}
                </span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: '#64748b' }}>Email:</span>
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={14} />
                  {user.email || '—'}
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Address Card */}
          <motion.div 
            className="service-category card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="service-icon animate-float" style={{ marginBottom: '20px' }}>
              <MapPin size={32} />
            </div>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>Address & Locations</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Postal Code - First and Prominent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'rgba(79, 156, 249, 0.1)', borderRadius: '12px', border: '1px solid rgba(79, 156, 249, 0.2)' }}>
                <div style={{ minWidth: '100px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#4f9cf9', marginBottom: '4px', fontWeight: '600' }}>Postal Code</label>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{user.profile?.postal_code || '—'}</div>
              </div>
              </div>
              
              {/* Other Address Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 20 }}>
              <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: '8px' }}>City</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>{user.profile?.city || '—'}</div>
              </div>
              <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: '8px' }}>State</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>{user.profile?.state || '—'}</div>
              </div>
              <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: '8px' }}>Country</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>{user.profile?.country || '—'}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: '8px' }}>Address</label>
                  <div style={{ lineHeight: 1.6, padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>{user.profile?.address || '—'}</div>
                </div>
              </div>
          </div>

            {Array.isArray(user.locations) && user.locations.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 8 }}>Saved Locations</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
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
                        textDecoration: 'none',
                        borderRadius: '8px'
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
          </motion.div>

          {/* Account Card */}
          <motion.div 
            className="service-category card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="service-icon animate-float" style={{ marginBottom: '20px' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>Account Information</h3>
            
            <ul className="service-list" style={{ textAlign: 'left', margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Role:</span>
                <span style={{ fontWeight: 500 }}>{user.role || '—'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span className={`status-badge ${user.status || 'active'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                  {user.status || 'active'}
                </span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Created:</span>
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: '#64748b' }}>Last Updated:</span>
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '—'}
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div className="services-overview" style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading user profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <div className="services-overview" style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '20px' }}>❌ Error</div>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>{error}</p>
              <button className="btn-primary btn-animate" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="home-page">
      <Header />
            <ProfileContent />
    </div>
  );
};

export default AdminUserProfile;


