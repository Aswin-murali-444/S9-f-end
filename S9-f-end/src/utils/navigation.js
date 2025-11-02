// Navigation utility to prevent browser throttling
import { useNavigate } from 'react-router-dom';

let lastNavigationTime = 0;
const NAVIGATION_THROTTLE_MS = 500; // Minimum time between navigations

export const useThrottledNavigate = () => {
  const navigate = useNavigate();

  return (path, options = {}) => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTime;

    if (timeSinceLastNavigation < NAVIGATION_THROTTLE_MS) {
      console.log('🚀 Navigation throttled to prevent browser hanging');
      return;
    }

    lastNavigationTime = now;
    navigate(path, options);
  };
};

// Alternative: Use replace instead of push to avoid history buildup
export const useSafeNavigate = () => {
  const navigate = useNavigate();

  return (path, options = {}) => {
    navigate(path, { replace: true, ...options });
  };
};
