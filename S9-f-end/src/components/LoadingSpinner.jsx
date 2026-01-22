import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  fullScreen = false,
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'spinner-small';
      case 'large': return 'spinner-large';
      default: return 'spinner-medium';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'secondary': return 'spinner-secondary';
      case 'success': return 'spinner-success';
      case 'warning': return 'spinner-warning';
      case 'error': return 'spinner-error';
      default: return 'spinner-primary';
    }
  };

  if (fullScreen) {
    return (
      <div className={`loading-overlay professional ${className}`}>
        <div className="loading-content professional">
          <div className="spinner-wrapper">
            <div className={`loading-spinner professional ${getSizeClass()} ${getColorClass()}`}>
              <div className="spinner-ring ring-1"></div>
              <div className="spinner-ring ring-2"></div>
              <div className="spinner-ring ring-3"></div>
              <div className="spinner-center"></div>
            </div>
            <div className="spinner-glow"></div>
          </div>
          {text && (
            <div className="loading-text-wrapper">
              <p className="loading-text professional">{text}</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner-wrapper professional ${className}`}>
      <div className="spinner-wrapper">
        <div className={`loading-spinner professional ${getSizeClass()} ${getColorClass()}`}>
          <div className="spinner-ring ring-1"></div>
          <div className="spinner-ring ring-2"></div>
          <div className="spinner-ring ring-3"></div>
          <div className="spinner-center"></div>
        </div>
        <div className="spinner-glow"></div>
      </div>
      {text && (
        <div className="loading-text-wrapper">
          <p className="loading-text professional">{text}</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;