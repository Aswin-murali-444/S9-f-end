import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
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
  CalendarRange
} from 'lucide-react';
import Logo from '../../components/Logo';
import LoadingSpinner from '../../components/LoadingSpinner';
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

  // Animation states
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    earnings: 0,
    requests: 0,
    jobs: 0,
    rating: 0
  });

  // Loading states for different data sections
  const [jobsLoading, setJobsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
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

  // Data loading function
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setJobsLoading(true);
        setNotificationsLoading(true);
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
      
      // In a real app, you would fetch actual data here
      // const [jobsData, notificationsData, earningsData, profileData] = await Promise.all([
      //   apiService.getProviderJobs(),
      //   apiService.getNotifications(),
      //   apiService.getEarnings(),
      //   apiService.getProfile()
      // ]);
      
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

  // Refresh dashboard data
  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Load dashboard data
    loadDashboardData();
    
    return () => clearTimeout(timer);
  }, []);

  // Mock data - replace with actual API calls
  const [jobs, setJobs] = useState([
    {
      id: 1,
      customerName: "John Smith",
      serviceType: "House Cleaning",
      address: "123 Main St, City, State",
      scheduledDate: "2024-01-15",
      scheduledTime: "14:00",
      description: "Deep cleaning of living room and kitchen",
      specialInstructions: "Please use eco-friendly products",
      status: "pending",
      amount: 75,
      customerPhone: "+1-555-0123",
      customerEmail: "john@email.com",
      attachments: ["floor_plan.pdf", "special_requirements.docx"],
      progressNotes: [],
      completionPhotos: []
    },
    {
      id: 2,
      customerName: "Sarah Johnson",
      serviceType: "Plumbing Repair",
      address: "456 Oak Ave, City, State",
      scheduledDate: "2024-01-16",
      scheduledTime: "10:00",
      description: "Fix leaking kitchen faucet",
      specialInstructions: "Customer prefers morning appointments",
      status: "confirmed",
      amount: 120,
      customerPhone: "+1-555-0456",
      customerEmail: "sarah@email.com",
      attachments: [],
      progressNotes: ["Arrived on time", "Identified the issue"],
      completionPhotos: []
    },
    {
      id: 3,
      customerName: "Mike Wilson",
      serviceType: "Electrical Work",
      address: "789 Pine Rd, City, State",
      scheduledDate: "2024-01-14",
      scheduledTime: "09:00",
      description: "Install new light fixtures",
      specialInstructions: "Turn off power at main breaker",
      status: "in_progress",
      amount: 200,
      customerPhone: "+1-555-0789",
      customerEmail: "mike@email.com",
      attachments: ["fixture_instructions.pdf"],
      progressNotes: ["Power turned off", "Started installation"],
      completionPhotos: []
    },
    {
      id: 4,
      customerName: "Emma Davis",
      serviceType: "Garden Maintenance",
      address: "321 Elm St, City, State",
      scheduledDate: "2024-01-13",
      scheduledTime: "08:00",
      description: "Weekly garden maintenance",
      specialInstructions: "Water plants in backyard",
      status: "completed",
      amount: 60,
      customerPhone: "+1-555-0321",
      customerEmail: "emma@email.com",
      attachments: [],
      progressNotes: ["Completed all tasks", "Customer satisfied"],
      completionPhotos: ["garden_before.jpg", "garden_after.jpg"]
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Job Request",
      message: "House Cleaning job requested by John Smith",
      type: "job_request",
      time: "5 minutes ago",
      unread: true
    },
    {
      id: 2,
      title: "Schedule Change",
      message: "Your 2:00 PM appointment has been moved to 3:00 PM",
      type: "schedule_change",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Payment of $120 received for Plumbing Repair job",
      type: "payment",
      time: "2 hours ago",
      unread: false
    },
    {
      id: 4,
      title: "Customer Review",
      message: "New 5-star review from Sarah Johnson",
      type: "review",
      time: "1 day ago",
      unread: false
    }
  ]);

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
    name: "Alex Provider",
    email: user?.email || "provider@example.com",
    phone: "+1-555-0123",
    skills: ["House Cleaning", "Plumbing", "Electrical Work", "Garden Maintenance"],
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

  const stats = [
    { label: "Total Earnings", value: `$${animatedEarnings.toLocaleString()}`, icon: DollarSign, color: "#10b981", change: "+12%" },
    { label: "Active Requests", value: animatedRequests.toString(), icon: Calendar, color: "#4f9cf9", change: "+3" },
    { label: "Completed Jobs", value: animatedJobs.toString(), icon: CheckCircle, color: "#8b5cf6", change: "+5" },
    { label: "Client Rating", value: animatedRating.toFixed(1), icon: Star, color: "#f59e0b", change: "+0.2" }
  ];

  const navigationItems = [
    { key: 'home', label: 'Overview', icon: Home },
    { key: 'jobs', label: 'My Jobs', icon: Briefcase },
    { key: 'earnings', label: 'Earnings', icon: DollarSign },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'profile', label: 'Profile', icon: User },
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

  const handleJobAction = async (jobId, action) => {
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return { ...job, status: action };
        }
        return job;
      }));
      
      toast.success(`Job ${action} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} job`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, status) => {
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return { ...job, status };
        }
        return job;
      }));
      
      toast.success(`Job status updated to ${status}`);
    } catch (error) {
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

  const unreadNotifications = notifications.filter(n => n.unread).length;

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
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                >
                  {item.label}
                </motion.span>
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
              <span className="breadcrumb-current">{navigationItems.find(item => item.key === activeTab)?.label}</span>
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
                {unreadNotifications > 0 && (
                  <span className="notification-badge">{unreadNotifications}</span>
                )}
              </button>
              
                  <div className="user-menu">
                    <button 
                      className="user-btn"
                      onClick={(e) => {
                        console.log('👤 User button clicked, current state:', isProfileOpen);
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileOpen(!isProfileOpen);
                      }}
                    >
                      <div className="user-avatar">
                        {(() => {
                          const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL;
                          return avatar ? (
                            <img src={avatar} alt="Profile" />
                          ) : (
                            <User size={16} />
                          );
                        })()}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{profile.name || 'Service Provider'}</span>
                        <span className="user-role">Service Provider</span>
                      </div>
                      <div className="user-status">
                        <div className="status-indicator"></div>
                      </div>
                    </button>
                
                {isProfileOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {(() => {
                          const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL;
                          return avatar ? (
                            <img src={avatar} alt="Profile" />
                          ) : (
                            <User size={20} />
                          );
                        })()}
                      </div>
                      <div>
                        <h4>{profile.name}</h4>
                        <p>{profile.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-actions">
                      <button onClick={() => setActiveTab('profile')}>
                        <User size={16} />
                        Profile Settings
                      </button>
                      <button onClick={() => setActiveTab('settings')}>
                        <Settings size={16} />
                        Preferences
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

        {/* Notifications Dropdown */}
        {isNotificationsOpen && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <button 
                className="mark-all-read"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
              >
                Mark all read
              </button>
            </div>
            <div className="notifications-list">
              {notifications.slice(0, 6).map(item => (
                <div key={item.id} className={`notification-item ${item.unread ? 'unread' : ''}`}>
                  <div className="notification-icon">
                    {item.type === 'job_request' && <Briefcase size={16} />}
                    {item.type === 'schedule_change' && <Clock size={16} />}
                    {item.type === 'payment' && <DollarSign size={16} />}
                    {item.type === 'review' && <Star size={16} />}
                  </div>
                  <div className="notification-content">
                    <h4>{item.title}</h4>
                    <p>{item.message}</p>
                    <span className="notification-time">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

              {/* Recent Jobs */}
              <div className="content-section">
                <div className="section-header">
                  <h2>Recent Jobs</h2>
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
                        ${job.amount}
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
                ) : filteredJobs.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <Briefcase size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No jobs found</p>
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
                          ${job.amount}
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
                    <div className="summary-amount">${earnings.reduce((sum, earning) => sum + earning.amount, 0)}</div>
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
                    <div className="table-cell earning-amount">${earning.amount}</div>
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
                    {profileLoading ? <LoadingSpinner size="small" /> : <CalendarPlus size={16} />}
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
            <div className="tab-content">
              <div className="content-header">
                <h1>Profile & Skills</h1>
                <div className="header-actions">
                  <button className="btn-primary" disabled={profileLoading}>
                    {profileLoading ? <LoadingSpinner size="small" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="profile-form">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    <User size={32} />
                  </div>
                  <div className="profile-info">
                    <h2>{profile.name}</h2>
                    <p>{profile.email}</p>
                    <p>{profile.phone}</p>
                  </div>
                </div>

                <div className="form-sections">
                  <div className="form-section">
                    <h3>Personal Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                          type="tel" 
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Service Skills</h3>
                    <div className="service-tags">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="tag">
                          {skill}
                          <button 
                            onClick={() => {
                              setProfile(prev => ({
                                ...prev,
                                skills: prev.skills.filter((_, i) => i !== index)
                              }));
                            }}
                            className="tag-remove"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      <button className="add-tag-btn">
                        <Plus size={16} />
                        Add Skill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
              <p><strong>Amount:</strong> ${selectedJob.amount}</p>
              
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
    </div>
  );
};

export default ServiceProviderDashboard;