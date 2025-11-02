import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  WifiOff,
  Shield,
  CreditCard,
  Star,
  Calendar,
  MessageSquare
} from 'lucide-react';
import './ToastNotification.css';

const ToastNotification = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  position = 'top-right',
  onClose,
  action = null,
  icon = null,
  persistent = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  };

  const getToastIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
        return <Info size={20} />;
      case 'network':
        return <WifiOff size={20} />;
      case 'payment':
        return <CreditCard size={20} />;
      case 'booking':
        return <Calendar size={20} />;
      case 'feedback':
        return <Star size={20} />;
      case 'message':
        return <MessageSquare size={20} />;
      case 'security':
        return <Shield size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getToastTypeClass = () => {
    return `toast-${type}`;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`toast-notification ${getToastTypeClass()} ${position}`}
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      exit={{ 
        opacity: 0, 
        y: -50, 
        scale: 0.9,
        transition: { duration: 0.3 }
      }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="toast-content">
        <div className="toast-icon">
          {getToastIcon()}
        </div>
        
        <div className="toast-text">
          {title && <h4 className="toast-title">{title}</h4>}
          <p className="toast-message">{message}</p>
        </div>

        <button 
          className="toast-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>

      {action && (
        <div className="toast-actions">
          {action}
        </div>
      )}

      {!persistent && (
        <div className="toast-progress">
          <motion.div 
            className="toast-progress-bar"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default ToastNotification;
