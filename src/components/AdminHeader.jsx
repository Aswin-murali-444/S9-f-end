import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Bell, Plus, LogOut, Shield, Activity, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [headerRef, headerInView] = useInView({ triggerOnce: false, threshold: 0.1 });

  // Mock alerts data - in real app, this would come from props or context
  const [alerts] = useState([
    { id: 1, type: 'security', title: 'Security Alert', message: 'Failed login attempts detected', severity: 'high', timestamp: '2 min ago' },
    { id: 2, type: 'performance', title: 'Performance', message: 'High CPU usage detected', severity: 'medium', timestamp: '5 min ago' },
    { id: 3, type: 'system', title: 'System', message: 'Backup completed successfully', severity: 'low', timestamp: '10 min ago' }
  ]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.section 
      className="dashboard-header"
      ref={headerRef}
      initial="hidden"
      animate={headerInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="header-content" variants={itemVariants}>
          <div className="welcome-section">
            <Logo size="medium" />
          </div>
          <div className="header-actions" ref={notificationsRef}>
            <div className="notifications-wrapper">
              <button 
                className="btn-secondary"
                onClick={() => setIsNotificationsOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={isNotificationsOpen}
              >
                <Bell size={20} />
                Notifications
              </button>
              {isNotificationsOpen && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    <button className="link-button">Mark all read</button>
                  </div>
                  <div className="dropdown-list">
                    {alerts.slice(0,6).map(item => (
                      <div key={item.id} className={`notification-item ${item.severity}`}>
                        <div className="notification-icon">
                          {item.type === 'security' && <Shield size={16} />}
                          {item.type === 'performance' && <Activity size={16} />}
                          {item.type === 'system' && <Server size={16} />}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{item.title}</div>
                          <div className="notification-message">{item.message}</div>
                          <div className="notification-meta">
                            <span className={`severity ${item.severity}`}>{item.severity}</span>
                            <span className="timestamp">{item.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button className="btn-secondary" onClick={() => setIsNotificationsOpen(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="btn-primary" onClick={() => navigate('/admin/add-user')}>
              <Plus size={20} />
              Add User
            </button>
            <button 
              className="btn-secondary"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AdminHeader;

