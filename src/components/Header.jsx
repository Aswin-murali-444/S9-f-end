import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">HomeMaintain</Link>
        
        <nav className="nav-menu">
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        
        <div className="auth-buttons">
          <Link to="/login" className="auth-link">Login</Link>
          <Link to="/register" className="auth-link register">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 