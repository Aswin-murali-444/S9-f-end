import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Phone, Settings, Briefcase, FileText, CheckCircle, Users, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { validationUtils } from '../../utils/validation';
import { apiService } from '../../services/api';
import { supabase } from '../../lib/supabase';
import './AdminPages.css';

const AddServiceProviderPage = () => {
  const navigate = useNavigate();
  const [providerType, setProviderType] = useState('individual'); // 'individual' or 'team'
  
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    
    // Service Provider Details
    specialization: '',
    service_category_id: '',
    service_id: '',
    basic_pay: '',
    status: 'active',
    notes: '',
    
    // Admin Settings
    sendEmail: true
  });

  // Team-specific state
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    max_members: 2,
    team_leader_id: null, // Selected team leader ID
    team_members: [] // Array of selected user IDs (excluding team leader)
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isToggleAnimating, setIsToggleAnimating] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(true);
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (successModal.open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [successModal.open]);

  // Reusable animated dropdown (for category and service)
  const FancySelect = ({ label, options, value, onChange, placeholder = 'Select', disabled = false, name, id }) => {
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.value === value);
    return (
      <div className={`fancy-select ${disabled ? 'disabled' : ''}`} onBlur={() => setOpen(false)}>
        <button
          type="button"
          id={id}
          name={name}
          className={`fancy-select-trigger ${open ? 'open' : ''}`}
          onClick={() => !disabled && setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span className={`placeholder ${selected ? 'has' : ''}`}>{selected ? selected.label : placeholder}</span>
          <span className="chevron" />
        </button>
        {open && (
          <ul className="fancy-select-menu" role="listbox">
            {options.map(opt => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`fancy-option ${opt.value === value ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange({ target: { name, value: opt.value, type: 'select-one' } });
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Load categories, services, and available providers
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories using apiService (uses proper API_BASE_URL)
        const categoriesData = await apiService.getCategories();
        setCategories(categoriesData);
        
        // Load services using apiService (uses proper API_BASE_URL)
        const servicesData = await apiService.getServices();
        setServices(servicesData);

        // Load all available providers for team creation
        const providersData = await apiService.getAvailableProviders();
        const allProviders = providersData.providers || [];
        
        // Get providers who are already in teams to filter them out
        const { data: existingTeamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('status', 'active');
        
        const existingTeamMemberIds = existingTeamMembers?.map(member => member.user_id) || [];
        
        // Filter out providers who are already in teams
        const availableProviders = allProviders.filter(provider => 
          !existingTeamMemberIds.includes(provider.id)
        );
        
        setAvailableProviders(availableProviders);
        setFilteredProviders(availableProviders);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Filter services based on provider type (team vs individual)
  useEffect(() => {
    if (services.length > 0) {
      const filtered = services.filter(service => {
        // For team creation, only show services with service_type = 'group'
        // For individual providers, only show services with service_type = 'individual'
        const serviceTypeMatch = providerType === 'team' 
          ? service.service_type === 'group'
          : service.service_type === 'individual';
        
        
        return serviceTypeMatch;
      });
      
      setFilteredServices(filtered);
      
      // Clear service selection when provider type changes
      setFormData(prev => ({ ...prev, service_id: '', specialization: '', service_category_id: '' }));
      setSelectedService(null);
    }
  }, [providerType, services]);

  // Filter available providers based on selected category, service, and verification status
  useEffect(() => {
    if (providerType === 'team') {
      let filtered = [...availableProviders];
      
      
      // First filter: Only verified/active providers
      filtered = filtered.filter(provider => {
        const isVerified = provider.service_provider_details?.status === 'active' || 
                          provider.service_provider_details?.status === 'verified' ||
                          provider.status === 'active';
        return isVerified;
      });
      
      // Second filter: Same specialization (if specialization is set)
      if (formData.specialization) {
        filtered = filtered.filter(provider => {
          const providerSpecialization = provider.service_provider_details?.specialization;
          const matchesSpecialization = providerSpecialization === formData.specialization ||
                                       providerSpecialization?.toLowerCase().includes(formData.specialization.toLowerCase()) ||
                                       formData.specialization.toLowerCase().includes(providerSpecialization?.toLowerCase());
          return matchesSpecialization;
        });
      }
      
      // Third filter: Same service category (if category is selected)
      if (formData.service_category_id) {
        filtered = filtered.filter(provider => {
          const providerCategory = provider.service_provider_details?.service_category_id;
          const matches = providerCategory === formData.service_category_id || 
                         providerCategory === parseInt(formData.service_category_id) ||
                         providerCategory?.toString() === formData.service_category_id;
          return matches;
        });
      }
      
      // Fourth filter: Same specific service (if service is selected)
      if (formData.service_id) {
        filtered = filtered.filter(provider => {
          const providerService = provider.service_provider_details?.service_id;
          const matches = providerService === formData.service_id || 
                         providerService === parseInt(formData.service_id) ||
                         providerService?.toString() === formData.service_id;
          return matches;
        });
      }
      
      setFilteredProviders(filtered);
    } else {
      // If not team provider, show all available providers
      setFilteredProviders(availableProviders);
    }
  }, [formData.service_category_id, formData.service_id, formData.specialization, providerType, availableProviders]);

  // Debounced email availability check
  useEffect(() => {
    let timer;
    const run = async () => {
      const email = (formData.email || '').trim();
      if (!email) {
        setIsEmailAvailable(true);
        return;
      }
      setIsCheckingEmail(true);
      const result = await apiService.checkEmailExists(email);
      setIsCheckingEmail(false);
      if (result?.error) return; // ignore network/format errors silently
      setIsEmailAvailable(!result.exists);
      setValidationErrors(prev => ({
        ...prev,
        email: result.exists ? 'Email already registered' : undefined
      }));
    };
    // small debounce to avoid hammering the API
    timer = setTimeout(run, 400);
    return () => clearTimeout(timer);
  }, [formData.email]);

  // Handle team member selection
  const handleAddTeamMember = (providerId) => {
    if (!teamData.team_members.includes(providerId) && teamData.team_members.length < teamData.max_members - 1) {
      setTeamData(prev => ({
        ...prev,
        team_members: [...prev.team_members, providerId]
      }));
    }
  };

  const handleRemoveTeamMember = (providerId) => {
    setTeamData(prev => ({
      ...prev,
      team_members: prev.team_members.filter(id => id !== providerId)
    }));
  };

  // Enhanced validation with comprehensive rules
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'full_name': {
        if (!value || value.trim() === '') {
          return 'Full name is required';
        }
        if (value.trim().length < 2) {
          return 'Full name must be at least 2 characters';
        }
        if (value.trim().length > 30) {
          return 'Full name must be at most 30 characters';
        }
        if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          return 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        if (value.trim().split(' ').length < 2) {
          return 'Please enter both first and last name';
        }
        return undefined;
      }
      
      case 'email': {
        if (!value || value.trim() === '') {
          return 'Email address is required';
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        if (value.trim().length > 254) {
          return 'Email address is too long';
        }
        return undefined;
      }
      
      case 'phone': {
        if (!value || value.trim() === '') {
          return undefined; // Optional field
        }
        // Normalize: remove spaces, dashes, brackets, dots
        const stripped = value.replace(/[\s\-\(\)\.]/g, '');
        // Remove Indian prefixes +91, 91, or leading 0
        let normalized = stripped.replace(/^\+?91/, '').replace(/^0/, '');
        // If still longer than 10, keep last 10 digits (handles 0091, etc.)
        if (normalized.length > 10) {
          normalized = normalized.slice(-10);
        }
        // Must be exactly 10 digits and start with 6-9
        if (!/^[6-9][0-9]{9}$/.test(normalized)) {
          return 'Enter a valid 10‑digit Indian mobile number (starts with 6-9)';
        }
        // Reject numbers with all identical digits or obvious repeating patterns
        if (/^(\d)\1{9}$/.test(normalized)) {
          return 'Phone number cannot be all the same digit';
        }
        return undefined;
      }
      
      case 'service_category_id': {
        if (!value || value.trim() === '') {
          return 'Service category is required';
        }
        const validCategory = categories.find(cat => cat.id === value);
        if (!validCategory) {
          return 'Please select a valid service category';
        }
        return undefined;
      }
      
      case 'service_id': {
        if (!value || value.trim() === '') {
          return 'Service selection is required';
        }
        const validService = services.find(service => service.id === value);
        if (!validService) {
          return 'Please select a valid service';
        }
        return undefined;
      }
      
      case 'specialization': {
        if (!value || value.trim() === '') {
          return 'Specialization is required';
        }
        if (value.trim().length < 3) {
          return 'Specialization must be at least 3 characters';
        }
        if (value.trim().length > 200) {
          return 'Specialization must be less than 200 characters';
        }
        return undefined;
      }
      
      case 'status': {
        const validStatuses = ['active', 'pending_verification'];
        if (!value || !validStatuses.includes(value)) {
          return 'Please select a valid status';
        }
        return undefined;
      }
      
      case 'notes': {
        if (!value || value.trim() === '') {
          return undefined; // Optional field
        }
        if (value.trim().length > 1000) {
          return 'Notes must be less than 1000 characters';
        }
        return undefined;
      }

      // Team validation
      case 'team_name': {
        if (providerType === 'team' && (!value || value.trim() === '')) {
          return 'Team name is required';
        }
        if (value && value.trim().length < 2) {
          return 'Team name must be at least 2 characters';
        }
        if (value && value.trim().length > 100) {
          return 'Team name must be less than 100 characters';
        }
        return undefined;
      }

      case 'max_members': {
        if (providerType === 'team' && (!value || value < 2)) {
          return 'Maximum members must be at least 2';
        }
        if (value && value > 20) {
          return 'Maximum members cannot exceed 20';
        }
        return undefined;
      }

      case 'team_leader_id': {
        if (providerType === 'team' && !value) {
          return 'Please select a team leader';
        }
        return undefined;
      }

      case 'team_members': {
        if (providerType === 'team' && (!value || value.length === 0)) {
          return 'Please add at least one team member';
        }
        return undefined;
      }
      
      default:
        return undefined;
    }
  };

  // Real-time validation for better UX
  const validateForm = () => {
    const errors = {};
    
    if (providerType === 'individual') {
      const requiredFields = ['full_name', 'email', 'service_category_id', 'service_id', 'specialization', 'status'];
      
      // Validate required fields
      requiredFields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
        }
      });
    } else {
      // Team validation
      const requiredFields = ['service_category_id', 'service_id', 'specialization', 'status'];
      const teamRequiredFields = ['team_name', 'max_members', 'team_leader_id', 'team_members'];
      
      // Validate individual provider fields
      requiredFields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
        }
      });
      
      // Validate team fields
      teamRequiredFields.forEach(field => {
        let value;
        if (field === 'team_name') {
          value = teamData.name;
        } else if (field === 'max_members') {
          value = teamData.max_members;
        } else if (field === 'team_leader_id') {
          value = teamData.team_leader_id;
        } else if (field === 'team_members') {
          value = teamData.team_members;
        }
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
        }
      });
    }

    // Email uniqueness guard right before submit
    if (!isEmailAvailable) {
      errors.email = 'Email already registered';
    }
    
    // Validate optional fields that have values
    const optionalFields = ['phone', 'notes'];
    optionalFields.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
        }
      }
    });
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    console.log('Form input changed:', { name, value: newValue });
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Handle service category change - filter services
    if (name === 'service_category_id') {
      console.log('Category selected:', value, 'Type:', typeof value);
      console.log('Available services:', services);
      console.log('Sample service structure:', services[0]);
      console.log('Provider type:', providerType);
      
      const filtered = services.filter(service => {
        // Handle different possible category ID formats
        const serviceCategoryId = service.category_id || service.service_category_id;
        const serviceCategory = service.category;
        const selectedCategoryId = parseInt(value);
        
        // Check if service matches the selected category
        const categoryMatch = serviceCategoryId === selectedCategoryId || 
                             serviceCategoryId === value ||
                             serviceCategory === value ||
                             serviceCategory === selectedCategoryId;
        
        // For team creation, only show services with service_type = 'group'
        // For individual providers, only show services with service_type = 'individual'
        const serviceTypeMatch = providerType === 'team' 
          ? service.service_type === 'group'
          : service.service_type === 'individual';
        
        console.log('Service filtering:', {
          serviceName: service.name,
          serviceType: service.service_type,
          categoryMatch,
          serviceTypeMatch,
          providerType
        });
        
        return categoryMatch && serviceTypeMatch;
      });
      console.log('Filtered services:', filtered);
      setFilteredServices(filtered);
      // Clear service selection when category changes
      setFormData(prev => ({ ...prev, service_id: '', specialization: '' }));
      setSelectedService(null);
    }
    
    // Handle service selection - update specialization and basic pay
    if (name === 'service_id') {
      console.log('Service selected:', value, 'Type:', typeof value);
      const service = services.find(s => s.id === value);
      console.log('Found service:', service);
      console.log('Service category info:', {
        category_id: service?.category_id,
        service_category_id: service?.service_category_id,
        category: service?.category
      });
      setSelectedService(service);
      if (service) {
        const getServiceRupee = (s) => {
          const v = s.price_inr ?? s.wage_inr ?? s.wage ?? s.price;
          return v ?? '';
        };
        const rupeeValue = getServiceRupee(service);
        setFormData(prev => ({ 
          ...prev, 
          specialization: service.name,
          basic_pay: rupeeValue 
        }));
      }
    }
    
    // Mark as touched and validate
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, newValue);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleTeamDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setTeamData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Mark as touched and validate
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, newValue);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  // Enhanced toggle handler with animation
  const handleToggleChange = (e) => {
    setIsToggleAnimating(true);
    const newStatus = e.target.checked ? 'active' : 'pending_verification';
    
    setFormData(prev => ({ ...prev, status: newStatus }));
    setTouched(prev => ({ ...prev, status: true }));
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsToggleAnimating(false);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allFields = ['full_name', 'email', 'phone', 'service_category_id', 'service_id', 'specialization', 'status', 'notes'];
    const teamFields = ['team_name', 'max_members'];
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    if (providerType === 'team') {
      teamFields.forEach(field => {
        touchedFields[field] = true;
      });
    }
    setTouched(touchedFields);
    
    // Validate entire form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      if (providerType === 'individual') {
        // Create individual provider
        const result = await apiService.adminCreateProvider(formData);
        
        if (result && (result.user || result.message)) {
          const emailInfo = result.emailSent ? 'Email sent.' : (result.emailError ? `Email failed: ${result.emailError}.` : 'Email skipped.');
          setSuccessModal({
            open: true,
            title: 'Service Provider Created',
            message: `The provider account was created successfully. ${emailInfo}`
          });
        }
      } else {
        // Create team with selected team leader and existing provider members
        const teamPayload = {
          name: teamData.name,
          description: teamData.description,
          team_leader_id: teamData.team_leader_id, // Selected team leader ID
          service_category_id: formData.service_category_id,
          service_id: formData.service_id,
          max_members: teamData.max_members,
          team_member_ids: teamData.team_members // Array of existing provider IDs
        };
        
        
        // Create the team using existing providers
        const teamResult = await apiService.createTeamWithExistingProviders(teamPayload);
        
        if (teamResult && teamResult.team) {
          const memberCount = teamResult.memberCount || (1 + teamData.team_members.length);
          
          setSuccessModal({
            open: true,
            title: 'Team Created Successfully',
            message: `Team "${teamData.name}" has been created with ${memberCount} members (1 leader + ${teamData.team_members.length} team members). All members are existing verified workers. Notifications have been sent to all team members.`
          });
        }
      }
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        specialization: '',
        service_category_id: '',
        service_id: '',
        basic_pay: '',
        status: 'active',
        notes: '',
        sendEmail: true
      });
      setTeamData({
        name: '',
        description: '',
        max_members: 2,
        team_leader_id: null,
        team_members: []
      });
      setTouched({});
      setValidationErrors({});
      setSelectedService(null);
      
    } catch (error) {
      const msg = String(error?.message || '').toLowerCase();
      
      if (msg.includes('email already registered')) {
        setValidationErrors(prev => ({ ...prev, email: 'Email already registered' }));
      } else if (msg.includes('already part of')) {
        // Team creation error - provider already in another team
        setValidationErrors({ submit: error.message });
      } else if (msg.includes('not found') && providerType === 'team') {
        // Team creation error - provider not found
        setValidationErrors({ submit: 'One or more selected providers could not be found. Please refresh and try again.' });
      } else if (msg.includes('not a service provider') && providerType === 'team') {
        // Team creation error - user not a service provider
        setValidationErrors({ submit: 'One or more selected users are not service providers. Please select verified service providers only.' });
      } else {
        // Generic error message
        const errorMessage = providerType === 'team' 
          ? 'An error occurred while creating the team. Please check your connection and try again.'
          : 'An error occurred while creating the service provider. Please check your connection and try again.';
        setValidationErrors({ submit: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const statusOptions = [
    { value: 'pending_verification', label: 'Pending Verification', description: 'New provider awaiting approval' },
    { value: 'active', label: 'Active', description: 'Provider can accept jobs' },
    { value: 'suspended', label: 'Suspended', description: 'Temporarily disabled' },
    { value: 'inactive', label: 'Inactive', description: 'Permanently disabled' }
  ];

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
            <h1>Add Service Provider</h1>
            <p>Create a new service provider account or team with specialized permissions</p>
          </div>
        </motion.div>

        {/* Provider Type Selection */}
        <motion.div className="provider-type-selection" variants={itemVariants}>
          <div className="type-toggle">
            <button
              type="button"
              className={`type-option ${providerType === 'individual' ? 'active' : ''}`}
              onClick={() => setProviderType('individual')}
            >
              <User size={20} />
              <span>Individual Provider</span>
              <small>Single service provider</small>
            </button>
            <button
              type="button"
              className={`type-option ${providerType === 'team' ? 'active' : ''}`}
              onClick={() => setProviderType('team')}
            >
              <Users size={20} />
              <span>Team Provider</span>
              <small>Group of service providers</small>
            </button>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form 
          className="admin-form"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="form-sections">
            
            {/* Team Information (only for team type) */}
            {providerType === 'team' && (
              <div className="form-section">
                <h3>
                  <Users size={20} />
                  Team Information
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="team_name">Team Name *</label>
                    <div className="input-container">
                      <input
                        id="team_name"
                        name="team_name"
                        type="text"
                        value={teamData.name}
                        onChange={(e) => {
                          console.log('Team name input changed:', e.target.value);
                          const value = e.target.value;
                          setTeamData(prev => ({
                            ...prev,
                            name: value
                          }));
                          setTouched(prev => ({ ...prev, team_name: true }));
                          const error = validateField('team_name', value);
                          setValidationErrors(prev => ({ ...prev, team_name: error }));
                        }}
                        onBlur={() => setTouched(prev => ({ ...prev, team_name: true }))}
                        placeholder="e.g., Pest Control Team Alpha"
                        required
                        autoComplete="off"
                        maxLength={100}
                        className={`${touched.team_name && validationErrors.team_name ? 'error' : ''} ${touched.team_name && !validationErrors.team_name ? 'valid' : ''}`}
                        style={{
                          pointerEvents: 'auto !important',
                          cursor: 'text !important',
                          backgroundColor: '#ffffff !important',
                          border: '1px solid #d1d5db !important',
                          opacity: '1 !important',
                          zIndex: '9999 !important',
                          position: 'relative !important',
                          userSelect: 'text !important',
                          WebkitUserSelect: 'text !important',
                          MozUserSelect: 'text !important',
                          msUserSelect: 'text !important'
                        }}
                        onFocus={(e) => {
                          console.log('Team name input focused');
                          e.target.style.borderColor = '#4f9cf9';
                        }}
                        onKeyDown={(e) => {
                          console.log('Key pressed in team name:', e.key, 'Value:', e.target.value);
                        }}
                        onKeyUp={(e) => {
                          console.log('Key released in team name:', e.key, 'Value:', e.target.value);
                        }}
                        onInput={(e) => {
                          console.log('Input event in team name:', e.target.value);
                        }}
                      />
                      <div className="input-feedback">
                        {touched.team_name && validationErrors.team_name && (
                          <small className="error-text">{validationErrors.team_name}</small>
                        )}
                        {touched.team_name && !validationErrors.team_name && teamData.name && (
                          <small className="success-text">✓ Valid team name</small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="max_members">Maximum Team Members *</label>
                    <div className="input-container">
                      <div className="number-input-container" style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}>
                        <input
                          id="max_members"
                          name="max_members"
                          type="number"
                          value={teamData.max_members}
                          onChange={handleTeamDataChange}
                          onBlur={() => setTouched(prev => ({ ...prev, max_members: true }))}
                          placeholder="2"
                          min="2"
                          max="20"
                          required
                          className={`${touched.max_members && validationErrors.max_members ? 'error' : ''} ${touched.max_members && !validationErrors.max_members ? 'valid' : ''}`}
                          style={{
                            flex: '1',
                            border: 'none',
                            outline: 'none',
                            padding: '0.875rem 3rem 0.875rem 1rem',
                            fontSize: '1rem',
                            background: 'transparent',
                            borderRadius: '0'
                          }}
                        />
                        <div className="number-controls" style={{
                          position: 'absolute',
                          right: '0',
                          top: '0',
                          bottom: '0',
                          display: 'flex',
                          flexDirection: 'column',
                          background: '#f8fafc',
                          borderLeft: '1px solid #e2e8f0'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (teamData.max_members < 20) {
                                handleTeamDataChange({
                                  target: {
                                    name: 'max_members',
                                    value: teamData.max_members + 1,
                                    type: 'number'
                                  }
                                });
                              }
                            }}
                            disabled={teamData.max_members >= 20}
                            style={{
                              flex: '1',
                              border: 'none',
                              background: 'transparent',
                              cursor: teamData.max_members >= 20 ? 'not-allowed' : 'pointer',
                              padding: '0.25rem 0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: teamData.max_members >= 20 ? '#94a3b8' : '#374151',
                              transition: 'all 0.2s ease',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                              if (teamData.max_members < 20) {
                                e.target.style.background = '#e2e8f0';
                                e.target.style.color = '#1f2937';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = teamData.max_members >= 20 ? '#94a3b8' : '#374151';
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (teamData.max_members > 2) {
                                handleTeamDataChange({
                                  target: {
                                    name: 'max_members',
                                    value: teamData.max_members - 1,
                                    type: 'number'
                                  }
                                });
                              }
                            }}
                            disabled={teamData.max_members <= 2}
                            style={{
                              flex: '1',
                              border: 'none',
                              background: 'transparent',
                              cursor: teamData.max_members <= 2 ? 'not-allowed' : 'pointer',
                              padding: '0.25rem 0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: teamData.max_members <= 2 ? '#94a3b8' : '#374151',
                              transition: 'all 0.2s ease',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                              if (teamData.max_members > 2) {
                                e.target.style.background = '#e2e8f0';
                                e.target.style.color = '#1f2937';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = teamData.max_members <= 2 ? '#94a3b8' : '#374151';
                            }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      <div className="input-feedback">
                        {touched.max_members && validationErrors.max_members && (
                          <small className="error-text">{validationErrors.max_members}</small>
                        )}
                        {touched.max_members && !validationErrors.max_members && teamData.max_members && (
                          <small className="success-text">✓ Valid capacity</small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="team_description">Team Description</label>
                    <textarea
                      id="team_description"
                      name="description"
                      value={teamData.description}
                      onChange={handleTeamDataChange}
                      onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                      placeholder="Brief description of the team's expertise and capabilities..."
                      rows={3}
                      maxLength={500}
                      className={touched.description && validationErrors.description ? 'error' : ''}
                    />
                    <small className="form-help">Optional description of team capabilities and specializations</small>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information - Only for Individual Providers */}
            {providerType === 'individual' && (
              <div className="form-section">
                <h3>
                  <User size={20} />
                  Personal Information
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="full_name">Full Name *</label>
                    <div className="input-container">
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        onBlur={() => setTouched(prev => ({ ...prev, full_name: true }))}
                        placeholder="Enter first and last name"
                        required
                        autoComplete="off"
                        maxLength={30}
                        className={`${touched.full_name && validationErrors.full_name ? 'error' : ''} ${touched.full_name && !validationErrors.full_name ? 'valid' : ''}`}
                      />
                      <div className="input-feedback">
                        {touched.full_name && validationErrors.full_name && (
                          <small className="error-text">{validationErrors.full_name}</small>
                        )}
                        {touched.full_name && !validationErrors.full_name && formData.full_name && (
                          <small className="success-text">✓ Valid name</small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <div className="input-container">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                        placeholder="provider@example.com"
                        required
                        autoComplete="off"
                        maxLength={254}
                        className={`${touched.email && validationErrors.email ? 'error' : ''} ${touched.email && !validationErrors.email ? 'valid' : ''}`}
                      />
                      <div className="input-feedback">
                        {touched.email && validationErrors.email && (
                          <small className="error-text">{validationErrors.email}</small>
                        )}
                        {touched.email && !validationErrors.email && formData.email && (
                          <small className="success-text">✓ Valid email</small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-container">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                        placeholder="+91 98765 43210"
                        autoComplete="off"
                        maxLength={20}
                        className={`${touched.phone && validationErrors.phone ? 'error' : ''} ${touched.phone && !validationErrors.phone && formData.phone ? 'valid' : ''}`}
                      />
                      <div className="input-feedback">
                        {touched.phone && validationErrors.phone && (
                          <small className="error-text">{validationErrors.phone}</small>
                        )}
                        {touched.phone && !validationErrors.phone && formData.phone && (
                          <small className="success-text">✓ Valid phone number</small>
                        )}
                        <small className="field-help">Optional — Indian mobile format. Accepts +91/91/0 prefixes.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Leader Selection - Only for Team Providers */}
            {providerType === 'team' && (
              <div className="form-section">
                <h3>
                  <User size={20} />
                  Team Leader Selection
                </h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Select Team Leader *</label>
                    <div className="team-leader-selection" style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                      border: '1px solid rgba(226, 232, 240, 0.6)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}>
                      {formData.specialization ? (
                        <div>
                          <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                            Available Team Leaders
                            <span style={{ fontSize: '0.875rem', fontWeight: '400', color: '#64748b', marginLeft: '0.5rem' }}>
                              (Verified workers with specialization: "{formData.specialization}")
                            </span>
                          </h4>
                          
                          <div className="team-leaders-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1rem'
                          }}>
                            {filteredProviders.map(provider => (
                              <div 
                                key={provider.id} 
                                className={`team-leader-card ${teamData.team_leader_id === provider.id ? 'selected' : ''}`}
                                onClick={() => setTeamData(prev => ({ ...prev, team_leader_id: provider.id }))}
                                style={{
                                  background: teamData.team_leader_id === provider.id ? 'linear-gradient(135deg, rgba(79, 156, 249, 0.1), rgba(59, 130, 246, 0.1))' : '#ffffff',
                                  border: teamData.team_leader_id === provider.id ? '2px solid #4f9cf9' : '1px solid #e2e8f0',
                                  borderRadius: '12px',
                                  padding: '1rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <h5>{provider.user_profiles?.first_name} {provider.user_profiles?.last_name}</h5>
                                  <span style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '4px',
                                    fontSize: '0.625rem',
                                    fontWeight: '600'
                                  }}>
                                    VERIFIED
                                  </span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{provider.email}</p>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                  <p><strong>Specialization:</strong> {provider.service_provider_details?.specialization || 'No specialization'}</p>
                                  <p><strong>Status:</strong> {provider.service_provider_details?.status || provider.status || 'Active'}</p>
                                </div>
                                {teamData.team_leader_id === provider.id && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: '#4f9cf9',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem'
                                  }}>
                                    ✓
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {filteredProviders.length === 0 && (
                            <div style={{ 
                              textAlign: 'center', 
                              padding: '2rem', 
                              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05))',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: '12px',
                              margin: '1rem 0'
                            }}>
                              <div style={{ 
                                fontSize: '3rem', 
                                marginBottom: '1rem',
                                color: '#ef4444'
                              }}>
                                👥
                              </div>
                              <h4 style={{ 
                                color: '#dc2626', 
                                marginBottom: '0.5rem',
                                fontSize: '1.125rem',
                                fontWeight: '600'
                              }}>
                                No Available Workers
                              </h4>
                              <p style={{ 
                                color: '#64748b', 
                                marginBottom: '1rem',
                                fontSize: '0.875rem',
                                lineHeight: '1.5'
                              }}>
                                All verified workers with specialization "<strong>{formData.specialization}</strong>" are already assigned to other teams.
                              </p>
                              <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                color: '#7f1d1d'
                              }}>
                                <strong>💡 Suggestion:</strong> Try selecting a different specialization or wait for workers to become available.
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          <p>Please select a service first to see available team leaders</p>
                          <p style={{ fontSize: '0.875rem' }}>Team leaders will be selected from verified workers with the same specialization</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="info-box" style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                  <div className="info-item">
                    <CheckCircle size={16} />
                    <span><strong>Team Leader:</strong> Selected from existing verified workers with matching specialization</span>
                  </div>
                  <div className="info-item">
                    <CheckCircle size={16} />
                    <span><strong>Team Members:</strong> Additional verified workers can be added to the team</span>
                  </div>
                </div>
              </div>
            )}

            {/* Service Provider Details */}
            <div className="form-section">
              <h3>
                <Briefcase size={20} />
                Service Provider Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="service_category_id">Service Category *</label>
                  <div className="input-container">
                    <FancySelect
                      id="service_category_id"
                      name="service_category_id"
                      value={formData.service_category_id}
                      onChange={handleInputChange}
                      placeholder="Select a category"
                      disabled={false}
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                    />
                    <div className="input-feedback">
                      {touched.service_category_id && validationErrors.service_category_id && (
                        <small className="error-text">{validationErrors.service_category_id}</small>
                      )}
                      {touched.service_category_id && !validationErrors.service_category_id && formData.service_category_id && (
                        <small className="success-text">✓ Category selected</small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="service_id">Specific Service *</label>
                  <div className="input-container">
                    <FancySelect
                      id="service_id"
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleInputChange}
                      placeholder="Select a service"
                      disabled={!formData.service_category_id}
                      options={(filteredServices.length > 0 ? filteredServices : services).map(s => {
                        const rupee = s.price_inr ?? s.wage_inr ?? s.wage ?? s.price;
                        const display = typeof rupee === 'number' ? `₹${rupee}` : (rupee ? `₹${rupee}` : '₹N/A');
                        return { value: s.id, label: `${s.name} - ${display}` };
                      })}
                    />
                    <div className="input-feedback">
                      {touched.service_id && validationErrors.service_id && (
                        <small className="error-text">{validationErrors.service_id}</small>
                      )}
                      {touched.service_id && !validationErrors.service_id && formData.service_id && (
                        <small className="success-text">✓ Service selected</small>
                      )}
                      {!formData.service_category_id && (
                        <small className="field-help">Please select a category first</small>
                      )}
                      {selectedService && (
                        <small className="form-help">
                          Service Price: {(() => {
                            const rupee = selectedService.price_inr ?? selectedService.wage_inr ?? selectedService.wage ?? selectedService.price;
                            return rupee ? `₹${rupee}` : 'Not set';
                          })()} | 
                          Duration: {selectedService.duration || 'Not set'}
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    onBlur={() => setTouched(prev => ({ ...prev, specialization: true }))}
                    placeholder="Auto-filled from selected service"
                    className={touched.specialization && validationErrors.specialization ? 'error' : ''}
                    readOnly
                  />
                  {touched.specialization && validationErrors.specialization && (
                    <small className="error-text">{validationErrors.specialization}</small>
                  )}
                  <small className="form-help">
                    Specialization is automatically set based on the selected service
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="basic_pay">Basic Pay (₹)</label>
                  <div className="price-input-container">
                    <span className="currency-symbol">₹</span>
                    <input
                      id="basic_pay"
                      name="basic_pay"
                      type="number"
                      value={formData.basic_pay}
                      onChange={handleInputChange}
                      onBlur={() => setTouched(prev => ({ ...prev, basic_pay: true }))}
                      placeholder="0"
                      min="0"
                      step="1"
                      className={`${touched.basic_pay && validationErrors.basic_pay ? 'error' : ''}`}
                      readOnly
                    />
                  </div>
                  <small className="form-help">Auto-filled from the selected service price</small>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <div className="status-toggle-container">
                    <div className={`status-toggle ${isToggleAnimating ? 'animating' : ''}`}>
                      <input
                        type="checkbox"
                        id="status-toggle"
                        checked={formData.status === 'active'}
                        onChange={handleToggleChange}
                      />
                      <label htmlFor="status-toggle" className="toggle-label">
                        <span className="toggle-text">
                          {formData.status === 'active' ? 'Active & Available' : 'Pending Verification'}
                        </span>
                        <span className="toggle-description">
                          {formData.status === 'active' 
                            ? 'Service provider can receive bookings and is visible to customers'
                            : 'Service provider needs verification before becoming active'
                          }
                        </span>
                      </label>
                    </div>
                  </div>
                  {touched.status && validationErrors.status && (
                    <small className="error-text">{validationErrors.status}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members Selection (only for team type) */}
            {providerType === 'team' && (
              <div className="form-section">
                <h3>
                  <UserPlus size={20} />
                  Team Members
                </h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Select Team Members</label>
                    <div className="team-members-selection">
                      <div className="available-providers">
                        <h4>
                          Available Verified Workers
                          {formData.specialization && (
                            <span className="filter-indicator">
                              {formData.service_id ? ' (Same Service)' : formData.service_category_id ? ' (Same Category)' : ' (Same Specialization)'}
                            </span>
                          )}
                        </h4>
                        
                        {/* Team Formation Information */}
                        {(formData.specialization || formData.service_category_id) && (
                          <div className="service-grouping-info" style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08))',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ 
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                TEAM FORMATION
                              </span>
                              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                Verified Workers Selection
                              </span>
                            </div>
                            
                            <div style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                              <strong>Filtering Criteria:</strong>
                              <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                                <li>✅ <strong>Verified/Active Status:</strong> Only active service providers</li>
                                {formData.specialization && (
                                  <li>✅ <strong>Same Specialization:</strong> "{formData.specialization}"</li>
                                )}
                                {formData.service_category_id && (
                                  <li>✅ <strong>Same Category:</strong> {categories.find(c => c.id === formData.service_category_id)?.name || 'Selected Category'}</li>
                                )}
                                {formData.service_id && (
                                  <li>✅ <strong>Same Service:</strong> {selectedService?.name || 'Selected Service'}</li>
                                )}
                              </ul>
                            </div>
                            
                            <div style={{ 
                              background: 'rgba(16, 185, 129, 0.05)', 
                              padding: '0.75rem', 
                              borderRadius: '8px',
                              border: '1px solid rgba(16, 185, 129, 0.1)'
                            }}>
                              <strong style={{ color: '#059669' }}>Team Formation Logic:</strong>
                              <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}>
                                Admin selects verified workers with matching specialization to form a coordinated team.
                                Team leader manages assignments and bookings for the entire team.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="debug-info" style={{fontSize: '0.75rem', color: '#666', marginBottom: '1rem'}}>
                          Debug: Total providers: {availableProviders.length}, Verified workers: {filteredProviders.length}, 
                          Specialization: {formData.specialization || 'none'}, Category: {formData.service_category_id || 'none'}, Service: {formData.service_id || 'none'}
                        </div>
                        <div className="providers-grid">
                          {filteredProviders
                            .filter(provider => !teamData.team_members.includes(provider.id) && provider.id !== teamData.team_leader_id)
                            .length === 0 ? (
                            <div className="no-providers-message">
                              <div className="no-providers-icon">🔍</div>
                              <p>No verified workers found</p>
                              <p className="hint">
                                {formData.specialization 
                                  ? `No verified workers with specialization "${formData.specialization}" found`
                                  : formData.service_category_id 
                                    ? 'No verified workers in this category found'
                                    : 'Please select a service category and specialization first'
                                }
                              </p>
                            </div>
                          ) : (
                            filteredProviders
                              .filter(provider => !teamData.team_members.includes(provider.id) && provider.id !== teamData.team_leader_id)
                              .map(provider => (
                              <div key={provider.id} className="provider-card">
                                <div className="provider-info">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h5>{provider.user_profiles?.first_name} {provider.user_profiles?.last_name}</h5>
                                    <span style={{
                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                      color: 'white',
                                      padding: '0.125rem 0.375rem',
                                      borderRadius: '4px',
                                      fontSize: '0.625rem',
                                      fontWeight: '600'
                                    }}>
                                      VERIFIED
                                    </span>
                                  </div>
                                  <p>{provider.email}</p>
                                  <div className="provider-details">
                                    <p className="specialization">
                                      <strong>Specialization:</strong> {provider.service_provider_details?.specialization || 'No specialization'}
                                    </p>
                                    {provider.service_provider_details?.service_category_id && (
                                      <p className="service-category">
                                        <strong>Category:</strong> {
                                          categories.find(c => c.id === provider.service_provider_details.service_category_id)?.name || 
                                          'Unknown Category'
                                        }
                                      </p>
                                    )}
                                    {provider.service_provider_details?.service_id && (
                                      <p className="service-specific">
                                        <strong>Service:</strong> {
                                          services.find(s => s.id === provider.service_provider_details.service_id)?.name || 
                                          'Unknown Service'
                                        }
                                      </p>
                                    )}
                                    <p className="verification-status" style={{ color: '#059669', fontWeight: '500' }}>
                                      <strong>Status:</strong> {provider.service_provider_details?.status || provider.status || 'Active'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="add-member-btn"
                                  onClick={() => handleAddTeamMember(provider.id)}
                                  disabled={teamData.team_members.length >= teamData.max_members - 1}
                                >
                                  <UserPlus size={16} />
                                  Add to Team
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="selected-members">
                        <h4>Team Structure ({teamData.team_members.length + (teamData.team_leader_id ? 1 : 0)}/{teamData.max_members})</h4>
                        
                        {/* Team Leader Display */}
                        {teamData.team_leader_id && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Team Leader</h5>
                            {(() => {
                              const leader = filteredProviders.find(p => p.id === teamData.team_leader_id);
                              return leader ? (
                                <div className="member-card" style={{ background: 'linear-gradient(135deg, rgba(79, 156, 249, 0.1), rgba(59, 130, 246, 0.1))', border: '2px solid #4f9cf9' }}>
                                  <div className="member-info">
                                    <h5>{leader.user_profiles?.first_name} {leader.user_profiles?.last_name}</h5>
                                    <p>{leader.email}</p>
                                    <div className="member-details">
                                      <span className="member-role" style={{ background: 'rgba(79, 156, 249, 0.2)', color: '#1e40af' }}>Team Leader</span>
                                      {leader.service_provider_details?.specialization && (
                                        <span className="member-specialization">
                                          {leader.service_provider_details.specialization}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="member-actions">
                                    <span className="member-status" style={{ color: '#059669' }}>Active</span>
                                    <button
                                      type="button"
                                      className="remove-member-btn"
                                      onClick={() => setTeamData(prev => ({ ...prev, team_leader_id: null }))}
                                      title="Remove team leader"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                        
                        {/* Team Members Display */}
                        <div>
                          <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                            Team Members ({teamData.team_members.length})
                          </h5>
                          <div className="members-list">
                          {teamData.team_members.map(memberId => {
                            const member = filteredProviders.find(p => p.id === memberId);
                            return member ? (
                              <div key={memberId} className="member-card">
                                <div className="member-info">
                                  <h5>{member.user_profiles?.first_name} {member.user_profiles?.last_name}</h5>
                                  <p>{member.email}</p>
                                  <div className="member-details">
                                    <span className="member-role">Team Member</span>
                                    {member.service_provider_details?.specialization && (
                                      <span className="member-specialization">
                                        {member.service_provider_details.specialization}
                                      </span>
                                    )}
                                    {member.service_provider_details?.service_category_id && (
                                      <span className="member-category">
                                        {categories.find(c => c.id === member.service_provider_details.service_category_id)?.name || 'Unknown'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="member-actions">
                                  <span className="member-status">Active</span>
                                  <button
                                    type="button"
                                    className="remove-member-btn"
                                    onClick={() => handleRemoveTeamMember(memberId)}
                                    title="Remove team member"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : null;
                          })}
                          </div>
                        </div>
                        {teamData.team_members.length === 0 && (
                          <div className="empty-members">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <p>No team members selected yet</p>
                            <p className="hint">Click on available providers to add them to your team</p>
                            {validationErrors.team_members && (
                              <p className="error-text" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                {validationErrors.team_members}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="form-section">
              <h3>
                <FileText size={20} />
                Additional Information
              </h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    onBlur={() => setTouched(prev => ({ ...prev, notes: true }))}
                    placeholder="Additional notes about this service provider..."
                    rows={4}
                    className={touched.notes && validationErrors.notes ? 'error' : ''}
                  />
                  {touched.notes && validationErrors.notes && (
                    <small className="error-text">{validationErrors.notes}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Account Creation Settings */}
            <div className="form-section">
              <h3>
                <Settings size={20} />
                Account Creation Settings
              </h3>
              <div className="form-grid">
                {providerType === 'individual' && (
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="sendEmail"
                        checked={formData.sendEmail}
                        onChange={handleInputChange}
                      />
                      <span>Send credentials via email</span>
                    </label>
                    <small className="form-help">
                      A secure password will be auto-generated and sent to the provider's email
                    </small>
                  </div>
                )}
                {providerType === 'team' && (
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="sendEmail"
                        checked={formData.sendEmail}
                        onChange={handleInputChange}
                      />
                      <span>Send team leader credentials via email</span>
                    </label>
                    <small className="form-help">
                      A secure password will be auto-generated and sent to the team leader's email
                    </small>
                  </div>
                )}
              </div>
              
              <div className="info-box">
                {providerType === 'individual' ? (
                  <>
                    <div className="info-item">
                      <CheckCircle size={16} />
                      <span>A secure password will be auto-generated automatically</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle size={16} />
                      <span>Credentials will be sent to the provider's email if enabled</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle size={16} />
                      <span>Provider will be created with "pending_verification" status</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-item">
                      <CheckCircle size={16} />
                      <span>Team leader account will be created with auto-generated password</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle size={16} />
                      <span>Team members are existing providers (no new accounts needed)</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle size={16} />
                      <span>Team leader will manage team assignments and bookings</span>
                    </div>
                    <div className="info-item">
                      <CheckCircle size={16} />
                      <span>Only team leader will receive email notifications</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Error Display */}
          {validationErrors.submit && (
            <motion.div className="submit-error" variants={itemVariants}>
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h4>Submission Error</h4>
                <p>{validationErrors.submit}</p>
              </div>
            </motion.div>
          )}

          {/* Form Actions */}
          <motion.div className="form-actions" variants={itemVariants}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard/admin')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  {providerType === 'team' ? 'Creating Team...' : 'Creating Provider...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {providerType === 'team' ? 'Create Team' : 'Create Service Provider'}
                </>
              )}
            </button>
          </motion.div>
        </motion.form>

        {/* Success Modal */}
        {successModal.open && (
          <div className="provider-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setSuccessModal({ open: false, title: '', message: '' })}>
            <div className="provider-modal" onClick={(e) => e.stopPropagation()}>
              <div className="provider-modal-icon">✅</div>
              <h3 className="provider-modal-title">{successModal.title}</h3>
              <p className="provider-modal-message">{successModal.message}</p>
              <div className="provider-modal-actions">
                <button className="btn-primary" onClick={() => {
                  setSuccessModal({ open: false, title: '', message: '' });
                  navigate('/dashboard/admin');
                }}>Go to Dashboard</button>
                <button className="btn-secondary" onClick={() => setSuccessModal({ open: false, title: '', message: '' })}>Stay Here</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AddServiceProviderPage;