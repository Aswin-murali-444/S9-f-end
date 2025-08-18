import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, service }) => {
  const { user, isAuthenticated } = useAuth();
  const [bookingData, setBookingData] = useState({
    service: service?.name || '',
    date: '',
    time: '',
    address: '',
    description: '',
    urgency: 'normal',
    contactPhone: '',
    contactEmail: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to book services');
      return;
    }

    if (!bookingData.date || !bookingData.time || !bookingData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically send the booking data to your backend
      // For now, we'll simulate a successful booking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Booking submitted successfully! We\'ll contact you soon.');
      onClose();
      setBookingData({
        service: '',
        date: '',
        time: '',
        address: '',
        description: '',
        urgency: 'normal',
        contactPhone: '',
        contactEmail: ''
      });
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="modal-header">
          <h2>Book Service</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="service-info">
          <div className="service-icon">{service?.icon}</div>
          <div>
            <h3>{service?.name}</h3>
            <p>{service?.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>
              <Calendar size={20} />
              Preferred Date *
            </label>
            <input
              type="date"
              value={bookingData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>
              <Clock size={20} />
              Preferred Time *
            </label>
            <select
              value={bookingData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              required
            >
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <MapPin size={20} />
              Service Address *
            </label>
            <textarea
              value={bookingData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your complete address"
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>
              <User size={20} />
              Service Description
            </label>
            <textarea
              value={bookingData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your specific needs or requirements"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>
              <Clock size={20} />
              Urgency Level
            </label>
            <select
              value={bookingData.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value)}
            >
              <option value="low">Low - Flexible timing</option>
              <option value="normal">Normal - Standard service</option>
              <option value="high">High - Urgent need</option>
              <option value="emergency">Emergency - Immediate attention</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Phone size={20} />
                Contact Phone
              </label>
              <input
                type="tel"
                value={bookingData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Your phone number"
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={20} />
                Contact Email
              </label>
              <input
                type="email"
                value={bookingData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Your email address"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Book Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 