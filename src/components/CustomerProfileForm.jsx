import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth, supabase } from '../hooks/useAuth';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

// Form to complete/update user_profiles for the current customer
const CustomerProfileForm = () => {
  const { user, refreshUserData } = useAuth();

  const initialState = useMemo(() => ({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    profile_picture_url: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    // Optional location fields saved with address
    location_latitude: null,
    location_longitude: null,
    location_accuracy_m: null
  }), []);

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [usersRowId, setUsersRowId] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [pinLookupMessage, setPinLookupMessage] = useState('');
  const [geolocating, setGeolocating] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState('');
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null); // { lat, lon, accuracy, timestamp }
  const [locationError, setLocationError] = useState('');
  const watchIdRef = useRef(null);

  // Google Maps API Key (prefer env/window, fallback to provided key)
  const GOOGLE_MAPS_API_KEY = (typeof window !== 'undefined' && window.GOOGLE_MAPS_API_KEY)
    || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
    || 'AIzaSyCoPzRJLAmma54BBOyF4AhZ2ZIqGvak8CA';

  const extractAddressFromComponents = (components) => {
    const get = (type) => {
      const comp = components.find(c => c.types.includes(type));
      return comp ? comp.long_name : '';
    };
    const streetNumber = get('street_number');
    const route = get('route');
    const address = [streetNumber, route].filter(Boolean).join(' ') || get('premise') || get('subpremise') || '';
    const city = get('locality') || get('sublocality') || get('administrative_area_level_2') || '';
    const state = get('administrative_area_level_1') || '';
    const country = get('country') || '';
    const postal = get('postal_code') || '';
    return { address, city, state, country, postal_code: postal };
  };

  const reverseGeocode = async (lat, lng) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error(data.error_message || 'Geocoding failed');
    }
    // Prefer ROOFTOP or street_address result when available
    const prioritized = data.results.find(r => r.geometry?.location_type === 'ROOFTOP')
      || data.results.find(r => r.types?.includes('street_address'))
      || data.results[0];
    const parts = extractAddressFromComponents(prioritized.address_components || []);
    return parts;
  };

  const handleUseCurrentLocation = async () => {
    setGeocodeMessage('');
    if (!navigator.geolocation) {
      setGeocodeMessage('Geolocation not supported');
      return;
    }
    setGeolocating(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      const parts = await reverseGeocode(latitude, longitude);
      setForm(prev => ({
        ...prev,
        address: parts.address || prev.address,
        city: parts.city || prev.city,
        state: parts.state || prev.state,
        country: parts.country || prev.country,
        postal_code: parts.postal_code || prev.postal_code,
      }));
      // Mark fields as touched to re-validate
      setTouched(prev => ({ ...prev, address: true, city: true, state: true, country: true, postal_code: true }));
      setGeocodeMessage('Address auto-filled from current location');
    } catch (e) {
      setGeocodeMessage('Unable to fetch address from location');
    } finally {
      setGeolocating(false);
    }
  };

  // One-click detect to preview current location on map (no autofill yet)
  const handleDetectLocation = async () => {
    setLocationError('');
    setGeocodeMessage('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    setGeolocating(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const { latitude, longitude, accuracy } = pos.coords;
      setCurrentCoords({ lat: latitude, lon: longitude, accuracy, timestamp: pos.timestamp });
      // Also fetch address immediately and populate the form
      try {
        const parts = await reverseGeocode(latitude, longitude);
        setForm(prev => ({
          ...prev,
          address: parts.address ? `${parts.address} (lat ${latitude.toFixed(6)}, lon ${longitude.toFixed(6)})` : prev.address,
          city: parts.city || prev.city,
          state: parts.state || prev.state,
          country: parts.country || prev.country,
          postal_code: parts.postal_code || prev.postal_code,
          location_latitude: latitude,
          location_longitude: longitude,
          location_accuracy_m: accuracy,
        }));
        setTouched(prev => ({ ...prev, address: true, city: true, state: true, country: true, postal_code: true }));
        setGeocodeMessage('Address auto-filled from current location');
      } catch (_) {
        setGeocodeMessage('Located point. Could not fetch address');
      }
    } catch (e) {
      setLocationError('Unable to fetch location');
    } finally {
      setGeolocating(false);
    }
  };

  // Live location tracking (stream)
  const startWatchingLocation = () => {
    setLocationError('');
    if (!navigator.geolocation || isWatchingLocation) return;
    try {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCurrentCoords({ lat: latitude, lon: longitude, accuracy, timestamp: pos.timestamp });
        },
        (err) => {
          setLocationError(err?.message || 'Unable to fetch live location');
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
      watchIdRef.current = id;
      setIsWatchingLocation(true);
    } catch (e) {
      setLocationError('Live location not available');
    }
  };

  const stopWatchingLocation = () => {
    try {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    } catch (_) {}
    setIsWatchingLocation(false);
  };

  const handleFillFromCurrentPoint = async () => {
    if (!currentCoords) return;
    try {
      setGeolocating(true);
      const parts = await reverseGeocode(currentCoords.lat, currentCoords.lon);
      setForm(prev => ({
        ...prev,
        address: parts.address ? `${parts.address} (lat ${currentCoords.lat.toFixed(6)}, lon ${currentCoords.lon.toFixed(6)})` : prev.address,
        city: parts.city || prev.city,
        state: parts.state || prev.state,
        country: parts.country || prev.country,
        postal_code: parts.postal_code || prev.postal_code,
        location_latitude: currentCoords.lat,
        location_longitude: currentCoords.lon,
        location_accuracy_m: currentCoords.accuracy,
      }));
      setTouched(prev => ({ ...prev, address: true, city: true, state: true, country: true, postal_code: true }));
      setGeocodeMessage('Address filled from live point');
    } catch (e) {
      setGeocodeMessage('Could not convert live point to address');
    } finally {
      setGeolocating(false);
    }
  };

  // Build a keyless OpenStreetMap embed around the current point (fallback is very reliable)
  const embedMapUrl = currentCoords ? (() => {
    const delta = 0.002; // ~200-300m window
    const left = (currentCoords.lon - delta).toFixed(6);
    const bottom = (currentCoords.lat - delta).toFixed(6);
    const right = (currentCoords.lon + delta).toFixed(6);
    const top = (currentCoords.lat + delta).toFixed(6);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${currentCoords.lat.toFixed(6)},${currentCoords.lon.toFixed(6)}`;
  })() : null;

  // Keep form's location_* fields in sync whenever we have live coordinates
  useEffect(() => {
    if (!currentCoords) return;
    setForm(prev => ({
      ...prev,
      location_latitude: currentCoords.lat,
      location_longitude: currentCoords.lon,
      location_accuracy_m: currentCoords.accuracy,
    }));
  }, [currentCoords]);

  // Max DOB (must be at least 18 years old)
  const maxDob = useMemo(() => {
    const now = new Date();
    const dt = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    return dt.toISOString().split('T')[0];
  }, []);

  // Live field-level validation
  const validateField = (fieldName, rawValue) => {
    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    switch (fieldName) {
      case 'first_name': {
        if (!value) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        if (!/^[A-Za-z\s\-']+$/.test(value)) return 'First name can contain letters, spaces, - and \' characters only';
        return undefined;
      }
      case 'last_name': {
        if (!value) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
        if (!/^[A-Za-z\s\-']+$/.test(value)) return 'Last name can contain letters, spaces, - and \' characters only';
        return undefined;
      }
      case 'phone': {
        if (!value) return 'Phone number is required';
        // Allow digits, space, hyphen, parentheses, and optional leading plus
        if (/[^0-9+\-\s()]/.test(value)) return 'Only numbers, spaces, (), - and + allowed';
        const plusCount = (value.match(/\+/g) || []).length;
        if (plusCount > 1 || (plusCount === 1 && !String(value).trim().startsWith('+'))) {
          return 'Plus sign is only allowed at the start';
        }
        const digitCount = (String(value).match(/\d/g) || []).length;
        if (digitCount < 10) return 'Enter at least 10 digits';
        if (digitCount > 15) return 'Enter at most 15 digits';
        // If starts with +, enforce basic E.164 shape
        if (String(value).trim().startsWith('+')) {
          const e164 = String(value).replace(/[^\d+]/g, '');
          if (!/^\+[1-9]\d{9,14}$/.test(e164)) {
            return 'Enter a valid international number, e.g. +14155552671';
          }
        }
        return undefined;
      }
      case 'date_of_birth': {
        if (!value) return undefined; // optional
        const dob = new Date(value);
        const now = new Date();
        if (isNaN(dob.getTime())) return 'Enter a valid date of birth';
        if (dob > now) return 'Date of birth cannot be in the future';
        // Minimum age 18
        const minAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
        if (dob > minAge) return 'You must be at least 18 years old';
        return undefined;
      }
      case 'gender': {
        if (!value) return undefined; // optional
        const allowed = ['male', 'female', 'other', 'prefer_not_to_say'];
        if (!allowed.includes(String(value))) return 'Invalid gender value';
        return undefined;
      }
      case 'address':
      case 'city':
      case 'state': {
        if (!value) return undefined; // optional
        if (String(value).length > 200) return 'Too long (max 200 characters)';
        return undefined;
      }
      case 'country': {
        if (!value) return undefined; // optional
        if (!/^[A-Za-z\s\-]{2,}$/.test(value)) return 'Enter a valid country name';
        return undefined;
      }
      case 'postal_code': {
        if (!value) return undefined; // optional
        if (!/^[A-Za-z0-9\s\-]{3,10}$/.test(value)) return 'Enter a valid postal code';
        return undefined;
      }
      case 'bio': {
        if (!value) return undefined; // optional
        if (String(value).length > 500) return 'Bio is too long (max 500 characters)';
        return undefined;
      }
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Fetch the corresponding users row (to get numeric/uuid users.id)
        const { data, error } = await supabase
          .from('users')
          .select(`id, user_profiles (* )`)
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.warn('Failed to fetch users row:', error.message);
          return;
        }

        if (data?.id) setUsersRowId(data.id);

        const profile = data?.user_profiles || {};
        setForm(prev => ({
          ...prev,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          date_of_birth: profile.date_of_birth || '',
          gender: profile.gender || '',
          profile_picture_url: profile.profile_picture_url || '',
          bio: profile.bio || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          postal_code: profile.postal_code || '',
          location_latitude: profile.location_latitude ?? null,
          location_longitude: profile.location_longitude ?? null,
          location_accuracy_m: profile.location_accuracy_m ?? null
        }));
        if (profile.profile_picture_url) {
          setProfileImagePreviewUrl(profile.profile_picture_url);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, initialState]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Mark as touched on first change to enable live validation UX
    setTouched(prev => ({ ...prev, [key]: true }));
    // Validate this field immediately
    const fieldError = validateField(key, value);
    setValidationErrors(prev => ({ ...prev, [key]: fieldError }));
  };

  // Debounced PIN (Indian PIN code) lookup to auto-fill location fields
  useEffect(() => {
    const rawPin = String(form.postal_code || '').trim();
    // Validate Indian PIN (6 digits, cannot start with 0)
    const isValidIndianPin = /^[1-9][0-9]{5}$/.test(rawPin);
    if (!isValidIndianPin) {
      setPinLookupMessage('');
      return;
    }

    let didCancel = false;
    const timer = setTimeout(async () => {
      try {
        setPinLookupLoading(true);
        setPinLookupMessage('');
        const res = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(rawPin)}`);
        const data = await res.json();
        const entry = Array.isArray(data) ? data[0] : null;
        if (!entry || entry.Status !== 'Success' || !Array.isArray(entry.PostOffice) || entry.PostOffice.length === 0) {
          if (!didCancel) setPinLookupMessage('PIN not found');
          return;
        }
        const po = entry.PostOffice[0];
        const derivedCity = po.District || po.Division || po.Name || '';
        const derivedState = po.State || '';
        const derivedCountry = po.Country || 'India';
        if (!didCancel) {
          setForm(prev => ({
            ...prev,
            city: derivedCity || prev.city,
            state: derivedState || prev.state,
            country: derivedCountry || prev.country,
          }));
          // Clear any validation errors for these fields after autofill
          setValidationErrors(prev => ({
            ...prev,
            city: undefined,
            state: undefined,
            country: undefined,
          }));
          setPinLookupMessage('Place auto-filled from PIN');
        }
      } catch (e) {
        if (!didCancel) setPinLookupMessage('Could not fetch place for PIN');
      } finally {
        if (!didCancel) setPinLookupLoading(false);
      }
    }, 500); // debounce 500ms

    return () => {
      didCancel = true;
      clearTimeout(timer);
    };
  }, [form.postal_code]);

  const validateForm = () => {
    const errors = {};

    if (!form.first_name || form.first_name.trim().length < 2) {
      errors.first_name = 'First name is required';
    }
    if (!form.last_name || form.last_name.trim().length < 2) {
      errors.last_name = 'Last name is required';
    }
    if (!form.phone || !/^\+?[0-9\-\s()]{7,15}$/.test(form.phone.trim())) {
      errors.phone = 'Enter a valid phone number';
    }
    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      const now = new Date();
      if (isNaN(dob.getTime()) || dob > now) {
        errors.date_of_birth = 'Enter a valid date of birth';
      }
    }
    if (profileImageFile) {
      const maxBytes = 3 * 1024 * 1024; // 3MB
      if (!profileImageFile.type.startsWith('image/')) {
        errors.profile_picture = 'Only image files are allowed';
      } else if (profileImageFile.size > maxBytes) {
        errors.profile_picture = 'Image must be 3MB or smaller';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!usersRowId) {
      toast.error('User record not initialized yet. Please try again.');
      return;
    }

    // Validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTouched(prev => ({ ...prev, first_name: true, last_name: true, phone: true, date_of_birth: true, profile_picture: true }));
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      setLoading(true);
      let uploadedImageUrl = form.profile_picture_url || '';

      // Handle image upload if a new file was selected
      if (profileImageFile) {
        try {
          const { publicUrl, path } = await apiService.uploadProfilePicture(profileImageFile, user.id);
          uploadedImageUrl = publicUrl || path || '';
          try {
            const { error: metaErr } = await supabase.auth.updateUser({
              data: { avatar_url: uploadedImageUrl }
            });
            if (metaErr) {
              console.warn('Failed to update user metadata avatar_url:', metaErr.message);
            } else {
              // Refresh user data to update the UI immediately
              await refreshUserData();
            }
          } catch (e) {
            console.warn('Error updating user metadata avatar_url:', e?.message);
          }
          setProfileImagePreviewUrl(uploadedImageUrl);
        } catch (uploadErr) {
          console.warn('Profile image upload failed:', uploadErr?.message || uploadErr);
          toast.error(`Failed to upload profile picture: ${uploadErr?.message || 'Upload error'}`);
        }
      }

      // Compute completion status (bio and profile picture are optional; all others required)
      const requiredFilled = [
        form.first_name,
        form.last_name,
        form.phone,
        form.date_of_birth,
        form.gender,
        form.address,
        form.city,
        form.state,
        form.country,
        form.postal_code,
      ].every(Boolean);

      const payloadBase = {
        id: usersRowId,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        profile_picture_url: uploadedImageUrl || form.profile_picture_url || null,
        bio: form.bio || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        postal_code: form.postal_code || null,
        location_latitude: form.location_latitude ?? null,
        location_longitude: form.location_longitude ?? null,
        location_accuracy_m: form.location_accuracy_m ?? null,
        updated_at: new Date().toISOString()
      };

      // Try with completion status fields if column exists
      let upsertError = null;
      let triedWithStatus = false;
      {
        const payloadWithStatus = {
          ...payloadBase,
          profile_complete: requiredFilled ? true : false,
          completion_status: requiredFilled ? 'complete' : 'incomplete'
        };
        triedWithStatus = true;
        const { error } = await supabase
          .from('user_profiles')
          .upsert(payloadWithStatus, { onConflict: 'id' });
        upsertError = error || null;
      }

      if (upsertError) {
        // Fallback without status fields (for schemas without these columns)
        const { error: fallbackError } = await supabase
          .from('user_profiles')
          .upsert(payloadBase, { onConflict: 'id' });
        if (fallbackError) {
          console.error('Upsert profile failed:', fallbackError);
          toast.error('Failed to save profile');
          return;
        }
      }

      // Ensure location columns are explicitly persisted (handles cases where upsert ignores unchanged values)
      try {
        const { error: locErr } = await supabase
          .from('user_profiles')
          .update({
            location_latitude: form.location_latitude ?? null,
            location_longitude: form.location_longitude ?? null,
            location_accuracy_m: form.location_accuracy_m ?? null,
            updated_at: new Date().toISOString()
          })
          .eq('id', usersRowId);
        if (locErr) {
          console.warn('Location fields update failed:', locErr.message);
        }
      } catch (e) {
        console.warn('Location fields update failed:', e?.message);
      }

      // Also reflect completion status in user_logins (if this table exists)
      try {
        const statusPayload = {
          profile_complete: requiredFilled ? true : false,
          completion_status: requiredFilled ? 'complete' : 'incomplete',
          status: requiredFilled ? 'complete' : 'incomplete',
          updated_at: new Date().toISOString()
        };
        await supabase
          .from('user_logins')
          .update(statusPayload)
          .eq('user_id', usersRowId);
      } catch (e) {
        console.warn('Could not update user_logins status:', e?.message);
      }

      toast.success('Profile saved');
      if (!requiredFilled) {
        toast('Profile incomplete. Please fill all required fields.', { icon: '⚠️' });
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-profile-form">
      <div className="card-header">
        <h4>Complete Your Profile</h4>
      </div>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, first_name: true }))}
              placeholder="Enter first name"
              required
              aria-invalid={Boolean(touched.first_name && validationErrors.first_name)}
              className={touched.first_name && validationErrors.first_name ? 'has-error' : undefined}
            />
            {touched.first_name && validationErrors.first_name && (
              <small className="error-text">{validationErrors.first_name}</small>
            )}
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, last_name: true }))}
              placeholder="Enter last name"
              required
              aria-invalid={Boolean(touched.last_name && validationErrors.last_name)}
              className={touched.last_name && validationErrors.last_name ? 'has-error' : undefined}
            />
            {touched.last_name && validationErrors.last_name && (
              <small className="error-text">{validationErrors.last_name}</small>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
              placeholder="Enter phone number"
              required
              aria-invalid={Boolean(touched.phone && validationErrors.phone)}
              className={touched.phone && validationErrors.phone ? 'has-error' : undefined}
            />
            {touched.phone && validationErrors.phone && (
              <small className="error-text">{validationErrors.phone}</small>
            )}
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={form.date_of_birth || ''}
              onChange={(e) => updateField('date_of_birth', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, date_of_birth: true }))}
              max={maxDob}
              aria-invalid={Boolean(touched.date_of_birth && validationErrors.date_of_birth)}
              className={touched.date_of_birth && validationErrors.date_of_birth ? 'has-error' : undefined}
            />
            {touched.date_of_birth && validationErrors.date_of_birth && (
              <small className="error-text">{validationErrors.date_of_birth}</small>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>
            <select
              value={form.gender || ''}
              onChange={(e) => updateField('gender', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, gender: true }))}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          <div className="form-group">
            <label>Profile Picture</label>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProfileImageFile(file);
                  const preview = URL.createObjectURL(file);
                  setProfileImagePreviewUrl(preview);
                  // Validate image immediately
                  const maxBytes = 3 * 1024 * 1024;
                  let imgErr;
                  if (!file.type.startsWith('image/')) imgErr = 'Only image files are allowed';
                  else if (file.size > maxBytes) imgErr = 'Image must be 3MB or smaller';
                  setTouched(prev => ({ ...prev, profile_picture: true }));
                  setValidationErrors(prev => ({ ...prev, profile_picture: imgErr }));
                }
              }}
              onBlur={() => setTouched(prev => ({ ...prev, profile_picture: true }))}
              aria-invalid={Boolean(touched.profile_picture && validationErrors.profile_picture)}
              className={touched.profile_picture && validationErrors.profile_picture ? 'has-error' : undefined}
            />
            {touched.profile_picture && validationErrors.profile_picture && (
              <small className="error-text">{validationErrors.profile_picture}</small>
            )}
            {profileImagePreviewUrl ? (
              <div style={{ marginTop: 8 }}>
                <img src={profileImagePreviewUrl} alt="Preview" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            rows="3"
            value={form.bio || ''}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <label style={{ marginBottom: 0 }}>Address</label>
            <button type="button" className="btn-secondary" onClick={handleDetectLocation} disabled={geolocating}>
              {geolocating ? 'Detecting…' : 'Detect Current Location'}
            </button>
          </div>
          <input
            type="text"
            value={form.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Street address"
          />
          {currentCoords && (
            <div style={{ marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#f8fafc' }}>
              <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, color: '#475569' }}>
                  Lat: {currentCoords.lat.toFixed(6)} • Lon: {currentCoords.lon.toFixed(6)} • ±{Math.round(currentCoords.accuracy)}m
                </div>
                <div style={{ fontSize: 12 }}>
                  <a
                    href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                {embedMapUrl ? (
                  <iframe
                    title="Map preview"
                    src={embedMapUrl}
                    width="100%"
                    height="240"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : null}
              </div>
              {locationError && (
                <div style={{ padding: 8 }}>
                  <small className="error-text">{locationError}</small>
                </div>
              )}
            </div>
          )}
          {!geolocating && geocodeMessage && (
            <small className="helper-text">{geocodeMessage}</small>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={form.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={form.state || ''}
              onChange={(e) => updateField('state', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              value={form.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              value={form.postal_code || ''}
              onChange={(e) => updateField('postal_code', e.target.value)}
            />
            {pinLookupLoading && (
              <small className="helper-text">Looking up PIN…</small>
            )}
            {!pinLookupLoading && pinLookupMessage && (
              <small className="helper-text">{pinLookupMessage}</small>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfileForm;


