import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// Modern Performance Hook
export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  });

  useEffect(() => {
    // Measure page load performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            loadTime: entry.loadEventEnd - entry.loadEventStart
          }));
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    return () => observer.disconnect();
  }, []);

  return metrics;
};

// Modern Intersection Observer Hook
export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  const { threshold = 0.1, root = null, rootMargin = '0px' } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold, root, rootMargin]);

  return [elementRef, entry];
};

// Modern Local Storage Hook with Suspense
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Modern Debounce Hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Modern Media Query Hook
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
};

// Modern Service Data Hook
export const useServiceData = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      // Simulate API call with modern async/await
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        services: [
          { id: 1, name: 'Home Maintenance', active: true },
          { id: 2, name: 'Elderly Care', active: true },
          { id: 3, name: 'CCTV Installation', active: true },
          { id: 4, name: 'Bill Payment', active: true }
        ],
        stats: {
          totalServices: 4,
          activeServices: 4,
          satisfaction: 98
        }
      };
    },
    suspense: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Modern Contact Form Hook
export const useContactForm = () => {
  return useMutation({
    mutationFn: async (formData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (Math.random() > 0.1) { // 90% success rate
        return { success: true, message: 'Form submitted successfully!' };
      }
      throw new Error('Submission failed');
    },
    onSuccess: (data) => {
      console.log('Form submitted successfully:', data);
    },
    onError: (error) => {
      console.error('Form submission error:', error);
    }
  });
};

// Modern Theme Hook
export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
}; 