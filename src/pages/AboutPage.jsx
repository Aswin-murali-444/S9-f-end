import React from 'react';
import { Brain, Users, Shield, Heart, Zap, Award, Camera, Truck } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>Redefining <span className="text-primary">Home Care</span> with AI Technology</h1>
          <p className="hero-subtitle">
            Our AI-enabled platform transforms traditional home maintenance into an intelligent,
            responsive ecosystem that adapts to your family's unique needs with smart monitoring and coordination.
          </p>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="platform-overview">
        <div className="container">
          <div className="content-grid">
            <div className="content-text">
              <h2>Smart Home Maintenance and Family Support Platform</h2>
              <p>
                The Smart Home Maintenance and Family Support Platform is an AI-enabled solution that allows 
                families to manage household services and elder care remotely through a unified dashboard. 
                It integrates home maintenance, caregiving, transport, and deliveries with real-time monitoring 
                via smart cameras.
              </p>
              <p>
                Artificial intelligence supports intelligent scheduling, service allocation, anomaly detection, 
                and feedback analysis. For example, if an elderly member requires medical care and hospital 
                transportation, the system automatically assigns a trusted caregiver and driver to ensure 
                smooth coordination.
              </p>
              
              <div className="features-list">
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>AI-Enabled Intelligence</h4>
                    <p>Advanced AI supports intelligent scheduling, service allocation, and quality assurance</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Smart Camera Integration</h4>
                    <p>Real-time monitoring via smart cameras for remote family oversight and security</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Role-Based Access Control</h4>
                    <p>Secure collaboration among customers, service providers, caregivers, drivers, and administrators</p>
                  </div>
                </div>
              </div>
              
              <button className="learn-tech-btn" aria-label="Learn more about our AI-powered technology platform">Learn More About Our Technology</button>
            </div>
            
            <div className="tech-features">
              <div className="tech-card">
                <Brain className="tech-icon" />
                <h3>AI-Powered Coordination</h3>
                <p>Advanced AI algorithms monitor service quality, predict maintenance needs, and 
                   optimize resource allocation for superior customer experience.</p>
              </div>
              
              <div className="tech-card">
                <Camera className="tech-icon" />
                <h3>Smart Camera Monitoring</h3>
                <p>Real-time property surveillance and elderly care monitoring with AI-powered 
                   threat detection and emergency response systems.</p>
              </div>
              
              <div className="tech-card">
                <Shield className="tech-icon" />
                <h3>Centralized Security</h3>
                <p>Our security module provides real-time monitoring, access control, and 
                   immediate threat response for complete peace of mind.</p>
              </div>
              
              <div className="tech-card">
                <Truck className="tech-icon" />
                <h3>Smart Delivery & Transport</h3>
                <p>AI-coordinated delivery services and elderly transportation with real-time 
                   tracking and route optimization for maximum efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="user-roles-section">
        <div className="container">
          <h2>Platform User Roles & Capabilities</h2>
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon">👨‍👩‍👧‍👦</div>
              <h3>Customer (Resident)</h3>
              <ul>
                <li>Book home maintenance, caregiving, delivery, and transport services</li>
                <li>Monitor home remotely through smart camera integration</li>
                <li>Track service status and progress in real-time</li>
                <li>Receive AI-powered reminders, alerts, and notifications</li>
                <li>Provide feedback for continuous service improvement</li>
              </ul>
            </div>
            
            <div className="role-card">
              <div className="role-icon">🔧</div>
              <h3>Service Provider (Maintenance & Delivery)</h3>
              <ul>
                <li>Accept or reject service requests through AI-optimized scheduling</li>
                <li>Perform assigned household maintenance or repair tasks</li>
                <li>Deliver groceries, medicines, and packages with tracking</li>
                <li>Update progress with real-time tracking, notes, and photos</li>
                <li>Follow AI-optimized routes for maximum efficiency</li>
              </ul>
            </div>
            <div className="role-card">
              <div className="role-icon">🚗</div>
              <h3>Driver</h3>
              <ul>
                <li>Transport elders safely to appointments or errands</li>
                <li>Update live status of trips</li>
                <li>Follow AI-optimized routes for maximum efficiency</li>
                <li>Provide real-time updates to families</li>
              </ul>
            </div>
            <div className="role-card">
              <div className="role-icon">👵</div>
              <h3>Caretaker (Elder Care)</h3>
              <ul>
                <li>Assist elders with daily routines and medication management</li>
                <li>Provide health updates through the AI dashboard</li>
                <li>Raise emergency alerts when needed with instant response</li>
                <li>Maintain digital health and care reports</li>
                <li>Coordinate with family members through the platform</li>
              </ul>
            </div>
            
            
            
            <div className="role-card">
              <div className="role-icon">👨‍💼</div>
              <h3>Platform Admin</h3>
              <ul>
                <li>Manage users, roles, and service categories</li>
                <li>Monitor performance, billing, and analytics</li>
                <li>Allocate service providers using AI-based recommendations</li>
                <li>Oversee system alerts, quality, and reports</li>
                <li>Ensure platform security and compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <Award className="mission-icon" />
            <h2>Our Mission</h2>
            <p className="mission-statement">
              To bridge the gap between traditional home maintenance services and the evolving needs 
              of modern families through AI-enabled technology. We believe that artificial intelligence 
              should enhance human care, not replace it, creating a seamless ecosystem where smart 
              technology amplifies human compassion and expertise.
            </p>
            <div className="values">
              <div className="value">
                <Zap className="value-icon" />
                <span>Innovation</span>
              </div>
              <div className="value">
                <Heart className="value-icon" />
                <span>Compassion</span>
              </div>
              <div className="value">
                <Shield className="value-icon" />
                <span>Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to <span className="text-primary">Get Started?</span></h2>
          <p>Contact our AI-powered care coordination team to discuss your family's unique needs. 
             We're here to provide personalized smart solutions that give you peace of mind.</p>
          <button className="cta-button" aria-label="Contact our AI-powered care coordination team">Contact Us</button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 