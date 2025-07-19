import React from 'react';
import { Brain, Users, Shield, Heart, Zap, Award } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>Redefining <span className="text-primary">Home Care</span> with Technology</h1>
          <p className="hero-subtitle">
            Our AI-driven platform transforms traditional home maintenance into an intelligent,
            responsive ecosystem that adapts to your family's unique needs and circumstances.
          </p>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="platform-overview">
        <div className="container">
          <div className="content-grid">
            <div className="content-text">
              <h2>Intelligent Service Ecosystem for Modern Families</h2>
              <p>
                The Home Maintenance Service Platform represents a paradigm shift in home care services. 
                By integrating artificial intelligence with human expertise, we've created a comprehensive 
                solution that understands the unique challenges faced by migrant families and elderly 
                dependents.
              </p>
              <p>
                Our platform goes beyond traditional service booking - it learns, adapts, and anticipates 
                your needs while maintaining the highest standards of quality and reliability through 
                AI-powered supervision and quality assurance.
              </p>
              
              <div className="features-list">
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Personalized Service Classification</h4>
                    <p>Dynamic service personalization based on local vs. migrant family status</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Specialized Elderly Care</h4>
                    <p>Dedicated support systems for elderly dependents of migrant households</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>AI-Powered Quality Assurance</h4>
                    <p>Continuous monitoring and optimization for superior service delivery</p>
                  </div>
                </div>
              </div>
              
              <button className="learn-tech-btn">Learn More About Our Technology</button>
            </div>
            
            <div className="tech-features">
              <div className="tech-card">
                <Brain className="tech-icon" />
                <h3>AI-Driven Intelligence</h3>
                <p>Advanced AI algorithms monitor service quality, predict maintenance needs, and 
                   optimize resource allocation for superior customer experience.</p>
              </div>
              
              <div className="tech-card">
                <Users className="tech-icon" />
                <h3>Specialized Care Teams</h3>
                <p>Dedicated professionals trained specifically for elderly care and migrant family 
                   support, ensuring personalized and culturally sensitive service.</p>
              </div>
              
              <div className="tech-card">
                <Shield className="tech-icon" />
                <h3>Centralized Supervision</h3>
                <p>Our supervisor module provides real-time quality assurance, operational 
                   oversight, and immediate conflict resolution for peace of mind.</p>
              </div>
              
              <div className="tech-card">
                <Heart className="tech-icon" />
                <h3>Migrant Family Focus</h3>
                <p>Unique classification system that enables dynamic service personalization and 
                   prioritization based on family circumstances and needs.</p>
              </div>
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
              of modern families, particularly those separated by distance. We believe that technology 
              should enhance human care, not replace it, creating a seamless ecosystem where AI 
              intelligence amplifies human compassion and expertise.
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
                <span>Reliability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to <span className="text-primary">Get Started?</span></h2>
          <p>Contact our care coordination team to discuss your family's unique needs. We're here 
             to provide personalized solutions that give you peace of mind.</p>
          <button className="cta-button">Contact Us</button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 