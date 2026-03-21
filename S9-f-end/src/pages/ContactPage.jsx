import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Phone, Mail, MapPin, Send, MessageSquare, Calendar, Headphones } from 'lucide-react';
import { useContactForm } from '../hooks/useModernFeatures';
import LoadingSpinner from '../components/LoadingSpinner';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    serviceType: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Need help with <span className="text-primary">Nexus Services?</span></h1>
          <p>Reach our support team for bookings, provider onboarding, dashboard help,
             and service coordination queries.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-header">
                <Send className="form-icon" />
                <h2>Send Us a Message</h2>
                <p>Share your requirement and our team will guide you with the right service flow.</p>
              </div>
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="serviceType">Service Type</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    aria-label="Select service type"
                  >
                    <option value="">Select a service...</option>
                    <option value="home-maintenance">Home Maintenance</option>
                    <option value="elderly-care">Elder Care Support</option>
                    <option value="transport-delivery">Transport & Delivery</option>
                    <option value="team-jobs">Team Job Services</option>
                    <option value="provider-onboarding">Provider Onboarding</option>
                    <option value="dashboard-support">Dashboard / Login Support</option>
                    <option value="billing-payments">Billing & Payments</option>
                    <option value="general">General Query</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your specific needs and requirements..."
                    rows="5"
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn">
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info-section">
              <div className="contact-methods">
                <div className="contact-method">
                  <Phone className="contact-icon" />
                  <div className="contact-details">
                    <h3>Call Us</h3>
                    <p>Speak directly with our operations desk</p>
                    <a href="tel:+919876543210" className="contact-link">+91 98765 43210</a>
                    <span className="availability">Daily support hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <Mail className="contact-icon" />
                  <div className="contact-details">
                    <h3>Email Us</h3>
                    <p>Send us your questions and requests</p>
                    <a href="mailto:support@nexusservices.in" className="contact-link">support@nexusservices.in</a>
                    <span className="availability">Response within business hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <Headphones className="contact-icon" />
                  <div className="contact-details">
                    <h3>Live Chat</h3>
                    <p>Quick help through your dashboard</p>
                    <span className="contact-link">Available on this website</span>
                    <span className="availability">In-app support</span>
                  </div>
                </div>

                <div className="contact-method">
                  <Calendar className="contact-icon" />
                  <div className="contact-details">
                    <h3>Schedule a Consultation</h3>
                    <p>Book a callback to plan your service workflow.</p>
                    <button className="consultation-btn" aria-label="Book a callback consultation">Book Consultation</button>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="service-areas">
                <h3>✅ What We Support</h3>
                <ul className="areas-list">
                  <li>✅ Home Maintenance Services</li>
                  <li>✅ Team-Based Specialist Jobs</li>
                  <li>✅ Elderly Care Services</li>
                  <li>✅ Driver & Vehicle Services</li>
                  <li>✅ Booking, Billing & Notifications</li>
                  <li>✅ Provider/Admin Dashboard Support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="emergency-contact">
        <div className="container">
          <div className="emergency-content">
            <h2>Priority Support</h2>
            <p>For urgent booking or service issues, contact the priority support line.</p>
            <a href="tel:+919876540000" className="emergency-number">+91 98765 40000</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 