import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', variant = 'primary' }) => {
  const sizeClasses = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg'
  };

  const variantClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    success: 'spinner-success',
    danger: 'spinner-danger',
    warning: 'spinner-warning',
    info: 'spinner-info'
  };

  return (
    <div className={`loading-container animate-fade-in`}>
      <div className={`spinner-wrapper ${sizeClasses[size] || 'spinner-md'}`}>
        {/* Bootstrap Spinner */}
        <div className={`spinner-border ${variantClasses[variant] || 'spinner-primary'} animate-pulse-glow`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        
        {/* Custom Animated Rings */}
        <div className="custom-spinner">
          <div className="ring ring-1 animate-rotate-in"></div>
          <div className="ring ring-2 animate-rotate-in" style={{ animationDelay: '0.2s' }}></div>
          <div className="ring ring-3 animate-rotate-in" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Pulsing Dots */}
        <div className="pulse-dots">
          <div className="dot dot-1 animate-bounce-in"></div>
          <div className="dot dot-2 animate-bounce-in" style={{ animationDelay: '0.2s' }}></div>
          <div className="dot dot-3 animate-bounce-in" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
      
      {text && (
        <div className="loading-text animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <span className="text-reveal">{text}</span>
          <div className="text-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 