import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  fullScreen = false,
  className = ''
}) => {
  // Use the simple circular spinner styled in index.css everywhere.
  // This avoids the long bar-style spinner that was visually cutting
  // across the profile page.
  const SpinnerVisual = () => <div className="loading-spinner" />;

  if (fullScreen) {
    return (
      <div className={`loading-overlay professional ${className}`}>
        <div className="loading-content professional">
          <SpinnerVisual />
          {text && (
            <div className="loading-text-wrapper">
              <p className="loading-text professional">{text}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner-wrapper professional ${className}`}>
      <SpinnerVisual />
      {text && (
        <div className="loading-text-wrapper">
          <p className="loading-text professional">{text}</p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;