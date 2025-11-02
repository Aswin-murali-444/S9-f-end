import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Save,
  Camera,
  Building,
  Award,
  Clock,
  DollarSign,
  Plus,
  Tag,
  Settings,
  Navigation,
  Loader2,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './ProfileCompletionModal.css';

const ProfileCompletionModal = ({ isOpen, onClose, onComplete, user, onProfileUpdated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Location-related state
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const watchIdRef = useRef(null);
  
  // Aadhaar extraction state
  const [isExtractingAadhaar, setIsExtractingAadhaar] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ front: false, back: false });
  const [uploadedFiles, setUploadedFiles] = useState({ front: null, back: null });
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [manualAadhaarEntry, setManualAadhaarEntry] = useState(false);
  
  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = (typeof window !== 'undefined' && window.GOOGLE_MAPS_API_KEY)
    || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
    || 'AIzaSyCoPzRJLAmma54BBOyF4AhZ2ZIqGvak8CA';

  // Aadhaar Extraction API configuration (robust fallback to dev proxy)
  const API_BASE = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) || '';
  const NORMALIZED_API_BASE = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
  const AADHAAR_API_URL = NORMALIZED_API_BASE
    ? `${NORMALIZED_API_BASE}/api/aadhaar/extract`
    : 'http://localhost:3001/api/aadhaar/extract';
  const AADHAAR_BOTH_API_URL = NORMALIZED_API_BASE
    ? `${NORMALIZED_API_BASE}/api/aadhaar/extract-both`
    : 'http://localhost:3001/api/aadhaar/extract-both';

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Location utility functions
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
    return { address, city, state, country, pincode: postal };
  };

  const reverseGeocode = async (lat, lng) => {
    // 1) Try Google Geocoding API (if key allows it)
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log('Geocoding response (Google):', data);
      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        const prioritized = data.results.find(r => r.geometry?.location_type === 'ROOFTOP')
          || data.results.find(r => r.types?.includes('street_address'))
          || data.results.find(r => r.types?.includes('premise'))
          || data.results.find(r => r.types?.includes('subpremise'))
          || data.results[0];
        const parts = extractAddressFromComponents(prioritized.address_components || []);
        return parts;
      }
      // If Google responds with an error like referer restriction, fall through to OSM
      console.warn('Google geocoding did not return usable results, falling back to OSM');
    } catch (googleErr) {
      console.warn('Google geocoding failed, falling back to OSM:', googleErr);
    }

    // 2) Fallback: OpenStreetMap Nominatim (no API key, generous limits for light usage)
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(osmUrl, {
        headers: {
          // Nominatim requests a valid User-Agent / Referer per policy
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      console.log('Geocoding response (OSM):', data);
      const addr = data?.address || {};
      const parts = {
        address: [addr.house_number, addr.road].filter(Boolean).join(' ') || addr.neighbourhood || addr.suburb || '',
        city: addr.city || addr.town || addr.village || addr.district || addr.county || '',
        state: addr.state || '',
        country: addr.country || '',
        pincode: addr.postcode || ''
      };
      return parts;
    } catch (osmErr) {
      console.error('Reverse geocoding fallback (OSM) failed:', osmErr);
      throw osmErr;
    }
  };

  const fetchLocationFromPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    
    setIsPincodeLoading(true);
    setLocationError('');
    setLocationMessage('');
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
        const postOffice = data[0].PostOffice[0];
        
        // Try to get coordinates using Google Geocoding API
        let coordinates = null;
        try {
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pincode + ', India')}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            coordinates = {
              lat: location.lat,
              lng: location.lng
            };
          }
        } catch (geocodeError) {
          console.warn('Failed to get coordinates for pincode:', geocodeError);
        }
        
        setFormData(prev => ({
          ...prev,
          city: postOffice.District || prev.city,
          state: postOffice.State || prev.state,
          address: prev.address || `${postOffice.Name}, ${postOffice.District}`,
          location_latitude: coordinates ? coordinates.lat : prev.location_latitude,
          location_longitude: coordinates ? coordinates.lng : prev.location_longitude,
        }));
        
        if (coordinates) {
          setLocationMessage(`Location details fetched from pincode (coordinates: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`);
        } else {
          setLocationMessage('Location details fetched from pincode');
        }
      } else {
        setLocationError('Invalid pincode or location not found');
      }
    } catch (error) {
      console.error('Pincode lookup error:', error);
      setLocationError('Failed to fetch location from pincode');
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocationError('');
    setLocationMessage('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser');
      return;
    }
    
    // Check if permissions API is available
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setLocationError('Location permission denied. Please enable location access in your browser settings and refresh the page.');
          return;
        }
      } catch (e) {
        console.log('Permissions API not supported');
      }
    }
    
    setIsGeolocating(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          { 
            enableHighAccuracy: true, 
            timeout: 15000,
            maximumAge: 300000 
          }
        );
      });
      
      const { latitude, longitude } = pos.coords;
      setCurrentCoords({ lat: latitude, lon: longitude });
      
      try {
        const parts = await reverseGeocode(latitude, longitude);
        
        // Update form data with fetched location details
        setFormData(prev => ({
          ...prev,
          address: parts.address || prev.address,
          city: parts.city || prev.city,
          state: parts.state || prev.state,
          pincode: parts.pincode || prev.pincode,
          location_latitude: latitude,
          location_longitude: longitude,
        }));
        
        // Show success message with details
        const locationDetails = [];
        if (parts.city) locationDetails.push(parts.city);
        if (parts.state) locationDetails.push(parts.state);
        if (parts.pincode) locationDetails.push(parts.pincode);
        
        if (locationDetails.length > 0) {
          setLocationMessage(`Location details fetched: ${locationDetails.join(', ')} (coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
        } else {
          setLocationMessage(`Location detected (coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}). Please enter your address details manually.`);
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding failed:', geocodeError);
        setLocationMessage(`Location detected (coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}) but unable to fetch address details. Please enter your address manually.`);
        // Still set coordinates for map viewing and form data
        setFormData(prev => ({
          ...prev,
          location_latitude: latitude,
          location_longitude: longitude,
        }));
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Unable to fetch your current location.';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please click "Allow" when prompted for location access, or enable location permission in your browser settings.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your internet connection and GPS signal.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again or check your GPS signal.';
      } else if (error.message && error.message.includes('Geocoding failed')) {
        errorMessage = 'Location detected but unable to fetch address details. Please try again or enter your address manually.';
      } else if (error.message && error.message.includes('No location data found')) {
        errorMessage = 'Location detected but no address data available. Please enter your address manually.';
      }
      
      setLocationError(errorMessage);
    } finally {
      setIsGeolocating(false);
    }
  };

  // Aadhaar extraction function using actual API
  const extractAadhaarDetails = async (file, side) => {
    try {
      console.log(`Extracting Aadhaar details from ${side} side:`, file);
      
      // Set loading state
      setIsExtractingAadhaar(true);
      setExtractionProgress(prev => ({ ...prev, [side]: true }));
      setLocationError('');
      setLocationMessage('');
      
      // Use backend proxy for Aadhaar extraction
      const formData = new FormData();
      formData.append('image', file);
      formData.append('side', side);
      
      console.log('Calling backend Aadhaar API:', AADHAAR_API_URL);
      
      const response = await fetch(AADHAAR_API_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Use the specific error message from the backend if available
        const errorMessage = errorData.error || `API request failed: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      console.log('API response status:', response.status);
      
      const result = await response.json();
      console.log('Aadhaar extraction response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Extraction failed');
      }
      
      const extractedData = result.data;
      
      // Format date if only year is provided
      let formattedDob = extractedData.dob;
      if (formattedDob && /^\d{4}$/.test(formattedDob.trim())) {
        // If only year is provided, set to January 1st of that year
        formattedDob = `01/01/${formattedDob.trim()}`;
      } else if (formattedDob && /^\d{2}\/\d{2}\/\d{4}$/.test(formattedDob.trim())) {
        // If date is in DD/MM/YYYY format, keep as is
        formattedDob = formattedDob.trim();
      } else if (formattedDob && /^\d{4}-\d{2}-\d{2}$/.test(formattedDob.trim())) {
        // If date is in YYYY-MM-DD format, convert to DD/MM/YYYY
        const [year, month, day] = formattedDob.trim().split('-');
        formattedDob = `${day}/${month}/${year}`;
      }

      // Process address to ensure it's properly formatted
      let formattedAddress = extractedData.address;
      if (formattedAddress) {
        // Remove extra whitespace and normalize line breaks
        formattedAddress = formattedAddress
          .replace(/\s+/g, ' ')
          .replace(/[\n\r]+/g, ', ')
          .trim();
      }
      
      // Format Aadhaar number with proper spacing
      let formattedAadhaar = extractedData.aadhaar_number;
      if (formattedAadhaar) {
        // Remove any existing spaces first
        formattedAadhaar = formattedAadhaar.replace(/\s+/g, '');
        // Add spaces in XXXX XXXX XXXX format
        formattedAadhaar = formattedAadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
      }

      // Update form data with extracted details
      setFormData(prev => ({
        ...prev,
        aadhaar_number: formattedAadhaar || prev.aadhaar_number,
        aadhaar_name: extractedData.name || prev.aadhaar_name,
        aadhaar_dob: formattedDob || prev.aadhaar_dob,
        aadhaar_gender: extractedData.gender || prev.aadhaar_gender,
        aadhaar_address: formattedAddress || prev.aadhaar_address,
      }));
      
      // Show success message with extracted details
      const extractedFields = [];
      if (extractedData.aadhaar_number) extractedFields.push('Aadhaar Number');
      if (extractedData.name) extractedFields.push('Name');
      if (extractedData.dob) extractedFields.push('Date of Birth');
      if (extractedData.gender) extractedFields.push('Gender');
      if (extractedData.address) extractedFields.push('Address');
      
      if (extractedFields.length > 0) {
        setLocationMessage(`Aadhaar ${side} side processed successfully. Extracted: ${extractedFields.join(', ')}`);
      } else {
        setLocationMessage(`Aadhaar ${side} side processed but no details could be extracted. Please try again.`);
      }
      
    } catch (error) {
      console.error('Aadhaar extraction error:', error);
      console.log('Error message:', error.message);
      let errorMessage = `Failed to extract details from Aadhaar ${side} side.`;
      
      if (error.message.includes('Payment required') || error.message.includes('Payment Required') || error.message.includes('OpenRouter account requires payment')) {
        if (error.message.includes('OpenRouter account requires payment')) {
          errorMessage = 'OpenRouter account requires payment. Please add credits to your OpenRouter account or enter your details manually below.';
          setLocationMessage('💡 You can add credits to your OpenRouter account or manually fill in your Aadhaar details in the form fields.');
        } else {
          errorMessage = 'Aadhaar extraction service requires payment. Please enter your details manually below.';
          setLocationMessage('💡 You can manually fill in your Aadhaar details in the form fields.');
        }
        setManualAadhaarEntry(true);
      } else if (error.message.includes('not configured') || error.message.includes('not properly configured') || error.message.includes('OpenRouter API key is not configured')) {
        errorMessage = 'Aadhaar extraction service is not configured. Please enter your details manually below.';
        setLocationMessage('💡 You can manually fill in your Aadhaar details in the form fields.');
        setManualAadhaarEntry(true);
      } else if (error.message.includes('API request failed')) {
        errorMessage += ' Please check your internet connection and try again.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage += ' API authentication failed. Please contact support.';
      } else if (error.message.includes('413')) {
        errorMessage += ' File size too large. Please use a smaller image.';
      } else if (error.message.includes('415')) {
        errorMessage += ' Invalid file format. Please upload a valid image file.';
      }
      
      setLocationError(errorMessage);
      if (!error.message.includes('Payment required') && !error.message.includes('Payment Required') && 
          !error.message.includes('OpenRouter account requires payment') &&
          !error.message.includes('not configured') && !error.message.includes('not properly configured') && 
          !error.message.includes('OpenRouter API key is not configured')) {
        setLocationMessage('');
      }
      
    } finally {
      // Clear loading state
      setIsExtractingAadhaar(false);
      setExtractionProgress(prev => ({ ...prev, [side]: false }));
    }
  };

  // Combined extraction for better accuracy (front + back together)
  const extractAadhaarBoth = async (frontFile, backFile) => {
    try {
      setIsExtractingAadhaar(true);
      setExtractionProgress({ front: true, back: true });
      setLocationError('');
      setLocationMessage('');

      const formData = new FormData();
      formData.append('front', frontFile);
      formData.append('back', backFile);

      console.log('Calling backend Aadhaar BOTH API:', AADHAAR_BOTH_API_URL);
      const response = await fetch(AADHAAR_BOTH_API_URL, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Use the specific error message from the backend if available
        const errorMessage = errorData.error || `API request failed: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Combined extraction failed');
      }

      const extracted = result.data || {};

      // Format date if only year is provided
      let formattedDob = extracted.dob;
      if (formattedDob && /^\d{4}$/.test(formattedDob.trim())) {
        // If only year is provided, set to January 1st of that year
        formattedDob = `01/01/${formattedDob.trim()}`;
      } else if (formattedDob && /^\d{2}\/\d{2}\/\d{4}$/.test(formattedDob.trim())) {
        // If date is in DD/MM/YYYY format, keep as is
        formattedDob = formattedDob.trim();
      } else if (formattedDob && /^\d{4}-\d{2}-\d{2}$/.test(formattedDob.trim())) {
        // If date is in YYYY-MM-DD format, convert to DD/MM/YYYY
        const [year, month, day] = formattedDob.trim().split('-');
        formattedDob = `${day}/${month}/${year}`;
      }

      // Process address to ensure it's properly formatted
      let formattedAddress = extracted.address;
      if (formattedAddress) {
        // Remove extra whitespace and normalize line breaks
        formattedAddress = formattedAddress
          .replace(/\s+/g, ' ')
          .replace(/[\n\r]+/g, ', ')
          .trim();
      }

      // Format Aadhaar number with proper spacing
      let formattedAadhaar = extracted.aadhaar_number;
      if (formattedAadhaar) {
        // Remove any existing spaces first
        formattedAadhaar = formattedAadhaar.replace(/\s+/g, '');
        // Add spaces in XXXX XXXX XXXX format
        formattedAadhaar = formattedAadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
      }

      setFormData(prev => ({
        ...prev,
        aadhaar_number: formattedAadhaar || prev.aadhaar_number,
        aadhaar_name: extracted.name || prev.aadhaar_name,
        aadhaar_dob: formattedDob || prev.aadhaar_dob,
        aadhaar_gender: extracted.gender || prev.aadhaar_gender,
        aadhaar_address: formattedAddress || prev.aadhaar_address,
      }));

      const fields = [];
      if (extracted.aadhaar_number) fields.push('Aadhaar Number');
      if (extracted.name) fields.push('Name');
      if (extracted.dob) fields.push('Date of Birth');
      if (extracted.gender) fields.push('Gender');
      if (extracted.address) fields.push('Address');
      setLocationMessage(fields.length > 0
        ? `Aadhaar extracted from both sides. Extracted: ${fields.join(', ')}`
        : 'Processed both sides, but no details found. Please try clearer images.');
    } catch (error) {
      console.error('Aadhaar BOTH extraction error:', error);
      console.log('Error message:', error.message);
      
      // Check if it's a payment/API issue
      if (error.message.includes('Payment required') || error.message.includes('Payment Required') || error.message.includes('OpenRouter account requires payment')) {
        if (error.message.includes('OpenRouter account requires payment')) {
          setLocationError('OpenRouter account requires payment. Please add credits to your OpenRouter account or enter your details manually below.');
          setLocationMessage('💡 You can add credits to your OpenRouter account or manually fill in your Aadhaar details in the form fields.');
        } else {
          setLocationError('Aadhaar extraction service requires payment. Please enter your details manually below.');
          setLocationMessage('💡 You can manually fill in your Aadhaar details in the form fields.');
        }
        setManualAadhaarEntry(true);
      } else if (error.message.includes('not configured') || error.message.includes('not properly configured') || error.message.includes('OpenRouter API key is not configured')) {
        setLocationError('Aadhaar extraction service is not configured. Please enter your details manually below.');
        setLocationMessage('💡 You can manually fill in your Aadhaar details in the form fields.');
        setManualAadhaarEntry(true);
      } else {
        setLocationError(`Failed to extract Aadhaar details: ${error.message}`);
        setLocationMessage('');
      }
    } finally {
      setIsExtractingAadhaar(false);
      setExtractionProgress({ front: false, back: false });
    }
  };
  
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    phone: '',
    
    // Service Provider Details
    specialization: '',
    service_category_id: '',
    service_id: '',
    experience_years: '',
    hourly_rate: '500',
    years_of_experience: '',
    bio: '',
    
    // Location Information
    address: '',
    city: '',
    state: '',
    pincode: '',
    location_latitude: null,
    location_longitude: null,
    
    // Professional Information
    qualifications: [''],
    certifications: [''],
    languages: [''],
    
    // Availability
    availability: {
      monday: { start: '09:00', end: '18:00', available: true },
      tuesday: { start: '09:00', end: '18:00', available: true },
      wednesday: { start: '09:00', end: '18:00', available: true },
      thursday: { start: '09:00', end: '18:00', available: true },
      friday: { start: '09:00', end: '18:00', available: true },
      saturday: { start: '10:00', end: '16:00', available: true },
      sunday: { start: '10:00', end: '16:00', available: false }
    },
    
    // Documents
    profile_photo: null,
    aadhaar_front: null,
    aadhaar_back: null,
    qualification_certificates: [],
    
    // Aadhaar extracted details
    aadhaar_number: '',
    aadhaar_name: '',
    aadhaar_dob: '',
    aadhaar_gender: '',
    aadhaar_address: ''
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [newLanguage, setNewLanguage] = useState('');

  const totalSteps = 5;

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      loadUserProfileData();
    }
  }, [isOpen, user]);

  const loadUserProfileData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch user profile data including service provider details
      const profileData = await apiService.getUserProfile(user.id);
      
      if (profileData) {
        setFormData(prev => ({
          ...prev,
          // Personal Information
          first_name: profileData.profile?.first_name || user.first_name || '',
          last_name: profileData.profile?.last_name || user.last_name || '',
          phone: profileData.profile?.phone || user.phone || '',
          email: user.email || '',
          
          // Service Provider Details
          specialization: profileData.roleDetails?.specialization || '',
          service_category_id: profileData.roleDetails?.service_category_id || '',
          service_category_name: profileData.roleDetails?.service_category_name || '',
          service_id: profileData.roleDetails?.service_id || '',
          service_name: profileData.roleDetails?.service_name || '',
          experience_years: profileData.roleDetails?.experience_years?.toString() || '',
          hourly_rate: profileData.roleDetails?.basic_pay?.toString() || '',
          years_of_experience: profileData.profile?.years_of_experience?.toString() || profileData.roleDetails?.experience_years?.toString() || '',
          
          // Location Information
          address: profileData.profile?.address || '',
          city: profileData.profile?.city || '',
          state: profileData.profile?.state || '',
          pincode: profileData.profile?.pincode || '',
          location_latitude: profileData.profile?.location_latitude || null,
          location_longitude: profileData.profile?.location_longitude || null,
          
          // Professional Information
          bio: profileData.profile?.bio || '',
          qualifications: Array.isArray(profileData.profile?.qualifications) ? profileData.profile.qualifications : (profileData.profile?.qualifications ? [profileData.profile.qualifications] : ['']),
          certifications: Array.isArray(profileData.profile?.certifications) ? profileData.profile.certifications : (profileData.profile?.certifications ? [profileData.profile.certifications] : ['']),
          languages: Array.isArray(profileData.profile?.languages) && profileData.profile.languages.length > 0 ? profileData.profile.languages : [''],
          
          // Availability
          availability: profileData.roleDetails?.availability || prev.availability
        }));
      }
    } catch (error) {
      console.error('Error loading user profile data:', error);
      // Still pre-fill with basic user data
      if (user) {
        setFormData(prev => ({
          ...prev,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          email: user.email || ''
        }));
      }
    }
  };

  const loadInitialData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        apiService.getServiceCategories(),
        apiService.getServices()
      ]);
      
      if (!categoriesRes || !Array.isArray(categoriesRes)) {
        toast.error('Failed to load categories');
        return;
      }
      
      if (!servicesRes || !Array.isArray(servicesRes)) {
        toast.error('Failed to load services');
        return;
      }
      
      setCategories(categoriesRes);
      setServices(servicesRes);
      
      // If we have a pre-selected category, filter services immediately
      if (formData.service_category_id && servicesRes) {
        const filtered = servicesRes.filter(service => service.service_category_id === formData.service_category_id);
        setFilteredServices(filtered);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      // Personal Information Validation
      case 'first_name':
      case 'last_name':
        if (!value || value.trim() === '') {
          return 'This field is required';
        }
        if (value.trim().length < 2) {
          return 'Must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'Must be less than 50 characters';
        }
        // Check for valid name characters (letters, spaces, hyphens, apostrophes)
        if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;

      case 'phone':
        if (!value || value.trim() === '') {
          return 'Phone number is required';
        }
        
        // Remove all non-digit characters for validation
        const cleanPhone = value.replace(/\D/g, '');
        
        // Check for valid Indian mobile number formats
        if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
          // Format: +91XXXXXXXXXX or 91XXXXXXXXXX
          const mobilePart = cleanPhone.substring(2);
          const phoneRegex = /^[6-9][0-9]{9}$/;
          if (!phoneRegex.test(mobilePart)) {
            return 'Enter a valid Indian mobile number (e.g., +919496035164)';
          }
        } else if (cleanPhone.length === 10) {
          // Format: XXXXXXXXXX
          const phoneRegex = /^[6-9][0-9]{9}$/;
          if (!phoneRegex.test(cleanPhone)) {
            return 'Enter a valid 10-digit Indian mobile number starting with 6-9';
          }
        } else {
          return 'Enter a valid Indian mobile number (e.g., +919496035164 or 9496035164)';
        }
        
        // Additional validation to reject invalid patterns
        if (cleanPhone.length === 10) {
          const mobilePart = cleanPhone;
          if (/^(\d)\1{9}$/.test(mobilePart)) {
            return 'Invalid phone number pattern';
          }
          if (mobilePart === '1234567890' || mobilePart === '9876543210' || 
              mobilePart === '0123456789' || mobilePart === '0987654321') {
            return 'Invalid phone number pattern';
          }
        } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
          const mobilePart = cleanPhone.substring(2);
          if (/^(\d)\1{9}$/.test(mobilePart)) {
            return 'Invalid phone number pattern';
          }
          if (mobilePart === '1234567890' || mobilePart === '9876543210' || 
              mobilePart === '0123456789' || mobilePart === '0987654321') {
            return 'Invalid phone number pattern';
          }
        }
        return undefined;

      // Service Details Validation
      case 'specialization':
        if (!value || value.trim() === '') {
          return 'Specialization is required';
        }
        if (value.trim().length < 3) {
          return 'Specialization must be at least 3 characters';
        }
        if (value.trim().length > 100) {
          return 'Specialization must be less than 100 characters';
        }
        return undefined;

      case 'service_category_id':
        if (!value) {
          return 'Please select a service category';
        }
        return undefined;

      case 'service_id':
        if (!value) {
          return 'Please select a service';
        }
        return undefined;

      case 'experience_years':
        if (!value || value === '' || value === null || value === undefined) {
          return 'Please select your years of experience';
        }
        const years = parseInt(value);
        if (isNaN(years)) {
          return 'Please enter a valid number';
        }
        if (years < 0) {
          return 'Experience cannot be negative';
        }
        if (years > 20) {
          return 'Experience cannot exceed 20 years';
        }
        return undefined;

      // Location Information Validation
      case 'address':
        if (!value || value.trim() === '') {
          return 'Address is required';
        }
        if (value.trim().length < 10) {
          return 'Please provide a complete address (at least 10 characters)';
        }
        if (value.trim().length > 200) {
          return 'Address must be less than 200 characters';
        }
        return undefined;

      case 'city':
        if (!value || value.trim() === '') {
          return 'City is required';
        }
        if (value.trim().length < 2) {
          return 'City must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'City must be less than 50 characters';
        }
        // Check for valid city name characters
        if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          return 'City can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        return undefined;

      case 'state':
        if (!value || value.trim() === '') {
          return 'State is required';
        }
        if (value.trim().length < 2) {
          return 'State must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'State must be less than 50 characters';
        }
        // Check for valid state name characters
        if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          return 'State can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        return undefined;

      case 'pincode':
        if (!value || value.trim() === '') {
          return 'Pincode is required';
        }
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(value.trim())) {
          return 'Enter a valid 6-digit pincode (e.g., 400001)';
        }
        return undefined;

      // Professional Information Validation
      case 'bio':
        if (value && value.trim().length > 500) {
          return 'Bio must be less than 500 characters';
        }
        return undefined;

      case 'qualifications':
        if (value && Array.isArray(value)) {
          if (value.length > 10) {
            return 'Maximum 10 qualifications allowed';
          }
          for (let i = 0; i < value.length; i++) {
            const qual = value[i];
            if (!qual || qual.trim() === '') {
              return 'Qualification cannot be empty';
            }
            if (qual.trim().length > 100) {
              return 'Each qualification must be less than 100 characters';
            }
          }
        }
        return undefined;

      case 'certifications':
        if (value && Array.isArray(value)) {
          if (value.length > 10) {
            return 'Maximum 10 certifications allowed';
          }
          // Only validate non-empty certifications
          const nonEmptyCerts = value.filter(cert => cert && cert.trim() !== '');
          for (let cert of nonEmptyCerts) {
            if (cert.trim().length > 100) {
              return 'Each certification must be less than 100 characters';
            }
          }
        }
        return undefined;

      case 'languages':
        const validLanguages = (value || []).filter(lang => lang && lang.trim() !== '');
        if (validLanguages.length === 0) {
          return 'At least one language is required';
        }
        if (validLanguages.length > 10) {
          return 'Maximum 10 languages allowed';
        }
        for (let i = 0; i < validLanguages.length; i++) {
          const lang = validLanguages[i];
          if (lang.trim().length > 30) {
            return 'Each language must be less than 30 characters';
          }
          // Check for valid language name characters
          if (!/^[a-zA-Z\s\-']+$/.test(lang.trim())) {
            return 'Language can only contain letters, spaces, hyphens, and apostrophes';
          }
        }
        return undefined;

      // Documents & Verification Validation
      case 'profile_photo_url':
        if (value && value.trim() !== '') {
          // Basic URL validation
          try {
            new URL(value);
          } catch {
            return 'Please provide a valid image URL';
          }
        }
        return undefined;

      case 'aadhaar_number':
        if (value && value.trim() !== '') {
          // Remove all spaces from the Aadhaar number
          const cleanAadhaar = value.replace(/\s+/g, '');
          const aadhaarRegex = /^[2-9][0-9]{11}$/;
          if (!aadhaarRegex.test(cleanAadhaar)) {
            return 'Enter a valid 12-digit Aadhaar number';
          }
        }
        return undefined;

      case 'aadhaar_name':
        if (value && value.trim() !== '') {
          if (value.trim().length < 2) {
            return 'Name must be at least 2 characters';
          }
          if (value.trim().length > 100) {
            return 'Name must be less than 100 characters';
          }
          if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
            return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
          }
        }
        return undefined;

      case 'aadhaar_dob':
        if (value && value.trim() !== '') {
          // Try different date formats that might come from Aadhaar extraction
          let dob;
          const dateStr = value.trim();
          
          // Try parsing as-is first
          dob = new Date(dateStr);
          
          // If that fails, try common Indian date formats
          if (isNaN(dob.getTime())) {
            // Try DD/MM/YYYY format
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                dob = new Date(parts[2], parts[1] - 1, parts[0]);
              }
            }
            // Try DD-MM-YYYY format
            else if (dateStr.includes('-')) {
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                dob = new Date(parts[2], parts[1] - 1, parts[0]);
              }
            }
            // Try DD.MM.YYYY format
            else if (dateStr.includes('.')) {
              const parts = dateStr.split('.');
              if (parts.length === 3) {
                dob = new Date(parts[2], parts[1] - 1, parts[0]);
              }
            }
          }
          
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          
          if (isNaN(dob.getTime())) {
            return 'Enter a valid date format (DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY)';
          }
          if (dob > today) {
            return 'Date of birth cannot be in the future';
          }
          if (age < 18) {
            return 'Age must be at least 18 years';
          }
          if (age > 100) {
            return 'Please enter a valid age';
          }
        }
        return undefined;

      case 'aadhaar_gender':
        if (value && value.trim() !== '') {
          const validGenders = ['Male', 'Female', 'Other', 'Transgender'];
          if (!validGenders.includes(value.trim())) {
            return 'Please select a valid gender';
          }
        }
        return undefined;

      case 'aadhaar_address':
        if (value && value.trim() !== '') {
          if (value.trim().length < 10) {
            return 'Address must be at least 10 characters';
          }
          if (value.trim().length > 200) {
            return 'Address must be less than 200 characters';
          }
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleServiceCategoryChange = (categoryId) => {
    const filtered = services.filter(service => service.service_category_id === categoryId);
    setFilteredServices(filtered);
    setFormData(prev => ({ 
      ...prev, 
      service_category_id: categoryId,
      service_id: '' // Reset service selection
    }));
  };

  // Update filtered services when service_category_id changes
  useEffect(() => {
    if (formData.service_category_id && services.length > 0) {
      const filtered = services.filter(service => service.service_category_id === formData.service_category_id);
      setFilteredServices(filtered);
    } else if (services.length > 0) {
      // Show all services if no category selected
      setFilteredServices(services);
    } else {
      setFilteredServices([]);
    }
  }, [formData.service_category_id, services]);

  // Auto-fetch location when pincode is entered
  useEffect(() => {
    const pincode = formData.pincode?.trim();
    if (pincode && pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      const timeoutId = setTimeout(() => {
        fetchLocationFromPincode(pincode);
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.pincode]);

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const updateLanguage = (index, value) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => i === index ? value : lang)
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors.languages) {
      setValidationErrors(prev => ({ ...prev, languages: undefined }));
    }
  };

  const removeLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
    
    // Clear validation error when user removes a language
    if (validationErrors.languages) {
      setValidationErrors(prev => ({ ...prev, languages: undefined }));
    }
  };

  // Common Indian languages (including English)
  const COMMON_LANGUAGES = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
    'Gujarati', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese'
  ];

  const addLanguageValue = (language) => {
    const value = (language || '').trim();
    if (!value) return;
    setFormData(prev => {
      const existing = (prev.languages || []).map(l => (l || '').trim().toLowerCase());
      if (existing.includes(value.toLowerCase())) return prev;
      return { ...prev, languages: [...prev.languages, value] };
    });
    
    // Clear validation error when user adds a language
    if (validationErrors.languages) {
      setValidationErrors(prev => ({ ...prev, languages: undefined }));
    }
    
    // Clear the input field
    setNewLanguage('');
  };

  const toggleLanguage = (language) => {
    setFormData(prev => {
      const existing = prev.languages || [];
      const isSelected = existing.includes(language);
      
      if (isSelected) {
        return { ...prev, languages: existing.filter(l => l !== language) };
      } else {
        return { ...prev, languages: [...existing, language] };
      }
    });
    
    // Clear validation error when user toggles a language
    if (validationErrors.languages) {
      setValidationErrors(prev => ({ ...prev, languages: undefined }));
    }
  };

  // Qualification handling functions
  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...(Array.isArray(prev.qualifications) ? prev.qualifications : ['']), '']
    }));
  };

  const updateQualification = (index, value) => {
    setFormData(prev => ({
      ...prev,
      qualifications: (Array.isArray(prev.qualifications) ? prev.qualifications : ['']).map((qual, i) => i === index ? value : qual)
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors.qualifications) {
      setValidationErrors(prev => ({ ...prev, qualifications: undefined }));
    }
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: (Array.isArray(prev.qualifications) ? prev.qualifications : ['']).filter((_, i) => i !== index)
    }));
    
    // Clear validation error when user removes a qualification
    if (validationErrors.qualifications) {
      setValidationErrors(prev => ({ ...prev, qualifications: undefined }));
    }
  };

  // Certification handling functions
  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...(Array.isArray(prev.certifications) ? prev.certifications : ['']), '']
    }));
  };

  const updateCertification = (index, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: (Array.isArray(prev.certifications) ? prev.certifications : ['']).map((cert, i) => i === index ? value : cert)
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors.certifications) {
      setValidationErrors(prev => ({ ...prev, certifications: undefined }));
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: (Array.isArray(prev.certifications) ? prev.certifications : ['']).filter((_, i) => i !== index)
    }));
    
    // Clear validation error when user removes a certification
    if (validationErrors.certifications) {
      setValidationErrors(prev => ({ ...prev, certifications: undefined }));
    }
  };

  const handleFileUpload = async (field, file) => {
    console.log('File upload triggered:', field, file);
    console.log('File type:', typeof file);
    console.log('File instanceof File:', file instanceof File);
    console.log('File instanceof Blob:', file instanceof Blob);
    
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    if (field === 'profile_photo') {
      setIsUploadingProfilePhoto(true);
      try {
        // Ensure we have a valid file object
        if (!file || !(file instanceof File)) {
          toast.error('Please select a valid image file');
          return;
        }
        
        // Upload profile photo to Supabase storage
        const result = await apiService.uploadProviderProfilePicture(file, user.id);
        
        if (result.publicUrl) {
          setFormData(prev => ({ 
            ...prev, 
            profile_photo_url: result.publicUrl 
          }));
          toast.success('Profile photo uploaded successfully!');
        } else {
          toast.error(result.error || 'Failed to upload profile photo');
        }
      } catch (error) {
        console.error('Profile photo upload error:', error);
        toast.error('Failed to upload profile photo');
      } finally {
        setIsUploadingProfilePhoto(false);
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
      console.log('File set in form data:', field);
    }
    
    // Handle Aadhaar extraction
    if (field === 'aadhaar_front' || field === 'aadhaar_back') {
      const side = field === 'aadhaar_front' ? 'front' : 'back';
      console.log('Aadhaar upload received for:', side);

      // Track uploaded file and trigger combined extraction only when both sides exist
      setUploadedFiles(prev => {
        const next = { ...prev, [side]: file };
        const hasBoth = next.front && next.back;
        if (!hasBoth) {
          setLocationMessage(`✅ Aadhaar ${side} side uploaded. Please upload the ${side === 'front' ? 'back' : 'front'} side to start extraction.`);
        } else {
          setLocationError('');
          setLocationMessage('🔎 Both sides uploaded. Extracting details...');
          void extractAadhaarBoth(next.front, next.back);
        }
        return next;
      });
    }
  };

  const validateCurrentStep = () => {
    const errors = {};
    
    switch (currentStep) {
      case 1: // Personal Information
        ['first_name', 'last_name', 'phone'].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) errors[field] = error;
        });
        break;
        
      case 2: // Service Details
        // Only validate experience_years since other fields are readonly and set by admin
        ['experience_years'].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) errors[field] = error;
        });
        break;
        
      case 3: // Location Information
        ['address', 'city', 'state', 'pincode'].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) errors[field] = error;
        });
        break;
        
      case 4: // Professional Information
        // Only validate required fields and non-empty optional fields
        ['bio', 'qualifications', 'languages'].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) errors[field] = error;
        });
        // Only validate certifications if they exist and are not empty
        if (formData.certifications && formData.certifications.some(cert => cert && cert.trim() !== '')) {
          const error = validateField('certifications', formData.certifications);
          if (error) errors.certifications = error;
        }
        break;
        
      case 5: // Documents & Verification
        ['profile_photo_url', 'aadhaar_number', 'aadhaar_name', 'aadhaar_dob', 'aadhaar_gender', 'aadhaar_address'].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) errors[field] = error;
        });
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the data for submission to provider_profiles table
      const submitData = {
        provider_id: user?.id, // Use current user ID as provider_id
        first_name: formData.first_name?.trim() || '',
        last_name: formData.last_name?.trim() || '',
        phone: formData.phone?.trim() || '',
        pincode: formData.pincode?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        address: formData.address?.trim() || '',
        location_latitude: formData.location_latitude || null,
        location_longitude: formData.location_longitude || null,
        bio: formData.bio?.trim() || null,
        qualifications: (formData.qualifications || []).filter(q => q && q.trim()),
        certifications: (formData.certifications || []).filter(c => c && c.trim()),
        languages: (formData.languages || []).filter(l => l && l.trim()),
        profile_photo_url: formData.profile_photo_url || null,
        aadhaar_number: formData.aadhaar_number?.trim() || null,
        aadhaar_name: formData.aadhaar_name?.trim() || null,
        aadhaar_dob: formData.aadhaar_dob?.trim() || null,
        aadhaar_gender: formData.aadhaar_gender?.trim() || null,
        aadhaar_address: formData.aadhaar_address?.trim() || null,
        hourly_rate: formData.hourly_rate || null,
        years_of_experience: formData.years_of_experience || null
      };

      // Debug: Log the data being sent
      console.log('Submitting profile data:', submitData);
      
      // Check for missing required fields (more strict validation)
      const requiredFields = ['provider_id', 'first_name', 'last_name', 'phone', 'pincode', 'city', 'state', 'address'];
      const missingFields = requiredFields.filter(field => {
        const value = submitData[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        console.error('Field values:', requiredFields.map(field => ({ [field]: submitData[field] })));
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Submit profile completion
      await apiService.completeServiceProviderProfile(submitData);
      
      toast.success('Profile completed successfully! You can now access all features.');
      
      // Refresh provider profile data
      if (onProfileUpdated) {
        onProfileUpdated();
      }
      
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing profile:', error);
      
      // Check if it's a table not found error
      if (error.message && error.message.includes('Provider profiles table not found')) {
        toast.error('Database table not found. Please contact support to set up the database.');
      } else {
        toast.error('Failed to complete profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step) => {
    const titles = {
      1: 'Personal Information',
      2: 'Service Details',
      3: 'Location Information',
      4: 'Professional Information',
      5: 'Documents & Verification'
    };
    return titles[step] || '';
  };

  const getStepIcon = (step) => {
    const icons = {
      1: User,
      2: Briefcase,
      3: MapPin,
      4: Award,
      5: FileText
    };
    return icons[step] || User;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="profile-completion-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="profile-completion-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="header-left">
              <h2>Complete Your Profile</h2>
              <p>Complete your profile to start receiving service requests</p>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="progress-text">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </div>
          </div>

          {/* Step Navigation */}
          <div className="step-navigation">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => {
              const Icon = getStepIcon(step);
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;
              
              return (
                <div
                  key={step}
                  className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => step < currentStep && setCurrentStep(step)}
                >
                  <div className="step-icon">
                    {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span>{getStepTitle(step)}</span>
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="form-content">
            {currentStep === 1 && (
              <div className="step-content">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className={validationErrors.first_name ? 'error' : ''}
                      placeholder="Enter your first name"
                    />
                    {validationErrors.first_name && (
                      <span className="error-text">{validationErrors.first_name}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className={validationErrors.last_name ? 'error' : ''}
                      placeholder="Enter your last name"
                    />
                    {validationErrors.last_name && (
                      <span className="error-text">{validationErrors.last_name}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={validationErrors.phone ? 'error' : ''}
                      placeholder="+919496035164 or 9496035164"
                    />
                    <small className="help-text">
                      Enter your Indian mobile number with or without +91 country code
                    </small>
                    {validationErrors.phone && (
                      <span className="error-text">{validationErrors.phone}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-content">
                <h3>Service Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Specialization *</label>
                    <div className="readonly-field">
                      <div className="readonly-input">
                        {formData.specialization || 'Not set'}
                      </div>
                      <div className="readonly-icon">
                        <User size={16} />
                      </div>
                    </div>
                    <small className="help-text">
                      Your specialization is set by the admin and cannot be changed here
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label>Service Category *</label>
                    <div className="readonly-field">
                      <div className="readonly-input">
                        {formData.service_category_name || 'Not set'}
                      </div>
                      <div className="readonly-icon">
                        <Tag size={16} />
                      </div>
                    </div>
                    <small className="help-text">
                      Your service category is set by the admin and cannot be changed here
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label>Specific Service *</label>
                    <div className="readonly-field">
                      <div className="readonly-input">
                        {formData.service_name || 'Not set'}
                      </div>
                      <div className="readonly-icon">
                        <Settings size={16} />
                      </div>
                    </div>
                    <small className="help-text">
                      Your specific service is set by the admin and cannot be changed here
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label>Years of Experience *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={formData.experience_years}
                        onChange={(e) => handleInputChange('experience_years', e.target.value)}
                        className={validationErrors.experience_years ? 'error' : ''}
                        placeholder="Select years"
                      />
                      <div className="custom-stepper">
                        <button
                          type="button"
                          className="stepper-btn increase"
                          onClick={() => {
                            const currentValue = parseInt(formData.experience_years) || 0;
                            if (currentValue < 20) {
                              handleInputChange('experience_years', (currentValue + 1).toString());
                            }
                          }}
                          disabled={parseInt(formData.experience_years) >= 20}
                        />
                        <button
                          type="button"
                          className="stepper-btn decrease"
                          onClick={() => {
                            const currentValue = parseInt(formData.experience_years) || 0;
                            if (currentValue > 0) {
                              handleInputChange('experience_years', (currentValue - 1).toString());
                            }
                          }}
                          disabled={parseInt(formData.experience_years) <= 0}
                        />
                      </div>
                    </div>
                    <small className="help-text">
                      Select your years of experience in this field (0-20 years)
                    </small>
                    {validationErrors.experience_years && (
                      <span className="error-text">{validationErrors.experience_years}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Hourly Rate (₹)</label>
                    <div className="readonly-field">
                      <div className="readonly-input">
                        {formData.hourly_rate ? `₹${parseFloat(formData.hourly_rate).toLocaleString('en-IN')}` : 'Not set'}
                      </div>
                      <div className="readonly-icon">
                        ₹
                      </div>
                    </div>
                    <small className="help-text">
                      Your hourly rate is set by the system and cannot be changed here
                    </small>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-content">
                <h3>Location Information</h3>
                
                {/* Location Action Buttons */}
                <div className="location-actions">
                  <button
                    type="button"
                    className="location-btn current-location"
                    onClick={handleUseCurrentLocation}
                    disabled={isGeolocating}
                  >
                    {isGeolocating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Navigation size={16} />
                    )}
                    {isGeolocating ? 'Detecting...' : 'Use Current Location'}
                  </button>
                  
                  {currentCoords && (
                    <a
                      href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="location-btn view-map"
                    >
                      <MapPin size={16} />
                      View on Map
                    </a>
                  )}
                </div>

                {/* Location Messages */}
                {locationMessage && (
                  <div className="location-message success">
                    <CheckCircle size={16} />
                    {locationMessage}
                  </div>
                )}
                {locationError && (
                  <div className="location-message error">
                    <AlertCircle size={16} />
                    {locationError}
                  </div>
                )}

                {/* Coordinates Display */}
                {(formData.location_latitude && formData.location_longitude) && (
                  <div className="coordinates-display">
                    <div className="coordinates-info">
                      <MapPin size={16} />
                      <span>Coordinates: {formData.location_latitude.toFixed(6)}, {formData.location_longitude.toFixed(6)}</span>
                      <a
                        href={`https://www.google.com/maps?q=${formData.location_latitude},${formData.location_longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="coordinates-link"
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Pincode *</label>
                    <div className="pincode-input-container">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.pincode}
                        onChange={(e) => {
                          const digitsOnly = (e.target.value || '').replace(/\D/g, '').slice(0, 6);
                          handleInputChange('pincode', digitsOnly);
                        }}
                        className={validationErrors.pincode ? 'error' : ''}
                        placeholder="Enter 6-digit pincode"
                        maxLength="6"
                      />
                      {isPincodeLoading && (
                        <div className="pincode-loading">
                          <Loader2 size={16} className="animate-spin" />
                        </div>
                      )}
                    </div>
                    {validationErrors.pincode && (
                      <span className="error-text">{validationErrors.pincode}</span>
                    )}
                    <small className="help-text">
                      Enter your 6-digit pincode to auto-fetch city and state
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => {
                        const lettersOnly = (e.target.value || '').replace(/[^a-zA-Z\s\-'\.]/g, '');
                        handleInputChange('city', lettersOnly);
                      }}
                      className={validationErrors.city ? 'error' : ''}
                      placeholder="Enter your city"
                    />
                    {validationErrors.city && (
                      <span className="error-text">{validationErrors.city}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => {
                        const lettersOnly = (e.target.value || '').replace(/[^a-zA-Z\s\-'\.]/g, '');
                        handleInputChange('state', lettersOnly);
                      }}
                      className={validationErrors.state ? 'error' : ''}
                      placeholder="Enter your state"
                    />
                    {validationErrors.state && (
                      <span className="error-text">{validationErrors.state}</span>
                    )}
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={validationErrors.address ? 'error' : ''}
                      placeholder="Enter your complete address"
                      rows="3"
                    />
                    {validationErrors.address && (
                      <span className="error-text">{validationErrors.address}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="step-content">
                <h3>Professional Information</h3>
                <div className="professional-info-grid">
                  {/* Bio Section */}
                  <div className="form-group full-width">
                    <label>Professional Bio *</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className={validationErrors.bio ? 'error' : ''}
                      placeholder="Tell us about your professional background, expertise, and what makes you unique in your field..."
                      rows="4"
                    />
                    <small className="help-text">
                      Write a compelling bio that highlights your experience and skills (max 500 characters)
                    </small>
                    {validationErrors.bio && (
                      <span className="error-text">{validationErrors.bio}</span>
                    )}
                  </div>
                  
                  {/* Qualifications Section */}
                  <div className="form-group">
                    <label>Professional Qualifications *</label>
                    <div className="qualifications-section">
                      <div className="qualifications-list">
                        {(Array.isArray(formData.qualifications) ? formData.qualifications : ['']).map((qual, index) => (
                          <div key={index} className="qualification-item">
                            <div className="qualification-input-wrapper">
                              <input
                                type="text"
                                value={qual}
                                onChange={(e) => updateQualification(index, e.target.value)}
                                placeholder="e.g., Bachelor's in Electrical Engineering"
                                className={validationErrors.qualifications ? 'error' : ''}
                              />
                              <button
                                type="button"
                                onClick={() => removeQualification(index)}
                                className="remove-item-btn"
                                title="Remove qualification"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addQualification}
                        className="add-item-btn"
                      >
                        <Plus size={16} />
                        Add Qualification
                      </button>
                    </div>
                    {validationErrors.qualifications && (
                      <span className="error-text">{validationErrors.qualifications}</span>
                    )}
                  </div>
                  
                  {/* Certifications Section */}
                  <div className="form-group">
                    <label>Professional Certifications</label>
                    <div className="certifications-section">
                      <div className="certifications-list">
                        {(Array.isArray(formData.certifications) ? formData.certifications : ['']).map((cert, index) => (
                          <div key={index} className="certification-item">
                            <div className="certification-input-wrapper">
                              <input
                                type="text"
                                value={cert}
                                onChange={(e) => updateCertification(index, e.target.value)}
                                placeholder="e.g., Licensed Electrician, Safety Certified"
                                className={validationErrors.certifications ? 'error' : ''}
                              />
                              <button
                                type="button"
                                onClick={() => removeCertification(index)}
                                className="remove-item-btn"
                                title="Remove certification"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addCertification}
                        className="add-item-btn"
                      >
                        <Plus size={16} />
                        Add Certification
                      </button>
                    </div>
                    {validationErrors.certifications && (
                      <span className="error-text">{validationErrors.certifications}</span>
                    )}
                  </div>
                  
                  {/* Languages Section */}
                  <div className="form-group full-width">
                    <label>Languages Spoken *</label>
                    <div className="languages-section">
                      <div className="languages-input-container">
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow letters, spaces, hyphens, and apostrophes
                            const filteredValue = value.replace(/[^a-zA-Z\s\-']/g, '');
                            setNewLanguage(filteredValue);
                          }}
                          placeholder="Type a language and press Enter or click Add"
                          className="language-input"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addLanguageValue(newLanguage);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addLanguageValue(newLanguage)}
                          className="add-language-btn"
                          disabled={!newLanguage.trim()}
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                      
                      <div className="language-suggestions">
                        <p className="suggestions-label">Quick Add:</p>
                        <div className="suggestion-chips">
                          {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'].map(lang => (
                            <button
                              key={lang}
                              type="button"
                              className={`suggestion-chip ${formData.languages.includes(lang) ? 'selected' : ''}`}
                              onClick={() => toggleLanguage(lang)}
                            >
                              {lang}
                              {formData.languages.includes(lang) && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="selected-languages">
                        <p className="selected-label">Selected Languages:</p>
                        <div className="language-tags">
                          {formData.languages.filter(lang => lang && lang.trim() !== '').map((lang, index) => (
                            <div key={index} className="language-tag">
                              <span>{lang}</span>
                              <button
                                type="button"
                                onClick={() => removeLanguage(formData.languages.indexOf(lang))}
                                className="remove-tag-btn"
                                title="Remove language"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        {formData.languages.filter(lang => lang && lang.trim() !== '').length === 0 && (
                          <p className="no-languages">No languages selected yet</p>
                        )}
                      </div>
                    </div>
                    {validationErrors.languages && (
                      <span className="error-text">{validationErrors.languages}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="step-content">
                <h3>Documents & Verification</h3>
                <p className="step-description">
                  Upload your Aadhaar card for identity and address verification. We'll extract the details automatically.
                </p>
                
                <div className="aadhaar-upload-section">
                  {/* Profile Photo */}
                  <div className="form-group">
                    <label>Profile Photo</label>
                    <div className="file-upload-container">
                      {formData.profile_photo_url ? (
                        <div className="image-preview-container">
                          <img 
                            src={formData.profile_photo_url} 
                            alt="Profile Preview" 
                            className="image-preview"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              document.getElementById('profile_photo').click();
                            }}
                            className="replace-photo-btn"
                          >
                            <Camera size={16} />
                            Replace Photo
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload('profile_photo', e.target.files[0])}
                            id="profile_photo"
                            className={validationErrors.profile_photo_url ? 'error' : ''}
                          />
                          <label htmlFor="profile_photo" className="file-upload-btn">
                            {isUploadingProfilePhoto ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <Camera size={20} />
                            )}
                            {isUploadingProfilePhoto ? 'Uploading...' : 'Upload Photo'}
                          </label>
                        </div>
                      )}
                    </div>
                    {validationErrors.profile_photo_url && (
                      <span className="error-text">{validationErrors.profile_photo_url}</span>
                    )}
                  </div>

                  {/* Aadhaar Card Upload */}
                  <div className="aadhaar-card-container">
                    <h4>Aadhaar Card Verification</h4>
                    <p className="aadhaar-description">
                      Upload both sides of your Aadhaar card. We'll automatically extract your details for verification.
                    </p>
                    
                    <div className="aadhaar-sides">
                      {/* Aadhaar Front (ID Proof) */}
                      <div className="aadhaar-side">
                        <div className="aadhaar-card-front">
                          <div className="aadhaar-header">
                            <div className="aadhaar-logo">भारत सरकार</div>
                            <div className="aadhaar-subtitle">GOVERNMENT OF INDIA</div>
                          </div>
                          <div className="aadhaar-content">
                            <div className="aadhaar-title">आधार</div>
                            <div className="aadhaar-subtitle">AADHAAR</div>
                            <div className="aadhaar-placeholder">
                              {uploadedFiles.front ? (
                                <div className="uploaded-indicator">
                                  <CheckCircle size={24} className="success-icon" />
                                  <div className="uploaded-text">Front Side Uploaded</div>
                                  <div className="uploaded-subtitle">{uploadedFiles.front.name}</div>
                                </div>
                              ) : (
                                <>
                                  <div className="placeholder-text">Upload Front Side</div>
                                  <div className="placeholder-subtitle">ID Proof</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="file-upload aadhaar-upload">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload('aadhaar_front', e.target.files[0])}
                            id="aadhaar_front"
                            disabled={isExtractingAadhaar}
                          />
                          <label htmlFor="aadhaar_front" className="aadhaar-upload-btn">
                            {extractionProgress.front ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <Upload size={20} />
                            )}
                            {extractionProgress.front ? 'Extracting...' : 'Upload Front'}
                          </label>
                        </div>
                      </div>

                      {/* Aadhaar Back (Address Proof) */}
                      <div className="aadhaar-side">
                        <div className="aadhaar-card-back">
                          <div className="aadhaar-header">
                            <div className="aadhaar-logo">भारत सरकार</div>
                            <div className="aadhaar-subtitle">GOVERNMENT OF INDIA</div>
                          </div>
                          <div className="aadhaar-content">
                            <div className="aadhaar-title">आधार</div>
                            <div className="aadhaar-subtitle">AADHAAR</div>
                            <div className="aadhaar-placeholder">
                              {uploadedFiles.back ? (
                                <div className="uploaded-indicator">
                                  <CheckCircle size={24} className="success-icon" />
                                  <div className="uploaded-text">Back Side Uploaded</div>
                                  <div className="uploaded-subtitle">{uploadedFiles.back.name}</div>
                                </div>
                              ) : (
                                <>
                                  <div className="placeholder-text">Upload Back Side</div>
                                  <div className="placeholder-subtitle">Address Proof</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="file-upload aadhaar-upload">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload('aadhaar_back', e.target.files[0])}
                            id="aadhaar_back"
                            disabled={isExtractingAadhaar}
                          />
                          <label htmlFor="aadhaar_back" className="aadhaar-upload-btn">
                            {extractionProgress.back ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <Upload size={20} />
                            )}
                            {extractionProgress.back ? 'Extracting...' : 'Upload Back'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aadhaar Details Display */}
                  <div className="aadhaar-details">
                    <div className="aadhaar-header">
                      <h4>{manualAadhaarEntry ? 'Aadhaar Details (Manual Entry)' : 'Extracted Aadhaar Details'}</h4>
                      <div className="aadhaar-actions">
                        {manualAadhaarEntry ? (
                          <button 
                            type="button" 
                            className="manual-entry-toggle"
                            onClick={() => setManualAadhaarEntry(false)}
                          >
                            Try Auto-Extraction Again
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            className="manual-entry-toggle"
                            onClick={() => setManualAadhaarEntry(true)}
                          >
                            Enter Manually
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="aadhaar-info-grid">
                      <div className="info-item">
                        <label>Aadhaar Number</label>
                        {manualAadhaarEntry ? (
                          <input
                            type="text"
                            value={formData.aadhaar_number}
                            onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
                            placeholder="Enter 12-digit Aadhaar number"
                            className={`form-input ${validationErrors.aadhaar_number ? 'error' : ''}`}
                          />
                        ) : (
                          <div className={`info-value ${validationErrors.aadhaar_number ? 'error' : ''}`}>
                            {formData.aadhaar_number || 'Not extracted'}
                          </div>
                        )}
                        {validationErrors.aadhaar_number && (
                          <span className="error-text">{validationErrors.aadhaar_number}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <label>Name</label>
                        {manualAadhaarEntry ? (
                          <input
                            type="text"
                            value={formData.aadhaar_name}
                            onChange={(e) => handleInputChange('aadhaar_name', e.target.value)}
                            placeholder="Enter name as on Aadhaar"
                            className={`form-input ${validationErrors.aadhaar_name ? 'error' : ''}`}
                          />
                        ) : (
                          <div className={`info-value ${validationErrors.aadhaar_name ? 'error' : ''}`}>
                            {formData.aadhaar_name || 'Not extracted'}
                          </div>
                        )}
                        {validationErrors.aadhaar_name && (
                          <span className="error-text">{validationErrors.aadhaar_name}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <label>Date of Birth</label>
                        {manualAadhaarEntry ? (
                          <input
                            type="text"
                            value={formData.aadhaar_dob}
                            onChange={(e) => handleInputChange('aadhaar_dob', e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className={`form-input ${validationErrors.aadhaar_dob ? 'error' : ''}`}
                          />
                        ) : (
                          <div className={`info-value ${validationErrors.aadhaar_dob ? 'error' : ''}`}>
                            {formData.aadhaar_dob || 'Not extracted'}
                          </div>
                        )}
                        {validationErrors.aadhaar_dob && (
                          <span className="error-text">{validationErrors.aadhaar_dob}</span>
                        )}
                      </div>
                      <div className="info-item">
                        <label>Gender</label>
                        {manualAadhaarEntry ? (
                          <select
                            value={formData.aadhaar_gender}
                            onChange={(e) => handleInputChange('aadhaar_gender', e.target.value)}
                            className={`form-input ${validationErrors.aadhaar_gender ? 'error' : ''}`}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <div className={`info-value ${validationErrors.aadhaar_gender ? 'error' : ''}`}>
                            {formData.aadhaar_gender || 'Not extracted'}
                          </div>
                        )}
                        {validationErrors.aadhaar_gender && (
                          <span className="error-text">{validationErrors.aadhaar_gender}</span>
                        )}
                      </div>
                      <div className="info-item full-width">
                        <label>Address</label>
                        {manualAadhaarEntry ? (
                          <textarea
                            value={formData.aadhaar_address}
                            onChange={(e) => handleInputChange('aadhaar_address', e.target.value)}
                            placeholder="Enter address as on Aadhaar"
                            className={`form-input ${validationErrors.aadhaar_address ? 'error' : ''}`}
                            rows={3}
                          />
                        ) : (
                          <div className={`info-value ${validationErrors.aadhaar_address ? 'error' : ''}`}>
                            {formData.aadhaar_address || 'Not extracted'}
                          </div>
                        )}
                        {validationErrors.aadhaar_address && (
                          <span className="error-text">{validationErrors.aadhaar_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="verification-note">
                  <AlertCircle size={20} />
                  <p>
                    Your Aadhaar details will be automatically extracted and verified. 
                    You can start receiving requests while verification is in progress.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="footer-left">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn-secondary"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="footer-right">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      Completing Profile...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Complete Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCompletionModal;
