import React from 'react';

const Logo = ({ size = 'large', className = '', variant = 'default', onClick }) => {
  const sizes = {
    small: { width: 120, height: 36, fontSize: '16px' },
    medium: { width: 180, height: 54, fontSize: '24px' },
    large: { width: 240, height: 72, fontSize: '32px' }
  };

  const currentSize = sizes[size];

  return (
    <div 
      className={`logo-container ${className}`} 
      style={{ width: currentSize.width, height: currentSize.height }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox="0 0 240 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f9cf9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f9cf9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        
        {/* Minimal Geometric Logo - Hexagonal Connection */}
        <g transform="translate(8, 8)">
          {/* Main hexagon - extra large */}
          <path
            d="M30 4 L54 18 L54 46 L30 60 L6 46 L6 18 Z"
            fill="url(#logoGradient)"
            opacity="1"
          />
          
          {/* Inner connection lines - minimal and elegant */}
          <path
            d="M15 32 L30 24 L45 32 L30 40 Z"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="30" cy="32" r="4" fill="white" opacity="0.9" />
        </g>
        
        {/* Text position adjusted to accommodate larger icon */}
        
        {/* Clean Typography - Single line */}
        <text
          x="75"
          y="44"
          fill="url(#textGradient)"
          fontSize={currentSize.fontSize}
          fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="-1px"
        >
          Nexus
        </text>
      </svg>
    </div>
  );
};

export default Logo; 