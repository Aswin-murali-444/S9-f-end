import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">HM</div>
            <div className="logo-text">
              <span className="logo-main">HomeMaintain</span>
              <span className="logo-sub">AI-Driven Care Platform</span>
            </div>
          </Link>
          
          <nav className="nav-menu">
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>
          
          <div className="header-actions">
            <a href="tel:+15551234567" className="phone-link">
              <Phone size={18} />
              +1 (555) 123-4567
            </a>
            <button className="cta-button" aria-label="Get started with our services">Get Started</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 