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
      <div className={`loading-overlay ${className}`}>
        <div className="loading-content">
          <div className={`loading-spinner ${getSizeClass()} ${getColorClass()}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner ${getSizeClass()} ${getColorClass()} ${className}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;