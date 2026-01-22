import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export const useAnimations = () => {
  // Bootstrap animation trigger
  const triggerBootstrapAnimation = (element, animationClass) => {
    if (element) {
      element.classList.add(animationClass);
      element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
      }, { once: true });
    }
  };

  // Custom animation trigger
  const triggerCustomAnimation = (element, animationClass, duration = 0.6) => {
    if (element) {
      element.style.animationDuration = `${duration}s`;
      element.classList.add(animationClass);
    }
  };

  // Stagger animation for multiple elements
  const staggerAnimation = (elements, animationClass, staggerDelay = 0.1) => {
    elements.forEach((element, index) => {
      if (element) {
        setTimeout(() => {
          triggerCustomAnimation(element, animationClass);
        }, index * staggerDelay * 1000);
      }
    });
  };

  // Parallax effect
  const useParallax = (speed = 0.5) => {
    const elementRef = useRef(null);

    useEffect(() => {
      const handleScroll = () => {
        if (elementRef.current) {
          const scrolled = window.pageYOffset;
          const rate = scrolled * speed;
          elementRef.current.style.transform = `translateY(${rate}px)`;
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return elementRef;
  };

  // Typing animation
  const useTypingAnimation = (text, speed = 100) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timeout);
      }
    }, [currentIndex, text, speed]);

    return displayText;
  };

  // Pulse animation
  const usePulse = (interval = 2000) => {
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
      const timer = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
      }, interval);

      return () => clearInterval(timer);
    }, [interval]);

    return isPulsing;
  };

  // Floating animation
  const useFloat = (amplitude = 10, duration = 3) => {
    const [floatOffset, setFloatOffset] = useState(0);

    useEffect(() => {
      const animate = () => {
        const time = Date.now() * 0.001;
        const offset = Math.sin(time * (2 * Math.PI / duration)) * amplitude;
        setFloatOffset(offset);
        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, [amplitude, duration]);

    return floatOffset;
  };

  // Shimmer effect
  const useShimmer = (duration = 2) => {
    const [shimmerOffset, setShimmerOffset] = useState(0);

    useEffect(() => {
      const animate = () => {
        const time = Date.now() * 0.001;
        const offset = ((time % duration) / duration) * 200;
        setShimmerOffset(offset);
        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, [duration]);

    return shimmerOffset;
  };

  // Intersection Observer with custom animations
  const useAnimatedInView = (threshold = 0.1, triggerOnce = true) => {
    const [ref, inView] = useInView({
      threshold,
      triggerOnce,
    });

    const triggerAnimation = (animationClass) => {
      if (inView && ref.current) {
        triggerCustomAnimation(ref.current, animationClass);
      }
    };

    return { ref, inView, triggerAnimation };
  };

  // Page transition animations
  const usePageTransition = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const startTransition = () => {
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 600);
    };

    return { isTransitioning, startTransition };
  };

  // Loading animation
  const useLoadingAnimation = (duration = 2000) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, duration);

      return () => clearTimeout(timer);
    }, [duration]);

    return isLoading;
  };

  // Hover animations
  const useHoverAnimation = (animationClass) => {
    const elementRef = useRef(null);

    const handleMouseEnter = () => {
      if (elementRef.current) {
        elementRef.current.classList.add(animationClass);
      }
    };

    const handleMouseLeave = () => {
      if (elementRef.current) {
        elementRef.current.classList.remove(animationClass);
      }
    };

    return { elementRef, handleMouseEnter, handleMouseLeave };
  };

  // Number counting animation
  const useCountUp = (end, start = 0, duration = 2000, decimals = 0) => {
    const [count, setCount] = useState(start);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (end === start || isNaN(end)) return;
      
      setIsAnimating(true);
      const startTime = Date.now();
      const difference = end - start;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + difference * easeOut;
        
        setCount(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
          setIsAnimating(false);
        }
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, [end, start, duration, decimals]);

    return { count, isAnimating };
  };

  // Percentage counting animation
  const useCountUpPercentage = (end, duration = 2000) => {
    return useCountUp(end, 0, duration, 1);
  };

  return {
    triggerBootstrapAnimation,
    triggerCustomAnimation,
    staggerAnimation,
    useParallax,
    useTypingAnimation,
    usePulse,
    useFloat,
    useShimmer,
    useAnimatedInView,
    usePageTransition,
    useLoadingAnimation,
    useHoverAnimation,
    useCountUp,
    useCountUpPercentage,
  };
}; 