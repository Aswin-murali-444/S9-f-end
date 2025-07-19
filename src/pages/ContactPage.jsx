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
          <h1>Ready to <span className="text-primary">Get Started?</span></h1>
          <p>Contact our care coordination team to discuss your family's unique needs. We're here 
             to provide personalized solutions that give you peace of mind.</p>
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
                <p>Tell us about your needs and we'll create a personalized care plan for your family.</p>
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
                    <option value="home-maintenance">Standard Home Maintenance</option>
                    <option value="migrant-services">Migrant Homeowner Services</option>
                    <option value="elderly-care">Elderly Care Support</option>
                    <option value="driver-services">Driver Services</option>
                    <option value="pet-care">Pet Care Services</option>
                    <option value="caretaker">Dedicated Caretaker Services</option>
                    <option value="security">Security Guard Services</option>
                    <option value="emergency">Emergency Services</option>
                    <option value="consultation">General Consultation</option>
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
                    <p>Speak directly with our care coordinators</p>
                    <a href="tel:+15551234567" className="contact-link">+1 (555) 123-4567</a>
                    <span className="availability">24/7 Emergency Support</span>
                  </div>
                </div>

                <div className="contact-method">
                  <Mail className="contact-icon" />
                  <div className="contact-details">
                    <h3>Email Us</h3>
                    <p>Send us your questions and requests</p>
                    <a href="mailto:care@homemaintain.com" className="contact-link">care@homemaintain.com</a>
                    <span className="availability">Response within 2 hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <Headphones className="contact-icon" />
                  <div className="contact-details">
                    <h3>Live Chat</h3>
                    <p>Instant support through our website</p>
                    <span className="contact-link">Available on this website</span>
                    <span className="availability">24/7 AI + Human Support</span>
                  </div>
                </div>

                <div className="contact-method">
                  <Calendar className="contact-icon" />
                  <div className="contact-details">
                    <h3>Schedule a Consultation</h3>
                    <p>Book a free consultation to discuss your family's specific needs.</p>
                    <button className="consultation-btn" aria-label="Book a free consultation to discuss your family's needs">Book Consultation</button>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="service-areas">
                <h3>✅ Our Service Areas</h3>
                <ul className="areas-list">
                  <li>✅ Standard Home Maintenance</li>
                  <li>✅ Migrant Family Support</li>
                  <li>✅ Elderly Care Services</li>
                  <li>✅ Driver & Vehicle Services</li>
                  <li>✅ Security & Monitoring</li>
                  <li>✅ Emergency Response</li>
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
            <h2>Emergency Services</h2>
            <p>For urgent care needs or emergency situations, call our 24/7 hotline immediately.</p>
            <a href="tel:+15559110000" className="emergency-number">+1 (555) 911-CARE</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 