import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock, 
  IndianRupee, 
  Activity,
  Database,
  Server,
  Globe,
  Lock,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  Target,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  Info,
  UserCheck,
  UserX,
  UserPlus,
  Key,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  Activity as ActivityIcon,
  LogOut,
  PlayCircle,
  LogIn,
  Edit,
  ShieldAlert,
  Menu,
  X,
  Sun,
  Moon,
  Briefcase,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import Logo from '../../components/Logo';
import NotificationBell from '../../components/NotificationBell';
import AnimatedNumber from '../../components/AnimatedNumber';
import SkeletonLoader from '../../components/SkeletonLoader';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { supabase, supabaseConfig } from '../../lib/supabase';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';
import './SharedDashboard.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    systemUptime: "0%",
    responseTime: "0ms",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkTraffic: "0 GB/s",
    activeSessions: 0,
    failedLogins: 0,
    securityThreats: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState({
    userGrowth: { current: 0, change: "+0%" },
    revenueGrowth: { current: 0, change: "+0%" },
    serviceRequests: { current: 0, change: "+0%" },
    customerSatisfaction: { current: 0, change: "+0.0" }
  });
  // Ratings summary from backend (for Average Rating card)
  const [ratingSummary, setRatingSummary] = useState({
    average_rating: 0,
    total_reviews: 0
  });
  const [providerLeave, setProviderLeave] = useState([]);
  const [providerLeaveLoading, setProviderLeaveLoading] = useState(false);
  const [providerLeaveError, setProviderLeaveError] = useState(null);
  const [providerAvailability, setProviderAvailability] = useState([]);
  const [providerAvailabilityLoading, setProviderAvailabilityLoading] = useState(false);
  const [providerAvailabilityError, setProviderAvailabilityError] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [leaveDecisionLoading, setLeaveDecisionLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState({});
  const [securityEvents, setSecurityEvents] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [suspensionData, setSuspensionData] = useState({ userId: null, userName: '', reason: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('name_asc');
  const [selectedRole, setSelectedRole] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Services & Categories
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  // Providers & Allocation
  const [providersPending, setProvidersPending] = useState([]);
  const [providers, setProviders] = useState([]);
  // Unified allocations (individual + team assignments) for Allocation tab
  const [allocations, setAllocations] = useState([]);

  // Monitoring
  const [serviceRequests, setServiceRequests] = useState([]);
  const [ongoingTasks, setOngoingTasks] = useState([]);

  // Billing
  const [invoices, setInvoices] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Feedback
  const [reviews, setReviews] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);

  // Admin bookings (customer, service, who accepted, when)
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminBookingsLoading, setAdminBookingsLoading] = useState(false);
  const [bookingsFilterStatus, setBookingsFilterStatus] = useState('all');
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  // Team assignment responses (who accepted / declined) keyed by assignment id
  const [teamAcceptanceDetails, setTeamAcceptanceDetails] = useState({});
  const [teamAcceptanceLoadingId, setTeamAcceptanceLoadingId] = useState(null);
  // Assign individual provider to a booking
  const [assignProviderBooking, setAssignProviderBooking] = useState(null);
  const [assignProviderProviders, setAssignProviderProviders] = useState([]);
  const [assignProviderSelectedId, setAssignProviderSelectedId] = useState('');
  const [assignProviderFetchLoading, setAssignProviderFetchLoading] = useState(false);
  const [assignProviderLoading, setAssignProviderLoading] = useState(false);
  // Assign team to booking
  const [assignTeamBooking, setAssignTeamBooking] = useState(null);
  const [assignTeamAvailableTeams, setAssignTeamAvailableTeams] = useState([]);
  const [assignTeamSelectedTeamId, setAssignTeamSelectedTeamId] = useState('');
  const [assignTeamNotes, setAssignTeamNotes] = useState('');
  const [assignTeamLoading, setAssignTeamLoading] = useState(false);
  const [assignTeamFetchLoading, setAssignTeamFetchLoading] = useState(false);
  const [assignTeamNoServiceCategory, setAssignTeamNoServiceCategory] = useState(false);
  const searchInputRef = useRef(null);
  // const [profileModalLoading, setProfileModalLoading] = useState(false);
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  const { useAnimatedInView, staggerAnimation } = useAnimations();
  const { logout, user } = useAuth();

  const displayName = React.useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email ||
      'Admin'
    );
  }, [user]);

  // Resolve admin header avatar URL (storage path -> full public URL)
  const headerAvatarUrl = React.useMemo(() => {
    const raw =
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      user?.user_metadata?.photoURL ||
      '';
    if (!raw || typeof raw !== 'string') return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = (supabaseConfig?.url || import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    if (!base) return raw;
    const path = String(raw).replace(/^\//, '');
    return `${base}/storage/v1/object/public/${path}`;
  }, [user?.user_metadata?.avatar_url, user?.user_metadata?.picture, user?.user_metadata?.photoURL]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Aggregated analytics focused on worker payouts (admin payment management)
  const billingStats = React.useMemo(() => {
    const totalWorker = (payouts || []).reduce(
      (sum, po) => sum + (Number(po.amount) || 0),
      0
    );
    const paidRows = (payouts || []).filter(
      (po) => (po.status || 'paid').toLowerCase() === 'paid'
    );
    const pendingRows = (payouts || []).filter(
      (po) => (po.status || '').toLowerCase() === 'pending'
    );
    const paidAmount = paidRows.reduce(
      (sum, po) => sum + (Number(po.amount) || 0),
      0
    );
    const pendingAmount = pendingRows.reduce(
      (sum, po) => sum + (Number(po.amount) || 0),
      0
    );

    return {
      totalWorker,
      paidCount: paidRows.length,
      pendingCount: pendingRows.length,
      paidAmount,
      pendingAmount,
    };
  }, [payouts]);

  const [showWelcome, setShowWelcome] = useState(false);
  const [headerAvatarError, setHeaderAvatarError] = useState(false);

  useEffect(() => {
    setHeaderAvatarError(false);
  }, [headerAvatarUrl]);

  const formatUptime = (totalSeconds) => {
    if (typeof totalSeconds !== 'number' || totalSeconds < 0) return '—';
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const fetchMetrics = async (silent = false) => {
    if (isRefreshing) return;
    if (!silent) setIsRefreshing(true);
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    try {
      const data = await apiService.getSystemMetrics();
      const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const rttMs = Math.round(t1 - t0);

      setSystemMetrics(prev => ({
        ...prev,
        systemUptime: typeof data?.uptimeSec === 'number' ? formatUptime(data.uptimeSec) : prev.systemUptime,
        responseTime: `${rttMs}ms`,
        cpuUsage: typeof data?.cpu?.usagePercent === 'number' ? data.cpu.usagePercent : prev.cpuUsage,
        memoryUsage: typeof data?.memory?.usagePercent === 'number' ? data.memory.usagePercent : prev.memoryUsage,
        diskUsage: typeof data?.disk?.usagePercent === 'number' ? data.disk.usagePercent : prev.diskUsage,
      }));
    } catch (e) {
      // ignore
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // One-time welcome overlay per session
  useEffect(() => {
    try {
      const raw = localStorage.getItem('session');
      const parsed = raw ? JSON.parse(raw) : null;
      const tokenFrag = parsed?.access_token?.slice(0, 16) || parsed?.user?.id || 'default';
      const key = `welcome_admin_shown_${tokenFrag}`;
      const alreadyShown = sessionStorage.getItem(key);
      if (!alreadyShown) {
        setShowWelcome(true);
        sessionStorage.setItem(key, '1');
        const t = setTimeout(() => setShowWelcome(false), 2600);
        return () => clearTimeout(t);
      }
    } catch (_) {
      // Fallback: show once
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 2600);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    // Fetch real user data from the API
    const fetchUsers = async () => {
      try {
        const userData = await apiService.getUsers();
        console.log('Users fetched:', userData);
        // Map backend shape: users with nested user_profiles (*)
        const formattedUsers = (Array.isArray(userData) ? userData : []).map((user) => {
          const profile = user.user_profiles || user.profile || {};
          const firstName = profile.first_name || '';
          const lastName = profile.last_name || '';
          const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name || user.email || 'Unknown';
          const initials = fullName
            .split(' ')
            .filter(Boolean)
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          
          // Check for provider profile picture first, then fallback to user profile picture
          let avatarUrl = '';
          if (user.role === 'service_provider' && user.provider_profile?.profile_photo_url) {
            avatarUrl = user.provider_profile.profile_photo_url;
          } else {
            avatarUrl = user.avatar_url || profile.profile_picture_url || profile.avatar_url || '';
          }
          
          if (avatarUrl && !/^https?:\/\//i.test(avatarUrl) && typeof supabaseUrl === 'string' && supabaseUrl) {
            const base = supabaseUrl.replace(/\/$/, '');
            const path = String(avatarUrl).replace(/^\//, '');
            avatarUrl = `${base}/storage/v1/object/public/${path}`;
          }
          const lastLoginIso = user.updated_at || user.created_at || null;
          return {
            ...user,
            name: fullName,
            email: user.email,
            profile,
            avatar: avatarUrl || initials,
            department: profile.department || 'General',
            status: user.status || 'active',
            lastLogin: lastLoginIso ? new Date(lastLoginIso).toLocaleString() : 'Never',
          };
        });
        // Resolve storage paths to public/signed URLs when needed and fetch provider profiles
        const resolvedUsers = await Promise.all(formattedUsers.map(async (u) => {
          let finalAvatar = u.avatar;
          
          // Handle user avatar URL resolution
          if (typeof u.avatar === 'string' && u.avatar && !/^https?:\/\//i.test(u.avatar)) {
            const match = u.avatar.match(/^([^\/]+)\/(.+)$/);
            if (match) {
              const bucket = match[1];
              const key = match[2];
              try {
                const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
                if (pub?.publicUrl) {
                  finalAvatar = pub.publicUrl;
                }
              } catch (_) {}
              if (!finalAvatar || !/^https?:\/\//i.test(finalAvatar)) {
                try {
                  const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(key, 3600);
                  if (signed?.signedUrl) {
                    finalAvatar = signed.signedUrl;
                  }
                } catch (_) {}
              }
            }
          }

          // For service providers, use the status from service_provider_details or provider_profiles
          let serviceProviderStatus = u.status;
          
          if (u.role === 'service_provider') {
            // Use service provider details status first, then provider profile status
            if (u.service_provider_details?.status) {
              serviceProviderStatus = u.service_provider_details.status;
            } else if (u.provider_profile?.status) {
              serviceProviderStatus = u.provider_profile.status;
            } else {
              serviceProviderStatus = 'pending';
            }
            
            // Debug logging for status resolution
            console.log(`Service provider ${u.name} (${u.id}):`, {
              userStatus: u.status,
              serviceProviderDetailsStatus: u.service_provider_details?.status,
              providerProfileStatus: u.provider_profile?.status,
              hasProfilePhoto: !!u.provider_profile?.profile_photo_url,
              finalStatus: serviceProviderStatus
            });
          }

          return { 
            ...u, 
            avatar: finalAvatar,
            status: serviceProviderStatus
          };
        }));
        setUsers(resolvedUsers);
        // Update user-related metrics based on live data
        try {
          const nowMs = Date.now();
          const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
          const newUsersCount = resolvedUsers.filter(u => {
            const created = u?.created_at || u?.profile?.created_at;
            const ts = created ? new Date(created).getTime() : NaN;
            return !Number.isNaN(ts) && ts >= sevenDaysAgoMs;
          }).length;
          setSystemMetrics(prev => ({
            ...prev,
            totalUsers: resolvedUsers.length,
            newUsers: newUsersCount
          }));
        } catch (_) {
          // ignore metric calc errors
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Set some default data in case of error
        setUsers([]);
      }
    };
    
    fetchUsers();
    
    // Fetch live activity feed
    fetchActivityFeed();

    // Keep placeholder values for non-user metrics without overriding live user counts
    setSystemMetrics(prev => ({
      ...prev,
      systemUptime: "99.97%",
      responseTime: "45ms",
      cpuUsage: 23,
      memoryUsage: 67,
      diskUsage: 42,
      networkTraffic: "2.4 GB/s",
      activeSessions: 456,
      failedLogins: 12,
      securityThreats: 3
    }));

    // Convert real notifications to recent activity format
    const activityFromNotifications = notifications.map(notif => ({
      id: notif.id,
      user: notif.sender_id ? "System" : "System",
      action: notif.title,
      target: notif.message,
      timestamp: notif.time,
      type: notif.type,
      severity: notif.priority === 'urgent' ? 'high' : notif.priority === 'high' ? 'medium' : 'info',
      metadata: notif.metadata
    }));
    
    setRecentActivity(activityFromNotifications);

    // Convert real notifications to alerts format
    const alertsFromNotifications = notifications.map(notif => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      severity: notif.priority,
      timestamp: notif.time,
      status: notif.status === 'unread' ? 'active' : notif.status === 'read' ? 'resolved' : 'pending',
      metadata: notif.metadata
    }));
    
    setAlerts(alertsFromNotifications);

    setAnalytics(prev => ({
      ...prev,
      userGrowth: { current: 1247, previous: 1189, change: "+4.9%" },
      revenueGrowth: { current: 456000, previous: 432000, change: "+5.6%" },
      serviceRequests: { current: 892, previous: 756, change: "+18.0%" },
      customerSatisfaction: { current: 4.7, previous: 4.5, change: "+4.4%" }
    }));

    setSystemHealth({
      servers: { status: "healthy", uptime: "99.97%", lastCheck: "2 minutes ago" },
      database: { status: "healthy", uptime: "99.99%", lastCheck: "1 minute ago" },
      network: { status: "healthy", uptime: "99.95%", lastCheck: "3 minutes ago" },
      storage: { status: "warning", uptime: "99.89%", lastCheck: "5 minutes ago" },
      security: { status: "healthy", uptime: "100%", lastCheck: "1 minute ago" },
      applications: { status: "healthy", uptime: "99.93%", lastCheck: "4 minutes ago" }
    });

    setSecurityEvents([
      { id: 1, type: "failed_login", user: "david.w@company.com", ip: "192.168.1.45", timestamp: "3 hours ago", severity: "medium", status: "investigating" },
      { id: 2, type: "suspicious_activity", user: "unknown", ip: "203.45.67.89", timestamp: "5 hours ago", severity: "high", status: "blocked" },
      { id: 3, type: "permission_change", user: "john.smith@company.com", target: "emily.d@company.com", timestamp: "2 hours ago", severity: "low", status: "approved" },
      { id: 4, type: "data_access", user: "sarah.j@company.com", resource: "Customer Database", timestamp: "1 hour ago", severity: "info", status: "normal" }
    ]);

    setPerformanceData({
      responseTime: [45, 42, 48, 51, 47, 43, 46, 49, 44, 45, 47, 48],
      cpuUsage: [23, 25, 28, 31, 27, 24, 26, 29, 22, 25, 27, 23],
      memoryUsage: [67, 65, 68, 71, 69, 66, 67, 70, 64, 67, 69, 67],
      activeUsers: [456, 442, 468, 481, 473, 458, 465, 472, 451, 463, 470, 456]
    });

    // Services & Categories
    setCategories([
      { id: 1, name: 'Home Maintenance', description: 'Repairs and maintenance for homes' },
      { id: 2, name: 'Elder Care', description: 'Care and assistance for the elderly' },
      { id: 3, name: 'Transport', description: 'Driver and logistics services' },
      { id: 4, name: 'Delivery', description: 'Parcel and medicine delivery' }
    ]);

    setServices([
      { id: 1, categoryId: 1, name: 'Plumbing', pricingModel: 'fixed', basePrice: 50 },
      { id: 2, categoryId: 1, name: 'Electrical', pricingModel: 'hourly', basePrice: 20 },
      { id: 3, categoryId: 4, name: 'Medicine Delivery', pricingModel: 'per_km', basePrice: 1.5 }
    ]);

    // Providers (demo placeholders for pending/available; real assignments shown in Allocation tab)
    setProvidersPending([]);
    setProviders([]);

    // Monitoring
    setServiceRequests([
      { id: 'REQ-1001', customer: 'Emily Davis', category: 'Home Maintenance', service: 'Plumbing', status: 'in_progress', priority: 'high' },
      { id: 'REQ-1002', customer: 'John Smith', category: 'Transport', service: 'Airport Drop', status: 'pending', priority: 'medium' }
    ]);
    setOngoingTasks([
      { id: 'TASK-9001', provider: 'QuickFix Co.', job: 'Electrical Diagnosis', eta: '40m', progress: 70 },
      { id: 'TASK-9002', provider: 'SafeRide', job: 'Pickup to Airport', eta: '15m', progress: 35 }
    ]);

    // Feedback
    setReviews([
      { id: 'RV-8001', customer: 'Alice', provider: 'QuickFix Co.', rating: 5, comment: 'Great service!', flagged: false },
      { id: 'RV-8002', customer: 'Bob', provider: 'SafeRide', rating: 3, comment: 'Pickup was late', flagged: false }
    ]);
  }, []);

  // Fetch live activity feed
  const fetchActivityFeed = async () => {
    try {
      setActivityLoading(true);
      const response = await apiService.getAdminActivityFeed(50);
      if (response.success) {
        setRecentActivity(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch activity feed:', error);
      // Keep existing activity data if fetch fails
    } finally {
      setActivityLoading(false);
    }
  };

  // Live system metrics polling
  useEffect(() => {
    fetchMetrics();
    const intervalId = setInterval(() => fetchMetrics(true), 5000);
    return () => { clearInterval(intervalId); };
  }, []);

  // Fetch global rating summary for ratings card
  const fetchRatingSummary = async () => {
    try {
      const res = await apiService.getAdminRatingSummary();
      if (res && res.success && res.data) {
        setRatingSummary({
          average_rating: res.data.average_rating || 0,
          total_reviews: res.data.total_reviews || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin rating summary:', error);
    }
  };

  useEffect(() => {
    fetchRatingSummary();
  }, []);

  // Fetch allocations when Allocation tab is active
  const fetchAllocations = async () => {
    try {
      const res = await apiService.getAdminAllocations(200);
      if (res && res.success) {
        setAllocations(res.data || []);
      } else if (Array.isArray(res)) {
        setAllocations(res);
      }
    } catch (error) {
      console.error('Failed to fetch admin allocations:', error);
      setAllocations([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'allocation') {
      fetchAllocations();
    }
  }, [activeTab]);

  // Fetch billing summary when Billing tab is active
  const fetchBillingSummary = async () => {
    try {
      const res = await apiService.getAdminBillingSummary(200);
      if (res && res.success && res.data) {
        setInvoices(res.data.customer_payments || []);
        setPayouts(res.data.provider_payouts || []);
        setTransactions(res.data.transactions || []);
      } else {
        setInvoices([]);
        setPayouts([]);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch admin billing summary:', error);
      setInvoices([]);
      setPayouts([]);
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBillingSummary();
    }
  }, [activeTab]);

  // Fetch contact form submissions for feedback tab
  const fetchAdminContactMessages = async () => {
    try {
      setFeedbackLoading(true);
      const res = await apiService.getAdminContactMessages(200, null, user?.id || null);
      if (res && res.success) {
        setContactMessages(Array.isArray(res.data) ? res.data : []);
      } else {
        setContactMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch admin contact messages:', error);
      setContactMessages([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchAdminContactMessages();
    }
  }, [activeTab, user?.id]);

  // Live activity feed polling
  useEffect(() => {
    fetchActivityFeed();
    const activityIntervalId = setInterval(() => fetchActivityFeed(), 30000); // Poll every 30 seconds
    return () => { clearInterval(activityIntervalId); };
  }, []);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      rotateX: -10
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    }
  };

  const stats = [
    { label: "Total Users", value: (systemMetrics.totalUsers || 0).toLocaleString(), icon: Users, color: "#8b5cf6", change: `+${systemMetrics.newUsers || 0}`, changeType: "positive" },
    { label: "System Uptime", value: systemMetrics.systemUptime || "0%", icon: Server, color: "#10b981", change: "+0.02%", changeType: "positive" },
    { label: "Active Sessions", value: (systemMetrics.activeSessions || 0).toLocaleString(), icon: Activity, color: "#4f9cf9", change: "+12", changeType: "positive" },
    // Replace Security Score card with Ratings card
    {
      label: "Average Rating",
      value: `${(ratingSummary.average_rating || 0).toFixed ? ratingSummary.average_rating.toFixed(1) : ratingSummary.average_rating || 0}/5.0`,
      icon: Star,
      color: "#fbbf24",
      change: `${ratingSummary.total_reviews || 0} reviews`,
      changeType: "positive"
    }
  ];

  const navItems = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'services', label: 'Services', icon: Settings },
    { key: 'leave', label: 'Provider Leave', icon: Calendar },
    { key: 'allocation', label: 'Allocation', icon: Target },
    { key: 'monitoring', label: 'Monitoring', icon: Activity },
    { key: 'billing', label: 'Worker Payments', icon: IndianRupee },
    { key: 'feedback', label: 'Feedback', icon: Star },
    { key: 'system', label: 'System Health', icon: Server },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'analytics', label: 'Analytics', icon: PieChart }
  ];

  // Sync tab from URL query parameter (?tab=...) - watch for changes
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && navItems.some(n => n.key === tab)) {
        setActiveTab(tab);
      } else if (!tab) {
        // If no tab parameter, default to overview
        setActiveTab('overview');
      }
    } catch (_) {
      // ignore bad query strings
    }
  }, [location.search, location.pathname]);

  // Reset search and filter states when switching to users tab
  useEffect(() => {
    if (activeTab === 'users') {
      // Reset search and filter states to ensure clean state
      setSearchQuery('');
      setSortKey('name_asc');
      setSelectedRole('');
    }
  }, [activeTab]);

  // Fetch provider leave when Leave tab is active
  const fetchProviderLeave = async () => {
    setProviderLeaveLoading(true);
    setProviderLeaveError(null);
    try {
      const res = await apiService.getAdminProviderTimeOff();
      setProviderLeave(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch provider leave:', err);
      setProviderLeave([]);
      setProviderLeaveError(err?.message || 'Failed to load provider leave');
    } finally {
      setProviderLeaveLoading(false);
    }
  };

  // Fetch provider availability (next 7 days)
  const fetchProviderAvailability = async () => {
    setProviderAvailabilityLoading(true);
    setProviderAvailabilityError(null);
    try {
      const res = await apiService.getAdminProviderAvailability();
      setProviderAvailability(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch provider availability:', err);
      setProviderAvailability([]);
      setProviderAvailabilityError(err?.message || 'Failed to load provider availability');
    } finally {
      setProviderAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leave') {
      fetchProviderLeave();
      fetchProviderAvailability();
    }
  }, [activeTab]);

  // Fetch admin bookings when Bookings tab is active
  const fetchAdminBookings = async () => {
    setAdminBookingsLoading(true);
    try {
      const res = await apiService.getAdminBookings({
        limit: 200,
        status: bookingsFilterStatus === 'all' ? undefined : bookingsFilterStatus
      });
      setAdminBookings(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch admin bookings:', err);
      setAdminBookings([]);
      toast.error('Failed to load bookings');
    } finally {
      setAdminBookingsLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'bookings') fetchAdminBookings();
  }, [activeTab, bookingsFilterStatus]);

  // Open "Assign provider" modal and load candidate providers (both individual & team-capable)
  const openAssignProviderModal = async (booking) => {
    setAssignProviderBooking(booking);
    setAssignProviderSelectedId('');
    setAssignProviderProviders([]);
    setAssignProviderFetchLoading(true);
    try {
      // Prefer ML-based ranked providers from backend; fall back to simple provider list if ML is unavailable
      const mlResp = await apiService.getRecommendedProviders(booking.id, 5);
      const mlProviders = mlResp?.recommendedProviders || [];

      if (Array.isArray(mlProviders) && mlProviders.length > 0) {
        setAssignProviderProviders(mlProviders);
      } else {
        // Fallback to existing listProviders logic if ML returns nothing
        const data = await apiService.listProviders();
        const providers = data.providers || [];
        const serviceId = booking.service_id || booking.service_id;
        const categoryId = booking.category_id || booking.category_id;

        const activeProviders = providers.filter((p) => (
          p.status === 'active' || p.provider_status === 'active'
        ));

        const matching = activeProviders.filter((p) => {
          const provServiceId = p.service_id;
          const provCategoryId = p.service_category_id;

          if (serviceId && provServiceId && provServiceId === serviceId) return true;
          if (!provServiceId && provCategoryId && categoryId && provCategoryId === categoryId) {
            return true;
          }
          if (!provServiceId && !provCategoryId) return true;
          return false;
        });

        setAssignProviderProviders(matching.length ? matching : activeProviders);
        if (!(matching.length || activeProviders.length)) {
          toast.error('No active providers available for this booking.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch providers for assign-provider modal:', err);
      toast.error(err?.message || 'Failed to load providers');
      setAssignProviderProviders([]);
    } finally {
      setAssignProviderFetchLoading(false);
    }
  };

  const closeAssignProviderModal = () => {
    setAssignProviderBooking(null);
    setAssignProviderSelectedId('');
    setAssignProviderProviders([]);
  };

  const submitAssignProvider = async () => {
    if (!assignProviderBooking?.id || !assignProviderSelectedId) {
      toast.error('Please select a provider.');
      return;
    }
    setAssignProviderLoading(true);
    try {
      await apiService.assignBooking(assignProviderBooking.id, assignProviderSelectedId);
      toast.success('Provider assigned to booking.');
      closeAssignProviderModal();
      fetchAdminBookings();
    } catch (err) {
      console.error('Assign provider failed:', err);
      toast.error(err?.message || 'Failed to assign provider');
    } finally {
      setAssignProviderLoading(false);
    }
  };

  // For a given team assignment, load per-member accept/decline so admin can see who declined
  const fetchTeamAcceptancesForBooking = async (assignmentId) => {
    if (!assignmentId || teamAcceptanceLoadingId === assignmentId) return;
    try {
      setTeamAcceptanceLoadingId(assignmentId);
      const res = await apiService.getAssignmentAcceptances(assignmentId);
      if (res && res.assignment_id) {
        setTeamAcceptanceDetails(prev => ({
          ...prev,
          [assignmentId]: res
        }));
      }
    } catch (error) {
      console.error('Failed to fetch team assignment acceptances for admin:', error);
      toast.error(error?.message || 'Failed to load team responses');
    } finally {
      setTeamAcceptanceLoadingId(null);
    }
  };

  // Open Assign Team modal immediately, then fetch available teams for this booking
  const openAssignTeamModal = async (booking) => {
    setAssignTeamBooking(booking);
    setAssignTeamSelectedTeamId('');
    setAssignTeamNotes('');
    setAssignTeamAvailableTeams([]);
    setAssignTeamNoServiceCategory(false);
    const serviceId = booking.service_id || (booking.services && (booking.services.id ?? booking.services[0]?.id));
    const categoryId = booking.category_id || (booking.service_categories && (booking.service_categories.id ?? booking.service_categories[0]?.id));
    if (!serviceId && !categoryId) {
      setAssignTeamNoServiceCategory(true);
      setAssignTeamFetchLoading(false);
      return;
    }
    setAssignTeamFetchLoading(true);
    try {
      const res = await apiService.getAvailableTeamsForService(serviceId || null, categoryId || null, {
        scheduled_date: booking.scheduled_date || undefined,
        scheduled_time: booking.scheduled_time || undefined,
        exclude_booking_id: booking.id || undefined
      });
      setAssignTeamAvailableTeams(res?.teams || []);
      if (!(res?.teams?.length)) {
        toast.error('No teams available for this service/category.');
      }
    } catch (err) {
      console.error('Failed to fetch available teams:', err);
      toast.error(err?.message || 'Failed to load teams');
      setAssignTeamAvailableTeams([]);
    } finally {
      setAssignTeamFetchLoading(false);
    }
  };

  const closeAssignTeamModal = () => {
    setAssignTeamBooking(null);
    setAssignTeamSelectedTeamId('');
    setAssignTeamNotes('');
    setAssignTeamAvailableTeams([]);
    setAssignTeamNoServiceCategory(false);
  };

  const submitAssignTeam = async () => {
    if (!assignTeamBooking?.id || !assignTeamSelectedTeamId) {
      toast.error('Please select a team.');
      return;
    }
    const team = assignTeamAvailableTeams.find(t => t.id === assignTeamSelectedTeamId);
    if (!team?.team_members?.length) {
      toast.error('Selected team has no members.');
      return;
    }
    const activeMembers = team.team_members.filter(m => m.status === 'active');
    const assignedMemberIds = activeMembers
      .map(m => m.user_id || m.users?.id)
      .filter(Boolean);
    if (!assignedMemberIds.length) {
      toast.error('No active members in selected team.');
      return;
    }
    setAssignTeamLoading(true);
    try {
      await apiService.assignTeamToBooking({
        booking_id: assignTeamBooking.id,
        team_id: assignTeamSelectedTeamId,
        assigned_member_ids: assignedMemberIds,
        notes: assignTeamNotes.trim() || undefined
      });
      toast.success('Team assigned. Workers will see this job in their dashboard and can Accept or Decline.');
      closeAssignTeamModal();
      fetchAdminBookings();
    } catch (err) {
      console.error('Assign team failed:', err);
      toast.error(err?.message || 'Failed to assign team');
    } finally {
      setAssignTeamLoading(false);
    }
  };

  // Reset component state when navigating back to users tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTab === 'users') {
        // Force re-render of user management section
        setUsers(prev => [...prev]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTab]);

  const handleUserAction = async (userId, action, reason = '') => {
    try {
      console.log('🔄 Updating user status:', userId, 'to', action, 'reason:', reason);
      
      // Get the user to check if they're a service provider
      const user = users.find(u => u.id === userId);
      const isServiceProvider = user?.role === 'service_provider';
      
      // Call the API to update user status
      await apiService.updateUserStatus(userId, action);
      
      // If it's a service provider, also update their provider profile status
      if (isServiceProvider) {
        try {
          await apiService.updateProviderProfileStatus(userId, action, reason);
          console.log('✅ Provider profile status updated');
        } catch (profileError) {
          console.warn('⚠️ Failed to update provider profile status:', profileError);
          // Don't fail the entire operation if provider profile update fails
        }
      }
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: action }
            : user
        )
      );
      
      // Show success message
      const actionText = action === 'active' ? 'activated' : 'suspended';
      const userType = isServiceProvider ? 'Service provider' : 'User';
      const emailText = action === 'suspended' ? ' and notification email sent' : 
                       (action === 'active' && user.status === 'suspended') ? ' and reactivation email sent' : '';
      toast.success(`${userType} ${actionText} successfully${emailText}`);
      
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      toast.error(error?.message || 'Failed to update user status');
    }
  };

  // Handle suspension confirmation
  const handleSuspendUser = (userId, userName) => {
    setSuspensionData({ userId, userName, reason: '' });
    setIsSuspensionModalOpen(true);
  };

  // Confirm suspension
  const confirmSuspension = async () => {
    if (!suspensionData.userId) return;
    
    try {
      await handleUserAction(suspensionData.userId, 'suspended', suspensionData.reason);
      setIsSuspensionModalOpen(false);
      setSuspensionData({ userId: null, userName: '', reason: '' });
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  // Cancel suspension
  const cancelSuspension = () => {
    setIsSuspensionModalOpen(false);
    setSuspensionData({ userId: null, userName: '', reason: '' });
  };

  // Profile modal removed; profile view is now a dedicated page

  const handleAlertAction = (alertId, action) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: action }
          : alert
      )
    );
  };

  const handleWageRequestDecision = async (alert, decision) => {
    if (!alert?.metadata?.wage_request_id) {
      toast.error('Wage request details missing');
      return;
    }
    try {
      await apiService.decideWageRequest(alert.metadata.wage_request_id, {
        decision,
        adminUserId: user?.id || null,
        comment: null,
        newHourlyRate: undefined
      });
      toast.success(
        decision === 'approve'
          ? 'Wage increase request approved and worker rate updated'
          : 'Wage increase request rejected'
      );
      // Mark alert as resolved locally
      setAlerts(prev =>
        prev.map(a =>
          a.id === alert.id ? { ...a, status: 'resolved' } : a
        )
      );
      // Also mark notification as read for admin
      markAsRead(alert.id);
    } catch (err) {
      console.error('Failed to process wage request decision:', err);
      toast.error(err?.message || 'Failed to process wage request');
    }
  };

  const handleSecurityEventAction = (eventId, action) => {
    setSecurityEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, status: action }
          : event
      )
    );
  };

  // Services & Categories are now handled by dedicated pages

  // Allocation Handlers
  const handleApproveProvider = (id) => {
    setProvidersPending(prev => prev.filter(p => p.id !== id));
    const approved = providersPending.find(p => p.id === id);
    if (approved) setProviders(prev => [...prev, { id: approved.id, name: approved.name, specialization: approved.specialization, rating: 0, available: true }]);
  };

  const handleAssignProvider = (requestId, providerId, mode = 'Manual') => {
    setAllocations(prev => {
      const existing = prev.find(a => a.requestId === requestId);
      if (existing) {
        return prev.map(a => a.requestId === requestId ? { ...a, assignedProviderId: providerId, mode } : a);
      }
      return [...prev, { id: prev.length ? Math.max(...prev.map(a => a.id)) + 1 : 1, requestId, category: '', service: '', assignedProviderId: providerId, mode }];
    });
  };

  const handleAddUser = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const role = formData.get('role')?.toString();
    const department = formData.get('department')?.toString().trim();
    if (!name || !email || !role) return;
    const initials = name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
    setUsers(prev => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map(u => u.id)) + 1 : 1,
        name,
        email,
        role,
        status: 'active',
        lastLogin: new Date().toISOString().slice(0,16).replace('T',' '),
        department: department || 'General',
        permissions: [],
        avatar: initials
      }
    ]);
    setIsAddUserOpen(false);
  };

  const roleDistribution = React.useMemo(() => {
    const counts = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});
    const roles = ['admin','supervisor','service_provider','customer','driver'];
    const total = users.length || 1;
    return roles.map(r => ({ role: r, count: counts[r] || 0, percent: Math.round(((counts[r] || 0) / total) * 100) }));
  }, [users]);

  // Hide admin accounts from User Management table
  const usersForManagement = React.useMemo(() =>
    users.filter(u => String(u?.role || '').toLowerCase() !== 'admin')
  , [users]);

  const managedUsersFilteredSorted = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = usersForManagement.filter(u => {
      if (!query) return true;
      const haystack = `${u.name || ''} ${u.email || ''} ${u.profile?.phone || ''}`.toLowerCase();
      return haystack.includes(query);
    });

    if (selectedRole) {
      list = list.filter(u => String(u.role || '').toLowerCase() === String(selectedRole).toLowerCase());
    }

    const comparator = {
      name_asc: (a, b) => (a.name || '').localeCompare(b.name || ''),
      name_desc: (a, b) => (b.name || '').localeCompare(a.name || ''),
      last_login_desc: (a, b) => {
        const ta = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const tb = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        return tb - ta;
      },
      last_login_asc: (a, b) => {
        const ta = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const tb = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        return ta - tb;
      }
    }[sortKey] || (() => 0);

    return list.slice().sort(comparator);
  }, [usersForManagement, searchQuery, sortKey, selectedRole]);

  // Format activity timestamp
  const formatActivityTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return activityTime.toLocaleDateString();
  };

  // Handle alert actions
  const handleResolveAlert = async (alertId) => {
    try {
      console.log('Resolving alert:', alertId);
      // In a real implementation, you would call an API to resolve the alert
      toast.success('Security alert resolved successfully');
      // Refresh activity feed to update the alert status
      await fetchActivityFeed();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleViewAlertDetails = (activity) => {
    console.log('Viewing alert details:', activity);
    // In a real implementation, you might open a modal or navigate to a details page
    const details = activity.details;
    const message = `Alert Details:\n\nType: ${activity.type}\nDescription: ${activity.description}\nTimestamp: ${activity.timestamp}\n\nAdditional Info:\n${JSON.stringify(details, null, 2)}`;
    alert(message);
  };

  const handleUnlockAccount = async (userEmail) => {
    try {
      console.log('Unlocking account for:', userEmail);
      // In a real implementation, you would call an API to unlock the account
      toast.success(`Account unlocked for ${userEmail}`);
      await fetchActivityFeed();
    } catch (error) {
      console.error('Failed to unlock account:', error);
      toast.error('Failed to unlock account');
    }
  };

  const handleUnsuspendUser = async (userId) => {
    try {
      console.log('Unsuspending user:', userId);
      await handleUserAction(userId, 'active');
      toast.success('User unsuspended successfully');
      await fetchActivityFeed();
    } catch (error) {
      console.error('Failed to unsuspend user:', error);
      toast.error('Failed to unsuspend user');
    }
  };

  const handleResolveSystemAlert = async (alertId) => {
    try {
      console.log('Acknowledging system alert:', alertId);
      // In a real implementation, you would call an API to acknowledge the alert
      toast.success('System alert acknowledged');
      await fetchActivityFeed();
    } catch (error) {
      console.error('Failed to acknowledge system alert:', error);
      toast.error('Failed to acknowledge system alert');
    }
  };

  const handleViewSystemMetrics = () => {
    // Navigate to system health tab or open metrics modal
    navigate('/dashboard/admin?tab=system', { replace: true });
    toast.info('Navigating to system health monitoring');
  };

  return (
    <div className="admin-dashboard-new">
      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="welcome-card"
              initial={{ y: -20, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <div className="welcome-title">Welcome, Admin</div>
              <div className="welcome-subtitle">{displayName}</div>
              <button className="btn-primary" onClick={() => setShowWelcome(false)}>
                Enter Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Logo size="small" />
          <button 
            className="sidebar-toggle mobile-only"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => {
                // Update URL with tab parameter instead of just local state
                navigate(`/dashboard/admin?tab=${item.key}`, { replace: true });
                setIsSidebarOpen(false);
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <motion.header 
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div 
            className="header-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.button 
              className="mobile-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} />
            </motion.button>
            <div className="header-title-section">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Admin Dashboard
              </motion.h1>
              <motion.div 
                className="header-breadcrumb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="breadcrumb-item">Dashboard</span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-item active">
                  {activeTab === 'overview' ? 'Overview' : 
                   activeTab === 'bookings' ? 'Bookings' :
                   activeTab === 'users' ? 'User Management' :
                   activeTab === 'services' ? 'Services' :
                   activeTab === 'billing' ? 'Worker Payments' :
                   activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </span>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="header-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Current Date & Time */}
            <motion.div 
              className="header-datetime"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Clock size={16} />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </motion.div>

            <motion.button 
              className="admin-theme-toggle" 
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="admin-theme-icon">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </div>
            </motion.button>
            
            <NotificationBell adminUserId={user?.id} />
            
            {/* User Profile Section */}
            <motion.div 
              className="header-user-profile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="user-profile-avatar">
                {headerAvatarUrl && !headerAvatarError ? (
                  <img
                    src={headerAvatarUrl}
                    alt={displayName}
                    onError={() => setHeaderAvatarError(true)}
                  />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="user-profile-info">
                <span className="user-profile-name">{displayName}</span>
                <span className="user-profile-role">Administrator</span>
              </div>
            </motion.div>
            
            <motion.button 
              className="btn-primary header-action-btn" 
              onClick={() => navigate('/admin/add-service-provider')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Plus size={18} />
              <span>Add Provider</span>
            </motion.button>
          </motion.div>
        </motion.header>

        {/* Content Area */}
        <main className="admin-content">
          {/* Stats Section */}
          <motion.section 
            className="stats-section"
            ref={statsRef}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <div className="stats-grid">
              {stats.map((stat, index) => {
                // Extract numeric value for animation
                const numericValue = typeof stat.value === 'string' 
                  ? parseFloat(stat.value.replace(/[^0-9.]/g, '')) || 0 
                  : stat.value;
                const isPercentage = stat.value.toString().includes('/100') || stat.value.toString().includes('%');
                
                return (
                  <motion.div 
                    key={stat.label}
                    className="stat-card"
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ 
                      scale: 1.05,
                      y: -8,
                      transition: { type: "spring", stiffness: 400, damping: 17 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300,
                      delay: index * 0.1
                    }}
                  >
                    <motion.div 
                      className="stat-icon" 
                      style={{ backgroundColor: stat.color }}
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.15,
                        transition: { duration: 0.5 }
                      }}
                    >
                      <stat.icon size={24} color="white" />
                    </motion.div>
                    <div className="stat-content">
                      <h3>
                        {isPercentage ? (
                          <AnimatedNumber 
                            value={numericValue} 
                            duration={2000}
                            suffix={stat.value.toString().includes('/100') ? '/100' : '%'}
                          />
                        ) : (
                          <AnimatedNumber 
                            value={numericValue} 
                            duration={2000}
                            formatNumber={true}
                          />
                        )}
                      </h3>
                      <p>{stat.label}</p>
                      {stat.change && (
                        <motion.span 
                          className={`change ${stat.changeType}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          {stat.change}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <motion.div 
                className="overview-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {/* System Overview */}
                <motion.div 
                  className="system-overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    System Overview
                  </motion.h3>
                  <div className="overview-grid">
                    <motion.div 
                      className="overview-card"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.4 }}
                    >
                      <div className="card-header">
                        <h4>Performance Metrics</h4>
                        <button
                          className="btn-secondary"
                          onClick={() => fetchMetrics()}
                          disabled={isRefreshing}
                          aria-label="Refresh performance metrics"
                          title={isRefreshing ? 'Refreshing…' : 'Refresh'}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <RefreshCw 
                            size={16} 
                            className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} 
                          />
                          {isRefreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                      </div>
                      <div className="metrics-list">
                        <motion.div 
                          className="metric-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="metric-header">
                            <span>Response Time</span>
                            <span className="metric-value">{systemMetrics.responseTime}</span>
                          </div>
                        </motion.div>
                        <motion.div 
                          className="metric-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="metric-header">
                            <span>CPU Usage</span>
                            <span className="metric-value">
                              <AnimatedNumber value={systemMetrics.cpuUsage} duration={1500} decimals={1} suffix="%" />
                            </span>
                          </div>
                          <div className="metric-progress-bar">
                            <motion.div 
                              className="metric-progress-fill cpu"
                              initial={{ width: 0 }}
                              animate={{ width: `${systemMetrics.cpuUsage}%` }}
                              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                        <motion.div 
                          className="metric-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="metric-header">
                            <span>Memory Usage</span>
                            <span className="metric-value">
                              <AnimatedNumber value={systemMetrics.memoryUsage} duration={1500} decimals={1} suffix="%" />
                            </span>
                          </div>
                          <div className="metric-progress-bar">
                            <motion.div 
                              className="metric-progress-fill memory"
                              initial={{ width: 0 }}
                              animate={{ width: `${systemMetrics.memoryUsage}%` }}
                              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                        <motion.div 
                          className="metric-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="metric-header">
                            <span>Disk Usage</span>
                            <span className="metric-value">
                              <AnimatedNumber value={systemMetrics.diskUsage} duration={1500} decimals={1} suffix="%" />
                            </span>
                          </div>
                          <div className="metric-progress-bar">
                            <motion.div 
                              className="metric-progress-fill disk"
                              initial={{ width: 0 }}
                              animate={{ width: `${systemMetrics.diskUsage}%` }}
                              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="overview-card"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.5 }}
                    >
                      <div className="card-header">
                        <h4>Platform Statistics</h4>
                        <BarChart3 size={16} />
                      </div>
                      <div className="stats-list">
                        <div className="stat-item">
                          <div className="stat-icon-small">
                            <Users size={16} />
                          </div>
                          <div className="stat-info">
                            <span>Total Users</span>
                            <span className="stat-value">{(systemMetrics.totalUsers || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-icon-small">
                            <Activity size={16} />
                          </div>
                          <div className="stat-info">
                            <span>Active Sessions</span>
                            <span className="stat-value">{(systemMetrics.activeSessions || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-icon-small">
                            <Globe size={16} />
                          </div>
                          <div className="stat-info">
                            <span>Network Traffic</span>
                            <span className="stat-value">{systemMetrics.networkTraffic}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="overview-card"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.6 }}
                    >
                      <div className="card-header">
                        <h4>Security Status</h4>
                        <Shield size={16} />
                      </div>
                      <div className="security-status">
                        <div className="security-score">
                          <span className="score-value">94</span>
                          <span className="score-max">/100</span>
                        </div>
                        <div className="security-metrics">
                          <div className="security-metric">
                            <span>Failed Logins</span>
                            <span className="metric-value warning">{systemMetrics.failedLogins}</span>
                          </div>
                          <div className="security-metric">
                            <span>Security Threats</span>
                            <span className="metric-value danger">{systemMetrics.securityThreats}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="overview-card role-distribution"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.7 }}
                    >
                      <div className="card-header">
                        <h4>User Roles</h4>
                        <Users size={16} />
                      </div>
                      <div className="roles-list">
                        {roleDistribution.map((item, index) => (
                          <motion.div 
                            key={item.role} 
                            className="role-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                          >
                            <span className={`role-label ${item.role}`}>{item.role.replace('_',' ')}</span>
                            <div className="role-bar">
                              <motion.div 
                                className="role-fill" 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percent}%` }}
                                transition={{ delay: 0.8 + index * 0.1, duration: 1, ease: "easeOut" }}
                              />
                            </div>
                            <motion.span 
                              className="role-count"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                            >
                              {item.count}
                            </motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <div className="recent-activity">
                  <div className="activity-header">
                    <h3>Recent Activity</h3>
                    <button 
                      className="btn-secondary refresh-btn" 
                      onClick={fetchActivityFeed}
                      disabled={activityLoading}
                      title="Refresh activity feed"
                    >
                      <RefreshCw size={16} className={activityLoading ? 'spinning' : ''} />
                      {activityLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  <div className="activity-list">
                    {activityLoading && recentActivity.length === 0 ? (
                      <SkeletonLoader type="card" count={5} />
                    ) : recentActivity.length === 0 ? (
                      <div className="activity-empty">
                        <Activity size={24} />
                        <span>No recent activity</span>
                      </div>
                    ) : (
                      recentActivity.slice(0, 10).map((activity, index) => (
                        <motion.div 
                          key={activity.id} 
                          className={`activity-item ${activity.status} ${activity.severity ? `${activity.severity}-severity` : ''}`}
                          data-type={activity.type}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: index * 0.05,
                            duration: 0.4,
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            x: 4,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <div className="activity-icon">
                            {activity.icon === 'user-plus' && <UserPlus size={16} />}
                            {activity.icon === 'check-circle' && <CheckCircle size={16} />}
                            {activity.icon === 'play-circle' && <PlayCircle size={16} />}
                            {activity.icon === 'x-circle' && <XCircle size={16} />}
                            {activity.icon === 'info' && <Info size={16} />}
                            {activity.icon === 'log-in' && <LogIn size={16} />}
                            {activity.icon === 'edit' && <Edit size={16} />}
                            {activity.icon === 'alert-triangle' && <AlertTriangle size={16} />}
                            {activity.icon === 'shield' && <Shield size={16} />}
                            {activity.icon === 'shield-alert' && <ShieldAlert size={16} />}
                            {activity.icon === 'lock' && <Lock size={16} />}
                            {activity.icon === 'cpu' && <Cpu size={16} />}
                            {activity.icon === 'database' && <Database size={16} />}
                            {activity.icon === 'server' && <Server size={16} />}
                          </div>
                          <div className="activity-content">
                            <div className="activity-header">
                              <span className="actor">{activity.actor}</span>
                              <span className="action">{activity.action}</span>
                              <span className="description">{activity.description}</span>
                            </div>
                          <span className="timestamp">{formatActivityTimestamp(activity.timestamp)}</span>
                        </div>
                        <div className="activity-actions">
                          <span className={`status-badge ${activity.status}`}>
                            {activity.status === 'info' && 'INFO'}
                            {activity.status === 'success' && 'SUCCESS'}
                            {activity.status === 'warning' && 'WARNING'}
                            {activity.status === 'error' && 'ERROR'}
                          </span>
                          {activity.actionable && (
                            <div className="action-buttons">
                              {activity.type === 'failed_login_attempts' && (
                                <>
                                  <button 
                                    className="btn-action resolve" 
                                    onClick={() => handleResolveAlert(activity.id)}
                                    title="Resolve security alert"
                                  >
                                    Resolve
                                  </button>
                                  <button 
                                    className="btn-action view" 
                                    onClick={() => handleViewAlertDetails(activity)}
                                    title="View detailed information"
                                  >
                                    View Details
                                  </button>
                                </>
                              )}
                              {activity.type === 'account_locked' && (
                                <>
                                  <button 
                                    className="btn-action resolve" 
                                    onClick={() => handleUnlockAccount(activity.details.user_email)}
                                    title="Unlock user account"
                                  >
                                    Unlock
                                  </button>
                                  <button 
                                    className="btn-action view" 
                                    onClick={() => handleViewAlertDetails(activity)}
                                    title="View account details"
                                  >
                                    View Details
                                  </button>
                                </>
                              )}
                              {activity.type === 'admin_action' && activity.details.action_type === 'suspended' && (
                                <>
                                  <button 
                                    className="btn-action resolve" 
                                    onClick={() => handleUnsuspendUser(activity.details.provider_id)}
                                    title="Unsuspend user"
                                  >
                                    Unsuspend
                                  </button>
                                  <button 
                                    className="btn-action view" 
                                    onClick={() => navigate(`/admin/users/${activity.details.provider_id}`)}
                                    title="View user profile"
                                  >
                                    View Profile
                                  </button>
                                </>
                              )}
                              {activity.type === 'system_health' && activity.details.metric === 'cpu_usage' && (
                                <>
                                  <button 
                                    className="btn-action resolve" 
                                    onClick={() => handleResolveSystemAlert(activity.id)}
                                    title="Acknowledge system alert"
                                  >
                                    Acknowledge
                                  </button>
                                  <button 
                                    className="btn-action view" 
                                    onClick={() => handleViewSystemMetrics()}
                                    title="View system metrics"
                                  >
                                    View Metrics
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="active-alerts">
                  <h3>Active Alerts</h3>
                  <motion.div 
                    className="alerts-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {alerts.filter(alert => alert.status === 'active').map((alert, index) => (
                      <motion.div 
                        key={alert.id} 
                        className={`alert-card ${alert.severity}`}
                        variants={itemVariants}
                        whileHover={{ 
                          scale: 1.02,
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className="alert-header">
                          <div className="alert-icon">
                            {alert.type === 'security' && <Shield size={20} />}
                            {alert.type === 'performance' && <Activity size={20} />}
                            {alert.type === 'system' && <Server size={20} />}
                          </div>
                          <div className="alert-info">
                            <h4>{alert.title}</h4>
                            <p>{alert.message}</p>
                          </div>
                          <span className={`severity ${alert.severity}`}>{alert.severity}</span>
                        </div>
                        <div className="alert-footer">
                          <span className="timestamp">{alert.timestamp}</span>
                          <div className="alert-actions">
                            {alert.type === 'wage_increase_request' ? (
                              <>
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleWageRequestDecision(alert, 'approve')}
                                >
                                  Approve & Update Wage
                                </button>
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleWageRequestDecision(alert, 'reject')}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="btn-secondary"
                                  onClick={() => handleAlertAction(alert.id, 'resolved')}
                                >
                                  Resolve
                                </button>
                                <button className="btn-secondary">View Details</button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <motion.div 
                    className="actions-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {[
                      { icon: UserPlus, label: 'Add Service Provider', path: '/admin/add-service-provider' },
                      { icon: Settings, label: 'Manage Categories', path: '/admin/categories' },
                      { icon: Settings, label: 'Add Service', path: '/admin/add-service' },
                      { icon: Database, label: 'Manage Categories', path: '/admin/categories' },
                      { icon: Target, label: 'Assign Provider', path: '/admin/assign-provider' },
                      { icon: IndianRupee, label: 'Create Bill', path: '/admin/create-bill' }
                    ].map((action, index) => (
                      <motion.button
                        key={index}
                        className="action-card"
                        onClick={() => navigate(action.path)}
                        variants={itemVariants}
                        whileHover={{ 
                          scale: 1.05,
                          y: -4,
                          transition: { type: "spring", stiffness: 400, damping: 17 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <action.icon size={24} />
                        <span>{action.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div 
                className="bookings-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="bookings-page">
                  <header className="bookings-header">
                    <div className="bookings-header-top">
                      <div className="bookings-header-icon-wrap">
                        <Calendar size={28} strokeWidth={2} />
                      </div>
                      <div>
                        <h2>Bookings</h2>
                        <p className="bookings-subtitle">View and manage all service bookings</p>
                      </div>
                    </div>
                    <div className="bookings-controls">
                      <div className="bookings-search-section">
                        <label className="bookings-search-label">Search bookings</label>
                        <div className="bookings-search-wrap">
                          <Search size={20} className="search-icon" aria-hidden />
                          <input
                            ref={searchInputRef}
                            type="search"
                            placeholder="Customer name, email, service, category, phone, provider..."
                            value={bookingsSearch}
                            onChange={(e) => setBookingsSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                setBookingsSearch('');
                                searchInputRef.current?.blur();
                              }
                            }}
                            className="bookings-search"
                            aria-label="Search bookings by customer, service, email, or phone"
                            autoComplete="off"
                          />
                          {bookingsSearch ? (
                            <button type="button" className="search-clear" onClick={() => setBookingsSearch('')} aria-label="Clear search">
                              <X size={18} />
                            </button>
                          ) : null}
                        </div>
                        {(bookingsSearch || bookingsFilterStatus !== 'all') && (
                          <button
                            type="button"
                            className="bookings-clear-filters"
                            onClick={() => { setBookingsSearch(''); setBookingsFilterStatus('all'); }}
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                      <div className="bookings-filters">
                        <label className="filter-label" htmlFor="bookings-status-filter">Status</label>
                        <select
                          id="bookings-status-filter"
                          value={bookingsFilterStatus}
                          onChange={(e) => setBookingsFilterStatus(e.target.value)}
                          className="filter-select"
                          aria-label="Filter by booking status"
                        >
                          <option value="all">All statuses</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          type="button"
                          className="btn-refresh"
                          onClick={fetchAdminBookings}
                          disabled={adminBookingsLoading}
                          title="Refresh list"
                          aria-label="Refresh bookings"
                        >
                          <RefreshCw size={18} className={adminBookingsLoading ? 'spin' : ''} />
                          Refresh
                        </button>
                      </div>
                    </div>
                  </header>

                  {adminBookings.length > 0 && (() => {
                    const total = adminBookings.length;
                    const pending = adminBookings.filter(b => b.booking_status === 'pending').length;
                    const assigned = adminBookings.filter(b => b.booking_status === 'assigned').length;
                    const inProgress = adminBookings.filter(b => b.booking_status === 'in_progress').length;
                    const completed = adminBookings.filter(b => b.booking_status === 'completed').length;
                    const cancelled = adminBookings.filter(b => b.booking_status === 'cancelled').length;
                    return (
                      <div className="bookings-stats">
                        <button type="button" className={`booking-stat ${bookingsFilterStatus === 'all' ? 'active' : ''}`} onClick={() => setBookingsFilterStatus('all')}>
                          <span className="stat-value">{total}</span>
                          <span className="stat-label">Total</span>
                        </button>
                        <button type="button" className={`booking-stat pending ${bookingsFilterStatus === 'pending' ? 'active' : ''}`} onClick={() => setBookingsFilterStatus('pending')}>
                          <span className="stat-value">{pending}</span>
                          <span className="stat-label">Pending</span>
                        </button>
                        <button type="button" className={`booking-stat assigned ${bookingsFilterStatus === 'assigned' ? 'active' : ''}`} onClick={() => setBookingsFilterStatus('assigned')}>
                          <span className="stat-value">{assigned}</span>
                          <span className="stat-label">Assigned</span>
                        </button>
                        <button type="button" className={`booking-stat in_progress ${bookingsFilterStatus === 'in_progress' ? 'active' : ''}`} onClick={() => setBookingsFilterStatus('in_progress')}>
                          <span className="stat-value">{inProgress}</span>
                          <span className="stat-label">In progress</span>
                        </button>
                        <button type="button" className={`booking-stat completed ${bookingsFilterStatus === 'completed' ? 'active' : ''}`} onClick={() => setBookingsFilterStatus('completed')}>
                          <span className="stat-value">{completed}</span>
                          <span className="stat-label">Completed</span>
                        </button>
                        <button type="button" className={`booking-stat cancelled ${bookingsFilterStatus === 'cancelled' ? 'active' : ''}`} onClick={() => setBookingsFilterStatus('cancelled')}>
                          <span className="stat-value">{cancelled}</span>
                          <span className="stat-label">Cancelled</span>
                        </button>
                      </div>
                    );
                  })()}

                  {adminBookings.some(b => b.booking_status === 'pending') && (
                    <p className="bookings-flow-hint">
                      <Info size={18} />
                      For pending bookings, use <strong>Assign to team</strong> so workers see the job in their dashboard and can Accept or Decline.
                    </p>
                  )}

                  <div className="bookings-list">
                    {adminBookingsLoading ? (
                      <div className="bookings-loading">
                        <SkeletonLoader />
                        <span>Loading bookings...</span>
                      </div>
                    ) : (() => {
                      const q = (bookingsSearch || '').toLowerCase().trim();
                      const filtered = q
                        ? adminBookings.filter(b => {
                            const searchable = [
                              b.customer_name,
                              b.customer_email,
                              b.service_name,
                              b.category_name,
                              b.contact_phone,
                              b.contact_email,
                              b.provider_name,
                              b.provider_email,
                              b.service_address,
                              b.admin_notes,
                              b.special_instructions
                            ].filter(Boolean).join(' ').toLowerCase();
                            return searchable.includes(q);
                          })
                        : adminBookings;
                      if (filtered.length === 0) {
                        return (
                          <div className="bookings-empty">
                            <Search size={40} strokeWidth={1.5} />
                            <h3>{adminBookings.length === 0 ? 'No bookings found' : 'No matching bookings'}</h3>
                            <p>{adminBookings.length === 0 ? 'Adjust the status filter or check back later.' : 'Try a different search or clear the filter.'}</p>
                          </div>
                        );
                      }
                      return (
                        <>
                          <div className="bookings-results-bar">
                            <span className="results-count">
                              {q || bookingsFilterStatus !== 'all'
                                ? `Showing ${filtered.length} of ${adminBookings.length} ${adminBookings.length === 1 ? 'booking' : 'bookings'}`
                                : `${filtered.length} ${filtered.length === 1 ? 'booking' : 'bookings'}`}
                            </span>
                            {q && (
                              <span className="results-filter-hint">
                                <Search size={14} /> &quot;{bookingsSearch.trim()}&quot;
                              </span>
                            )}
                          </div>
                          <ul className="booking-cards">
                            {filtered.map((b, index) => {
                              const isExpanded = expandedBookingId === b.id;
                              return (
                                <motion.li
                                  key={b.id}
                                  className={`booking-card ${b.booking_status || ''}`}
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
                                >
                              <div className="booking-card-header">
                                <div className="booking-card-title">
                                  <span className="booking-id">#{String(b.id).slice(0, 8)}</span>
                                  <h4>{b.customer_name || '—'}</h4>
                                  <span className="booking-service">{b.service_name || '—'}</span>
                                  {b.category_name && <span className="booking-category">{b.category_name}</span>}
                                </div>
                                <div className="booking-card-meta">
                                  <span className={`booking-status-badge ${b.booking_status || ''}`}>
                                    {b.booking_status?.replace('_', ' ') || '—'}
                                  </span>
                                  <span className="booking-amount">₹{Number(b.total_amount)?.toLocaleString() ?? '—'}</span>
                                </div>
                              </div>
                              <div className="booking-card-body">
                                <div className="booking-grid">
                                  <div className="booking-info-block">
                                    <span className="info-label"><Calendar size={14} /> Schedule</span>
                                    <div>{b.scheduled_date} · {b.scheduled_time}</div>
                                    {b.duration_minutes != null && <div className="muted">{b.duration_minutes} min</div>}
                                  </div>
                                  <div className="booking-info-block">
                                    <span className="info-label"><MapPin size={14} /> Location</span>
                                    <div>{b.service_address || '—'}</div>
                                    {(b.service_city || b.service_postal_code) && (
                                      <div className="muted">{[b.service_city, b.service_state, b.service_postal_code].filter(Boolean).join(', ')}</div>
                                    )}
                                  </div>
                                  <div className="booking-info-block">
                                    <span className="info-label"><Phone size={14} /> Contact</span>
                                    <div>{b.contact_phone || '—'}</div>
                                    {b.contact_email && <div className="muted">{b.contact_email}</div>}
                                  </div>
                                  <div className="booking-info-block">
                                    <span className="info-label"><IndianRupee size={14} /> Payment</span>
                                    <div>{b.payment_method || '—'} · <span className={`tiny-badge ${b.payment_status || ''}`}>{b.payment_status || '—'}</span></div>
                                  </div>
                                  <div className="booking-info-block">
                                    <span className="info-label"><UserCheck size={14} /> Assigned to</span>
                                    <div>{b.provider_name || '—'}</div>
                                    {(b.provider_assigned_at || b.audit_assigned_at) && (
                                      <div className="muted">
                                        {new Date(b.provider_assigned_at || b.audit_assigned_at).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                  {b.booking_status === 'pending' && b.team_assignment_status === 'cancelled' && (
                                    <div className="booking-info-block full-width">
                                      <span className="info-label">
                                        <AlertTriangle size={14} /> Team status
                                      </span>
                                      <div className="warning-text">
                                        Previous team/worker <strong>declined or cancelled</strong> this job. Please assign it to another team.
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="booking-card-actions">
                                  {(() => {
                                    const isGroupService = b.service_type === 'group';
                                    // Treat any booking that already has a team assignment (or is marked team booking)
                                    // as a team-only flow to avoid showing "Assign provider" for team jobs.
                                    const isTeamBooking = isGroupService || !!b.assigned_team_id || b.is_team_booking === true;

                                    const needsReassign =
                                      b.booking_status === 'pending' &&
                                      b.team_assignment_status === 'cancelled';

                                    // For individual bookings (no team), allow assigning a single provider
                                    const showProviderAssign = !isTeamBooking;

                                    // For team bookings (group service or has team assignment), allow assigning/reassigning team
                                    const showTeamAssign = isTeamBooking;

                                    return (
                                      <>
                                        {showProviderAssign && (
                                          <button
                                            type="button"
                                            className="btn-assign-provider"
                                            onClick={() => openAssignProviderModal(b)}
                                            title="Assign an individual provider to this booking"
                                          >
                                            <UserCheck size={16} /> Assign provider
                                          </button>
                                        )}

                                        {showTeamAssign && (
                                          <button
                                            type="button"
                                            className="btn-assign-team"
                                            onClick={() => openAssignTeamModal(b)}
                                            title={
                                              needsReassign
                                                ? 'Previous team assignment was declined or cancelled – assign a new team to this booking'
                                                : 'Assign a team – team members will see this job and can accept or decline'
                                            }
                                          >
                                            <Users size={16} /> {needsReassign ? 'Reassign team' : 'Assign team'}
                                          </button>
                                        )}
                                      </>
                                    );
                                  })()}
                                  <button
                                    type="button"
                                    className="booking-expand-btn"
                                    onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                                    aria-expanded={isExpanded}
                                  >
                                    {isExpanded ? <><ChevronUp size={16} /> Less</> : <><ChevronDown size={16} /> More details</>}
                                  </button>
                                </div>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      className="booking-card-details"
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <div className="details-grid">
                                        <div><strong>Created</strong> {b.created_at ? new Date(b.created_at).toLocaleString() : '—'}</div>
                                        <div><strong>Confirmed at</strong> {b.provider_confirmed_at ? new Date(b.provider_confirmed_at).toLocaleString() : '—'}</div>
                                        <div><strong>Base / Fee / Tax</strong> ₹{Number(b.base_price)?.toLocaleString() ?? '—'} + {Number(b.service_fee) ?? 0} + {Number(b.tax_amount) ?? 0}</div>
                                        <div><strong>Priority</strong> {b.priority_level || '—'} · <strong>Source</strong> {b.booking_source || '—'}</div>
                                        {b.special_instructions && <div className="full-width"><strong>Instructions</strong> {b.special_instructions}</div>}
                                        {b.admin_notes && <div className="full-width"><strong>Admin notes</strong> {b.admin_notes}</div>}
                                        {(b.emergency_contact_name || b.emergency_contact_phone) && (
                                          <div className="full-width"><strong>Emergency</strong> {b.emergency_contact_name || b.emergency_contact_phone}</div>
                                        )}
                                        {b.customer_rating != null && <div><strong>Rating</strong> {b.customer_rating}★</div>}
                                        {b.customer_feedback && <div className="full-width"><strong>Feedback</strong> {b.customer_feedback}</div>}

                                        {/* Team assignment responses: show who accepted / declined so admin knows which worker declined */}
                                        {b.team_assignment_id && (
                                          <div className="full-width">
                                            <strong>Team responses</strong>
                                            {teamAcceptanceLoadingId === b.team_assignment_id && (
                                              <span className="muted" style={{ marginLeft: '0.5rem' }}>Loading…</span>
                                            )}
                                            {!teamAcceptanceDetails[b.team_assignment_id] && teamAcceptanceLoadingId !== b.team_assignment_id && (
                                              <div style={{ marginTop: '0.35rem' }}>
                                                <button
                                                  type="button"
                                                  className="btn-secondary small"
                                                  onClick={() => fetchTeamAcceptancesForBooking(b.team_assignment_id)}
                                                >
                                                  View team responses
                                                </button>
                                              </div>
                                            )}
                                            {teamAcceptanceDetails[b.team_assignment_id] && (
                                              <ul className="team-responses-list">
                                                {teamAcceptanceDetails[b.team_assignment_id].acceptances?.map((m) => {
                                                  const name = m.full_name || m.email || m.user_id;
                                                  const status = m.status || 'pending';
                                                  let statusLabel = status;
                                                  let statusClass = '';
                                                  if (status === 'accepted') statusClass = 'status-accepted';
                                                  else if (status === 'declined') statusClass = 'status-declined';
                                                  else statusClass = 'status-pending';
                                                  return (
                                                    <li key={m.user_id} className={`team-response-item ${statusClass}`}>
                                                      <span className="team-member-name">{name}</span>
                                                      <span className="team-member-status">{statusLabel}</span>
                                                    </li>
                                                  );
                                                })}
                                              </ul>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.li>
                          );
                        })}
                          </ul>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div 
                key={`users-${location.pathname}-${location.search}`}
                className="users-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="users-header">
                  <h3>User Management</h3>
                  <div className="users-actions">
                    <div className="search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search users"
                      />
                    </div>
                    <select
                      className="filter-select"
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value)}
                      aria-label="Sort users"
                    >
                      <option value="name_asc">Name A–Z</option>
                      <option value="name_desc">Name Z–A</option>
                      <option value="last_login_desc">Last Login (newest)</option>
                      <option value="last_login_asc">Last Login (oldest)</option>
                    </select>
                    <select
                      className="filter-select"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      aria-label="Filter by role"
                    >
                      <option value="">All Roles</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="service_provider">Service Provider</option>
                      <option value="customer">Customer</option>
                      <option value="driver">Driver</option>
                    </select>
                    <button className="btn-primary" onClick={() => navigate('/admin/add-service-provider')}>
                      <Plus size={20} />
                      Add Service Provider
                    </button>
                  </div>
                </div>

                <div className="users-table">
                  <div className="table-header">
                    <div className="header-cell">User</div>
                    <div className="header-cell">Role</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Last Login</div>
                    <div className="header-cell">Actions</div>
                  </div>
                  <div className="table-body">
                    {managedUsersFilteredSorted.length === 0 ? (
                      <div className="table-row">
                        <div className="table-cell" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '3rem', opacity: 0.3 }}>👥</div>
                            <div style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 500 }}>
                              {users.length === 0 ? 'Loading users...' : 'No users found matching your criteria.'}
                            </div>
                            {users.length > 0 && (
                              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                Try adjusting your search or filter settings
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      managedUsersFilteredSorted.map((user, index) => (
                      <motion.div 
                        key={user.id} 
                        className="table-row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.03,
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                        whileHover={{ 
                          backgroundColor: "rgba(79, 156, 249, 0.03)",
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className="table-cell user-info" onClick={() => navigate(`/admin/users/${user.id}`)} style={{ cursor: 'pointer' }}>
                          <div className={`user-avatar ${user.providerProfileImage ? 'has-profile-image' : ''}`}>
                            {(() => {
                              // Priority: Provider profile image > User avatar > Initials
                              const imageUrl = user.providerProfileImage || user.avatar;
                              
                              if (typeof imageUrl === 'string' && /^https?:\/\//i.test(imageUrl)) {
                                return (
                                  <img
                                    src={imageUrl}
                                    alt={user.name}
                                    onError={(e) => {
                                      const el = e.currentTarget;
                                      const wrapper = el.parentElement;
                                      if (wrapper) {
                                        wrapper.textContent = (user.name || user.email || 'NA')
                                          .split(' ')
                                          .filter(Boolean)
                                          .map(p => p[0])
                                          .slice(0,2)
                                          .join('')
                                          .toUpperCase();
                                        wrapper.classList.remove('has-profile-image');
                                      }
                                    }}
                                  />
                                );
                              } else {
                                return (typeof imageUrl === 'string' ? imageUrl : 'NA');
                              }
                            })()}
                          </div>
                          <div className="user-details">
                            <span 
                              className={`user-name ${user.role === 'service_provider' ? 'has-service-provider' : ''}`}
                              data-role={user.role}
                            >
                              {user.name}
                            </span>
                            <span className="user-email">{user.email}</span>
                            {user.profile?.phone && <span className="user-phone">{user.profile.phone}</span>}
                          </div>
                        </div>
                        <div className="table-cell">
                          <span className={`role-badge ${user.role}`}>{user.role.replace('_', ' ')}</span>
                          {user.profile?.specialization && (
                            <span className="specialization">{user.profile.specialization}</span>
                          )}
                        </div>
                        {/* removed department column */}
                        <div className="table-cell">
                          <span className={`status-badge ${user.status}`}>
                            {(() => {
                              // Add appropriate icons for different statuses
                              switch (user.status) {
                                case 'active':
                                  return (
                                    <>
                                      <CheckCircle size={12} />
                                      <span>Active</span>
                                    </>
                                  );
                                case 'suspended':
                                  return (
                                    <>
                                      <UserX size={12} />
                                      <span>Suspended</span>
                                    </>
                                  );
                                case 'pending':
                                  return (
                                    <>
                                      <Clock size={12} />
                                      <span>Pending Verification</span>
                                    </>
                                  );
                                case 'pending':
                                  return (
                                    <>
                                      <Clock size={12} />
                                      <span>Pending</span>
                                    </>
                                  );
                                case 'verified':
                                  return (
                                    <>
                                      <CheckCircle size={12} />
                                      <span>Verified</span>
                                    </>
                                  );
                                case 'rejected':
                                  return (
                                    <>
                                      <XCircle size={12} />
                                      <span>Rejected</span>
                                    </>
                                  );
                                case 'incomplete':
                                  return (
                                    <>
                                      <AlertTriangle size={12} />
                                      <span>Incomplete</span>
                                    </>
                                  );
                                default:
                                  return <span>{user.status}</span>;
                              }
                            })()}
                          </span>
                          
                          
                          {user.profile?.verified && (
                            <span className="verified-badge">Verified</span>
                          )}
                        </div>
                        <div className="table-cell">
                          <div className="login-info">
                            <span>{user.lastLogin}</span>
                            {user.profile?.last_active && (
                              <span className="last-active">Active: {new Date(user.profile.last_active).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="table-cell actions">
                          <button className="btn-icon" title="View" onClick={() => navigate(`/admin/users/${user.id}`)}>
                            <Eye size={16} />
                          </button>
                          {(() => {
                            // Only show suspend/activate buttons for users who can be suspended
                            const canBeSuspended = user.status === 'active' || user.status === 'verified';
                            const canBeActivated = user.status === 'suspended';
                            
                            if (canBeSuspended) {
                              return (
                                <button 
                                  className="btn-icon warning" 
                                  title="Suspend"
                                  onClick={() => handleSuspendUser(user.id, user.name)}
                                >
                                  <UserX size={16} />
                                </button>
                              );
                            } else if (canBeActivated) {
                              return (
                                <button 
                                  className="btn-icon success" 
                                  title="Activate"
                                  onClick={() => handleUserAction(user.id, 'active')}
                                >
                                  <UserCheck size={16} />
                                </button>
                              );
                            } else if (user.status === 'pending') {
                              return (
                                <button 
                                  className="btn-icon info" 
                                  title="Verify Profile"
                                  onClick={() => navigate(`/admin/users/${user.id}`)}
                                >
                                  <CheckCircle size={16} />
                                </button>
                              );
                            } else if (user.status === 'rejected') {
                              return (
                                <button 
                                  className="btn-icon warning" 
                                  title="Review Profile"
                                  onClick={() => navigate(`/admin/users/${user.id}`)}
                                >
                                  <AlertTriangle size={16} />
                                </button>
                              );
                            }
                            return null;
                          })()}
                          
                        </div>
                      </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div 
                className="services-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="admin-forms-header">
                  <h2>Admin Management</h2>
                  <p>Manage all administrative functions from here</p>
                </div>
                
                <div className="admin-forms-grid">
                  {/* Service Categories (Add + Manage) */}
                  <motion.div 
                    className="admin-form-card"
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                  >
                    <div className="form-card-icon">
                      <Settings size={32} />
                    </div>
                    <div className="form-card-content">
                      <h3>Service Categories</h3>
                      <p>Create and manage service categories with descriptions and icons</p>
                      <ul className="form-card-features">
                        <li>Category Name & Description</li>
                        <li>Icon/Image Upload</li>
                        <li>Status: Active, Inactive, Suspended</li>
                      </ul>
                    </div>
                    <div className="form-card-action">
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/admin/add-category')}>Create Category →</button>
                        <button className="btn-secondary" onClick={() => navigate('/admin/categories')}>Manage Categories →</button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Services (Create + Manage) */}
                  <motion.div 
                    className="admin-form-card"
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                  >
                    <div className="form-card-icon">
                      <Zap size={32} />
                    </div>
                    <div className="form-card-content">
                      <h3>Services</h3>
                      <p>Create and manage individual services with pricing and status</p>
                      <ul className="form-card-features">
                        <li>Category & Pricing Model</li>
                        <li>Base Price & Duration</li>
                        <li>Status: Active, Inactive, Suspended</li>
                      </ul>
                    </div>
                    <div className="form-card-action">
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/admin/add-service')}>Create Service →</button>
                        <button className="btn-secondary" onClick={() => navigate('/admin/services')}>Manage Services →</button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Add Service Provider */}
                  <motion.div 
                    className="admin-form-card"
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin/add-service-provider')}
                    variants={itemVariants}
                  >
                    <div className="form-card-icon">
                      <UserPlus size={32} />
                    </div>
                    <div className="form-card-content">
                      <h3>Add Service Provider</h3>
                      <p>Create service provider accounts with specialized permissions</p>
                      <ul className="form-card-features">
                        <li>Service Category Assignment</li>
                        <li>Auto-Generated Credentials</li>
                        <li>Status Management</li>
                      </ul>
                    </div>
                    <div className="form-card-action">
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); navigate('/admin/add-service-provider'); }}>Create Provider →</button>
                        <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); navigate('/admin/providers'); }}>Manage Providers →</button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Assign Provider to Service */}
                  <motion.div 
                    className="admin-form-card"
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin/assign-provider')}
                    variants={itemVariants}
                  >
                    <div className="form-card-icon">
                      <Target size={32} />
                    </div>
                    <div className="form-card-content">
                      <h3>Assign Provider to Service</h3>
                      <p>Allocate service providers to specific services with priority</p>
                      <ul className="form-card-features">
                        <li>Service & Provider Selection</li>
                        <li>Priority Level Assignment</li>
                        <li>Performance Metrics Display</li>
                      </ul>
                    </div>
                    <div className="form-card-action">
                      <span>Assign Provider →</span>
                    </div>
                  </motion.div>

                  {/* Billing Setup */}
                  <motion.div 
                    className="admin-form-card"
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin/create-bill')}
                    variants={itemVariants}
                  >
                    <div className="form-card-icon">
                      <IndianRupee size={32} />
                    </div>
                    <div className="form-card-content">
                      <h3>Billing Setup (Create Bill)</h3>
                      <p>Generate invoices for customer services with calculations</p>
                      <ul className="form-card-features">
                        <li>Customer & Service Selection</li>
                        <li>Tax & Discount Calculations</li>
                        <li>Payment Status Management</li>
                      </ul>
                    </div>
                    <div className="form-card-action">
                      <span>Create Bill →</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'allocation' && (
              <motion.div 
                className="allocation-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="content-grid">
                  <div className="content-card">
                    <div className="card-header">
                      <h3>Allocations (Individual & Team)</h3>
                    </div>
                    <div className="list-table">
                      {allocations.length === 0 && (
                        <div className="empty">No allocations found.</div>
                      )}
                      {allocations.map(a => (
                        <div key={a.booking_id} className="list-row">
                          <div className="list-main">
                            <strong>#{String(a.booking_id).slice(0, 8)}</strong>
                            <span className="text-muted">
                              {a.service_name} • {a.allocation_type === 'team' ? 'Team' : a.allocation_type === 'individual' ? 'Individual' : 'Unassigned'} • {a.booking_status}
                            </span>
                            <span className="text-muted">
                              {a.customer_name} • {a.scheduled_date} · {a.scheduled_time || '—'}
                            </span>
                          </div>
                          <div className="list-actions">
                            {a.allocation_type === 'individual' && a.individual && (
                              <div className="allocation-individual">
                                <span className="badge">Provider</span>
                                <span>{a.individual.provider_name}</span>
                              </div>
                            )}
                            {a.allocation_type === 'team' && a.team && (
                              <div className="allocation-team-details">
                                <div>
                                  <span className="badge">Team</span>
                                  <span>{a.team.team_name}</span>
                                </div>
                                <div className="allocation-team-status">
                                  <span className={`status-badge ${a.team.assignment_status || 'pending'}`}>
                                    {a.team.assignment_status || 'pending'}
                                  </span>
                                  <span className="text-muted">
                                    {a.team.responses.accepted} accepted · {a.team.responses.declined} declined · {a.team.responses.pending} pending
                                  </span>
                                </div>
                              </div>
                            )}
                            {a.allocation_type === 'unassigned' && (
                              <span className="status-badge pending">Unassigned</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'monitoring' && (
              <motion.div 
                className="monitoring-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="content-grid">
                  <div className="content-card">
                    <h3>Service Requests</h3>
                    <div className="list-table">
                      {serviceRequests.map(r => (
                        <div key={r.id} className="list-row">
                          <div className="list-main">
                            <strong>{r.id}</strong>
                            <span className="text-muted">{r.customer} • {r.category} • {r.service}</span>
                          </div>
                          <div className="list-actions">
                            <span className={`status-badge ${r.status}`}>{r.status.replace('_',' ')}</span>
                            <span className={`status-badge ${r.priority}`}>{r.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="content-card">
                    <h3>Ongoing Tasks</h3>
                    <div className="list-table">
                      {ongoingTasks.map(t => (
                        <div key={t.id} className="list-row">
                          <div className="list-main">
                            <strong>{t.provider}</strong>
                            <span className="text-muted">{t.job} • ETA {t.eta}</span>
                          </div>
                          <div className="list-actions">
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.progress}%` }}></div></div>
                            <span className="text-muted">{t.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div 
                className="billing-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Total worker payouts</div>
                    <div className="stat-value">
                      ₹{billingStats.totalWorker.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-subtitle">All payouts processed to workers</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Paid vs pending amount</div>
                    <div className="stat-value">
                      ₹{billingStats.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} paid
                    </div>
                    <div className="stat-subtitle">
                      ₹{billingStats.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pending
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Worker payout status</div>
                    <div className="stat-value">
                      Paid: {billingStats.paidCount} • Pending: {billingStats.pendingCount}
                    </div>
                    <div className="stat-subtitle">Helps track any delayed payments</div>
                  </div>
                </div>
                <div className="content-grid">
                  <div className="content-card">
                    <div className="card-header">
                      <h3>Worker Payments & Bank Details</h3>
                    </div>
                    {(!payouts || payouts.length === 0) ? (
                      <div className="empty">
                        No worker payments have been processed yet.  
                        Once payouts are created, you&apos;ll see each worker listed here and can click their name to view full bank / UPI details.
                      </div>
                    ) : (
                      <div className="list-table">
                        {payouts.map((po) => (
                          <div key={po.id} className="list-row">
                            <div className="list-main">
                              <button
                                type="button"
                                className="link-button-strong"
                                onClick={() => {
                                  setSelectedPayout(po);
                                  setShowPayoutModal(true);
                                }}
                              >
                                {po.provider}
                              </button>
                              <span className="text-muted">
                                {po.date
                                  ? new Date(po.date).toLocaleString('en-IN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : '—'}
                              </span>
                              <span className="text-muted small">
                                Method: {(po.payout_preference || po.method || 'auto').toUpperCase()}
                                {po.upi_id && ` • UPI: ${po.upi_id}`}
                                {po.bank_name && po.bank_account_number && (
                                  <> • Bank: {po.bank_name} • A/C: {po.bank_account_number}</>
                                )}
                                {po.bank_ifsc && ` • IFSC: ${po.bank_ifsc}`}
                              </span>
                            </div>
                            <div className="list-actions">
                              <span className="amount">
                                ₹{(po.amount || 0).toFixed(2)}
                              </span>
                              <span className={`status-badge ${po.status || 'paid'}`}>
                                {po.status || 'paid'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'leave' && (
              <motion.div 
                className="leave-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="content-grid">
                  <div className="content-card">
                    <div className="card-header">
                      <h3>Providers on Leave</h3>
                      <button
                        className="btn-secondary"
                        onClick={fetchProviderLeave}
                        disabled={providerLeaveLoading}
                      >
                        <RefreshCw size={18} />
                        <span>{providerLeaveLoading ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                    </div>
                    {providerLeaveLoading && (
                      <div className="empty">Loading provider leave...</div>
                    )}
                    {providerLeaveError && !providerLeaveLoading && (
                      <div className="empty error">{providerLeaveError}</div>
                    )}
                    {!providerLeaveLoading && !providerLeaveError && providerLeave.length === 0 && (
                      <div className="empty">
                        No providers are currently on leave or scheduled for upcoming leave.
                      </div>
                    )}
                    {!providerLeaveLoading && !providerLeaveError && providerLeave.length > 0 && (
                      <div className="list-table compact-rows">
                        <div className="table-header">
                          <div className="header-cell">Provider</div>
                          <div className="header-cell">Dates</div>
                          <div className="header-cell">Status</div>
                        </div>
                        <div className="table-body">
                          {providerLeave.map((row) => {
                            const sameDay = row.start_date === row.end_date;
                            const formatDate = (iso) =>
                              iso
                                ? new Date(iso).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : '';
                            const startLabel = formatDate(row.start_date);
                            const endLabel = formatDate(row.end_date);
                            const rangeLabel = sameDay || !endLabel
                              ? startLabel
                              : `${startLabel} – ${endLabel}`;
                            const status = row.status || 'pending';
                            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
                            return (
                              <button
                                key={row.id}
                                type="button"
                                className="table-row row-clickable"
                                onClick={() => {
                                  setSelectedLeave(row);
                                  setShowLeaveModal(true);
                                }}
                              >
                                <div className="table-cell">
                                  <div className="user-cell-main">
                                    <div className="user-name">{row.provider_name}</div>
                                    {row.email && (
                                      <div className="user-subtext">{row.email}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="table-cell">
                                  <span className="text-muted">{rangeLabel}</span>
                                </div>
                                <div className="table-cell">
                                  <span className={`status-badge ${status}`}>{statusLabel}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="content-card">
                    <div className="card-header">
                      <h3>Upcoming Availability (Next 7 Days)</h3>
                      <button
                        className="btn-secondary"
                        onClick={fetchProviderAvailability}
                        disabled={providerAvailabilityLoading}
                      >
                        <RefreshCw size={18} />
                        <span>{providerAvailabilityLoading ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                    </div>
                    {providerAvailabilityLoading && (
                      <div className="empty">Loading provider availability...</div>
                    )}
                    {providerAvailabilityError && !providerAvailabilityLoading && (
                      <div className="empty error">{providerAvailabilityError}</div>
                    )}
                    {!providerAvailabilityLoading && !providerAvailabilityError && providerAvailability.length === 0 && (
                      <div className="empty">
                        No upcoming availability has been configured for the next 7 days.
                      </div>
                    )}
                    {!providerAvailabilityLoading && !providerAvailabilityError && providerAvailability.length > 0 && (
                      <div className="list-table">
                        <div className="table-header">
                          <div className="header-cell">Provider</div>
                          <div className="header-cell">Date</div>
                          <div className="header-cell">Day</div>
                          <div className="header-cell">Time</div>
                        </div>
                        <div className="table-body">
                          {providerAvailability.map((row) => (
                            <div key={row.id} className="table-row">
                              <div className="table-cell">
                                <div className="user-cell-main">
                                  <div className="user-name">{row.provider_name}</div>
                                  {row.email && (
                                    <div className="user-subtext">{row.email}</div>
                                  )}
                                </div>
                              </div>
                              <div className="table-cell">
                                <span className="text-muted">{row.date}</span>
                              </div>
                              <div className="table-cell">
                                <span className="text-muted">
                                  {row.day.charAt(0).toUpperCase() + row.day.slice(1)}
                                </span>
                              </div>
                              <div className="table-cell">
                                <span className="text-muted">
                                  {row.start && row.end ? `${row.start} – ${row.end}` : '—'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leave details modal */}
            <AnimatePresence>
              {showLeaveModal && selectedLeave && (
                <motion.div
                  className="assign-team-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setShowLeaveModal(false)}
                >
                  <motion.div
                    className="assign-team-modal"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <header className="assign-team-modal-header">
                      <div className="assign-team-modal-header-icon">
                        <Calendar size={24} />
                      </div>
                      <div className="assign-team-modal-header-text">
                        <h2>Leave request</h2>
                        <p>View full details and decide to approve or reject.</p>
                      </div>
                      <button
                        type="button"
                        className="assign-team-modal-close"
                        onClick={() => setShowLeaveModal(false)}
                      >
                        <X size={20} />
                      </button>
                    </header>
                    <div className="assign-team-modal-body">
                      <div className="assign-team-booking-card">
                        <span className="assign-team-booking-id">
                          {selectedLeave.provider_name}
                        </span>
                        <div className="assign-team-booking-meta">
                          <span className="assign-team-booking-service">
                            {selectedLeave.email}
                          </span>
                        </div>
                      </div>
                      <div className="assign-team-info-box">
                        <Info size={18} />
                        <p>
                          {selectedLeave.start_date && selectedLeave.end_date
                            ? `From ${new Date(
                                selectedLeave.start_date
                              ).toLocaleDateString('en-IN')} to ${new Date(
                                selectedLeave.end_date
                              ).toLocaleDateString('en-IN')}`
                            : 'Dates not available'}
                        </p>
                      </div>
                      <div className="assign-team-field">
                        <label>Status</label>
                        <span className={`status-badge ${selectedLeave.status || 'pending'}`}>
                          {(selectedLeave.status || 'pending')
                            .charAt(0)
                            .toUpperCase() +
                            (selectedLeave.status || 'pending').slice(1)}
                        </span>
                      </div>
                      <div className="assign-team-field">
                        <label>Reason</label>
                        <p className="assign-team-notes">
                          {selectedLeave.reason || 'No reason provided.'}
                        </p>
                      </div>
                    </div>
                    <footer className="assign-team-modal-footer">
                      <button
                        type="button"
                        className="assign-team-btn assign-team-btn-secondary"
                        onClick={() => setShowLeaveModal(false)}
                        disabled={leaveDecisionLoading}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="assign-team-btn assign-team-btn-cancel"
                        disabled={leaveDecisionLoading}
                        onClick={async () => {
                          try {
                            setLeaveDecisionLoading(true);
                            await apiService.decideLeaveRequest(selectedLeave.id, { decision: 'reject' });
                            toast.success('Leave request rejected');
                            await fetchProviderLeave();
                            setShowLeaveModal(false);
                          } catch (err) {
                            console.error('Failed to reject leave request:', err);
                            toast.error(err?.message || 'Failed to reject leave request');
                          } finally {
                            setLeaveDecisionLoading(false);
                          }
                        }}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="assign-team-btn assign-team-btn-primary"
                        disabled={leaveDecisionLoading}
                        onClick={async () => {
                          try {
                            setLeaveDecisionLoading(true);
                            await apiService.decideLeaveRequest(selectedLeave.id, { decision: 'approve' });
                            toast.success('Leave request approved');
                            await fetchProviderLeave();
                            setShowLeaveModal(false);
                          } catch (err) {
                            console.error('Failed to approve leave request:', err);
                            toast.error(err?.message || 'Failed to approve leave request');
                          } finally {
                            setLeaveDecisionLoading(false);
                          }
                        }}
                      >
                        {leaveDecisionLoading ? 'Saving...' : 'Approve'}
                      </button>
                    </footer>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Worker payout bank details modal */}
            <AnimatePresence>
              {showPayoutModal && selectedPayout && (
                <motion.div
                  className="assign-team-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setShowPayoutModal(false)}
                >
                  <motion.div
                    className="assign-team-modal"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <header className="assign-team-modal-header">
                      <div className="assign-team-modal-header-icon">
                        <IndianRupee size={24} />
                      </div>
                      <div className="assign-team-modal-header-text">
                        <h2>Worker payout details</h2>
                        <p>
                          Review the worker&apos;s payout method and saved bank / UPI information for this payment.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="assign-team-modal-close"
                        onClick={() => setShowPayoutModal(false)}
                      >
                        <X size={20} />
                      </button>
                    </header>
                    <div className="assign-team-modal-body">
                      <div className="assign-team-booking-card">
                        <span className="assign-team-booking-id">
                          {selectedPayout.provider}
                        </span>
                        <div className="assign-team-booking-meta">
                          <span className="assign-team-booking-service">
                            Booking #{selectedPayout.booking_id || '—'}
                          </span>
                          <span className="assign-team-booking-service">
                            Amount: ₹{(selectedPayout.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="assign-team-info-box">
                        <Info size={18} />
                        <p>
                          Status:{' '}
                          <span className={`status-badge ${selectedPayout.status || 'paid'}`}>
                            {selectedPayout.status || 'paid'}
                          </span>
                          {selectedPayout.date && (
                            <>
                              {' '}• Paid on{' '}
                              {new Date(selectedPayout.date).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="assign-team-field">
                        <label>Payout method</label>
                        <p className="assign-team-notes">
                          {(selectedPayout.payout_preference || selectedPayout.method || 'auto')
                            .toUpperCase()}
                        </p>
                      </div>

                      {selectedPayout.upi_id && (
                        <div className="assign-team-field">
                          <label>UPI ID</label>
                          <p className="assign-team-notes">{selectedPayout.upi_id}</p>
                        </div>
                      )}

                      {(selectedPayout.bank_name ||
                        selectedPayout.bank_account_number ||
                        selectedPayout.bank_ifsc ||
                        selectedPayout.account_holder_name) && (
                        <div className="assign-team-field">
                          <label>Bank account details</label>
                          <p className="assign-team-notes">
                            {selectedPayout.account_holder_name && (
                              <>
                                Account holder: {selectedPayout.account_holder_name}
                                <br />
                              </>
                            )}
                            {selectedPayout.bank_name && (
                              <>
                                Bank: {selectedPayout.bank_name}
                                <br />
                              </>
                            )}
                            {selectedPayout.bank_account_number && (
                              <>
                                Account number: {selectedPayout.bank_account_number}
                                <br />
                              </>
                            )}
                            {selectedPayout.bank_ifsc && (
                              <>IFSC: {selectedPayout.bank_ifsc}</>
                            )}
                          </p>
                        </div>
                      )}

                      {selectedPayout.payout_reference && (
                        <div className="assign-team-field">
                          <label>Payout reference</label>
                          <p className="assign-team-notes">{selectedPayout.payout_reference}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'feedback' && (
              <motion.div 
                className="feedback-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="content-grid">
                  <div className="content-card feedback-inbox-card">
                    <div className="feedback-inbox-header">
                      <h3>Contact Form Messages</h3>
                      <span className="status-badge info">{contactMessages.length} total</span>
                    </div>
                    {feedbackLoading ? (
                      <div className="empty">Loading messages...</div>
                    ) : contactMessages.length === 0 ? (
                      <div className="empty">No contact messages yet</div>
                    ) : (
                      <div className="list-table feedback-message-list">
                        {contactMessages.map((msg) => (
                          <div key={msg.id} className="list-row feedback-message-row">
                            <div className="list-main">
                              <div className="feedback-message-top">
                                <strong>{msg.full_name || 'Unknown sender'}</strong>
                                <span className={`status-badge ${msg.status === 'resolved' ? 'success' : 'warning'}`}>
                                  {msg.status || 'new'}
                                </span>
                              </div>
                              <span className="text-muted">
                                {String(msg.service_type || 'general')
                                  .split('-')
                                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                                  .join(' ')} • {msg.email || 'No email'} • {msg.phone_number || 'No phone'}
                              </span>
                              <div className="comment">{msg.message}</div>
                              <span className="text-muted">
                                {msg.created_at ? new Date(msg.created_at).toLocaleString() : '—'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="content-card">
                    <h3>Customer Feedback</h3>
                    <div className="list-table">
                      {reviews.map(rv => (
                        <div key={rv.id} className="list-row">
                          <div className="list-main">
                            <strong>{rv.customer}</strong>
                            <span className="text-muted">{rv.provider} • {rv.rating}/5</span>
                            <div className="comment">{rv.comment}</div>
                          </div>
                          <div className="list-actions">
                            {!rv.flagged ? (
                              <button className="btn-secondary" onClick={() => setReviews(prev => prev.map(r => r.id === rv.id ? { ...r, flagged: true } : r))}>Flag</button>
                            ) : (
                              <span className="status-badge warning">Flagged</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="content-card">
                    <h3>Disputes & Escalations</h3>
                    <div className="empty">No active disputes</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div 
                className="system-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="system-header">
                  <h3>System Health Monitoring</h3>
                  <button className="btn-primary">
                    <RefreshCw size={20} />
                    Refresh Status
                  </button>
                </div>

                <div className="system-health-grid">
                  {Object.entries(systemHealth).map(([key, health]) => (
                    <div key={key} className={`health-card ${health.status}`}>
                      <div className="health-header">
                        <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                        <span className={`status ${health.status}`}>{health.status}</span>
                      </div>
                      <div className="health-metrics">
                        <div className="metric">
                          <span>Uptime</span>
                          <span className="metric-value">{health.uptime}</span>
                        </div>
                        <div className="metric">
                          <span>Last Check</span>
                          <span className="metric-value">{health.lastCheck}</span>
                        </div>
                      </div>
                      <div className="health-actions">
                        <button className="btn-secondary">View Details</button>
                        <button className="btn-secondary">Configure</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="performance-monitoring">
                  <h3>Performance Monitoring</h3>
                  <div className="performance-grid">
                    <div className="performance-card">
                      <h4>Response Time Trend</h4>
                      <div className="chart-placeholder">
                        <LineChart size={48} />
                        <p>Response time over the last 12 hours</p>
                        <div className="chart-data">
                          {performanceData.responseTime.map((value, index) => (
                            <div key={index} className="data-point" style={{ height: `${value * 2}px` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="performance-card">
                      <h4>Resource Usage</h4>
                      <div className="resource-usage">
                        <div className="resource-item">
                          <span>CPU</span>
                          <div className="usage-bar">
                            <div className="usage-fill" style={{ width: `${systemMetrics.cpuUsage}%` }}></div>
                          </div>
                          <span>{systemMetrics.cpuUsage}%</span>
                        </div>
                        <div className="resource-item">
                          <span>Memory</span>
                          <div className="usage-bar">
                            <div className="usage-fill" style={{ width: `${systemMetrics.memoryUsage}%` }}></div>
                          </div>
                          <span>{systemMetrics.memoryUsage}%</span>
                        </div>
                        <div className="resource-item">
                          <span>Disk</span>
                          <div className="usage-bar">
                            <div className="usage-fill" style={{ width: `${systemMetrics.diskUsage}%` }}></div>
                          </div>
                          <span>{systemMetrics.diskUsage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                className="security-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="security-header">
                  <h3>Security Monitoring</h3>
                  <div className="security-actions">
                    <button className="btn-primary">
                      <Shield size={20} />
                      Run Security Scan
                    </button>
                    <button className="btn-secondary">
                      <Download size={20} />
                      Export Logs
                    </button>
                  </div>
                </div>

                <div className="security-overview">
                  <div className="security-metrics">
                    <div className="metric-card">
                      <div className="metric-header">
                        <Shield size={20} />
                        <span>Security Status</span>
                      </div>
                      <div className="metric-value">94/100</div>
                      <div className="metric-change positive">Stable</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <AlertTriangle size={20} />
                        <span>Active Threats</span>
                      </div>
                      <div className="metric-value">{systemMetrics.securityThreats}</div>
                      <div className="metric-change neutral">No change</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <Lock size={20} />
                        <span>Failed Logins</span>
                      </div>
                      <div className="metric-value">{systemMetrics.failedLogins}</div>
                      <div className="metric-change negative">+3 today</div>
                    </div>
                  </div>
                </div>

                <div className="security-events">
                  <h3>Recent Security Events</h3>
                  <div className="events-table">
                    <div className="table-header">
                      <div className="header-cell">Event Type</div>
                      <div className="header-cell">User/IP</div>
                      <div className="header-cell">Details</div>
                      <div className="header-cell">Timestamp</div>
                      <div className="header-cell">Severity</div>
                      <div className="header-cell">Status</div>
                      <div className="header-cell">Actions</div>
                    </div>
                    <div className="table-body">
                      {securityEvents.map(event => (
                        <div key={event.id} className="table-row">
                          <div className="table-cell">
                            <span className={`event-type ${event.type}`}>{event.type.replace('_', ' ')}</span>
                          </div>
                          <div className="table-cell">{event.user || event.ip}</div>
                          <div className="table-cell">{event.target || event.resource || 'N/A'}</div>
                          <div className="table-cell">{event.timestamp}</div>
                          <div className="table-cell">
                            <span className={`severity ${event.severity}`}>{event.severity}</span>
                          </div>
                          <div className="table-cell">
                            <span className={`status ${event.status}`}>{event.status}</span>
                          </div>
                          <div className="table-cell actions">
                            <button className="btn-secondary">Investigate</button>
                            <button 
                              className="btn-primary"
                              onClick={() => handleSecurityEventAction(event.id, 'resolved')}
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                className="analytics-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="analytics-header">
                  <h3>Platform Analytics</h3>
                  <div className="analytics-filters">
                    <select className="filter-select">
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                    <button className="btn-secondary">
                      <Download size={20} />
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="analytics-overview">
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <h4>User Growth</h4>
                      <div className="analytics-value">
                        <span className="current">{(analytics.userGrowth?.current || 0).toLocaleString()}</span>
                        <span className="change positive">{analytics.userGrowth?.change || "+0%"}</span>
                      </div>
                      <div className="analytics-chart">
                        <BarChart size={48} />
                        <p>User growth trend</p>
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h4>Revenue Growth</h4>
                      <div className="analytics-value">
                        <span className="current">{(analytics.revenueGrowth?.current || 0).toLocaleString()}</span>
                        <span className="change positive">{analytics.revenueGrowth?.change || "+0%"}</span>
                      </div>
                      <div className="analytics-chart">
                        <TrendingUp size={48} />
                        <p>Revenue trend</p>
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h4>Service Requests</h4>
                      <div className="analytics-value">
                        <span className="current">{(analytics.serviceRequests?.current || 0).toLocaleString()}</span>
                        <span className="change positive">{analytics.serviceRequests?.change || "+0%"}</span>
                      </div>
                      <div className="analytics-chart">
                        <ActivityIcon size={48} />
                        <p>Request volume</p>
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h4>Customer Satisfaction</h4>
                      <div className="analytics-value">
                        <span className="current">{analytics.customerSatisfaction.current}/5.0</span>
                        <span className="change positive">{analytics.customerSatisfaction.change}</span>
                      </div>
                      <div className="analytics-chart">
                        <Star size={48} />
                        <p>Satisfaction trend</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="performance-analytics">
                  <h3>Performance Analytics</h3>
                  <div className="performance-charts">
                    <div className="chart-card">
                      <h4>System Performance Trend</h4>
                      <div className="chart-placeholder">
                        <LineChart size={48} />
                        <p>System performance over time</p>
                        <div className="chart-data">
                          {[98.5, 97.2, 98.1, 97.8, 98.9, 98.3, 97.9, 98.7, 98.2, 98.6, 98.4, 98.5].map((value, index) => (
                            <div key={index} className="data-point" style={{ height: `${value}px` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="chart-card">
                      <h4>Security Score Trend</h4>
                      <div className="chart-placeholder">
                        <BarChart size={48} />
                        <p>Security score over time</p>
                        <div className="chart-data">
                          {[91, 92, 90, 93, 91, 94, 92, 93, 91, 94, 93, 94].map((value, index) => (
                            <div key={index} className="data-point" style={{ height: `${value}px` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Add Service Provider Modal */}
      {isAddUserOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddUserOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Add Service Provider</h4>
            </div>
            <form className="modal-body" onSubmit={handleAddUser}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" placeholder="Jane Doe" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" placeholder="jane@example.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select id="role" name="role" required>
                    <option value="admin">Admin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="customer">Customer</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input id="department" name="department" type="text" placeholder="Operations" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAddUserOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to Team Modal - professional layout */}
      <AnimatePresence>
        {assignTeamBooking && (
          <motion.div
            className="assign-team-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAssignTeamModal}
          >
            <motion.div
              className="assign-team-modal"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="assign-team-modal-header">
                <div className="assign-team-modal-header-icon">
                  <Users size={24} strokeWidth={2} />
                </div>
                <div className="assign-team-modal-header-text">
                  <h2>Assign to team</h2>
                  <p>Choose a team for this booking</p>
                </div>
                <button type="button" className="assign-team-modal-close" onClick={closeAssignTeamModal} aria-label="Close">
                  <X size={22} strokeWidth={2} />
                </button>
              </header>

              <div className="assign-team-modal-body">
                <div className="assign-team-booking-card">
                  <span className="assign-team-booking-id">#{String(assignTeamBooking.id).slice(0, 8)}</span>
                  <div className="assign-team-booking-meta">
                    <span className="assign-team-booking-service">{assignTeamBooking.service_name || '—'}</span>
                    <span className="assign-team-booking-datetime">
                      <Calendar size={14} /> {assignTeamBooking.scheduled_date} · {assignTeamBooking.scheduled_time || '—'}
                    </span>
                  </div>
                </div>

                <div className="assign-team-info-box">
                  <Info size={18} />
                  <p>Workers in the selected team will see this job and can <strong>Accept</strong> or <strong>Decline</strong> in their dashboard.</p>
                </div>

                {assignTeamFetchLoading ? (
                  <div className="assign-team-loading-state">
                    <div className="assign-team-spinner" />
                    <span>Loading teams...</span>
                  </div>
                ) : assignTeamNoServiceCategory ? (
                  <div className="assign-team-empty-state">
                    <div className="assign-team-empty-icon">
                      <AlertCircle size={32} />
                    </div>
                    <h4>No service or category</h4>
                    <p>This booking has no service or category set. Edit the booking first, then assign a team.</p>
                  </div>
                ) : (
                  <>
                    <div className="assign-team-field">
                      <label htmlFor="assign-team-select">Team</label>
                      <select
                        id="assign-team-select"
                        value={assignTeamSelectedTeamId}
                        onChange={(e) => setAssignTeamSelectedTeamId(e.target.value)}
                        className="assign-team-select"
                      >
                        <option value="">Select a team</option>
                        {assignTeamAvailableTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({(t.team_members || []).filter(m => m.status === 'active').length} members)
                          </option>
                        ))}
                      </select>
                    </div>

                    {assignTeamSelectedTeamId && (() => {
                      const t = assignTeamAvailableTeams.find(x => x.id === assignTeamSelectedTeamId);
                      const active = (t?.team_members || []).filter(m => m.status === 'active');
                      return (
                        <div className="assign-team-members-block">
                          <span className="assign-team-members-label">Assigned members ({active.length})</span>
                          <ul className="assign-team-members-list">
                            {active.map((m) => {
                              const profile = m.users?.user_profiles;
                              const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : m.users?.email || m.user_id || '—';
                              const occupied = m.occupied === true;
                              return (
                                <li key={m.id || m.user_id} className={occupied ? 'assign-team-member-row occupied' : 'assign-team-member-row'}>
                                  <span className="assign-team-member-dot" />
                                  <span className="assign-team-member-name">{name}</span>
                                  {occupied && (
                                    <span className="assign-team-member-occupied" title="Already assigned to another booking at this time">Occupied</span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })()}

                    <div className="assign-team-field">
                      <label htmlFor="assign-team-notes">Notes <span className="assign-team-optional">(optional)</span></label>
                      <textarea
                        id="assign-team-notes"
                        value={assignTeamNotes}
                        onChange={(e) => setAssignTeamNotes(e.target.value)}
                        className="assign-team-textarea"
                        rows={2}
                        placeholder="Add instructions for the team..."
                      />
                    </div>
                  </>
                )}
              </div>

              {!assignTeamFetchLoading && !assignTeamNoServiceCategory && (
                <footer className="assign-team-modal-footer">
                  <button type="button" className="assign-team-btn assign-team-btn-cancel" onClick={closeAssignTeamModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="assign-team-btn assign-team-btn-primary"
                    onClick={submitAssignTeam}
                    disabled={assignTeamLoading || !assignTeamSelectedTeamId}
                  >
                    {assignTeamLoading ? (
                      <>
                        <span className="assign-team-btn-spinner" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Users size={18} />
                        Assign team
                      </>
                    )}
                  </button>
                </footer>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Provider Modal */}
      <AnimatePresence>
        {assignProviderBooking && (
          <motion.div
            className="assign-team-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAssignProviderModal}
          >
            <motion.div
              className="assign-team-modal"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="assign-team-modal-header">
                <div className="assign-team-modal-header-icon">
                  <UserCheck size={24} strokeWidth={2} />
                </div>
                <div className="assign-team-modal-header-text">
                  <h2>Assign provider</h2>
                  <p>Select an individual worker for this booking</p>
                </div>
                <button type="button" className="assign-team-modal-close" onClick={closeAssignProviderModal} aria-label="Close">
                  <X size={22} strokeWidth={2} />
                </button>
              </header>

              <div className="assign-team-modal-body">
                <div className="assign-team-booking-card">
                  <span className="assign-team-booking-id">#{String(assignProviderBooking.id).slice(0, 8)}</span>
                  <div className="assign-team-booking-meta">
                    <span className="assign-team-booking-service">{assignProviderBooking.service_name || '—'}</span>
                    <span className="assign-team-booking-datetime">
                      <Calendar size={14} /> {assignProviderBooking.scheduled_date} · {assignProviderBooking.scheduled_time || '—'}
                    </span>
                  </div>
                </div>

                <div className="assign-team-info-box">
                  <Info size={18} />
                  <p>The selected provider will be directly assigned to this booking.</p>
                </div>

                {assignProviderFetchLoading ? (
                  <div className="assign-team-loading-state">
                    <div className="assign-team-spinner" />
                    <span>Loading providers...</span>
                  </div>
                ) : (
                  <>
                    <div className="assign-team-field">
                      <label htmlFor="assign-provider-select">Provider</label>
                      <select
                        id="assign-provider-select"
                        value={assignProviderSelectedId}
                        onChange={(e) => setAssignProviderSelectedId(e.target.value)}
                        className="assign-team-select"
                      >
                        <option value="">Select a provider</option>
                        {assignProviderProviders.map((p) => {
                          // Support both ML-ranked shape and legacy listProviders shape
                          const profile = p.user_profiles || {};
                          const fullNameFromProfile = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                          const nameFromMl = p.provider_name;
                          const emailFromMl = p.provider_email || p.email;
                          const displayName = fullNameFromProfile || nameFromMl || emailFromMl || 'Provider';
                          const specialization = p.service_provider_details?.specialization;
                          return (
                            <option key={p.id} value={p.id}>
                              {displayName}
                              {specialization ? ` – ${specialization}` : ''}
                              {typeof p.score === 'number' ? ` (score ${p.score.toFixed(2)})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {!assignProviderFetchLoading && (
                <footer className="assign-team-modal-footer">
                  <button type="button" className="assign-team-btn assign-team-btn-cancel" onClick={closeAssignProviderModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="assign-team-btn assign-team-btn-primary"
                    onClick={submitAssignProvider}
                    disabled={assignProviderLoading || !assignProviderSelectedId}
                  >
                    {assignProviderLoading ? (
                      <>
                        <span className="assign-team-btn-spinner" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserCheck size={18} />
                        Assign provider
                      </>
                    )}
                  </button>
                </footer>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspension Confirmation Modal */}
      {isSuspensionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Suspend User</h3>
              <button 
                className="modal-close" 
                onClick={cancelSuspension}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="suspension-warning">
                <div className="warning-icon">
                  <AlertTriangle size={24} />
                </div>
                <div className="warning-content">
                  <h4>Are you sure you want to suspend this user?</h4>
                  <p>
                    <strong>{suspensionData.userName}</strong> will be unable to log in and access their account.
                  </p>
                  {users.find(u => u.id === suspensionData.userId)?.role === 'service_provider' && (
                    <p className="provider-warning">
                      <strong>Service Provider:</strong> This will also suspend their provider profile and prevent them from receiving new bookings.
                    </p>
                  )}
                  
                  <div className="email-notice">
                    <div className="notice-icon">📧</div>
                    <div className="notice-text">
                      <strong>Email Notification:</strong> An automated suspension notice will be sent to <strong>{suspensionData.userName}</strong> at their registered email address.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="suspension-reason">Reason for suspension (optional)</label>
                <textarea
                  id="suspension-reason"
                  value={suspensionData.reason}
                  onChange={(e) => setSuspensionData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for suspension..."
                  rows={3}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={cancelSuspension}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmSuspension}
              >
                <UserX size={16} />
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
// Profile Modal
// Rendered below main return via conditional
