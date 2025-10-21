import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import { Users, MapPin, Mail, Phone, User as UserIcon, ArrowLeft, Calendar, Clock, ShieldCheck, Navigation, Map, Briefcase, Award, DollarSign, Star, Target, Package, Globe, Home, Building, FileText, CheckCircle, XCircle, AlertCircle, Settings, Save, AlertTriangle } from 'lucide-react';
import './AdminPages.css';

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Verification management state
  const [isEditingVerification, setIsEditingVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationReason, setVerificationReason] = useState('');
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const normalizeNumber = (val) => (val === null || val === undefined || val === '' ? null : Number(val));

  // Helper function to format data and handle null values
  const formatValue = (value, fallback = '') => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return value;
  };

  const formatBoolean = (value, trueText = 'Yes', falseText = 'No') => {
    if (value === null || value === undefined) return '';
    return value ? trueText : falseText;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const buildMapHref = (address, lat, lon) => {
    const hasCoords = lat !== null && lon !== null && !Number.isNaN(lat) && !Number.isNaN(lon);
    if (hasCoords) return `https://www.google.com/maps?q=${lat},${lon}`;
    const query = address || '';
    if (!query) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const formatLocationData = (profile, providerProfile = null) => {
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
    
    // Provider location from provider_profiles table
    if (providerProfile) {
      const lat = normalizeNumber(providerProfile.location_latitude);
      const lon = normalizeNumber(providerProfile.location_longitude);
      
      if (lat !== null && lon !== null) {
        const address = [providerProfile.address, providerProfile.city, providerProfile.state, providerProfile.country]
          .filter(Boolean)
          .join(', ');
        
        locations.push({
          label: 'Provider Location',
          address: address || `${lat}, ${lon}`,
          lat,
          lon,
          accuracy: null,
          href: buildMapHref(address, lat, lon)
        });
      }
    }
    
    return locations;
  };

  // Function to fetch provider profile data
  const fetchProviderProfile = async (providerId) => {
    try {
      const profileData = await apiService.getProviderProfile(providerId);
      const providerData = profileData?.data || null;
      setProviderProfile(providerData);
      if (providerData) {
        setVerificationStatus(providerData.status || 'pending_verification');
      }
      return providerData;
    } catch (error) {
      console.error('Failed to fetch provider profile:', error);
      setProviderProfile(null);
      return null;
    }
  };

  // Function to update verification status
  const updateVerificationStatus = async () => {
    if (!providerProfile?.provider_id) {
      setVerificationError('Provider ID not found');
      return;
    }

    try {
      setIsUpdatingVerification(true);
      setVerificationError('');

      const response = await apiService.updateProviderProfileStatus(
        providerProfile.provider_id,
        verificationStatus,
        verificationReason
      );

      if (response.success) {
        // Update local state
        setProviderProfile(prev => ({
          ...prev,
          status: verificationStatus,
          updated_at: new Date().toISOString()
        }));
        
        setIsEditingVerification(false);
        setVerificationReason('');
        
        // Show success message (you can add a toast notification here)
        console.log('Verification status updated successfully');
      } else {
        setVerificationError(response.error || 'Failed to update verification status');
      }
    } catch (error) {
      console.error('Failed to update verification status:', error);
      setVerificationError(error.message || 'Failed to update verification status');
    } finally {
      setIsUpdatingVerification(false);
    }
  };

  // Function to handle verification status change
  const handleVerificationStatusChange = (newStatus) => {
    setVerificationStatus(newStatus);
    setVerificationError('');
  };

  // Function to cancel verification editing
  const cancelVerificationEdit = () => {
    setIsEditingVerification(false);
    setVerificationStatus(providerProfile?.status || 'pending_verification');
    setVerificationReason('');
    setVerificationError('');
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
        
        // If this is a service provider, fetch their provider profile data first
        let providerProfileData = null;
        if (userData.role === 'service_provider') {
          providerProfileData = await fetchProviderProfile(userId);
        }
        
        const locations = formatLocationData(profile, providerProfileData);
        
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
            <button className="btn-primary btn-animate" onClick={() => navigate('/dashboard/admin?tab=users')}>
              <ArrowLeft size={16} />
              Back to User Management
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
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserIcon size={16} />
                    {formatValue(user.profile?.first_name)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserIcon size={16} />
                    {formatValue(user.profile?.last_name)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} />
                    {formatValue(user.email)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} />
                    {formatValue(user.profile?.phone)}
                  </div>
                </div>

                {user.profile?.date_of_birth && (
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      {formatDate(user.profile?.date_of_birth)}
                    </div>
                  </div>
                )}

                {user.profile?.gender && (
                  <div className="form-group">
                    <label>Gender</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserIcon size={16} />
                      {formatValue(user.profile?.gender)}
                    </div>
                  </div>
                )}

                {user.profile?.bio && (
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', minHeight: '80px', lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <FileText size={16} style={{ marginTop: '2px' }} />
                      {formatValue(user.profile?.bio)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Location */}
            <div className="form-section">
              <h3>Address & Location</h3>
              <div className="form-grid">
                {user.profile?.postal_code && (
                  <div className="form-group">
                    <label>Postal Code</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={16} />
                      {formatValue(user.profile?.postal_code)}
                    </div>
                  </div>
                )}

                {user.profile?.city && (
                  <div className="form-group">
                    <label>City</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} />
                      {formatValue(user.profile?.city)}
                    </div>
                  </div>
                )}

                {user.profile?.state && (
                  <div className="form-group">
                    <label>State</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} />
                      {formatValue(user.profile?.state)}
                    </div>
                  </div>
                )}

                {user.profile?.country && (
                  <div className="form-group">
                    <label>Country</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={16} />
                      {formatValue(user.profile?.country)}
                    </div>
                  </div>
                )}

                {user.profile?.address && (
                  <div className="form-group full-width">
                    <label>Full Address</label>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Home size={16} style={{ marginTop: '2px' }} />
                      {formatValue(user.profile?.address)}
                    </div>
                  </div>
                )}

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
                    {formatValue(user.role)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.status === 'active' ? (
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <XCircle size={16} style={{ color: '#ef4444' }} />
                    )}
                    <span className={`status-badge ${user.status || 'active'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                      {formatValue(user.status, 'active')}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Created</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} />
                    {formatDate(user.created_at)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Updated</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} />
                    {formatDateTime(user.updated_at)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Verified</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.email_verified ? (
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <XCircle size={16} style={{ color: '#ef4444' }} />
                    )}
                    <span className={`status-badge ${user.email_verified ? 'active' : 'inactive'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                      {formatBoolean(user.email_verified, 'Verified', 'Not Verified')}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Verified</label>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.phone_verified ? (
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <XCircle size={16} style={{ color: '#ef4444' }} />
                    )}
                    <span className={`status-badge ${user.phone_verified ? 'active' : 'inactive'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                      {formatBoolean(user.phone_verified, 'Verified', 'Not Verified')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Provider Profile Section - Only show for service providers */}
            {user?.role === 'service_provider' && (
              <div className="form-section">
                <h3>Service Provider Profile</h3>
                {providerProfile ? (
                  <div className="form-grid">
                    {/* Provider Profile Picture */}
                    <div className="form-group">
                      <label>Provider Profile Picture</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                        <div className="user-avatar" style={{ width: '80px', height: '80px', borderWidth: 3, margin: 0 }}>
                          {providerProfile.profile_photo_url ? (
                            <img src={providerProfile.profile_photo_url} alt="Provider Profile" />
                          ) : (
                            (providerProfile.first_name || providerProfile.last_name || 'Provider').split(' ').filter(Boolean).map(p => p[0]).slice(0,2).join('').toUpperCase()
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                              {formatValue(`${providerProfile.first_name} ${providerProfile.last_name}`.trim(), 'Provider Profile')}
                            </h4>
                            <span className={`status-badge ${providerProfile.status || 'active'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                              {formatValue(providerProfile.status, 'active')}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                            Service Provider ID: {formatValue(providerProfile.provider_id)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="form-group">
                      <label>First Name</label>
                      <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserIcon size={16} />
                        {formatValue(providerProfile.first_name)}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserIcon size={16} />
                        {formatValue(providerProfile.last_name)}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Provider Phone</label>
                      <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={16} />
                        {formatValue(providerProfile.phone)}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Provider Email</label>
                      <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={16} />
                        {formatValue(providerProfile.email)}
                      </div>
                    </div>

                    {/* Address Information */}
                    {providerProfile.pincode && (
                      <div className="form-group">
                        <label>Postal Code</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building size={16} />
                          {formatValue(providerProfile.pincode)}
                        </div>
                      </div>
                    )}

                    {providerProfile.city && (
                      <div className="form-group">
                        <label>City</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} />
                          {formatValue(providerProfile.city)}
                        </div>
                      </div>
                    )}

                    {providerProfile.state && (
                      <div className="form-group">
                        <label>State</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} />
                          {formatValue(providerProfile.state)}
                        </div>
                      </div>
                    )}

                    {providerProfile.country && (
                      <div className="form-group">
                        <label>Country</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Globe size={16} />
                          {formatValue(providerProfile.country)}
                        </div>
                      </div>
                    )}

                    {providerProfile.address && (
                      <div className="form-group full-width">
                        <label>Full Address</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Home size={16} style={{ marginTop: '2px' }} />
                          {formatValue(providerProfile.address)}
                        </div>
                      </div>
                    )}

                    {/* Professional Information */}
                    {(providerProfile.years_of_experience || providerProfile.years_of_experience === 0) && (
                      <div className="form-group">
                        <label>Years of Experience</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Award size={16} />
                          {formatValue(providerProfile.years_of_experience, '0')} years
                        </div>
                      </div>
                    )}

                    {(providerProfile.hourly_rate || providerProfile.hourly_rate === 0) && (
                      <div className="form-group">
                        <label>Hourly Rate</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <DollarSign size={16} />
                          ₹{formatValue(providerProfile.hourly_rate, '0')}
                        </div>
                      </div>
                    )}

                    {providerProfile.service_category_name && (
                      <div className="form-group">
                        <label>Service Category</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Package size={16} />
                          {formatValue(providerProfile.service_category_name)}
                        </div>
                      </div>
                    )}

                    {providerProfile.service_name && (
                      <div className="form-group">
                        <label>Service Type</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Target size={16} />
                          {formatValue(providerProfile.service_name)}
                        </div>
                      </div>
                    )}

                    {providerProfile.specialization && (
                      <div className="form-group">
                        <label>Specialization</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Briefcase size={16} />
                          {formatValue(providerProfile.specialization)}
                        </div>
                      </div>
                    )}

                    {/* Profile Status */}
                    <div className="form-group">
                      <label>Profile Status</label>
                      <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {providerProfile.profile_status === 'verified' ? (
                          <CheckCircle size={16} style={{ color: '#10b981' }} />
                        ) : providerProfile.profile_status === 'rejected' ? (
                          <XCircle size={16} style={{ color: '#ef4444' }} />
                        ) : (
                          <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                        )}
                        <span className={`status-badge ${providerProfile.profile_status || 'active'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                          {formatValue(providerProfile.profile_status, 'active')}
                        </span>
                      </div>
                    </div>

                    {/* Admin Verification Management */}
                    <div className="form-group full-width">
                      <label>Admin Verification Management</label>
                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {!isEditingVerification ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {providerProfile.status === 'verified' ? (
                                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                                ) : providerProfile.status === 'rejected' ? (
                                  <XCircle size={20} style={{ color: '#ef4444' }} />
                                ) : providerProfile.status === 'suspended' ? (
                                  <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                                ) : (
                                  <AlertCircle size={20} style={{ color: '#6b7280' }} />
                                )}
                                <span style={{ fontWeight: '500', fontSize: '1rem' }}>
                                  Current Status: 
                                </span>
                                <span className={`status-badge ${providerProfile.status || 'pending_verification'}`} style={{ fontSize: '0.875rem', padding: '6px 12px' }}>
                                  {formatValue(providerProfile.status, 'pending_verification').replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsEditingVerification(true)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                            >
                              <Settings size={16} />
                              Manage Verification
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <Settings size={20} style={{ color: '#3b82f6' }} />
                              <span style={{ fontWeight: '500', fontSize: '1rem' }}>Update Verification Status</span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                                  New Status
                                </label>
                                <select
                                  value={verificationStatus}
                                  onChange={(e) => handleVerificationStatusChange(e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white'
                                  }}
                                >
                                  <option value="pending_verification">Pending Verification</option>
                                  <option value="verified">Verified</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="suspended">Suspended</option>
                                  <option value="active">Active</option>
                                </select>
                              </div>
                              
                              <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                                  Reason (Optional)
                                </label>
                                <textarea
                                  value={verificationReason}
                                  onChange={(e) => setVerificationReason(e.target.value)}
                                  placeholder="Enter reason for status change..."
                                  rows={3}
                                  style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                            </div>
                            
                            {verificationError && (
                              <div style={{
                                padding: '12px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                fontSize: '0.875rem'
                              }}>
                                {verificationError}
                              </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={cancelVerificationEdit}
                                disabled={isUpdatingVerification}
                                style={{
                                  padding: '10px 20px',
                                  backgroundColor: '#6b7280',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  cursor: isUpdatingVerification ? 'not-allowed' : 'pointer',
                                  opacity: isUpdatingVerification ? 0.6 : 1,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => !isUpdatingVerification && (e.target.style.backgroundColor = '#4b5563')}
                                onMouseOut={(e) => !isUpdatingVerification && (e.target.style.backgroundColor = '#6b7280')}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={updateVerificationStatus}
                                disabled={isUpdatingVerification}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '10px 20px',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  cursor: isUpdatingVerification ? 'not-allowed' : 'pointer',
                                  opacity: isUpdatingVerification ? 0.6 : 1,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => !isUpdatingVerification && (e.target.style.backgroundColor = '#059669')}
                                onMouseOut={(e) => !isUpdatingVerification && (e.target.style.backgroundColor = '#10b981')}
                              >
                                {isUpdatingVerification ? (
                                  <>
                                    <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Save size={16} />
                                    Update Status
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Verification Status</label>
                      <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {providerProfile.is_verified ? (
                          <CheckCircle size={16} style={{ color: '#10b981' }} />
                        ) : (
                          <XCircle size={16} style={{ color: '#ef4444' }} />
                        )}
                        <span className={`status-badge ${providerProfile.is_verified ? 'active' : 'inactive'}`} style={{ fontSize: '0.875rem', padding: '4px 8px' }}>
                          {formatBoolean(providerProfile.is_verified, 'Verified', 'Not Verified')}
                        </span>
                      </div>
                    </div>

                    {/* Timestamps */}
                    {providerProfile.created_at && (
                      <div className="form-group">
                        <label>Profile Created</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} />
                          {formatDate(providerProfile.created_at)}
                        </div>
                      </div>
                    )}

                    {providerProfile.updated_at && (
                      <div className="form-group">
                        <label>Profile Last Updated</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} />
                          {formatDateTime(providerProfile.updated_at)}
                        </div>
                      </div>
                    )}

                    {/* Additional Provider Information */}
                    {providerProfile.bio && (
                      <div className="form-group full-width">
                        <label>Provider Bio</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', minHeight: '80px', lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <FileText size={16} style={{ marginTop: '2px' }} />
                          {formatValue(providerProfile.bio)}
                        </div>
                      </div>
                    )}

                    {/* Aadhaar Information */}
                    {providerProfile.aadhaar_number && (
                      <div className="form-group">
                        <label>Aadhaar Number</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={16} />
                          {formatValue(providerProfile.aadhaar_number)}
                        </div>
                      </div>
                    )}

                    {providerProfile.aadhaar_name && (
                      <div className="form-group">
                        <label>Aadhaar Name</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserIcon size={16} />
                          {formatValue(providerProfile.aadhaar_name)}
                        </div>
                      </div>
                    )}

                    {providerProfile.aadhaar_dob && (
                      <div className="form-group">
                        <label>Aadhaar Date of Birth</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} />
                          {formatDate(providerProfile.aadhaar_dob)}
                        </div>
                      </div>
                    )}

                    {providerProfile.aadhaar_gender && (
                      <div className="form-group">
                        <label>Aadhaar Gender</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserIcon size={16} />
                          {formatValue(providerProfile.aadhaar_gender)}
                        </div>
                      </div>
                    )}

                    {providerProfile.aadhaar_address && (
                      <div className="form-group full-width">
                        <label>Aadhaar Address</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Home size={16} style={{ marginTop: '2px' }} />
                          {formatValue(providerProfile.aadhaar_address)}
                        </div>
                      </div>
                    )}

                    {/* Skills and Qualifications */}
                    {providerProfile.qualifications && providerProfile.qualifications.length > 0 && (
                      <div className="form-group full-width">
                        <label>Qualifications</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {providerProfile.qualifications.map((qualification, index) => (
                              <span key={index} style={{ 
                                padding: '4px 8px', 
                                backgroundColor: '#e2e8f0', 
                                borderRadius: '6px', 
                                fontSize: '0.875rem',
                                color: '#475569'
                              }}>
                                {qualification}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {providerProfile.certifications && providerProfile.certifications.length > 0 && (
                      <div className="form-group full-width">
                        <label>Certifications</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {providerProfile.certifications.map((certification, index) => (
                              <span key={index} style={{ 
                                padding: '4px 8px', 
                                backgroundColor: '#dbeafe', 
                                borderRadius: '6px', 
                                fontSize: '0.875rem',
                                color: '#1e40af'
                              }}>
                                {certification}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {providerProfile.languages && providerProfile.languages.length > 0 && (
                      <div className="form-group full-width">
                        <label>Languages</label>
                        <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {providerProfile.languages.map((language, index) => (
                              <span key={index} style={{ 
                                padding: '4px 8px', 
                                backgroundColor: '#f0fdf4', 
                                borderRadius: '6px', 
                                fontSize: '0.875rem',
                                color: '#166534'
                              }}>
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <Briefcase size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                    <h4 style={{ color: '#64748b', marginBottom: '8px' }}>No Provider Profile Found</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      This service provider hasn't completed their professional profile yet.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminUserProfile;