import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Activity,
  Database,
  Server,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  Target,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  Info,
  UserCheck,
  UserX,
  UserPlus,
  Key,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  Activity as ActivityIcon
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    systemUptime: "0%",
    responseTime: "0ms",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkTraffic: "0 GB/s",
    activeSessions: 0,
    failedLogins: 0,
    securityThreats: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState({
    userGrowth: { current: 0, change: "+0%" },
    revenueGrowth: { current: 0, change: "+0%" },
    serviceRequests: { current: 0, change: "+0%" },
    securityScore: { current: 0, change: "+0%" }
  });
  const [systemHealth, setSystemHealth] = useState({});
  const [securityEvents, setSecurityEvents] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  const { useAnimatedInView, staggerAnimation } = useAnimations();

  useEffect(() => {
    // Simulate loading comprehensive data
    setUsers([
      { id: 1, name: "John Smith", email: "john.smith@company.com", role: "admin", status: "active", lastLogin: "2024-01-15 14:30", department: "IT", permissions: ["full_access"], avatar: "JS" },
      { id: 2, name: "Sarah Johnson", email: "sarah.j@company.com", role: "supervisor", status: "active", lastLogin: "2024-01-15 13:45", department: "Operations", permissions: ["user_management", "reports"], avatar: "SJ" },
      { id: 3, name: "Mike Chen", email: "mike.chen@company.com", role: "service_provider", status: "active", lastLogin: "2024-01-15 12:20", department: "Services", permissions: ["service_management"], avatar: "MC" },
      { id: 4, name: "Emily Davis", email: "emily.d@company.com", role: "customer", status: "active", lastLogin: "2024-01-15 11:15", department: "Customer", permissions: ["basic_access"], avatar: "ED" },
      { id: 5, name: "David Wilson", email: "david.w@company.com", role: "driver", status: "inactive", lastLogin: "2024-01-10 09:30", department: "Logistics", permissions: ["driver_access"], avatar: "DW" },
      { id: 6, name: "Lisa Brown", email: "lisa.b@company.com", role: "customer", status: "suspended", lastLogin: "2024-01-08 16:45", department: "Customer", permissions: ["basic_access"], avatar: "LB" }
    ]);

    setSystemMetrics({
      totalUsers: 1247,
      activeUsers: 1189,
      newUsers: 23,
      systemUptime: "99.97%",
      responseTime: "45ms",
      cpuUsage: 23,
      memoryUsage: 67,
      diskUsage: 42,
      networkTraffic: "2.4 GB/s",
      activeSessions: 456,
      failedLogins: 12,
      securityThreats: 3
    });

    setRecentActivity([
      { id: 1, user: "John Smith", action: "User account created", target: "emily.d@company.com", timestamp: "2 minutes ago", type: "user_management", severity: "info" },
      { id: 2, user: "System", action: "Security scan completed", target: "All systems", timestamp: "5 minutes ago", type: "security", severity: "success" },
      { id: 3, user: "Sarah Johnson", action: "Report generated", target: "Monthly Analytics", timestamp: "15 minutes ago", type: "reports", severity: "info" },
      { id: 4, user: "Mike Chen", action: "Service updated", target: "Premium Care Package", timestamp: "1 hour ago", type: "service_management", severity: "info" },
      { id: 5, user: "System", action: "Backup completed", target: "Database backup", timestamp: "2 hours ago", type: "system", severity: "success" },
      { id: 6, user: "David Wilson", action: "Login failed", target: "david.w@company.com", timestamp: "3 hours ago", type: "security", severity: "warning" }
    ]);

    setAlerts([
      { id: 1, type: "security", title: "Multiple failed login attempts", message: "User account david.w@company.com has 5 failed login attempts", severity: "high", timestamp: "3 hours ago", status: "active" },
      { id: 2, type: "performance", title: "High CPU usage detected", message: "Server CPU usage has reached 85% for the last 10 minutes", severity: "medium", timestamp: "1 hour ago", status: "resolved" },
      { id: 3, type: "system", title: "Database backup overdue", message: "Scheduled database backup is 2 hours overdue", severity: "low", timestamp: "2 hours ago", status: "pending" },
      { id: 4, type: "security", title: "New user registration", message: "New user account created for emily.d@company.com", severity: "info", timestamp: "2 minutes ago", status: "reviewed" }
    ]);

    setAnalytics({
      userGrowth: { current: 1247, previous: 1189, change: "+4.9%" },
      revenueGrowth: { current: 456000, previous: 432000, change: "+5.6%" },
      serviceRequests: { current: 892, previous: 756, change: "+18.0%" },
      customerSatisfaction: { current: 4.7, previous: 4.5, change: "+4.4%" },
      systemPerformance: { current: 98.5, previous: 97.2, change: "+1.3%" },
      securityScore: { current: 94, previous: 91, change: "+3.3%" }
    });

    setSystemHealth({
      servers: { status: "healthy", uptime: "99.97%", lastCheck: "2 minutes ago" },
      database: { status: "healthy", uptime: "99.99%", lastCheck: "1 minute ago" },
      network: { status: "healthy", uptime: "99.95%", lastCheck: "3 minutes ago" },
      storage: { status: "warning", uptime: "99.89%", lastCheck: "5 minutes ago" },
      security: { status: "healthy", uptime: "100%", lastCheck: "1 minute ago" },
      applications: { status: "healthy", uptime: "99.93%", lastCheck: "4 minutes ago" }
    });

    setSecurityEvents([
      { id: 1, type: "failed_login", user: "david.w@company.com", ip: "192.168.1.45", timestamp: "3 hours ago", severity: "medium", status: "investigating" },
      { id: 2, type: "suspicious_activity", user: "unknown", ip: "203.45.67.89", timestamp: "5 hours ago", severity: "high", status: "blocked" },
      { id: 3, type: "permission_change", user: "john.smith@company.com", target: "emily.d@company.com", timestamp: "2 hours ago", severity: "low", status: "approved" },
      { id: 4, type: "data_access", user: "sarah.j@company.com", resource: "Customer Database", timestamp: "1 hour ago", severity: "info", status: "normal" }
    ]);

    setPerformanceData({
      responseTime: [45, 42, 48, 51, 47, 43, 46, 49, 44, 45, 47, 48],
      cpuUsage: [23, 25, 28, 31, 27, 24, 26, 29, 22, 25, 27, 23],
      memoryUsage: [67, 65, 68, 71, 69, 66, 67, 70, 64, 67, 69, 67],
      activeUsers: [456, 442, 468, 481, 473, 458, 465, 472, 451, 463, 470, 456]
    });
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

  const stats = [
    { label: "Total Users", value: (systemMetrics.totalUsers || 0).toLocaleString(), icon: Users, color: "#8b5cf6", change: `+${systemMetrics.newUsers || 0}`, changeType: "positive" },
    { label: "System Uptime", value: systemMetrics.systemUptime || "0%", icon: Server, color: "#10b981", change: "+0.02%", changeType: "positive" },
    { label: "Active Sessions", value: (systemMetrics.activeSessions || 0).toLocaleString(), icon: Activity, color: "#4f9cf9", change: "+12", changeType: "positive" },
    { label: "Security Score", value: `${analytics.securityScore?.current || 0}/100`, icon: Shield, color: "#f59e0b", change: analytics.securityScore?.change || "+0%", changeType: "positive" }
  ];

  const handleUserAction = (userId, action) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: action }
          : user
      )
    );
  };

  const handleAlertAction = (alertId, action) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: action }
          : alert
      )
    );
  };

  const handleSecurityEventAction = (eventId, action) => {
    setSecurityEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, status: action }
          : event
      )
    );
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
              <h1>Welcome back, Administrator!</h1>
              <p>Monitor system health, manage users, and oversee platform operations</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary">
                <Bell size={20} />
                Notifications
              </button>
              <button className="btn-primary">
                <Plus size={20} />
                Add User
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="stats-section"
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="stat-card"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                  <stat.icon size={24} color="white" />
                </div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                  {stat.change && (
                    <span className={`change ${stat.changeType}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="dashboard-content">
        <div className="container">
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
            <button 
              className={`tab ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              System Health
            </button>
            <button 
              className={`tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button 
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <motion.div 
                className="overview-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {/* System Overview */}
                <div className="system-overview">
                  <h3>System Overview</h3>
                  <div className="overview-grid">
                    <div className="overview-card">
                      <div className="card-header">
                        <h4>Performance Metrics</h4>
                        <RefreshCw size={16} className="refresh-icon" />
                      </div>
                      <div className="metrics-list">
                        <div className="metric-item">
                          <span>Response Time</span>
                          <span className="metric-value">{systemMetrics.responseTime}</span>
                        </div>
                        <div className="metric-item">
                          <span>CPU Usage</span>
                          <span className="metric-value">{systemMetrics.cpuUsage}%</span>
                        </div>
                        <div className="metric-item">
                          <span>Memory Usage</span>
                          <span className="metric-value">{systemMetrics.memoryUsage}%</span>
                        </div>
                        <div className="metric-item">
                          <span>Disk Usage</span>
                          <span className="metric-value">{systemMetrics.diskUsage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="overview-card">
                      <div className="card-header">
                        <h4>Platform Statistics</h4>
                        <BarChart3 size={16} />
                      </div>
                      <div className="stats-list">
                        <div className="stat-item">
                          <div className="stat-icon-small">
                            <Users size={16} />
                          </div>
                          <div className="stat-info">
                            <span>Total Users</span>
                            <span className="stat-value">{(systemMetrics.totalUsers || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-icon-small">
                            <Activity size={16} />
                          </div>
                          <div className="stat-info">
                            <span>Active Sessions</span>
                            <span className="stat-value">{(systemMetrics.activeSessions || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-icon-small">
                            <Globe size={16} />
                          </div>
                          <div className="stat-info">
                            <span>Network Traffic</span>
                            <span className="stat-value">{systemMetrics.networkTraffic}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overview-card">
                      <div className="card-header">
                        <h4>Security Status</h4>
                        <Shield size={16} />
                      </div>
                      <div className="security-status">
                        <div className="security-score">
                          <span className="score-value">{analytics.securityScore.current}</span>
                          <span className="score-max">/100</span>
                        </div>
                        <div className="security-metrics">
                          <div className="security-metric">
                            <span>Failed Logins</span>
                            <span className="metric-value warning">{systemMetrics.failedLogins}</span>
                          </div>
                          <div className="security-metric">
                            <span>Security Threats</span>
                            <span className="metric-value danger">{systemMetrics.securityThreats}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {recentActivity.slice(0, 6).map(activity => (
                      <div key={activity.id} className={`activity-item ${activity.type}`}>
                        <div className="activity-icon">
                          {activity.type === 'user_management' && <Users size={16} />}
                          {activity.type === 'security' && <Shield size={16} />}
                          {activity.type === 'reports' && <FileText size={16} />}
                          {activity.type === 'service_management' && <Settings size={16} />}
                          {activity.type === 'system' && <Server size={16} />}
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <span className="user">{activity.user}</span>
                            <span className="action">{activity.action}</span>
                            <span className="target">{activity.target}</span>
                          </div>
                          <span className="timestamp">{activity.timestamp}</span>
                        </div>
                        <span className={`severity ${activity.severity}`}>{activity.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="active-alerts">
                  <h3>Active Alerts</h3>
                  <div className="alerts-grid">
                    {alerts.filter(alert => alert.status === 'active').map(alert => (
                      <div key={alert.id} className={`alert-card ${alert.severity}`}>
                        <div className="alert-header">
                          <div className="alert-icon">
                            {alert.type === 'security' && <Shield size={20} />}
                            {alert.type === 'performance' && <Activity size={20} />}
                            {alert.type === 'system' && <Server size={20} />}
                          </div>
                          <div className="alert-info">
                            <h4>{alert.title}</h4>
                            <p>{alert.message}</p>
                          </div>
                          <span className={`severity ${alert.severity}`}>{alert.severity}</span>
                        </div>
                        <div className="alert-footer">
                          <span className="timestamp">{alert.timestamp}</span>
                          <div className="alert-actions">
                            <button 
                              className="btn-secondary"
                              onClick={() => handleAlertAction(alert.id, 'resolved')}
                            >
                              Resolve
                            </button>
                            <button className="btn-secondary">View Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="actions-grid">
                    <button className="action-card">
                      <UserPlus size={24} />
                      <span>Add User</span>
                    </button>
                    <button className="action-card">
                      <BarChart3 size={24} />
                      <span>Generate Report</span>
                    </button>
                    <button className="action-card">
                      <Shield size={24} />
                      <span>Security Scan</span>
                    </button>
                    <button className="action-card">
                      <Settings size={24} />
                      <span>System Settings</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div 
                className="users-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="users-header">
                  <h3>User Management</h3>
                  <div className="users-actions">
                    <div className="search-box">
                      <Search size={16} />
                      <input type="text" placeholder="Search users..." />
                    </div>
                    <select className="filter-select">
                      <option>All Roles</option>
                      <option>Admin</option>
                      <option>Supervisor</option>
                      <option>Service Provider</option>
                      <option>Customer</option>
                      <option>Driver</option>
                    </select>
                    <button className="btn-primary">
                      <Plus size={20} />
                      Add User
                    </button>
                  </div>
                </div>

                <div className="users-table">
                  <div className="table-header">
                    <div className="header-cell">User</div>
                    <div className="header-cell">Role</div>
                    <div className="header-cell">Department</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Last Login</div>
                    <div className="header-cell">Actions</div>
                  </div>
                  <div className="table-body">
                    {users.map(user => (
                      <div key={user.id} className="table-row">
                        <div className="table-cell user-info">
                          <div className="user-avatar">{user.avatar}</div>
                          <div className="user-details">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </div>
                        <div className="table-cell">
                          <span className={`role-badge ${user.role}`}>{user.role.replace('_', ' ')}</span>
                        </div>
                        <div className="table-cell">{user.department}</div>
                        <div className="table-cell">
                          <span className={`status-badge ${user.status}`}>{user.status}</span>
                        </div>
                        <div className="table-cell">{user.lastLogin}</div>
                        <div className="table-cell actions">
                          <button className="btn-icon" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="btn-icon" title="Edit">
                            <Edit size={16} />
                          </button>
                          {user.status === 'active' ? (
                            <button 
                              className="btn-icon warning" 
                              title="Suspend"
                              onClick={() => handleUserAction(user.id, 'suspended')}
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button 
                              className="btn-icon success" 
                              title="Activate"
                              onClick={() => handleUserAction(user.id, 'active')}
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          <button className="btn-icon danger" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div 
                className="system-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="system-header">
                  <h3>System Health Monitoring</h3>
                  <button className="btn-primary">
                    <RefreshCw size={20} />
                    Refresh Status
                  </button>
                </div>

                <div className="system-health-grid">
                  {Object.entries(systemHealth).map(([key, health]) => (
                    <div key={key} className={`health-card ${health.status}`}>
                      <div className="health-header">
                        <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                        <span className={`status ${health.status}`}>{health.status}</span>
                      </div>
                      <div className="health-metrics">
                        <div className="metric">
                          <span>Uptime</span>
                          <span className="metric-value">{health.uptime}</span>
                        </div>
                        <div className="metric">
                          <span>Last Check</span>
                          <span className="metric-value">{health.lastCheck}</span>
                        </div>
                      </div>
                      <div className="health-actions">
                        <button className="btn-secondary">View Details</button>
                        <button className="btn-secondary">Configure</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="performance-monitoring">
                  <h3>Performance Monitoring</h3>
                  <div className="performance-grid">
                    <div className="performance-card">
                      <h4>Response Time Trend</h4>
                      <div className="chart-placeholder">
                        <LineChart size={48} />
                        <p>Response time over the last 12 hours</p>
                        <div className="chart-data">
                          {performanceData.responseTime.map((value, index) => (
                            <div key={index} className="data-point" style={{ height: `${value * 2}px` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="performance-card">
                      <h4>Resource Usage</h4>
                      <div className="resource-usage">
                        <div className="resource-item">
                          <span>CPU</span>
                          <div className="usage-bar">
                            <div className="usage-fill" style={{ width: `${systemMetrics.cpuUsage}%` }}></div>
                          </div>
                          <span>{systemMetrics.cpuUsage}%</span>
                        </div>
                        <div className="resource-item">
                          <span>Memory</span>
                          <div className="usage-bar">
                            <div className="usage-fill" style={{ width: `${systemMetrics.memoryUsage}%` }}></div>
                          </div>
                          <span>{systemMetrics.memoryUsage}%</span>
                        </div>
                        <div className="resource-item">
                          <span>Disk</span>
                          <div className="usage-bar">
                            <div className="usage-fill" style={{ width: `${systemMetrics.diskUsage}%` }}></div>
                          </div>
                          <span>{systemMetrics.diskUsage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                className="security-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="security-header">
                  <h3>Security Monitoring</h3>
                  <div className="security-actions">
                    <button className="btn-primary">
                      <Shield size={20} />
                      Run Security Scan
                    </button>
                    <button className="btn-secondary">
                      <Download size={20} />
                      Export Logs
                    </button>
                  </div>
                </div>

                <div className="security-overview">
                  <div className="security-metrics">
                    <div className="metric-card">
                      <div className="metric-header">
                        <Shield size={20} />
                        <span>Security Score</span>
                      </div>
                      <div className="metric-value">{analytics.securityScore.current}/100</div>
                      <div className="metric-change positive">{analytics.securityScore.change}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <AlertTriangle size={20} />
                        <span>Active Threats</span>
                      </div>
                      <div className="metric-value">{systemMetrics.securityThreats}</div>
                      <div className="metric-change neutral">No change</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <Lock size={20} />
                        <span>Failed Logins</span>
                      </div>
                      <div className="metric-value">{systemMetrics.failedLogins}</div>
                      <div className="metric-change negative">+3 today</div>
                    </div>
                  </div>
                </div>

                <div className="security-events">
                  <h3>Recent Security Events</h3>
                  <div className="events-table">
                    <div className="table-header">
                      <div className="header-cell">Event Type</div>
                      <div className="header-cell">User/IP</div>
                      <div className="header-cell">Details</div>
                      <div className="header-cell">Timestamp</div>
                      <div className="header-cell">Severity</div>
                      <div className="header-cell">Status</div>
                      <div className="header-cell">Actions</div>
                    </div>
                    <div className="table-body">
                      {securityEvents.map(event => (
                        <div key={event.id} className="table-row">
                          <div className="table-cell">
                            <span className={`event-type ${event.type}`}>{event.type.replace('_', ' ')}</span>
                          </div>
                          <div className="table-cell">{event.user || event.ip}</div>
                          <div className="table-cell">{event.target || event.resource || 'N/A'}</div>
                          <div className="table-cell">{event.timestamp}</div>
                          <div className="table-cell">
                            <span className={`severity ${event.severity}`}>{event.severity}</span>
                          </div>
                          <div className="table-cell">
                            <span className={`status ${event.status}`}>{event.status}</span>
                          </div>
                          <div className="table-cell actions">
                            <button className="btn-secondary">Investigate</button>
                            <button 
                              className="btn-primary"
                              onClick={() => handleSecurityEventAction(event.id, 'resolved')}
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                className="analytics-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="analytics-header">
                  <h3>Platform Analytics</h3>
                  <div className="analytics-filters">
                    <select className="filter-select">
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                    <button className="btn-secondary">
                      <Download size={20} />
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="analytics-overview">
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <h4>User Growth</h4>
                      <div className="analytics-value">
                        <span className="current">{(analytics.userGrowth?.current || 0).toLocaleString()}</span>
                        <span className="change positive">{analytics.userGrowth?.change || "+0%"}</span>
                      </div>
                      <div className="analytics-chart">
                        <BarChart size={48} />
                        <p>User growth trend</p>
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h4>Revenue Growth</h4>
                      <div className="analytics-value">
                        <span className="current">${(analytics.revenueGrowth?.current || 0).toLocaleString()}</span>
                        <span className="change positive">{analytics.revenueGrowth?.change || "+0%"}</span>
                      </div>
                      <div className="analytics-chart">
                        <TrendingUp size={48} />
                        <p>Revenue trend</p>
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h4>Service Requests</h4>
                      <div className="analytics-value">
                        <span className="current">{(analytics.serviceRequests?.current || 0).toLocaleString()}</span>
                        <span className="change positive">{analytics.serviceRequests?.change || "+0%"}</span>
                      </div>
                      <div className="analytics-chart">
                        <ActivityIcon size={48} />
                        <p>Request volume</p>
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h4>Customer Satisfaction</h4>
                      <div className="analytics-value">
                        <span className="current">{analytics.customerSatisfaction.current}/5.0</span>
                        <span className="change positive">{analytics.customerSatisfaction.change}</span>
                      </div>
                      <div className="analytics-chart">
                        <Star size={48} />
                        <p>Satisfaction trend</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="performance-analytics">
                  <h3>Performance Analytics</h3>
                  <div className="performance-charts">
                    <div className="chart-card">
                      <h4>System Performance Trend</h4>
                      <div className="chart-placeholder">
                        <LineChart size={48} />
                        <p>System performance over time</p>
                        <div className="chart-data">
                          {[98.5, 97.2, 98.1, 97.8, 98.9, 98.3, 97.9, 98.7, 98.2, 98.6, 98.4, 98.5].map((value, index) => (
                            <div key={index} className="data-point" style={{ height: `${value}px` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="chart-card">
                      <h4>Security Score Trend</h4>
                      <div className="chart-placeholder">
                        <BarChart size={48} />
                        <p>Security score over time</p>
                        <div className="chart-data">
                          {[91, 92, 90, 93, 91, 94, 92, 93, 91, 94, 93, 94].map((value, index) => (
                            <div key={index} className="data-point" style={{ height: `${value}px` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
