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
  Clock, 
  DollarSign, 
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
  Menu,
  X,
  Sun,
  Moon,
  Briefcase
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import Logo from '../../components/Logo';
import NotificationBell from '../../components/NotificationBell';
import { useAuth, supabase } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';
import './SharedDashboard.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState({
    userGrowth: { current: 0, change: "+0%" },
    revenueGrowth: { current: 0, change: "+0%" },
    serviceRequests: { current: 0, change: "+0%" },
    securityScore: { current: 0, change: "+0%" }
  });
  const [systemHealth, setSystemHealth] = useState({});
  const [securityEvents, setSecurityEvents] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notificationsRef = useRef(null);
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
  const [profileModalUser, setProfileModalUser] = useState(null);
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [showWelcome, setShowWelcome] = useState(false);

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
          let avatarUrl = user.avatar_url || profile.profile_picture_url || profile.avatar_url || '';
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
        // Resolve storage paths to public/signed URLs when needed
        const resolvedUsers = await Promise.all(formattedUsers.map(async (u) => {
          if (typeof u.avatar === 'string' && u.avatar && !/^https?:\/\//i.test(u.avatar)) {
            const match = u.avatar.match(/^([^\/]+)\/(.+)$/);
            if (match) {
              const bucket = match[1];
              const key = match[2];
              try {
                const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
                if (pub?.publicUrl) {
                  return { ...u, avatar: pub.publicUrl };
                }
              } catch (_) {}
              try {
                const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(key, 3600);
                if (signed?.signedUrl) {
                  return { ...u, avatar: signed.signedUrl };
                }
              } catch (_) {}
            }
          }
          return u;
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

    setRecentActivity([
      { id: 1, user: "John Smith", action: "User account created", target: "emily.d@company.com", timestamp: "2 minutes ago", type: "user_management", severity: "info" },
      { id: 2, user: "System", action: "Security scan completed", target: "All systems", timestamp: "5 minutes ago", type: "security", severity: "success" },
      { id: 3, user: "Sarah Johnson", action: "Report generated", target: "Monthly Analytics", timestamp: "15 minutes ago", type: "reports", severity: "info" },
      { id: 4, user: "Mike Chen", action: "Service updated", target: "Premium Care Package", timestamp: "1 hour ago", type: "service_management", severity: "info" },
      { id: 5, user: "System", action: "Backup completed", target: "Database backup", timestamp: "2 hours ago", type: "system", severity: "success" },
      { id: 6, user: "David Wilson", action: "Login failed", target: "david.w@company.com", timestamp: "3 hours ago", type: "security", severity: "warning" }
    ]);

    setAlerts([
      { id: 1, type: "security", title: "Multiple failed login attempts", message: "User account david.w@company.com has 5 failed login attempts", severity: "high", timestamp: "3 hours ago", status: "active" },
      { id: 2, type: "performance", title: "High CPU usage detected", message: "Server CPU usage has reached 85% for the last 10 minutes", severity: "medium", timestamp: "1 hour ago", status: "resolved" },
      { id: 3, type: "system", title: "Database backup overdue", message: "Scheduled database backup is 2 hours overdue", severity: "low", timestamp: "2 hours ago", status: "pending" },
      { id: 4, type: "security", title: "New user registration", message: "New user account created for emily.d@company.com", severity: "info", timestamp: "2 minutes ago", status: "reviewed" }
    ]);

    setAnalytics({
      userGrowth: { current: 1247, previous: 1189, change: "+4.9%" },
      revenueGrowth: { current: 456000, previous: 432000, change: "+5.6%" },
      serviceRequests: { current: 892, previous: 756, change: "+18.0%" },
      customerSatisfaction: { current: 4.7, previous: 4.5, change: "+4.4%" },
      systemPerformance: { current: 98.5, previous: 97.2, change: "+1.3%" },
      securityScore: { current: 94, previous: 91, change: "+3.3%" }
    });

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

    // Providers
    setProvidersPending([
      { id: 101, name: 'Alpha Services', specialization: 'Plumbing', documents: 'Pending Review' },
      { id: 102, name: 'CareFirst', specialization: 'Elder Care', documents: 'Submitted' }
    ]);
    setProviders([
      { id: 201, name: 'QuickFix Co.', specialization: 'Electrical', rating: 4.6, available: true },
      { id: 202, name: 'SafeRide', specialization: 'Transport', rating: 4.8, available: true }
    ]);
    setAllocations([
      { id: 1, requestId: 'REQ-1001', category: 'Home Maintenance', service: 'Plumbing', assignedProviderId: 201, mode: 'AI' }
    ]);

    // Monitoring
    setServiceRequests([
      { id: 'REQ-1001', customer: 'Emily Davis', category: 'Home Maintenance', service: 'Plumbing', status: 'in_progress', priority: 'high' },
      { id: 'REQ-1002', customer: 'John Smith', category: 'Transport', service: 'Airport Drop', status: 'pending', priority: 'medium' }
    ]);
    setOngoingTasks([
      { id: 'TASK-9001', provider: 'QuickFix Co.', job: 'Electrical Diagnosis', eta: '40m', progress: 70 },
      { id: 'TASK-9002', provider: 'SafeRide', job: 'Pickup to Airport', eta: '15m', progress: 35 }
    ]);

    // Billing
    setInvoices([
      { id: 'INV-5001', customer: 'Emily Davis', amount: 120, status: 'due', date: '2024-01-15' },
      { id: 'INV-5002', customer: 'John Smith', amount: 45, status: 'paid', date: '2024-01-14' }
    ]);
    setPayouts([
      { id: 'PO-3001', provider: 'QuickFix Co.', amount: 220, status: 'scheduled', date: '2024-01-18' },
      { id: 'PO-3002', provider: 'SafeRide', amount: 140, status: 'completed', date: '2024-01-12' }
    ]);
    setTransactions([
      { id: 'TX-7001', type: 'invoice', ref: 'INV-5002', amount: 45, method: 'card', status: 'success' },
      { id: 'TX-7002', type: 'payout', ref: 'PO-3002', amount: 140, method: 'bank', status: 'success' }
    ]);

    // Feedback
    setReviews([
      { id: 'RV-8001', customer: 'Alice', provider: 'QuickFix Co.', rating: 5, comment: 'Great service!', flagged: false },
      { id: 'RV-8002', customer: 'Bob', provider: 'SafeRide', rating: 3, comment: 'Pickup was late', flagged: false }
    ]);
  }, []);

  // Live system metrics polling
  useEffect(() => {
    fetchMetrics();
    const intervalId = setInterval(() => fetchMetrics(true), 5000);
    return () => { clearInterval(intervalId); };
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const stats = [
    { label: "Total Users", value: (systemMetrics.totalUsers || 0).toLocaleString(), icon: Users, color: "#8b5cf6", change: `+${systemMetrics.newUsers || 0}`, changeType: "positive" },
    { label: "System Uptime", value: systemMetrics.systemUptime || "0%", icon: Server, color: "#10b981", change: "+0.02%", changeType: "positive" },
    { label: "Active Sessions", value: (systemMetrics.activeSessions || 0).toLocaleString(), icon: Activity, color: "#4f9cf9", change: "+12", changeType: "positive" },
    { label: "Security Score", value: `${analytics.securityScore?.current || 0}/100`, icon: Shield, color: "#f59e0b", change: analytics.securityScore?.change || "+0%", changeType: "positive" }
  ];

  const navItems = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'services', label: 'Services', icon: Settings },
    { key: 'allocation', label: 'Allocation', icon: Target },
    { key: 'monitoring', label: 'Monitoring', icon: Activity },
    { key: 'billing', label: 'Billing', icon: DollarSign },
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

  const handleUserAction = async (userId, action) => {
    try {
      console.log('🔄 Updating user status:', userId, 'to', action);
      
      // Call the API to update user status
      await apiService.updateUserStatus(userId, action);
      
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
      toast.success(`User ${actionText} successfully`);
      
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      toast.error(error?.message || 'Failed to update user status');
    }
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
                setActiveTab(item.key);
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
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1>Admin Dashboard</h1>
          </div>
          
          <div className="header-right" ref={notificationsRef}>
            <button 
              className="admin-theme-toggle" 
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              onClick={toggleDarkMode}
            >
              <div className="admin-theme-icon">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </div>
            </button>
            
            <NotificationBell adminUserId={user?.id} />
            
            <button className="btn-primary" onClick={() => navigate('/admin/add-service-provider')}>
              <Plus size={20} />
              Add Service Provider
            </button>
          </div>
        </header>

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
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="stat-card"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                    <stat.icon size={24} color="white" />
                  </div>
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                    {stat.change && (
                      <span className={`change ${stat.changeType}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
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
                <div className="system-overview">
                  <h3>System Overview</h3>
                  <div className="overview-grid">
                    <div className="overview-card">
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
                          <RefreshCw size={16} className="refresh-icon" />
                          {isRefreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                      </div>
                      <div className="metrics-list">
                        <div className="metric-item">
                          <span>Response Time</span>
                          <span className="metric-value">{systemMetrics.responseTime}</span>
                        </div>
                        <div className="metric-item">
                          <span>CPU Usage</span>
                          <span className="metric-value">{systemMetrics.cpuUsage}%</span>
                        </div>
                        <div className="metric-item">
                          <span>Memory Usage</span>
                          <span className="metric-value">{systemMetrics.memoryUsage}%</span>
                        </div>
                        <div className="metric-item">
                          <span>Disk Usage</span>
                          <span className="metric-value">{systemMetrics.diskUsage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="overview-card">
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
                    </div>

                    <div className="overview-card">
                      <div className="card-header">
                        <h4>Security Status</h4>
                        <Shield size={16} />
                      </div>
                      <div className="security-status">
                        <div className="security-score">
                          <span className="score-value">{analytics.securityScore.current}</span>
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
                    </div>
                    
                    <div className="overview-card role-distribution">
                      <div className="card-header">
                        <h4>User Roles</h4>
                        <Users size={16} />
                      </div>
                      <div className="roles-list">
                        {roleDistribution.map(item => (
                          <div key={item.role} className="role-item">
                            <span className={`role-label ${item.role}`}>{item.role.replace('_',' ')}</span>
                            <div className="role-bar">
                              <div className="role-fill" style={{ width: `${item.percent}%` }}></div>
                            </div>
                            <span className="role-count">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {recentActivity.slice(0, 6).map(activity => (
                      <div key={activity.id} className={`activity-item ${activity.type}`}>
                        <div className="activity-icon">
                          {activity.type === 'user_management' && <Users size={16} />}
                          {activity.type === 'security' && <Shield size={16} />}
                          {activity.type === 'reports' && <FileText size={16} />}
                          {activity.type === 'service_management' && <Settings size={16} />}
                          {activity.type === 'system' && <Server size={16} />}
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <span className="user">{activity.user}</span>
                            <span className="action">{activity.action}</span>
                            <span className="target">{activity.target}</span>
                          </div>
                          <span className="timestamp">{activity.timestamp}</span>
                        </div>
                        <span className={`severity ${activity.severity}`}>{activity.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="active-alerts">
                  <h3>Active Alerts</h3>
                  <div className="alerts-grid">
                    {alerts.filter(alert => alert.status === 'active').map(alert => (
                      <div key={alert.id} className={`alert-card ${alert.severity}`}>
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
                            <button 
                              className="btn-secondary"
                              onClick={() => handleAlertAction(alert.id, 'resolved')}
                            >
                              Resolve
                            </button>
                            <button className="btn-secondary">View Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="actions-grid">
                    <button className="action-card" onClick={() => navigate('/admin/add-service-provider')}>
                      <UserPlus size={24} />
                      <span>Add Service Provider</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/admin/categories')}>
                      <Settings size={24} />
                      <span>Manage Categories</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/admin/add-service')}>
                      <Settings size={24} />
                      <span>Add Service</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/admin/categories')}>
                      <Database size={24} />
                      <span>Manage Categories</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/admin/assign-provider')}>
                      <Target size={24} />
                      <span>Assign Provider</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/admin/create-bill')}>
                      <DollarSign size={24} />
                      <span>Create Bill</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div 
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
                      managedUsersFilteredSorted.map(user => (
                      <div key={user.id} className="table-row">
                        <div className="table-cell user-info" onClick={() => navigate(`/admin/users/${user.id}`)} style={{ cursor: 'pointer' }}>
                          <div className="user-avatar">
                            {typeof user.avatar === 'string' && /^https?:\/\//i.test(user.avatar) ? (
                              <img
                                src={user.avatar}
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
                                  }
                                }}
                              />
                            ) : (
                              (typeof user.avatar === 'string' ? user.avatar : 'NA')
                            )}
                          </div>
                          <div className="user-details">
                            <span className="user-name">{user.name}</span>
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
                          <span className={`status-badge ${user.status}`}>{user.status}</span>
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
                          {user.status === 'active' ? (
                            <button 
                              className="btn-icon warning" 
                              title="Suspend"
                              onClick={() => handleUserAction(user.id, 'suspended')}
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button 
                              className="btn-icon success" 
                              title="Activate"
                              onClick={() => handleUserAction(user.id, 'active')}
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          
                        </div>
                      </div>
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
                      <DollarSign size={32} />
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
                    <h3>Pending Providers</h3>
                    <div className="list-table">
                      {providersPending.length === 0 && <div className="empty">No pending providers</div>}
                      {providersPending.map(p => (
                        <div key={p.id} className="list-row">
                          <div className="list-main">
                            <strong>{p.name}</strong>
                            <span className="text-muted">{p.specialization} • {p.documents}</span>
                          </div>
                          <div className="list-actions">
                            <button className="btn-primary" onClick={() => handleApproveProvider(p.id)}>Approve</button>
                            <button className="btn-secondary">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="content-card">
                    <div className="card-header">
                      <h3>Provider Assignment</h3>
                      <button 
                        className="btn-primary" 
                        onClick={() => navigate('/admin/assign-provider')}
                      >
                        <Plus size={20} />
                        Assign Provider
                      </button>
                    </div>
                    <div className="list-table">
                      {serviceRequests.map(req => (
                        <div key={req.id} className="list-row">
                          <div className="list-main">
                            <strong>{req.id}</strong>
                            <span className="text-muted">{req.category} • {req.service} • {req.status}</span>
                          </div>
                          <div className="list-actions">
                            <select onChange={(e) => handleAssignProvider(req.id, Number(e.target.value))} defaultValue="">
                              <option value="" disabled>Select provider</option>
                              {providers.map(pr => (
                                <option key={pr.id} value={pr.id}>{pr.name} ({pr.specialization})</option>
                              ))}
                            </select>
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
                <div className="content-grid">
                  <div className="content-card">
                    <div className="card-header">
                      <h3>Invoices</h3>
                      <button 
                        className="btn-primary" 
                        onClick={() => navigate('/admin/create-bill')}
                      >
                        <Plus size={20} />
                        Create Bill
                      </button>
                    </div>
                    <div className="list-table">
                      {invoices.map(inv => (
                        <div key={inv.id} className="list-row">
                          <div className="list-main">
                            <strong>{inv.id}</strong>
                            <span className="text-muted">{inv.customer} • {inv.date}</span>
                          </div>
                          <div className="list-actions">
                            <span className="amount">${inv.amount.toFixed(2)}</span>
                            <span className={`status-badge ${inv.status}`}>{inv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="content-card">
                    <h3>Provider Payouts</h3>
                    <div className="list-table">
                      {payouts.map(po => (
                        <div key={po.id} className="list-row">
                          <div className="list-main">
                            <strong>{po.provider}</strong>
                            <span className="text-muted">{po.date}</span>
                          </div>
                          <div className="list-actions">
                            <span className="amount">${po.amount.toFixed(2)}</span>
                            <span className={`status-badge ${po.status}`}>{po.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="content-card">
                    <h3>Transactions</h3>
                    <div className="list-table">
                      {transactions.map(tx => (
                        <div key={tx.id} className="list-row">
                          <div className="list-main">
                            <strong>{tx.id}</strong>
                            <span className="text-muted">{tx.type} • {tx.ref}</span>
                          </div>
                          <div className="list-actions">
                            <span className="amount">${tx.amount.toFixed(2)}</span>
                            <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div 
                className="feedback-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="content-grid">
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
                        <span>Security Score</span>
                      </div>
                      <div className="metric-value">{analytics.securityScore.current}/100</div>
                      <div className="metric-change positive">{analytics.securityScore.change}</div>
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
                        <span className="current">${(analytics.revenueGrowth?.current || 0).toLocaleString()}</span>
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
    </div>
  );
};

export default AdminDashboard;
// Profile Modal
// Rendered below main return via conditional
