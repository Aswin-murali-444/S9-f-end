import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, Plus, LogOut, Shield, Activity, Server, Users, Settings, 
  Target, DollarSign, Star, PieChart, BarChart3, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../contexts/SearchContext';
import Logo from './Logo';
import '../pages/admin/AdminPages.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { searchQuery, setSearchQuery, performSearch, debouncedSearch, searchResults, isSearching } = useSearch();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    if (location.pathname.includes('/admin/add-user') || location.pathname.includes('/admin/users')) return 'users';
    if (location.pathname.includes('/admin/add-category') || location.pathname.includes('/admin/categories')) return 'services';
    if (location.pathname.includes('/admin/add-service') || location.pathname.includes('/admin/services')) return 'services';
    if (location.pathname.includes('/admin/assign-provider') || location.pathname.includes('/admin/allocation')) return 'allocation';
    if (location.pathname.includes('/admin/create-bill') || location.pathname.includes('/admin/billing')) return 'billing';
    if (location.pathname.includes('/admin/feedback')) return 'feedback';
    if (location.pathname.includes('/admin/system') || location.pathname.includes('/admin/health')) return 'system';
    if (location.pathname.includes('/admin/security')) return 'security';
    if (location.pathname.includes('/admin/analytics')) return 'analytics';
    if (location.pathname.includes('/admin/monitoring')) return 'monitoring';
    
    return 'overview';
  };

  const activeTab = getActiveNavItem();

  // Get page title based on current path
  const getPageTitle = () => {
    if (location.pathname === '/dashboard/admin') {
      const urlParams = new URLSearchParams(location.search);
      const tab = urlParams.get('tab');
      const tabTitles = {
        'overview': 'Overview',
        'users': 'User Management',
        'services': 'Services',
        'allocation': 'Allocation',
        'monitoring': 'Monitoring',
        'billing': 'Billing',
        'feedback': 'Feedback',
        'system': 'System Health',
        'security': 'Security',
        'analytics': 'Analytics'
      };
      return tabTitles[tab] || 'Admin Dashboard';
    }
    
    // For admin pages, determine based on path
    if (location.pathname.includes('/admin/add-user')) return 'Add User';
    if (location.pathname.includes('/admin/add-category')) return 'Add Category';
    if (location.pathname.includes('/admin/add-service')) return 'Add Service';
    if (location.pathname.includes('/admin/assign-provider')) return 'Assign Provider';
    if (location.pathname.includes('/admin/create-bill')) return 'Create Bill';
    if (location.pathname.includes('/admin/services')) return 'Services Management';
    if (location.pathname.includes('/admin/categories')) return 'Categories Management';
    
    return 'Admin Dashboard';
  };

  // Get context-aware search placeholder
  const getSearchPlaceholder = () => {
    if (location.pathname === '/dashboard/admin') {
      return 'Search users, services, or anything...';
    }
    
    // Context-aware search placeholders
    if (location.pathname.includes('/admin/add-category') || location.pathname.includes('/admin/categories')) {
      return 'Search categories...';
    }
    if (location.pathname.includes('/admin/add-service') || location.pathname.includes('/admin/services')) {
      return 'Search services...';
    }
    if (location.pathname.includes('/admin/add-user') || location.pathname.includes('/admin/users')) {
      return 'Search users...';
    }
    if (location.pathname.includes('/admin/billing') || location.pathname.includes('/admin/create-bill')) {
      return 'Search bills or payments...';
    }
    if (location.pathname.includes('/admin/assign-provider') || location.pathname.includes('/admin/allocation')) {
      return 'Search providers or allocations...';
    }
    if (location.pathname.includes('/admin/feedback')) {
      return 'Search feedback or reviews...';
    }
    if (location.pathname.includes('/admin/security')) {
      return 'Search security logs or alerts...';
    }
    if (location.pathname.includes('/admin/analytics')) {
      return 'Search analytics or reports...';
    }
    if (location.pathname.includes('/admin/monitoring')) {
      return 'Search system metrics or logs...';
    }
    
    return 'Search...';
  };

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

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Context-aware search based on current page
      if (location.pathname.includes('/admin/add-category') || location.pathname.includes('/admin/categories')) {
        performSearch(searchQuery, 'categories');
      } else if (location.pathname.includes('/admin/add-service') || location.pathname.includes('/admin/services')) {
        performSearch(searchQuery, 'services');
      } else if (location.pathname.includes('/admin/add-user') || location.pathname.includes('/admin/users')) {
        performSearch(searchQuery, 'users');
      } else {
        performSearch(searchQuery, 'general');
      }
    }
  };

  // Handle real-time search as user types
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      // Context-aware search based on current page
      if (location.pathname.includes('/admin/add-category') || location.pathname.includes('/admin/categories')) {
        debouncedSearch(query, 'categories');
      } else if (location.pathname.includes('/admin/add-service') || location.pathname.includes('/admin/services')) {
        debouncedSearch(query, 'services');
      } else if (location.pathname.includes('/admin/add-user') || location.pathname.includes('/admin/users')) {
        debouncedSearch(query, 'users');
      } else {
        debouncedSearch(query, 'general');
      }
    } else {
      setSearchResults([]);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="admin-dashboard-new">
      {/* Fixed Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Logo size="small" />
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => handleNavigation(item)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <div className="admin-header">
          <div className="header-left">
            <div className="breadcrumb-nav">
              <span className="breadcrumb-item">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">{getPageTitle()}</span>
            </div>
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="header-right">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder={getSearchPlaceholder()}
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="search-icon">🔍</button>
              </form>
              
              {/* Search Results Dropdown */}
              {searchQuery && !isSearching && (
                <div className="search-results">
                  <div className="search-results-header">
                    <span>
                      {searchResults.length > 0 
                        ? `Search Results (${searchResults.length})` 
                        : 'No Results Found'
                      }
                    </span>
                    <button 
                      className="search-clear"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="search-results-list">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <div key={index} className="search-result-item">
                          <div className="result-content">
                            <div className="result-header">
                              {result.icon_url && (
                                <div className="result-icon">
                                  <img 
                                    src={result.icon_url} 
                                    alt={result.name}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                </div>
                              )}
                              <div className="result-title">{result.name}</div>
                            </div>
                            {result.description && (
                              <div className="result-description">{result.description}</div>
                            )}
                            <div className="result-details">
                              {result.categoryName && result.categoryName !== 'No Category' && (
                                <div className="result-category">Category: {result.categoryName}</div>
                              )}
                              {result.category && !result.categoryName && (
                                <div className="result-category">Category: {result.category}</div>
                              )}
                              {(!result.categoryName || result.categoryName === 'No Category') && !result.category && (
                                <div className="result-category">Category: No Category</div>
                              )}
                              {result.formattedDuration && (
                                <div className="result-duration">Duration: {result.formattedDuration}</div>
                              )}
                              {result.email && (
                                <div className="result-email">{result.email}</div>
                              )}
                              {result.type && (
                                <div className="result-type">Type: {result.type}</div>
                              )}
                            </div>
                          </div>
                          <div className="result-status">
                            <span className={`status-badge ${result.status || (result.active ? 'active' : 'inactive')}`}>
                              {result.status || (result.active ? 'active' : 'inactive')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results-message">
                        <div className="no-results-icon">🔍</div>
                        <div className="no-results-text">
                          <h4>No results found for "{searchQuery}"</h4>
                          <p>Try adjusting your search terms or check the spelling</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {searchQuery && isSearching && (
                <div className="search-loading">
                  <div className="search-spinner"></div>
                  <span>Searching...</span>
                </div>
              )}
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-value">9</div>
                <div className="stat-label">Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">456</div>
                <div className="stat-label">Sessions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">94%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                className="admin-theme-toggle" 
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                onClick={toggleDarkMode}
              >
                <div className="admin-theme-icon">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </div>
              </button>
              
              <div className="notifications-wrapper">
                <button 
                  className="notification-btn"
                  onClick={() => setIsNotificationsOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={isNotificationsOpen}
                >
                  <div className="bell-icon-text">🔔</div>
                  <span className="notification-badge">3</span>
                </button>
                {isNotificationsOpen && (
                  <motion.div 
                    className="notifications-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      <button 
                        onClick={() => setIsNotificationsOpen(false)}
                        className="close-btn"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="notifications-list">
                      {alerts.map(alert => (
                        <div key={alert.id} className={`notification-item ${alert.severity}`}>
                          <div className="notification-icon">
                            {alert.type === 'security' && <Shield size={16} />}
                            {alert.type === 'performance' && <Activity size={16} />}
                            {alert.type === 'system' && <Server size={16} />}
                          </div>
                          <div className="notification-content">
                            <h4>{alert.title}</h4>
                            <p>{alert.message}</p>
                            <span className="notification-time">{alert.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              
              <button 
                className="btn-primary"
                onClick={() => navigate('/admin/add-user')}
                aria-label="Add User"
                title="Add User"
              >
                <Plus size={20} />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {/* Professional Dashboard Widgets - Only show on main dashboard */}
          {location.pathname === '/dashboard/admin' && (
            <div className="dashboard-widgets">
              <div className="widget-row">
                <div className="widget-card system-status">
                  <div className="widget-header">
                    <h3>System Status</h3>
                    <div className="status-indicator online">Online</div>
                  </div>
                  <div className="status-grid">
                    <div className="status-item">
                      <div className="status-icon cpu">CPU</div>
                      <div className="status-info">
                        <span className="status-value">83%</span>
                        <span className="status-label">CPU Usage</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon memory">RAM</div>
                      <div className="status-info">
                        <span className="status-value">69%</span>
                        <span className="status-label">Memory</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon disk">SSD</div>
                      <div className="status-info">
                        <span className="status-value">45%</span>
                        <span className="status-label">Storage</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="widget-card recent-activity">
                  <div className="widget-header">
                    <h3>Recent Activity</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon user-add">+</div>
                      <div className="activity-content">
                        <p>New user registered: John Doe</p>
                        <span className="activity-time">2 minutes ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon service-update">⚙️</div>
                      <div className="activity-content">
                        <p>Service "Phone Repair" updated</p>
                        <span className="activity-time">15 minutes ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon security">🔒</div>
                      <div className="activity-content">
                        <p>Security scan completed</p>
                        <span className="activity-time">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row - Charts and Quick Actions */}
              <div className="widget-row">
                <div className="widget-card performance-chart">
                  <div className="widget-header">
                    <h3>Performance Overview</h3>
                    <div className="chart-controls">
                      <button className="chart-btn active">24H</button>
                      <button className="chart-btn">7D</button>
                      <button className="chart-btn">30D</button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <div className="chart-bars">
                      <div className="chart-bar" style={{height: '60%'}}>
                        <span className="bar-value">60%</span>
                      </div>
                      <div className="chart-bar" style={{height: '80%'}}>
                        <span className="bar-value">80%</span>
                      </div>
                      <div className="chart-bar" style={{height: '45%'}}>
                        <span className="bar-value">45%</span>
                      </div>
                      <div className="chart-bar" style={{height: '90%'}}>
                        <span className="bar-value">90%</span>
                      </div>
                      <div className="chart-bar" style={{height: '70%'}}>
                        <span className="bar-value">70%</span>
                      </div>
                      <div className="chart-bar" style={{height: '85%'}}>
                        <span className="bar-value">85%</span>
                      </div>
                      <div className="chart-bar" style={{height: '55%'}}>
                        <span className="bar-value">55%</span>
                      </div>
                    </div>
                    <div className="chart-labels">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                <div className="widget-card quick-actions">
                  <div className="widget-header">
                    <h3>Quick Actions</h3>
                    <div className="action-count">6 Actions</div>
                  </div>
                  <div className="actions-grid">
                    <button className="action-btn" onClick={() => navigate('/admin/add-user')}>
                      <div className="action-icon user-add">👤</div>
                      <span>Add User</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate('/admin/add-service')}>
                      <div className="action-icon service-add">⚙️</div>
                      <span>Add Service</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate('/admin/add-category')}>
                      <div className="action-icon category-add">📁</div>
                      <span>Add Category</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate('/admin/create-bill')}>
                      <div className="action-icon billing">💰</div>
                      <span>Create Bill</span>
                    </button>
                    <button className="action-btn" onClick={() => navigate('/admin/assign-provider')}>
                      <div className="action-icon assign">🎯</div>
                      <span>Assign Provider</span>
                    </button>
                    <button className="action-btn" onClick={() => window.open('/admin/analytics', '_blank')}>
                      <div className="action-icon analytics">📊</div>
                      <span>View Analytics</span>
                  </button>
                  </div>
                </div>
              </div>

              {/* Third Row - Advanced Metrics */}
              <div className="widget-row">
                <div className="widget-card security-overview">
                  <div className="widget-header">
                    <h3>Security Overview</h3>
                    <div className="security-score">94/100</div>
                  </div>
                  <div className="security-metrics">
                    <div className="metric-item">
                      <div className="metric-label">Firewall Status</div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{width: '95%'}}></div>
                      </div>
                      <span className="metric-value">95%</span>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">SSL Certificate</div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{width: '100%'}}></div>
                      </div>
                      <span className="metric-value">100%</span>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Data Encryption</div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{width: '88%'}}></div>
                      </div>
                      <span className="metric-value">88%</span>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Access Control</div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{width: '92%'}}></div>
                      </div>
                      <span className="metric-value">92%</span>
                    </div>
                  </div>
                </div>

                <div className="widget-card user-insights">
                  <div className="widget-header">
                    <h3>User Insights</h3>
                    <div className="insight-trend">↗ +12%</div>
                  </div>
                  <div className="insights-grid">
                    <div className="insight-item">
                      <div className="insight-icon active-users">👥</div>
                      <div className="insight-content">
                        <div className="insight-value">456</div>
                        <div className="insight-label">Active Users</div>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon new-users">🆕</div>
                      <div className="insight-content">
                        <div className="insight-value">23</div>
                        <div className="insight-label">New This Week</div>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon retention">🔄</div>
                      <div className="insight-content">
                        <div className="insight-value">87%</div>
                        <div className="insight-label">Retention Rate</div>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon satisfaction">😊</div>
                      <div className="insight-content">
                        <div className="insight-value">4.8</div>
                        <div className="insight-label">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;



