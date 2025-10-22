import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import EditableProfileSections from '../../components/EditableProfileSections';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { 
  User, 
  LogOut, 
  Home, 
  Calendar, 
  Settings, 
  DollarSign, 
  CheckCircle, 
  Star, 
  Briefcase, 
  TrendingUp,
  Bell,
  Search,
  Filter,
  Clock,
  MapPin,
  Phone,
  Mail,
  Play,
  X,
  Circle,
  MessageCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  FileText,
  Receipt,
  Activity,
  BarChart3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Users,
  Zap,
  Package,
  Navigation,
  Timer,
  Award,
  Target,
  Clipboard,
  Key,
  BookOpen,
  Globe,
  Smartphone,
  Heart,
  Flag,
  AlertTriangle,
  CheckSquare,
  Square,
  Pause,
  PlayCircle,
  StopCircle,
  Map,
  Navigation2,
  MessageSquare,
  PhoneCall,
  FileImage,
  Image,
  Paperclip,
  Send,
  Archive,
  Trash,
  MoreHorizontal,
  Plus,
  ExternalLink,
  Copy,
  Save,
  EyeOff,
  Lock,
  Unlock,
  ShieldCheck,
  Info,
  HelpCircle,
  Lightbulb,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Percent,
  Calculator,
  Clock4,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarSearch,
  CalendarClock,
  CalendarHeart,
  CalendarRange,
  Camera
} from 'lucide-react';
import Logo from '../../components/Logo';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProfileCompletionModal from '../../components/ProfileCompletionModal';
import './ServiceProviderDashboard.css';
import { apiService } from '../../services/api';

const ServiceProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providerDetails, setProviderDetails] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [isLoadingProviderProfile, setIsLoadingProviderProfile] = useState(true);

  // Animation states
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    earnings: 0,
    requests: 0,
    jobs: 0,
    rating: 0
  });

  // Respect user reduced-motion preferences
  const prefersReducedMotion = useReducedMotion();

  // Animation variants
  const containerStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.05
      }
    }
  };

  const itemRise = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.15 : 0.35, ease: 'easeOut' }
    }
  };

  const softHover = {
    whileHover: prefersReducedMotion ? {} : { y: -3, scale: 1.02 },
    whileTap: prefersReducedMotion ? {} : { scale: 0.98 }
  };

  // Subtle animated glow for the header card
  const glowKeyframes = prefersReducedMotion
    ? {}
    : { boxShadow: [
        '0 8px 24px rgba(79,156,249,0.06)',
        '0 12px 32px rgba(139,92,246,0.10)',
        '0 8px 24px rgba(79,156,249,0.06)'
      ] };

  // Loading states for different data sections
  const [jobsLoading, setJobsLoading] = useState(false);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Custom hook for animated counters
  const useAnimatedCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let startTime;
      const startValue = 0;
      
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [end, duration]);
    
    return count;
  };

  // Animated counters
  const animatedEarnings = useAnimatedCounter(2850, 2500);
  const animatedRequests = useAnimatedCounter(12, 1800);
  const animatedJobs = useAnimatedCounter(48, 2000);
  const animatedRating = useAnimatedCounter(4.9, 2200);


  // Helpers to format role/status labels
  const toTitleCase = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Data loading function
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setJobsLoading(true);
        setEarningsLoading(true);
        setProfileLoading(true);
      }
      
      // Simulate API calls for different data sections
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, 800)), // Jobs
        new Promise(resolve => setTimeout(resolve, 600)), // Notifications
        new Promise(resolve => setTimeout(resolve, 400)), // Earnings
        new Promise(resolve => setTimeout(resolve, 500))  // Profile
      ]);
      
      // Load logged-in user's profile and role details
      if (user?.id) {
        try {
          const profileData = await apiService.getUserProfile(user.id);
          // Compose readable name and contact
          const firstName = profileData?.profile?.first_name || '';
          const lastName = profileData?.profile?.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          setProfile(prev => ({
            ...prev,
            name: fullName || prev.name || profileData?.email || 'Service Provider',
            email: profileData?.email || prev.email,
            phone: profileData?.profile?.phone || prev.phone
          }));
          setProviderDetails({
            ...(profileData?.roleDetails || {}),
            role: profileData?.role || 'service_provider'
          });
          
          // Update profile with service provider details from database
          console.log('Profile data from database:', profileData?.roleDetails);
          setProfile(prev => ({
            ...prev,
            service_category: profileData?.roleDetails?.service_category_name || '',
            service: profileData?.roleDetails?.service_name || '',
            experience_years: profileData?.roleDetails?.experience_years || 0,
            hourly_rate: parseFloat(profileData?.roleDetails?.basic_pay) || 0, // Using basic_pay field
            availability: profileData?.roleDetails?.availability || prev.availability
          }));
          
          // Profile completion check will be handled in useEffect after data is loaded
        } catch (e) {
          console.error('Failed to load provider profile:', e);
        }
      }
      
      if (isRefresh) {
        toast.success('Dashboard data refreshed');
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      setJobsLoading(false);
      setNotificationsLoading(false);
      setEarningsLoading(false);
      setProfileLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch provider profile from provider_profiles table
  const fetchProviderProfile = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingProviderProfile(true);
      const profileData = await apiService.getProviderProfile(user.id);
      setProviderProfile(profileData?.data || null);
    } catch (error) {
      console.error('Failed to fetch provider profile:', error);
      setProviderProfile(null);
    } finally {
      setIsLoadingProviderProfile(false);
    }
  };

  // Fetch bookings assigned to this service provider
  const fetchProviderBookings = async () => {
    if (!user?.id) return;
    
    try {
      setJobsLoading(true);
      setJobsError(null);
      
      const response = await apiService.getProviderBookings(user.id, {
        limit: 50,
        offset: 0
      });
      
      setJobs(response.bookings || []);
    } catch (error) {
      console.error('Failed to fetch provider bookings:', error);
      setJobsError('Failed to load bookings. Please try again.');
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Fetch bookings matching this service provider's specialization
  const fetchMatchingBookings = async () => {
    if (!user?.id) return;
    
    try {
      const response = await apiService.getMatchingBookings(user.id, {
        limit: 20,
        offset: 0
      });
      
      setMatchingJobs(response.bookings || []);
    } catch (error) {
      console.error('Failed to fetch matching bookings:', error);
      setMatchingJobs([]);
    }
  };

  // Refresh dashboard data
  const handleRefresh = () => {
    loadDashboardData(true);
    fetchProviderProfile(); // Also refresh provider profile
    fetchProviderBookings(); // Refresh bookings
    fetchMatchingBookings(); // Refresh matching bookings
  };

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Load dashboard data
    loadDashboardData();
    
    // Load provider profile
    fetchProviderProfile();
    
    // Load booking data
    fetchProviderBookings();
    fetchMatchingBookings();
    
    return () => clearTimeout(timer);
  }, []);

  // Real booking data - fetched from API
  const [jobs, setJobs] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [jobsError, setJobsError] = useState(null);

  // Use the real notifications system
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    markAsRead, 
    markAllAsRead,
    dismissNotification,
    getNotificationIcon,
    getNotificationColor 
  } = useNotifications();

  const [earnings, setEarnings] = useState([
    { id: 1, customer: "Emma Davis", service: "Garden Maintenance", amount: 60, date: "2024-01-13", status: "completed" },
    { id: 2, customer: "Mike Wilson", service: "Electrical Work", amount: 200, date: "2024-01-14", status: "in_progress" },
    { id: 3, customer: "Sarah Johnson", service: "Plumbing Repair", amount: 120, date: "2024-01-15", status: "pending" }
  ]);

  const [ratings, setRatings] = useState([
    {
      id: 1,
      customer: "Emma Davis",
      rating: 5,
      review: "Excellent work! Very professional and thorough.",
      date: "2024-01-13",
      service: "Garden Maintenance"
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      rating: 4,
      review: "Good service, arrived on time and completed the work efficiently.",
      date: "2024-01-12",
      service: "Plumbing Repair"
    }
  ]);

  const [profile, setProfile] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    skills: ["House Cleaning", "Plumbing", "Electrical Work", "Garden Maintenance"],
    specialization: "",
    service_category: "",
    service: "",
    experience_years: 0,
    hourly_rate: 0,
    availability: {
      monday: { start: "08:00", end: "17:00", available: true },
      tuesday: { start: "08:00", end: "17:00", available: true },
      wednesday: { start: "08:00", end: "17:00", available: true },
      thursday: { start: "08:00", end: "17:00", available: true },
      friday: { start: "08:00", end: "17:00", available: true },
      saturday: { start: "09:00", end: "15:00", available: true },
      sunday: { start: "09:00", end: "15:00", available: false }
    },
    notificationSettings: {
      newJobs: true,
      scheduleChanges: true,
      payments: true,
      reviews: true,
      emergency: true
    }
  });

  // State for profile completion progress
  const [profileCompletionStep, setProfileCompletionStep] = useState(1);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isProfileCheckReady, setIsProfileCheckReady] = useState(false);
  const [personalInfoComplete, setPersonalInfoComplete] = useState(false);
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Check if personal information is complete
  const checkPersonalInfoComplete = () => {
    const hasName = profile.name && profile.name.trim().length > 0;
    const hasPhone = profile.phone && profile.phone.trim().length > 0;
    const hasEmail = profile.email && profile.email.trim().length > 0;
    return hasName && hasPhone && hasEmail;
  };

  // Check if all profile information is complete
  const checkProfileComplete = () => {
    const personalComplete = checkPersonalInfoComplete();
    // Check if service provider details exist in database
    const hasServiceDetails = providerDetails && 
      providerDetails.service_category_id && 
      providerDetails.service_id && 
      providerDetails.specialization &&
      providerDetails.experience_years !== undefined &&
      providerDetails.basic_pay !== undefined;
    
    // Check if provider profile exists in provider_profiles table
    const hasProviderProfile = providerProfile && 
      providerProfile.first_name && 
      providerProfile.last_name && 
      providerProfile.phone && 
      providerProfile.pincode && 
      providerProfile.city && 
      providerProfile.state && 
      providerProfile.address;
    
    return personalComplete && hasServiceDetails && hasProviderProfile;
  };

  // Update profile completion status when inputs are ready
  useEffect(() => {
    // Only evaluate completeness after provider profile fetch completes
    if (providerDetails === null || isLoadingProviderProfile) {
      setIsProfileCheckReady(false);
      return;
    }

    const personalComplete = checkPersonalInfoComplete();
    const allComplete = checkProfileComplete();

    setPersonalInfoComplete(personalComplete);
    setIsProfileComplete(allComplete);
    setIsProfileCheckReady(true);

    // If personal info is complete but not all info, move to step 2
    if (personalComplete && !allComplete && profileCompletionStep === 1) {
      setProfileCompletionStep(2);
    }
  }, [profile, providerDetails, providerProfile, isLoadingProviderProfile]);

  // Check profile completion after data is loaded and show modal if incomplete
  useEffect(() => {
    if (!isProfileCheckReady) return;
    if (providerDetails !== null && profile.name !== '') {
      if (!isProfileComplete && activeTab !== 'profile') {
        // Only show modal if not already on profile tab
        setTimeout(() => setIsProfileCompletionOpen(true), 300);
      }
    }
  }, [isProfileCheckReady, isProfileComplete, providerDetails, profile.name, activeTab]);

  // Handle personal information completion
  const handlePersonalInfoComplete = () => {
    if (checkPersonalInfoComplete()) {
      setProfileCompletionStep(2);
      toast.success('Personal information saved! Now add your service details.');
    } else {
      toast.error('Please fill in all personal information fields.');
    }
  };

  const stats = [
    { label: "Active Requests", value: animatedRequests.toString(), icon: Calendar, color: "#4f9cf9", change: "+3" },
    { label: "Completed Jobs", value: animatedJobs.toString(), icon: CheckCircle, color: "#8b5cf6", change: "+5" },
    { label: "Client Rating", value: animatedRating.toFixed(1), icon: Star, color: "#f59e0b", change: "+0.2" },
    { label: "Hourly Rate", value: `₹${profile.hourly_rate.toLocaleString('en-IN')}`, icon: DollarSign, color: "#059669", change: "Current" }
  ];

  const navigationItems = [
    { key: 'home', label: 'Overview', icon: Home },
    { key: 'jobs', label: 'My Jobs', icon: Briefcase },
    { key: 'earnings', label: 'Earnings', icon: DollarSign },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'profile', label: 'Profile', icon: User, incomplete: isProfileCheckReady ? !isProfileComplete : false },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside user dropdown
      const userMenu = document.querySelector('.user-menu');
      if (userMenu && !userMenu.contains(event.target)) {
        console.log('👤 Click outside user menu, closing dropdown');
        setIsProfileOpen(false);
      }
      
      // Check if click is outside notifications dropdown
      const notificationsDropdown = document.querySelector('.notifications-dropdown');
      if (notificationsDropdown && !notificationsDropdown.contains(event.target)) {
        console.log('🔔 Click outside notifications, closing dropdown');
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    console.log('🚪 Logout button clicked');
    setIsLoggingOut(true);
    
    try {
      console.log('🚪 Calling logout function...');
      await logout();
      console.log('🚪 Logout successful, navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('🚪 Logout error:', error);
      toast.error('Logout failed. Please try again.');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileCompletion = () => {
    // Refresh dashboard data after profile completion
    loadDashboardData(true);
    setIsProfileCompletionOpen(false);
    // Reset profile completion step
    setProfileCompletionStep(1);
  };

  const handleJobAction = async (jobId, action) => {
    setActionLoading(true);
    try {
      // Update booking status via API
      await apiService.updateBookingStatus(jobId, action);
      
      // Update local state
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return { ...job, status: action };
        }
        return job;
      }));
      
      toast.success(`Job ${action} successfully`);
    } catch (error) {
      console.error('Failed to update job status:', error);
      toast.error(`Failed to ${action} job`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle accepting a job (assigning it to this provider)
  const handleAcceptJob = async (jobId) => {
    setActionLoading(true);
    try {
      // Assign booking to this provider
      await apiService.assignBooking(jobId, user.id);
      
      // Update local state - move from matching jobs to assigned jobs
      setMatchingJobs(prev => prev.filter(job => job.id !== jobId));
      
      // Refresh both lists to get updated data
      fetchProviderBookings();
      fetchMatchingBookings();
      
      toast.success('Job accepted successfully!');
    } catch (error) {
      console.error('Failed to accept job:', error);
      toast.error('Failed to accept job. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, status) => {
    setActionLoading(true);
    try {
      // Update booking status via API
      await apiService.updateBookingStatus(jobId, status);
      
      // Update local state
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return { ...job, status };
        }
        return job;
      }));
      
      toast.success(`Job status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update job status:', error);
      toast.error(`Failed to update job status`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProgressNote = (jobId, note) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          progressNotes: [...job.progressNotes, { note, timestamp: new Date().toISOString() }]
        };
      }
      return job;
    }));
    
    toast.success('Progress note added');
  };

  const handleUploadCompletionPhoto = (jobId, photo) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          completionPhotos: [...job.completionPhotos, photo]
        };
      }
      return job;
    }));
    
    toast.success('Completion photo uploaded');
  };

  const handleEmergencyAlert = (jobId, message) => {
    toast.error(`Emergency alert sent: ${message}`);
    // In real app, this would send to admin/supervisor
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      in_progress: '#3b82f6',
      completed: '#8b5cf6',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      in_progress: Play,
      completed: CheckCircle,
      cancelled: X
    };
    return icons[status] || Circle;
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    return (
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Prefer provider profile experience when available
  const mergedExperienceYears = (
    providerProfile?.years_of_experience ?? providerDetails?.experience_years ?? 0
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <motion.div 
      className="loading-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="skeleton-stats">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="skeleton-stat-card">
            <div className="skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
              <div className="skeleton-line skeleton-change"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton-jobs">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="skeleton-job-card">
            <div className="skeleton-job-header">
              <div className="skeleton-line skeleton-service"></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-job-details">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className={`professional-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Logo size="small" />
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((item, index) => (
            <motion.button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false); // Close sidebar on mobile after navigation
              }}
              title={sidebarCollapsed ? item.label : ''}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
              whileHover={{ 
                x: sidebarCollapsed ? 0 : 8,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05 + 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <item.icon size={20} />
              </motion.div>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                  className="nav-item-content"
                >
                  <span>{item.label}</span>
                  {item.incomplete && (
                    <span className="incomplete-indicator" title="Profile incomplete">
                      <AlertCircle size={12} />
                    </span>
                  )}
                </motion.div>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={16} className={sidebarCollapsed ? 'rotate' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button 
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-item">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {navigationItems.find(item => item.key === activeTab)?.label}
                {providerDetails?.specialization && activeTab === 'home' && (
                  <span className="breadcrumb-specialization"> • {providerDetails.specialization}</span>
                )}
              </span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="search-container">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search jobs, customers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="header-actions">
              <button 
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh dashboard data"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
              
              <button 
                className="notification-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        className="mark-all-read"
                        onClick={markAllAsRead}
                        disabled={notificationsLoading}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">
                        <Bell size={32} />
                        <p>No new notifications</p>
                        <span>You're all caught up!</span>
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(item => (
                        <div 
                          key={item.id} 
                          className={`notification-item ${item.type} ${item.status === 'unread' ? 'unread' : ''}`}
                        >
                          <div 
                            className="notification-content-wrapper"
                            onClick={() => {
                              if (item.status === 'unread') {
                                markAsRead(item.id);
                              }
                            }}
                            style={{ cursor: item.status === 'unread' ? 'pointer' : 'default' }}
                          >
                            <div className="notification-icon-wrapper">
                              <span className="notification-emoji">
                                {getNotificationIcon(item.type)}
                              </span>
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">{item.title}</div>
                              <div className="notification-message">{item.message}</div>
                              <div className="notification-time">{item.time}</div>
                            </div>
                            {item.status === 'unread' && (
                              <div 
                                className="unread-indicator"
                                style={{ backgroundColor: getNotificationColor(item.priority) }}
                              />
                            )}
                          </div>
                          <button 
                            className="notification-dismiss-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(item.id);
                            }}
                            title="Dismiss notification"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
                  <div className="user-menu">
                    <button 
                      className="user-profile-card"
                      onClick={(e) => {
                        console.log('👤 User button clicked, current state:', isProfileOpen);
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileOpen(!isProfileOpen);
                      }}
                    >
                      <div className="profile-card-content">
                        <div className="profile-avatar-section">
                          <div className="profile-avatar">
                            {(() => {
                              // Priority: Provider profile photo > User metadata avatar
                              const avatar = providerProfile?.profile_photo_url || 
                                           user?.user_metadata?.avatar_url || 
                                           user?.user_metadata?.picture || 
                                           user?.user_metadata?.photoURL;
                              return avatar ? (
                                <img src={avatar} alt="Profile" />
                              ) : (
                                <User size={20} />
                              );
                            })()}
                          </div>
                          <div className="online-indicator"></div>
                        </div>
                        
                        <div className="profile-details">
                          <div className="profile-name">
                            {providerProfile?.first_name && providerProfile?.last_name 
                              ? `${providerProfile.first_name} ${providerProfile.last_name}`
                              : profile.name || 'Service Provider'
                            }
                          </div>
                          <div className="profile-specialization">{providerDetails?.specialization || 'Service Provider'}</div>
                        </div>
                        
                        <div className="profile-status">
                          <div className={`status-badge ${providerDetails?.status === 'pending_verification' ? 'pending' : 'active'}`}>
                            {providerDetails?.status === 'pending_verification' ? (
                              <>
                                <Clock size={10} />
                                <span>Pending</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={10} />
                                <span>Active</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                
                {isProfileOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {(() => {
                          // Priority: Provider profile photo > User metadata avatar
                          const avatar = providerProfile?.profile_photo_url || 
                                       user?.user_metadata?.avatar_url || 
                                       user?.user_metadata?.picture || 
                                       user?.user_metadata?.photoURL;
                          return avatar ? (
                            <img src={avatar} alt="Profile" />
                          ) : (
                            <User size={20} />
                          );
                        })()}
                      </div>
                      <div>
                        <h4>
                          {providerProfile?.first_name && providerProfile?.last_name 
                            ? `${providerProfile.first_name} ${providerProfile.last_name}`
                            : profile.name
                          }
                        </h4>
                        <p>{profile.email}</p>
                        {providerDetails?.specialization && (
                          <p className="user-specialization">{providerDetails.specialization}</p>
                        )}
                        {providerDetails?.service_category_name && (
                          <p className="user-category">{providerDetails.service_category_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="dropdown-actions">
                      <button onClick={() => setActiveTab('profile')}>
                        <User size={16} />
                        Profile Settings
                      </button>
                      <button onClick={() => setIsChangePasswordModalOpen(true)}>
                        <Key size={16} />
                        Change Password
                      </button>
                      <hr />
                      <button 
                        onClick={(e) => {
                          console.log('🚪 Logout button clicked, event:', e);
                          e.preventDefault();
                          e.stopPropagation();
                          handleLogout();
                        }} 
                        className="logout-btn" 
                        disabled={isLoggingOut}
                        type="button"
                      >
                        {isLoggingOut ? <LoadingSpinner size="small" /> : <LogOut size={16} />}
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        

        {/* Page Content */}
        <div className="page-content">
          {/* Home Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
              {/* Service Provider Information Card */}
              {providerDetails && (
                <motion.div 
                  className="provider-info-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, ...glowKeyframes }}
                  transition={{ delay: 0.15, duration: prefersReducedMotion ? 0.2 : 0.5, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: 'mirror', repeatDelay: 4 }}
                >
                  <div className="provider-info-header">
                    <div className="provider-avatar">
                      <User size={24} />
                    </div>
                    <div className="provider-details">
                      <h3>{profile.name || 'Service Provider'}</h3>
                      <p className="provider-role">
                        {toTitleCase(providerDetails.role || 'service_provider')} • 
                        {providerDetails.status ? ` ${toTitleCase(providerDetails.status)}` : ' Active'}
                      </p>
                    </div>
                    <div className="provider-status">
                      <div className={`status-indicator ${providerDetails.status === 'pending_verification' ? 'pending' : 'active'}`}>
                        {providerDetails.status === 'pending_verification' ? <Clock size={12} /> : <CheckCircle size={12} />}
                      </div>
                    </div>
                  </div>
                  
                  <motion.div className="provider-specialization" variants={containerStagger} initial="hidden" animate="show">
                    <motion.div className="specialization-item" variants={itemRise} whileHover={softHover.whileHover} whileTap={softHover.whileTap}>
                      <div className="specialization-icon">
                        <Briefcase size={16} />
                      </div>
                      <div className="specialization-content">
                        <span className="specialization-label">Specialization</span>
                        <span className="specialization-value">{providerDetails.specialization || 'Not specified'}</span>
                      </div>
                    </motion.div>
                    
                    <motion.div className="specialization-item" variants={itemRise} whileHover={softHover.whileHover} whileTap={softHover.whileTap}>
                      <div className="specialization-icon">
                        <Package size={16} />
                      </div>
                      <div className="specialization-content">
                        <span className="specialization-label">Category</span>
                        <span className="specialization-value">{providerDetails.service_category_name || 'Not selected'}</span>
                      </div>
                    </motion.div>
                    
                    <motion.div className="specialization-item" variants={itemRise} whileHover={softHover.whileHover} whileTap={softHover.whileTap}>
                      <div className="specialization-icon">
                        <Target size={16} />
                      </div>
                      <div className="specialization-content">
                        <span className="specialization-label">Service</span>
                        <span className="specialization-value">{providerDetails.service_name || 'Not selected'}</span>
                      </div>
                    </motion.div>
                    
                    {mergedExperienceYears !== undefined && (
                      <motion.div className="specialization-item" variants={itemRise} whileHover={softHover.whileHover} whileTap={softHover.whileTap}>
                        <div className="specialization-icon">
                          <Award size={16} />
                        </div>
                        <div className="specialization-content">
                          <span className="specialization-label">Experience</span>
                          <span className="specialization-value">{mergedExperienceYears} years</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Stats Cards */}
              <div className="stats-section">
                <div className="stats-grid">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index} 
                      className="stat-card"
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div 
                        className="stat-icon" 
                        style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1 + 0.3,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <stat.icon size={24} />
                      </motion.div>
                      <div className="stat-content">
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                        >
                          {stat.value}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.6 }}
                        >
                          {stat.label}
                        </motion.p>
                        <motion.div 
                          className="stat-change positive"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.7 }}
                        >
                          <TrendingUp size={14} />
                          {stat.change}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Matching Jobs - Jobs that match your specialization */}
              {matchingJobs.length > 0 && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Jobs Matching Your Specialization</h2>
                    <div className="section-subtitle">
                      <Target size={16} />
                      <span>{providerDetails?.specialization || 'Your specialization'}</span>
                    </div>
                  </div>
                  <div className="jobs-grid">
                    {matchingJobs.slice(0, 4).map((job, index) => (
                      <motion.div 
                        key={job.id} 
                        className={`job-card ${job.isAssigned ? 'assigned' : 'available'}`}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1 + 0.8,
                          type: "spring",
                          stiffness: 120,
                          damping: 20
                        }}
                        whileHover={{ 
                          scale: 1.03, 
                          y: -8,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <motion.div 
                          className="job-header"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 1.0 }}
                        >
                          <h4>{job.serviceType}</h4>
                          <div className="job-badges">
                            <motion.span 
                              className="status-badge" 
                              style={{ backgroundColor: getStatusColor(job.status) }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                delay: index * 0.1 + 1.1,
                                type: "spring",
                                stiffness: 300
                              }}
                            >
                              {job.status.replace('_', ' ')}
                            </motion.span>
                            {job.isAssigned ? (
                              <span className="assignment-badge assigned">
                                <CheckCircle size={12} />
                                Assigned
                              </span>
                            ) : (
                              <span className="assignment-badge available">
                                <Clock size={12} />
                                Available
                              </span>
                            )}
                          </div>
                        </motion.div>
                        <motion.div 
                          className="job-client"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 1.2 }}
                        >
                          <User size={14} />
                          {job.customerName}
                        </motion.div>
                        <motion.div 
                          className="job-details"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 1.3 }}
                        >
                          <div className="job-time">
                            <Clock size={12} />
                            {job.scheduledDate} at {job.scheduledTime}
                          </div>
                          <div className="job-location">
                            <MapPin size={12} />
                            {job.address}
                          </div>
                        </motion.div>
                        <motion.div 
                          className="job-amount"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: index * 0.1 + 1.4,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                          ₹{job.amount}
                        </motion.div>
                        {!job.isAssigned && (
                          <motion.div 
                            className="job-actions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 1.5 }}
                          >
                            <button 
                              className="btn-primary btn-sm"
                              onClick={() => handleAcceptJob(job.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle size={14} />
                              {actionLoading ? 'Accepting...' : 'Accept Job'}
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Jobs */}
              <div className="content-section">
                <div className="section-header">
                  <h2>Your Assigned Jobs</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('jobs')}
                  >
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="jobs-grid">
                  {jobs.slice(0, 4).map((job, index) => (
                    <motion.div 
                      key={job.id} 
                      className="job-card"
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1 + 0.8,
                        type: "spring",
                        stiffness: 120,
                        damping: 20
                      }}
                      whileHover={{ 
                        scale: 1.03, 
                        y: -8,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div 
                        className="job-header"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 1.0 }}
                      >
                        <h4>{job.serviceType}</h4>
                        <motion.span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(job.status) }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            delay: index * 0.1 + 1.1,
                            type: "spring",
                            stiffness: 300
                          }}
                        >
                          {job.status.replace('_', ' ')}
                        </motion.span>
                      </motion.div>
                      <motion.div 
                        className="job-client"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 1.2 }}
                      >
                        <User size={14} />
                        {job.customerName}
                      </motion.div>
                      <motion.div 
                        className="job-details"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 1.3 }}
                      >
                        <div className="job-time">
                          <Clock size={12} />
                          {job.scheduledDate} at {job.scheduledTime}
                        </div>
                        <div className="job-location">
                          <MapPin size={12} />
                          {job.address}
                        </div>
                      </motion.div>
                      <motion.div 
                        className="job-amount"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: index * 0.1 + 1.4,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        ₹{job.amount}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="tab-content">
              <div className="content-header">
                <h1>My Jobs</h1>
                <div className="header-actions">
                  <select className="filter-select">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="jobs-list">
                {jobsLoading ? (
                  <div className="loading-placeholder" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <LoadingSpinner size="small" text="Loading jobs..." />
                  </div>
                ) : jobsError ? (
                  <div className="error-state" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                    <AlertCircle size={48} style={{ opacity: 0.7, marginBottom: '1rem' }} />
                    <p>{jobsError}</p>
                    <button 
                      className="btn-primary" 
                      onClick={fetchProviderBookings}
                      style={{ marginTop: '1rem' }}
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <Briefcase size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No jobs assigned to you yet</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Jobs matching your specialization will appear here when customers book services.
                    </p>
                  </div>
                ) : filteredJobs.map(job => {
                  const StatusIcon = getStatusIcon(job.status);
                  return (
                    <div key={job.id} className="job-card-detailed">
                      <div className="job-header">
                        <h3>{job.serviceType}</h3>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(job.status) }}>
                          <StatusIcon size={14} />
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="job-client">
                        <User size={16} />
                        {job.customerName}
                      </div>
                      
                      <div className="job-details-grid">
                        <div className="detail-item">
                          <Clock size={16} />
                          {job.scheduledDate} at {job.scheduledTime}
                        </div>
                        <div className="detail-item">
                          <MapPin size={16} />
                          {job.address}
                        </div>
                        <div className="detail-item">
                          <DollarSign size={16} />
                          ₹{job.amount}
                        </div>
                        <div className="detail-item">
                          <Phone size={16} />
                          {job.customerPhone}
                        </div>
                      </div>
                      
                      {job.description && (
                        <div className="job-description">
                          <p><strong>Description:</strong> {job.description}</p>
                        </div>
                      )}
                      
                      <div className="job-actions">
                        {job.status === 'pending' && (
                          <>
                            <button 
                              className="btn-accept"
                              onClick={() => handleJobAction(job.id, 'confirmed')}
                              disabled={actionLoading}
                            >
                              {actionLoading ? <LoadingSpinner size="small" /> : <CheckCircle size={16} />}
                              Accept
                            </button>
                            <button 
                              className="btn-decline"
                              onClick={() => handleJobAction(job.id, 'cancelled')}
                              disabled={actionLoading}
                            >
                              {actionLoading ? <LoadingSpinner size="small" /> : <X size={16} />}
                              Decline
                            </button>
                          </>
                        )}
                        
                        {job.status === 'confirmed' && (
                          <button 
                            className="btn-complete"
                            onClick={() => handleUpdateJobStatus(job.id, 'in_progress')}
                            disabled={actionLoading}
                          >
                            {actionLoading ? <LoadingSpinner size="small" /> : <Play size={16} />}
                            Start Job
                          </button>
                        )}
                        
                        {job.status === 'in_progress' && (
                          <div className="action-group">
                            <button 
                              className="btn-complete"
                              onClick={() => handleUpdateJobStatus(job.id, 'completed')}
                              disabled={actionLoading}
                            >
                              {actionLoading ? <LoadingSpinner size="small" /> : <CheckCircle size={16} />}
                              Complete
                            </button>
                            <button 
                              className="btn-outline"
                              onClick={() => {
                                setSelectedJob(job);
                                setIsJobModalOpen(true);
                              }}
                            >
                              <MessageSquare size={16} />
                              Add Note
                            </button>
                            <button 
                              className="btn-outline"
                              onClick={() => {
                                setSelectedJob(job);
                                setIsEmergencyModalOpen(true);
                              }}
                            >
                              <AlertTriangle size={16} />
                              Emergency
                            </button>
                          </div>
                        )}
                        
                        <button 
                          className="btn-outline"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsJobModalOpen(true);
                          }}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div className="tab-content">
              <div className="content-header">
                <h1>Earnings & Payments</h1>
                <div className="header-actions">
                  <button className="btn-primary" disabled={earningsLoading}>
                    {earningsLoading ? <LoadingSpinner size="small" /> : <Download size={16} />}
                    Export Report
                  </button>
                </div>
              </div>

              <div className="earnings-summary">
                <div className="summary-card">
                  <div className="summary-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="summary-content">
                    <h3>Total Earnings</h3>
                    <div className="summary-amount">₹{earnings.reduce((sum, earning) => sum + earning.amount, 0)}</div>
                    <div className="summary-change positive">+12% this month</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="summary-content">
                    <h3>Completed Jobs</h3>
                    <div className="summary-amount">{jobs.filter(j => j.status === 'completed').length}</div>
                    <div className="summary-change positive">+5 this week</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">
                    <Star size={24} />
                  </div>
                  <div className="summary-content">
                    <h3>Average Rating</h3>
                    <div className="summary-amount">4.9</div>
                    <div className="summary-change positive">+0.2 this month</div>
                  </div>
                </div>
              </div>

              <div className="earnings-table">
                <div className="table-header">
                  <div>Customer</div>
                  <div>Service</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {earningsLoading ? (
                  <div className="loading-placeholder" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <LoadingSpinner size="small" text="Loading earnings..." />
                  </div>
                ) : earnings.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <DollarSign size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No earnings data available</p>
                  </div>
                ) : earnings.map(earning => (
                  <div key={earning.id} className="earning-row">
                    <div className="table-cell">{earning.customer}</div>
                    <div className="table-cell">{earning.service}</div>
                    <div className="table-cell">{earning.date}</div>
                    <div className="table-cell earning-amount">₹{earning.amount}</div>
                    <div className={`table-cell earning-status ${earning.status}`}>
                      {earning.status}
                    </div>
                    <div className="table-cell">
                      <button className="btn-outline">
                        <Receipt size={16} />
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="tab-content">
              <div className="content-header">
                <h1>Schedule & Availability</h1>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => setIsAvailabilityModalOpen(true)} disabled={profileLoading}>
                    <CalendarPlus size={16} />
                    Set Availability
                  </button>
                </div>
              </div>

              <div className="schedule-calendar">
                <div className="calendar-header">
                  <h3>This Week's Schedule</h3>
                  <div>
                    <button className="btn-nav">
                      <ChevronLeft size={20} />
                    </button>
                    <button className="btn-nav">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                <div className="calendar-grid">
                  {jobs.filter(job => job.status !== 'cancelled').map(job => (
                    <div key={job.id} className="appointment-card">
                      <div className="appointment-time">{job.scheduledDate} at {job.scheduledTime}</div>
                      <div className="appointment-service">{job.serviceType}</div>
                      <div className="appointment-client">{job.customerName}</div>
                      <div className="appointment-location">{job.address}</div>
                      <div className={`appointment-status ${job.status}`}>
                        {job.status.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="availability-settings">
                <div className="section-header">
                  <h3>Availability Settings</h3>
                </div>
                <div className="availability-grid">
                  {Object.entries(profile.availability).map(([day, schedule]) => (
                    <div key={day} className="availability-day">
                      <div className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                      <div className="day-schedule">
                        <input 
                          type="checkbox" 
                          checked={schedule.available}
                          onChange={() => {
                            setProfile(prev => ({
                              ...prev,
                              availability: {
                                ...prev.availability,
                                [day]: { ...schedule, available: !schedule.available }
                              }
                            }));
                          }}
                        />
                        {schedule.available ? (
                          <span>{schedule.start} - {schedule.end}</span>
                        ) : (
                          <span className="unavailable">Unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content profile-tab-enhanced">
              <div className="content-header">
                <div className="header-left">
                  <h1>Profile & Skills</h1>
                  <p>Manage your professional profile and service offerings</p>
                </div>
                <div className="header-actions">
                  {isProfileComplete ? (
                  <button className="btn-primary" disabled={profileLoading}>
                    <Save size={16} />
                    Save Changes
                  </button>
                  ) : (
                    <button 
                      className="btn-primary"
                      onClick={() => setIsProfileCompletionOpen(true)}
                    >
                      <User size={16} />
                      Complete Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Completion Notice */}
              {isProfileCheckReady && !isProfileComplete && (
                <div className="profile-completion-banner">
                  <div className="banner-content">
                    <div className="banner-icon">
                      <AlertCircle size={24} />
                    </div>
                    <div className="banner-text">
                      <h3>Complete Your Profile to Access Work</h3>
                      <p>
                        Your profile is incomplete. Complete it to start receiving service requests and access job opportunities.
                      </p>
                      <div className="banner-benefits">
                        <div className="benefit-item">
                          <CheckCircle size={16} />
                          <span>Get matched with customers</span>
                        </div>
                        <div className="benefit-item">
                          <CheckCircle size={16} />
                          <span>Start receiving job requests</span>
                        </div>
                        <div className="benefit-item">
                          <CheckCircle size={16} />
                          <span>Build your professional reputation</span>
                        </div>
                        <div className="benefit-item">
                          <CheckCircle size={16} />
                          <span>Access premium features</span>
                        </div>
                      </div>
                    </div>
                    <div className="banner-actions">
                      <button 
                        onClick={() => setIsProfileCompletionOpen(true)}
                        className="complete-profile-cta"
                      >
                        <User size={20} />
                        Complete Profile Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {providerDetails?.status === 'pending_verification' && isProfileComplete && (
                <div className="profile-completion-banner">
                  <div className="banner-content">
                    <div className="banner-icon">
                      <AlertCircle size={24} />
                    </div>
                    <div className="banner-text">
                      <h3>Profile Under Review</h3>
                      <p>
                        Your profile is currently being reviewed by our team. 
                        You can still receive service requests while we verify your information.
                      </p>
                    </div>
                    <div className="banner-actions">
                      <button className="btn-outline">
                        <FileText size={16} />
                        View Requirements
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Only show profile form when profile is complete */}
              {isProfileComplete && (
              <div className="profile-form-enhanced">
                {/* Use the new EditableProfileSections component */}
                <EditableProfileSections 
                  providerId={user?.id}
                  onProfileUpdate={(action) => {
                    if (action === 'open-completion-modal') {
                      setIsProfileCompletionOpen(true);
                    } else {
                      // Refresh profile data
                      fetchProviderProfile();
                    }
                  }}
                />
              </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="tab-content">
              <div className="content-header">
                <h1>Reviews & Feedback</h1>
              </div>

              <div className="reviews-summary">
                <div className="rating-overview">
                  <div className="rating-score">4.9</div>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={24} className="star-filled" />
                    ))}
                  </div>
                  <div className="rating-count">Based on {ratings.length} reviews</div>
                </div>
              </div>

              <div className="reviews-list">
                {profileLoading ? (
                  <div className="loading-placeholder" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <LoadingSpinner size="small" text="Loading reviews..." />
                  </div>
                ) : ratings.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <Star size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No reviews available</p>
                  </div>
                ) : ratings.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-client">
                        <div className="client-avatar">
                          <User size={20} />
                        </div>
                        <div className="client-info">
                          <h4>{review.customer}</h4>
                          <p>{review.service}</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={16} 
                              className={star <= review.rating ? 'star-filled' : 'star-empty'} 
                            />
                          ))}
                        </div>
                        <span className="rating-value">{review.rating}/5</span>
                      </div>
                    </div>
                    <div className="review-content">
                      <p>{review.review}</p>
                      <div className="review-date">{review.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="tab-content">
              <div className="content-header">
                <h1>Analytics & Performance</h1>
                <div className="header-actions">
                  <select className="filter-select">
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Job Completion Rate</h3>
                  <div className="chart-placeholder">
                    <BarChart3 size={48} />
                    <p>Chart placeholder - Job completion over time</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Earnings Trend</h3>
                  <div className="chart-placeholder">
                    <TrendingUp size={48} />
                    <p>Chart placeholder - Earnings over time</p>
                  </div>
                </div>
              </div>

              <div className="analytics-metrics">
                <div className="metric-card">
                  <div className="metric-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="metric-content">
                    <h4>Completion Rate</h4>
                    <div className="metric-value">94%</div>
                    <div className="metric-description">Jobs completed on time</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <Star size={24} />
                  </div>
                  <div className="metric-content">
                    <h4>Customer Satisfaction</h4>
                    <div className="metric-value">4.9</div>
                    <div className="metric-description">Average rating</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <Clock size={24} />
                  </div>
                  <div className="metric-content">
                    <h4>Response Time</h4>
                    <div className="metric-value">2.3h</div>
                    <div className="metric-description">Average response time</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <Users size={24} />
                  </div>
                  <div className="metric-content">
                    <h4>Repeat Customers</h4>
                    <div className="metric-value">68%</div>
                    <div className="metric-description">Customer retention rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <div className="content-header">
                <h1>Settings</h1>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Notification Settings</h3>
                  {Object.entries(profile.notificationSettings).map(([key, value]) => (
                    <div key={key} className="setting-item">
                      <div className="setting-info">
                        <h4>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
                        <p>Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={value}
                          onChange={(e) => {
                            setProfile(prev => ({
                              ...prev,
                              notificationSettings: {
                                ...prev.notificationSettings,
                                [key]: e.target.checked
                              }
                            }));
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="settings-card">
                  <h3>Privacy & Security</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Profile Visibility</h4>
                      <p>Allow customers to see your profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Two-Factor Authentication</h4>
                      <p>Add extra security to your account</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-card">
                  <h3>Account Management</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Change Password</h4>
                      <p>Update your account password</p>
                    </div>
                    <button className="btn-outline">Change</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Delete Account</h4>
                      <p>Permanently delete your account</p>
                    </div>
                    <button className="btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {isJobModalOpen && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Job Details</h3>
              <button onClick={() => setIsJobModalOpen(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <h4>Service: {selectedJob.serviceType}</h4>
              <p><strong>Customer:</strong> {selectedJob.customerName}</p>
              <p><strong>Date & Time:</strong> {selectedJob.scheduledDate} at {selectedJob.scheduledTime}</p>
              <p><strong>Location:</strong> {selectedJob.address}</p>
              <p><strong>Amount:</strong> ₹{selectedJob.amount}</p>
              
              {selectedJob.description && (
                <div>
                  <h4>Description</h4>
                  <p>{selectedJob.description}</p>
                </div>
              )}
              
              {selectedJob.specialInstructions && (
                <div>
                  <h4>Special Instructions</h4>
                  <p>{selectedJob.specialInstructions}</p>
                </div>
              )}
              
              <div>
                <h4>Customer Contact</h4>
                <p><strong>Phone:</strong> {selectedJob.customerPhone}</p>
                <p><strong>Email:</strong> {selectedJob.customerEmail}</p>
              </div>
              
              {selectedJob.progressNotes.length > 0 && (
                <div>
                  <h4>Progress Notes</h4>
                  {selectedJob.progressNotes.map((note, index) => (
                    <div key={index} className="progress-note">
                      <p>{note.note || note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-outline"
                onClick={() => setIsJobModalOpen(false)}
                disabled={actionLoading}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  const note = prompt('Add progress note:');
                  if (note) {
                    handleAddProgressNote(selectedJob.id, note);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? <LoadingSpinner size="small" /> : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {isEmergencyModalOpen && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ color: '#ef4444' }}>Emergency Alert</h3>
              <button onClick={() => setIsEmergencyModalOpen(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Send an emergency alert for job: <strong>{selectedJob.serviceType}</strong>
              </p>
              
              <textarea 
                placeholder="Describe the emergency situation..."
                className="emergency-textarea"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-outline"
                onClick={() => setIsEmergencyModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={() => {
                  handleEmergencyAlert(selectedJob.id, 'Emergency alert sent');
                  setIsEmergencyModalOpen(false);
                }}
                disabled={actionLoading}
              >
                {actionLoading ? <LoadingSpinner size="small" /> : 'Send Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={isProfileCompletionOpen}
        onClose={() => setIsProfileCompletionOpen(false)}
        onComplete={handleProfileCompletion}
        onProfileUpdated={fetchProviderProfile}
        user={user}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
};

export default ServiceProviderDashboard;