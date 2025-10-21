import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Clock, MapPin, User, Phone, MessageSquare, 
  CreditCard, Shield, CheckCircle, AlertCircle, Star, 
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft
} from 'lucide-react';
import { supabase } from '../hooks/useAuth';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, service, user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({
    serviceDetails: false,
    scheduling: false,
    location: false,
    payment: false
  });

  // Available time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00'
  ];

  // Get next 30 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
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

  const steps = [
    { id: 1, name: 'Service Details', icon: Star },
    { id: 2, name: 'Schedule', icon: Calendar },
    { id: 3, name: 'Location', icon: MapPin },
    { id: 4, name: 'Payment', icon: CreditCard }
  ];

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

  // Fetch user profile data when modal opens
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
    setIsLoading(true);
    
    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsLoading(false);
    setBookingSuccess(true);
    
    // Auto close after 4 seconds to allow user to see the success message
    setTimeout(() => {
      setBookingSuccess(false);
      onClose();
      // Reset form
      setCurrentStep(1);
      setSelectedDate('');
      setSelectedTime('');
      setAddress('');
      setPhone('');
      setNotes('');
      setPaymentMethod('card');
      setCompletedSteps({
        serviceDetails: false,
        scheduling: false,
        location: false,
        payment: false
      });
    }, 4000);
  };

  const calculateTotal = () => {
    if (!service) return 0;
    const basePrice = service.offer_enabled && service.offer_price ? service.offer_price : service.price;
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    const tax = Math.round((basePrice + serviceFee) * 0.18); // 18% GST
    return basePrice + serviceFee + tax;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Fetch user profile when modal opens (only if not already loaded)
      if (!userProfile) {
        fetchUserProfile();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, user?.id, userProfile]);

  if (!isOpen || !service) return null;

  const total = calculateTotal();
  const basePrice = service.offer_enabled && service.offer_price ? service.offer_price : service.price;
  const serviceFee = Math.round(basePrice * 0.1);
  const tax = Math.round((basePrice + serviceFee) * 0.18);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="booking-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="booking-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {!bookingSuccess ? (
              <>
                {/* Header */}
                <div className="booking-header">
                  <div className="booking-title">
                    <h2>Book {service.name}</h2>
                    <p>Complete your booking in {steps.length} steps</p>
                  </div>
                  <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                  </button>
                </div>

                {/* Step Progress Indicator */}
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

                {/* Step Content */}
                <div className="booking-content">
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
                              <div className="service-meta">
                                <div className="meta-item">
                                  <Clock size={16} />
                                  <span>Duration: {service.duration || '1 hour'}</span>
                                </div>
                                <div className="meta-item">
                                  <Star size={16} />
                                  <span>Rating: 4.8 (127 reviews)</span>
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
                              {timeSlots.map(time => (
                                <button
                                  key={time}
                                  className={`time-option ${selectedTime === time ? 'selected' : ''}`}
                                  onClick={() => setSelectedTime(time)}
                                >
                                  {time}
                                </button>
                              ))}
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
                            <label className="payment-option">
                              <input
                                type="radio"
                                name="payment"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              <div className="payment-info">
                                <CreditCard size={20} />
                                <span>Credit/Debit Card</span>
                              </div>
                            </label>
                            <label className="payment-option">
                              <input
                                type="radio"
                                name="payment"
                                value="upi"
                                checked={paymentMethod === 'upi'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              <div className="payment-info">
                                <div className="upi-icon">💳</div>
                                <span>UPI Payment</span>
                              </div>
                            </label>
                            <label className="payment-option">
                              <input
                                type="radio"
                                name="payment"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              <div className="payment-info">
                                <div className="cod-icon">💰</div>
                                <span>Cash on Service</span>
                              </div>
                            </label>
                          </div>
                          <div className="security-info">
                            <Shield size={16} />
                            <span>Your payment information is secure and encrypted</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Footer */}
                <div className="booking-footer">
                  <div className="total-summary">
                    <div className="total-row">
                      <span>Total Amount</span>
                      <span className="total-amount">₹{total}</span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    <div className="action-left">
                      {currentStep > 1 && (
                        <button className="btn-secondary" onClick={prevStep}>
                          <ArrowLeft size={16} />
                          Previous
                        </button>
                      )}
                      <button className="btn-cancel" onClick={onClose}>
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                    
                    <div className="action-right">
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
              </>
            ) : (
              /* Success State */
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
                          <span className="detail-value">{service.name}</span>
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
                        onClose();
                      }}
                    >
                      <Shield size={18} />
                      View Booking Details
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal; 