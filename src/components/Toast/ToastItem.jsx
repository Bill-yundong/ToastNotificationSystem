import React, { useEffect, useState } from 'react';
import { useToast } from './ToastContext';

const ToastItem = ({ toast, index, position }) => {
  const { dismiss } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration <= 0) return;

    const startTime = Date.now();
    const duration = toast.duration;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(progressInterval);
      }
    }, 50);

    return () => clearInterval(progressInterval);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setIsVisible(false);
    setTimeout(() => {
      dismiss(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="toast-icon success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg className="toast-icon error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="toast-icon warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg className="toast-icon info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getToastClass = () => {
    const baseClass = 'toast-item';
    const typeClass = `toast-${toast.type}`;
    const visibilityClass = isVisible ? 'toast-visible' : 'toast-hidden';
    const exitClass = isExiting ? 'toast-exiting' : '';

    return `${baseClass} ${typeClass} ${visibilityClass} ${exitClass}`.trim();
  };

  const getAnimationDelay = () => {
    return `-${index * 0.1}s`;
  };

  return (
    <div
      className={getToastClass()}
      style={{
        animationDelay: getAnimationDelay(),
        zIndex: 9999 - index,
      }}
      onMouseEnter={() => {
        if (toast.duration > 0) {
          setProgress(100);
        }
      }}
      onMouseLeave={() => {
        if (toast.duration > 0) {
          setProgress(100);
        }
      }}
    >
      <div className="toast-content">
        {getIcon()}
        <div className="toast-message">{toast.message}</div>
        <button
          className="toast-close"
          onClick={handleClose}
          aria-label="关闭通知"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {toast.duration > 0 && (
        <div
          className="toast-progress"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
};

export default ToastItem;
