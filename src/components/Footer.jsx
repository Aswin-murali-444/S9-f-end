import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Logo size="medium" />
              <div className="logo-sub">Premium Service Platform</div>
            </div>
            <p className="footer-description">
              Connecting you with trusted professionals for all your service needs. 
              Experience excellence in home maintenance, care, and lifestyle services.
            </p>
            <div className="footer-contact">
              <a href="tel:+15551234567" className="contact-item">
                <Phone size={16} />
                +1 (555) 123-4567
              </a>
              <a href="mailto:hello@nexusservices.com" className="contact-item">
                <Mail size={16} />
                hello@nexusservices.com
              </a>
              <div className="contact-item">
                <MapPin size={16} />
                123 Care Street, City, State
              </div>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Services</h4>
              <Link to="/services#smart-maintenance">Home Maintenance</Link>
              <Link to="/services#elder-care">Elderly Care</Link>
              <Link to="/services#delivery-transport">Driver Services</Link>
              <Link to="/services#security-monitoring">Security Services</Link>
              <Link to="/services#property-management">Migrant Support</Link>
              <Link to="/services#smart-security">Emergency Care</Link>
            </div>
            
            <div className="footer-column">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/technology">Our Technology</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/press">Press</Link>
              <Link to="/contact">Contact</Link>
            </div>
            
            <div className="footer-column">
              <h4>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/service-areas">Service Areas</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
          
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest updates on our services and care tips.</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input"
                aria-label="Email address for newsletter subscription"
                name="email"
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe to our newsletter">Subscribe</button>
            </form>
            <div className="social-links">
              <span>Follow us:</span>
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Nexus. All rights reserved.</p>
          <p>Premium Service Platform | Connecting you with trusted professionals</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 