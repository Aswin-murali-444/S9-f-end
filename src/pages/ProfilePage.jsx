import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, navigate, user]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // First try to get profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Set profile data, falling back to auth user data
      const profileInfo = {
        full_name: profileData?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        email: user?.email || '',
        phone: profileData?.phone || user?.user_metadata?.phone || '',
        address: profileData?.address || '',
        bio: profileData?.bio || ''
      };

      setProfile(profileInfo);
      setOriginalProfile(profileInfo);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Update or insert profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update auth user metadata if name changed
      if (profile.full_name !== originalProfile.full_name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: profile.full_name }
        });

        if (authError) {
          console.error('Error updating auth metadata:', authError);
        }
      }

      setOriginalProfile(profile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    // Redirect handled centrally in logout()
  };

  if (loading && !profile.email) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h1>My Profile</h1>
          <div className="profile-actions">
            {!isEditing ? (
              <>
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Edit3 size={20} />
                  Edit Profile
                </button>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save size={20} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X size={20} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-field">
            <label>
              <User size={20} />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            ) : (
              <p>{profile.full_name || 'Not provided'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>
              <Mail size={20} />
              Email
            </label>
            <p className="email-field">{profile.email}</p>
            <small>Email cannot be changed here</small>
          </div>

          <div className="profile-field">
            <label>
              <Phone size={20} />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            ) : (
              <p>{profile.phone || 'Not provided'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>
              <MapPin size={20} />
              Address
            </label>
            {isEditing ? (
              <textarea
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                rows="3"
              />
            ) : (
              <p>{profile.address || 'Not provided'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>
              <Calendar size={20} />
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself"
                rows="4"
              />
            ) : (
              <p>{profile.bio || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="profile-footer">
          <small>
            Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 