import React from 'react';
import { Home, Shield, Heart, Car, PawPrint, User, ShieldCheck } from 'lucide-react';
import './ServicesPage.css';

const ServicesPage = () => {
  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <h1>Comprehensive <span className="text-primary">Home Care Solutions</span></h1>
          <p>From standard maintenance to specialized elderly care, we provide professional, 
             AI-supervised services tailored to your family's unique needs.</p>
        </div>
      </section>

      {/* Standard Home Maintenance */}
      <section className="service-section">
        <div className="container">
          <div className="service-header">
            <Home className="service-main-icon" />
            <div>
              <h2>Standard Home Maintenance</h2>
              <p>Complete home maintenance solutions for everyday needs</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🔧</div>
              <h3>Plumbing</h3>
              <p>Professional plumbing repairs, installations, and maintenance services</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Electrical</h3>
              <p>Safe and reliable electrical work by certified professionals</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔨</div>
              <h3>Carpentry</h3>
              <p>Custom woodwork, repairs, and furniture assembly services</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🧹</div>
              <h3>Cleaning</h3>
              <p>Thorough home cleaning services for a spotless living environment</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔧</div>
              <h3>Appliance Repair</h3>
              <p>Expert repair services for all household appliances</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌿</div>
              <h3>Gardening/Landscaping</h3>
              <p>Beautiful garden maintenance and landscaping services</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🐛</div>
              <h3>Pest Control</h3>
              <p>Safe and effective pest control solutions for your home</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🎨</div>
              <h3>Painting</h3>
              <p>Professional interior and exterior painting services</p>
            </div>
          </div>
          
          <button className="learn-more-btn">Learn More</button>
        </div>
      </section>

      {/* Migrant Homeowner Services */}
      <section className="service-section alt-bg">
        <div className="container">
          <div className="service-header">
            <ShieldCheck className="service-main-icon" />
            <div>
              <h2>Migrant Homeowner Services</h2>
              <p>Specialized services for families living away from home</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">👁️</div>
              <h3>Property Supervision</h3>
              <p>Regular property monitoring and maintenance oversight</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📄</div>
              <h3>Utility Bill Management</h3>
              <p>Complete utility bill handling and payment coordination</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📬</div>
              <h3>Mail Collection & Forwarding</h3>
              <p>Secure mail collection and forwarding services</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📞</div>
              <h3>Emergency Contact & Liaison</h3>
              <p>24/7 emergency response and local coordination</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏠</div>
              <h3>Home Opening/Closing Services</h3>
              <p>Seasonal property preparation and security services</p>
            </div>
          </div>
          
          <button className="learn-more-btn">Learn More</button>
        </div>
      </section>

      {/* Elderly Care Support */}
      <section className="service-section">
        <div className="container">
          <div className="service-header">
            <Heart className="service-main-icon" />
            <div>
              <h2>Elderly Care Support</h2>
              <p>Compassionate care and assistance for seniors</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">⏰</div>
              <h3>Daily Routine Assistance</h3>
              <p>Support with daily activities and routine maintenance</p>
            </div>
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Companionship</h3>
              <p>Friendly companionship and social interaction services</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏃</div>
              <h3>Errand Running</h3>
              <p>Shopping, pharmacy visits, and essential errands</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>Appointment Management</h3>
              <p>Medical appointment scheduling and transportation</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🛡️</div>
              <h3>Safety Monitoring</h3>
              <p>Regular wellness checks and safety assessments</p>
            </div>
          </div>
          
          <button className="learn-more-btn">Learn More</button>
        </div>
      </section>

      {/* Driver Services */}
      <section className="service-section alt-bg">
        <div className="container">
          <div className="service-header">
            <Car className="service-main-icon" />
            <div>
              <h2>Driver Services</h2>
              <p>Professional transportation and vehicle management</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🚗</div>
              <h3>Personal Driver for Family Car</h3>
              <p>Professional driving services using your family vehicle</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔧</div>
              <h3>Vehicle Maintenance Coordination</h3>
              <p>Complete vehicle maintenance scheduling and oversight</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⛽</div>
              <h3>Fueling Services</h3>
              <p>Regular vehicle fueling and maintenance checks</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3>Documentation Assistance</h3>
              <p>Vehicle registration and documentation support</p>
            </div>
          </div>
          
          <button className="learn-more-btn">Learn More</button>
        </div>
      </section>

      {/* Pet Care Services */}
      <section className="service-section">
        <div className="container">
          <div className="service-header">
            <PawPrint className="service-main-icon" />
            <div>
              <h2>Minimal Pet Care Services</h2>
              <p>Essential pet care for busy families and travelers</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">❤️</div>
              <h3>Pet Feeding & Hydration</h3>
              <p>Regular feeding schedules and fresh water maintenance</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3>Basic Pet Health Reporting</h3>
              <p>Health monitoring and status updates for pet owners</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🧹</div>
              <h3>Litter Box/Cage Spot Cleaning</h3>
              <p>Regular cleaning and maintenance of pet areas</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🐕</div>
              <h3>Pet Companionship Check-ins</h3>
              <p>Regular visits to provide companionship and care</p>
            </div>
          </div>
          
          <button className="learn-more-btn">Learn More</button>
        </div>
      </section>

      {/* Dedicated Caretaker Services */}
      <section className="service-section alt-bg">
        <div className="container">
          <div className="service-header">
            <User className="service-main-icon" />
            <div>
              <h2>Dedicated Caretaker Services</h2>
              <p>Long-term personalized care for elderly people</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>Long-Term/Scheduled Care</h3>
              <p>Consistent, scheduled care services for ongoing support</p>
            </div>
            <div className="service-card">
              <div className="service-icon">❤️</div>
              <h3>Personalized Care Plans</h3>
              <p>Customized care plans tailored to individual needs</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏥</div>
              <h3>Health Monitoring & Reporting</h3>
              <p>Regular health assessments and family updates</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🚨</div>
              <h3>Emergency Response Coordination</h3>
              <p>24/7 emergency response and medical coordination</p>
            </div>
          </div>
          
          <button className="learn-more-btn">Learn More</button>
        </div>
      </section>

      {/* Security Guard Services */}
      <section className="service-section">
        <div className="container">
          <div className="service-header">
            <Shield className="service-main-icon" />
            <div>
              <h2>Security Guard Services</h2>
              <p>Professional security and property protection</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>On-Demand Security</h3>
              <p>Immediate security response when you need it most</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⏰</div>
              <h3>Regular Guarding</h3>
              <p>Scheduled security patrols and property monitoring</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏠</div>
              <h3>Property Monitoring</h3>
              <p>Continuous surveillance and property protection</p>
            </div>
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Access Control</h3>
              <p>Visitor management and access control services</p>
            </div>
          </div>
          
          <button className="learn-more-btn">Learn More</button>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="emergency-section">
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

export default ServicesPage; 