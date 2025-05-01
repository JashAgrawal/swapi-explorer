/**
 * Custom hook for tracking page transitions
 * Provides loading state for smoother transitions between pages
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

interface PageTransitionOptions {
  /**
   * Minimum duration for the loading state in milliseconds
   * This ensures the loading indicator is visible even for fast transitions
   */
  minLoadingTime?: number;
  
  /**
   * Maximum duration for the loading state in milliseconds
   * This prevents the loading state from being shown indefinitely
   */
  maxLoadingTime?: number;
}

/**
 * Hook to track page transitions and provide loading state
 */
export const usePageTransition = (options: PageTransitionOptions = {}) => {
  const {
    minLoadingTime = 300,
    maxLoadingTime = 5000,
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigationType = useNavigationType();
  
  useEffect(() => {
    let minTimeoutId: number | null = null;
    let maxTimeoutId: number | null = null;
    
    // Start loading
    setIsLoading(true);
    
    // Set minimum loading time
    minTimeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, minLoadingTime);
    
    // Set maximum loading time as a safety measure
    maxTimeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, maxLoadingTime);
    
    return () => {
      if (minTimeoutId) window.clearTimeout(minTimeoutId);
      if (maxTimeoutId) window.clearTimeout(maxTimeoutId);
    };
  }, [location.pathname, navigationType, minLoadingTime, maxLoadingTime]);
  
  return { isLoading };
};

export default usePageTransition;
