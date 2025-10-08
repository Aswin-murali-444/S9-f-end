import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Clock, MapPin, User, Phone, MessageSquare, 
  CreditCard, Shield, CheckCircle, AlertCircle, Star, 
  ChevronDown, ChevronUp
} from 'lucide-react';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, service, user }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    serviceDetails: true,
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
      setStep(1);
      setSelectedDate('');
      setSelectedTime('');
      setAddress('');
      setPhone('');
      setNotes('');
      setPaymentMethod('card');
      setExpandedSections({
        serviceDetails: true,
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
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
                    <p>Complete your booking in just a few steps</p>
                  </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

                {/* Progress Indicator */}
                <div className="booking-progress">
                  <div className="progress-step">
                    <div className={`progress-dot ${selectedDate && selectedTime ? 'completed' : 'active'}`}>
                      {selectedDate && selectedTime ? <CheckCircle size={16} /> : '1'}
                    </div>
                    <span>Schedule</span>
                  </div>
                  <div className="progress-line"></div>
                  <div className="progress-step">
                    <div className={`progress-dot ${address && phone ? 'completed' : selectedDate && selectedTime ? 'active' : ''}`}>
                      {address && phone ? <CheckCircle size={16} /> : '2'}
                    </div>
                    <span>Location</span>
                  </div>
                  <div className="progress-line"></div>
                  <div className="progress-step">
                    <div className={`progress-dot ${address && phone ? 'active' : 'pending'}`}>
                      3
                    </div>
                    <span>Payment</span>
          </div>
        </div>

                <div className="booking-content">
                  {/* Service Details Section */}
                  <div className="booking-section">
                    <button 
                      className="section-header"
                      onClick={() => toggleSection('serviceDetails')}
                    >
                      <div className="section-title">
                        <div className="service-icon">
                          {service.icon_url ? (
                            <img src={service.icon_url} alt={service.name} />
                          ) : (
                            <div className="default-icon">🔧</div>
                          )}
                        </div>
                        <div>
                          <h3>{service.name}</h3>
                          <p className="service-description">{service.description}</p>
                          <div className="section-status">
                            <CheckCircle size={16} />
                            <span>Service Details</span>
                          </div>
                        </div>
                      </div>
                      {expandedSections.serviceDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedSections.serviceDetails && (
                      <motion.div 
                        className="section-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="service-details">
                          <div className="detail-row">
                            <Clock size={16} />
                            <span>Duration: {service.duration || '1 hour'}</span>
                          </div>
                          <div className="detail-row">
                            <Star size={16} />
                            <span>Rating: 4.8 (127 reviews)</span>
                          </div>
                          <div className="price-breakdown">
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
                      </motion.div>
                    )}
                  </div>

                  {/* Scheduling Section */}
                  <div className="booking-section">
                    <button 
                      className="section-header"
                      onClick={() => toggleSection('scheduling')}
                    >
                      <div className="section-title">
                        <div className="section-icon">
                          <Calendar size={24} />
                        </div>
                        <div className="section-text">
                          <h3>Select Date & Time</h3>
                          <div className="section-status">
                            {selectedDate && selectedTime ? (
                              <>
                                <CheckCircle size={18} />
                                <span>Selected: {formatDisplayDate(selectedDate)} at {selectedTime}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={18} />
                                <span>Choose your preferred slot</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {expandedSections.scheduling ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedSections.scheduling && (
                      <motion.div 
                        className="section-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
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
                      </motion.div>
                    )}
          </div>

                  {/* Location Section */}
                  <div className="booking-section">
                    <button 
                      className="section-header"
                      onClick={() => toggleSection('location')}
                    >
                      <div className="section-title">
                        <div className="section-icon">
                          <MapPin size={24} />
                        </div>
                        <div className="section-text">
                          <h3>Service Location</h3>
                          <div className="section-status">
                            {address && phone ? (
                              <>
                                <CheckCircle size={18} />
                                <span>Location & contact details provided</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={18} />
                                <span>Enter service address and contact</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {expandedSections.location ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedSections.location && (
                      <motion.div 
                        className="section-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="location-form">
          <div className="form-group">
                            <label>Service Address *</label>
            <textarea
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Enter complete address where service is needed"
                              rows={3}
                            />
                          </div>
                          <div className="form-group">
                            <label>Contact Number *</label>
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
                        </div>
                      </motion.div>
                    )}
          </div>

                  {/* Payment Section */}
                  <div className="booking-section">
                    <button 
                      className="section-header"
                      onClick={() => toggleSection('payment')}
                    >
                      <div className="section-title">
                        <div className="section-icon">
                          <CreditCard size={24} />
                        </div>
                        <div className="section-text">
                          <h3>Payment Method</h3>
                          <div className="section-status">
                            <CheckCircle size={18} />
                            <span>{paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Service'} selected</span>
                          </div>
                        </div>
                      </div>
                      {expandedSections.payment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedSections.payment && (
                      <motion.div 
                        className="section-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
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
                      </motion.div>
                    )}
                  </div>
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
                    <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
                    <button 
                      className="btn-primary"
                      onClick={handleBooking}
                      disabled={!selectedDate || !selectedTime || !address || !phone || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Processing Booking...
                        </>
                      ) : (
                        `Book Now - ₹${total}`
                      )}
            </button>
          </div>
                </div>
              </>
            ) : (
              /* Success State */
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal; 