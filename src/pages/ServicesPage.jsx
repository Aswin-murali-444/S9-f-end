import React, { useEffect } from 'react';
import { Home, Shield, Heart, Car, Truck, User, ShieldCheck, Camera, Brain, UserCheck } from 'lucide-react';
import './ServicesPage.css';

const ServicesPage = () => {
  

  // Handle hash navigation and smooth scrolling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 100);
        }
      }
    };

    // Handle initial load with hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <h1>Comprehensive <span className="text-primary">Smart Home Solutions</span></h1>
          <p>From AI-powered maintenance to specialized elderly care, we provide professional, 
             smart camera-monitored services tailored to your family's unique needs.</p>
        </div>
      </section>

      {/* Smart Home Maintenance */}
      <section id="smart-maintenance" className="service-section">
        <div className="container">
          <div className="service-header">
            <Home className="service-main-icon" />
            <div>
              <h2>Smart Home Maintenance</h2>
              <p>AI-supervised maintenance with real-time progress tracking</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card" data-aos="fade-up">
              <div className="service-icon">🔧</div>
              <h3>Plumbing & Electrical</h3>
              <p>Professional repairs with AI-monitored quality assurance</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="100">
              <div className="service-icon">🔨</div>
              <h3>Carpentry & Repairs</h3>
              <p>Custom woodwork and repairs with smart scheduling</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="150">
              <div className="service-icon">🧹</div>
              <h3>Cleaning & Maintenance</h3>
              <p>AI-coordinated cleaning services with quality monitoring</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="200">
              <div className="service-icon">🔧</div>
              <h3>Appliance Services</h3>
              <p>Smart appliance repair with predictive maintenance</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="250">
              <div className="service-icon">🌿</div>
              <h3>Landscaping & Gardening</h3>
              <p>AI-scheduled garden maintenance and landscaping</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="300">
              <div className="service-icon">🐛</div>
              <h3>Pest Control</h3>
              <p>Smart pest control with monitoring and prevention</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="350">
              <div className="service-icon">🎨</div>
              <h3>Painting & Renovation</h3>
              <p>Professional painting with AI quality monitoring</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="400">
              <div className="service-icon">📱</div>
              <h3>Smart Home Integration</h3>
              <p>IoT device installation and smart home setup</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about smart home maintenance services">Learn More</button>
        </div>
      </section>

      {/* Smart Camera & Security */}
      <section id="smart-security" className="service-section alt-bg">
        <div className="container">
          <div className="service-header">
            <Camera className="service-main-icon" />
            <div>
              <h2>Smart Camera & Security</h2>
              <p>Professional security camera installation and AI monitoring</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📹</div>
              <h3>Security Camera Installation</h3>
              <p>Professional camera setup with mobile app integration</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Remote Monitoring Setup</h3>
              <p>24/7 remote access to your property via mobile</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🤖</div>
              <h3>AI Motion Detection</h3>
              <p>Smart alerts with false alarm filtering</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>Cloud Storage Solutions</h3>
              <p>Secure cloud recording with easy access</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌙</div>
              <h3>Night Vision & Analytics</h3>
              <p>Advanced night monitoring with AI analytics</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🚨</div>
              <h3>Emergency Alert System</h3>
              <p>Instant notifications for security threats</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏠</div>
              <h3>Property Surveillance</h3>
              <p>Comprehensive property monitoring coverage</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Mobile App Integration</h3>
              <p>Easy control and monitoring from anywhere</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about smart camera and security services">Learn More</button>
        </div>
      </section>

      {/* AI-Powered Elder Care */}
      <section id="elder-care" className="service-section">
        <div className="container">
          <div className="service-header">
            <Heart className="service-main-icon" />
            <div>
              <h2>AI-Powered Elder Care</h2>
              <p>Compassionate care with health monitoring and emergency alerts</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">⏰</div>
              <h3>Daily Routine Assistance</h3>
              <p>AI-coordinated daily care and routine support</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💊</div>
              <h3>Medication Management</h3>
              <p>Smart medication reminders and tracking</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏥</div>
              <h3>Health Monitoring & Reports</h3>
              <p>AI-powered health tracking and family updates</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🚨</div>
              <h3>Emergency Response System</h3>
              <p>24/7 emergency detection and response</p>
            </div>
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Companionship Services</h3>
              <p>AI-matched companionship and social interaction</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>Appointment Coordination</h3>
              <p>Smart scheduling for medical appointments</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🛡️</div>
              <h3>Safety & Fall Detection</h3>
              <p>AI-powered safety monitoring and alerts</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Family Communication</h3>
              <p>Real-time updates and family notifications</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about AI-powered elder care services">Learn More</button>
        </div>
      </section>

      {/* Smart Delivery & Transport */}
      <section id="delivery-transport" className="service-section alt-bg">
        <div className="container">
          <div className="service-header">
            <Truck className="service-main-icon" />
            <div>
              <h2>Smart Delivery & Transport</h2>
              <p>AI-coordinated delivery and transportation services</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🚚</div>
              <h3>Home Essentials Delivery</h3>
              <p>AI-optimized delivery of daily necessities</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💊</div>
              <h3>Medicine & Healthcare Items</h3>
              <p>Priority delivery for medical supplies</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🚗</div>
              <h3>Elderly Transportation</h3>
              <p>Safe transport with real-time tracking</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📦</div>
              <h3>Package & Grocery Delivery</h3>
              <p>Smart delivery scheduling and tracking</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏥</div>
              <h3>Medical Appointment Transport</h3>
              <p>Reliable medical transportation service</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Same-Day Express Service</h3>
              <p>Urgent delivery with AI route optimization</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Real-Time Tracking</h3>
              <p>Live delivery status and ETA updates</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🤖</div>
              <h3>AI Route Optimization</h3>
              <p>Efficient delivery routes and scheduling</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about smart delivery and transport services">Learn More</button>
        </div>
      </section>

      {/* Professional Caretaker Services */}
      <section id="caretaker-services" className="service-section">
        <div className="container">
          <div className="service-header">
            <UserCheck className="service-main-icon" />
            <div>
              <h2>Professional Caretaker Services</h2>
              <p>Long-term personalized care with health monitoring</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>Long-Term Care Plans</h3>
              <p>AI-coordinated long-term care strategies</p>
            </div>
            <div className="service-card">
              <div className="service-icon">❤️</div>
              <h3>Personalized Care Routines</h3>
              <p>Customized care plans for individual needs</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏥</div>
              <h3>Health Status Reporting</h3>
              <p>Regular health assessments and updates</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🚨</div>
              <h3>Emergency Response</h3>
              <p>24/7 emergency care coordination</p>
            </div>
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Family Communication</h3>
              <p>Real-time family updates and coordination</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Digital Care Records</h3>
              <p>AI-powered care documentation and tracking</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔄</div>
              <h3>Progress Monitoring</h3>
              <p>AI analytics for care quality improvement</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3>Care Quality Assurance</h3>
              <p>Continuous quality monitoring and improvement</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about professional caretaker services">Learn More</button>
        </div>
      </section>

      {/* Smart Bill Management */}
      <section id="bill-management" className="service-section alt-bg">
        <div className="container">
          <div className="service-header">
            <ShieldCheck className="service-main-icon" />
            <div>
              <h2>Smart Bill Management</h2>
              <p>AI-powered bill payment and utility management</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Automated Bill Payments</h3>
              <p>AI-scheduled automatic bill processing</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏛️</div>
              <h3>Property Tax Management</h3>
              <p>Smart tax payment and tracking system</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💧</div>
              <h3>Utility Bill Processing</h3>
              <p>AI-optimized utility bill management</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌐</div>
              <h3>Internet & Cable Services</h3>
              <p>Smart telecom bill coordination</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Mobile & Phone Bills</h3>
              <p>Automated mobile bill management</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏥</div>
              <h3>Insurance Premiums</h3>
              <p>AI-coordinated insurance payments</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3>Smart Reminders & Alerts</h3>
              <p>Intelligent payment reminders and notifications</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>Payment Analytics</h3>
              <p>AI-powered spending analysis and insights</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about smart bill management services">Learn More</button>
        </div>
      </section>

      {/* Remote Property Management */}
      <section id="property-management" className="service-section">
        <div className="container">
          <div className="service-header">
            <Home className="service-main-icon" />
            <div>
              <h2>Remote Property Management</h2>
              <p>AI-monitored property supervision for migrant families</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📹</div>
              <h3>Smart Camera Monitoring</h3>
              <p>24/7 AI-powered property surveillance</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔐</div>
              <h3>Access Control Management</h3>
              <p>Smart access control and visitor management</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📬</div>
              <h3>Mail & Package Handling</h3>
              <p>Secure mail collection and forwarding</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏠</div>
              <h3>Property Opening/Closing</h3>
              <p>Seasonal property preparation services</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about remote property management services">Learn More</button>
        </div>
      </section>

      {/* AI Service Coordination */}
      <section id="ai-coordination" className="service-section alt-bg">
        <div className="container">
          <div className="service-header">
            <Brain className="service-main-icon" />
            <div>
              <h2>AI Service Coordination</h2>
              <p>Intelligent scheduling and service provider allocation</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>Smart Appointment Scheduling</h3>
              <p>AI-optimized service scheduling system</p>
            </div>
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Provider Matching Algorithm</h3>
              <p>Intelligent service provider selection</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>Performance Analytics</h3>
              <p>AI-powered service quality analysis</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔄</div>
              <h3>Quality Assurance Monitoring</h3>
              <p>Continuous service quality improvement</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about AI service coordination services">Learn More</button>
        </div>
      </section>

      {/* Security & Monitoring */}
      <section id="security-monitoring" className="service-section">
        <div className="container">
          <div className="service-header">
            <Shield className="service-main-icon" />
            <div>
              <h2>Security & Monitoring</h2>
              <p>Professional security with AI-powered threat detection</p>
            </div>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">👮</div>
              <h3>On-Demand Security Guards</h3>
              <p>Professional security personnel when needed</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📹</div>
              <h3>24/7 Camera Monitoring</h3>
              <p>Continuous AI-powered surveillance</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🚨</div>
              <h3>AI Threat Detection</h3>
              <p>Smart security threat identification</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Real-Time Alerts</h3>
              <p>Instant security notifications</p>
            </div>
          </div>
          
          <button className="learn-more-btn" aria-label="Learn more about security and monitoring services">Learn More</button>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="emergency-section">
        <div className="container">
          <div className="emergency-content">
            <h2>Emergency Services</h2>
            <p>For urgent care needs or emergency situations, call our 24/7 AI-monitored hotline immediately.</p>
            <a href="tel:+15559110000" className="emergency-number">+1 (555) 911-CARE</a>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default ServicesPage; 