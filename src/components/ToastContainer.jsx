import React from 'react';
import { createPortal } from 'react-dom';
import ToastNotification from './ToastNotification';

const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
  if (typeof window === 'undefined') return null;

  const container = document.getElementById('toast-container') || document.body;

  return createPortal(
    <div className="toast-container" data-position={position}>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>,
    container
  );
};

export default ToastContainer;
