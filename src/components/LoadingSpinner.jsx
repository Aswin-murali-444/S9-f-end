import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = '#4f9cf9' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner" style={{ borderTopColor: color }}></div>
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default LoadingSpinner; 