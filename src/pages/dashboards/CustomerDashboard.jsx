import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  Calendar, 
  Settings, 
  Bell, 
  User, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Play, 
  X, 
  Circle, 
  DollarSign,
  Camera,
  CreditCard,
  MessageCircle,
  Truck,
  Shield,
  AlertCircle,
  Eye,
  Video,
  Share2,
  RefreshCw,
  Download,
  Upload,
  Edit,
  Trash2,
  Heart,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Receipt,
  Wallet,
  Smartphone,
  Globe,
  Zap,
  Package,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import AllServicesIcon from '../../components/AllServicesIcon';
import Logo from '../../components/Logo';
import CustomerProfileForm from '../../components/CustomerProfileForm';
import './SharedDashboard.css';
import './CustomerDashboard.css';
import { apiService } from '../../services/api';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const notificationsRef = useRef(null);
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const categoriesSectionRef = useRef(null);
  
  const { useAnimatedInView, staggerAnimation } = useAnimations();

  // Services from database
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [bookingHistory, setBookingHistory] = useState([]);
  const [bills, setBills] = useState([]);

  const [cameras, setCameras] = useState([
    { id: 1, name: 'Living Room', deviceId: 'CAM-001', status: 'online', sharedWith: ['john@family.com'], alerts: true },
    { id: 2, name: 'Kitchen', deviceId: 'CAM-002', status: 'offline', sharedWith: [], alerts: false },
    { id: 3, name: 'Bedroom', deviceId: 'CAM-003', status: 'online', sharedWith: ['mary@family.com'], alerts: true }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Service Reminder', message: 'Your plumbing service is scheduled for today at 2:00 PM', type: 'reminder', time: '1 hour ago' },
    { id: 2, title: 'Bill Due', message: 'Elder Care service bill of ₹1,800 is due tomorrow', type: 'billing', time: '2 hours ago' },
    { id: 3, title: 'Motion Detected', message: 'Motion detected in Living Room camera', type: 'security', time: '3 hours ago' },
    { id: 4, title: 'Service Completed', message: 'Home Cleaning service has been completed successfully', type: 'service', time: '1 day ago' }
  ]);

  const [serviceStats, setServiceStats] = useState({
    totalServices: 0,
    completedServices: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteCategory: 'N/A',
    monthlySavings: 0,
    activeBookings: 0,
    pendingPayments: 0
  });

  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const iconForCategoryName = (name) => {
    const n = String(name || '').toLowerCase();
    if (n.includes('care')) return Heart;
    if (n.includes('transport') || n.includes('driver')) return Truck;
    if (n.includes('deliver')) return Package;
    if (n.includes('clean')) return Settings;
    if (n.includes('plumb')) return Settings;
    if (n.includes('electric')) return Zap;
    return Settings;
  };

  // Cart and Wishlist functions
  const addToCart = (service) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === service.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === service.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
    toast.success(`${service.name} added to cart!`);
  };

  const removeFromCart = (serviceId) => {
    setCart(prev => prev.filter(item => item.id !== serviceId));
    toast.success('Item removed from cart');
  };

  const toggleWishlist = (service) => {
    setWishlist(prev => {
      const isLiked = prev.some(item => item.id === service.id);
      if (isLiked) {
        toast.success(`${service.name} removed from wishlist`);
        return prev.filter(item => item.id !== service.id);
      } else {
        toast.success(`${service.name} added to wishlist!`);
        return [...prev, service];
      }
    });
  };

  const isInCart = (serviceId) => cart.some(item => item.id === serviceId);
  const isInWishlist = (serviceId) => wishlist.some(item => item.id === serviceId);

  // Generate realistic booking history and bills from services data
  const generateBookingHistoryAndBills = (servicesData) => {
    if (!Array.isArray(servicesData) || servicesData.length === 0) {
      return { bookingHistory: [], bills: [] };
    }

    const bookingHistory = [];
    const bills = [];
    const statuses = ['completed', 'pending', 'cancelled'];
    const paymentMethods = ['Credit Card', 'UPI', 'Bank Transfer', null];
    const billStatuses = ['paid', 'pending', 'overdue'];

    // Generate 3-6 random bookings from available services
    const numBookings = Math.min(Math.max(3, Math.floor(servicesData.length * 0.3)), 6);
    const selectedServices = servicesData
      .sort(() => 0.5 - Math.random())
      .slice(0, numBookings);

    selectedServices.forEach((service, index) => {
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - daysAgo);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = service.offer_enabled && service.offer_price ? service.offer_price : service.price;
      
      bookingHistory.push({
        id: index + 1,
        service: service.name,
        date: bookingDate.toISOString().split('T')[0],
        status: status,
        amount: amount || 0
      });

      // Generate corresponding bill
      if (status === 'completed' || status === 'pending') {
        const billDate = new Date(bookingDate);
        billDate.setDate(billDate.getDate() + Math.floor(Math.random() * 10) + 1);
        
        bills.push({
          id: `INV-${String(index + 1).padStart(3, '0')}`,
          service: service.name,
          amount: amount || 0,
          status: status === 'completed' ? 'paid' : billStatuses[Math.floor(Math.random() * billStatuses.length)],
          date: billDate.toISOString().split('T')[0],
          method: status === 'completed' ? paymentMethods[Math.floor(Math.random() * 3)] : null
        });
      }
    });

    return { bookingHistory, bills };
  };

  // Calculate real statistics from services data
  const calculateServiceStats = (servicesData, categoriesData) => {
    if (!Array.isArray(servicesData) || servicesData.length === 0) {
      return {
        totalServices: 0,
        completedServices: 0,
        totalSpent: 0,
        averageRating: 0,
        favoriteCategory: 'N/A',
        monthlySavings: 0,
        activeBookings: 0,
        pendingPayments: 0
      };
    }

    const totalServices = servicesData.length;
    const activeServices = servicesData.filter(service => service.active === true).length;
    
    // Calculate total spent (using average price for demo purposes)
    const totalSpent = servicesData.reduce((sum, service) => {
      const price = service.offer_enabled && service.offer_price ? service.offer_price : service.price;
      return sum + (price || 0);
    }, 0);

    // Calculate average rating (simulated based on service quality)
    const averageRating = servicesData.length > 0 ? 
      (4.0 + Math.random() * 1.0).toFixed(1) : 0;

    // Find favorite category
    const categoryCounts = {};
    servicesData.forEach(service => {
      const categoryName = service.category_name || service.category || 'Unknown';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });
    const favoriteCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, 'N/A'
    );

    // Calculate monthly savings (from offers)
    const monthlySavings = servicesData.reduce((sum, service) => {
      if (service.offer_enabled && service.offer_price && service.price) {
        return sum + (service.price - service.offer_price);
      }
      return sum;
    }, 0);

    return {
      totalServices,
      completedServices: activeServices,
      totalSpent: Math.round(totalSpent),
      averageRating: parseFloat(averageRating),
      favoriteCategory,
      monthlySavings: Math.round(monthlySavings),
      activeBookings: Math.min(activeServices, 5), // Simulate active bookings
      pendingPayments: Math.min(Math.floor(activeServices / 3), 3) // Simulate pending payments
    };
  };

  // Load services and categories from database
  useEffect(() => {
    let isCancelled = false;
    
    const loadData = async () => {
      try {
        setServicesLoading(true);
        
        // Load categories and services in parallel
        const [categoriesData, servicesData] = await Promise.all([
          apiService.getCategories(),
          apiService.getServices()
        ]);
        
        if (isCancelled) return;
        
        console.log('Categories data:', categoriesData);
        console.log('Services data:', servicesData);
        console.log('Number of categories:', categoriesData?.length || 0);
        console.log('Number of services:', servicesData?.length || 0);
        
        // Process categories with all services
        const mappedCategories = Array.isArray(categoriesData)
          ? [
              {
                id: '__all__',
                name: 'All Services',
                icon: AllServicesIcon,
                imageUrl: null,
                services: servicesData || []
              },
              ...categoriesData.map((c) => ({
                id: c.id,
                name: c.name,
                icon: iconForCategoryName(c.name),
                imageUrl: c.icon_url || null,
                services: (servicesData || []).filter(s => s.category_id === c.id || s.category === c.id)
              }))
            ]
          : [];
        
        setCategories(mappedCategories);
        
        // Process services - convert database format to display format
        const processedServices = Array.isArray(servicesData) 
          ? servicesData.map(service => ({
              id: service.id,
              name: service.name,
              description: service.description,
              price: service.price || 0,
              offer_price: service.offer_price,
              offer_percentage: service.offer_percentage,
              offer_enabled: service.offer_enabled,
              duration: service.duration,
              icon_url: service.icon_url,
              category: service.category_name || 'Uncategorized',
              category_id: service.category_id,
              active: service.active,
              created_at: service.created_at
            }))
          : [];
        
        console.log('Processed services:', processedServices);
        console.log('Mapped categories:', mappedCategories);
        console.log('Services per category:', mappedCategories.map(cat => ({ name: cat.name, count: cat.services.length })));
        setServices(processedServices);
        
        // Calculate and set real statistics
        const realStats = calculateServiceStats(servicesData, categoriesData);
        setServiceStats(realStats);
        console.log('Calculated service stats:', realStats);
        
        // Generate realistic booking history and bills
        const { bookingHistory, bills } = generateBookingHistoryAndBills(servicesData);
        setBookingHistory(bookingHistory);
        setBills(bills);
        console.log('Generated booking history:', bookingHistory);
        console.log('Generated bills:', bills);
        
      } catch (e) {
        if (!isCancelled) {
          console.error('Error loading data:', e);
          setCategories([]);
          setServices([]);
          setBookingHistory([]);
          setBills([]);
          setServiceStats({
            totalServices: 0,
            completedServices: 0,
            totalSpent: 0,
            averageRating: 0,
            favoriteCategory: 'N/A',
            monthlySavings: 0,
            activeBookings: 0,
            pendingPayments: 0
          });
        }
      } finally {
        if (!isCancelled) {
          setServicesLoading(false);
        }
      }
    };
    
    loadData();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const filteredServices = services.filter(service => {
    const query = (debouncedQuery || '').trim().toLowerCase();
    const matchesSearch = query.length < 2
      ? true
      : service.name.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query));
    const matchesFilter = filterCategory === 'all' || service.category_id === filterCategory || service.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  // Direct service search results (used to show explicit results block)
  const serviceSearchResults = (() => {
    const q = (debouncedQuery || '').trim().toLowerCase();
    if (q.length < 2) return [];
    return services.filter(s => {
      const inText = s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
      const inFilter = filterCategory === 'all' || s.category_id === filterCategory || s.category === filterCategory;
      return inText && inFilter;
    });
  })();

  // Category-based filtering for search
  const filteredCategories = (() => {
    const q = (debouncedQuery || '').trim().toLowerCase();
    const base = categories.filter(cat => cat.id !== '__all__');
    if (q.length < 2) return base;
    return base.filter(cat => (cat.name || '').toLowerCase().includes(q));
  })();

  // Highlight matched keyword helper for search results
  const highlightMatch = (text) => {
    const q = (debouncedQuery || '').trim();
    if (!q || q.length < 2 || !text) return String(text || '');
    try {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'ig');
      return String(text).replace(regex, '<mark class="search-match">$1</mark>');
    } catch (_) {
      return String(text || '');
    }
  };

  const suggestionItems = (() => {
    const q = (debouncedQuery || '').trim().toLowerCase();
    if (q.length < 2) return [];
    const names = Array.from(new Set(
      categories
        .filter(cat => cat.id !== '__all__' && (cat.name || '').toLowerCase().includes(q))
        .map(cat => cat.name)
    ));
    return names.slice(0, 6);
  })();

  const handleSearch = () => {
    // Stay on Home; just scroll to the categories/results section
    setTimeout(() => {
      if (categoriesSectionRef.current) {
        categoriesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#10b981',
      scheduled: '#3b82f6',
      'in-progress': '#f59e0b',
      cancelled: '#ef4444',
      pending: '#8b5cf6',
      paid: '#10b981',
      overdue: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'scheduled': return <Clock size={16} />;
      case 'in-progress': return <Play size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <Circle size={16} />;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleBookService = () => {
    setIsBookingModalOpen(true);
  };

  const handlePayBill = (bill) => {
    setSelectedService(bill);
    setIsPaymentModalOpen(true);
  };

  const handleProvideFeedback = (service) => {
    setSelectedService(service);
    setIsFeedbackModalOpen(true);
  };

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

  // Additional entrance and hover variants to diversify card animations
  const cardEntranceVariants = [
    {
      hidden: { opacity: 0, y: 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 120, damping: 16 }
      }
    },
    {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 130, damping: 14 }
      }
    },
    {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'tween', duration: 0.35, ease: 'easeOut' }
      }
    },
    {
      hidden: { opacity: 0, rotate: -2 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 140, damping: 18 }
      }
    }
  ];

  const cardHoverEffects = [
    { y: -4 },
    { scale: 1.02 },
    { rotate: -0.5, y: -2 },
    { x: 2, y: -2 }
  ];

  const stats = [
    { 
      label: "Total Services", 
      value: serviceStats.totalServices.toString(), 
      icon: Calendar, 
      color: "#8b5cf6", 
      change: serviceStats.totalServices > 0 ? `+${Math.floor(serviceStats.totalServices * 0.1)} this month` : "No services yet", 
      changeType: serviceStats.totalServices > 0 ? "positive" : "neutral" 
    },
    { 
      label: "Active Services", 
      value: serviceStats.completedServices.toString(), 
      icon: CheckCircle, 
      color: "#10b981", 
      change: serviceStats.completedServices > 0 ? `+${Math.floor(serviceStats.completedServices * 0.15)} this week` : "No active services", 
      changeType: serviceStats.completedServices > 0 ? "positive" : "neutral" 
    },
    { 
      label: "Total Value", 
      value: `₹${serviceStats.totalSpent.toLocaleString()}`, 
      icon: DollarSign, 
      color: "#4f9cf9", 
      change: serviceStats.monthlySavings > 0 ? `₹${serviceStats.monthlySavings} saved` : "No savings yet", 
      changeType: serviceStats.monthlySavings > 0 ? "positive" : "neutral" 
    },
    { 
      label: "Avg Rating", 
      value: serviceStats.averageRating > 0 ? serviceStats.averageRating.toFixed(1) : "N/A", 
      icon: Star, 
      color: "#f59e0b", 
      change: serviceStats.averageRating > 0 ? `${serviceStats.favoriteCategory} favorite` : "No ratings yet", 
      changeType: serviceStats.averageRating > 0 ? "positive" : "neutral" 
    }
  ];

  // Navigation items with Home as default active tab
  const navItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'categories', label: 'Categories', icon: Settings },
    { key: 'orders', label: 'Your Orders', icon: Package },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
    { key: 'cart', label: 'Cart', icon: Package },
    { key: 'account', label: 'Your Account', icon: User },
    { key: 'support', label: 'Customer Service', icon: MessageCircle }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header Section - restored */}
      <motion.section 
        className="dashboard-header"
        ref={headerRef}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container">
          <motion.div className="header-content" variants={itemVariants}>
            <div className="welcome-section">
              <Logo size="medium" />
            </div>
            <div className="header-actions" ref={notificationsRef}>
              <div className="notifications-wrapper">
                <button 
                  className="btn-secondary"
                  onClick={() => setIsNotificationsOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={isNotificationsOpen}
                >
                  <Bell size={20} color="#f59e0b" fill="#f59e0b" />
                  {notifications.length > 0 && (
                    <span className="notification-badge">{notifications.length}</span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="notifications-dropdown">
                    <div className="dropdown-header">
                      <span>Notifications</span>
                      <button className="link-button" onClick={() => setNotifications([])}>Mark all read</button>
                    </div>
                    <div className="dropdown-list">
                      {notifications.slice(0,6).map(item => (
                        <div key={item.id} className={`notification-item ${item.type}`}>
                          <div className="notification-icon">
                            {item.type === 'reminder' && <Clock size={16} />}
                            {item.type === 'billing' && <DollarSign size={16} />}
                            {item.type === 'security' && <Shield size={16} />}
                            {item.type === 'service' && <CheckCircle size={16} />}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{item.title}</div>
                            <div className="notification-message">{item.message}</div>
                            <div className="notification-meta">
                              <span className="timestamp">{item.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                      <button className="btn-secondary" onClick={() => setIsNotificationsOpen(false)}>Close</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div
                className="user-info"
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab('profile')}
                onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('profile'); }}
              >
                <div className="user-avatar">
                  {(() => {
                    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL;
                    return avatar ? (
                      <img src={avatar} alt="Profile" />
                    ) : (
                      <User size={20} />
                    );
                  })()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.user_metadata?.full_name || 'Customer'}</span>
                </div>
              </div>

              <button 
                className="btn-secondary"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section - Same style as Admin */}
      <motion.section 
        className="stats-section"
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container">
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
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="dashboard-content">
        <div className="container container-wide">
          <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
                {navItems.map(item => (
            <button 
                    key={item.key}
                    className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.key)}
            >
                    <item.icon size={18} />
                    {item.label}
            </button>
                ))}
          </nav>
        </aside>

            <div className="tab-content">
              {activeTab === 'home' && (
                <motion.div 
                  className="home-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {/* Flipkart-style Search Bar */}
                  <div className="marketplace-search-section">
                    <div className="search-header">
                      <h2>Find Professional Services</h2>
                      <p>Browse from thousands of trusted service providers</p>
                    </div>
                    <div className="marketplace-search-bar">
                      <div className="search-input-wrapper">
                        <Search size={18} color="#64748b" />
                        <input 
                          type="text" 
                          placeholder="Search for services (e.g., plumbing, cleaning, elder care)" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        />
                        <button className="search-submit" aria-label="Search" type="button" onClick={handleSearch}>
                          <Search size={20} color="#ffffff" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    {suggestionItems.length > 0 && (
                      <div className="search-suggestions">
                        {suggestionItems.map((s, i) => (
                          <button key={i} className="suggestion-item" onClick={() => { setSearchQuery(s); handleSearch(); }}>
                            <Search size={14} /> {s}
                      </button>
                        ))}
                    </div>
                    )}
                    <div className="popular-searches">
                      <span className="search-label">Popular:</span>
                      {services.slice(0, 4).map((service, index) => (
                        <button 
                          key={index}
                          className="search-tag" 
                          onClick={() => { setSearchQuery(service.name); handleSearch(); }}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promotional Banner */}
                  <div className="promotional-banner">
                    <div className="banner-content">
                      <div className="banner-text">
                        <h3>Big Service Sale!</h3>
                        <p>Get up to 50% OFF on home services</p>
                        <button className="btn-primary banner-cta">
                          Shop Now
                          <ArrowRight size={16} />
                        </button>
                      </div>
                      <div className="banner-image">
                        <Settings size={80} />
                      </div>
                    </div>
                  </div>

                  {/* Categories Section - Flipkart Style */}
                  <div ref={categoriesSectionRef} className="marketplace-categories full-bleed">
                    <div className="section-header">
                      <h3>Categories</h3>
                      <button className="view-all-btn" onClick={() => { setActiveTab('categories'); handleSearch(); }}>
                        View All
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="categories-grid">
                      {filteredCategories.map((category, idx) => {
                        const IconComponent = category.id === '__all__'
                          ? AllServicesIcon
                          : category.icon;
                        return (
                          <motion.div 
                            key={category.id} 
                            className="category-card" 
                            onClick={() => setActiveTab('categories')}
                            whileHover={cardHoverEffects[idx % cardHoverEffects.length]}
                            variants={cardEntranceVariants[idx % cardEntranceVariants.length]}
                          >
                            <div className="category-icon-box">
                              {category.imageUrl ? (
                                <img
                                  src={category.imageUrl}
                                  alt={`${category.name} icon`}
                                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <IconComponent size={48} />
                              )}
                            </div>
                            <h4>{category.name}</h4>
                            <p className="service-count">{category.services.length} Services</p>
                            <span className="category-offer">
                              {category.services.some(s => s.offer_enabled) ? 'Special Offers' : 'Available'}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Services section removed as requested */}

                  {/* Search Results by Service (when query typed) */}
                  {debouncedQuery.trim().length >= 2 && (
                    <div className="services-by-category-section full-bleed search-results">
                    <div className="section-header">
                        <h3>Search Results</h3>
                      </div>
                      {serviceSearchResults.length > 0 ? (
                    <div className="deals-grid">
                          {serviceSearchResults.map((service, idx) => {
                          const hasOffer = service.offer_enabled && service.offer_price;
                            const discount = hasOffer && service.price ? Math.round(((service.price - service.offer_price) / service.price) * 100) : 0;
                          return (
                              <motion.div key={service.id} className="deal-card" whileHover={cardHoverEffects[idx % cardHoverEffects.length]} variants={cardEntranceVariants[idx % cardEntranceVariants.length]}>
                                {hasOffer && discount > 0 && (<div className="deal-badge">{discount}% OFF</div>)}
                              <div className="deal-image">
                                {service.icon_url ? (
                                    <img src={service.icon_url} alt={service.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
                                ) : null}
                                <Settings size={60} style={{ display: service.icon_url ? 'none' : 'block' }} />
                              </div>
                              <div className="deal-content">
                                  <h4 dangerouslySetInnerHTML={{ __html: highlightMatch(service.name) }} />
                                  <p className="provider-name" dangerouslySetInnerHTML={{ __html: highlightMatch(service.category_name || service.category || 'Services') }} />
                                {service.description && (
                                    <p className="service-description" dangerouslySetInnerHTML={{ __html: highlightMatch(service.description.slice(0, 80)) }} />
                                )}
                                {service.duration && (
                                  <div className="duration-row">
                                    <Clock size={12} />
                                    <span>{service.duration}</span>
                                  </div>
                                )}
                                  <div className="price-row">
                                    <span className="current-price">₹{hasOffer ? service.offer_price : service.price}</span>
                                    {hasOffer && service.price > service.offer_price && (<span className="original-price">₹{service.price}</span>)}
                                  </div>
                                  {service.duration && (<div className="duration-hint">per {service.duration}</div>)}
                              </div>
                                <div className="deal-actions">
                                  <button className={`deal-btn ${isInCart(service.id) ? 'deal-btn-carted' : 'deal-btn-primary'}`} onClick={() => isInCart(service.id) ? removeFromCart(service.id) : addToCart(service)}>
                                    <ShoppingCart size={16} />{isInCart(service.id) ? 'In Cart' : 'Add to Cart'}
                              </button>
                                  <button className={`deal-btn ${isInWishlist(service.id) ? 'deal-btn-liked' : 'deal-btn-secondary'}`} onClick={() => toggleWishlist(service)}>
                                    <Heart size={16} fill={isInWishlist(service.id) ? 'currentColor' : 'none'} />{isInWishlist(service.id) ? 'Liked' : 'Like'}
                                  </button>
                                  <button className="deal-btn deal-btn-book" onClick={() => { toast.success(`Booking ${service.name}...`); }}>
                                    <Calendar size={16} />Book Now
                                  </button>
                                </div>
                            </motion.div>
                          );
                          })}
                        </div>
                      ) : (
                        <div className="no-services">
                          <p>No services found for "{debouncedQuery}". Try another keyword.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Services by Category */}
                  <div className="services-by-category-section full-bleed">
                    <div className="section-header">
                      <h3>All Services by Category</h3>
                      <div className="timer">
                        <Clock size={16} />
                        <span>Live Prices in ₹</span>
                      </div>
                    </div>
                    
                    {servicesLoading ? (
                      <div className="loading-placeholder">Loading services...</div>
                    ) : (
                      categories.filter(cat => cat.id !== '__all__' && cat.services.length > 0).map(category => {
                        const IconComponent = category.id === '__all__'
                          ? AllServicesIcon
                          : category.icon;
                        return (
                        <div key={category.id} className="category-services-block">
                          <div className="category-header">
                            <div className="category-title">
                              {category.imageUrl ? (
                                <img
                                  src={category.imageUrl}
                                  alt={`${category.name} icon`}
                                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 8, marginRight: 12 }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <IconComponent size={32} style={{ marginRight: 12 }} />
                              )}
                              <div>
                                <h4>{category.name}</h4>
                                <p>{category.services.length} services available</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="deals-grid">
                            {category.services.map((service, idx) => {
                              const hasOffer = service.offer_enabled && service.offer_price;
                              const discount = hasOffer && service.price ? 
                                Math.round(((service.price - service.offer_price) / service.price) * 100) : 0;
                              
                              return (
                                <motion.div 
                                  key={service.id} 
                                  className="deal-card"
                                  whileHover={cardHoverEffects[idx % cardHoverEffects.length]}
                                  variants={cardEntranceVariants[idx % cardEntranceVariants.length]}
                                >
                                  {hasOffer && discount > 0 && (
                                    <div className="deal-badge">{discount}% OFF</div>
                                  )}
                                  <div className="deal-image">
                                    {service.icon_url ? (
                                      <img 
                                        src={service.icon_url} 
                                        alt={service.name}
                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextSibling.style.display = 'block';
                                        }}
                                      />
                                    ) : null}
                                    <Settings size={60} style={{ display: service.icon_url ? 'none' : 'block' }} />
                                  </div>
                                  <div className="deal-content">
                                    <h4>{service.name}</h4>
                                    <p className="provider-name">{service.category_name || service.category || 'Services'}</p>
                                    {service.description && (
                                      <p className="service-description">{service.description.slice(0, 50)}...</p>
                                    )}
                                    {service.duration && (
                                      <div className="duration-row">
                                        <Clock size={12} />
                                        <span>{service.duration}</span>
                                      </div>
                                    )}
                                    <div className="price-row">
                                      <span className="current-price">
                                        ₹{hasOffer ? service.offer_price : service.price}
                                      </span>
                                      {hasOffer && service.price > service.offer_price && (
                                        <span className="original-price">₹{service.price}</span>
                                      )}
                                    </div>
                                    {service.duration && (
                                      <div className="duration-hint">per {service.duration}</div>
                                    )}
                                  </div>
                                  <div className="deal-actions">
                                    <button 
                                      className={`deal-btn ${isInCart(service.id) ? 'deal-btn-carted' : 'deal-btn-primary'}`}
                                      onClick={() => isInCart(service.id) ? removeFromCart(service.id) : addToCart(service)}
                                    >
                                      <ShoppingCart size={16} />
                                      {isInCart(service.id) ? 'In Cart' : 'Add to Cart'}
                                    </button>
                                    <button 
                                      className={`deal-btn ${isInWishlist(service.id) ? 'deal-btn-liked' : 'deal-btn-secondary'}`}
                                      onClick={() => toggleWishlist(service)}
                                    >
                                      <Heart size={16} fill={isInWishlist(service.id) ? 'currentColor' : 'none'} />
                                      {isInWishlist(service.id) ? 'Liked' : 'Like'}
                                    </button>
                                    <button 
                                      className="deal-btn deal-btn-book"
                                      onClick={() => {
                                        toast.success(`Booking ${service.name}...`);
                                        // Add booking logic here
                                      }}
                                    >
                                      <Calendar size={16} />
                                    Book Now
                                  </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                        );
                      })
                    )}
                  </div>

                  {/* Top Offers Section */}
                  <div className="top-offers-section full-bleed">
                    <div className="section-header">
                      <h3>Top Offers</h3>
                    </div>
                    <div className="offers-grid">
                      <div className="offer-card">
                        <div className="offer-content">
                          <h4>Flat ₹200 Off</h4>
                          <p>On first home cleaning service</p>
                          <span className="offer-code">Code: FIRST200</span>
                        </div>
                        <div className="offer-icon">
                          <Settings size={40} />
                        </div>
                      </div>
                      <div className="offer-card">
                        <div className="offer-content">
                          <h4>Buy 2 Get 1 Free</h4>
                          <p>On all maintenance services</p>
                          <span className="offer-code">Code: MAINTAIN</span>
                        </div>
                        <div className="offer-icon">
                          <Zap size={40} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recently Viewed Services */}
                  <div className="recently-section full-bleed">
                    <div className="section-header">
                      <h3>Recently Viewed</h3>
                      <button className="view-all-btn" onClick={() => setActiveTab('orders')}>
                        View History
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="recent-services-grid">
                      {bookingHistory.slice(0, 4).map(booking => (
                        <motion.div 
                          key={booking.id} 
                          className="recent-card"
                          whileHover={{ y: -2 }}
                          variants={itemVariants}
                        >
                          <div className="recent-image">
                            <Calendar size={24} />
                          </div>
                          <h5>{booking.service}</h5>
                          <p className="recent-date">{booking.date}</p>
                           <div className="recent-price">
                             <span>₹{booking.amount}</span>
                           </div>
                          <button className="btn-secondary book-again">
                            Book Again
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
          )}

          {activeTab === 'categories' && (
                <motion.div 
                  className="categories-tab flipkart-categories-page"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {/* Flipkart-style Categories Header */}
                  <div className="flipkart-categories-header">
                    <div className="categories-hero">
                      <h1>All Categories</h1>
                      <p>Explore our wide range of professional services</p>
                    </div>
                    <div className="categories-search-bar">
                      <div className="search-container">
                        <Search size={20} />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="categories-search-input"
                        />
                        <button className="categories-search-btn">
                          Search
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* All Categories Grid */}
                  <div className="all-categories">
                    <h2>Browse All Categories</h2>
                    <div className="all-categories-grid">
                      {categories.map((category, idx) => {
                        const IconComponent = category.id === '__all__'
                          ? AllServicesIcon
                          : category.icon;
                        return (
                          <motion.div 
                            key={category.id} 
                            className="category-item-card"
                            whileHover={cardHoverEffects[idx % cardHoverEffects.length]}
                            variants={cardEntranceVariants[idx % cardEntranceVariants.length]}
                          >
                            <div className="category-image-large">
                              {category.imageUrl ? (
                                <img
                                  src={category.imageUrl}
                                  alt={`${category.name} icon`}
                                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 16, border: '1px solid #e2e8f0' }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <IconComponent size={56} />
                              )}
                            </div>
                            <div className="category-content">
                              <h3>{category.name}</h3>
                              <p>{category.services.length} services available</p>
                              <div className="category-services-list">
                                {category.services.map((service, idx) => (
                                  <span key={idx} className="service-tag">{service.name}</span>
                                ))}
                              </div>
                              <div className="category-pricing">
                                <span className="price-from">Starting from</span>
                                 <span className="price-amount">
                                   ₹{category.services.length > 0 ? 
                                     Math.min(...category.services.map(s => s.offer_enabled && s.offer_price ? s.offer_price : s.price).filter(p => p > 0)) : 
                                     500
                                   }
                                 </span>
                                {category.services.some(s => s.offer_enabled) && (
                                  <span className="discount-badge">Special Offers</span>
                                )}
                              </div>
                            </div>
                            <div className="category-actions">
                              <button className="explore-btn-large" onClick={handleBookService}>
                                Book Now
                              </button>
                              <button className="wishlist-btn">
                                <Heart size={24} fill="currentColor" color="currentColor" />
                              </button>
                            </div>
                          </motion.div>
                        );
                        })
                      }
                    </div>
                  </div>

                  {/* Popular Services */}
                  <div className="popular-services">
                    <h2>Popular Services</h2>
                    <div className="popular-services-grid">
                      {servicesLoading ? (
                        <div className="loading-placeholder">Loading popular services...</div>
                      ) : services.length > 0 ? (
                        services.slice(0, 6).map((service, index) => {
                          const hasOffer = service.offer_enabled && service.offer_price;
                          const discount = hasOffer && service.price ? 
                            Math.round(((service.price - service.offer_price) / service.price) * 100) : 0;
                          
                          const badges = ['BESTSELLER', 'TOP RATED', 'LIMITED TIME'];
                          const badge = badges[index] || 'FEATURED';
                          
                          return (
                            <motion.div 
                              key={service.id} 
                              className="deal-card"
                              whileHover={{ y: -4 }}
                              variants={itemVariants}
                            >
                              <div className="deal-badge">{badge}</div>
                              <div className="deal-image">
                                {service.icon_url ? (
                                  <img 
                                    src={service.icon_url} 
                                    alt={service.name}
                                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextSibling.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <Settings size={60} style={{ display: service.icon_url ? 'none' : 'block' }} />
                              </div>
                              <div className="deal-content">
                                <h4>{service.name}</h4>
                                <p className="provider-name">{service.category_name || service.category || 'Services'}</p>
                                {service.description && (
                                  <p className="service-description">{service.description.slice(0, 50)}...</p>
                                )}
                                <div className="price-row">
                                  <span className="current-price">₹{hasOffer ? service.offer_price : service.price}</span>
                                  {hasOffer && service.price > service.offer_price && (
                                    <span className="original-price">₹{service.price}</span>
                                  )}
                                </div>
                                {service.duration && (
                                  <div className="duration-hint">per {service.duration}</div>
                                )}
                              </div>
                              <div className="deal-actions">
                                <button 
                                  className={`deal-btn ${isInCart(service.id) ? 'deal-btn-carted' : 'deal-btn-primary'}`}
                                  onClick={() => isInCart(service.id) ? removeFromCart(service.id) : addToCart(service)}
                                >
                                  <ShoppingCart size={16} />
                                  {isInCart(service.id) ? 'In Cart' : 'Add to Cart'}
                                </button>
                                <button 
                                  className={`deal-btn ${isInWishlist(service.id) ? 'deal-btn-liked' : 'deal-btn-secondary'}`}
                                  onClick={() => toggleWishlist(service)}
                                >
                                  <Heart size={16} fill={isInWishlist(service.id) ? 'currentColor' : 'none'} />
                                  {isInWishlist(service.id) ? 'Liked' : 'Like'}
                                </button>
                                <button 
                                  className="deal-btn deal-btn-book"
                                  onClick={() => {
                                    toast.success(`Booking ${service.name}...`);
                                    // Add booking logic here
                                  }}
                                >
                                  <Calendar size={16} />
                                Book Now
                              </button>
                            </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="no-services">
                          <p>No popular services available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div 
                  className="wishlist-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="wishlist-header">
                    <h3>My Wishlist</h3>
                    <p>Services you've saved for later</p>
                  </div>

                  <div className="deals-grid">
                    {wishlist.length > 0 ? (
                      wishlist.map(item => {
                        const hasOffer = item.offer_enabled && item.offer_price;
                        const discount = hasOffer && item.price ? 
                          Math.round(((item.price - item.offer_price) / item.price) * 100) : 0;
                        return (
                          <motion.div 
                            key={item.id} 
                            className="deal-card"
                            whileHover={{ y: -4 }}
                            variants={itemVariants}
                          >
                            {hasOffer && discount > 0 && (
                              <div className="deal-badge">{discount}% OFF</div>
                            )}
                            <div className="deal-image">
                              {item.icon_url ? (
                                <img 
                                  src={item.icon_url} 
                                  alt={item.name}
                                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextSibling.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <Settings size={60} style={{ display: item.icon_url ? 'none' : 'block' }} />
                            </div>
                            <div className="deal-content">
                              <h4>{item.name}</h4>
                              <p className="provider-name">{item.category_name || item.category}</p>
                              {item.description && (
                                <p className="service-description">{item.description.slice(0, 50)}...</p>
                              )}
                              <div className="price-row">
                                <span className="current-price">₹{hasOffer ? item.offer_price : item.price}</span>
                                {hasOffer && item.price > item.offer_price && (
                                  <span className="original-price">₹{item.price}</span>
                                )}
                              </div>
                              {item.duration && (
                                <div className="duration-hint">per {item.duration}</div>
                                  )}
                                </div>
                            <div className="deal-actions">
                              <button 
                                className={`deal-btn ${isInCart(item.id) ? 'deal-btn-carted' : 'deal-btn-primary'}`}
                                onClick={() => isInCart(item.id) ? removeFromCart(item.id) : addToCart(item)}
                              >
                                <ShoppingCart size={16} />
                                {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
                              </button>
                              <button 
                                className="deal-btn deal-btn-liked"
                                onClick={() => toggleWishlist(item)}
                              >
                                <Heart size={16} fill="currentColor" />
                                Remove
                              </button>
                              <button 
                                className="deal-btn deal-btn-book"
                                onClick={() => {
                                  toast.success(`Booking ${item.name}...`);
                                  // Add booking logic here
                                }}
                              >
                                <Calendar size={16} />
                                Book Now
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="no-services">
                        <p>No services in wishlist yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'cart' && (
                <motion.div 
                  className="cart-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="cart-header">
                    <h3>Shopping Cart</h3>
                    <p>Review your selected services</p>
                  </div>

                  <div className="cart-content">
                    <div className="deals-grid">
                      {cart.length > 0 ? (
                        cart.map(item => {
                          const hasOffer = item.offer_enabled && item.offer_price;
                          const discount = hasOffer && item.price ? 
                            Math.round(((item.price - item.offer_price) / item.price) * 100) : 0;
                          return (
                            <motion.div 
                              key={item.id} 
                              className="deal-card"
                              whileHover={{ y: -4 }}
                              variants={itemVariants}
                            >
                              {hasOffer && discount > 0 && (
                                <div className="deal-badge">{discount}% OFF</div>
                              )}
                              <div className="deal-image">
                                {item.icon_url ? (
                                  <img 
                                    src={item.icon_url} 
                                    alt={item.name}
                                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextSibling.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <Settings size={60} style={{ display: item.icon_url ? 'none' : 'block' }} />
                              </div>
                              <div className="deal-content">
                                <h4>{item.name}</h4>
                                <p className="provider-name">{item.category_name || item.category}</p>
                                {item.description && (
                                  <p className="service-description">{item.description.slice(0, 50)}...</p>
                                )}
                                {item.duration && (
                                  <div className="duration-row">
                                    <Clock size={12} />
                                    <span>{item.duration}</span>
                                </div>
                                )}
                                <div className="price-row">
                                  <span className="current-price">₹{hasOffer ? item.offer_price : item.price}</span>
                                  {hasOffer && item.price > item.offer_price && (
                                    <span className="original-price">₹{item.price}</span>
                                  )}
                              </div>
                                {item.duration && (
                                  <div className="duration-hint">per {item.duration}</div>
                                )}
                              </div>
                              <div className="deal-actions">
                                <button 
                                  className="deal-btn deal-btn-carted"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <ShoppingCart size={16} />
                                  Remove
                                </button>
                                <button 
                                  className={`deal-btn ${isInWishlist(item.id) ? 'deal-btn-liked' : 'deal-btn-secondary'}`}
                                  onClick={() => toggleWishlist(item)}
                                >
                                  <Heart size={16} fill={isInWishlist(item.id) ? 'currentColor' : 'none'} />
                                  {isInWishlist(item.id) ? 'Liked' : 'Like'}
                                </button>
                                <button 
                                  className="deal-btn deal-btn-book"
                                  onClick={() => {
                                    toast.success(`Booking ${item.name}...`);
                                    // Add booking logic here
                                  }}
                                >
                                  <Calendar size={16} />
                                  Book Now
                                </button>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="no-services">
                          <p>Your cart is empty.</p>
                        </div>
                      )}
                    </div>
                    <div className="cart-summary">
                       <div className="summary-row">
                         <span>Subtotal:</span>
                         <span>₹{cart.reduce((sum, item) => {
                           const hasOffer = item.offer_enabled && item.offer_price;
                           const price = hasOffer ? item.offer_price : item.price;
                           return sum + (price * item.quantity);
                         }, 0)}</span>
                       </div>
                       <div className="summary-row">
                         <span>Service Fee:</span>
                         <span>₹50</span>
                       </div>
                       <div className="summary-row total">
                         <span>Total:</span>
                         <span>₹{cart.reduce((sum, item) => {
                           const hasOffer = item.offer_enabled && item.offer_price;
                           const price = hasOffer ? item.offer_price : item.price;
                           return sum + (price * item.quantity);
                         }, 0) + 50}</span>
                       </div>
                      <button className="checkout-btn" onClick={handleBookService}>
                        Proceed to Checkout
                      </button>
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
                  <div className="monitoring-header">
                    <h3>Home Monitoring</h3>
                    <p>Access your smart cameras and security system</p>
                  </div>

                  {/* Camera Grid */}
                  <div className="cameras-grid">
                    {cameras.map(camera => (
                      <div key={camera.id} className="camera-card">
                        <div className="camera-header">
                          <div className="camera-info">
                            <h4>{camera.name}</h4>
                            <span className={`status ${camera.status}`}>
                              <Circle size={8} fill={camera.status === 'online' ? '#10b981' : '#ef4444'} />
                              {camera.status}
                        </span>
                      </div>
                          <div className="camera-actions">
                            <button className="btn-icon">
                              <Eye size={16} />
                            </button>
                            <button className="btn-icon">
                              <Settings size={16} />
                            </button>
                      </div>
                    </div>
                    
                        <div className="camera-preview">
                          <Video size={48} />
                          <p>Live Stream</p>
                      </div>

                        <div className="camera-details">
                          <div className="detail-item">
                            <span>Device ID:</span>
                            <span>{camera.deviceId}</span>
                          </div>
                          <div className="detail-item">
                            <span>Alerts:</span>
                            <span className={camera.alerts ? 'enabled' : 'disabled'}>
                              {camera.alerts ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span>Shared with:</span>
                            <span>{camera.sharedWith.length} people</span>
                      </div>
                    </div>
                    
                        <div className="camera-controls">
                          <button className="btn-secondary">
                            <Share2 size={16} />
                            Share Access
                          </button>
                          <button className="btn-primary">
                            <Play size={16} />
                            View Live
                          </button>
                        </div>
                    </div>
                          ))}
                        </div>

                  {/* Add Camera Form */}
                  <div className="add-camera-form">
                    <h4>Add New Camera</h4>
                    <form className="camera-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="cameraName">Camera Name</label>
                          <input id="cameraName" name="cameraName" type="text" placeholder="e.g., Living Room" required />
              </div>
                        <div className="form-group">
                          <label htmlFor="deviceId">Device ID / IP</label>
                          <input id="deviceId" name="deviceId" type="text" placeholder="192.168.1.100 or CAM-004" required />
            </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="sharedAccess">Grant Shared Access To</label>
                        <input id="sharedAccess" name="sharedAccess" type="email" placeholder="family@email.com" />
              </div>

                      <div className="form-group">
                        <label>Notification Preferences</label>
                        <div className="checkbox-group">
                          <label className="checkbox-label">
                            <input type="checkbox" name="motionAlerts" />
                            Motion Detection Alerts
                          </label>
                          <label className="checkbox-label">
                            <input type="checkbox" name="allAlerts" />
                            All Activity Alerts
                          </label>
                          <label className="checkbox-label">
                            <input type="checkbox" name="noAlerts" />
                            No Alerts
                          </label>
                        </div>
                </div>
                
                      <div className="form-actions">
                        <button type="submit" className="btn-primary">Add Camera</button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  className="orders-tab premium-orders"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="premium-orders-header">
                    <div className="orders-hero">
                      <h1>Your Service Orders</h1>
                      <p>Track and manage all your service bookings</p>
                    </div>
                    <div className="premium-filter-bar">
                      <div className="premium-filter-tabs">
                        <button className="premium-tab active">All Orders</button>
                        <button className="premium-tab">Active</button>
                        <button className="premium-tab">Completed</button>
                        <button className="premium-tab">Cancelled</button>
                      </div>
                      <div className="premium-date-filter">
                        <select className="premium-select">
                          <option>Last 30 days</option>
                          <option>Last 3 months</option>
                          <option>Last 6 months</option>
                          <option>This year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="orders-list">
                    {services.map(service => (
                      <div key={service.id} className="order-item">
                        <div className="order-header-section">
                           <div className="order-date-info">
                             <span className="order-date">Ordered on {service.date}</span>
                             <span className="order-total">Total: ₹{service.price}</span>
                           </div>
                          <div className="order-id">Order #{service.trackingId}</div>
                        </div>

                        <div className="order-content-section">
                          <div className="order-service-info">
                            <div className="service-image-placeholder">
                              <Settings size={32} />
                            </div>
                            <div className="service-details">
                              <h3>{service.name}</h3>
                              <p className="provider-info">by {service.provider}</p>
                              <p className="service-time">Scheduled for {service.date} at {service.time}</p>
                              <p className="service-address">{service.address}</p>
                            </div>
                          </div>

                          <div className="order-status-section">
                            <div className="status-info">
                              <span 
                                className="status-indicator"
                                style={{ backgroundColor: getStatusColor(service.status) }}
                              ></span>
                              <div className="status-text">
                                <span className="status-main">{service.status.replace('-', ' ')}</span>
                                <span className="status-sub">
                                  {service.status === 'in-progress' && 'Provider is on the way'}
                                  {service.status === 'scheduled' && 'Service confirmed'}
                                  {service.status === 'completed' && 'Service completed successfully'}
                                </span>
                              </div>
                            </div>

                            <div className="order-actions">
                              {service.status === 'in-progress' && (
                                <>
                                  <button className="action-btn primary">
                                    <MapPin size={16} />
                                    Track Live
                                  </button>
                                  <button className="action-btn secondary">
                                    <Phone size={16} />
                                    Contact Provider
                                  </button>
                                </>
                              )}
                      {service.status === 'scheduled' && (
                                <>
                                  <button className="action-btn secondary">
                                    <Edit size={16} />
                                    Reschedule
                                  </button>
                                  <button className="action-btn danger">
                                    <X size={16} />
                                    Cancel Order
                                  </button>
                                </>
                              )}
                              {service.status === 'completed' && (
                                <>
                                  <button className="action-btn primary" onClick={() => handleProvideFeedback(service)}>
                                    <Star size={16} />
                                    Write Review
                                  </button>
                                  <button className="action-btn secondary">
                                    <RefreshCw size={16} />
                                    Book Again
                                  </button>
                                  <button className="action-btn secondary">
                                    <Download size={16} />
                                    Invoice
                                  </button>
                                </>
                      )}
                    </div>
                          </div>
                        </div>

                        {service.status === 'in-progress' && (
                          <div className="order-progress">
                            <div className="progress-steps">
                              <div className="progress-step completed">
                                <CheckCircle size={16} />
                                <span>Order Confirmed</span>
                              </div>
                              <div className="progress-step completed">
                                <User size={16} />
                                <span>Provider Assigned</span>
                              </div>
                              <div className="progress-step active">
                                <Truck size={16} />
                                <span>On the Way</span>
                              </div>
                              <div className="progress-step">
                                <CheckCircle size={16} />
                                <span>Service Complete</span>
                              </div>
                            </div>
                            <div className="estimated-arrival">
                              <Clock size={16} />
                              <span>Estimated arrival: 15-30 minutes</span>
                            </div>
                          </div>
                        )}
                  </div>
                ))}
              </div>

                  {/* Order Summary */}
                  <div className="order-summary-section">
                    <h2>Order Summary</h2>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{services.length}</span>
            </div>
                      <div className="summary-stat">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{services.filter(s => s.status === 'completed').length}</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-label">In Progress</span>
                        <span className="stat-value">{services.filter(s => s.status === 'in-progress').length}</span>
                      </div>
                       <div className="summary-stat">
                         <span className="stat-label">Total Spent</span>
                         <span className="stat-value">₹{services.reduce((sum, s) => sum + s.price, 0)}</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div 
                  className="billing-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="billing-header">
                    <h3>Billing & Payments</h3>
                    <p>Manage your bills and payment methods</p>
              </div>
              
                  <div className="content-grid">
                    {/* Bills & Invoices */}
                    <div className="content-card">
                      <div className="card-header">
                        <h4>Bills & Invoices</h4>
                        <button className="btn-primary">
                          <Download size={16} />
                          Download All
                        </button>
              </div>
                      <div className="bills-list">
                        {bills.map(bill => (
                          <div key={bill.id} className="bill-item">
                            <div className="bill-info">
                              <div className="bill-main">
                                <h5>{bill.id}</h5>
                                <p>{bill.service}</p>
            </div>
                              <div className="bill-details">
                                <span>Date: {bill.date}</span>
                                {bill.method && <span>Paid via: {bill.method}</span>}
                      </div>
                    </div>
                    
                            <div className="bill-amount">
                              <span className="amount">₹{bill.amount.toFixed(2)}</span>
                        <span 
                          className="status-badge"
                                style={{ backgroundColor: getStatusColor(bill.status) }}
                        >
                                {bill.status}
                        </span>
                            </div>

                            <div className="bill-actions">
                              {bill.status === 'pending' || bill.status === 'overdue' ? (
                                <button 
                                  className="btn-primary"
                                  onClick={() => handlePayBill(bill)}
                                >
                                  Pay Now
                                </button>
                              ) : (
                                <button className="btn-secondary">
                                  <Download size={16} />
                                  Download
                                </button>
                      )}
                    </div>
                  </div>
                ))}
                      </div>
                    </div>
                    
                    {/* Payment Methods */}
                    <div className="content-card">
                      <h4>Payment Methods</h4>
                      <div className="payment-methods">
                        <div className="payment-method">
                          <div className="method-icon">
                            <CreditCard size={24} />
                      </div>
                          <div className="method-info">
                            <h5>Credit Card</h5>
                            <p>•••• •••• •••• 1234</p>
                      </div>
                          <button className="btn-secondary">Edit</button>
                    </div>
                    
                        <div className="payment-method">
                          <div className="method-icon">
                            <Smartphone size={24} />
                          </div>
                          <div className="method-info">
                            <h5>UPI</h5>
                            <p>user@upi</p>
                          </div>
                          <button className="btn-secondary">Edit</button>
                        </div>

                        <button className="add-method-btn">
                          <Plus size={16} />
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form Modal */}
                  {isPaymentModalOpen && selectedService && (
                    <div className="modal-backdrop" onClick={() => setIsPaymentModalOpen(false)}>
                      <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h4>Pay Bill - {selectedService.id}</h4>
                          <button className="close-btn" onClick={() => setIsPaymentModalOpen(false)}>
                            <X size={20} />
                          </button>
                        </div>
                        <form className="modal-body">
                          <div className="form-group">
                            <label>Service</label>
                            <input type="text" value={selectedService.service} disabled />
                          </div>
                          
                            <div className="form-group">
                              <label>Amount Due</label>
                              <input type="text" value={`₹${selectedService.amount.toFixed(2)}`} disabled />
                            </div>

                          <div className="form-group">
                            <label htmlFor="paymentMethod">Payment Method</label>
                            <select id="paymentMethod" name="paymentMethod" required>
                              <option value="card">Credit Card (•••• 1234)</option>
                              <option value="upi">UPI (user@upi)</option>
                              <option value="wallet">Wallet</option>
                              <option value="netbanking">Net Banking</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor="promoCode">Apply Promo/Discount</label>
                            <input id="promoCode" name="promoCode" type="text" placeholder="Enter promo code" />
                          </div>

                          <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>
                              Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                              Pay ₹{selectedService.amount.toFixed(2)}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'support' && (
                <motion.div 
                  className="feedback-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="feedback-header">
                    <h3>Feedback & Support</h3>
                    <p>Share your experience and get help</p>
                    </div>
              
                  <div className="content-grid">
                    {/* Provide Feedback */}
                    <div className="content-card">
                      <h4>Provide Feedback</h4>
                      <form className="feedback-form">
                        <div className="form-group">
                          <label htmlFor="bookingId">Booking ID</label>
                          <select id="bookingId" name="bookingId" required>
                            <option value="">Select a completed service</option>
                            {services.filter(s => s.status === 'completed').map(service => (
                              <option key={service.id} value={service.trackingId}>
                                {service.trackingId} - {service.name}
                              </option>
                            ))}
                          </select>
                  </div>

                        <div className="form-group">
                          <label>Rating</label>
                          <div className="rating-input">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                className="star-btn"
                              >
                                <Star size={24} />
                              </button>
                ))}
              </div>
            </div>

                        <div className="form-group">
                          <label htmlFor="feedback">Written Feedback</label>
                          <textarea 
                            id="feedback" 
                            name="feedback" 
                            rows="4" 
                            placeholder="Share your experience with the service..."
                          ></textarea>
              </div>
              
                        <div className="form-group">
                          <label className="checkbox-label">
                            <input type="checkbox" name="recommend" />
                            Would you recommend this service provider?
                          </label>
              </div>

                        <div className="form-actions">
                          <button type="submit" className="btn-primary">Submit Feedback</button>
            </div>
                      </form>
                    </div>

                    {/* Support & Help */}
                    <div className="content-card">
                      <h4>Support & Help</h4>
                      <div className="support-options">
                        <button className="support-btn">
                          <MessageCircle size={20} />
                          <span>Live Chat</span>
                        </button>
                        <button className="support-btn">
                          <Phone size={20} />
                          <span>Call Support</span>
                        </button>
                        <button className="support-btn">
                          <Mail size={20} />
                          <span>Email Support</span>
                        </button>
                        <button className="support-btn">
                          <FileText size={20} />
                          <span>FAQ</span>
                        </button>
                      </div>

                      <div className="complaint-form">
                        <h5>Raise a Complaint</h5>
                        <form>
                          <div className="form-group">
                            <label htmlFor="complaintType">Issue Type</label>
                            <select id="complaintType" name="complaintType" required>
                              <option value="">Select issue type</option>
                              <option value="service_quality">Service Quality</option>
                              <option value="billing">Billing Issue</option>
                              <option value="provider_behavior">Provider Behavior</option>
                              <option value="technical">Technical Issue</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor="complaintDetails">Describe the Issue</label>
                            <textarea 
                              id="complaintDetails" 
                              name="complaintDetails" 
                              rows="3" 
                              placeholder="Please provide details about your complaint..."
                              required
                            ></textarea>
                          </div>

                          <div className="form-actions">
                            <button type="submit" className="btn-primary">Submit Complaint</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
          )}

          {activeTab === 'profile' && (
                <motion.div 
                  className="profile-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="profile-header">
                    <h3>My Profile</h3>
                    <p>Manage your account information and preferences</p>
              </div>
              
                  <div className="profile-content">
                    <CustomerProfileForm />
                    <div className="profile-card">
                      <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {(() => {
                    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL;
                    return avatar ? (
                      <img src={avatar} alt="Profile" />
                    ) : (
                      <User size={40} />
                    );
                  })()}
                </div>
                        <button 
                          className="btn-secondary"
                          onClick={() => document.getElementById('profile-image-input')?.click()}
                        >
                          <Upload size={16} />
                          {user?.user_metadata?.avatar_url ? 'Change Photo' : 'Upload Profile Picture'}
                        </button>
                </div>
                
                <div className="profile-details">
                        <div className="detail-group">
                          <label>Full Name</label>
                          <div className="detail-value">
                            <span>{user?.user_metadata?.full_name || 'Not provided'}</span>
                            <button className="btn-icon">
                              <Edit size={16} />
                            </button>
                </div>
              </div>

                        <div className="detail-group">
                          <label>Email</label>
                          <div className="detail-value">
                            <span>{user?.email || 'Not provided'}</span>
                            <button className="btn-icon">
                              <Edit size={16} />
                            </button>
            </div>
                        </div>

                        
                      </div>
                    </div>

                    <div className="preferences-card">
                      <h4>Preferences</h4>
                      <div className="preferences-list">
                        <div className="preference-item">
                          <div className="preference-info">
                            <h5>Email Notifications</h5>
                            <p>Receive updates about your services via email</p>
                          </div>
                          <label className="toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="preference-item">
                          <div className="preference-info">
                            <h5>SMS Notifications</h5>
                            <p>Get text messages for important updates</p>
                          </div>
                          <label className="toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="preference-item">
                          <div className="preference-info">
                            <h5>Marketing Communications</h5>
                            <p>Receive promotional offers and news</p>
                          </div>
                          <label className="toggle">
                            <input type="checkbox" />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBookingModalOpen(false)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Book a Service</h4>
              <button className="close-btn" onClick={() => setIsBookingModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Select Category</label>
                    <select id="category" name="category" required>
                      <option value="">Choose a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="service">Select Service</label>
                    <select id="service" name="service" required>
                      <option value="">Choose a service</option>
                      {services.slice(0, 10).map((service, index) => (
                        <option key={index} value={service.name.toLowerCase().replace(/\s+/g, '_')}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
              </div>
              
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Preferred Date</label>
                    <input id="date" name="date" type="date" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="time">Preferred Time</label>
                    <input id="time" name="time" type="time" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input id="address" name="address" type="text" placeholder="Enter service address" required />
                </div>

                <div className="form-group">
                  <label htmlFor="instructions">Special Instructions</label>
                  <textarea id="instructions" name="instructions" rows="3" placeholder="Any special requirements or instructions"></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="promo">Promo Code (Optional)</label>
                  <input id="promo" name="promo" type="text" placeholder="Enter promo code" />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsBookingModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">Confirm Booking</button>
                </div>
              </form>
            </div>
              </div>
            </div>
          )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && selectedService && (
        <div className="modal-backdrop" onClick={() => setIsFeedbackModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Provide Feedback</h4>
              <button className="close-btn" onClick={() => setIsFeedbackModalOpen(false)}>
                <X size={20} />
              </button>
      </div>
            <form className="modal-body">
              <div className="form-group">
                <label>Service Provider</label>
                <input type="text" value={selectedService.provider} disabled />
              </div>
              
              <div className="form-group">
                <label>Service</label>
                <input type="text" value={selectedService.name} disabled />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className="star-btn"
                    >
                      <Star size={24} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="feedbackText">Written Feedback</label>
                <textarea 
                  id="feedbackText" 
                  name="feedbackText" 
                  rows="4" 
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="recommend" />
                  Would you recommend this service provider?
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsFeedbackModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
