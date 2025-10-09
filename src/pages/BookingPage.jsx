import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, MessageSquare, 
  CreditCard, Shield, CheckCircle, AlertCircle, Star, 
  ArrowRight, Bell, LogOut, ChevronDown, DollarSign
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from '../components/ToastContainer';
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
  const { service, user } = location.state || {};
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
    if (!service || !user) {
      navigate('/dashboard');
    }
  }, [service, user, navigate]);

  // Ensure page opens at the top when navigating here
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Warm up dashboard chunk on mount to minimize perceived lag
  useEffect(() => {
    prefetchDashboard();
  }, []);

  // Available time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00'
  ];

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
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
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
    const d = new Date(dateString);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const isPastTimeForSelectedDate = (timeStr) => {
    if (!selectedDate) return false;
    if (!isToday(selectedDate)) return false;
    const [hh, mm] = timeStr.split(':').map(Number);
    const now = new Date();
    const slot = new Date();
    slot.setHours(hh, mm || 0, 0, 0);
    return slot.getTime() <= now.getTime();
  };

  // When changing date, clear any previously chosen past time.
  useEffect(() => {
    if (selectedTime && isPastTimeForSelectedDate(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate]);

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

  if (!service || !user) {
    return null; // Will redirect in useEffect
  }

  const total = calculateTotal();
  const basePrice = service.offer_enabled && service.offer_price ? service.offer_price : service.price;
  const serviceFee = Math.round(basePrice * 0.1);
  const tax = Math.round((basePrice + serviceFee) * 0.18);

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
                                {item.type === 'billing' && <DollarSign size={16} />}
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

      {/* Page Title Section */}
      <div className="page-title-section">
        <div className="title-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
          {/* Breadcrumb replacing back button to keep height */}
          <div className="breadcrumb">
            <span className="crumb" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="separator">/</span>
            <span className="crumb" onClick={() => navigate('/dashboard?tab=services')}>Services</span>
            <span className="separator">/</span>
            <span className="crumb current">Booking</span>
          </div>
          <div className="page-context">
            <h1>Book {service.name}</h1>
            <p>Complete your booking in {steps.length} easy steps</p>
          </div>
          {/* Context chips to preserve visual weight */}
          <div className="context-chips">
            <span className="chip primary">Secure Checkout</span>
            <span className="chip neutral">No hidden fees</span>
            <span className="chip success">Instant confirmation</span>
          </div>
        </div>
      </div>

      <div className="booking-page-content">
        {/* Progress Indicator */}
        <div className="booking-progress">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isClickable = step.id <= currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`progress-step ${isClickable ? 'clickable' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => isClickable && goToStep(step.id)}
                >
                  <div className="progress-dot">
                    {isCompleted ? <CheckCircle size={16} /> : <StepIcon size={16} />}
                  </div>
                  <span>{step.name}</span>
                </div>
                {index < steps.length - 1 && <div className="progress-line"></div>}
              </React.Fragment>
            );
          })}
        </div>

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
                  <div className="service-overview">
                    <div className="service-card">
                      <div className="service-icon">
                        {service.icon_url ? (
                          <img src={service.icon_url} alt={service.name} />
                        ) : (
                          <div className="default-icon">🔧</div>
                        )}
                      </div>
                      <div className="service-info">
                        <h4>{service.name}</h4>
                        <p className="service-description">{service.description}</p>
                        <div className="service-badges">
                          <span className="badge primary">Popular Choice</span>
                          <span className="badge success">Insured</span>
                          <span className="badge neutral">Verified Pros</span>
                        </div>
                        <div className="service-meta">
                          <div className="meta-item">
                            <Clock size={16} />
                            <span>Duration: {service.duration || '1 hour'}</span>
                          </div>
                          <div 
                            className="meta-item rating-meta"
                            onClick={handleOpenReviews}
                            role="button"
                            tabIndex={0}
                            onKeyDown={handleKeyOpenReviews}
                            onMouseEnter={prefetchDashboard}
                          >
                            <div className="rating-stars">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const filled = i < Math.round(4.8);
                                return (
                                  <Star key={i} size={16} style={{
                                    fill: filled ? '#f59e0b' : 'transparent',
                                    stroke: '#f59e0b'
                                  }} />
                                );
                              })}
                            </div>
                            <span className="rating-text">4.8</span>
                            <button className="review-link" onClick={handleOpenReviews} onMouseEnter={prefetchDashboard}>
                              (127 reviews)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="price-breakdown">
                      <h4>Price Breakdown</h4>
                      <div className="price-row">
                        <span>Service Price</span>
                        <span>₹{basePrice}</span>
                      </div>
                      {service.offer_enabled && service.offer_price && (
                        <div className="price-row original">
                          <span>Original Price</span>
                          <span>₹{service.price}</span>
                        </div>
                      )}
                      <div className="price-row">
                        <span>Service Fee (10%)</span>
                        <span>₹{serviceFee}</span>
                      </div>
                      <div className="price-row">
                        <span>Tax (18%)</span>
                        <span>₹{tax}</span>
                      </div>
                      <div className="price-row total">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
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
                      <div className="time-slots">
                        {timeSlots.map(time => {
                          const disabled = isPastTimeForSelectedDate(time);
                          return (
                          <button
                            key={time}
                            className={`time-option ${selectedTime === time ? 'selected' : ''}`}
                            onClick={() => setSelectedTime(time)}
                            disabled={disabled}
                          >
                            {time}
                          </button>
                          );
                        })}
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

          {/* Sidebar */}
          <div className="booking-sidebar">
            <div className="sidebar-card">
              <h4>Booking Summary</h4>
              <div className="summary-item">
                <span>Service</span>
                <span>{service.name}</span>
              </div>
              {selectedDate && selectedTime && (
                <div className="summary-item">
                  <span>Date & Time</span>
                  <span>{formatDisplayDate(selectedDate)} at {selectedTime}</span>
                </div>
              )}
              {address && (
                <div className="summary-item">
                  <span>Location</span>
                  <span className="address-preview">{address.substring(0, 50)}...</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="total-summary">
                <div className="total-row">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{total}</span>
                </div>
              </div>
            </div>

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
                  onClick={handleBooking}
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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="success-icon">
                <CheckCircle size={64} />
              </div>
              <h2>Booking Confirmed!</h2>
              <p>Your service booking has been successfully confirmed.</p>
              <div className="booking-details">
                <div className="detail-item">
                  <span>Service:</span>
                  <span>{service.name}</span>
                </div>
                <div className="detail-item">
                  <span>Date:</span>
                  <span>{formatDisplayDate(selectedDate)}</span>
                </div>
                <div className="detail-item">
                  <span>Time:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="detail-item">
                  <span>Amount:</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <p className="success-message">
                You will receive a confirmation SMS and email shortly. 
                Our service provider will contact you before the scheduled time.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal is handled in Dashboard; we navigate there with state. */}
    </div>
  );
};

export default BookingPage;
