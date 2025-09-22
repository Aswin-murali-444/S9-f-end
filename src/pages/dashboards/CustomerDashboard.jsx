import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight
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
  const [filterCategory, setFilterCategory] = useState('all');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const notificationsRef = useRef(null);
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  const { useAnimatedInView, staggerAnimation } = useAnimations();

  // Enhanced Mock Data
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Home Cleaning',
      provider: 'CleanPro Services',
      status: 'completed',
      date: '2024-01-15',
      time: '10:00 AM',
      rating: 5,
      price: 75.00,
      category: 'Home Maintenance',
      providerRating: 4.8,
      duration: '2 hours',
      nextService: null,
      address: '123 Main St, Apt 4B',
      instructions: 'Please focus on kitchen and bathrooms',
      promoCode: 'CLEAN20',
      trackingId: 'TRK-001'
    },
    {
      id: 2,
      name: 'Plumbing Repair',
      provider: 'FixIt Plumbing',
      status: 'in-progress',
      date: '2024-01-20',
      time: '02:00 PM',
      rating: null,
      price: 120.00,
      category: 'Home Maintenance',
      providerRating: 4.6,
      duration: '1.5 hours',
      nextService: '2024-01-20 14:00',
      address: '123 Main St, Apt 4B',
      instructions: 'Kitchen sink leak repair',
      promoCode: null,
      trackingId: 'TRK-002',
      providerLocation: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 3,
      name: 'Elder Care',
      provider: 'CareFirst',
      status: 'scheduled',
      date: '2024-01-18',
      time: '09:00 AM',
      rating: 4,
      price: 45.00,
      category: 'Caregiving',
      providerRating: 4.9,
      duration: '4 hours',
      nextService: '2024-01-19 09:00',
      address: '123 Main St, Apt 4B',
      instructions: 'Medication reminder and companionship',
      promoCode: null,
      trackingId: 'TRK-003'
    }
  ]);

  const [bookingHistory, setBookingHistory] = useState([
    { id: 1, service: 'Home Cleaning', date: '2024-01-10', status: 'completed', amount: 75.00 },
    { id: 2, service: 'Grocery Delivery', date: '2024-01-08', status: 'completed', amount: 25.00 },
    { id: 3, service: 'Elder Care', date: '2024-01-05', status: 'completed', amount: 180.00 },
    { id: 4, service: 'Transport', date: '2024-01-03', status: 'cancelled', amount: 0.00 }
  ]);

  const [bills, setBills] = useState([
    { id: 'INV-001', service: 'Home Cleaning', amount: 75.00, status: 'paid', date: '2024-01-15', method: 'Credit Card' },
    { id: 'INV-002', service: 'Elder Care', amount: 180.00, status: 'pending', date: '2024-01-18', method: null },
    { id: 'INV-003', service: 'Plumbing Repair', amount: 120.00, status: 'overdue', date: '2024-01-20', method: null }
  ]);

  const [cameras, setCameras] = useState([
    { id: 1, name: 'Living Room', deviceId: 'CAM-001', status: 'online', sharedWith: ['john@family.com'], alerts: true },
    { id: 2, name: 'Kitchen', deviceId: 'CAM-002', status: 'offline', sharedWith: [], alerts: false },
    { id: 3, name: 'Bedroom', deviceId: 'CAM-003', status: 'online', sharedWith: ['mary@family.com'], alerts: true }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Service Reminder', message: 'Your plumbing service is scheduled for today at 2:00 PM', type: 'reminder', time: '1 hour ago' },
    { id: 2, title: 'Bill Due', message: 'Elder Care service bill of $180 is due tomorrow', type: 'billing', time: '2 hours ago' },
    { id: 3, title: 'Motion Detected', message: 'Motion detected in Living Room camera', type: 'security', time: '3 hours ago' },
    { id: 4, title: 'Service Completed', message: 'Home Cleaning service has been completed successfully', type: 'service', time: '1 day ago' }
  ]);

  const [serviceStats] = useState({
    totalServices: 24,
    completedServices: 21,
    totalSpent: 1850,
    averageRating: 4.7,
    favoriteCategory: 'Home Maintenance',
    monthlySavings: 120,
    activeBookings: 3,
    pendingPayments: 2
  });

  const [categories, setCategories] = useState([]);

  const iconForCategoryName = (name) => {
    const n = String(name || '').toLowerCase();
    if (n.includes('care')) return Heart;
    if (n.includes('transport') || n.includes('driver')) return Truck;
    if (n.includes('deliver')) return Package;
    return Settings;
  };

  useEffect(() => {
    let isCancelled = false;
    const loadCategories = async () => {
      try {
        const data = await apiService.getCategories();
        if (isCancelled) return;
        const mapped = Array.isArray(data)
          ? [
              {
                id: '__all__',
                name: 'All',
                icon: () => AllServicesIcon,
                imageUrl: null,
                services: [1, 2, 3, 4]
              },
              ...data.map((c) => ({
                id: c.id,
                name: c.name,
                icon: iconForCategoryName(c.name),
                imageUrl: c.icon_url || null,
                services: [1, 2, 3, 4]
              }))
            ]
          : [];
        setCategories(mapped);
      } catch (e) {
        if (!isCancelled) setCategories([]);
      }
    };
    loadCategories();
    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

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

  const stats = [
    { label: "Total Services", value: serviceStats.totalServices.toString(), icon: Calendar, color: "#8b5cf6", change: "+3 this month", changeType: "positive" },
    { label: "Completed", value: serviceStats.completedServices.toString(), icon: CheckCircle, color: "#10b981", change: "+2 this week", changeType: "positive" },
    { label: "Total Spent", value: `$${serviceStats.totalSpent.toLocaleString()}`, icon: DollarSign, color: "#4f9cf9", change: "-$50 vs last month", changeType: "positive" },
    { label: "Avg Rating", value: serviceStats.averageRating.toString(), icon: Star, color: "#f59e0b", change: "+0.2 improvement", changeType: "positive" }
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
                  <Bell size={20} />
                  Notifications
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
                        <Search size={20} />
                        <input 
                          type="text" 
                          placeholder="Search for services (e.g., plumbing, cleaning, elder care)" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <button className="btn-primary search-action">
                        <Search size={18} />
                        Search
                      </button>
                    </div>
                    <div className="popular-searches">
                      <span className="search-label">Popular:</span>
                      <button className="search-tag" onClick={() => setSearchQuery('Home Cleaning')}>Home Cleaning</button>
                      <button className="search-tag" onClick={() => setSearchQuery('Plumbing')}>Plumbing</button>
                      <button className="search-tag" onClick={() => setSearchQuery('Elder Care')}>Elder Care</button>
                      <button className="search-tag" onClick={() => setSearchQuery('Electrical')}>Electrical</button>
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
                  <div className="marketplace-categories full-bleed">
                    <div className="section-header">
                      <h3>Categories</h3>
                      <button className="view-all-btn" onClick={() => setActiveTab('categories')}>
                        View All
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="categories-grid">
                      {categories.map(category => {
                        const IconComponent = category.icon === AllServicesIcon || category.id === '__all__'
                          ? AllServicesIcon
                          : category.icon;
                        return (
                          <motion.div 
                            key={category.id} 
                            className="category-card" 
                            onClick={() => setActiveTab('categories')}
                            whileHover={{ y: -4 }}
                            variants={itemVariants}
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
                                <IconComponent size={32} />
                              )}
                            </div>
                            <h4>{category.name}</h4>
                            <p className="service-count">{category.services.length}+ Services</p>
                            <span className="category-offer">Min. 20% Off</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deals of the Day - Flipkart Style */}
                  <div className="deals-section full-bleed">
                    <div className="section-header">
                      <h3>Deals of the Day</h3>
                      <div className="timer">
                        <Clock size={16} />
                        <span>22:07:36 Left</span>
                      </div>
                    </div>
                    <div className="deals-grid">
                      {[
                        { id: 1, name: 'Home Deep Cleaning', price: 75, originalPrice: 150, discount: 50, rating: 4.5, reviews: 2341, provider: 'CleanPro' },
                        { id: 2, name: 'AC Service & Repair', price: 45, originalPrice: 90, discount: 50, rating: 4.3, reviews: 1823, provider: 'CoolTech' },
                        { id: 3, name: 'Plumbing Services', price: 35, originalPrice: 70, discount: 50, rating: 4.6, reviews: 3421, provider: 'FixIt' },
                        { id: 4, name: 'Electrical Repair', price: 40, originalPrice: 80, discount: 50, rating: 4.4, reviews: 2156, provider: 'PowerFix' }
                      ].map(deal => (
                        <motion.div 
                          key={deal.id} 
                          className="deal-card"
                          whileHover={{ y: -4 }}
                          variants={itemVariants}
                        >
                          <div className="deal-badge">{deal.discount}% OFF</div>
                          <div className="deal-image">
                            <Settings size={60} />
                          </div>
                          <div className="deal-content">
                            <h4>{deal.name}</h4>
                            <p className="provider-name">{deal.provider}</p>
                            <div className="rating-row">
                              <span className="rating-badge">{deal.rating} ★</span>
                              <span className="reviews">({deal.reviews.toLocaleString()})</span>
                            </div>
                            <div className="price-row">
                              <span className="current-price">${deal.price}</span>
                              <span className="original-price">${deal.originalPrice}</span>
                            </div>
                          </div>
                          <button className="btn-primary add-to-cart" onClick={handleBookService}>
                            <Plus size={16} />
                            Add to Cart
                          </button>
                        </motion.div>
                      ))}
                    </div>
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
                            <span>${booking.amount}</span>
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
                      {categories.map(category => {
                        const IconComponent = category.icon;
                        return (
                          <motion.div 
                            key={category.id} 
                            className="category-item-card"
                            whileHover={{ scale: 1.02 }}
                            variants={itemVariants}
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
                                {category.services.slice(0, 4).map((service, idx) => (
                                  <span key={idx} className="service-tag">{service}</span>
                                ))}
                              </div>
                              <div className="category-pricing">
                                <span className="price-from">Starting from</span>
                                <span className="price-amount">$25</span>
                                <span className="discount-badge">50% OFF</span>
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
                      })}
                    </div>
                  </div>

                  {/* Popular Services */}
                  <div className="popular-services">
                    <h2>Popular Services</h2>
                    <div className="popular-services-grid">
                      <div className="service-deal-card">
                        <div className="deal-badge">BESTSELLER</div>
                        <div className="service-image">
                          <Settings size={48} />
                        </div>
                        <div className="service-info">
                          <h3>Home Cleaning</h3>
                          <div className="service-rating">
                            <div className="stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={12} fill="#fbbf24" color="#fbbf24" />
                              ))}
                            </div>
                            <span className="rating-count">(2,156)</span>
                          </div>
                          <div className="service-pricing">
                            <span className="price-current">$75</span>
                            <span className="price-original">$95</span>
                            <span className="discount-percent">21% off</span>
                          </div>
                        </div>
                        <button className="quick-book-btn" onClick={handleBookService}>
                          Book Now
                        </button>
                      </div>

                      <div className="service-deal-card">
                        <div className="deal-badge">TOP RATED</div>
                        <div className="service-image">
                          <Heart size={48} />
                        </div>
                        <div className="service-info">
                          <h3>Elder Care</h3>
                          <div className="service-rating">
                            <div className="stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={12} fill="#fbbf24" color="#fbbf24" />
                              ))}
                            </div>
                            <span className="rating-count">(1,823)</span>
                          </div>
                          <div className="service-pricing">
                            <span className="price-current">$35</span>
                            <span className="price-original">$45</span>
                            <span className="discount-percent">22% off</span>
                          </div>
                        </div>
                        <button className="quick-book-btn" onClick={handleBookService}>
                          Book Now
                        </button>
                      </div>

                      <div className="service-deal-card">
                        <div className="deal-badge">LIMITED TIME</div>
                        <div className="service-image">
                          <Truck size={48} />
                        </div>
                        <div className="service-info">
                          <h3>Express Delivery</h3>
                          <div className="service-rating">
                            <div className="stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={12} fill="#fbbf24" color="#fbbf24" />
                              ))}
                            </div>
                            <span className="rating-count">(3,291)</span>
                          </div>
                          <div className="service-pricing">
                            <span className="price-current">$15</span>
                            <span className="price-original">$20</span>
                            <span className="discount-percent">25% off</span>
                          </div>
                        </div>
                        <button className="quick-book-btn" onClick={handleBookService}>
                          Book Now
                        </button>
                      </div>
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

                  <div className="wishlist-grid">
                    {services.slice(0, 2).map(service => (
                      <div key={service.id} className="wishlist-item">
                        <div className="wishlist-image">
                          <Settings size={32} />
                        </div>
                        <div className="wishlist-info">
                          <h4>{service.name}</h4>
                          <p>by {service.provider}</p>
                          <div className="wishlist-rating">
                            <Star size={14} fill="#fbbf24" color="#fbbf24" />
                            <span>4.8 (150 reviews)</span>
                          </div>
                          <div className="wishlist-price">
                            <span className="current-price">${service.price}</span>
                            <span className="original-price">$95</span>
                          </div>
                        </div>
                        <div className="wishlist-actions">
                          <button className="btn-primary" onClick={handleBookService}>
                            Book Now
                          </button>
                          <button className="btn-secondary">
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
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
                    <div className="cart-items">
                      {services.slice(0, 2).map(service => (
                        <div key={service.id} className="cart-item">
                          <div className="cart-item-image">
                            <Settings size={40} />
                          </div>
                          <div className="cart-item-info">
                            <h4>{service.name}</h4>
                            <p>by {service.provider}</p>
                            <div className="cart-item-details">
                              <span>Date: {service.date}</span>
                              <span>Time: {service.time}</span>
                            </div>
                          </div>
                          <div className="cart-item-price">
                            <span className="price">${service.price}</span>
                            <button className="remove-btn">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="cart-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>$195.00</span>
                      </div>
                      <div className="summary-row">
                        <span>Service Fee:</span>
                        <span>$10.00</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>$205.00</span>
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
                            <span className="order-total">Total: ${service.price}</span>
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
                        <span className="stat-value">${services.reduce((sum, s) => sum + s.price, 0)}</span>
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
                              <span className="amount">${bill.amount.toFixed(2)}</span>
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
                            <input type="text" value={`$${selectedService.amount.toFixed(2)}`} disabled />
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
                              Pay ${selectedService.amount.toFixed(2)}
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
                      <option value="plumbing">Plumbing</option>
                      <option value="cleaning">Home Cleaning</option>
                      <option value="electrical">Electrical</option>
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
