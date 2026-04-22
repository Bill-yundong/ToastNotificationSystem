import React from 'react';
import ReactDOM from 'react-dom';
import { useToast } from './ToastContext';
import ToastItem from './ToastItem';
import './Toast.css';

const ToastContainer = () => {
  const { toasts } = useToast();

  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {});

  const positions = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

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

  return ReactDOM.createPortal(
    <div className="toast-portal">
      {positions.map((position) => {
        const positionToasts = groupedToasts[position] || [];
        if (positionToasts.length === 0) return null;

        const isBottom = position.startsWith('bottom');
        const sortedToasts = isBottom
          ? [...positionToasts].reverse()
          : positionToasts;

        return (
          <div key={position} className={getContainerClass(position)}>
            {sortedToasts.map((toast, index) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                index={index}
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
