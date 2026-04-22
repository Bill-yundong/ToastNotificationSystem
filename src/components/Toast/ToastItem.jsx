import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './ToastContext';
import { getAnimationStyle, getHoverStyle } from './ToastScheduler';
import CONFIG from './ToastScheduler';

const ToastItem = ({ toast, position }) => {
  const { dismiss, startExitAnimation, pauseAutoDismiss, scheduleAutoDismiss, updateToastAnimation } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const [animationPhase, setAnimationPhase] = useState('entering');
  const progressRef = useRef({ startTime: null, paused: false, pausedTime: 0, totalDuration: toast.duration });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setAnimationPhase('visible');
      updateToastAnimation(toast.id, { animationState: 'visible' });
    }, 50);
    
    return () => clearTimeout(enterTimer);
  }, [toast.id, updateToastAnimation]);

  useEffect(() => {
    if (toast.animationState === 'exiting') {
      setAnimationPhase('exiting');
    }
  }, [toast.animationState]);

  const updateProgress = useCallback(() => {
    if (progressRef.current.paused || toast.duration <= 0) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
      return;
    }

    const now = Date.now();
    const elapsed = (now - progressRef.current.startTime) + progressRef.current.pausedTime;
    const remaining = Math.max(0, 100 - (elapsed / progressRef.current.totalDuration) * 100);
    
    setProgress(remaining);

    if (remaining > 0) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [toast.duration]);

  useEffect(() => {
    if (toast.duration <= 0) return;

    progressRef.current = {
      startTime: Date.now(),
      paused: false,
      pausedTime: 0,
      totalDuration: toast.duration,
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [toast.duration, updateProgress]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    progressRef.current.paused = true;
    
    if (toast.duration > 0) {
      pauseAutoDismiss(toast.id);
    }
  }, [toast.id, toast.duration, pauseAutoDismiss]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    
    if (toast.duration > 0) {
      progressRef.current.startTime = Date.now();
      progressRef.current.paused = false;
      
      const elapsed = progressRef.current.pausedTime + (Date.now() - progressRef.current.startTime);
      const remainingTime = Math.max(0, progressRef.current.totalDuration - elapsed);
      
      if (remainingTime > 0) {
        scheduleAutoDismiss(toast.id, remainingTime);
      } else {
        startExitAnimation(toast.id);
      }
    }
  }, [toast.id, toast.duration, scheduleAutoDismiss, startExitAnimation]);

  const handleClose = useCallback(() => {
    startExitAnimation(toast.id);
  }, [toast.id, startExitAnimation]);

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

  const layout = {
    offsetY: toast.offsetY || 0,
    scale: toast.scale || 1,
    opacity: toast.opacity || 1,
    zIndex: toast.zIndex || 9999,
  };

  const baseAnimationStyle = getAnimationStyle(toast, layout, position);
  const hoverStyle = getHoverStyle(isHovered, layout);

  const finalStyle = {
    ...baseAnimationStyle,
    ...hoverStyle,
  };

  if (animationPhase === 'exiting') {
    finalStyle.transition = `all ${CONFIG.exitAnimationDuration}ms ${CONFIG.exitEasing}`;
  }

  const getToastClass = () => {
    const baseClass = 'toast-item';
    const typeClass = `toast-${toast.type}`;
    const stateClass = `toast-${animationPhase}`;
    const hoverClass = isHovered ? 'toast-hovered' : '';
    const latestClass = toast.isLatest ? 'toast-latest' : '';

    return `${baseClass} ${typeClass} ${stateClass} ${hoverClass} ${latestClass}`.trim();
  };

  return (
    <div
      className={getToastClass()}
      style={finalStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-content">
        {getIcon()}
        <div className="toast-message-wrapper">
          {toast.title && <div className="toast-title">{toast.title}</div>}
          <div className="toast-message">{toast.message}</div>
        </div>
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
          style={{ 
            width: `${progress}%`,
            transition: isHovered ? 'none' : 'width 0.05s linear'
          }}
        />
      )}
    </div>
  );
};

export default ToastItem;
