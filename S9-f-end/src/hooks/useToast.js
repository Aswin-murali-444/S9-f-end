import { useState, useCallback } from 'react';

let toastId = 0;

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    const newToast = {
      id,
      duration: 5000,
      position: 'top-right',
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      title: 'Success',
      ...options,
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      title: 'Error',
      duration: 7000, // Longer duration for errors
      ...options,
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      title: 'Warning',
      ...options,
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      title: 'Information',
      ...options,
    });
  }, [addToast]);

  const network = useCallback((message, options = {}) => {
    return addToast({
      type: 'network',
      message,
      title: 'Connection Issue',
      duration: 8000,
      ...options,
    });
  }, [addToast]);

  const payment = useCallback((message, options = {}) => {
    return addToast({
      type: 'payment',
      message,
      title: 'Payment',
      ...options,
    });
  }, [addToast]);

  const booking = useCallback((message, options = {}) => {
    return addToast({
      type: 'booking',
      message,
      title: 'Booking Update',
      ...options,
    });
  }, [addToast]);

  const feedback = useCallback((message, options = {}) => {
    return addToast({
      type: 'feedback',
      message,
      title: 'Feedback',
      ...options,
    });
  }, [addToast]);

  const message = useCallback((message, options = {}) => {
    return addToast({
      type: 'message',
      message,
      title: 'Message',
      ...options,
    });
  }, [addToast]);

  const security = useCallback((message, options = {}) => {
    return addToast({
      type: 'security',
      message,
      title: 'Security Notice',
      duration: 8000,
      ...options,
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    network,
    payment,
    booking,
    feedback,
    message,
    security,
  };
};

export default useToast;
