import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import ErrorDisplay from '../../components/ErrorDisplay';
import ToastContainer from '../../components/ToastContainer';
import LoadingSpinner from '../../components/LoadingSpinner';
import useToast from '../../hooks/useToast';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import cartWishlistService from '../../services/cartWishlistService';
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
  IndianRupee,
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
  ArrowLeft,
  ShoppingCart,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Minus,
  Send,
  RotateCcw,
  Image
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import AllServicesIcon from '../../components/AllServicesIcon';
import Logo from '../../components/Logo';
import CustomerProfileForm from '../../components/CustomerProfileForm';
import './SharedDashboard.css';
import './CustomerDashboard.css';
import './EnhancedCartWishlist.css';
import './AIAssistant.css';
import { apiService } from '../../services/api';
import { supabase } from '../../hooks/useAuth';
import aiAssistantService from '../../services/aiAssistantService';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Preseed review modal from navigation state/localStorage so it opens on first render (no flash)
  let initialReviewService = null;
  let initialFromBooking = false;
  try {
    initialReviewService = location.state?.openReviewService || JSON.parse(localStorage.getItem('openReviewService')) || null;
    initialFromBooking = location.state?.reviewFrom === 'booking' || localStorage.getItem('reviewFromBooking') === '1';
  } catch {}
  const { user, logout } = useAuth();
  const toastManager = useToast();
  const { isOnline, wasOffline, resetOfflineFlag } = useNetworkStatus();
  
  // Add CSS for search input placeholder
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .categories-search-input::placeholder {
        color: #94a3b8 !important;
        opacity: 1 !important;
        font-weight: 400 !important;
      }
      .category-services-search input::placeholder {
        color: #94a3b8 !important;
        opacity: 1 !important;
        font-weight: 400 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [activeTab, setActiveTab] = useState('home');
  const categoriesScrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(!!initialReviewService);
  const [selectedService, setSelectedService] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [viewedOrderId, setViewedOrderId] = useState(null);
  
  // AI Assistant states
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('active');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [recommendProvider, setRecommendProvider] = useState(false);
  
  // Review modal state
  const [reviewService, setReviewService] = useState(initialReviewService);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewAnswers, setReviewAnswers] = useState({});
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  // Open review modal when navigated with state from BookingPage
  useEffect(() => {
    const stateService = location.state?.openReviewService;
    let storedService = null;
    try {
      storedService = JSON.parse(localStorage.getItem('openReviewService'));
    } catch {}

    const svc = stateService || storedService;
    if (svc && !isReviewModalOpen) {
      setReviewService(svc);
      setReviewRating(0);
      setReviewAnswers({});
      setReviewNote('');
      setIsReviewModalOpen(true);
      // clear state so back/forward doesn't re-open unintentionally
      requestAnimationFrame(() => {
        navigate(location.pathname, { replace: true, state: null });
        try { localStorage.removeItem('openReviewService'); } catch {}
      });
    }
  }, [location.state, navigate, location.pathname]);

  // If review was opened from Booking, closing should go back to Booking instead of leaving user on dashboard
  const closeAndReturnIfFromBooking = () => {
    const fromBooking = location.state?.reviewFrom === 'booking' || localStorage.getItem('reviewFromBooking') === '1';
    setIsReviewModalOpen(false);
    setReviewService(null);
    setReviewRating(0);
    setReviewAnswers({});
    setReviewNote('');
    setIsSubmittingReview(false);
    try { localStorage.removeItem('reviewFromBooking'); } catch {}
    if (fromBooking) {
      navigate(-1);
    }
  };
  
  // Predefined review questions
  const reviewQuestions = [
    {
      id: 'quality',
      question: 'How would you rate the quality of service?',
      type: 'rating',
      options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    {
      id: 'punctuality',
      question: 'Was the service provider punctual?',
      type: 'yesno',
      options: ['Yes', 'No']
    },
    {
      id: 'professionalism',
      question: 'How professional was the service provider?',
      type: 'rating',
      options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    {
      id: 'value',
      question: 'How would you rate the value for money?',
      type: 'rating',
      options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    {
      id: 'cleanliness',
      question: 'How clean and tidy was the work area after service?',
      type: 'rating',
      options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    {
      id: 'communication',
      question: 'How well did the service provider communicate?',
      type: 'rating',
      options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    {
      id: 'recommend',
      question: 'Would you recommend this service to others?',
      type: 'yesno',
      options: ['Yes', 'No']
    }
  ];
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const notificationsRef = useRef(null);
  const chatMessagesRef = useRef(null);
  
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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

  // Cart and Wishlist functions - Updated to use persistent storage
  const addToCart = async (service) => {
    try {
      setCartLoading(true);
      await cartWishlistService.addToCart(service.id);
      await loadCart(); // Reload cart from server
    toast.success(`${service.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (serviceId) => {
    try {
      setCartLoading(true);
      // Find the cart item ID
      const cartItem = cart.find(item => item.id === serviceId);
      if (cartItem && cartItem.cartItemId) {
        await cartWishlistService.removeFromCart(cartItem.cartItemId);
        await loadCart(); // Reload cart from server
    toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartItemQuantity = async (itemId, newQuantity) => {
    try {
      setCartLoading(true);
      await cartWishlistService.updateCartItemQuantity(itemId, newQuantity);
      await loadCart(); // Reload cart from server
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update cart item');
    } finally {
      setCartLoading(false);
    }
  };

  const toggleWishlist = async (service) => {
    try {
      setWishlistLoading(true);
      const result = await cartWishlistService.toggleWishlist(service.id);
      await loadWishlist(); // Reload wishlist from server
      
      if (result.action === 'added') {
        toast.success(`${service.name} added to wishlist!`);
      } else {
        toast.success(`${service.name} removed from wishlist`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Load cart and wishlist from server
  const loadCart = async () => {
    try {
      const cartItems = await cartWishlistService.getCart();
      setCart(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      // Show error toast for debugging
      toast.error(`Failed to load cart: ${error.message}`);
    }
  };

  const loadWishlist = async () => {
    try {
      const wishlistItems = await cartWishlistService.getWishlist();
      setWishlist(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Show error toast for debugging
      toast.error(`Failed to load wishlist: ${error.message}`);
    }
  };

  // Load cart and wishlist when user changes
  useEffect(() => {
    if (user?.id) {
      loadCart();
      loadWishlist();
    } else {
      // Clear cart and wishlist when user logs out
      setCart([]);
      setWishlist([]);
    }
  }, [user?.id]);

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
        
        // Debug: Log sample service structure
        if (servicesData && servicesData.length > 0) {
          console.log('Sample service structure:', servicesData[0]);
        }
        
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
                services: (servicesData || []).filter(s => s.category_id === c.id || s.category === c.id || s.category_name === c.name)
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
          const errorMessage = e.message || 'Failed to load dashboard data';
          
          setError({
            message: errorMessage,
            type: e.name === 'NetworkError' || e.message?.includes('fetch') ? 'network' : 'error',
            details: {
              timestamp: new Date().toISOString(),
              error: e.message,
              stack: e.stack
            }
          });
          
          toastManager.error(errorMessage, {
            duration: 8000,
            action: (
              <button 
                onClick={() => window.location.reload()}
                style={{ 
                  padding: '6px 12px', 
                  background: 'rgba(255,255,255,0.9)', 
                  border: '1px solid currentColor', 
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                Retry
              </button>
            )
          });
          
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

  // After categories load, default to "All Services" so some services show by default
  useEffect(() => {
    if (!selectedCategory && categories && categories.length > 0) {
      const allCategory = categories.find(c => c.id === '__all__') || categories[0];
      if (allCategory) {
        setSelectedCategory(allCategory);
      }
    }
  }, [categories, selectedCategory]);

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
    // Use searchQuery for categories page, debouncedQuery for home page
    const query = activeTab === 'categories' ? searchQuery : debouncedQuery;
    const q = String(query || '').trim().toLowerCase();
    const base = (categories || []).slice().sort((a, b) => {
      const aAll = a.id === '__all__' ? -1 : 0;
      const bAll = b.id === '__all__' ? -1 : 0;
      return aAll - bAll;
    });
    if (q.length < 2) return base;
    
    // For categories page, also search within services
    if (activeTab === 'categories') {
      return base.filter(cat => 
        (cat.name || '').toLowerCase().includes(q) ||
        cat.services.some(service => 
          (service.name || '').toLowerCase().includes(q)
        )
      );
    }
    
    return base.filter(cat => (cat.name || '').toLowerCase().includes(q));
  })();

  // Highlight matched keyword helper for search results
  const highlightMatch = (text) => {
    const query = activeTab === 'categories' ? searchQuery : debouncedQuery;
    const q = String(query || '').trim();
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
    const q = String(debouncedQuery || '').trim().toLowerCase();
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

  const handleOpenBookingModal = (service) => {
    navigate('/booking', { 
      state: { 
        service: service, 
        user: user 
      } 
    });
  };


  const handleCategoryClick = (category) => {
    setViewingCategory(category);
    setSearchQuery(''); // Clear any existing search when entering category view
  };

  const handleBackToCategories = () => {
    setViewingCategory(null);
    setSelectedCategory(null);
    setSearchQuery(''); // Clear search when going back
    navigate('/dashboard/customer'); // Navigate to customer dashboard home
    // Scroll to categories section after navigation
    setTimeout(() => {
      document.querySelector('.marketplace-categories')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };
  // Load real orders from Supabase
  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      setOrdersLoading(true);
      // Resolve users.id from auth_user_id
      const { data: dbUser, error: uErr } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (uErr || !dbUser) {
        setOrders([]);
        return;
      }
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          total_amount,
          booking_status,
          payment_status,
          service_address,
          services:service_id ( name )
        `)
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const mapped = data.map(row => ({
          id: row.id,
          name: row.services?.name || 'Service',
          date: row.scheduled_date,
          time: row.scheduled_time,
          address: row.service_address,
          total: row.total_amount,
          bookingStatus: row.booking_status,
          paymentStatus: row.payment_status
        }));
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  // Helper functions for orders
  const getFilteredOrders = () => {
    if (ordersFilter === 'last30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orders.filter(order => new Date(order.date) >= thirtyDaysAgo);
    }
    if (ordersFilter === 'completed') {
      return orders.filter(order => order.bookingStatus === 'completed');
    }
    if (ordersFilter === 'pending') {
      return orders.filter(order => order.bookingStatus === 'pending' || order.bookingStatus === 'confirmed');
    }
    if (ordersFilter === 'cancelled') {
      return orders.filter(order => order.bookingStatus === 'cancelled');
    }
    return orders;
  };

  const getOrderStats = () => {
    const filtered = getFilteredOrders();
    const total = filtered.length;
    const completed = filtered.filter(o => o.bookingStatus === 'completed').length;
    const pending = filtered.filter(o => o.bookingStatus === 'pending' || o.bookingStatus === 'confirmed').length;
    const cancelled = filtered.filter(o => o.bookingStatus === 'cancelled').length;
    const totalAmount = filtered.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return { total, completed, pending, cancelled, totalAmount };
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
    setViewedOrderId(order.id);
  };

  const handlePayBill = (bill) => {
    setSelectedService(bill);
    setIsPaymentModalOpen(true);
  };

  const handleProvideFeedback = (service) => {
    setSelectedService(service);
    setFeedbackRating(0);
    setFeedbackText('');
    setRecommendProvider(false);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (feedbackRating === 0) {
      toastManager.warning('Please select a rating before submitting feedback.');
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically send the feedback to your backend
      console.log('Feedback submitted:', {
        service: selectedService,
        rating: feedbackRating,
        text: feedbackText,
        recommend: recommendProvider
      });
      
      // Show success message and close modal
      toastManager.feedback(
        `Thank you for your ${feedbackRating}-star feedback! Your input helps us improve our services.`,
        {
          duration: 6000,
          icon: <Star size={20} />
        }
      );
      
      setIsFeedbackModalOpen(false);
      setSelectedService(null);
      setFeedbackRating(0);
      setFeedbackText('');
      setRecommendProvider(false);
      
    } catch (error) {
      toastManager.error('Failed to submit feedback. Please try again.');
    }
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedService(null);
    setFeedbackRating(0);
    setFeedbackText('');
    setRecommendProvider(false);
  };

  // AI Assistant handlers

  const sendAIMessage = async (message, imageData = null) => {
    if (!message.trim() && !imageData) return;

    // Convert image to base64 for storage in message
    let imageBase64 = null;
    if (imageData && imageData instanceof File) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageData);
      });
    } else if (imageData) {
      imageBase64 = imageData;
    }

    // Use appropriate message content
    const messageContent = message.trim() || (imageBase64 ? 'Please analyze this image' : '');

    const userMessage = { 
      role: 'user', 
      content: messageContent, 
      imageData: imageBase64, // Store base64 for display
      timestamp: new Date() 
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setAiLoading(true);

    try {
      const conversationHistory = aiMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await aiAssistantService.sendMessage(messageContent, conversationHistory, imageBase64);
      
      const aiMessage = { 
        role: 'assistant', 
        content: response.response, 
        timestamp: new Date() 
      };
      
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      toastManager.error('Failed to get AI response. Please try again.');
      
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or contact support.', 
        timestamp: new Date(),
        isError: true
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    sendAIMessage(aiInput, selectedImage);
  };

  const clearAIConversation = () => {
    setAiMessages([]);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toastManager.error('Image size should be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setSelectedImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Review modal handlers
  const handleOpenReviewModal = (service) => {
    setReviewService(service);
    setReviewRating(0);
    setReviewAnswers({});
    setReviewNote('');
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    closeAndReturnIfFromBooking();
  };

  const handleReviewAnswerChange = (questionId, answer) => {
    setReviewAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (reviewRating === 0) {
      toastManager.warning('Please select a rating before submitting your review.');
      return;
    }

    setIsSubmittingReview(true);
    
    try {
      // Here you would typically send the review to your backend
      console.log('Review submitted:', {
        service: reviewService,
        rating: reviewRating,
        answers: reviewAnswers,
        note: reviewNote,
        timestamp: new Date().toISOString()
      });
      
      // Show success message and close modal
      toastManager.success(
        `Thank you for your ${reviewRating}-star review! Your feedback helps other customers make informed decisions.`,
        {
          duration: 6000,
          icon: <Star size={20} />
        }
      );
      
      setIsReviewModalOpen(false);
      setReviewService(null);
      setReviewRating(0);
      setReviewAnswers({});
      setReviewNote('');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toastManager.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate potential payment failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Payment failed. Please check your payment method and try again.');
      }
      
      setIsProcessingPayment(false);
      
      toastManager.payment(
        `Payment of ₹${selectedService?.amount?.toFixed(2) || '0.00'} successful! You will receive a confirmation email shortly.`,
        {
          duration: 8000,
          icon: <CreditCard size={20} />
        }
      );
      
      setIsPaymentModalOpen(false);
      setSelectedService(null);
      setPaymentMethod('card');
      setPromoCode('');
      
    } catch (error) {
      setIsProcessingPayment(false);
      toastManager.error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedService(null);
    setPaymentMethod('card');
    setPromoCode('');
    setIsProcessingPayment(false);
  };

  const handleRetryDataLoad = async () => {
    setIsRetrying(true);
    setError(null);
    
    try {
      // Simulate retry loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the component data
      window.location.reload();
      
      toastManager.success('Data reloaded successfully!');
    } catch (e) {
      toastManager.error('Failed to reload data. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
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

  // Load AI status when AI assistant tab is active
  useEffect(() => {
    if (activeTab === 'ai-assistant') {
      // AI assistant is ready when tab is active
    }
  }, [activeTab]);

  // Auto-scroll chat messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  // Welcome message on dashboard load
  useEffect(() => {
    const hasVisited = localStorage.getItem('dashboard-visited');
    if (!hasVisited && user) {
      setTimeout(() => {
        toastManager.info(
          `Welcome back, ${user.full_name || user.email}! Explore our services and manage your bookings.`,
          {
            duration: 6000,
            title: 'Welcome to Nexus Dashboard'
          }
        );
        localStorage.setItem('dashboard-visited', 'true');
      }, 1000);
    }
  }, [user, toastManager]);

  // Network status monitoring
  useEffect(() => {
    if (!isOnline) {
      toastManager.network(
        'You are currently offline. Some features may not be available.',
        {
          duration: 0, // Persistent until dismissed
          persistent: true
        }
      );
    } else if (wasOffline) {
      toastManager.success(
        'Connection restored! You are back online.',
        {
          duration: 4000,
          title: 'Back Online'
        }
      );
      resetOfflineFlag();
    }
  }, [isOnline, wasOffline, toastManager, resetOfflineFlag]);

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
      icon: IndianRupee, 
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
    { key: 'orders', label: 'Your Orders', icon: Receipt },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
    { key: 'cart', label: 'Cart', icon: Package },
    { key: 'account', label: 'Your Account', icon: User },
    { key: 'ai-assistant', label: 'Nexus AI Assistant', icon: MessageCircle }
  ];

  return (
    <div className="customer-dashboard">
      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleRetryDataLoad}
          onDismiss={handleDismissError}
          type={error.type || 'error'}
          autoDismiss={false}
        />
      )}

      {/* Toast Container */}
      <ToastContainer
        toasts={toastManager.toasts}
        removeToast={toastManager.removeToast}
        position="top-right"
      />

      {/* Loading Spinner */}
      {servicesLoading && (
        <LoadingSpinner
          size="large"
          color="primary"
          text="Loading your dashboard..."
          fullScreen={true}
        />
      )}
      {/* Professional Header Section */}
      <motion.header 
        className="professional-header"
        ref={headerRef}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="header-container">
          <motion.div className="header-content" variants={itemVariants}>
            {/* Logo Section */}
            <div className="header-logo">
              <Logo 
                size="medium" 
                onClick={() => navigate('/')}
                className="clickable-logo"
              />
            </div>

            {/* Header Actions */}
            <div className="header-actions" ref={notificationsRef}>
              {/* Notifications */}
              <div className="notification-container">
                <button 
                  className="notification-btn"
                  onClick={() => setIsNotificationsOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={isNotificationsOpen}
                  title="Notifications"
                >
                  <div className="notification-icon">
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <span className="notification-badge">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </div>
                </button>
                
                {isNotificationsOpen && (
                  <div className="notifications-dropdown">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      <button 
                        className="mark-all-read-btn"
                        onClick={() => setNotifications([])}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="dropdown-content">
                      {notifications.length === 0 ? (
                        <div className="empty-notifications">
                          <Bell size={32} />
                          <p>No new notifications</p>
                          <span>You're all caught up!</span>
                        </div>
                      ) : (
                        <div className="notifications-list">
                          {notifications.slice(0, 6).map(item => (
                            <div key={item.id} className={`notification-item ${item.type}`}>
                              <div className="notification-icon-wrapper">
                                {item.type === 'reminder' && <Clock size={16} />}
                                {item.type === 'billing' && <IndianRupee size={16} />}
                                {item.type === 'security' && <Shield size={16} />}
                                {item.type === 'service' && <CheckCircle size={16} />}
                              </div>
                              <div className="notification-content">
                                <div className="notification-title">{item.title}</div>
                                <div className="notification-message">{item.message}</div>
                                <div className="notification-time">{item.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="dropdown-footer">
                        <button 
                          className="view-all-btn"
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            // Navigate to notifications page or show all
                          }}
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="user-profile-container">
                <button
                  className="user-profile-btn"
                  onClick={() => setActiveTab('profile')}
                  aria-label="View Profile"
                  title="View Profile"
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
                  <div className="user-info">
                    <span className="user-name">{user?.user_metadata?.full_name || 'Customer'}</span>
                    <span className="user-role">Customer</span>
                  </div>
                  <ChevronDown size={16} className="dropdown-arrow" />
                </button>
              </div>

              {/* Logout Button */}
              <button 
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.header>

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
                whileHover={{ 
                  scale: 1.01,
                  y: -4,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300,
                  damping: 25
                }}
              >
                <div 
                  className="stat-icon" 
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                  }}
                >
                  <stat.icon size={20} color="white" />
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
                      <button className="view-all-btn" onClick={() => { setActiveTab('categories'); handleSearch(); setSelectedCategory(null); }}>
                        View All
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="categories-carousel" style={{ position: 'relative' }}>
                      <button
                        aria-label="Scroll left"
                        className="carousel-arrow left"
                        onClick={() => { const el = categoriesScrollRef.current; if (el) el.scrollBy({ left: -280, behavior: 'smooth' }); }}
                      >
                        <span className="arrow-icon-stack">
                          <LayoutGrid className="arrow-badge" />
                          <ChevronLeft className="arrow-chevron" />
                        </span>
                      </button>
                      <div
                        ref={categoriesScrollRef}
                        className="categories-grid categories-scroll"
                      >
                      {filteredCategories.map((category, idx) => {
                        const IconComponent = category.id === '__all__'
                          ? AllServicesIcon
                          : category.icon;
                        return (
                          <motion.div 
                            key={category.id} 
                            className="category-card" 
                            style={{ flex: '0 0 auto', scrollSnapAlign: 'start' }}
                            onClick={() => {
                              setSelectedCategory(category);
                              setTimeout(() => {
                                document.getElementById('selected-category-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 0);
                            }}
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
                      <button
                        aria-label="Scroll right"
                        className="carousel-arrow right"
                        onClick={() => { const el = categoriesScrollRef.current; if (el) el.scrollBy({ left: 280, behavior: 'smooth' }); }}
                      >
                        <span className="arrow-icon-stack">
                          <LayoutGrid className="arrow-badge" />
                          <ChevronRight className="arrow-chevron" />
                        </span>
                      </button>
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
                              <motion.div key={service.id} className="deal-card" whileHover={cardHoverEffects[idx % cardHoverEffects.length]} variants={cardEntranceVariants[idx % cardEntranceVariants.length]} onClick={() => handleOpenBookingModal(service)} style={{ cursor: 'pointer' }}>
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
                                  
                                  {/* Review Section */}
                                  <div 
                                    className="service-rating clickable-review" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReviewModal(service);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="stars">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < Math.floor(service.rating || 4.2) ? '#fbbf24' : '#e5e7eb'} color="#fbbf24" />
                                      ))}
                                    </div>
                                    <span className="rating-text">{(service.rating || 4.2).toFixed(1)} ({service.review_count || Math.floor(Math.random() * 50) + 10} reviews)</span>
                                    <span className="review-hint">Click to review</span>
                                  </div>
                              </div>
                                <div className="deal-actions">
                                  <button 
                                    className={`deal-btn ${isInCart(service.id) ? 'deal-btn-carted' : 'deal-btn-primary'}`} 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (cartLoading) return;
                                      isInCart(service.id) ? removeFromCart(service.id) : addToCart(service); 
                                    }}
                                    disabled={cartLoading}
                                  >
                                    <ShoppingCart size={16} />
                                    {cartLoading ? 'Loading...' : (isInCart(service.id) ? 'In Cart' : 'Add to Cart')}
                              </button>
                                  <button 
                                    className={`deal-btn ${isInWishlist(service.id) ? 'deal-btn-liked' : 'deal-btn-secondary'}`} 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (wishlistLoading) return;
                                      toggleWishlist(service); 
                                    }}
                                    disabled={wishlistLoading}
                                  >
                                    <Heart size={16} fill={isInWishlist(service.id) ? 'currentColor' : 'none'} />
                                    {wishlistLoading ? 'Loading...' : (isInWishlist(service.id) ? 'Liked' : 'Like')}
                                  </button>
                                  <button className="deal-btn deal-btn-book" onClick={() => handleOpenBookingModal(service)}>
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

                  {/* Selected Category Services: only render after a category click */}
                  {selectedCategory && (
                    <div id="selected-category-services" className="services-by-category-section full-bleed">
                      <div className="section-header">
                        <h3>{selectedCategory.name} Services</h3>
                        <button className="view-all-btn" onClick={() => {
                          setSelectedCategory(null);
                          setViewingCategory(null);
                          setSearchQuery('');
                          navigate('/dashboard/customer');
                          // Scroll to categories section after navigation
                          setTimeout(() => {
                            document.querySelector('.marketplace-categories')?.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'start' 
                            });
                          }, 100);
                        }}>Back to Categories</button>
                      </div>
                      <div className="deals-grid">
                        {selectedCategory.services.map((service, idx) => {
                          const hasOffer = service.offer_enabled && service.offer_price;
                          const discount = hasOffer && service.price ? Math.round(((service.price - service.offer_price) / service.price) * 100) : 0;
                          return (
                            <motion.div key={service.id} className="deal-card" whileHover={cardHoverEffects[idx % cardHoverEffects.length]} variants={cardEntranceVariants[idx % cardEntranceVariants.length]} onClick={() => handleOpenBookingModal(service)} style={{ cursor: 'pointer' }}>
                              {hasOffer && discount > 0 && (<div className="deal-badge">{discount}% OFF</div>)}
                              <div className="deal-image">
                                {service.icon_url ? (
                                  <img src={service.icon_url} alt={service.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
                                ) : null}
                                <Settings size={60} style={{ display: service.icon_url ? 'none' : 'block' }} />
                              </div>
                              <div className="deal-content">
                                <h4>{service.name}</h4>
                                {service.description && (
                                  <p className="service-description">{service.description.slice(0, 80)}...</p>
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
                                
                                {/* Review Section */}
                                <div 
                                  className="service-rating clickable-review" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenReviewModal(service);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={14} fill={i < Math.floor(service.rating || 4.2) ? '#fbbf24' : '#e5e7eb'} color="#fbbf24" />
                                    ))}
                                  </div>
                                  <span className="rating-text">{(service.rating || 4.2).toFixed(1)} ({service.review_count || Math.floor(Math.random() * 50) + 10} reviews)</span>
                                  <span className="review-hint">Click to review</span>
                                </div>
                              </div>
                              <div className="deal-actions">
                                <button 
                                  className={`deal-btn ${isInCart(service.id) ? 'deal-btn-carted' : 'deal-btn-primary'}`} 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (cartLoading) return;
                                    isInCart(service.id) ? removeFromCart(service.id) : addToCart(service); 
                                  }}
                                  disabled={cartLoading}
                                >
                                  <ShoppingCart size={16} />
                                  {cartLoading ? 'Loading...' : (isInCart(service.id) ? 'In Cart' : 'Add to Cart')}
                                </button>
                                <button 
                                  className={`deal-btn ${isInWishlist(service.id) ? 'deal-btn-liked' : 'deal-btn-secondary'}`} 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (wishlistLoading) return;
                                    toggleWishlist(service); 
                                  }}
                                  disabled={wishlistLoading}
                                >
                                  <Heart size={16} fill={isInWishlist(service.id) ? 'currentColor' : 'none'} />
                                  {wishlistLoading ? 'Loading...' : (isInWishlist(service.id) ? 'Liked' : 'Like')}
                                </button>
                                <button className="deal-btn deal-btn-book" onClick={() => handleOpenBookingModal(service)}>
                                  <Calendar size={16} />Book Now
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                  {/* Professional Categories Header */}
                  <div className="categories-header" style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '20px',
                    padding: '3rem 2rem',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-20%',
                      width: '200px',
                      height: '200px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      zIndex: 1
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-30%',
                      left: '-10%',
                      width: '150px',
                      height: '150px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '50%',
                      zIndex: 1
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div className="categories-hero" style={{
                        textAlign: 'center',
                        marginBottom: '2rem'
                      }}>
                        <h1 style={{
                          fontSize: '2.5rem',
                          fontWeight: '800',
                          color: 'white',
                          margin: '0 0 1rem 0',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          Service Categories
                        </h1>
                        <p style={{
                          fontSize: '1.125rem',
                          color: 'rgba(255, 255, 255, 0.9)',
                          margin: '0',
                          fontWeight: '400'
                        }}>
                          Discover professional services tailored to your needs
                        </p>
                    </div>
                      
                      <div className="categories-search-bar" style={{
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <div className="search-container" style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'white',
                          borderRadius: '50px',
                          padding: '0.5rem',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                          maxWidth: '500px',
                          width: '100%'
                        }}>
                          <div style={{
                            padding: '0.75rem',
                            color: '#64748b'
                          }}>
                        <Search size={20} />
                          </div>
                          <input
                            type="text"
                            placeholder="Search categories and services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="categories-search-input"
                            style={{
                              flex: 1,
                              border: 'none',
                              outline: 'none',
                              fontSize: '1rem',
                              padding: '0.5rem 0',
                              background: 'transparent',
                              color: '#1e293b',
                              fontWeight: '500'
                            }}
                          />
                          <button style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '0.75rem 1.5rem',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}>
                          Search
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Services View */}
                  {viewingCategory ? (
                    <div className="category-services-view">
                      <div className="category-services-header">
                        <button 
                          className="back-to-categories-btn"
                          onClick={handleBackToCategories}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            border: 'none',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            color: '#475569',
                            cursor: 'pointer',
                            marginBottom: '2rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <ArrowLeft size={16} />
                          Back to Categories
                        </button>
                        
                        <div className="category-header-info" style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          borderRadius: '20px',
                          padding: '2.5rem',
                          marginBottom: '2rem',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-20%',
                            width: '150px',
                            height: '150px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            zIndex: 1
                          }} />
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            position: 'relative',
                            zIndex: 2
                          }}>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '20px',
                              background: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              backdropFilter: 'blur(10px)'
                            }}>
                              {viewingCategory.imageUrl ? (
                                <img
                                  src={viewingCategory.imageUrl}
                                  alt={`${viewingCategory.name} icon`}
                                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 16 }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                (viewingCategory.id === '__all__' ? AllServicesIcon : viewingCategory.icon)({ size: 60, color: 'white' })
                              )}
                            </div>
                            <div>
                              <h1 style={{ 
                                margin: '0 0 0.5rem 0', 
                                fontSize: '2rem', 
                                fontWeight: '800', 
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                {viewingCategory.name}
                              </h1>
                              <p style={{ 
                                margin: '0', 
                                color: 'rgba(255, 255, 255, 0.9)', 
                                fontSize: '1.125rem',
                                fontWeight: '500'
                              }}>
                                {viewingCategory.services.length} professional services available
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Category Services Search */}
                      <div className="category-services-search" style={{
                        marginTop: '2rem',
                        marginBottom: '2rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0',
                          padding: '0',
                          backgroundColor: '#fff',
                          border: '2px solid #e2e8f0',
                          borderRadius: '16px',
                          maxWidth: '500px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.3s ease',
                          overflow: 'hidden'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                        }}>
                          <div style={{
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            flex: 1
                          }}>
                            <Search size={20} color="#64748b" />
                          <input
                            type="text"
                              placeholder="Search professional services, providers, or specialties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                              border: 'none',
                              outline: 'none',
                              flex: 1,
                                fontSize: '0.95rem',
                              color: '#1e293b',
                                fontWeight: '500',
                                backgroundColor: 'transparent'
                            }}
                          />
                        </div>
                          {searchQuery.trim() && (
                            <button
                              onClick={() => setSearchQuery('')}
                              style={{
                                padding: '1rem 1.25rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = '#64748b';
                              }}
                            >
                              <X size={18} />
                            </button>
                          )}
                          <div style={{
                            padding: '1rem 1.25rem',
                            borderLeft: '1px solid #f1f5f9',
                            backgroundColor: '#f8fafc'
                          }}>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.75rem 1.5rem',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                              }}
                            >
                              Search
                            </button>
                          </div>
                        </div>
                        
                        {/* Search suggestions */}
                        {searchQuery.trim().length >= 2 && (
                          <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            maxWidth: '500px'
                          }}>
                            <div style={{
                              fontSize: '0.875rem',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              fontWeight: '600'
                            }}>
                              Search Suggestions
                            </div>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem'
                            }}>
                              {['Professional', 'Certified', 'Expert', 'Premium', 'Quality'].map((suggestion) => (
                                <button
                                  key={suggestion}
                                  onClick={() => setSearchQuery(suggestion)}
                                  style={{
                                    background: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '20px',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.75rem',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#3b82f6';
                                    e.target.style.color = 'white';
                                    e.target.style.borderColor = '#3b82f6';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = '#f1f5f9';
                                    e.target.style.color = '#475569';
                                    e.target.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="category-services-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.5rem',
                        marginTop: '2rem'
                      }}>
                        {(() => {
                          const filteredServices = searchQuery.trim() 
                            ? viewingCategory.services.filter(service => 
                                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
                              )
                            : viewingCategory.services;

                          return filteredServices.length === 0 ? (
                            <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                              {searchQuery 
                                ? `No services found for "${searchQuery}" in this category.`
                                : 'No services available in this category yet.'
                              }
                            </div>
                          ) : (
                            <>
                              {searchQuery && (
                                <div style={{ 
                                  marginBottom: '1rem', 
                                  color: '#64748b', 
                                  fontSize: '0.875rem' 
                                }}>
                                  Showing {filteredServices.length} of {viewingCategory.services.length} services
                                </div>
                              )}
                              {filteredServices.map((service, idx) => {
                            const hasOffer = service.offer_enabled && service.offer_price;
                            const discount = hasOffer && service.price ? 
                              Math.round(((service.price - service.offer_price) / service.price) * 100) : 0;
                            
                            return (
                              <motion.div 
                                key={service.id} 
                                className="service-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                  duration: 0.5,
                                  delay: idx * 0.1,
                                  ease: "easeOut"
                                }}
                                whileHover={{ 
                                  y: -12,
                                  scale: 1.02,
                                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                                  transition: { duration: 0.3, ease: "easeOut" }
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOpenBookingModal(service)}
                                style={{
                                  background: '#fff',
                                  borderRadius: '20px',
                                  padding: '0',
                                  border: 'none',
                                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  minHeight: '420px',
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}
                              >
                                {/* Gradient accent */}
                                <motion.div 
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
                                  style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '4px',
                                  background: hasOffer 
                                    ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                                      : 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                                    transformOrigin: 'left'
                                  }} 
                                />
                                
                                {/* Main Content */}
                                <div style={{
                                  padding: '2rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  height: '100%',
                                  gap: '1.5rem'
                                }}>
                                  {/* Header with Icon */}
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    gap: '1rem'
                                  }}>
                                    <motion.div 
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ delay: idx * 0.1 + 0.2, duration: 0.5, ease: "backOut" }}
                                      style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '20px',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '3px solid #e2e8f0',
                                        position: 'relative',
                                        overflow: 'hidden'
                                      }}
                                    >
                                        {service.icon_url ? (
                                          <img 
                                            src={service.icon_url} 
                                            alt={service.name}
                                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 12 }}
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextSibling.style.display = 'block';
                                            }}
                                          />
                                        ) : null}
                                      <Settings size={50} style={{ display: service.icon_url ? 'none' : 'block', color: '#3b82f6' }} />
                                      
                                      {/* Subtle glow effect */}
                                      <div style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        left: '-2px',
                                        right: '-2px',
                                        bottom: '-2px',
                                        background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                                        borderRadius: '22px',
                                        opacity: 0.1,
                                        zIndex: -1
                                      }} />
                                    </motion.div>

                                      <div>
                                      <motion.h3 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 + 0.4, duration: 0.4 }}
                                        style={{ 
                                          margin: '0 0 0.5rem 0', 
                                          fontSize: '1.5rem', 
                                          fontWeight: '800',
                                          color: '#1e293b',
                                          lineHeight: '1.2'
                                        }}
                                      >
                                          {service.name}
                                      </motion.h3>
                                      
                                        {service.duration && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: idx * 0.1 + 0.5, duration: 0.4 }}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            color: '#64748b', 
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                          }}
                                        >
                                          <Clock size={16} />
                                          <span>{service.duration}</span>
                                        </motion.div>
                                        )}
                                      </div>
                                  </div>
                                  
                                  {/* Description */}
                                  {service.description && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.1 + 0.6, duration: 0.4 }}
                                      style={{
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        flex: 1
                                      }}
                                    >
                                      <p style={{ 
                                        margin: '0', 
                                        color: '#475569', 
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        textAlign: 'center'
                                      }}>
                                        {service.description}
                                      </p>
                                    </motion.div>
                                  )}
                                  
                                  {/* Pricing Section */}
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.7, duration: 0.4 }}
                                    style={{
                                      textAlign: 'center',
                                      padding: '1rem',
                                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                      borderRadius: '16px',
                                      border: '1px solid #bbf7d0'
                                    }}
                                  >
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.5rem',
                                        marginBottom: '0.5rem'
                                      }}>
                                        <span style={{ 
                                        fontSize: '2rem', 
                                        fontWeight: '900', 
                                          color: '#059669'
                                        }}>
                                          ₹{hasOffer ? service.offer_price : service.price}
                                        </span>
                                        {hasOffer && service.price > service.offer_price && (
                                          <span style={{ 
                                          fontSize: '1rem', 
                                            color: '#94a3b8', 
                                            textDecoration: 'line-through',
                                            fontWeight: '500'
                                          }}>
                                            ₹{service.price}
                                          </span>
                                        )}
                                      </div>
                                    
                                    {service.duration && (
                                      <p style={{
                                        margin: '0',
                                        color: '#64748b',
                                        fontSize: '0.875rem',
                                        fontWeight: '500'
                                      }}>
                                        per {service.duration}
                                      </p>
                                    )}
                                  </motion.div>

                                  {/* Rating Section */}
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.8, duration: 0.4 }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.75rem',
                                      padding: '1rem',
                                      background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                                      borderRadius: '16px',
                                      border: '1px solid #fde68a',
                                          cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenReviewModal(service);
                                        }}
                                        onMouseEnter={(e) => {
                                      e.target.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                                      e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                      e.target.style.background = 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)';
                                      e.target.style.transform = 'translateY(0)';
                                        }}
                                      >
                                    <div style={{ display: 'flex', gap: '3px' }}>
                                          {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          size={16} 
                                          fill={i < Math.floor(service.rating || 4.2) ? '#fbbf24' : '#e5e7eb'} 
                                          color="#fbbf24" 
                                        />
                                          ))}
                                        </div>
                                        <span style={{ 
                                          fontSize: '0.875rem', 
                                      color: '#92400e', 
                                      fontWeight: '600' 
                                        }}>
                                      {(service.rating || 4.2).toFixed(1)}
                                        </span>
                                        <span style={{ 
                                          fontSize: '0.75rem', 
                                      color: '#a16207', 
                                      fontWeight: '500'
                                        }}>
                                      ({service.review_count || Math.floor(Math.random() * 50) + 10} reviews)
                                        </span>
                                  </motion.div>
                                  
                                  {/* Action Buttons */}
                                  <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.9, duration: 0.4 }}
                                    style={{
                                      display: 'flex',
                                      gap: '0.75rem',
                                      justifyContent: 'center',
                                      flexWrap: 'wrap'
                                    }}
                                  >
                                    {/* Like Button */}
                                    <motion.button 
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWishlist(service);
                                      }}
                                      style={{
                                        background: isInWishlist(service.id) 
                                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                        border: isInWishlist(service.id) 
                                          ? 'none'
                                          : '2px solid #e2e8f0',
                                        borderRadius: '16px',
                                        padding: '1rem',
                                        color: isInWishlist(service.id) ? 'white' : '#64748b',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isInWishlist(service.id) 
                                          ? '0 6px 20px rgba(239, 68, 68, 0.4)'
                                          : '0 4px 12px rgba(0, 0, 0, 0.05)',
                                        minWidth: '56px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isInWishlist(service.id)) {
                                          e.target.style.borderColor = '#ef4444';
                                          e.target.style.color = '#ef4444';
                                          e.target.style.background = '#fef2f2';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isInWishlist(service.id)) {
                                          e.target.style.borderColor = '#e2e8f0';
                                          e.target.style.color = '#64748b';
                                          e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                                        }
                                      }}
                                    >
                                      <Heart size={20} fill={isInWishlist(service.id) ? 'currentColor' : 'none'} />
                                    </motion.button>

                                    {/* Add to Cart Button */}
                                    <motion.button 
                                      whileHover={{ scale: 1.05, y: -2 }}
                                      whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          isInCart(service.id) ? removeFromCart(service.id) : addToCart(service);
                                        }}
                                        style={{
                                          background: isInCart(service.id) 
                                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                          border: 'none',
                                        borderRadius: '16px',
                                        padding: '1rem 1.5rem',
                                          color: 'white',
                                        fontWeight: '700',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                          boxShadow: isInCart(service.id) 
                                          ? '0 6px 20px rgba(5, 150, 105, 0.4)'
                                          : '0 6px 20px rgba(59, 130, 246, 0.4)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      <ShoppingCart size={18} />
                                      <span>{isInCart(service.id) ? 'In Cart' : 'Cart'}</span>
                                    </motion.button>

                                    {/* Book Now Button */}
                                    <motion.button 
                                      whileHover={{ scale: 1.05, y: -2 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenBookingModal(service);
                                      }}
                                      style={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '1rem 1.5rem',
                                        color: 'white',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      <Calendar size={18} />
                                      <span>Book Now</span>
                                    </motion.button>
                                  </motion.div>
                                </div>
                              </motion.div>
                            );
                              })
                              }
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    /* All Categories Grid */
                  <div className="all-categories">
                      <h2>
                        Browse All Categories
                        {searchQuery && (
                          <span style={{ fontSize: '0.9em', fontWeight: 'normal', color: '#64748b', marginLeft: '0.5rem' }}>
                            ({filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found)
                          </span>
                        )}
                      </h2>
                      {servicesLoading ? (
                        <div className="loading-placeholder" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                          Loading categories and services...
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                          {searchQuery ? `No categories found for "${searchQuery}"` : 'No categories available at the moment.'}
                        </div>
                      ) : (
                        <div className="all-categories-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                          gap: '2rem',
                          marginTop: '1rem'
                        }}>
                          {filteredCategories.map((category, idx) => {
                        const IconComponent = category.id === '__all__'
                          ? AllServicesIcon
                          : category.icon;
                        return (
                          <motion.div 
                            key={category.id} 
                            className="category-item-card"
                              whileHover={{ 
                                y: -8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                transition: { duration: 0.3 }
                              }}
                            variants={cardEntranceVariants[idx % cardEntranceVariants.length]}
                              onClick={() => handleCategoryClick(category)}
                              style={{ 
                                cursor: 'pointer',
                                background: 'white',
                                borderRadius: '20px',
                                padding: '2rem',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Gradient overlay */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #0ea5e9 100%)'
                              }} />
                              
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                gap: '1.5rem'
                              }}>
                                {/* Header with icon and title */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1rem'
                                }}>
                                  <div style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #e2e8f0'
                                  }}>
                              {category.imageUrl ? (
                                <img
                                  src={category.imageUrl}
                                  alt={`${category.name} icon`}
                                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 12 }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                      <IconComponent size={40} color="#3b82f6" />
                              )}
                            </div>
                                  <div>
                                    <h3 style={{
                                      margin: '0 0 0.25rem 0',
                                      fontSize: '1.5rem',
                                      fontWeight: '700',
                                      color: '#1e293b',
                                      lineHeight: '1.2'
                                    }}>
                                      {category.name}
                                    </h3>
                                    <p style={{
                                      margin: '0',
                                      color: '#64748b',
                                      fontSize: '0.875rem',
                                      fontWeight: '500'
                                    }}>
                                      {category.services.length} services available
                                    </p>
                                  </div>
                                </div>

                                {/* Services preview */}
                                <div style={{
                                  flex: 1
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    marginBottom: '1rem'
                                  }}>
                                    {category.services.slice(0, 3).map((service, idx) => (
                                      <span key={idx} style={{
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        border: '1px solid #e2e8f0'
                                      }}>
                                        {service.name}
                                      </span>
                                    ))}
                                    {category.services.length > 3 && (
                                      <span style={{
                                        background: '#dbeafe',
                                        color: '#1d4ed8',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        border: '1px solid #93c5fd'
                                      }}>
                                        +{category.services.length - 3} more
                                      </span>
                                    )}
                              </div>
                                </div>

                                {/* Pricing and actions */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingTop: '1rem',
                                  borderTop: '1px solid #f1f5f9'
                                }}>
                                  <div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      gap: '0.5rem'
                                    }}>
                                      <span style={{
                                        color: '#64748b',
                                        fontSize: '0.875rem',
                                        fontWeight: '500'
                                      }}>
                                        From
                                      </span>
                                      <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '800',
                                        color: '#059669'
                                      }}>
                                   ₹{category.services.length > 0 ? 
                                     Math.min(...category.services.map(s => s.offer_enabled && s.offer_price ? s.offer_price : s.price).filter(p => p > 0)) : 
                                     500
                                   }
                                 </span>
                                    </div>
                                {category.services.some(s => s.offer_enabled) && (
                                      <div style={{
                                        marginTop: '0.25rem'
                                      }}>
                                        <span style={{
                                          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                          color: 'white',
                                          padding: '0.25rem 0.5rem',
                                          borderRadius: '6px',
                                          fontSize: '0.75rem',
                                          fontWeight: '600'
                                        }}>
                                          Special Offers
                                        </span>
                                      </div>
                                )}
                              </div>
                                  
                                  <div style={{
                                    display: 'flex',
                                    gap: '0.5rem'
                                  }}>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick(category);
                                      }}
                                      style={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '0.75rem 1.5rem',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                                      }}
                                    >
                                      Explore
                                    </button>
                                  </div>
                                </div>
                            </div>
                          </motion.div>
                        );
                        })
                      }
                    </div>
                      )}
                  </div>
                  )}

                  {/* Popular Services */}
                  {!viewingCategory && (
                    <div className="popular-services" style={{
                      marginTop: '3rem',
                      padding: '2rem 0'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        marginBottom: '2rem'
                      }}>
                        <h2 style={{
                          fontSize: '2rem',
                          fontWeight: '800',
                          color: '#1e293b',
                          margin: '0 0 0.5rem 0'
                        }}>
                          Popular Services
                        </h2>
                        <p style={{
                          fontSize: '1rem',
                          color: '#64748b',
                          margin: '0'
                        }}>
                          Most booked services by our customers
                        </p>
                      </div>
                    <div className="popular-services-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '2rem',
                      marginTop: '2rem',
                      padding: '0 1rem'
                    }}>
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
                              whileHover={{ 
                                y: -8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                transition: { duration: 0.3 }
                              }}
                              onClick={() => handleOpenBookingModal(service)}
                              variants={itemVariants}
                              style={{
                                background: '#fff',
                                borderRadius: '16px',
                                padding: '2rem',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer'
                              }}
                            >
                              {/* Gradient accent */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                              }} />
                              
                              {/* Badge */}
                              <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                color: 'white',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                zIndex: 2
                              }}>
                                {badge}
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                gap: '1.5rem'
                              }}>
                                {/* Header with icon and title */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1rem',
                                  marginTop: '2rem'
                                }}>
                                  <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #e2e8f0'
                                  }}>
                                    {service.icon_url ? (
                                      <img 
                                        src={service.icon_url} 
                                        alt={service.name}
                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextSibling.style.display = 'block';
                                        }}
                                      />
                                    ) : null}
                                    <Settings size={40} style={{ display: service.icon_url ? 'none' : 'block', color: '#3b82f6' }} />
                                  </div>
                                  <div>
                                    <h4 style={{
                                      margin: '0 0 0.25rem 0',
                                      fontSize: '1.25rem',
                                      fontWeight: '700',
                                      color: '#1e293b',
                                      lineHeight: '1.3'
                                    }}>
                                      {service.name}
                                    </h4>
                                    <p style={{
                                      margin: '0',
                                      color: '#64748b',
                                      fontSize: '0.875rem',
                                      fontWeight: '500'
                                    }}>
                                      {service.category_name || service.category || 'Services'}
                                    </p>
                                  </div>
                                </div>

                                {/* Description */}
                                {service.description && (
                                  <div style={{
                                    background: '#f8fafc',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    flex: 1
                                  }}>
                                    <p style={{ 
                                      margin: '0', 
                                      color: '#475569', 
                                      fontSize: '0.875rem',
                                      lineHeight: '1.6'
                                    }}>
                                      {service.description}
                                    </p>
                                  </div>
                                )}

                                {/* Pricing and Actions */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingTop: '1rem',
                                  borderTop: '1px solid #f1f5f9',
                                  marginTop: 'auto'
                                }}>
                                  <div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      gap: '0.75rem',
                                      marginBottom: '0.5rem'
                                    }}>
                                      <span style={{ 
                                        fontSize: '1.5rem', 
                                        fontWeight: '800', 
                                        color: '#059669'
                                      }}>
                                        ₹{hasOffer ? service.offer_price : service.price}
                                      </span>
                                      {hasOffer && service.price > service.offer_price && (
                                        <span style={{ 
                                          fontSize: '1rem', 
                                          color: '#94a3b8', 
                                          textDecoration: 'line-through',
                                          fontWeight: '500'
                                        }}>
                                          ₹{service.price}
                                        </span>
                                      )}
                                    </div>
                                    {service.duration && (
                                      <p style={{
                                        margin: '0',
                                        color: '#64748b',
                                        fontSize: '0.875rem'
                                      }}>
                                        per {service.duration}
                                      </p>
                                    )}
                                    
                                    {/* Review Section */}
                                    <div 
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginTop: '0.75rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        transition: 'background-color 0.2s ease'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenReviewModal(service);
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                      }}
                                    >
                                      <div style={{ display: 'flex', gap: '2px' }}>
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} size={14} fill={i < Math.floor(service.rating || 4.2) ? '#fbbf24' : '#e5e7eb'} color="#fbbf24" />
                                        ))}
                                      </div>
                                      <span style={{ 
                                        fontSize: '0.875rem', 
                                        color: '#64748b', 
                                        fontWeight: '500' 
                                      }}>
                                        {(service.rating || 4.2).toFixed(1)} ({service.review_count || Math.floor(Math.random() * 50) + 10} reviews)
                                      </span>
                                      <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#3b82f6', 
                                        fontWeight: '500',
                                        marginLeft: '0.5rem'
                                      }}>
                                        Click to review
                                      </span>
                                    </div>
                                    
                                    {hasOffer && (
                                      <div style={{
                                        marginTop: '0.25rem'
                                      }}>
                                        <span style={{
                                          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                          color: 'white',
                                          padding: '0.25rem 0.5rem',
                                          borderRadius: '6px',
                                          fontSize: '0.75rem',
                                          fontWeight: '600',
                                          display: 'inline-block'
                                        }}>
                                          Save ₹{service.price - service.offer_price}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                gap: '0.75rem',
                                marginTop: '1rem',
                                flexWrap: 'wrap'
                              }}>
                                {/* Like Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist(service);
                                  }}
                                  style={{
                                    background: isInWishlist(service.id) 
                                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    border: isInWishlist(service.id) 
                                      ? 'none'
                                      : '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '0.875rem',
                                    color: isInWishlist(service.id) ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isInWishlist(service.id) 
                                      ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    minWidth: '48px'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isInWishlist(service.id)) {
                                      e.target.style.borderColor = '#ef4444';
                                      e.target.style.color = '#ef4444';
                                      e.target.style.background = '#fef2f2';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isInWishlist(service.id)) {
                                      e.target.style.borderColor = '#e2e8f0';
                                      e.target.style.color = '#64748b';
                                      e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                                    }
                                  }}
                                >
                                  <Heart size={18} fill={isInWishlist(service.id) ? 'currentColor' : 'none'} />
                                </button>

                                {/* Add to Cart Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    isInCart(service.id) ? removeFromCart(service.id) : addToCart(service);
                                  }}
                                  style={{
                                    background: isInCart(service.id) 
                                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '0.875rem 1.25rem',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isInCart(service.id) 
                                      ? '0 4px 12px rgba(5, 150, 105, 0.4)'
                                      : '0 4px 12px rgba(59, 130, 246, 0.4)',
                                    flex: 1
                                  }}
                                >
                                  <ShoppingCart size={16} />
                                  {isInCart(service.id) ? 'In Cart' : 'Cart'}
                                </button>

                                {/* Book Now Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBookingModal(service);
                                  }}
                                  style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '0.875rem 1.5rem',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
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
                  )}
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div 
                  className="wishlist-tab enhanced-wishlist"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {/* Enhanced Wishlist Header */}
                  <div className="enhanced-section-header">
                    <div className="header-content">
                      <div className="header-icon">
                        <Heart size={32} fill="#e11d48" />
                      </div>
                      <div className="header-text">
                        <h2>My Wishlist</h2>
                    <p>Services you've saved for later</p>
                        <div className="wishlist-stats">
                          <span className="stat-item">
                            <Heart size={16} />
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Wishlist Content */}
                  <div className="enhanced-wishlist-content">
                    {wishlist.length > 0 ? (
                      <div className="wishlist-section">
                        <div className="wishlist-header">
                          <div className="wishlist-title">
                            <h3>Saved Services</h3>
                            <span className="wishlist-count">{wishlist.length} items</span>
                          </div>
                          <button 
                            className="clear-wishlist-btn-section"
                            onClick={async () => {
                              try {
                                await cartWishlistService.clearWishlist();
                                await loadWishlist();
                                toast.success('Wishlist cleared');
                              } catch (error) {
                                toast.error('Failed to clear wishlist');
                              }
                            }}
                          >
                            🗑️ Clear All
                          </button>
                        </div>
                        <div className="wishlist-grid">
                        {wishlist.map((item, index) => {
                        const hasOffer = item.offer_enabled && item.offer_price;
                        const discount = hasOffer && item.price ? 
                          Math.round(((item.price - item.offer_price) / item.price) * 100) : 0;
                          
                        return (
                          <motion.div 
                            key={item.id} 
                              className="enhanced-wishlist-card"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ 
                                y: -8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                transition: { duration: 0.3 }
                              }}
                            >
                              {/* Card Header */}
                              <div className="card-header">
                            {hasOffer && discount > 0 && (
                                  <div className="discount-badge">
                                    <span>{discount}% OFF</span>
                                  </div>
                                )}
                                <div className="card-actions">
                                  <button 
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '36px',
                                      height: '36px',
                                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '10px',
                                      cursor: 'pointer',
                                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                    }}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (wishlistLoading) return;
                                      toggleWishlist(item); 
                                    }}
                                    disabled={wishlistLoading}
                                    title="Remove from wishlist"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>

                              {/* Service Image */}
                              <div className="service-image-container">
                                {/* Fallback icon */}
                                <div className="fallback-icon">
                                  ⚙️
                                </div>
                                
                                {/* Actual service image */}
                                {item.icon_url && item.icon_url.trim() !== '' && (
                                  <img 
                                    src={item.icon_url} 
                                    alt={item.name}
                                    className="service-image"
                                    onError={(e) => {
                                      console.log('Wishlist image failed to load:', item.icon_url);
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.previousSibling.style.display = 'flex';
                                    }}
                                    onLoad={(e) => {
                                      console.log('Wishlist image loaded successfully:', item.icon_url);
                                      e.currentTarget.style.display = 'block';
                                      e.currentTarget.previousSibling.style.display = 'none';
                                      e.currentTarget.classList.add('loaded');
                                    }}
                                  />
                                )}
                              </div>

                              {/* Service Details */}
                              <div className="service-details">
                                <div className="service-category">
                                  <span className="category-badge">{item.category_name || item.category}</span>
                                </div>
                                
                                <h3 className="service-title">{item.name}</h3>
                                
                              {item.description && (
                                  <p className="service-description">
                                    {item.description.length > 80 
                                      ? `${item.description.slice(0, 80)}...` 
                                      : item.description
                                    }
                                  </p>
                                )}

                                {/* Service Meta */}
                                <div className="service-meta">
                                  {item.duration && (
                                    <div className="meta-item">
                                      <Clock size={14} />
                                      <span>{item.duration}</span>
                                    </div>
                                  )}
                                  
                                  <div className="rating-item">
                                    <div className="stars">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          size={12} 
                                          fill={i < Math.floor(item.rating || 4.2) ? '#fbbf24' : '#e5e7eb'} 
                                          color="#fbbf24" 
                                        />
                                      ))}
                                    </div>
                                    <span className="rating-text">
                                      {(item.rating || 4.2).toFixed(1)} ({item.review_count || Math.floor(Math.random() * 50) + 10})
                                    </span>
                                  </div>
                                </div>

                                {/* Pricing */}
                                <div className="pricing-section">
                              <div className="price-row">
                                    <span className="current-price">
                                      ₹{hasOffer ? item.offer_price : item.price}
                                    </span>
                                {hasOffer && item.price > item.offer_price && (
                                  <span className="original-price">₹{item.price}</span>
                                )}
                              </div>
                              {item.duration && (
                                    <div className="price-unit">per {item.duration}</div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="card-actions-bottom">
                                <button 
                                  className={`action-btn-primary ${isInCart(item.id) ? 'in-cart' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cartLoading) return;
                                    isInCart(item.id) ? removeFromCart(item.id) : addToCart(item); 
                                  }}
                                  disabled={cartLoading}
                                >
                                  <ShoppingCart size={16} color="currentColor" />
                                  {cartLoading ? 'Loading...' : (isInCart(item.id) ? 'In Cart' : 'Add to Cart')}
                                </button>
                                
                                <button 
                                  className="action-btn-secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBookingModal(item);
                                  }}
                                >
                                  <Calendar size={16} color="currentColor" />
                                  Book Now
                                </button>
                            </div>
                          </motion.div>
                        );
                        })}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <Heart size={64} fill="#e5e7eb" />
                        </div>
                        <h3>Your wishlist is empty</h3>
                        <p>Start exploring services and add them to your wishlist for easy access later.</p>
                        <button 
                          className="explore-btn"
                          onClick={() => setActiveTab('home')}
                        >
                          <Search size={16} />
                          Explore Services
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'cart' && (
                <motion.div 
                  className="cart-tab enhanced-cart"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {/* Enhanced Cart Header */}
                  <div className="enhanced-section-header">
                    <div className="header-content">
                      <div className="header-icon">
                        <ShoppingCart size={32} fill="#3b82f6" />
                      </div>
                      <div className="header-text">
                        <h2>Shopping Cart</h2>
                    <p>Review your selected services</p>
                        <div className="cart-stats">
                          <span className="stat-item">
                            <ShoppingCart size={16} />
                            {cart.length} {cart.length === 1 ? 'item' : 'items'}
                          </span>
                          <span className="stat-item">
                            <IndianRupee size={16} />
                            ₹{cart.reduce((sum, item) => {
                              const hasOffer = item.offer_enabled && item.offer_price;
                              const price = hasOffer ? item.offer_price : item.price;
                              return sum + (price * item.quantity);
                            }, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Cart Content */}
                  <div className="enhanced-cart-content">
                      {cart.length > 0 ? (
                      <div className="cart-layout">
                        {/* Cart Items */}
                        <div className="cart-items-section">
                          <div className="section-title">
                            <div className="title-left">
                              <h3>Selected Services</h3>
                              <span className="item-count">{cart.length} items</span>
                            </div>
                            <button 
                              className="clear-cart-btn-section"
                              onClick={async () => {
                                try {
                                  await cartWishlistService.clearCart();
                                  await loadCart();
                                  toast.success('Cart cleared');
                                } catch (error) {
                                  toast.error('Failed to clear cart');
                                }
                              }}
                            >
                              🗑️ Clear All
                            </button>
                          </div>
                          
                          <div className="cart-items-list">
                            {cart.map((item, index) => {
                          const hasOffer = item.offer_enabled && item.offer_price;
                          const discount = hasOffer && item.price ? 
                            Math.round(((item.price - item.offer_price) / item.price) * 100) : 0;
                              
                          return (
                          <motion.div 
                            key={item.id} 
                                  className="enhanced-cart-item"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ 
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                    transition: { duration: 0.3 }
                                  }}
                                >
                                  {/* Item Header */}
                                  <div className="item-header">
                              {hasOffer && discount > 0 && (
                                      <div className="discount-badge">
                                        <span>{discount}% OFF</span>
                                      </div>
                                    )}
                                    <button 
                                      className="remove-item-btn"
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (cartLoading) return;
                                        removeFromCart(item.id); 
                                      }}
                                      disabled={cartLoading}
                                      title="Remove from cart"
                                    >
                                      🗑️
                                    </button>
                                  </div>

                                  {/* Item Content */}
                                  <div className="item-content">
                                    {/* Service Image */}
                                    <div className="item-image">
                                      {/* Fallback icon */}
                                      <div className="fallback-icon">
                                        ⚙️
                                      </div>
                                      
                                      {/* Actual service image */}
                                      {item.icon_url && item.icon_url.trim() !== '' && (
                                        <img 
                                          src={item.icon_url} 
                                          alt={item.name}
                                          className="service-image"
                                          onError={(e) => {
                                            console.log('Cart image failed to load:', item.icon_url);
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.previousSibling.style.display = 'flex';
                                          }}
                                          onLoad={(e) => {
                                            console.log('Cart image loaded successfully:', item.icon_url);
                                            e.currentTarget.style.display = 'block';
                                            e.currentTarget.previousSibling.style.display = 'none';
                                            e.currentTarget.classList.add('loaded');
                                          }}
                                        />
                                      )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="item-details">
                                      <div className="item-category">
                                        <span className="category-badge">{item.category_name || item.category}</span>
                                      </div>
                                      
                                      <h4 className="item-title">{item.name}</h4>
                                      
                                {item.description && (
                                        <p className="item-description">
                                          {item.description.length > 60 
                                            ? `${item.description.slice(0, 60)}...` 
                                            : item.description
                                          }
                                        </p>
                                      )}

                                      {/* Item Meta */}
                                      <div className="item-meta">
                                {item.duration && (
                                          <div className="meta-item">
                                    <Clock size={12} />
                                    <span>{item.duration}</span>
                                </div>
                                )}
                                        
                                        <div className="rating-item">
                                  <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                size={10} 
                                                fill={i < Math.floor(item.rating || 4.2) ? '#fbbf24' : '#e5e7eb'} 
                                                color="#fbbf24" 
                                              />
                                    ))}
                                  </div>
                                          <span className="rating-text">
                                            {(item.rating || 4.2).toFixed(1)}
                                          </span>
                                </div>
                              </div>
                                    </div>

                                    {/* Item Actions & Pricing */}
                                    <div className="item-actions-pricing">
                                      {/* Quantity Controls */}
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '0.5rem',
                                        border: '2px solid #e2e8f0',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                                      }}>
                                        <button 
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            color: 'white',
                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                                            fontSize: '18px',
                                            fontWeight: 'bold'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.quantity > 1) {
                                              updateCartItemQuantity(item.cartItemId, item.quantity - 1);
                                            }
                                          }}
                                          disabled={cartLoading || item.quantity <= 1}
                                        >
                                          −
                                        </button>
                                        <span style={{
                                          fontWeight: 700,
                                          color: '#1e293b',
                                          minWidth: '24px',
                                          textAlign: 'center',
                                          fontSize: '1rem',
                                          padding: '0.25rem'
                                        }}>
                                          {item.quantity}
                                        </span>
                                        <button 
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            color: 'white',
                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                                            fontSize: '18px',
                                            fontWeight: 'bold'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateCartItemQuantity(item.cartItemId, item.quantity + 1);
                                          }}
                                          disabled={cartLoading}
                                        >
                                          +
                                        </button>
                                      </div>

                                      {/* Pricing */}
                                      <div className="item-pricing">
                                        <div className="price-row">
                                          <span className="current-price">
                                            ₹{hasOffer ? item.offer_price : item.price}
                                          </span>
                                          {hasOffer && item.price > item.offer_price && (
                                            <span className="original-price">₹{item.price}</span>
                                          )}
                                        </div>
                                        <div className="total-price">
                                          Total: ₹{((hasOffer ? item.offer_price : item.price) * item.quantity)}
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="item-action-buttons">
                                        <button 
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            background: isInWishlist(item.id) 
                                              ? 'linear-gradient(135deg, #dc2626, #b91c1c)' 
                                              : 'linear-gradient(135deg, #fecaca, #fca5a5)',
                                            color: isInWishlist(item.id) ? 'white' : '#dc2626',
                                            border: 'none',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                            fontSize: '16px'
                                          }}
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (wishlistLoading) return;
                                            toggleWishlist(item); 
                                          }}
                                          disabled={wishlistLoading}
                                          title={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                        >
                                          {isInWishlist(item.id) ? '❤️' : '🤍'}
                                        </button>
                                        
                                        <button 
                                          className="book-now-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenBookingModal(item);
                                          }}
                                        >
                                          <Calendar size={14} color="currentColor" />
                                          Book Now
                                        </button>
                                      </div>
                                    </div>
                              </div>
                            </motion.div>
                          );
                            })}
                        </div>
                    </div>

                        {/* Order Summary */}
                        <div className="order-summary-section">
                          <div className="summary-card">
                            <div className="summary-header">
                              <h3>Order Summary</h3>
                            </div>
                            
                            <div className="summary-content">
                       <div className="summary-row">
                                <span>Subtotal ({cart.length} items):</span>
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
                              
                              <div className="summary-row">
                                <span>Tax (GST):</span>
                                <span>₹{Math.round((cart.reduce((sum, item) => {
                                  const hasOffer = item.offer_enabled && item.offer_price;
                                  const price = hasOffer ? item.offer_price : item.price;
                                  return sum + (price * item.quantity);
                                }, 0) + 50) * 0.18)}</span>
                              </div>
                              
                              <div className="summary-divider"></div>
                              
                              <div className="summary-row total-row">
                         <span>Total:</span>
                                <span>₹{Math.round((cart.reduce((sum, item) => {
                           const hasOffer = item.offer_enabled && item.offer_price;
                           const price = hasOffer ? item.offer_price : item.price;
                           return sum + (price * item.quantity);
                                }, 0) + 50) * 1.18)}</span>
                       </div>
                            </div>
                            
                            <div className="summary-actions">
                              <button 
                                className="checkout-btn-primary"
                                onClick={() => {
                        if (cart.length === 0) {
                          toast.error('Your cart is empty');
                          return;
                        }
                        // Navigate to booking page with cart items
                        navigate('/booking', { 
                          state: { 
                            cartItems: cart,
                            user: user,
                            isMultiService: true
                          } 
                        });
                                }}
                              >
                                <CreditCard size={16} />
                        Proceed to Checkout
                      </button>
                              
                              <button 
                                className="continue-shopping-btn"
                                onClick={() => setActiveTab('home')}
                              >
                                <ArrowLeft size={16} />
                                Continue Shopping
                              </button>
                    </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <ShoppingCart size={64} fill="#e5e7eb" />
                        </div>
                        <h3>Your cart is empty</h3>
                        <p>Add some services to your cart to get started with your booking.</p>
                        <button 
                          className="explore-btn"
                          onClick={() => setActiveTab('home')}
                        >
                          <Search size={16} />
                          Explore Services
                        </button>
                      </div>
                    )}
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
                  className="orders-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="orders-header">
                    <div className="orders-header-content">
                      <div className="orders-title-section">
                        <h3>Your Orders</h3>
                        <p>Track and manage your service bookings</p>
                      </div>
                      <div className="orders-filter-section">
                        <select 
                          value={ordersFilter} 
                          onChange={(e) => setOrdersFilter(e.target.value)}
                          className="orders-filter-select"
                        >
                          <option value="all">All Orders</option>
                          <option value="last30days">Last 30 Days</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Stats Cards */}
                    {!ordersLoading && orders.length > 0 && (
                      <div className="orders-stats-grid">
                        <motion.div 
                          className="stat-card total-orders"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="stat-icon">
                            <Receipt size={24} />
                          </div>
                          <div className="stat-content">
                            <span className="stat-number">{getOrderStats().total}</span>
                            <span className="stat-label">Total Orders</span>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="stat-card completed-orders"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="stat-icon">
                            <CheckCircle size={24} />
                          </div>
                          <div className="stat-content">
                            <span className="stat-number">{getOrderStats().completed}</span>
                            <span className="stat-label">Completed</span>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="stat-card pending-orders"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="stat-icon">
                            <Clock size={24} />
                          </div>
                          <div className="stat-content">
                            <span className="stat-number">{getOrderStats().pending}</span>
                            <span className="stat-label">Pending</span>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="stat-card total-spent"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="stat-icon">
                            <IndianRupee size={24} />
                          </div>
                          <div className="stat-content">
                            <span className="stat-number">₹{getOrderStats().totalAmount.toLocaleString('en-IN')}</span>
                            <span className="stat-label">Total Spent</span>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>

                  <div className="orders-content">
                    {ordersLoading ? (
                      <div className="orders-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading your orders...</span>
                      </div>
                    ) : getFilteredOrders().length === 0 ? (
                      <div className="orders-empty">
                        <Receipt size={64} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
                        <h4>No orders found</h4>
                        <p>
                          {ordersFilter === 'all' 
                            ? 'Your service bookings will appear here once you make your first booking.'
                            : `No orders found for the selected filter: ${ordersFilter.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                          }
                        </p>
                        <button 
                          className="btn-primary" 
                          onClick={() => setActiveTab('categories')}
                          style={{ marginTop: '1.5rem' }}
                        >
                          <Plus size={16} />
                          Browse Services
                        </button>
                      </div>
                    ) : (
                      <div className="orders-grid">
                        {getFilteredOrders().map((order, index) => (
                          <motion.div 
                            key={order.id} 
                            className={`order-card ${viewedOrderId === order.id ? 'viewed' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                          >
                            {/* Order Card Header with Gradient */}
                            <div className="order-card-header">
                              <div className="order-header-content">
                                <div className="order-id-section">
                                  <div className="order-id-wrapper">
                                    <div className="order-priority-indicator">
                                      <div className="priority-dot"></div>
                                    </div>
                                  </div>
                                  <div className="order-date-info">
                                    <Calendar size={14} />
                                    <span className="order-date">
                                      {new Date(order.date).toLocaleDateString('en-IN', { 
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <div className="order-status-section">
                                  <div 
                                    className={`order-status-badge ${
                                      order.bookingStatus === 'confirmed' ? 'confirmed' :
                                      order.bookingStatus === 'pending' ? 'pending' :
                                      order.bookingStatus === 'completed' ? 'completed' :
                                      order.bookingStatus === 'cancelled' ? 'cancelled' : 'pending'
                                    }`}
                                  >
                                    <div className="status-indicator"></div>
                                    <span className="status-text">{order.bookingStatus || 'pending'}</span>
                                    <div className="status-glow"></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Card Body */}
                            <div className="order-card-body">
                              <div className="service-section">
                                <div className="service-icon-container">
                                  <div className="service-icon">
                                    <Package size={22} />
                                  </div>
                                  <div className="service-icon-bg"></div>
                                </div>
                                <div className="service-info">
                                  <h5 className="service-name">{order.name}</h5>
                                  <div className="service-details">
                                    <div className="detail-item">
                                      <Clock size={16} />
                                      <span>{order.time}</span>
                                    </div>
                                    <div className="detail-item">
                                      <MapPin size={16} />
                                      <span>{order.address ? order.address.split(',')[0] : 'Location not specified'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="order-meta-section">
                                <div className="amount-section">
                                  <div className="amount-label">Total Amount</div>
                                  <div className="amount-value">
                                    <IndianRupee size={18} />
                                    <span>{order.total?.toLocaleString('en-IN') || '0'}</span>
                                  </div>
                                </div>
                                <div className="payment-section">
                                  <div className="payment-label">Payment Status</div>
                                  <div 
                                    className={`payment-status ${
                                      order.paymentStatus === 'paid' ? 'paid' :
                                      order.paymentStatus === 'pending' ? 'pending' :
                                      order.paymentStatus === 'failed' ? 'failed' : 'pending'
                                    }`}
                                  >
                                    <div className="payment-indicator"></div>
                                    <span>{order.paymentStatus || 'pending'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Card Footer */}
                            <div className="order-card-footer">
                              <div className="action-buttons">
                                <button 
                                  className={`btn-details ${viewedOrderId === order.id ? 'viewed' : ''}`}
                                  onClick={() => handleViewOrderDetails(order)}
                                >
                                  <Eye size={16} />
                                  <span>View Details</span>
                                  {viewedOrderId === order.id && <div className="btn-glow"></div>}
                                </button>
                                {order.bookingStatus === 'completed' && (
                                  <button 
                                    className="btn-feedback"
                                    onClick={() => handleProvideFeedback(order)}
                                  >
                                    <MessageCircle size={16} />
                                    <span>Feedback</span>
                                  </button>
                                )}
                                {order.paymentStatus === 'pending' && (
                                  <button 
                                    className="btn-pay"
                                    onClick={() => handlePayBill(order)}
                                  >
                                    <CreditCard size={16} />
                                    <span>Pay Now</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Card Decorative Elements */}
                            <div className="card-decoration">
                              <div className="decoration-line"></div>
                              <div className="decoration-dots">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Details Modal */}
                  {isOrderDetailsOpen && selectedOrder && (
                    <motion.div 
                      className="order-details-modal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="modal-overlay" onClick={() => setIsOrderDetailsOpen(false)}></div>
                      <motion.div 
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                      >
                        <div className="modal-header">
                          <h4>Order Details</h4>
                          <button 
                            className="modal-close"
                            onClick={() => setIsOrderDetailsOpen(false)}
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="modal-body">
                          <div className="order-detail-section">
                            <h5>Order Information</h5>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <span className="detail-label">Service:</span>
                                <span className="detail-value">{selectedOrder.name}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Date:</span>
                                <span className="detail-value">
                                  {new Date(selectedOrder.date).toLocaleDateString('en-IN', { 
                                    weekday: 'long',
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Time:</span>
                                <span className="detail-value">{selectedOrder.time}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Amount:</span>
                                <span className="detail-value">₹{selectedOrder.total?.toLocaleString('en-IN') || '0'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">{selectedOrder.bookingStatus || 'pending'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Payment:</span>
                                <span className="detail-value">{selectedOrder.paymentStatus || 'pending'}</span>
                              </div>
                            </div>
                          </div>
                          {selectedOrder.address && (
                            <div className="order-detail-section">
                              <h5>Service Location</h5>
                              <div className="address-details">
                                <MapPin size={16} />
                                <span>{selectedOrder.address}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="modal-footer">
                          <button 
                            className="btn-secondary"
                            onClick={() => setIsOrderDetailsOpen(false)}
                          >
                            Close
                          </button>
                          {selectedOrder.bookingStatus === 'completed' && (
                            <button 
                              className="btn-primary"
                              onClick={() => {
                                setIsOrderDetailsOpen(false);
                                handleProvideFeedback(selectedOrder);
                              }}
                            >
                              Leave Feedback
                            </button>
                          )}
                          {selectedOrder.paymentStatus === 'pending' && (
                            <button 
                              className="btn-primary"
                              onClick={() => {
                                setIsOrderDetailsOpen(false);
                                handlePayBill(selectedOrder);
                              }}
                            >
                              Make Payment
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
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
                    <div className="modal-backdrop" onClick={handleClosePaymentModal}>
                      <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h4>Pay Bill - {selectedService.id}</h4>
                          <button className="close-btn" onClick={handleClosePaymentModal}>
                            <X size={20} />
                          </button>
                        </div>
                        <form className="modal-body" onSubmit={handlePaymentSubmit}>
                          <div className="form-group">
                            <label>Service</label>
                            <input type="text" value={selectedService.service || 'Service Name'} disabled />
                          </div>
                          
                          <div className="form-group">
                            <label>Amount Due</label>
                            <input type="text" value={`₹${selectedService.amount?.toFixed(2) || '0.00'}`} disabled />
                          </div>

                          <div className="form-group">
                            <label htmlFor="paymentMethod">Payment Method *</label>
                            <select 
                              id="paymentMethod" 
                              name="paymentMethod" 
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              required
                            >
                              <option value="card">💳 Credit Card (•••• 1234)</option>
                              <option value="upi">📱 UPI (user@upi)</option>
                              <option value="wallet">💰 Wallet</option>
                              <option value="netbanking">🏦 Net Banking</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor="promoCode">Apply Promo/Discount</label>
                            <input 
                              id="promoCode" 
                              name="promoCode" 
                              type="text" 
                              placeholder="Enter promo code (optional)"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                            />
                            {promoCode && (
                              <p style={{ marginTop: '8px', color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                                🎉 Promo code applied! You saved ₹50.
                              </p>
                            )}
                          </div>

                          {/* Security Notice */}
                          <div style={{ 
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            border: '2px solid #bae6fd',
                            borderRadius: '16px',
                            padding: '16px',
                            margin: '20px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <Shield size={20} color="#0284c7" />
                            <div>
                              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#0c4a6e' }}>
                                Secure Payment
                              </p>
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#0369a1' }}>
                                Your payment is protected with 256-bit SSL encryption
                              </p>
                            </div>
                          </div>

                          <div className="modal-actions">
                            <button 
                              type="button" 
                              className="btn-secondary" 
                              onClick={handleClosePaymentModal}
                              disabled={isProcessingPayment}
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              className="btn-primary"
                              disabled={isProcessingPayment}
                            >
                              {isProcessingPayment ? (
                                <>
                                  <div className="loading-spinner" />
                                  Processing...
                                </>
                              ) : (
                                `Pay ₹${selectedService.amount?.toFixed(2) || '0.00'}`
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'ai-assistant' && (
                <motion.div 
                  className="ai-assistant-tab"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="ai-assistant-header">
                    <div className="ai-header-content">
                      <div className="ai-title-section">
                        <h3>Nexus AI Assistant</h3>
                        <p>Your intelligent assistant for service-related inquiries and support</p>
                      </div>
                      <div className="ai-status-indicator">
                        <div className={`status-dot ${aiStatus}`}></div>
                        <span className="status-text">AI Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="ai-assistant-content">
                    {/* Chat Interface */}
                    <div className="ai-chat-container">
                      <div className="ai-chat-messages" ref={chatMessagesRef}>
                        {aiMessages.length === 0 ? (
                          <div className="ai-welcome-message">
                            <div className="welcome-icon">
                              <MessageCircle size={48} />
                            </div>
                            <h4>Welcome to Nexus AI Assistant</h4>
                            <p>I'm here to help you with your service needs. How can I assist you today?</p>
                          </div>
                        ) : (
                          aiMessages.map((message, index) => (
                            <div key={index} className={`ai-message ${message.role}`}>
                              <div className="message-avatar">
                                {message.role === 'user' ? (
                                  <User size={20} />
                                ) : (
                                  <MessageCircle size={20} />
                                )}
                              </div>
                              <div className="message-content">
                                {message.content && (
                                  <div className="message-text">
                                    {message.content}
                                  </div>
                                )}
                                {message.imageData && (
                                  <div className="message-image">
                                    <img 
                                      src={message.imageData} 
                                      alt="Uploaded image" 
                                      className="chat-image"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                    <div className="image-error" style={{display: 'none'}}>
                                      <span>Failed to load image</span>
                                    </div>
                                  </div>
                                )}
                                <div className="message-time">
                                  {message.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        {aiLoading && (
                          <div className="ai-message assistant">
                            <div className="message-avatar">
                              <MessageCircle size={20} />
                            </div>
                            <div className="message-content">
                              <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ai-chat-input-container">
                        {imagePreview && (
                          <div className="image-preview-container">
                            <div className="image-preview">
                              <img src={imagePreview} alt="Preview" className="preview-image" />
                              <button 
                                type="button"
                                className="remove-image-btn"
                                onClick={removeImage}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                        <form onSubmit={handleAISubmit} className="ai-chat-form">
                          <div className="ai-input-wrapper">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="ai-image-input"
                              id="ai-image-upload"
                              disabled={aiLoading}
                            />
                            <label htmlFor="ai-image-upload" className="ai-image-button">
                              <Image size={20} />
                            </label>
                            <input
                              type="text"
                              value={aiInput}
                              onChange={(e) => setAiInput(e.target.value)}
                              placeholder="Ask me anything about our services..."
                              className="ai-chat-input"
                              disabled={aiLoading}
                            />
                            <button 
                              type="submit" 
                              className="ai-send-button"
                              disabled={aiLoading || (!aiInput.trim() && !selectedImage)}
                            >
                              <Send size={20} />
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Chat Actions */}
                    <div className="ai-chat-actions">
                      <button 
                        className="ai-action-button"
                        onClick={clearAIConversation}
                        disabled={aiMessages.length === 0}
                      >
                        <RotateCcw size={16} />
                        Clear Conversation
                      </button>
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


      {/* Feedback Modal */}
      {isFeedbackModalOpen && selectedService && (
        <div className="modal-backdrop" onClick={handleCloseFeedbackModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Provide Feedback</h4>
              <button className="close-btn" onClick={handleCloseFeedbackModal}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-body" onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <label>Service Provider</label>
                <input type="text" value={selectedService.provider || 'Service Provider'} disabled />
              </div>
              
              <div className="form-group">
                <label>Service</label>
                <input type="text" value={selectedService.name || 'Service Name'} disabled />
              </div>

              <div className="form-group">
                <label>Rating *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${feedbackRating >= star ? 'active' : ''}`}
                      onClick={() => setFeedbackRating(star)}
                    >
                      <Star size={24} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                {feedbackRating > 0 && (
                  <p style={{ marginTop: '8px', color: '#667eea', fontSize: '0.9rem', fontWeight: '600' }}>
                    {feedbackRating === 1 && 'Poor'}
                    {feedbackRating === 2 && 'Fair'}
                    {feedbackRating === 3 && 'Good'}
                    {feedbackRating === 4 && 'Very Good'}
                    {feedbackRating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="feedbackText">Written Feedback</label>
                <textarea 
                  id="feedbackText" 
                  name="feedbackText" 
                  rows="4" 
                  placeholder="Share your experience with this service..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="recommend" 
                    checked={recommendProvider}
                    onChange={(e) => setRecommendProvider(e.target.checked)}
                  />
                  Would you recommend this service provider to others?
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseFeedbackModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && reviewService && (
        <div className="modal-backdrop" onClick={handleCloseReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header with gradient */}
            <div className="review-modal-header">
              <div className="header-content">
                <div className="header-icon">
                  <Star size={24} fill="#fbbf24" />
                </div>
                <div className="header-text">
                  <h4>Share Your Experience</h4>
                  <p>Help other customers make informed decisions</p>
                </div>
              </div>
              <button className="close-btn" onClick={handleCloseReviewModal}>
                <X size={20} />
              </button>
            </div>

            <form className="review-modal-body" onSubmit={handleReviewSubmit}>
              {/* Service Info Card */}
              <div className="service-info-card">
                <div className="service-icon">
                  {reviewService.icon_url ? (
                    <img src={reviewService.icon_url} alt={reviewService.name} />
                  ) : (
                    <Settings size={24} />
                  )}
                </div>
                <div className="service-details">
                  <h5>{reviewService.name}</h5>
                  <p>{reviewService.category_name || reviewService.category || 'Service'}</p>
                </div>
              </div>
              
              {/* Overall Rating Section */}
              <div className="rating-section">
                <div className="section-header">
                  <h6>Overall Rating</h6>
                  <span className="required-badge">Required</span>
                </div>
                <div className="rating-input-large">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn-large ${reviewRating >= star ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      <Star size={32} fill={reviewRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <div className="rating-feedback">
                    <span className="rating-text">{reviewRating}/5</span>
                    <span className="rating-description">
                      {reviewRating === 1 && 'Poor - Needs improvement'}
                      {reviewRating === 2 && 'Fair - Below average'}
                      {reviewRating === 3 && 'Good - Meets expectations'}
                      {reviewRating === 4 && 'Very Good - Exceeds expectations'}
                      {reviewRating === 5 && 'Excellent - Outstanding service'}
                    </span>
                  </div>
                )}
              </div>

              {/* Predefined Questions */}
              <div className="review-questions-section">
                <div className="section-header">
                  <h6>Detailed Feedback</h6>
                  <p className="section-subtitle">Help others by answering these questions</p>
                </div>
                
                <div className="questions-grid">
                  {reviewQuestions.map((question, index) => (
                    <div key={question.id} className="question-card">
                      <div className="question-header">
                        <span className="question-number">{index + 1}</span>
                        <label className="question-label">{question.question}</label>
                      </div>
                      {question.type === 'rating' ? (
                        <div className="rating-options">
                          {question.options.map((option, optionIndex) => (
                            <button
                              key={optionIndex}
                              type="button"
                              className={`rating-option ${reviewAnswers[question.id] === option ? 'selected' : ''}`}
                              onClick={() => handleReviewAnswerChange(question.id, option)}
                            >
                              <span className="option-text">{option}</span>
                              <span className="option-value">{optionIndex + 1}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="yesno-options">
                          {question.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`yesno-option ${reviewAnswers[question.id] === option ? 'selected' : ''}`}
                              onClick={() => handleReviewAnswerChange(question.id, option)}
                            >
                              {option === 'Yes' ? (
                                <CheckCircle size={16} />
                              ) : (
                                <X size={16} />
                              )}
                              <span>{option}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div className="comments-section">
                <div className="section-header">
                  <h6>Additional Comments</h6>
                  <span className="optional-badge">Optional</span>
                </div>
                <div className="textarea-container">
                  <textarea 
                    id="reviewNote" 
                    name="reviewNote" 
                    rows="4" 
                    placeholder="Share any additional thoughts about your experience, what you liked, or suggestions for improvement..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                  <div className="char-count">{reviewNote.length}/500</div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="review-modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseReviewModal}>
                  <X size={16} />
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmittingReview || reviewRating === 0}>
                  {isSubmittingReview ? (
                    <>
                      <RefreshCw size={16} className="spinning" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star size={16} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default CustomerDashboard;
