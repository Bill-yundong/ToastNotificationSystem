import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useToast } from './ToastContext';
import ToastItem from './ToastItem';
import { calculateLayout, getPositionConfig } from './ToastScheduler';
import './Toast.css';

const ToastContainer = () => {
  const { toasts, updateToastLayout } = useToast();
  const containerRef = useRef(null);

  const positions = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  const groupedToasts = useMemo(() => {
    return toasts.reduce((acc, toast) => {
      const position = toast.position || 'top-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    }, {});
  }, [toasts]);

  useEffect(() => {
    const allLayouts = {};
    
    positions.forEach((position) => {
      const positionToasts = groupedToasts[position] || [];
      if (positionToasts.length > 0) {
        const layouts = calculateLayout(positionToasts, position);
        Object.assign(allLayouts, layouts);
      }
    });

    if (Object.keys(allLayouts).length > 0) {
      updateToastLayout(allLayouts);
    }
  }, [toasts, groupedToasts, updateToastLayout]);

  const getContainerClass = (position) => {
    const positionMap = {
      'top-left': 'toast-container-top-left',
      'top-center': 'toast-container-top-center',
      'top-right': 'toast-container-top-right',
      'bottom-left': 'toast-container-bottom-left',
      'bottom-center': 'toast-container-bottom-center',
      'bottom-right': 'toast-container-bottom-right',
    };
    return positionMap[position] || 'toast-container-top-right';
  };

  if (typeof document === 'undefined') return null;

  let portalRoot = document.getElementById('toast-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'toast-portal';
    document.body.appendChild(portalRoot);
  }

  const getSortedToasts = (positionToasts, position) => {
    const isBottom = position.startsWith('bottom');
    
    const sorted = [...positionToasts].sort((a, b) => {
      if (a.animationState === 'exiting' && b.animationState !== 'exiting') {
        return 1;
      }
      if (a.animationState !== 'exiting' && b.animationState === 'exiting') {
        return -1;
      }
      
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      return b.createdAt - a.createdAt;
    });

    if (isBottom) {
      return sorted;
    }

    return sorted;
  };

  return ReactDOM.createPortal(
    <div className="toast-portal" ref={containerRef}>
      {positions.map((position) => {
        const positionToasts = groupedToasts[position] || [];
        if (positionToasts.length === 0) return null;

        const sortedToasts = getSortedToasts(positionToasts, position);
        const positionConfig = getPositionConfig(position);

        return (
          <div
            key={position}
            className={getContainerClass(position)}
            style={{
              ...positionConfig,
              flexDirection: positionConfig.direction,
            }}
          >
            {sortedToasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                position={position}
              />
            ))}
          </div>
        );
      })}
    </div>,
    portalRoot
  );
};

export default ToastContainer;
