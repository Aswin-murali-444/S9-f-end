import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, Plus, LogOut, Shield, Activity, Server, Users, Settings, 
  Target, DollarSign, Star, PieChart, BarChart3 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const navItems = [
    { key: 'overview', label: 'Overview', icon: BarChart3, path: '/dashboard/admin' },
    { key: 'users', label: 'User Management', icon: Users, path: '/dashboard/admin?tab=users' },
    { key: 'services', label: 'Services', icon: Settings, path: '/dashboard/admin?tab=services' },
    { key: 'allocation', label: 'Allocation', icon: Target, path: '/dashboard/admin?tab=allocation' },
    { key: 'monitoring', label: 'Monitoring', icon: Activity, path: '/dashboard/admin?tab=monitoring' },
    { key: 'billing', label: 'Billing', icon: DollarSign, path: '/dashboard/admin?tab=billing' },
    { key: 'feedback', label: 'Feedback', icon: Star, path: '/dashboard/admin?tab=feedback' },
    { key: 'system', label: 'System Health', icon: Server, path: '/dashboard/admin?tab=system' },
    { key: 'security', label: 'Security', icon: Shield, path: '/dashboard/admin?tab=security' },
    { key: 'analytics', label: 'Analytics', icon: PieChart, path: '/dashboard/admin?tab=analytics' }
  ];

  // Determine active nav item based on current path
  const getActiveNavItem = () => {
    if (location.pathname === '/dashboard/admin') {
      const urlParams = new URLSearchParams(location.search);
      const tab = urlParams.get('tab');
      return tab || 'overview';
    }
    
    // For admin pages, determine based on path
    if (location.pathname.includes('/admin/add-user')) return 'users';
    if (location.pathname.includes('/admin/add-category') || location.pathname.includes('/admin/add-service')) return 'services';
    if (location.pathname.includes('/admin/assign-provider')) return 'allocation';
    if (location.pathname.includes('/admin/create-bill')) return 'billing';
    
    return 'overview';
  };

  const activeTab = getActiveNavItem();

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

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
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

      {/* Main Content with Sidebar */}
      <section className="dashboard-content">
        <div className="container">
          <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
              <nav className="sidebar-nav">
                {navItems.map(item => (
                  <button
                    key={item.key}
                    className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
                    onClick={() => handleNavigation(item)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />
              </nav>
            </aside>

            <div className="tab-content">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminLayout;
