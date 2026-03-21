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

// Custom Rupee Icon Component
const RupeeIcon = ({ size = 20, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M6 3h12M6 3H4l1 18h14l1-18h-2M6 3l1 18M7 21h10" />
    <path d="M8 8h8M8 12h6" />
  </svg>
);

// Alternative: Simple Rupee Symbol Component
const RupeeSymbol = ({ size = 20, className = '', style = {} }) => (
  <span 
    className={className}
    style={{ 
      fontSize: `${size}px`, 
      fontWeight: 'bold',
      lineHeight: 1,
      ...style 
    }}
  >
    ₹
  </span>
);

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

  // Helper: merge availability from DB onto local default so all weekdays stay present
  const mergeAvailability = (baseAvailability, dbAvailability) => {
    const base = baseAvailability || {};
    const fromDb = dbAvailability && typeof dbAvailability === 'object' ? dbAvailability : {};
    const merged = { ...base };
    Object.entries(fromDb).forEach(([day, value]) => {
      merged[day] = {
        ...(base[day] || {}),
        ...(value || {})
      };
    });
    return merged;
  };

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
        staggerChildren: prefersReducedMotion ? 0 : 0.04,
        delayChildren: prefersReducedMotion ? 0 : 0.02
      }
    }
  };

  const itemRise = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.2, ease: 'easeOut' }
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
  const [earningsLoading, setEarningsLoading] = useState(true); // Start with true for initial load
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
        setProfileLoading(true);
      }
      
      // Simulate API calls for different data sections (earnings will be loaded separately)
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, 800)), // Jobs
        new Promise(resolve => setTimeout(resolve, 600)), // Notifications
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
          const rd = profileData?.roleDetails || {};
          const rateFromDetails = parseFloat(rd.hourly_rate) || parseFloat(rd.basic_pay) || 0;
          setProfile(prev => ({
            ...prev,
            service_category: rd.service_category_name || '',
            service: rd.service_name || '',
            experience_years: rd.experience_years || 0,
            hourly_rate: rateFromDetails,
            availability: mergeAvailability(prev.availability, rd.availability)
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

  // Fetch provider bank / UPI details used for salary payouts
  const fetchBankDetails = async () => {
    if (!user?.id) return;
    try {
      const response = await apiService.getProviderBankDetails(user.id);
      if (response?.bankDetails) {
        setBankDetails(prev => {
          const next = { ...prev, ...response.bankDetails };
          const errs = validateBankDetails(next);
          setBankDetailsErrors(errs);
          setIsPayoutComplete(Object.keys(errs).length === 0);
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    }
  };

  // Centralized validation for payout details – can be reused on change + submit
  const validateBankDetails = (details) => {
    const errors = {};
    const pref = (details.payout_preference || 'upi').toLowerCase();

    const rawName = details.account_holder_name || '';
    const trimmedName = rawName.trim();
    const upi = (details.upi_id || '').trim();
    const acct = (details.bank_account_number || '').trim();
    const ifsc = (details.bank_ifsc || '').trim();
    const bankName = (details.bank_name || '').trim();

    // Common validations
    if (!trimmedName || trimmedName.length < 3) {
      errors.account_holder_name = 'Please enter the account holder name (at least 3 letters).';
    } else {
      // Reject trailing/leading spaces beyond a single space separator
      if (rawName !== trimmedName) {
        errors.account_holder_name = 'Please remove extra spaces before or after the name.';
      } else {
        // Allow only letters and single spaces between words
        const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
        if (!nameRegex.test(trimmedName)) {
          errors.account_holder_name = 'Account holder name can contain only letters and single spaces (no numbers or special characters).';
        }
      }
    }

    // UPI validation when preference is UPI
    if (pref === 'upi') {
      if (!upi) {
        errors.upi_id = 'UPI ID is required when payout preference is UPI.';
      } else {
        const upiRegex = /^[\w.\-]{2,}@[A-Za-z0-9]{2,}$/;
        if (!upiRegex.test(upi)) {
          errors.upi_id = 'Enter a valid UPI ID (e.g., yourphone@upi or name@bank).';
        }
      }
    }

    // Bank validations when preference is bank transfer
    if (pref === 'bank') {
      if (!acct) {
        errors.bank_account_number = 'Bank account number is required when payout preference is Bank transfer.';
      } else {
        // Only numeric characters allowed, length 9–18
        const acctRegex = /^[0-9]+$/;
        if (!acctRegex.test(acct)) {
          errors.bank_account_number = 'Bank account number must contain only digits (no spaces or special characters).';
        } else if (acct.length < 9 || acct.length > 18) {
          errors.bank_account_number = 'Bank account number must be between 9 and 18 digits long.';
        }
      }

      if (!ifsc) {
        errors.bank_ifsc = 'IFSC code is required when payout preference is Bank transfer.';
      } else {
        // Standard IFSC format: 4 letters, 0, then 6 letters/digits – no special characters
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(ifsc.toUpperCase())) {
          errors.bank_ifsc = 'Enter a valid IFSC code (only letters and digits, e.g., BANK0XXXXXX).';
        }
      }

      if (!bankName || bankName.length < 3) {
        errors.bank_name = 'Please enter your bank / branch name.';
      }
    }

    return errors;
  };

  // When user finishes typing IFSC, look up bank details from public API
  const handleIfscBlur = async () => {
    const rawIfsc = (bankDetails.bank_ifsc || '').trim().toUpperCase();
    if (!rawIfsc) return;

    // Quick format check – if invalid, don't hit API
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(rawIfsc)) {
      return;
    }

    try {
      setIfscLookupLoading(true);
      setIfscLookupInfo(null);

      const res = await fetch(`https://ifsc.razorpay.com/${encodeURIComponent(rawIfsc)}`);
      if (!res.ok) {
        toast.error('Could not find bank details for this IFSC.');
        return;
      }

      const data = await res.json();
      setIfscLookupInfo(data);

      // Auto-fill bank name if empty
      if (data && (data.BANK || data.bank)) {
        setBankDetails(prev => ({
          ...prev,
          bank_ifsc: rawIfsc,
          bank_name: prev.bank_name || data.BANK || data.bank
        }));
      } else {
        setBankDetails(prev => ({ ...prev, bank_ifsc: rawIfsc }));
      }
    } catch (error) {
      console.error('IFSC lookup failed:', error);
      toast.error('Failed to verify IFSC. Please check your network and try again.');
    } finally {
      setIfscLookupLoading(false);
    }
  };

  const handleSaveBankDetails = async () => {
    if (!user?.id) return;

    // Validate current state before submitting
    const errors = validateBankDetails(bankDetails);
    setBankDetailsErrors(errors);
    setIsPayoutComplete(Object.keys(errors).length === 0);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted payout fields.');
      return;
    }

    const trimmedName = (bankDetails.account_holder_name || '').trim();
    const upi = (bankDetails.upi_id || '').trim();
    const acct = (bankDetails.bank_account_number || '').trim();
    const ifsc = (bankDetails.bank_ifsc || '').trim();
    const bankName = (bankDetails.bank_name || '').trim();

    setBankDetailsErrors(errors);

    try {
      setBankDetailsSaving(true);
      await apiService.updateProviderBankDetails(user.id, {
        ...bankDetails,
        account_holder_name: trimmedName,
        upi_id: upi || null,
        bank_account_number: acct || null,
        bank_ifsc: ifsc ? ifsc.toUpperCase() : null,
        bank_name: bankName || null
      });
      toast.success('Salary payout details saved');
      setIsPayoutComplete(true);
    } catch (error) {
      console.error('Failed to save bank details:', error);
      toast.error('Failed to save salary payout details');
    } finally {
      setBankDetailsSaving(false);
    }
  };

  // Sync profile.hourly_rate when providerProfile loads (provider_profiles.hourly_rate takes precedence)
  useEffect(() => {
    const rate = Number(providerProfile?.hourly_rate);
    if (!isNaN(rate) && providerProfile) {
      setProfile(prev => ({ ...prev, hourly_rate: rate }));
    }
  }, [providerProfile?.hourly_rate, providerProfile]);

  // Fetch bookings assigned to this service provider
  const fetchProviderBookings = async () => {
    if (!user?.id) return;
    
    try {
      setJobsLoading(true);
      setJobsError(null);
      
      const response = await apiService.getProviderBookings(user.id, {
        scope: 'upcoming',
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

  // Fetch provider reviews and ratings
  const fetchProviderReviews = async () => {
    if (!user?.id) return;
    
    try {
      setReviewsLoading(true);
      const [reviewsResponse, statsResponse] = await Promise.all([
        apiService.getProviderReviews(user.id, 1, 50),
        apiService.getProviderRatingStats(user.id)
      ]);
      
      if (reviewsResponse.success) {
        const formattedReviews = reviewsResponse.data.reviews.map(review => ({
          id: review.id,
          customer: review.customer_name || 'Anonymous',
          rating: review.rating,
          review: review.comment || 'No comment provided',
          date: new Date(review.created_at).toLocaleDateString(),
          service: review.service_name || 'Service'
        }));
        setRatings(formattedReviews);
      }
      
      if (statsResponse.success) {
        setRatingStats({
          averageRating: statsResponse.data.average_rating || 0,
          totalReviews: statsResponse.data.total_reviews || 0,
          ratingBreakdown: statsResponse.data.rating_breakdown || {}
        });
      }
    } catch (error) {
      console.error('Failed to fetch provider reviews:', error);
      // Set fallback data
      setRatings([]);
      setRatingStats({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {}
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch provider leave / time off requests
  const fetchLeaveRequests = async () => {
    if (!user?.id) return;

    try {
      setLeaveLoading(true);
      const res = await apiService.getProviderTimeOff(user.id);
      if (res?.success && Array.isArray(res.data)) {
        setLeaveRequests(res.data);
      } else if (Array.isArray(res)) {
        setLeaveRequests(res);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setLeaveLoading(false);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    if (!user?.id) return;
    
    try {
      const response = await apiService.getProviderTeamMembers(user.id);
      if (response.success && response.data) {
        // Format team members data from database
        const formattedTeamMembers = response.data.team_members?.map(member => ({
          id: member.id,
          name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.name || 'Unknown',
          role: member.role || member.position || 'Team Member',
          status: member.status || 'active',
          profile_photo_url: member.profile_photo_url || member.avatar_url,
          email: member.email,
          phone: member.phone,
          specialization: member.specialization,
          service_category: member.service_category_name,
          experience_years: member.experience_years || 0,
          joined_date: member.joined_date || member.created_at
        })) || [];
        
        setTeamMembers(formattedTeamMembers);
      } else {
        console.log('No team members found or API response failed');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setTeamMembers([]);
    }
  };

  // Fetch team assignments waiting for this provider's accept/decline
  const fetchMyPendingTeamResponses = async () => {
    if (!user?.id) return;
    try {
      setPendingTeamLoading(true);
      const res = await apiService.getMyPendingTeamResponses(user.id);
      const pending = res.pending || [];
      setPendingTeamResponses(pending);

      // Also fetch per-assignment acceptance details so we can show
      // who has already accepted and who is still pending.
      const detailsEntries = await Promise.all(
        pending.map(async (item) => {
          try {
            const detail = await apiService.getAssignmentAcceptances(item.assignment_id);
            return [item.assignment_id, detail];
          } catch (err) {
            console.error('Failed to fetch acceptance details for assignment', item.assignment_id, err);
            return null;
          }
        })
      );

      const detailsMap = {};
      for (const entry of detailsEntries) {
        if (entry && entry[0]) {
          const [id, detail] = entry;
          detailsMap[id] = detail;
        }
      }
      setTeamAcceptanceDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch pending team responses:', error);
      setPendingTeamResponses([]);
      setTeamAcceptanceDetails({});
    } finally {
      setPendingTeamLoading(false);
    }
  };

  // Fetch salary details and payout history from backend (booking_worker_payouts)
  const fetchEarnings = async () => {
    if (!user?.id) return;
    
    try {
      setEarningsLoading(true);
      const response = await apiService.getProviderSalarySummary(user.id);

      const payouts = response?.payouts || [];
      const formatted = payouts.map((p, index) => ({
        id: p.id || index + 1,
        booking_id: p.booking_id,
        amount: Number(p.worker_payout_amount) || 0,
        total_amount: Number(p.total_amount) || 0,
        company_commission_amount: Number(p.company_commission_amount) || 0,
        date: p.paid_at
          ? new Date(p.paid_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : '',
        method: p.payout_method || 'auto',
        reference: p.payout_reference || '',
        status: p.payout_status || 'paid',
        notes: p.notes || ''
      }));

      setEarnings(formatted);
      if (response?.summary) {
        setSalarySummary(response.summary);
      }
    } catch (error) {
      console.error('Failed to fetch salary summary:', error);
      setEarnings([]);
      setSalarySummary({
        totalEarned: 0,
        monthEarned: 0,
        pendingAmount: 0,
        totalJobsPaid: 0,
        totalJobsPending: 0
      });
    } finally {
      setEarningsLoading(false);
    }
  };

  // Refresh dashboard data
  const handleRefresh = () => {
    loadDashboardData(true);
    fetchProviderProfile(); // Also refresh provider profile
    fetchProviderBookings(); // Refresh bookings
    fetchMatchingBookings(); // Refresh matching bookings
    fetchProviderReviews(); // Refresh reviews
    fetchTeamMembers(); // Refresh team data
    fetchMyPendingTeamResponses(); // Team jobs waiting for accept/decline
    fetchEarnings(); // Refresh earnings
    fetchLeaveRequests(); // Refresh leave requests
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
    fetchBankDetails();
    
    // Load booking data
    fetchProviderBookings();
    fetchMatchingBookings();
    
    // Load reviews and team data
    fetchProviderReviews();
    fetchTeamMembers();
    
    // Load earnings data
    fetchEarnings();
    fetchLeaveRequests();
    
    return () => clearTimeout(timer);
  }, []);

  // Load pending team responses when user is available
  useEffect(() => {
    if (user?.id) {
      fetchMyPendingTeamResponses();
    }
  }, [user?.id]);

  // Fetch earnings when earnings tab is accessed (if not already loaded)
  useEffect(() => {
    if (activeTab === 'earnings' && user?.id) {
      // Only fetch if we don't have earnings data and we're not already loading
      if (earnings.length === 0 && !earningsLoading) {
        fetchEarnings();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id]);

  // Real booking data - fetched from API
  const [jobs, setJobs] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [jobsError, setJobsError] = useState(null);

  // Team job accept/decline: assignments waiting for this provider's response
  const [pendingTeamResponses, setPendingTeamResponses] = useState([]);
  const [pendingTeamLoading, setPendingTeamLoading] = useState(false);
  const [respondingAssignmentId, setRespondingAssignmentId] = useState(null);
  const [teamAcceptanceDetails, setTeamAcceptanceDetails] = useState({});

  // Use the real notifications system
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead, 
    markAllAsRead,
    dismissNotification,
    getNotificationIcon,
    getNotificationColor 
  } = useNotifications();

  const [earnings, setEarnings] = useState([]);
  const [salarySummary, setSalarySummary] = useState({
    totalEarned: 0,
    monthEarned: 0,
    pendingAmount: 0,
    totalJobsPaid: 0,
    totalJobsPending: 0
  });
  const [bankDetails, setBankDetails] = useState({
    upi_id: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_name: '',
    account_holder_name: '',
    payout_preference: 'upi'
  });
  const [bankDetailsSaving, setBankDetailsSaving] = useState(false);
  const [bankDetailsErrors, setBankDetailsErrors] = useState({});
  const [ifscLookupLoading, setIfscLookupLoading] = useState(false);
  const [ifscLookupInfo, setIfscLookupInfo] = useState(null);
  const [isPayoutComplete, setIsPayoutComplete] = useState(false);
  // Once payout details are complete and saved, lock the form so workers cannot edit again
  const isPayoutLocked = isPayoutComplete;

  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: {}
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);

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

  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [adminMessageForm, setAdminMessageForm] = useState({
    subject: '',
    priority: 'normal',
    message: ''
  });
  const [adminMessageSending, setAdminMessageSending] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const cached = localStorage.getItem(`provider_admin_messages_${user.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setAdminMessages(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load provider-admin messages:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      localStorage.setItem(`provider_admin_messages_${user.id}`, JSON.stringify(adminMessages.slice(0, 20)));
    } catch (e) {
      console.warn('Could not persist provider-admin messages:', e);
    }
  }, [adminMessages, user?.id]);

  const validateAvailabilitySlot = (day, start, end) => {
    let error = null;
    if (start && (start < '08:00' || start > '17:00')) {
      error = 'Start must be between 08:00 and 17:00';
    } else if (end && (end < '08:00' || end > '17:00')) {
      error = 'End must be between 08:00 and 17:00';
    } else if (start && end && end <= start) {
      error = 'End time must be after start time';
    }
    setAvailabilityErrors(prev => ({ ...prev, [day]: error }));
    return !error;
  };

  const validateAvailabilityDate = (day, dateStr) => {
    try {
      if (!dateStr) {
        // Allow empty date: treat as "no specific date" instead of blocking save
        return true;
      }
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) {
        toast.error('Please select a valid date.');
        return false;
      }
      // Enforce date between today and the next 7 days (inclusive)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const max = new Date(today);
      max.setDate(max.getDate() + 7);
      if (d < today) {
        toast.error('You cannot select a past date.');
        return false;
      }
      if (d > max) {
        toast.error('You can only set availability within the coming 7 days.');
        return false;
      }

      const jsDay = d.getDay(); // 0 = Sunday, 1 = Monday, ...
      const expected = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      }[day];
      if (expected === undefined) return true;
      if (jsDay !== expected) {
        toast.error(`Selected date must be a ${day.charAt(0).toUpperCase() + day.slice(1)}.`);
        return false;
      }
      return true;
    } catch {
      toast.error('Please select a valid date.');
      return false;
    }
  };

  const handleSubmitLeaveRequest = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to submit leave.');
      return;
    }
    if (!leaveStartDate) {
      toast.error('Please select a start date.');
      return;
    }

    try {
      setLeaveSubmitting(true);
      const payload = {
        start_date: leaveStartDate,
        end_date: leaveEndDate || leaveStartDate,
        reason: leaveReason.trim() || null
      };
      const res = await apiService.createProviderTimeOff(user.id, payload);
      toast.success('Leave request submitted.');

      if (res?.data) {
        setLeaveRequests(prev => [res.data, ...(prev || [])]);
      } else {
        fetchLeaveRequests();
      }

      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      toast.error(error?.message || 'Failed to submit leave request');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handleSendAdminMessage = async () => {
    const subject = adminMessageForm.subject.trim();
    const message = adminMessageForm.message.trim();
    const priority = String(adminMessageForm.priority || 'normal').toLowerCase();

    if (!subject || subject.length < 5) {
      toast.error('Please add a subject with at least 5 characters.');
      return;
    }

    if (subject.length > 120) {
      toast.error('Subject must be within 120 characters.');
      return;
    }

    if (!['low', 'normal', 'high'].includes(priority)) {
      toast.error('Please select a valid priority.');
      return;
    }

    if (!message || message.length < 20) {
      toast.error('Please enter at least 20 characters in your message.');
      return;
    }

    if (message.length > 1500) {
      toast.error('Message must be within 1500 characters.');
      return;
    }

    try {
      setAdminMessageSending(true);
      await apiService.submitContactMessage({
        fullName: profile?.name || 'Service Provider',
        email: profile?.email || user?.email || '',
        phoneNumber: profile?.phone || '',
        serviceType: profile?.service || profile?.specialization || 'Service Provider',
        message,
        subject,
        priority,
        source: 'provider_dashboard_settings',
        page: '/dashboard/provider/settings',
        authUserId: user?.id
      });

      const record = {
        id: Date.now(),
        subject,
        message,
        priority,
        createdAt: new Date().toISOString(),
        status: 'sent'
      };
      setAdminMessages(prev => [record, ...prev].slice(0, 20));
      setAdminMessageForm({ subject: '', priority: 'normal', message: '' });
      toast.success('Message sent to admin successfully.');
    } catch (error) {
      toast.error(error?.message || 'Failed to send message to admin.');
    } finally {
      setAdminMessageSending(false);
    }
  };

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

  const handleSaveAvailability = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to save availability.');
      return;
    }
    // Basic validation: ensure each available day with a date is within allowed range
    for (const [day, schedule] of Object.entries(profile.availability || {})) {
      if (schedule?.available && schedule.date) {
        if (!validateAvailabilityDate(day, schedule.date)) {
          return;
        }
      }
    }
    try {
      setProfileLoading(true);
      await apiService.updateProviderAvailability(user.id, profile.availability);
      toast.success('Availability updated successfully.');
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error(error?.message || 'Failed to update availability');
    } finally {
      setProfileLoading(false);
    }
  };

  // Hourly rate: prefer provider_profiles.hourly_rate, then roleDetails.hourly_rate/basic_pay
  const displayHourlyRate = Number(providerProfile?.hourly_rate) || Number(profile?.hourly_rate) || 0;
  const stats = [
    { label: "Active Requests", value: animatedRequests.toString(), icon: Calendar, color: "#4f9cf9", change: "+3" },
    { label: "Completed Jobs", value: animatedJobs.toString(), icon: CheckCircle, color: "#8b5cf6", change: "+5" },
    { label: "Client Rating", value: animatedRating.toFixed(1), icon: Star, color: "#f59e0b", change: "+0.2" },
    { label: "Hourly Rate", value: `₹${displayHourlyRate.toLocaleString('en-IN')}`, icon: RupeeSymbol, color: "#059669", change: displayHourlyRate > 0 ? "Current" : "Not set" }
  ];

  const navigationItems = [
    { key: 'home', label: 'Overview', icon: Home },
    { key: 'jobs', label: 'My Jobs', icon: Briefcase },
    { key: 'earnings', label: 'Salary & Payments', icon: RupeeSymbol },
    { key: 'schedule', label: 'Schedule & Leave', icon: Calendar },
    { key: 'profile', label: 'Profile', icon: User, incomplete: isProfileCheckReady ? !isProfileComplete : false },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'settings', label: 'Admin Support', icon: MessageSquare }
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
      if (!user?.id) {
        toast.error('User not authenticated. Please log in again.');
        return;
      }
      if (!jobId) {
        toast.error('Invalid job ID.');
        return;
      }
      console.log('Accepting job:', { jobId, userId: user.id });
      // Assign booking to this provider
      const result = await apiService.assignBooking(jobId, user.id);
      console.log('Job assignment result:', result);
      
      // Update local state - move from matching jobs to assigned jobs
      setMatchingJobs(prev => prev.filter(job => job.id !== jobId));
      
      // Refresh both lists to get updated data
      fetchProviderBookings();
      fetchMatchingBookings();
      
      toast.success('Job accepted successfully!');
    } catch (error) {
      console.error('Failed to accept job:', error);
      const errorMessage = error?.message || error?.error || 'Failed to accept job. Please try again.';
      const errorDetails = error?.details ? ` Details: ${error.details}` : '';
      toast.error(errorMessage + errorDetails);
    } finally {
      setActionLoading(false);
    }
  };

  // Team job: accept or decline a team assignment
  const handleRespondToTeamJob = async (assignmentId, accept) => {
    if (!user?.id) return;
    setRespondingAssignmentId(assignmentId);
    try {
      await apiService.respondToTeamAssignment(assignmentId, user.id, accept);
      setPendingTeamResponses((prev) => prev.filter((p) => p.assignment_id !== assignmentId));
      fetchProviderBookings();
      toast.success(accept ? 'You have accepted this team job.' : 'You have declined this team job.');
    } catch (error) {
      console.error('Failed to respond to team job:', error);
      toast.error(error?.message || error?.error || 'Failed to update. Please try again.');
    } finally {
      setRespondingAssignmentId(null);
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
              
              <div className="notification-btn-wrap" title="Notifications – team jobs and alerts">
                <button 
                  className="notification-btn"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-label="Open notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                <span className="notification-btn-label">Notifications</span>
              </div>
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
                        <span>Team job alerts and booking updates will appear here</span>
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
                  transition={{ delay: 0.05, duration: prefersReducedMotion ? 0.15 : 0.25, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: 'mirror', repeatDelay: 2 }}
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

              {/* Team jobs: admin assigned your team – accept or decline */}
              {pendingTeamResponses.length > 0 && (
                <div className="content-section" style={{ marginTop: '1.5rem' }}>
                  <div className="section-header" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={22} style={{ color: 'var(--primary, #4f9cf9)' }} />
                    <h2>Team jobs – action required</h2>
                  </div>
                  <p className="section-subtitle" style={{ marginBottom: '1rem', color: '#64748b' }}>
                    Admin assigned your team to the job(s) below. View the details and <strong>Accept</strong> or <strong>Decline</strong>.
                  </p>
                  <div className="jobs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {pendingTeamResponses.map((item) => (
                      <motion.div
                        key={item.assignment_id}
                        className="job-card available"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ borderLeft: '4px solid var(--primary, #4f9cf9)' }}
                      >
                        <div className="job-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h3 style={{ margin: 0 }}>{item.team_name || 'Team job'}</h3>
                          <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                            Pending your response
                          </span>
                        </div>
                        <div className="job-details-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <div className="detail-item">
                            <CalendarDays size={16} />
                            {item.scheduled_date} at {item.scheduled_time || '—'}
                          </div>
                          {item.service_address && (
                            <div className="detail-item">
                              <MapPin size={16} />
                              {item.service_address}
                            </div>
                          )}
                        </div>
                        {teamAcceptanceDetails[item.assignment_id]?.acceptances?.length > 0 && (
                          <div
                            className="team-acceptance-summary"
                            style={{
                              marginTop: '0.75rem',
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              backgroundColor: '#f9fafb'
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>
                                Team members for this job
                              </span>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {(() => {
                                  const members = teamAcceptanceDetails[item.assignment_id].acceptances || [];
                                  const acceptedCount = members.filter((m) => m.status === 'accepted').length;
                                  const total = members.length;
                                  return `${acceptedCount}/${total || '—'} accepted`;
                                })()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {teamAcceptanceDetails[item.assignment_id].acceptances.map((m) => (
                                <span
                                  key={m.user_id}
                                  style={{
                                    fontSize: '0.78rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '999px',
                                    backgroundColor:
                                      m.status === 'accepted'
                                        ? 'rgba(16, 185, 129, 0.1)'
                                        : m.status === 'declined'
                                        ? 'rgba(239, 68, 68, 0.08)'
                                        : 'rgba(250, 204, 21, 0.08)',
                                    color:
                                      m.status === 'accepted'
                                        ? '#047857'
                                        : m.status === 'declined'
                                        ? '#b91c1c'
                                        : '#92400e'
                                  }}
                                >
                                  {(m.full_name && m.full_name.trim()) || 'Team member'} —{' '}
                                  {toTitleCase(m.status || 'pending')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="job-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-accept"
                            onClick={() => handleRespondToTeamJob(item.assignment_id, true)}
                            disabled={respondingAssignmentId === item.assignment_id}
                          >
                            {respondingAssignmentId === item.assignment_id ? <LoadingSpinner size="small" /> : <CheckCircle size={16} />}
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn-decline"
                            onClick={() => handleRespondToTeamJob(item.assignment_id, false)}
                            disabled={respondingAssignmentId === item.assignment_id}
                          >
                            {respondingAssignmentId === item.assignment_id ? <LoadingSpinner size="small" /> : <X size={16} />}
                            Decline
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Team Information */}
              <div className="content-section">
                <div className="section-header">
                  <h2>Your Team</h2>
                  <div className="section-subtitle">
                    <Users size={16} />
                    <span>{teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {teamMembers.length > 0 ? (
                  <>
                    <div className="team-grid">
                      {teamMembers.slice(0, 4).map((member, index) => (
                        <motion.div 
                          key={member.id} 
                          className="team-member-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="member-avatar">
                            {member.profile_photo_url ? (
                              <img src={member.profile_photo_url} alt={member.name} />
                            ) : (
                              <User size={20} />
                            )}
                          </div>
                          <div className="member-info">
                            <h4>{member.name}</h4>
                            <p>{member.role || 'Team Member'}</p>
                            {member.specialization && (
                              <p className="member-specialization">{member.specialization}</p>
                            )}
                            <div className="member-status">
                              <div className={`status-dot ${member.status === 'active' ? 'active' : 'inactive'}`}></div>
                              <span>{member.status === 'active' ? 'Active' : 'Inactive'}</span>
                            </div>
                            {member.experience_years > 0 && (
                              <div className="member-experience">
                                <span>{member.experience_years} years experience</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {teamMembers.length > 4 && (
                      <div className="team-more">
                        <button className="btn-outline">
                          View All Team Members ({teamMembers.length})
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <Users size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No team members yet</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#94a3b8' }}>
                      Add team members to collaborate on service requests.
                    </p>
                    <button className="btn-primary" style={{ marginTop: '1rem' }}>
                      <Plus size={16} />
                      Add Team Member
                    </button>
                  </div>
                )}
              </div>

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

              {/* Team jobs: admin assigned your team – accept or decline (Jobs tab) */}
              {pendingTeamResponses.length > 0 && (
                <div className="content-section" style={{ marginBottom: '1.5rem' }}>
                  <div className="section-header" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={22} style={{ color: 'var(--primary, #4f9cf9)' }} />
                    <h2>Team jobs – action required</h2>
                  </div>
                  <p className="section-subtitle" style={{ marginBottom: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Admin assigned your team to these jobs. Accept or decline below.
                  </p>
                  <div className="jobs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {pendingTeamResponses.map((item) => (
                      <div key={item.assignment_id} className="job-card available" style={{ borderLeft: '4px solid var(--primary, #4f9cf9)' }}>
                        <div className="job-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h3 style={{ margin: 0 }}>{item.team_name || 'Team job'}</h3>
                          <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pending your response</span>
                        </div>
                        <div className="job-details-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <div className="detail-item"><CalendarDays size={16} /> {item.scheduled_date} at {item.scheduled_time || '—'}</div>
                          {item.service_address && <div className="detail-item"><MapPin size={16} /> {item.service_address}</div>}
                        </div>
                        {teamAcceptanceDetails[item.assignment_id]?.acceptances?.length > 0 && (
                          <div
                            className="team-acceptance-summary"
                            style={{
                              marginTop: '0.75rem',
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              backgroundColor: '#f9fafb'
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>
                                Team members for this job
                              </span>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {(() => {
                                  const members = teamAcceptanceDetails[item.assignment_id].acceptances || [];
                                  const acceptedCount = members.filter((m) => m.status === 'accepted').length;
                                  const total = members.length;
                                  return `${acceptedCount}/${total || '—'} accepted`;
                                })()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {teamAcceptanceDetails[item.assignment_id].acceptances.map((m) => (
                                <span
                                  key={m.user_id}
                                  style={{
                                    fontSize: '0.78rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '999px',
                                    backgroundColor:
                                      m.status === 'accepted'
                                        ? 'rgba(16, 185, 129, 0.1)'
                                        : m.status === 'declined'
                                        ? 'rgba(239, 68, 68, 0.08)'
                                        : 'rgba(250, 204, 21, 0.08)',
                                    color:
                                      m.status === 'accepted'
                                        ? '#047857'
                                        : m.status === 'declined'
                                        ? '#b91c1c'
                                        : '#92400e'
                                  }}
                                >
                                  {(m.full_name && m.full_name.trim()) || 'Team member'} —{' '}
                                  {toTitleCase(m.status || 'pending')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="job-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button type="button" className="btn-accept" onClick={() => handleRespondToTeamJob(item.assignment_id, true)} disabled={respondingAssignmentId === item.assignment_id}>
                            {respondingAssignmentId === item.assignment_id ? <LoadingSpinner size="small" /> : <CheckCircle size={16} />} Accept
                          </button>
                          <button type="button" className="btn-decline" onClick={() => handleRespondToTeamJob(item.assignment_id, false)} disabled={respondingAssignmentId === item.assignment_id}>
                            {respondingAssignmentId === item.assignment_id ? <LoadingSpinner size="small" /> : <X size={16} />} Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                          <RupeeSymbol size={16} />
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
            <motion.div 
              className="tab-content earnings-tab-enhanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="content-header earnings-header-enhanced">
                <div className="header-title-section">
                  <h1 className="earnings-title">Salary & Payments</h1>
                  <p className="earnings-subtitle">See your credited salary and manage payout details</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className={`completion-badge ${isPayoutComplete ? '' : 'incomplete'}`}>
                      {isPayoutComplete ? 'Payout details saved' : 'Payout details incomplete – add your UPI / bank info'}
                    </span>
                  </div>
                </div>
                <div className="header-actions earnings-actions">
                  <motion.button 
                    className="btn-secondary earnings-btn"
                    disabled={earningsLoading}
                    onClick={fetchEarnings}
                    title="Refresh earnings data"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw size={18} className={earningsLoading ? 'animate-spin' : ''} />
                    Refresh
                  </motion.button>
                  <motion.button 
                    className="btn-primary earnings-btn"
                    disabled={earningsLoading || earnings.length === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {earningsLoading ? <LoadingSpinner size="small" /> : <Download size={18} />}
                    Export Report
                  </motion.button>
                </div>
              </div>

              {earningsLoading ? (
                <motion.div 
                  className="loading-container earnings-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoadingSpinner size="large" text="Loading earnings..." />
                </motion.div>
              ) : (
                <>
                  <motion.div 
                    className="earnings-summary enhanced"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <motion.div 
                      className="summary-card enhanced-card earnings-card-1"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="summary-icon earnings-icon-1">
                        <RupeeSymbol size={28} />
                        <div className="icon-glow"></div>
                      </div>
                      <div className="summary-content">
                        <h3>Total Salary Credited (All Time)</h3>
                        <div className="summary-amount earnings-amount-main">
                          ₹{Number(salarySummary.totalEarned || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="summary-change positive earnings-change">
                          <TrendingUp size={14} />
                          {salarySummary.totalJobsPaid || 0} jobs paid
                        </div>
                      </div>
                      <div className="card-decoration"></div>
                    </motion.div>
                    
                    <motion.div 
                      className="summary-card enhanced-card earnings-card-2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="summary-icon earnings-icon-2">
                        <CheckCircle size={28} />
                        <div className="icon-glow"></div>
                      </div>
                      <div className="summary-content">
                        <h3>This Month's Salary</h3>
                        <div className="summary-amount">
                          ₹{Number(salarySummary.monthEarned || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="summary-change positive earnings-change">
                          <CheckCircle size={14} />
                          {salarySummary.totalJobsPaid || 0} jobs paid
                        </div>
                      </div>
                      <div className="card-decoration"></div>
                    </motion.div>
                    
                    <motion.div 
                      className="summary-card enhanced-card earnings-card-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="summary-icon earnings-icon-3">
                        <Star size={28} />
                        <div className="icon-glow"></div>
                      </div>
                      <div className="summary-content">
                        <h3>Pending Amount</h3>
                        <div className="summary-amount">
                          ₹{Number(salarySummary.pendingAmount || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="summary-change earnings-change">
                          <Activity size={14} />
                          {salarySummary.totalJobsPending || 0} jobs pending
                        </div>
                      </div>
                      <div className="card-decoration"></div>
                    </motion.div>
                  </motion.div>

                  {/* Salary payout details (bank / UPI) */}
                  <motion.div 
                    className="content-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="section-header">
                      <div>
                        <h2>Salary payout details</h2>
                        <p className="section-subtitle">
                          Add your preferred UPI ID or bank account so that credited salary can be tracked properly.
                        </p>
                      </div>
                    </div>
                    <div className="form-grid-enhanced">
                      <div className="form-group-enhanced">
                        <label>Payout preference</label>
                        <select
                          value={bankDetails.payout_preference || 'upi'}
                          disabled={isPayoutLocked}
                          onChange={(e) => {
                            if (isPayoutLocked) return;
                            const next = { ...bankDetails, payout_preference: e.target.value };
                            setBankDetails(next);
                            const errs = validateBankDetails(next);
                            setBankDetailsErrors(errs);
                            setIsPayoutComplete(Object.keys(errs).length === 0);
                          }}
                        >
                          <option value="upi">UPI</option>
                          <option value="bank">Bank transfer</option>
                        </select>
                        <span className="help-text">
                          Choose how you usually receive your salary outside the app.
                        </span>
                      </div>
                      <div className="form-group-enhanced">
                        <label>UPI ID</label>
                        <div className="input-wrapper">
                          <Smartphone size={16} />
                          <input
                            type="text"
                            placeholder="yourphone@upi or name@bank"
                            value={bankDetails.upi_id || ''}
                            disabled={isPayoutLocked}
                            onChange={(e) => {
                              if (isPayoutLocked) return;
                              const next = { ...bankDetails, upi_id: e.target.value };
                              setBankDetails(next);
                              const errs = validateBankDetails(next);
                              setBankDetailsErrors(errs);
                              setIsPayoutComplete(Object.keys(errs).length === 0);
                            }}
                            className={bankDetailsErrors.upi_id ? 'error' : ''}
                          />
                        </div>
                        {bankDetailsErrors.upi_id ? (
                          <span className="error-text">{bankDetailsErrors.upi_id}</span>
                        ) : (
                          <span className="help-text">
                            Required if payout preference is UPI.
                          </span>
                        )}
                      </div>
                      <div className="form-group-enhanced">
                        <label>Account holder name</label>
                        <div className="input-wrapper">
                          <User size={16} />
                          <input
                            type="text"
                            placeholder="Name as per bank account"
                            value={bankDetails.account_holder_name || ''}
                            disabled={isPayoutLocked}
                            onChange={(e) => {
                              if (isPayoutLocked) return;
                              const next = { ...bankDetails, account_holder_name: e.target.value };
                              setBankDetails(next);
                              const errs = validateBankDetails(next);
                              setBankDetailsErrors(errs);
                              setIsPayoutComplete(Object.keys(errs).length === 0);
                            }}
                            className={bankDetailsErrors.account_holder_name ? 'error' : ''}
                          />
                        </div>
                        {bankDetailsErrors.account_holder_name && (
                          <span className="error-text">{bankDetailsErrors.account_holder_name}</span>
                        )}
                      </div>
                      <div className="form-group-enhanced">
                        <label>Bank account number</label>
                        <div className="input-wrapper">
                          <Key size={16} />
                          <input
                            type="text"
                            placeholder="Account number"
                            value={bankDetails.bank_account_number || ''}
                            disabled={isPayoutLocked}
                            onChange={(e) => {
                              if (isPayoutLocked) return;
                              const next = { ...bankDetails, bank_account_number: e.target.value };
                              setBankDetails(next);
                              const errs = validateBankDetails(next);
                              setBankDetailsErrors(errs);
                              setIsPayoutComplete(Object.keys(errs).length === 0);
                            }}
                            className={bankDetailsErrors.bank_account_number ? 'error' : ''}
                          />
                        </div>
                        {bankDetailsErrors.bank_account_number && (
                          <span className="error-text">{bankDetailsErrors.bank_account_number}</span>
                        )}
                      </div>
                      <div className="form-group-enhanced">
                        <label>IFSC code</label>
                        <div className="input-wrapper">
                          <Globe size={16} />
                          <input
                            type="text"
                            placeholder="BANK0000000"
                            value={bankDetails.bank_ifsc || ''}
                            disabled={isPayoutLocked}
                            onChange={(e) => {
                              if (isPayoutLocked) return;
                              const next = { ...bankDetails, bank_ifsc: e.target.value.toUpperCase() };
                              setBankDetails(next);
                              const errs = validateBankDetails(next);
                              setBankDetailsErrors(errs);
                              setIsPayoutComplete(Object.keys(errs).length === 0);
                            }}
                            onBlur={isPayoutLocked ? undefined : handleIfscBlur}
                            className={bankDetailsErrors.bank_ifsc ? 'error' : ''}
                          />
                        </div>
                        {bankDetailsErrors.bank_ifsc && (
                          <span className="error-text">{bankDetailsErrors.bank_ifsc}</span>
                        )}
                        {!bankDetailsErrors.bank_ifsc && (
                          <span className="help-text">
                            {ifscLookupLoading
                              ? 'Checking bank details…'
                              : ifscLookupInfo && (ifscLookupInfo.BANK || ifscLookupInfo.bank)
                                ? `Bank detected: ${(ifscLookupInfo.BANK || ifscLookupInfo.bank)}${ifscLookupInfo.BRANCH ? ` • ${ifscLookupInfo.BRANCH}` : ''}`
                                : 'Enter a valid IFSC code to auto-detect your bank.'}
                          </span>
                        )}
                      </div>
                      <div className="form-group-enhanced">
                        <label>Bank name</label>
                        <div className="input-wrapper">
                          <Home size={16} />
                          <input
                            type="text"
                            placeholder="Bank / branch name"
                            value={bankDetails.bank_name || ''}
                            disabled={isPayoutLocked}
                            onChange={(e) => {
                              if (isPayoutLocked) return;
                              const next = { ...bankDetails, bank_name: e.target.value };
                              setBankDetails(next);
                              const errs = validateBankDetails(next);
                              setBankDetailsErrors(errs);
                              setIsPayoutComplete(Object.keys(errs).length === 0);
                            }}
                            className={bankDetailsErrors.bank_name ? 'error' : ''}
                          />
                        </div>
                        {bankDetailsErrors.bank_name && (
                          <span className="error-text">{bankDetailsErrors.bank_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="section-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSaveBankDetails}
                        disabled={bankDetailsSaving || isPayoutLocked}
                      >
                        {bankDetailsSaving ? <LoadingSpinner size="small" /> : <Save size={16} />}
                        {bankDetailsSaving ? 'Saving…' : 'Save payout details'}
                      </button>
                    </div>
                  </motion.div>

                  {/* Salary history table */}
                  <motion.div 
                    className="earnings-table enhanced-table"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="table-header enhanced-header">
                      <div className="header-cell">
                        <FileText size={16} />
                        Booking
                      </div>
                      <div className="header-cell">
                        <Calendar size={16} />
                        Paid on
                      </div>
                      <div className="header-cell">
                        <RupeeSymbol size={16} />
                        Salary (you)
                      </div>
                      <div className="header-cell">
                        <RupeeSymbol size={16} />
                        Job total
                      </div>
                      <div className="header-cell">
                        <Activity size={16} />
                        Status
                      </div>
                      <div className="header-cell">
                        Method
                      </div>
                    </div>
                    {earnings.length === 0 ? (
                      <motion.div 
                        className="empty-state earnings-empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="empty-icon-wrapper">
                          <RupeeSymbol size={64} />
                          <div className="empty-icon-glow"></div>
                        </div>
                        <h3 className="empty-title">No salary data available</h3>
                        <p className="empty-description">
                          Salary entries will appear here once jobs are completed and payouts are credited.
                        </p>
                        <motion.button 
                          className="btn-primary empty-action-btn"
                          onClick={fetchEarnings}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <RefreshCw size={16} />
                          Refresh
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="table-body">
                        {earnings.map((earning, index) => (
                          <motion.div 
                            key={earning.id} 
                            className="earning-row enhanced-row"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + (index * 0.05) }}
                            whileHover={{ x: 5, backgroundColor: '#f8fafc' }}
                          >
                            <div className="table-cell">
                              <FileText size={14} className="cell-icon" />
                              <span>{earning.booking_id || '—'}</span>
                            </div>
                            <div className="table-cell date-cell">
                              <Calendar size={14} className="cell-icon" />
                              {earning.date || '—'}
                            </div>
                            <div className="table-cell earning-amount enhanced-amount">
                              <RupeeSymbol size={16} className="rupee-icon-inline" />
                              {Number(earning.amount || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="table-cell">
                              <RupeeSymbol size={16} className="rupee-icon-inline" />
                              {Number(earning.total_amount || 0).toLocaleString('en-IN')}
                            </div>
                            <div className={`table-cell earning-status enhanced-status ${earning.status || 'paid'}`}>
                              <span className={`status-badge enhanced-badge ${earning.status || 'paid'}`}>
                                {earning.status === 'pending' ? (
                                  <>
                                    <Clock size={12} />
                                    Pending
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={12} />
                                    Paid
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="table-cell">
                              <span className="text-muted">
                                {earning.method || 'auto'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="tab-content">
              <div className="content-header">
                <div className="header-left">
                  <h1>Schedule, Availability & Leave</h1>
                  <p>Plan your working hours and upcoming leave in one place</p>
                </div>
                {/* No header-level action; Save button is anchored to Availability card below */}
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

              <div className="schedule-layout">
                <div className="availability-settings">
                  <div className="section-header">
                    <h3>Availability Settings</h3>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveAvailability}
                      disabled={profileLoading}
                    >
                      <CalendarPlus size={16} />
                      <span style={{ marginLeft: 6 }}>Save availability</span>
                    </button>
                  </div>
                  <div className="availability-grid">
                    {Object.entries(profile.availability).map(([day, schedule]) => (
                      <div key={day} className="availability-day">
                        <div className="day-name">
                          <span className="day-name-text">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                          <div className="day-date-inline">
                            <span className="day-date-label">Date</span>
                            <input
                              type="date"
                              className="day-date-input"
                              value={schedule.date || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (!validateAvailabilityDate(day, value)) {
                                  return;
                                }
                                setProfile(prev => ({
                                  ...prev,
                                  availability: {
                                    ...prev.availability,
                                    [day]: { ...schedule, date: value }
                                  }
                                }));
                              }}
                            />
                          </div>
                        </div>
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
                            <div className="day-time-visual">
                                <span className="day-time-label">
                                  <Clock size={14} />
                                  <input
                                    type="time"
                                    className="day-time-input"
                                    min="08:00"
                                    max="17:00"
                                    value={schedule.start}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (!validateAvailabilitySlot(day, value, schedule.end)) {
                                        return;
                                      }
                                      setProfile(prev => ({
                                        ...prev,
                                        availability: {
                                          ...prev.availability,
                                          [day]: { ...schedule, start: value }
                                        }
                                      }));
                                    }}
                                  />
                                  <span className="time-separator">to</span>
                                  <input
                                    type="time"
                                    className="day-time-input"
                                    min="08:00"
                                    max="17:00"
                                    value={schedule.end}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (!validateAvailabilitySlot(day, schedule.start, value)) {
                                        return;
                                      }
                                      setProfile(prev => ({
                                        ...prev,
                                        availability: {
                                          ...prev.availability,
                                          [day]: { ...schedule, end: value }
                                        }
                                      }));
                                    }}
                                  />
                                </span>
                                <div className="day-time-bar">
                                  <div className="day-time-bar-fill" />
                                </div>
                                {availabilityErrors[day] && (
                                  <div className="availability-error">
                                    {availabilityErrors[day]}
                                  </div>
                                )}
                              </div>
                          ) : (
                            <span className="unavailable">Unavailable</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="leave-panel">
                  <div className="section-header">
                    <h3>Leave Requests</h3>
                  </div>
                  <div className="leave-form">
                    <div className="leave-row">
                      <div className="leave-field">
                        <label>From</label>
                        <input
                          type="date"
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                        />
                      </div>
                      <div className="leave-field">
                        <label>To</label>
                        <input
                          type="date"
                          value={leaveEndDate}
                          min={leaveStartDate || undefined}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="leave-row">
                      <div className="leave-field full">
                        <label>Reason (optional)</label>
                        <textarea
                          rows={2}
                          placeholder="Explain why you need leave..."
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="leave-actions">
                      <button
                        className="btn-primary leave-submit-btn"
                        type="button"
                        onClick={handleSubmitLeaveRequest}
                        disabled={leaveSubmitting || !leaveStartDate}
                      >
                        {leaveSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                      </button>
                      <span className="leave-hint">
                        Leave requests will be reviewed by the admin. Status will appear below.
                      </span>
                    </div>
                  </div>

                  <div className="leave-status-list">
                    <div className="leave-status-header">
                      <span>Recent Leave Status</span>
                    </div>
                    {leaveLoading ? (
                      <p className="leave-status-empty">Loading leave requests...</p>
                    ) : (leaveRequests.length === 0 ? (
                      <p className="leave-status-empty">
                        No leave requests yet. Once you submit a request, it will show up here with its status.
                      </p>
                    ) : (
                      <ul className="leave-status-items">
                        {leaveRequests.slice(0, 5).map((leave) => {
                          const sameDay = leave.start_date === leave.end_date;
                          const rangeLabel = sameDay
                            ? leave.start_date
                            : `${leave.start_date} → ${leave.end_date}`;
                          const statusLabel = (leave.status || 'pending')
                            .charAt(0)
                            .toUpperCase() + (leave.status || 'pending').slice(1);
                          return (
                            <li key={leave.id} className={`leave-status-item ${leave.status || 'pending'}`}>
                              <div className="leave-status-dates">{rangeLabel}</div>
                              <div className="leave-status-meta">
                                <span className={`leave-status-pill ${leave.status || 'pending'}`}>
                                  {statusLabel}
                                </span>
                                {leave.reason && (
                                  <span className="leave-status-reason">
                                    {leave.reason}
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ))}
                  </div>
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
                  <div className="rating-score">{ratingStats.averageRating.toFixed(1)}</div>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={24} 
                        className={star <= Math.round(ratingStats.averageRating) ? 'star-filled' : 'star-empty'} 
                      />
                    ))}
                  </div>
                  <div className="rating-count">Based on {ratingStats.totalReviews} reviews</div>
                </div>
              </div>

              <div className="reviews-list">
                {reviewsLoading ? (
                  <div className="loading-placeholder" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <LoadingSpinner size="medium" text="Loading reviews..." />
                  </div>
                ) : ratings.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <Star size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No reviews available</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#94a3b8' }}>
                      Reviews will appear here once customers rate your services.
                    </p>
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
                  <h3>Admin Communication</h3>
                  <p className="settings-card-subtext">
                    Send updates, concerns, or support requests directly to the admin team.
                  </p>
                  <div className="admin-message-form">
                    <div className="admin-message-row">
                      <div className="admin-message-field">
                        <label>Subject</label>
                        <input
                          type="text"
                          value={adminMessageForm.subject}
                          onChange={(e) => setAdminMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Example: Need help with job assignment"
                          maxLength={120}
                        />
                      </div>
                      <div className="admin-message-field admin-message-priority">
                        <label>Priority</label>
                        <select
                          value={adminMessageForm.priority}
                          onChange={(e) => setAdminMessageForm(prev => ({ ...prev, priority: e.target.value }))}
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="admin-message-field">
                      <label>Message</label>
                      <textarea
                        rows={4}
                        value={adminMessageForm.message}
                        onChange={(e) => setAdminMessageForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Write your message to admin..."
                        minLength={20}
                        maxLength={1500}
                      />
                    </div>
                    <div className="admin-message-actions">
                      <button
                        className="btn-primary"
                        onClick={handleSendAdminMessage}
                        disabled={adminMessageSending}
                      >
                        <Send size={16} />
                        {adminMessageSending ? 'Sending...' : 'Send to Admin'}
                      </button>
                    </div>
                  </div>
                  <div className="admin-message-history">
                    <h4>Recent Messages</h4>
                    {adminMessages.length === 0 ? (
                      <p className="admin-message-empty">No messages yet.</p>
                    ) : (
                      adminMessages.slice(0, 5).map((item) => (
                        <div key={item.id} className="admin-message-item">
                          <div className="admin-message-item-head">
                            <strong>{item.subject}</strong>
                            <span className={`admin-priority ${item.priority}`}>{item.priority}</span>
                          </div>
                          <p>{item.message}</p>
                          <span className="admin-message-meta">
                            {new Date(item.createdAt).toLocaleString()} - {item.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="admin-contact-note">
                    <Mail size={16} />
                    <span>For urgent issues, admin may follow up via email or dashboard notifications.</span>
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
        userEmail={user?.email}
      />
    </div>
  );
};

export default ServiceProviderDashboard;