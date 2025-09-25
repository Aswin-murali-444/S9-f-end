import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import { Users, MapPin, Mail, Phone, User as UserIcon, ArrowLeft, Calendar, Clock, ShieldCheck, Navigation, Map } from 'lucide-react';
import './AdminPages.css';

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeNumber = (val) => (val === null || val === undefined || val === '' ? null : Number(val));

  const buildMapHref = (address, lat, lon) => {
    const hasCoords = lat !== null && lon !== null && !Number.isNaN(lat) && !Number.isNaN(lon);
    if (hasCoords) return `https://www.google.com/maps?q=${lat},${lon}`;
    const query = address || '';
    if (!query) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const formatLocationData = (profile) => {
    const locations = [];
    
    // Primary location from user_profiles table
    if (profile) {
      const lat = normalizeNumber(profile.location_latitude);
      const lon = normalizeNumber(profile.location_longitude);
      const accuracy = normalizeNumber(profile.location_accuracy_m);
      
      if (lat !== null && lon !== null) {
        const address = [profile.address, profile.city, profile.state, profile.country]
          .filter(Boolean)
          .join(', ');
        
        locations.push({
          label: 'Primary Location',
          address: address || `${lat}, ${lon}`,
          lat,
          lon,
          accuracy,
          href: buildMapHref(address, lat, lon)
        });
      }
    }
    
    return locations;
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await apiService.getUserProfile(userId);
        
        // Format the user data for display
        const profile = userData.profile || {};
        const first = profile.first_name || '';
        const last = profile.last_name || '';
        const name = [first, last].filter(Boolean).join(' ').trim() || userData.email || 'Unknown';
        
        // Handle avatar URL
        let avatar = userData.avatar_url || profile.profile_picture_url || profile.avatar_url || '';
        if (avatar && !/^https?:\/\//i.test(avatar)) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            const base = supabaseUrl.replace(/\/$/, '');
            const path = String(avatar).replace(/^\//, '');
            avatar = `${base}/storage/v1/object/public/${path}`;
          }
        }
        
        const locations = formatLocationData(profile);
        
        setUser({ 
          ...userData, 
          name, 
          profile, 
          avatar, 
          locations 
        });
      } catch (e) {
        setError(e?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadUser();
    }
  }, [userId]);

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

  if (loading) {
    return (
      <AdminLayout>
        <motion.div
          className="admin-page-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="page-header">
            <div className="page-title">
              <h1>Loading User Profile...</h1>
              <p>Please wait while we fetch the user information</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading user profile...</p>
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <motion.div
          className="admin-page-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="page-header">
            <div className="page-title">
              <h1>Error Loading Profile</h1>
              <p>There was an issue loading the user profile</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '20px' }}>❌ Error</div>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>{error}</p>
            <button className="btn-primary btn-animate" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
              Try Again
            </button>
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  if (!user) return null;

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
            <h1>User Profile</h1>
            <p>View and manage user details for {user.name || user.email}</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary btn-animate" onClick={() => navigate('/dashboard/admin?tab=users')}>
              <Users size={16} />
              Back to Users
            </button>
            <button className="btn-primary btn-animate" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div className="admin-form" variants={itemVariants}>
          <div className="form-sections">
            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Profile Picture</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
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
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    {user.profile?.first_name || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    {user.profile?.last_name || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} />
                    {user.email || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} />
                    {user.profile?.phone || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    {user.profile?.date_of_birth ? new Date(user.profile.date_of_birth).toLocaleDateString() : '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    {user.profile?.gender || '—'}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Bio</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', minHeight: '80px', lineHeight: '1.6' }}>
                    {user.profile?.bio || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Location */}
            <div className="form-section">
              <h3>Address & Location</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Postal Code</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    {user.profile?.postal_code || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>City</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    {user.profile?.city || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>State</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    {user.profile?.state || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    {user.profile?.country || '—'}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Full Address</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', lineHeight: '1.6' }}>
                    {user.profile?.address || '—'}
                  </div>
                </div>

                {/* Location Coordinates */}
                {user.locations && user.locations.length > 0 && (
                  <div className="form-group full-width">
                    <label>Location Data</label>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {user.locations.map((location, idx) => (
                        <div key={idx} style={{ padding: '16px', backgroundColor: 'rgba(79, 156, 249, 0.1)', borderRadius: '12px', border: '1px solid rgba(79, 156, 249, 0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#4f9cf9' }}>
                              {location.label}
                            </h4>
                            {location.href && (
                              <a
                                href={location.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Map size={14} />
                                View on Map
                              </a>
                            )}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.875rem' }}>
                            <div>
                              <span style={{ color: '#64748b' }}>Address:</span>
                              <div style={{ fontWeight: 500, marginTop: '2px' }}>{location.address || '—'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Latitude:</span>
                              <div style={{ fontWeight: 500, marginTop: '2px' }}>{location.lat !== null ? location.lat.toFixed(6) : '—'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Longitude:</span>
                              <div style={{ fontWeight: 500, marginTop: '2px' }}>{location.lon !== null ? location.lon.toFixed(6) : '—'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Accuracy:</span>
                              <div style={{ fontWeight: 500, marginTop: '2px' }}>
                                {location.accuracy !== null ? `${location.accuracy}m` : '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="form-section">
              <h3>Account Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>User Role</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} />
                    {user.role || '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span className={`status-badge ${user.status || 'active'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                      {user.status || 'active'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Created</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} />
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Updated</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} />
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Verified</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span className={`status-badge ${user.email_verified ? 'active' : 'inactive'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                      {user.email_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Verified</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span className={`status-badge ${user.phone_verified ? 'active' : 'inactive'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                      {user.phone_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminUserProfile;