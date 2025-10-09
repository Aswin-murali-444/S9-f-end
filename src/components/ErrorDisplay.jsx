import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw, Wifi, WifiOff, AlertCircle, Info } from 'lucide-react';
import './ErrorDisplay.css';

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss, 
  type = 'error', 
  showIcon = true, 
  autoDismiss = false,
  dismissDelay = 5000,
  className = '',
  title = null,
  description = null,
  actions = null
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoDismiss && dismissDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300); // Wait for animation
      }, dismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  const getErrorIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
        return <Info size={20} />;
      case 'network':
        return <WifiOff size={20} />;
      case 'success':
        return <CheckCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getErrorTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'network':
        return 'Connection Error';
      case 'success':
        return 'Success';
      default:
        return 'Error';
    }
  };

  const getErrorDescription = () => {
    if (description) return description;
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred. Please try again.';
  };

  const getErrorTypeClass = () => {
    switch (type) {
      case 'warning':
        return 'error-warning';
      case 'info':
        return 'error-info';
      case 'network':
        return 'error-network';
      case 'success':
        return 'error-success';
      default:
        return 'error-default';
    }
  };

  if (!error && !title) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`error-display ${getErrorTypeClass()} ${className}`}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <div className="error-content">
            {showIcon && (
              <div className="error-icon">
                {getErrorIcon()}
              </div>
            )}
            
            <div className="error-text">
              <h4 className="error-title">{getErrorTitle()}</h4>
              <p className="error-description">{getErrorDescription()}</p>
              
              {error?.details && (
                <details className="error-details">
                  <summary>Technical Details</summary>
                  <pre>{JSON.stringify(error.details, null, 2)}</pre>
                </details>
              )}
            </div>

            {onDismiss && (
              <button 
                className="error-dismiss"
                onClick={handleDismiss}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {(onRetry || actions) && (
            <div className="error-actions">
              {actions || (
                onRetry && (
                  <button 
                    className="error-retry"
                    onClick={onRetry}
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                )
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorDisplay;
