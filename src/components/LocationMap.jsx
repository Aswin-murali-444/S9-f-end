import React, { useState } from 'react';
import './LocationMap.css';

const LocationMap = ({ 
  latitude, 
  longitude, 
  address, 
  height = '200px',
  zoom = 15,
  className = ''
}) => {
  // Always show something, even if no coordinates
  const hasCoordinates = latitude && longitude;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Create map embed URLs (try multiple sources)
  const googleMapsEmbedUrl = hasCoordinates 
    ? `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=${zoom}&output=embed`
    : null;
    
  const openStreetMapUrl = hasCoordinates 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`
    : null;

  // Google Maps URL for opening in new tab
  const googleMapsUrl = hasCoordinates 
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : 'https://www.google.com/maps';

  return (
    <div className={`professional-location-map ${className}`} style={{ height }}>
      {hasCoordinates && googleMapsEmbedUrl ? (
        <div className="map-wrapper">
          <div className="map-header">
            <div className="map-title">
              <span className="map-icon">📍</span>
              <span className="map-label">Service Location</span>
            </div>
          </div>
          
          <div className="map-container">
            {!mapError ? (
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ 
                  border: 0, 
                  borderRadius: '16px',
                  opacity: mapLoaded ? 1 : 0.7,
                  transition: 'opacity 0.3s ease'
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Service Location Map"
                onLoad={() => setMapLoaded(true)}
                onError={() => setMapError(true)}
              />
            ) : (
              <div className="map-error-fallback">
                <div className="error-icon">🗺️</div>
                <h4>Map Preview Unavailable</h4>
                <p>Click the button below to view the location in Google Maps</p>
              </div>
            )}
            
            <div className="map-overlay-top">
              <div className="map-info-badge">
                <div className="badge-icon-container">
                  <span className="badge-icon">🗺️</span>
                </div>
                <div className="badge-content">
                  <span className="badge-text">Interactive Map</span>
                  <span className="badge-subtext">Click to explore</span>
                </div>
              </div>
            </div>
            
            <div className="map-overlay-bottom">
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="enhanced-map-btn"
                title="Open in Google Maps"
              >
                <div className="btn-background"></div>
                <div className="btn-content">
                  <div className="btn-icon-container">
                    <span className="btn-icon">🗺️</span>
                    <span className="btn-icon-glow"></span>
                  </div>
                  <div className="btn-text-container">
                    <span className="btn-text">Open in Maps</span>
                    <span className="btn-subtext">Full screen view</span>
                  </div>
                  <div className="btn-arrow">
                    <span>↗</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
          
          <div className="map-footer">
            <div className="map-address">
              <span className="address-icon">🏠</span>
              <span className="address-text">{address}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="map-placeholder">
          <div className="map-fallback">
            <div className="fallback-icon">📍</div>
            <h4 className="fallback-title">Location Not Available</h4>
            <p className="fallback-description">Map will display once location coordinates are confirmed</p>
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="fallback-link"
            >
              <span className="link-icon">🗺️</span>
              <span className="link-text">Open Google Maps</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;