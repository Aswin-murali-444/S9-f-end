import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Users, Star, Home, Heart, Car, ShieldCheck } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={20} />
              AI-Driven Home Care Platform
            </div>
            <h1 className="hero-title">
              Professional <span className="text-primary">Home Maintenance</span> & Care Services
            </h1>
            <p className="hero-description">
              Comprehensive home support solutions for local residents and migrant families. 
              Specialized elderly care, smart maintenance, and personalized assistance with 
              AI-powered quality assurance.
            </p>
            
            <div className="hero-features">
              <div className="hero-feature">
                <Users size={20} />
                <span>Elderly Care Specialists</span>
                <small>Dedicated support</small>
              </div>
              <div className="hero-feature">
                <Clock size={20} />
                <span>24/7 Availability</span>
                <small>Round-the-clock service</small>
              </div>
            </div>
            
            <div className="hero-actions">
              <Link to="/services" className="btn-primary">
                Book Service Now →
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <h3>500+</h3>
                <p>Happy Families</p>
              </div>
              <div className="stat">
                <h3>98%</h3>
                <p>Satisfaction Rate</p>
              </div>
              <div className="stat">
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                  ))}
                </div>
                <p>4.9/5 Rating</p>
              </div>
            </div>
          </div>
          
          <div className="hero-features-grid">
            <div className="feature-card">
              <Shield className="feature-icon" />
              <h4>Secure & Trusted</h4>
              <p>Background-verified professionals</p>
            </div>
            <div className="feature-card">
              <Clock className="feature-icon" />
              <h4>24/7 Support</h4>
              <p>Emergency response available</p>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" />
              <h4>Specialized Care</h4>
              <p>Elderly & migrant family support</p>
            </div>
            <div className="feature-card">
              <Star className="feature-icon" />
              <h4>AI-Powered</h4>
              <p>Smart quality assurance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-overview">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🔧 Our Services</span>
            <h2>Comprehensive <span className="text-primary">Home Care Solutions</span></h2>
            <p>From standard maintenance to specialized elderly care, we provide professional, 
               AI-supervised services tailored to your family's unique needs.</p>
          </div>
          
          <div className="services-grid">
            <div className="service-category">
              <div className="service-icon">
                <Home />
              </div>
              <h3>Standard Home Maintenance</h3>
              <p>Complete home maintenance solutions for everyday needs</p>
              <ul className="service-list">
                <li>🔧 Plumbing</li>
                <li>⚡ Electrical</li>
                <li>🔨 Carpentry</li>
                <li>🧹 Cleaning</li>
                <li>🔧 Appliance Repair</li>
                <li>🌿 Gardening/Landscaping</li>
                <li>🐛 Pest Control</li>
                <li>🎨 Painting</li>
              </ul>
              <Link to="/services" className="service-link">Learn More</Link>
            </div>

            <div className="service-category">
              <div className="service-icon">
                <ShieldCheck />
              </div>
              <h3>Migrant Homeowner Services</h3>
              <p>Specialized services for families living away from home</p>
              <ul className="service-list">
                <li>🏠 Property Supervision</li>
                <li>📄 Utility Bill Management</li>
                <li>📬 Mail Collection & Forwarding</li>
                <li>🏠 Home Opening/Closing Services</li>
              </ul>
              <Link to="/services" className="service-link">Learn More</Link>
            </div>

            <div className="service-category">
              <div className="service-icon">
                <Heart />
              </div>
              <h3>Elderly Care Support</h3>
              <p>Compassionate care and assistance for seniors</p>
              <ul className="service-list">
                <li>⏰ Daily Routine Assistance</li>
                <li>👥 Companionship</li>
                <li>🏃 Errand Running</li>
                <li>📅 Appointment Management</li>
                <li>🛡️ Safety Monitoring</li>
              </ul>
              <Link to="/services" className="service-link">Learn More</Link>
            </div>

            <div className="service-category">
              <div className="service-icon">
                <Car />
              </div>
              <h3>Driver Services</h3>
              <p>Professional transportation and vehicle management</p>
              <ul className="service-list">
                <li>🚗 Personal Driver for Family Car</li>
                <li>⛽ Fueling Services</li>
              </ul>
              <Link to="/services" className="service-link">Learn More</Link>
            </div>

            <div className="service-category">
              <div className="service-icon">
                <ShieldCheck />
              </div>
              <h3>CCTV Installation</h3>
              <p>Professional security camera installation and monitoring</p>
              <ul className="service-list">
                <li>📹 Security Camera Installation</li>
                <li>📱 Remote Monitoring Setup</li>
                <li>🔧 System Maintenance</li>
                <li>📊 Recording & Storage Solutions</li>
                <li>🚨 Motion Detection Setup</li>
                <li>🌙 Night Vision Configuration</li>
              </ul>
              <Link to="/services" className="service-link">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="additional-services">
        <div className="container">
          <div className="services-row">
            <div className="service-card">
              <div className="service-icon-small">🐾</div>
              <h4>Minimal Pet Care Services</h4>
              <p>Essential pet care for busy families and travelers</p>
              <ul className="mini-list">
                <li>❤️ Pet Feeding & Hydration</li>
                <li>🧹 Basic Pet Health Reporting</li>
                <li>🧹 Litter Box/Cage Spot Cleaning</li>
                <li>🐕 Pet Companionship Check-ins</li>
              </ul>
              <Link to="/services" className="learn-more">Learn More</Link>
            </div>

            <div className="service-card">
              <div className="service-icon-small">👤</div>
              <h4>Dedicated Caretaker Services</h4>
              <p>Long-term personalized care for elderly people</p>
              <ul className="mini-list">
                <li>📅 Long-Term/Scheduled Care</li>
                <li>❤️ Personalized Care Plans</li>
                <li>🏥 Health Monitoring & Reporting</li>
                <li>🚨 Emergency Response Coordination</li>
              </ul>
              <Link to="/services" className="learn-more">Learn More</Link>
            </div>

            <div className="service-card">
              <div className="service-icon-small">🛡️</div>
              <h4>Security Guard Services</h4>
              <p>Professional security and property protection</p>
              <ul className="mini-list">
                <li>⚡ On-Demand Security</li>
                <li>⏰ Regular Guarding</li>
                <li>🏠 Property Monitoring</li>
                <li>👥 Access Control</li>
              </ul>
              <Link to="/services" className="learn-more">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <div className="container">
          <h2>Why Choose Our Platform?</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <Shield className="benefit-icon" />
              <h3>AI-Supervised Quality</h3>
              <p>Advanced AI monitoring ensures consistent service quality and rapid issue resolution.</p>
            </div>
            <div className="benefit">
              <Users className="benefit-icon" />
              <h3>Migrant Family Focus</h3>
              <p>Specialized services designed for families living away from their homes.</p>
            </div>
            <div className="benefit">
              <Heart className="benefit-icon" />
              <h3>Elderly Care Expertise</h3>
              <p>Compassionate, professional care tailored for senior family members.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Platform */}
      <section className="about-platform">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">💙 About Our Platform</span>
            <h2>Redefining <span className="text-primary">Home Care</span> with Technology</h2>
            <p>Our AI-driven platform transforms traditional home maintenance into an intelligent, 
               responsive ecosystem that adapts to your family's unique needs and circumstances.</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <Users className="stat-icon" />
              <h3>500+</h3>
              <p>Families Served</p>
            </div>
            <div className="stat-card">
              <Star className="stat-icon" />
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
            <div className="stat-card">
              <Clock className="stat-icon" />
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
            <div className="stat-card">
              <ShieldCheck className="stat-icon" />
              <h3>99.9%</h3>
              <p>Reliability Score</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 