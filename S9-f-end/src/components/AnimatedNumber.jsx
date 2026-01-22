import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedNumber = ({ 
  value, 
  duration = 2000, 
  decimals = 0, 
  prefix = '', 
  suffix = '',
  className = '',
  formatNumber = true
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;
    if (isNaN(numValue)) {
      setDisplayValue(value);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = numValue - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + difference * easeOut;
      
      const formatted = decimals > 0 
        ? parseFloat(current.toFixed(decimals)) 
        : Math.floor(current);
      
      setDisplayValue(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(numValue);
        setIsAnimating(false);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration, decimals]);

  const formatDisplay = (val) => {
    if (typeof val === 'string') return val;
    if (formatNumber && decimals === 0) {
      return val.toLocaleString();
    }
    return decimals > 0 ? val.toFixed(decimals) : val.toString();
  };

  return (
    <motion.span
      className={className}
      animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formatDisplay(displayValue)}{suffix}
    </motion.span>
  );
};

export default AnimatedNumber;
