import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import CONFIG from './ToastScheduler';

const ToastContext = createContext(null);

const getPriority = (type) => {
  const priorityMap = {
    error: 4,
    warning: 3,
    success: 2,
    info: 1,
    default: 0,
  };
  return priorityMap[type] || 0;
};

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST': {
      const newToast = {
        ...action.payload,
        createdAt: Date.now(),
        priority: getPriority(action.payload.type),
        animationState: 'entering',
        offsetY: 0,
        scale: 1,
        opacity: 1,
        zIndex: 0,
      };
      
      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };
    }
    
    case 'UPDATE_TOAST_ANIMATION': {
      return {
        ...state,
        toasts: state.toasts.map(toast =>
          toast.id === action.payload.id
            ? { ...toast, ...action.payload.updates }
            : toast
        ),
      };
    }
    
    case 'UPDATE_ALL_TOASTS_LAYOUT': {
      return {
        ...state,
        toasts: state.toasts.map(toast => {
          const layout = action.payload.layouts[toast.id];
          return layout ? { ...toast, ...layout } : toast;
        }),
      };
    }
    
    case 'START_EXIT_ANIMATION': {
      return {
        ...state,
        toasts: state.toasts.map(toast =>
          toast.id === action.payload
            ? { ...toast, animationState: 'exiting' }
            : toast
        ),
      };
    }
    
    case 'REMOVE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    }
    
    case 'UPDATE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.map(toast =>
          toast.id === action.payload.id ? { ...toast, ...action.payload.updates } : toast
        ),
      };
    }
    
    default:
      return state;
  }
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });
  const timersRef = useRef(new Map());
  const hoveredToastRef = useRef(null);
  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const lastEnterTimeRef = useRef(0);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    const now = Date.now();
    const timeSinceLastEnter = now - lastEnterTimeRef.current;
    const enterInterval = CONFIG.enterInterval || 150;

    if (timeSinceLastEnter < enterInterval) {
      const delay = enterInterval - timeSinceLastEnter;
      const queueTimer = setTimeout(() => {
        processQueue();
      }, delay);
      timersRef.current.set('queue_processor', queueTimer);
      return;
    }

    const { id, config } = queueRef.current.shift();
    
    dispatch({ type: 'ADD_TOAST', payload: config });
    lastEnterTimeRef.current = Date.now();

    if (config.duration > 0) {
      const dismissTimer = setTimeout(() => {
        startExitAnimation(id);
      }, config.duration);
      timersRef.current.set(id, dismissTimer);
    }

    if (queueRef.current.length > 0) {
      const nextTimer = setTimeout(() => {
        processQueue();
      }, enterInterval);
      timersRef.current.set('queue_processor', nextTimer);
    } else {
      isProcessingRef.current = false;
    }
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  }, []);

  const startExitAnimation = useCallback((id) => {
    dispatch({ type: 'START_EXIT_ANIMATION', payload: id });
    
    const exitTimer = setTimeout(() => {
      removeToast(id);
    }, CONFIG.exitAnimationDuration);
    
    timersRef.current.set(`exit_${id}`, exitTimer);
  }, [removeToast]);

  const scheduleAutoDismiss = useCallback((id, duration) => {
    if (duration <= 0) return;
    
    const timer = setTimeout(() => {
      startExitAnimation(id);
    }, duration);
    
    timersRef.current.set(id, timer);
  }, [startExitAnimation]);

  const pauseAutoDismiss = useCallback((id) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  }, []);

  const enqueueToast = useCallback((message, options = {}) => {
    const id = ++toastIdCounter;
    const toastConfig = {
      id,
      message,
      type: options.type || 'default',
      duration: options.duration !== undefined ? options.duration : 3000,
      position: options.position || 'top-right',
      title: options.title || '',
    };

    const now = Date.now();
    const timeSinceLastEnter = now - lastEnterTimeRef.current;
    const enterInterval = CONFIG.enterInterval || 150;

    if (timeSinceLastEnter >= enterInterval && !isProcessingRef.current) {
      dispatch({ type: 'ADD_TOAST', payload: toastConfig });
      lastEnterTimeRef.current = Date.now();
      
      if (toastConfig.duration > 0) {
        scheduleAutoDismiss(id, toastConfig.duration);
      }
    } else {
      queueRef.current.push({ id, config: toastConfig });
      
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        const delay = Math.max(0, enterInterval - timeSinceLastEnter);
        const queueTimer = setTimeout(() => {
          processQueue();
        }, delay);
        timersRef.current.set('queue_processor', queueTimer);
      }
    }

    return id;
  }, [scheduleAutoDismiss, processQueue]);

  const toast = useCallback((message, options = {}) => {
    return enqueueToast(message, options);
  }, [enqueueToast]);

  const success = useCallback((message, options = {}) => {
    return toast(message, { ...options, type: 'success' });
  }, [toast]);

  const error = useCallback((message, options = {}) => {
    return toast(message, { ...options, type: 'error' });
  }, [toast]);

  const warning = useCallback((message, options = {}) => {
    return toast(message, { ...options, type: 'warning' });
  }, [toast]);

  const info = useCallback((message, options = {}) => {
    return toast(message, { ...options, type: 'info' });
  }, [toast]);

  const dismiss = useCallback((id) => {
    if (id) {
      startExitAnimation(id);
    } else {
      state.toasts.forEach(toast => startExitAnimation(toast.id));
    }
  }, [startExitAnimation, state.toasts]);

  const updateToastLayout = useCallback((layouts) => {
    dispatch({ type: 'UPDATE_ALL_TOASTS_LAYOUT', payload: { layouts } });
  }, []);

  const updateToastAnimation = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_TOAST_ANIMATION', payload: { id, updates } });
  }, []);

  const setHoveredToast = useCallback((id) => {
    hoveredToastRef.current = id;
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const value = {
    toasts: state.toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    removeToast,
    startExitAnimation,
    scheduleAutoDismiss,
    pauseAutoDismiss,
    updateToastLayout,
    updateToastAnimation,
    setHoveredToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
