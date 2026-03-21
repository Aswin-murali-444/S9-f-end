import React from 'react';
import { Brain, Users, Shield, Heart, Zap, Award, Camera, Truck } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>Redefining <span className="text-primary">Home Services</span> with Practical Technology</h1>
          <p className="hero-subtitle">
            Our AI-enabled platform transforms traditional home maintenance into an intelligent,
            responsive ecosystem that helps families book services, monitor progress, and manage home operations efficiently.
          </p>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="platform-overview">
        <div className="container">
          <div className="content-grid">
            <div className="content-text">
              <h2>Nexus Home Services Platform</h2>
              <p>
                Nexus is a full-stack home services platform that helps families manage maintenance,
                support services, transport, and deliveries through one unified system.
                Customers, providers, supervisors, and admins each get role-based dashboards built for their workflow.
              </p>
              <p>
                The platform uses data-driven recommendations and assignment workflows to improve speed and quality.
                Features like real-time booking status, team-based job handling, and notifications help customers
                stay informed while providers execute services more effectively.
              </p>
              
              <div className="features-list">
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Smarter Assignments</h4>
                    <p>Recommendations and job allocation support improve response time and matching</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Real-Time Tracking</h4>
                    <p>Customers can follow booking progress and receive status updates in-app</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Role-Based Access Control</h4>
                    <p>Secure collaboration across customers, providers, supervisors, drivers, and admins</p>
                  </div>
                </div>
              </div>
              
              <button className="learn-tech-btn" aria-label="Learn more about our technology platform">Learn More About Our Platform</button>
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
                <h3>Live Status Visibility</h3>
                <p>From booking to completion, users get clear status updates and timeline visibility
                   across services and team jobs.</p>
              </div>
              
              <div className="tech-card">
                <Shield className="tech-icon" />
                <h3>Centralized Operations</h3>
                <p>Our security module provides real-time monitoring, access control, and 
                   quality checks, and operational consistency.</p>
              </div>
              
              <div className="tech-card">
                <Truck className="tech-icon" />
                <h3>Delivery & Transport Workflows</h3>
                <p>AI-coordinated delivery services and elderly transportation with real-time 
                   tracking and route optimization for faster completion.</p>
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
              <h3>Supervisor</h3>
              <ul>
                <li>Oversee daily operations and team management</li>
                <li>Provide leadership and guidance to staff members</li>
                <li>Monitor performance and quality standards</li>
                <li>Maintain detailed reports and documentation</li>
                <li>Coordinate with stakeholders and clients</li>
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