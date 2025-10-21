import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, MessageSquare, 
  CreditCard, Shield, CheckCircle, AlertCircle, Star, 
  ArrowRight, Bell, LogOut, ChevronDown, IndianRupee, Navigation
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from '../components/ToastContainer';
import LocationMap from '../components/LocationMap';
import LoadingSpinner from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';
import Logo from '../components/Logo';
import './BookingPage.css';
import './dashboards/SharedDashboard.css';

// Prefetch the dashboard route chunk to avoid lag when opening reviews
let dashboardPrefetchPromise = null;
const prefetchDashboard = () => {
  if (!dashboardPrefetchPromise) {
    dashboardPrefetchPromise = import('./dashboards/CustomerDashboard.jsx').catch(() => {});
  }
  return dashboardPrefetchPromise;
};

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, user, cartItems = [], isMultiService = false } = location.state || {};
  const { logout } = useAuth();
  
  // Header refs and state - Same as Customer Dashboard
  const notificationsRef = useRef(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Animation hooks
  const [headerRef, headerInView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  // Notifications - Same as Customer Dashboard
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'service',
      title: 'Booking Confirmed',
      message: 'Your service booking has been confirmed',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Upcoming Service',
      message: 'You have a service scheduled for tomorrow',
      time: '1 day ago'
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isLoading, setIsLoading] = useState(false);
  const toastManager = useToast();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({
    serviceDetails: false,
    scheduling: false,
    location: false,
    payment: false
  });

  // Redirect if no service data
  useEffect(() => {
    const hasMulti = Array.isArray(cartItems) && cartItems.length > 0;
    if ((!service && !hasMulti) || !user) {
      navigate('/dashboard');
    }
  }, [service, cartItems, user, navigate]);

  // Ensure page opens at the top when navigating here
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Warm up dashboard chunk on mount to minimize perceived lag
  useEffect(() => {
    prefetchDashboard();
  }, []);

  // Business hours configuration
  const BUSINESS_HOURS = {
    start: 9, // 9 AM
    end: 18,  // 6 PM
    lunchStart: 12, // 12 PM (noon)
    lunchEnd: 13    // 1 PM
  };

  // Generate available time slots based on business hours
  const getAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
      // Skip lunch break if configured
      if (hour >= BUSINESS_HOURS.lunchStart && hour < BUSINESS_HOURS.lunchEnd) {
        continue;
      }
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = getAvailableTimeSlots();

  const steps = [
    { id: 1, name: 'Service Details', icon: Star },
    { id: 2, name: 'Schedule', icon: Calendar },
    { id: 3, name: 'Location', icon: MapPin },
    { id: 4, name: 'Payment', icon: CreditCard }
  ];

  // Get dates starting today for the next 30 days (inclusive of today)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0); // normalize time
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    // Format date in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString) => {
    // Parse the date string correctly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helpers for availability
  const isToday = (dateString) => {
    if (!dateString) return false;
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(year, month - 1, day); // month is 0-indexed
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  // Enhanced time slot validation for service providers
  const isTimeSlotAvailable = (timeStr) => {
    if (!selectedDate) return false;
    
    const [hh, mm] = timeStr.split(':').map(Number);
    
    // Check if it's within business hours
    if (hh < BUSINESS_HOURS.start || hh >= BUSINESS_HOURS.end) {
      return false;
    }
    
    // Check if it's during lunch break
    if (hh >= BUSINESS_HOURS.lunchStart && hh < BUSINESS_HOURS.lunchEnd) {
      return false;
    }
    
    // For today's date, check if time has passed
    if (isToday(selectedDate)) {
      const now = new Date();
      const slot = new Date();
      slot.setHours(hh, mm || 0, 0, 0);
      
      // Add buffer time (e.g., 2 hours) - service providers need advance notice
      const bufferHours = 2;
      const bufferTime = now.getTime() + (bufferHours * 60 * 60 * 1000);
      
      return slot.getTime() >= bufferTime;
    }
    
    // For future dates, all business hours are available
    return true;
  };

  const isPastTimeForSelectedDate = (timeStr) => {
    return !isTimeSlotAvailable(timeStr);
  };

  // When changing date, clear any previously chosen past time.
  useEffect(() => {
    if (selectedTime && isPastTimeForSelectedDate(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate]);

  // Location editing functions
  const handleChangeLocationClick = () => {
    setIsEditingLocation(true);
    setTempAddress(address || '');
  };

  const handleCancelEditLocation = () => {
    setIsEditingLocation(false);
    setTempAddress('');
  };

  const handleSaveNewLocation = async () => {
    if (tempAddress.trim()) {
      setAddress(tempAddress.trim());
      setIsEditingLocation(false);
      setTempAddress('');
      toastManager.success('Location updated successfully!');
    } else {
      toastManager.error('Please enter a valid address');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      // Mark current step as completed
      const stepKey = Object.keys(completedSteps)[currentStep - 1];
      setCompletedSteps(prev => ({
        ...prev,
        [stepKey]: true
      }));
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber) => {
    // Allow going to previous steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const isStepCompleted = (stepNumber) => {
    const stepKey = Object.keys(completedSteps)[stepNumber - 1];
    return completedSteps[stepKey];
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return true; // Service details are always complete
      case 2: return selectedDate && selectedTime;
      case 3: return address && phone;
      case 4: return paymentMethod;
      default: return false;
    }
  };

  // Fetch user profile data when page loads
  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      setProfileLoading(true);
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            country,
            postal_code,
            location_latitude,
            location_longitude,
            location_accuracy_m
          )
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.warn('Failed to fetch user profile:', error);
        return;
      }

      setUserProfile(userData);
      
      // Auto-populate form fields if profile data exists
      if (userData?.user_profiles) {
        const profile = userData.user_profiles;
        
        // Build full address from profile data
        const addressParts = [
          profile.address,
          profile.city,
          profile.state,
          profile.country,
          profile.postal_code
        ].filter(Boolean);
        
        if (addressParts.length > 0) {
          setAddress(addressParts.join(', '));
        }
        
        if (profile.phone) {
          setPhone(profile.phone);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!service || !user) return;
    if (!userProfile?.id) {
      toastManager.error('Loading your profile. Please try again in a moment.');
      return;
    }
    setIsLoading(true);

    try {
      const total = calculateTotal();

      const bookingData = {
        user_id: userProfile.id,
        service_id: service.id,
        category_id: service.category || service.category_id || service.categoryId,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        service_address: address,
        service_city: userProfile?.user_profiles?.city || null,
        service_state: userProfile?.user_profiles?.state || null,
        service_country: userProfile?.user_profiles?.country || null,
        service_postal_code: userProfile?.user_profiles?.postal_code || null,
        service_location_latitude: userProfile?.user_profiles?.location_latitude || null,
        service_location_longitude: userProfile?.user_profiles?.location_longitude || null,
        contact_phone: phone,
        contact_email: userProfile?.email || null,
        special_instructions: notes || null,
        base_price: service.offer_enabled && service.offer_price ? service.offer_price : service.price,
        service_fee: Math.round((service.offer_enabled && service.offer_price ? service.offer_price : service.price) * 0.1),
        tax_amount: Math.round(((service.offer_enabled && service.offer_price ? service.offer_price : service.price) + Math.round((service.offer_enabled && service.offer_price ? service.offer_price : service.price) * 0.1)) * 0.18),
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        booking_status: 'pending'
      };

      // 1) Create Razorpay order first (no DB insert yet)
      const { order } = await apiService.createRazorpayOrder({
        amount: total,
        currency: 'INR',
        receipt: `bk_${Date.now()}`,
        notes: { service_id: bookingData.service_id }
      });

      // 3) Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RRET8ChhRQmeIm',
        amount: order.amount,
        currency: order.currency,
        name: 'Nexus Services',
        description: service.name || 'Service Booking',
        order_id: order.id,
        prefill: {
          email: userProfile?.email || '',
          contact: phone || ''
        },
        notes: {},
        handler: async function (response) {
          try {
            // Confirm on server and insert booking only after valid payment
            const result = await apiService.confirmBookingAfterPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking: bookingData
            });

            if (result?.booking?.id) {
              setBookingSuccess(true);
            }
            toastManager.success('Payment successful and booking confirmed!');
            setTimeout(() => navigate('/dashboard'), 2000);
          } catch (e) {
            toastManager.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toastManager.error('Payment cancelled');
          }
        },
        theme: { color: '#0ea5e9' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Booking/payment failed:', error);
      const raw = String(error?.message || '');
      let friendly = 'Booking failed. Please try again.';
      if (raw.includes('foreign key') && raw.includes('bookings_user_id_fkey')) {
        friendly = 'We could not link this booking to your account. Please refresh and try again.';
      } else if (raw.includes('category_id')) {
        friendly = 'Missing category. Please go back and re-select the service.';
      }
      toastManager.error(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Open existing Dashboard review modal (navigate with state)
  const handleOpenReviews = () => {
    // Send full service context so dashboard can open its existing modal immediately
    try {
      // Persist through router state or full page reload as a fallback
      const payload = {
        id: service?.id,
        name: service?.name,
        icon_url: service?.icon_url,
        category_name: service?.category_name || service?.category
      };
      localStorage.setItem('openReviewService', JSON.stringify(payload));
      localStorage.setItem('reviewFromBooking', '1');
    } catch {}
    navigate('/dashboard', { 
      state: { 
        openReviewService: {
          id: service?.id,
          name: service?.name,
          icon_url: service?.icon_url,
          category_name: service?.category_name || service?.category
        },
        reviewFrom: 'booking'
      }
    });
  };

  const handleKeyOpenReviews = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenReviews();
    }
  };

  const calculateTotal = () => {
    // Multi-service cart uses the same breakdown as cart summary on dashboard: flat fee + GST
    if (isMultiService && Array.isArray(cartItems) && cartItems.length > 0) {
      const subtotal = cartItems.reduce((sum, item) => {
        const hasOffer = item.offer_enabled && item.offer_price;
        const price = hasOffer ? item.offer_price : item.price;
        const qty = item.quantity || 1;
        return sum + price * qty;
      }, 0);
      const serviceFee = 50; // keep consistent with CustomerDashboard cart summary
      const tax = Math.round((subtotal + serviceFee) * 0.18);
      return Math.round(subtotal + serviceFee + tax);
    }
    if (!service) return 0;
    const basePrice = service.offer_enabled && service.offer_price ? service.offer_price : service.price;
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    const tax = Math.round((basePrice + serviceFee) * 0.18); // 18% GST
    return basePrice + serviceFee + tax;
  };

  useEffect(() => {
    // Fetch user profile when page loads
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  if ((!service && !(Array.isArray(cartItems) && cartItems.length > 0)) || !user) {
    return null; // Will redirect in useEffect
  }

  const total = calculateTotal();
  const isMulti = isMultiService && Array.isArray(cartItems) && cartItems.length > 0;
  const basePrice = !isMulti && service ? (service.offer_enabled && service.offer_price ? service.offer_price : service.price) : 0;
  const serviceFee = !isMulti ? Math.round(basePrice * 0.1) : 0;
  const tax = !isMulti ? Math.round((basePrice + serviceFee) * 0.18) : 0;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="customer-dashboard">
      {/* Toast Container */}
      <ToastContainer
        toasts={toastManager.toasts}
        removeToast={toastManager.removeToast}
        position="top-right"
      />
      {/* Loading Spinner */}
      {isLoading && (
        <LoadingSpinner size="large" color="primary" text="Processing your booking..." fullScreen={true} />
      )}
      {/* Professional Header (same as Customer Dashboard) */}
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
                          onClick={() => setIsNotificationsOpen(false)}
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

      {/* Enhanced Page Title Section */}
      <motion.div 
        className="page-title-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="title-container">
          {/* Enhanced Navigation Bar */}
          <div className="navigation-bar">
            <motion.button 
              className="enhanced-back-button" 
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="back-icon-wrapper">
                <ArrowLeft size={18} />
              </div>
              <span>Back</span>
            </motion.button>
            
            {/* Enhanced Breadcrumb */}
            <motion.div 
              className="enhanced-breadcrumb"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <span className="crumb" onClick={() => navigate('/dashboard')}>
                <span className="crumb-icon">🏠</span>
                Dashboard
              </span>
              <div className="separator">
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
              </div>
              <span className="crumb" onClick={() => navigate('/dashboard?tab=services')}>
                <span className="crumb-icon">🔧</span>
                Services
              </span>
              <div className="separator">
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
              </div>
              <span className="crumb current">
                <span className="crumb-icon">📋</span>
                Booking
              </span>
            </motion.div>

          </div>

          {/* Enhanced Page Context */}
          <motion.div 
            className="enhanced-page-context"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="service-title-wrapper">
              <h1>{isMulti ? `Book ${cartItems.length} Services` : `Book ${service?.name || 'Service'}`}</h1>
              <div className="title-accent"></div>
            </div>
            <p className="subtitle">Complete your booking in {steps.length} easy steps</p>
            
            {/* Enhanced Feature Highlights */}
            <div className="enhanced-context-chips">
              <motion.span 
                className="enhanced-chip secure"
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Shield size={14} />
                Secure Checkout
              </motion.span>
              <motion.span 
                className="enhanced-chip transparent"
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <CheckCircle size={14} />
                No hidden fees
              </motion.span>
              <motion.span 
                className="enhanced-chip instant"
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <Star size={14} />
                Instant confirmation
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="booking-page-content">
        {/* Enhanced Progress Indicator */}
        <motion.div 
          className="enhanced-booking-progress"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isClickable = step.id <= currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <motion.div 
                  className={`enhanced-progress-step ${isClickable ? 'clickable' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => isClickable && goToStep(step.id)}
                  whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + (index * 0.1), duration: 0.4 }}
                >
                  <motion.div 
                    className="enhanced-progress-dot"
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: "backOut" }}
                      >
                        <CheckCircle size={18} />
                      </motion.div>
                    ) : (
                      <StepIcon size={18} />
                    )}
                  </motion.div>
                  <motion.span 
                    className="step-name"
                    animate={{ 
                      color: isActive ? '#3b82f6' : isCompleted ? '#10b981' : '#64748b',
                      fontWeight: isActive ? 700 : 500
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.name}
                  </motion.span>
                  {isCompleted && (
                    <motion.div 
                      className="completion-indicator"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div 
                    className="enhanced-progress-line"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.9 + (index * 0.1), duration: 0.6 }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <div className="booking-main-content">
          {/* Step Content */}
          <div className="step-content-wrapper">
            <motion.div 
              key={currentStep}
              className="step-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Service Details */}
              {currentStep === 1 && (
                <div className="step-details">
                  <div className="step-header">
                    <Star size={24} className="step-icon" />
                    <h3>Service Details</h3>
                  </div>
                  <div className="enhanced-service-overview">
                    {isMulti ? (
                      <>
                        {/* Multi-service cart list */}
                        <motion.div 
                          className="enhanced-service-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                          <div className="service-header">
                            <div className="service-title-section">
                              <motion.h4 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                              >
                                Cart Items ({cartItems.length})
                              </motion.h4>
                              <motion.div 
                                className="cart-summary-info"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}
                              >
                                {(() => {
                                  const categories = [...new Set(cartItems.map(item => item.category_name).filter(Boolean))];
                                  const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
                                  return (
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                      <span>Total Items: {totalQuantity}</span>
                                      {categories.length > 0 && (
                                        <span>Categories: {categories.join(', ')}</span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </motion.div>
                            </div>
                          </div>
                          <div className="enhanced-service-meta">
                            {cartItems.map((item) => {
                              const hasOffer = item.offer_enabled && item.offer_price;
                              const unit = hasOffer ? item.offer_price : item.price;
                              const qty = item.quantity || 1;
                              const lineTotal = unit * qty;
                              return (
                                <div key={item.id} className="cart-item-card" style={{ 
                                  border: '1px solid #e2e8f0', 
                                  borderRadius: '12px', 
                                  padding: '16px', 
                                  marginBottom: '12px',
                                  backgroundColor: '#f8fafc'
                                }}>
                                  <div className="cart-item-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div className="cart-item-icon" style={{ 
                                      width: '40px', 
                                      height: '40px', 
                                      borderRadius: '8px', 
                                      backgroundColor: '#e2e8f0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '20px'
                                    }}>
                                      {item.icon_url ? (
                                        <img src={item.icon_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                      ) : (
                                        <span>🔧</span>
                                      )}
                                    </div>
                                    <div className="cart-item-info" style={{ flex: 1 }}>
                                      <h5 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                                        {item.name}
                                      </h5>
                                      {item.description && (
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b', lineHeight: '1.4' }}>
                                          {item.description.length > 80 ? `${item.description.substring(0, 80)}...` : item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="cart-item-price" style={{ textAlign: 'right' }}>
                                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                                        ₹{lineTotal}
                                      </div>
                                      {qty > 1 && (
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                          ₹{unit} × {qty}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="cart-item-details" style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    color: '#64748b'
                                  }}>
                                    <div className="cart-item-meta" style={{ display: 'flex', gap: '16px' }}>
                                      {item.duration && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Clock size={14} />
                                          {item.duration}
                                        </span>
                                      )}
                                      {item.category_name && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Star size={14} />
                                          {item.category_name}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {hasOffer && (
                                      <div className="offer-badge" style={{
                                        backgroundColor: '#dcfce7',
                                        color: '#166534',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600
                                      }}>
                                        Save ₹{item.price - item.offer_price}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>

                        {/* Multi-service price breakdown */}
                        <motion.div 
                          className="enhanced-price-breakdown"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                        >
                          <div className="price-header">
                            <h4>Price Breakdown</h4>
                            <div className="price-accent"></div>
                          </div>
                          {(() => {
                            const subtotal = cartItems.reduce((sum, item) => {
                              const hasOffer = item.offer_enabled && item.offer_price;
                              const price = hasOffer ? item.offer_price : item.price;
                              const qty = item.quantity || 1;
                              return sum + price * qty;
                            }, 0);
                            const fee = 50;
                            const taxMulti = Math.round((subtotal + fee) * 0.18);
                            return (
                              <div className="price-items">
                                <div className="price-item">
                                  <span className="price-label">Subtotal</span>
                                  <span className="price-value">₹{subtotal}</span>
                                </div>
                                <div className="price-item">
                                  <span className="price-label">Service Fee</span>
                                  <span className="price-value">₹{fee}</span>
                                </div>
                                <div className="price-item">
                                  <span className="price-label">Tax (18%)</span>
                                  <span className="price-value">₹{taxMulti}</span>
                                </div>
                                <div className="price-divider"></div>
                                <div className="price-item total-price">
                                  <span className="price-label">Total Amount</span>
                                  <span className="price-value total">₹{subtotal + fee + taxMulti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      </>
                    ) : (
                    <>
                    {/* Enhanced Service Card */}
                    <motion.div 
                      className="enhanced-service-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <div className="service-header">
                        <motion.div 
                          className="enhanced-service-icon"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, duration: 0.6, ease: "backOut" }}
                        >
                          {service.icon_url ? (
                            <img src={service.icon_url} alt={service.name} />
                          ) : (
                            <div className="default-icon">🔧</div>
                          )}
                        </motion.div>
                        <div className="service-title-section">
                          <motion.h4 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            {service.name}
                          </motion.h4>
                          <motion.div 
                            className="enhanced-service-badges"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <span className="enhanced-badge primary">
                              <Star size={12} />
                              Popular Choice
                            </span>
                            <span className="enhanced-badge success">
                              <Shield size={12} />
                              Insured
                            </span>
                            <span className="enhanced-badge verified">
                              <CheckCircle size={12} />
                              Verified Pros
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Enhanced Description */}
                      <motion.div 
                        className="enhanced-description-section"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <p className="enhanced-service-description">
                          {service.description}
                        </p>
                      </motion.div>

                      {/* Enhanced Meta Information */}
                      <motion.div 
                        className="enhanced-service-meta"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <div className="meta-row">
                          <div className="meta-item duration">
                            <Clock size={18} />
                            <span>Duration: {service.duration || '1 hour'}</span>
                          </div>
                          <div 
                            className="meta-item rating-section"
                            onClick={handleOpenReviews}
                            role="button"
                            tabIndex={0}
                            onKeyDown={handleKeyOpenReviews}
                            onMouseEnter={prefetchDashboard}
                          >
                            <div className="enhanced-rating-stars">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const filled = i < Math.round(4.8);
                                return (
                                  <Star key={i} size={18} style={{
                                    fill: filled ? '#f59e0b' : 'transparent',
                                    stroke: '#f59e0b',
                                    strokeWidth: 2
                                  }} />
                                );
                              })}
                            </div>
                            <div className="rating-details">
                              <span className="rating-number">4.8</span>
                              <span className="rating-count">(127 reviews)</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Enhanced Price Breakdown */}
                    <motion.div 
                      className="enhanced-price-breakdown"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      <div className="price-header">
                        <h4>Price Breakdown</h4>
                        <div className="price-accent"></div>
                      </div>
                      
                      <div className="price-items">
                        <div className="price-item">
                          <span className="price-label">Service Price</span>
                          <span className="price-value">₹{basePrice}</span>
                        </div>
                        
                        {service.offer_enabled && service.offer_price && (
                          <div className="price-item original-price">
                            <span className="price-label">Original Price</span>
                            <span className="price-value original">₹{service.price}</span>
                          </div>
                        )}
                        
                        <div className="price-item">
                          <span className="price-label">Service Fee (10%)</span>
                          <span className="price-value">₹{serviceFee}</span>
                        </div>
                        
                        <div className="price-item">
                          <span className="price-label">Tax (18%)</span>
                          <span className="price-value">₹{tax}</span>
                        </div>
                        
                        <div className="price-divider"></div>
                        
                        <div className="price-item total-price">
                          <span className="price-label">Total Amount</span>
                          <span className="price-value total">₹{total}</span>
                        </div>
                      </div>
                    </motion.div>
                    </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Scheduling */}
              {currentStep === 2 && (
                <div className="step-scheduling">
                  <div className="step-header">
                    <Calendar size={24} className="step-icon" />
                    <h3>Select Date & Time</h3>
                  </div>
                  <div className="scheduling-form">
                    <div className="form-group">
                      <label>Select Date</label>
                      <div className="date-picker">
                        {getAvailableDates().slice(0, 7).map(date => (
                          <button
                            key={date.toISOString()}
                            className={`date-option ${selectedDate === formatDate(date) ? 'selected' : ''}`}
                            onClick={() => setSelectedDate(formatDate(date))}
                          >
                            <span className="day">{date.getDate()}</span>
                            <span className="month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                          </button>
                        ))}
                      </div>
                      {selectedDate && (
                        <p className="selected-date-info">
                          Selected: {formatDisplayDate(selectedDate)}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Select Time Slot</label>
                      {selectedDate && (
                        <div className="business-hours-info">
                          <p className="hours-text">
                            <Clock size={16} />
                            Business Hours: {BUSINESS_HOURS.start}:00 AM - {BUSINESS_HOURS.end}:00 PM
                            {isToday(selectedDate) && (
                              <span className="buffer-notice">
                                (2-hour advance notice required for today)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      <div className="time-slots">
                        {timeSlots.map(time => {
                          const disabled = isPastTimeForSelectedDate(time);
                          const isLunchTime = time >= '12:00' && time < '13:00';
                          return (
                            <button
                              key={time}
                              className={`time-option ${selectedTime === time ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                              onClick={() => !disabled && setSelectedTime(time)}
                              disabled={disabled}
                              title={disabled ? 'Not available' : 'Available'}
                            >
                              {time}
                              {isLunchTime && <span className="lunch-label">Lunch</span>}
                            </button>
                          );
                        })}
                      </div>
                      {selectedDate && isToday(selectedDate) && (
                        <p className="availability-notice">
                          <AlertCircle size={16} />
                          Same-day bookings require at least 2 hours advance notice
                        </p>
                      )}
                    </div>
                    
                    {/* Additional Information Sections */}
                    <div className="form-group">
                      <label>Service Duration</label>
                      <div className="duration-info">
                        <div className="duration-card">
                          <Clock size={20} />
                          <div className="duration-details">
                            <span className="duration-time">{isMulti ? 'Multiple services' : (service?.duration || '1 hour')}</span>
                            <span className="duration-label">Estimated Duration</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Booking Policies</label>
                      <div className="policies-info">
                        <div className="policy-item">
                          <CheckCircle size={16} />
                          <span>Free cancellation up to 2 hours before service</span>
                        </div>
                        <div className="policy-item">
                          <CheckCircle size={16} />
                          <span>Professional and insured service providers</span>
                        </div>
                        <div className="policy-item">
                          <CheckCircle size={16} />
                          <span>Quality guarantee on all services</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Service Provider Information</label>
                      <div className="provider-info">
                        <div className="provider-card">
                          <div className="provider-avatar">
                            <User size={24} />
                          </div>
                          <div className="provider-details">
                            <span className="provider-name">Verified Professional</span>
                            <span className="provider-rating">
                              <Star size={14} fill="#f59e0b" />
                              <Star size={14} fill="#f59e0b" />
                              <Star size={14} fill="#f59e0b" />
                              <Star size={14} fill="#f59e0b" />
                              <Star size={14} fill="#f59e0b" />
                              <span className="rating-text">4.8 (127 reviews)</span>
                            </span>
                            <span className="provider-badges">
                              <span className="badge">✓ Verified</span>
                              <span className="badge">✓ Insured</span>
                              <span className="badge">✓ Background Checked</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>What to Expect</label>
                      <div className="expectations-info">
                        <div className="expectation-item">
                          <div className="expectation-number">1</div>
                          <div className="expectation-text">
                            <strong>Confirmation:</strong> Receive instant booking confirmation
                          </div>
                        </div>
                        <div className="expectation-item">
                          <div className="expectation-number">2</div>
                          <div className="expectation-text">
                            <strong>Service:</strong> Professional arrives on time with equipment
                          </div>
                        </div>
                        <div className="expectation-item">
                          <div className="expectation-number">3</div>
                          <div className="expectation-text">
                            <strong>Completion:</strong> Quality service delivered as promised
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <div className="step-location">
                  <div className="step-header">
                    <MapPin size={24} className="step-icon" />
                    <h3>Service Location</h3>
                  </div>
                  <div className="location-form">
                    {profileLoading ? (
                      <div className="profile-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading your profile details...</span>
                      </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>
                            Service Address *
                            {userProfile?.user_profiles?.address && (
                              <span className="profile-source">(from your profile)</span>
                            )}
                          </label>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter complete address where service is needed"
                            rows={3}
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            Contact Number *
                            {userProfile?.user_profiles?.phone && (
                              <span className="profile-source">(from your profile)</span>
                            )}
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Your contact number"
                          />
                        </div>
                        <div className="form-group">
                          <label>Additional Notes (Optional)</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions or requirements"
                            rows={2}
                          />
                        </div>
                        {userProfile?.user_profiles?.address && userProfile?.user_profiles?.phone && (
                          <div className="profile-loaded-notice">
                            <CheckCircle size={16} />
                            <span>Your profile details have been loaded. You can edit them above if needed.</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <div className="step-payment">
                  <div className="step-header">
                    <CreditCard size={24} className="step-icon" />
                    <h3>Payment Method</h3>
                  </div>
                  <div className="payment-form">
                    <div className="payment-methods">
                      <div className="payment-option payment-option--single">
                        <div className="payment-info">
                          <div className="upi-icon">💳</div>
                          <span>Select payment method securely in Razorpay</span>
                        </div>
                        <div className="payment-subtext">
                          Options: UPI • Card • Netbanking • Wallet
                        </div>
                      </div>
                    </div>
                    <div className="security-info">
                      <Shield size={16} />
                      <span>Your payment is processed via Razorpay with bank‑grade encryption</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="booking-sidebar">
            <motion.div 
              className="enhanced-sidebar-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="sidebar-header" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px 12px 0 0',
                padding: '20px',
                margin: '-20px -20px 20px -20px',
                color: 'white'
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>Booking Summary</h4>
                <div style={{
                  height: '3px',
                  background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)',
                  borderRadius: '2px',
                  marginTop: '8px',
                  boxShadow: '0 2px 4px rgba(255,215,0,0.3)'
                }}></div>
              </div>
              
              <div className="summary-content">
                {/* Service Details or Cart Items */}
                {isMulti ? (
                  <motion.div 
                    className="enhanced-summary-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      color: '#1f2937'
                    }}
                  >
                    <div className="summary-label" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: '50%',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Star size={16} color="white" />
                      </div>
                      Cart Items
                    </div>
                    <div className="summary-value service-value" style={{ width: '100%', color: '#1f2937' }}>
                       {cartItems.map((ci) => {
                         const hasOffer = ci.offer_enabled && ci.offer_price;
                         const unit = hasOffer ? ci.offer_price : ci.price;
                         const qty = ci.quantity || 1;
                         return (
                           <div key={ci.id} style={{ 
                             display: 'flex !important', 
                             justifyContent: 'space-between !important', 
                             alignItems: 'flex-start !important',
                             marginBottom: '12px !important',
                             padding: '16px !important',
                             background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important',
                             borderRadius: '12px !important',
                             border: '1px solid #e2e8f0 !important',
                             boxShadow: '0 4px 16px rgba(0,0,0,0.08) !important',
                             opacity: '1 !important',
                             visibility: 'visible !important',
                             color: '#1e293b !important',
                             minHeight: '70px',
                             transition: 'all 0.3s ease !important',
                             position: 'relative !important',
                             overflow: 'hidden !important'
                           }}>
                             {/* Subtle accent line */}
                             <div style={{
                               position: 'absolute',
                               top: 0,
                               left: 0,
                               right: 0,
                               height: '3px',
                               background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                               borderRadius: '12px 12px 0 0'
                             }}></div>
                             
                             <div style={{ 
                               flex: '1 !important', 
                               marginRight: '12px !important',
                               color: '#1e293b !important',
                               paddingTop: '8px'
                             }}>
                               <div style={{ 
                                 fontWeight: '700 !important', 
                                 fontSize: '16px !important', 
                                 color: '#1e293b !important', 
                                 marginBottom: '6px !important',
                                 opacity: '1 !important',
                                 visibility: 'visible !important',
                                 lineHeight: '1.3'
                               }}>
                                 {ci.name}
                               </div>
                               {qty > 1 && (
                                 <div style={{ 
                                   fontSize: '13px !important', 
                                   color: '#6b7280 !important', 
                                   marginBottom: '4px !important', 
                                   fontWeight: '600 !important',
                                   opacity: '1 !important',
                                   visibility: 'visible !important',
                                   background: '#f3f4f6',
                                   padding: '2px 8px',
                                   borderRadius: '6px',
                                   display: 'inline-block'
                                 }}>
                                   Qty: {qty}
                                 </div>
                               )}
                               <div style={{ display: 'flex', gap: '12px', marginTop: '4px', color: '#1f2937' }}>
                                 {ci.duration && (
                                   <div style={{ 
                                     fontSize: '12px !important', 
                                     color: '#1f2937 !important', 
                                     display: 'inline-flex !important', 
                                     alignItems: 'center !important', 
                                     gap: '4px !important', 
                                     fontWeight: '600 !important',
                                     opacity: '1 !important',
                                     visibility: 'visible !important',
                                     background: '#ffffff !important',
                                     padding: '6px 10px !important',
                                     borderRadius: '8px !important',
                                     border: '2px solid #3b82f6 !important',
                                     boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2) !important',
                                     minWidth: '80px !important',
                                     justifyContent: 'center !important'
                                   }}>
                                     <Clock size={14} color="#3b82f6" />
                                     <span style={{ color: '#1f2937 !important', fontWeight: '600 !important' }}>{ci.duration}</span>
                                   </div>
                                 )}
                                 {ci.category_name && (
                                   <div style={{ 
                                     fontSize: '12px !important', 
                                     color: '#1f2937 !important', 
                                     display: 'inline-flex !important', 
                                     alignItems: 'center !important', 
                                     gap: '4px !important', 
                                     fontWeight: '600 !important',
                                     opacity: '1 !important',
                                     visibility: 'visible !important',
                                     background: '#ffffff !important',
                                     padding: '6px 10px !important',
                                     borderRadius: '8px !important',
                                     border: '2px solid #8b5cf6 !important',
                                     boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2) !important',
                                     minWidth: '80px !important',
                                     justifyContent: 'center !important'
                                   }}>
                                     <Star size={14} color="#8b5cf6" />
                                     <span style={{ color: '#1f2937 !important', fontWeight: '600 !important' }}>{ci.category_name}</span>
                                   </div>
                                 )}
                               </div>
                             </div>
                             <div style={{ 
                               textAlign: 'right !important',
                               color: '#1e293b !important',
                               paddingTop: '8px'
                             }}>
                               <div style={{ 
                                 fontWeight: '800 !important', 
                                 fontSize: '18px !important', 
                                 color: '#1e293b !important',
                                 opacity: '1 !important',
                                 visibility: 'visible !important',
                                 marginBottom: '4px'
                               }}>
                                 ₹{unit * qty}
                               </div>
                               {hasOffer && (
                                 <div style={{ 
                                   fontSize: '11px !important', 
                                   color: '#059669 !important', 
                                   fontWeight: '700 !important',
                                   opacity: '1 !important',
                                   visibility: 'visible !important',
                                   background: '#dcfce7',
                                   padding: '2px 6px',
                                   borderRadius: '4px',
                                   border: '1px solid #bbf7d0'
                                 }}>
                                   Save ₹{ci.price - ci.offer_price}
                                 </div>
                               )}
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="enhanced-summary-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <div className="summary-label">
                      <Star size={16} />
                      Service
                    </div>
                    <div className="summary-value service-value">
                      {service.name}
                    </div>
                  </motion.div>
                )}

                {/* Date & Time */}
                {selectedDate && selectedTime && (
                  <motion.div 
                    className="enhanced-summary-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="summary-label">
                      <Calendar size={16} />
                      Date & Time
                    </div>
                    <div className="summary-value datetime-value">
                      <div className="date-text">{formatDisplayDate(selectedDate)}</div>
                      <div className="time-text">{selectedTime}</div>
                    </div>
                  </motion.div>
                )}

                {/* Location with Map */}
                {address && (
                  <motion.div 
                    className="enhanced-summary-item location-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="summary-label">
                      <MapPin size={16} />
                      Location
                    </div>
                    <div className="location-content">
                      {isEditingLocation ? (
                        <div className="location-edit-form">
                          <input
                            type="text"
                            value={tempAddress}
                            onChange={(e) => setTempAddress(e.target.value)}
                            placeholder="Enter new address"
                            className="address-input"
                          />
                          <div className="edit-actions">
                            <button className="save-location-btn" onClick={handleSaveNewLocation}>
                              Save
                            </button>
                            <button className="cancel-location-btn" onClick={handleCancelEditLocation}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="address-text">{address}</div>
                          
                          {/* Enhanced Map Integration */}
                          <LocationMap
                            latitude={userProfile?.user_profiles?.location_latitude}
                            longitude={userProfile?.user_profiles?.location_longitude}
                            address={address}
                            height="600px"
                            zoom={16}
                            className="booking-map"
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Total Amount */}
                <motion.div 
                  className="enhanced-summary-item total-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '16px',
                    border: '1px solid #475569',
                    boxShadow: '0 8px 24px rgba(30, 41, 59, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Decorative elements */}
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '50%',
                    opacity: 0.1
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '-10px',
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '50%',
                    opacity: 0.1
                  }}></div>
                  
                  <div className="summary-divider" style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, #64748b 50%, transparent 100%)',
                    marginBottom: '16px'
                  }}></div>
                  <div className="total-summary">
                    <div className="total-row" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span className="total-label" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#f1f5f9'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          borderRadius: '50%',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IndianRupee size={16} color="white" />
                        </div>
                        Total Amount
                      </span>
                      <span className="total-amount" style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        color: '#ffffff',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>₹{total}</span>
                    </div>
                    <div className="total-note" style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      fontWeight: '500',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      Includes service fee and taxes
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="sidebar-navigation">
              {currentStep > 1 && (
                <button className="btn-secondary" onClick={prevStep}>
                  <ArrowLeft size={16} />
                  Previous
                </button>
              )}
              
              {currentStep < steps.length ? (
                <button 
                  className="btn-primary"
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                >
                  Next Step
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  className="btn-primary btn-confirm"
                  onClick={isMulti ? () => toastManager.error('Multi-service booking not yet supported. Please book services individually.') : handleBooking}
                  disabled={!canProceedToNext() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Processing Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Booking - ₹{total}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div 
            className="booking-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="booking-success"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.6 
              }}
            >
              {/* Animated Background Elements */}
              <div className="success-background">
                <div className="floating-circle circle-1"></div>
                <div className="floating-circle circle-2"></div>
                <div className="floating-circle circle-3"></div>
              </div>

              {/* Success Icon with Enhanced Animation */}
              <motion.div 
                className="success-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2, 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15 
                }}
              >
                <div className="icon-container">
                  <CheckCircle size={72} />
                  <div className="icon-ring"></div>
                </div>
              </motion.div>

              {/* Success Content */}
              <motion.div 
                className="success-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h2>🎉 Booking Confirmed!</h2>
                <p className="success-subtitle">Your service booking has been successfully confirmed and payment processed.</p>
                
                {/* Enhanced Booking Details Card */}
                <div className="booking-details-card">
                  <div className="details-header">
                    <h3>Booking Summary</h3>
                    <div className="booking-id">#BK{Date.now().toString().slice(-6)}</div>
                  </div>
                  
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-icon">
                        <Star size={20} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Service</span>
                        <span className="detail-value">{isMulti ? `${cartItems.length} Services` : (service?.name || 'Service')}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <Calendar size={20} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{formatDisplayDate(selectedDate)}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <Clock size={20} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Time</span>
                        <span className="detail-value">{selectedTime}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <CreditCard size={20} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Amount Paid</span>
                        <span className="detail-value amount">₹{total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="next-steps">
                  <h4>What happens next?</h4>
                  <div className="steps-list">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-text">You'll receive confirmation SMS & email</div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-text">Service provider will contact you 30 minutes before</div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-text">Enjoy your professional service!</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="success-actions">
                  <motion.button 
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setBookingSuccess(false);
                      navigate('/dashboard');
                    }}
                  >
                    <Shield size={18} />
                    View Booking Details
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal is handled in Dashboard; we navigate there with state. */}
    </div>
  );
};

export default BookingPage;
