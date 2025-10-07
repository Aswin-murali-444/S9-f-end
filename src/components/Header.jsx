import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAnimations } from '../hooks/useAnimations';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const { useAnimatedInView, useHoverAnimation } = useAnimations();
  const { ref: navRef, triggerAnimation } = useAnimatedInView(0.1);
  const { elementRef: logoRef, handleMouseEnter: logoHover, handleMouseLeave: logoLeave } = useHoverAnimation('animate-pulse-glow');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      triggerAnimation('animate-fade-in');
    }
  }, [navRef, triggerAnimation]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header 
      ref={navRef}
      className={`header ${isScrolled ? 'header-scrolled' : ''} animate-fade-in`}
    >
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link 
            to="/" 
            className="logo-container"
            ref={logoRef}
            onMouseEnter={logoHover}
            onMouseLeave={logoLeave}
          >
            <div className="logo animate-bounce-in">
              <img src="/nexus-logo.svg" alt="Nexus" className="logo-image animate-scale-in" />
              <span className="logo-text animate-fade-in">Nexus</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <ul className="nav-list">
              {navItems.map((item, index) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''} hover-lift`}
                    onClick={closeMenu}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <div className="active-indicator animate-pulse-glow"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            {user ? (
              <>
                <div className="user-menu">
                <div className="user-info hover-scale">
                  {(() => {
                    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL;
                    return avatar ? (
                      <img src={avatar} alt="Profile" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <User size={20} className="user-icon animate-rotate-in" />
                    );
                  })()}
                  <span className="user-name animate-fade-in">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
                </div>
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item hover-lift">
                      <Settings size={16} />
                      Profile
                    </Link>
                    <button onClick={logout} className="dropdown-item hover-lift">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
                <button 
                  onClick={logout} 
                  className="btn-login btn-animate hover-glow"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className="btn-login btn-animate hover-glow"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-register btn-animate hover-glow"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''} btn-animate`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={24} className="animate-rotate-in" />
              ) : (
                <Menu size={24} className="animate-fade-in" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className={`nav-mobile ${isMenuOpen ? 'nav-mobile-open' : ''}`}>
          <ul className="nav-mobile-list">
            {navItems.map((item, index) => (
              <li key={item.path} className="nav-mobile-item">
                <Link
                  to={item.path}
                  className={`nav-mobile-link ${isActive(item.path) ? 'active' : ''} animate-slide-up`}
                  onClick={closeMenu}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* When authenticated, show quick logout in mobile list */}
            {user ? (
              <li className="nav-mobile-item">
                <button 
                  onClick={logout} 
                  className="nav-mobile-link animate-slide-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li className="nav-mobile-item">
                  <Link 
                    to="/login" 
                    className="nav-mobile-link animate-slide-up"
                    onClick={closeMenu}
                    style={{ animationDelay: '0.3s' }}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-mobile-item">
                  <Link 
                    to="/register" 
                    className="nav-mobile-link animate-slide-up"
                    onClick={closeMenu}
                    style={{ animationDelay: '0.4s' }}
                  >
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 