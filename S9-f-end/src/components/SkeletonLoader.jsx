import React from 'react';
import { motion } from 'framer-motion';
import './SkeletonLoader.css';

const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '',
  width,
  height,
  borderRadius = '12px'
}) => {
  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <motion.div
            className={`skeleton-card ${className}`}
            variants={itemVariants}
            style={{ width, height, borderRadius }}
          >
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text-group">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-subtitle"></div>
              </div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line skeleton-line-short"></div>
            </div>
          </motion.div>
        );
      
      case 'table':
        return (
          <motion.div
            className={`skeleton-table-row ${className}`}
            variants={itemVariants}
            style={{ width, borderRadius }}
          >
            <div className="skeleton-cell">
              <div className="skeleton-avatar skeleton-avatar-small"></div>
              <div className="skeleton-line"></div>
            </div>
            <div className="skeleton-cell">
              <div className="skeleton-line"></div>
            </div>
            <div className="skeleton-cell">
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-cell">
              <div className="skeleton-line skeleton-line-short"></div>
            </div>
          </motion.div>
        );
      
      case 'stat':
        return (
          <motion.div
            className={`skeleton-stat ${className}`}
            variants={itemVariants}
            style={{ width, height, borderRadius }}
          >
            <div className="skeleton-icon"></div>
            <div className="skeleton-stat-content">
              <div className="skeleton-line skeleton-stat-value"></div>
              <div className="skeleton-line skeleton-stat-label"></div>
            </div>
          </motion.div>
        );
      
      case 'line':
        return (
          <motion.div
            className={`skeleton-line ${className}`}
            variants={itemVariants}
            style={{ width, height: height || '16px', borderRadius }}
          />
        );
      
      default:
        return (
          <motion.div
            className={`skeleton-default ${className}`}
            variants={itemVariants}
            style={{ width, height, borderRadius }}
          />
        );
    }
  };

  return (
    <motion.div
      className="skeleton-container"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default SkeletonLoader;
