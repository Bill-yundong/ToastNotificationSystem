const CONFIG = {
  maxVisibleToasts: 5,
  baseGap: 12,
  stackedGap: 8,
  toastHeight: 72,
  maxScaleReduction: 0.08,
  maxOpacityReduction: 0.15,
  maxOffsetY: 20,
  maxStackedOffset: 15,
  enterAnimationDuration: 400,
  exitAnimationDuration: 350,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  exitEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const calculateLayout = (toasts, position) => {
  if (toasts.length === 0) return {};

  const isBottom = position.startsWith('bottom');
  const isCenter = position.includes('center');
  
  const sortedToasts = [...toasts].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return b.createdAt - a.createdAt;
  });

  const activeToasts = sortedToasts.filter(t => t.animationState !== 'exiting');
  const exitingToasts = sortedToasts.filter(t => t.animationState === 'exiting');

  const layouts = {};
  const baseZIndex = 9999;

  activeToasts.forEach((toast, index) => {
    const isLatest = index === 0;
    const stackIndex = Math.min(index, CONFIG.maxVisibleToasts - 1);
    
    const scale = 1 - (stackIndex * CONFIG.maxScaleReduction);
    const opacity = 1 - (stackIndex * CONFIG.maxOpacityReduction);
    
    let offsetY;
    if (isBottom) {
      offsetY = stackIndex * (CONFIG.toastHeight + CONFIG.stackedGap);
    } else {
      offsetY = stackIndex * (CONFIG.toastHeight + CONFIG.stackedGap);
    }
    
    if (stackIndex > 0) {
      const stackedOffset = stackIndex * CONFIG.maxStackedOffset / CONFIG.maxVisibleToasts;
      if (isBottom) {
        offsetY += stackedOffset;
      } else {
        offsetY -= stackedOffset;
      }
    }

    const zIndex = baseZIndex - stackIndex;

    layouts[toast.id] = {
      offsetY,
      scale,
      opacity,
      zIndex,
      displayIndex: index,
      isLatest,
      stackIndex,
    };
  });

  exitingToasts.forEach((toast, index) => {
    const originalLayout = layouts[toast.id] || {
      offsetY: 0,
      scale: 1,
      opacity: 1,
      zIndex: baseZIndex - 100 - index,
      displayIndex: activeToasts.length + index,
      isLatest: false,
      stackIndex: 0,
    };
    
    layouts[toast.id] = {
      ...originalLayout,
      zIndex: baseZIndex - 100 - index,
      isExiting: true,
    };
  });

  return layouts;
};

export const getPositionConfig = (position) => {
  const positionMap = {
    'top-left': {
      top: '20px',
      left: '20px',
      right: 'auto',
      bottom: 'auto',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      direction: 'column',
    },
    'top-center': {
      top: '20px',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translateX(-50%)',
      justifyContent: 'flex-start',
      alignItems: 'center',
      direction: 'column',
    },
    'top-right': {
      top: '20px',
      left: 'auto',
      right: '20px',
      bottom: 'auto',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      direction: 'column',
    },
    'bottom-left': {
      top: 'auto',
      left: '20px',
      right: 'auto',
      bottom: '20px',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      direction: 'column-reverse',
    },
    'bottom-center': {
      top: 'auto',
      left: '50%',
      right: 'auto',
      bottom: '20px',
      transform: 'translateX(-50%)',
      justifyContent: 'flex-end',
      alignItems: 'center',
      direction: 'column-reverse',
    },
    'bottom-right': {
      top: 'auto',
      left: 'auto',
      right: '20px',
      bottom: '20px',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      direction: 'column-reverse',
    },
  };
  
  return positionMap[position] || positionMap['top-right'];
};

export const getAnimationStyle = (toast, layout, position) => {
  const isBottom = position.startsWith('bottom');
  const isLeft = position.includes('left');
  const isCenter = position.includes('center');
  
  let transform = '';
  let opacity = layout.opacity || 1;
  let zIndex = layout.zIndex || 9999;
  
  if (toast.animationState === 'entering') {
    if (isCenter) {
      transform = `translateY(${isBottom ? '100%' : '-100%'}) scale(0.9)`;
    } else if (isLeft) {
      transform = `translateX(-120%) scale(0.95)`;
    } else {
      transform = `translateX(120%) scale(0.95)`;
    }
    opacity = 0;
  } else if (toast.animationState === 'exiting') {
    if (isCenter) {
      transform = `translateY(${isBottom ? '100%' : '-100%'}) scale(0.85)`;
    } else if (isLeft) {
      transform = `translateX(-120%) scale(0.9)`;
    } else {
      transform = `translateX(120%) scale(0.9)`;
    }
    opacity = 0;
  } else {
    const scale = layout.scale || 1;
    if (isBottom) {
      transform = `translateY(${-layout.offsetY}px) scale(${scale})`;
    } else {
      transform = `translateY(${layout.offsetY}px) scale(${scale})`;
    }
  }

  return {
    transform,
    opacity,
    zIndex,
    transition: `all ${CONFIG.enterAnimationDuration}ms ${CONFIG.easing}`,
  };
};

export const getHoverStyle = (isHovered, layout) => {
  if (!isHovered) return {};
  
  return {
    transform: `translateY(0px) scale(1.02)`,
    opacity: 1,
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  };
};

export default CONFIG;
