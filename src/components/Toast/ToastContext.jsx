import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ToastContext = createContext(null);

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(toast =>
          toast.id === action.payload.id ? { ...toast, ...action.payload.updates } : toast
        ),
      };
    default:
      return state;
  }
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const toast = useCallback((message, options = {}) => {
    const id = ++toastIdCounter;
    const toastConfig = {
      id,
      message,
      type: options.type || 'default',
      duration: options.duration !== undefined ? options.duration : 3000,
      position: options.position || 'top-right',
    };

    dispatch({ type: 'ADD_TOAST', payload: toastConfig });

    if (toastConfig.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toastConfig.duration);
    }

    return id;
  }, [removeToast]);

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
      removeToast(id);
    } else {
      state.toasts.forEach(toast => removeToast(toast.id));
    }
  }, [removeToast, state.toasts]);

  const value = {
    toasts: state.toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
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
