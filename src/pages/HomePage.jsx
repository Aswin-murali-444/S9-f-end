import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Clock, Users, Star, Home, Heart, Car, ShieldCheck, Camera, Brain, Truck, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAnimations } from '../hooks/useAnimations';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [servicesRef, servicesInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  const {
    useTypingAnimation,
    useFloat,
    usePulse,
    useAnimatedInView,
    staggerAnimation
  } = useAnimations();

  // Enhanced animations
  const heroTitle = useTypingAnimation("Smart Home", 50);
  const floatOffset = useFloat(15, 4);
  const isPulsing = usePulse(3000);
  const { ref: statsRef, triggerAnimation: triggerStatsAnimation } = useAnimatedInView(0.2);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const handleServiceNavigation = (sectionId) => {
    navigate(`/services${sectionId}`);
    // Add a small delay to ensure the page loads before scrolling
    setTimeout(() => {
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="container">
          <motion.div 
            className="hero-content"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div 
              className={`hero-badge animate-bounce-in ${isPulsing ? 'animate-pulse-glow' : ''}`} 
              variants={itemVariants}
              style={{ transform: `translateY(${floatOffset}px)` }}
            >
              <Brain size={20} />
              AI-Enabled Smart Home Platform
            </motion.div>
            
            <motion.h1 
              className="hero-title text-reveal" 
              variants={itemVariants}
              style={{ minHeight: '2.5em' }}
            >
              {heroTitle}
              <span className="text-primary animate-shimmer">Maintenance & Family Support</span> Platform
            </motion.h1>
            
            <motion.p 
              className="hero-description animate-fade-in" 
              variants={itemVariants}
            >
              Manage household services and elder care remotely through our unified dashboard. 
              AI-powered scheduling, smart camera monitoring, and intelligent service allocation 
              for both urban and rural households.
            </motion.p>
            
            <div className="hero-features">
              <div className="hero-feature hover-lift">
                <Camera size={20} />
                <span>Smart Camera Integration</span>
                <small>Real-time monitoring</small>
              </div>
              <div className="hero-feature hover-lift">
                <Brain size={20} />
                <span>AI-Powered Services</span>
                <small>Intelligent scheduling</small>
              </div>
            </div>
            
            <div className="hero-actions">
              <Link to="/services" className="btn-primary btn-animate">
                Book Service Now →
              </Link>
              <Link to="/about" className="btn-secondary btn-animate">
                Learn More
              </Link>
            </div>
            
            <div className="hero-stats" ref={statsRef}>
              <div className="stat hover-scale">
                <h3 className="animate-bounce-in stagger-1">1000+</h3>
                <p>Happy Families</p>
              </div>
              <div className="stat hover-scale">
                <h3 className="animate-bounce-in stagger-2">99%</h3>
                <p>Satisfaction Rate</p>
              </div>
              <div className="stat hover-scale">
                <div className="rating animate-bounce-in stagger-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                  ))}
                </div>
                <p>4.9/5 Rating</p>
              </div>
            </div>
          </motion.div>
          
          <div className="hero-features-grid">
            <div className="feature-card card-hover animate-scale-in stagger-1">
              <Camera className="feature-icon animate-rotate-in" />
              <h4>Smart Monitoring</h4>
              <p>Real-time camera integration</p>
            </div>
            <div className="feature-card card-hover animate-scale-in stagger-2">
              <Brain className="feature-icon animate-rotate-in" />
              <h4>AI-Powered</h4>
              <p>Intelligent service allocation</p>
            </div>
            <div className="feature-card card-hover animate-scale-in stagger-3">
              <Shield className="feature-icon animate-rotate-in" />
              <h4>Role-Based Access</h4>
              <p>Secure collaboration</p>
            </div>
            <div className="feature-card card-hover animate-scale-in stagger-4">
              <Clock className="feature-icon animate-rotate-in" />
              <h4>24/7 Support</h4>
              <p>Round-the-clock service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-overview">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-badge animate-bounce-in">🔧 Our Services</span>
            <h2>Comprehensive <span className="text-primary animate-shimmer">Smart Home Solutions</span></h2>
            <p>From AI-powered maintenance to smart camera monitoring, we provide intelligent, 
               integrated services that adapt to your family's unique needs with real-time oversight.</p>
          </div>
          
          <div className="services-grid" ref={servicesRef}>
            <div className="service-category card-hover" data-aos="fade-up" data-aos-delay="100">
              <div className="service-icon animate-float">
                <Home />
              </div>
              <h3>Smart Home Maintenance</h3>
              <p>AI-enabled household services with intelligent scheduling</p>
              <ul className="service-list">
                <li>🔧 Plumbing & Electrical</li>
                <li>🔨 Carpentry & Repairs</li>
                <li>🧹 Cleaning & Maintenance</li>
                <li>🔧 Appliance Repair</li>
                <li>🌿 Gardening & Landscaping</li>
                <li>🐛 Pest Control</li>
                <li>🎨 Painting & Renovation</li>
                <li>📱 Smart Home Integration</li>
              </ul>
              <button 
                onClick={() => handleServiceNavigation('#smart-maintenance')} 
                className="service-link btn-animate"
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <span>Learn More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="service-category card-hover" data-aos="fade-up" data-aos-delay="200">
              <div className="service-icon animate-float">
                <Camera />
              </div>
              <h3>Smart Camera & Monitoring</h3>
              <p>Real-time remote monitoring with AI-powered anomaly detection</p>
              <ul className="service-list">
                <li>📹 Smart Camera Installation</li>
                <li>📱 Remote Monitoring Setup</li>
                <li>🧠 AI Anomaly Detection</li>
                <li>📊 Real-time Analytics</li>
                <li>🚨 Motion Detection Alerts</li>
                <li>🌙 Night Vision & Recording</li>
                <li>☁️ Cloud Storage Solutions</li>
                <li>🔒 Secure Access Control</li>
              </ul>
              <button 
                onClick={() => handleServiceNavigation('#smart-security')} 
                className="service-link btn-animate"
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <span>Learn More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="service-category card-hover" data-aos="fade-up" data-aos-delay="300">
              <div className="service-icon animate-float">
                <Heart />
              </div>
              <h3>AI-Powered Elder Care</h3>
              <p>Intelligent caregiving with health monitoring and emergency alerts</p>
              <ul className="service-list">
                <li>⏰ Daily Routine Assistance</li>
                <li>💊 Medication Management</li>
                <li>🏥 Health Monitoring</li>
                <li>🚨 Emergency Alert System</li>
                <li>📊 Care Reports & Analytics</li>
                <li>👥 Companionship services</li>
                <li>🏃 Errand & Transport Support</li>
                <li>📅 Appointment Coordination</li>
              </ul>
              <button 
                onClick={() => handleServiceNavigation('#elder-care')} 
                className="service-link btn-animate"
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <span>Learn More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="service-category card-hover" data-aos="fade-up" data-aos-delay="400">
              <div className="service-icon animate-float">
                <Truck />
              </div>
              <h3>Smart Transport & Delivery</h3>
              <p>AI-coordinated transportation and delivery services</p>
              <ul className="service-list">
                <li>🚗 Medical Transport</li>
                <li>🛒 Grocery Delivery</li>
                <li>💊 Medicine & Healthcare</li>
                <li>📦 Package Delivery</li>
                <li>🚕 Personal Driver Services</li>
                <li>⛽ Vehicle Maintenance</li>
                <li>📱 Live Tracking & Updates</li>
                <li>🧠 AI Route Optimization</li>
              </ul>
              <button 
                onClick={() => handleServiceNavigation('#delivery-transport')} 
                className="service-link btn-animate"
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <span>Learn More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="service-category card-hover" data-aos="fade-up" data-aos-delay="500">
              <div className="service-icon animate-float">
                <ShieldCheck />
              </div>
              <h3>Remote Property Management</h3>
              <p>Comprehensive remote oversight for migrant families</p>
              <ul className="service-list">
                <li>🏠 Property Supervision</li>
                <li>📄 Utility Bill Management</li>
                <li>📬 Mail Collection & Forwarding</li>
                <li>🏠 Home Opening/Closing</li>
                <li>🔒 Security Monitoring</li>
                <li>🌿 Garden Maintenance</li>
                <li>📊 Property Reports</li>
                <li>🚨 Emergency Response</li>
              </ul>
              <button 
                onClick={() => handleServiceNavigation('#property-management')} 
                className="service-link btn-animate"
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <span>Learn More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="service-category card-hover" data-aos="fade-up" data-aos-delay="600">
              <div className="service-icon animate-float">
                <Brain />
              </div>
              <h3>AI Analytics & Insights</h3>
              <p>Intelligent feedback analysis and performance optimization</p>
              <ul className="service-list">
                <li>📊 Service Performance Analytics</li>
                <li>🧠 Predictive Maintenance</li>
                <li>📈 Quality Improvement Insights</li>
                <li>🎯 Personalized Recommendations</li>
                <li>📱 Smart Notifications</li>
                <li>💰 Cost Optimization</li>
                <li>⏰ Intelligent Scheduling</li>
                <li>🔍 Anomaly Detection</li>
              </ul>
              <button 
                onClick={() => handleServiceNavigation('#ai-coordination')} 
                className="service-link btn-animate"
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <span>Learn More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="user-roles">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-badge animate-bounce-in">👥 Platform Users</span>
            <h2>Role-Based <span className="text-primary animate-shimmer">Access & Collaboration</span></h2>
            <p>Our platform connects different user types with secure, AI-powered coordination for seamless service delivery.</p>
          </div>
          
          <div className="roles-grid">
            <div className="role-card card-hover" data-aos="fade-up" data-aos-delay="100">
              <div className="role-icon animate-float">
                <Home />
              </div>
              <h3>Customer (Resident)</h3>
              <p>Book services, monitor home remotely, track progress, and provide feedback</p>
              <ul className="role-features">
                <li>📱 Book maintenance & care services</li>
                <li>📹 Remote smart camera monitoring</li>
                <li>📊 Real-time service tracking</li>
                <li>🔔 Smart alerts & notifications</li>
                <li>💳 Digital billing & payments</li>
                <li>⭐ Service feedback & ratings</li>
              </ul>
            </div>

            <div className="role-card card-hover" data-aos="fade-up" data-aos-delay="200">
              <div className="role-icon animate-float">
                <ShieldCheck />
              </div>
              <h3>Service Provider</h3>
              <p>Accept requests, perform tasks and deliveries, update progress, and complete jobs</p>
              <ul className="role-features">
                <li>✅ Accept/reject service requests</li>
                <li>🔧 Perform maintenance tasks</li>
                <li>🚚 Deliver groceries, medicines, and packages</li>
                <li>📱 Update service and delivery status in real time</li>
                <li>✅ Mark jobs as completed</li>
                <li>📝 Add notes & documentation</li>
                <li>🗺️ Route optimization for efficient delivery</li>
                <li>📊 Track performance metrics</li>
              </ul>
            </div>

            <div className="role-card card-hover" data-aos="fade-up" data-aos-delay="300">
              <div className="role-icon animate-float">
                <Heart />
              </div>
              <h3>Supervisor</h3>
              <p>Oversee operations, manage teams, and monitor performance standards</p>
              <ul className="role-features">
                <li>👥 Team management</li>
                <li>📊 Performance monitoring</li>
                <li>🎯 Quality assurance</li>
                <li>📋 Report generation</li>
                <li>🤝 Stakeholder coordination</li>
                <li>⚡ Operational efficiency</li>
              </ul>
            </div>
            <div className="role-card card-hover" data-aos="fade-up" data-aos-delay="400">
              <div className="role-icon animate-float">
                <Truck />
              </div>
              <h3>Driver</h3>
              <p>Transport elders safely with live trip updates</p>
              <ul className="role-features">
                <li>🚗 Safe elder transportation</li>
                <li>📱 Live status updates</li>
                <li>🗺️ Route optimization</li>
                <li>⛽ Vehicle maintenance</li>
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <div className="container">
          <h2 className="text-reveal">Why Choose Our Smart Platform?</h2>
          <div className="benefits-grid">
            <div className="benefit card-hover animate-fade-in stagger-1">
              <Brain className="benefit-icon animate-rotate-in" />
              <h3>AI-Enabled Intelligence</h3>
              <p>Advanced AI supports intelligent scheduling, service allocation, and anomaly detection for optimal performance.</p>
            </div>
            <div className="benefit card-hover animate-fade-in stagger-2">
              <Camera className="benefit-icon animate-rotate-in" />
              <h3>Smart Camera Integration</h3>
              <p>Real-time monitoring with AI-powered anomaly detection for enhanced security and peace of mind.</p>
            </div>
            <div className="benefit card-hover animate-fade-in stagger-3">
              <Shield className="benefit-icon animate-rotate-in" />
              <h3>Role-Based Security</h3>
              <p>Secure collaboration among customers, service providers, caregivers, drivers, and administrators.</p>
            </div>
            <div className="benefit card-hover animate-fade-in stagger-4">
              <Home className="benefit-icon animate-rotate-in" />
              <h3>Urban & Rural Support</h3>
              <p>Designed for both urban and rural households, improving convenience, safety, and caregiving reliability.</p>
            </div>
            <div className="benefit card-hover animate-fade-in stagger-5">
              <Clock className="benefit-icon animate-rotate-in" />
              <h3>24/7 Assistance</h3>
              <p>Round-the-clock support and monitoring to keep your family and home services running smoothly.</p>
            </div>
            <div className="benefit card-hover animate-fade-in stagger-6">
              <Users className="benefit-icon animate-rotate-in" />
              <h3>Trusted Professionals</h3>
              <p>Vetted providers with performance tracking and ratings for consistent, high‑quality service.</p>
            </div>
          </div>
        </div>
      </section>
            
      {/* About Platform */}
      <section className="about-platform">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-badge animate-bounce-in">💙 About Our Platform</span>
            <h2>Redefining <span className="text-primary animate-shimmer">Home Care</span> with AI Technology</h2>
            <p>Our AI-enabled platform transforms traditional home maintenance into an intelligent, 
               responsive ecosystem that adapts to your family's unique needs with real-time monitoring and smart coordination.</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card card-hover animate-scale-in stagger-1">
              <Users className="stat-icon animate-float" />
              <h3>1000+</h3>
              <p>Families Served</p>
            </div>
            <div className="stat-card card-hover animate-scale-in stagger-2">
              <Star className="stat-icon animate-float" />
              <h3>99%</h3>
              <p>Satisfaction Rate</p>
            </div>
            <div className="stat-card card-hover animate-scale-in stagger-3">
              <Clock className="stat-icon animate-float" />
              <h3>24/7</h3>
              <p>AI Monitoring</p>
            </div>
            <div className="stat-card card-hover animate-scale-in stagger-4">
              <ShieldCheck className="stat-icon animate-float" />
              <h3>99.9%</h3>
              <p>Reliability Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-badge animate-bounce-in">⭐ Customer Stories</span>
            <h2>Loved by <span className="text-primary animate-shimmer">Families</span> and Professionals</h2>
            <p>Real feedback from customers who rely on our platform for home services and care.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial card-hover">
              <p>“Booking a plumber was effortless and I could track everything from my phone.”</p>
              <div className="author">Riya S.</div>
              <div className="role">Homeowner</div>
            </div>
            <div className="testimonial card-hover">
              <p>“Our parents receive consistent care with timely updates. It’s peace of mind.”</p>
              <div className="author">Anish & Kavya</div>
              <div className="role">Family</div>
            </div>
            <div className="testimonial card-hover">
              <p>“Scheduling and routing saves us hours per week. Payments are seamless.”</p>
              <div className="author">Mahesh K.</div>
              <div className="role">Service Provider</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-badge animate-bounce-in">💳 Simple Pricing</span>
            <h2>Transparent plans for every <span className="text-primary animate-shimmer">household</span></h2>
            <p>Start free and scale as you need. No hidden fees.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card card-hover">
              <div className="price-header">
                <h3>Basic</h3>
                <div className="price">Free</div>
                <div className="sub">Book services, track status</div>
              </div>
              <ul className="price-features">
                <li>Service booking</li>
                <li>Status tracking</li>
                <li>Standard support</li>
              </ul>
              <a href="/register" className="cta-button">Get Started</a>
            </div>
            <div className="price-card featured card-hover">
              <div className="price-header">
                <h3>Pro</h3>
                <div className="price">$19/mo</div>
                <div className="sub">AI scheduling, smart alerts</div>
              </div>
              <ul className="price-features">
                <li>Everything in Basic</li>
                <li>AI scheduling & allocation</li>
                <li>Smart camera alerts</li>
                <li>Priority support</li>
              </ul>
              <a href="/register" className="cta-button">Upgrade</a>
            </div>
            <div className="price-card card-hover">
              <div className="price-header">
                <h3>Enterprise</h3>
                <div className="price">Custom</div>
                <div className="sub">Tailored ops & SLAs</div>
              </div>
              <ul className="price-features">
                <li>Custom workflows</li>
                <li>Advanced analytics</li>
                <li>Dedicated manager</li>
              </ul>
              <a href="/contact" className="cta-button">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="section-badge animate-bounce-in">❓ FAQ</span>
            <h2>Your questions, <span className="text-primary animate-shimmer">answered</span></h2>
            <p>Everything you need to know about booking, providers, and support.</p>
          </div>
          <div className="faq-grid">
            <div className="faq-item card">
              <h4>How do I book a service?</h4>
              <p>Visit the Services page, choose a category, and select “Book Now”.</p>
            </div>
            <div className="faq-item card">
              <h4>Are providers vetted?</h4>
              <p>Yes. We verify identity, credentials, and track performance ratings.</p>
            </div>
            <div className="faq-item card">
              <h4>Can I reschedule?</h4>
              <p>Yes. Manage bookings from your dashboard and reschedule anytime.</p>
            </div>
            <div className="faq-item card">
              <h4>Is support available 24/7?</h4>
              <p>Pro plan and above receive priority 24/7 support and alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h3>Ready to book a trusted professional?</h3>
            <p>Join thousands of families using our smart platform for daily services.</p>
            <div className="cta-actions">
              <Link to="/services" className="btn-primary btn-animate">Browse Services</Link>
              <Link to="/register" className="btn-secondary btn-animate">Create Account</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 