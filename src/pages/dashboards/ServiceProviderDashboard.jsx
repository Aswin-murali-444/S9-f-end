import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings, 
  Bell, 
  TrendingUp, 
  Clock, 
  Star,
  Plus,
  Filter,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import './SharedDashboard.css';
import './ServiceProviderDashboard.css';

const ServiceProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [services, setServices] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  const { useAnimatedInView, staggerAnimation } = useAnimations();

  useEffect(() => {
    // Simulate loading data
    setServiceRequests([
      { id: 1, client: "John Customer", service: "House Cleaning", date: "2024-01-15", time: "14:00", status: "pending", amount: "$75" },
      { id: 2, client: "Sarah Johnson", service: "Deep Cleaning", date: "2024-01-16", time: "10:00", status: "confirmed", amount: "$120" }
    ]);
    
    setEarnings([
      { id: 1, service: "House Cleaning", client: "John Doe", date: "2024-01-10", amount: "$75", status: "completed" },
      { id: 2, service: "Office Cleaning", client: "ABC Corp", date: "2024-01-08", amount: "$150", status: "completed" }
    ]);
    
    setServices([
      { id: 1, name: "House Cleaning", rate: "$25/hour", description: "Professional residential cleaning", active: true },
      { id: 2, name: "Deep Cleaning", rate: "$35/hour", description: "Thorough deep cleaning service", active: true },
      { id: 3, name: "Office Cleaning", rate: "$30/hour", description: "Commercial office cleaning", active: false }
    ]);
    
    setSchedule([
      { id: 1, date: "2024-01-15", time: "09:00", client: "John Doe", service: "House Cleaning", status: "confirmed" },
      { id: 2, date: "2024-01-15", time: "14:00", client: "Sarah Johnson", service: "Deep Cleaning", status: "pending" },
      { id: 3, date: "2024-01-16", time: "10:00", client: "Mike Chen", service: "House Cleaning", status: "confirmed" }
    ]);
    
    setAnalytics({
      monthlyEarnings: 2850,
      weeklyGrowth: 12.5,
      customerSatisfaction: 4.9,
      repeatCustomers: 78,
      averageServiceTime: 2.3,
      peakHours: "10:00 AM - 2:00 PM"
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
    { label: "Total Earnings", value: "$2,850", icon: DollarSign, color: "#10b981" },
    { label: "Active Requests", value: "12", icon: Calendar, color: "#4f9cf9" },
    { label: "Completed Jobs", value: "48", icon: CheckCircle, color: "#8b5cf6" },
    { label: "Client Rating", value: "4.9", icon: Star, color: "#f59e0b" }
  ];

  return (
    <div className="provider-dashboard">
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
              <h1>Welcome back, CleanPro!</h1>
              <p>Manage your services, track earnings, and connect with clients</p>
            </div>
            <div className="header-actions">
              <button className="btn-primary">
                <Plus size={20} />
                Add Service
              </button>
              <button className="btn-secondary">
                <Bell size={20} />
                Requests ({serviceRequests.filter(r => r.status === 'pending').length})
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
                key={index}
                className="stat-card"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="main-content">
        <div className="container">
          <div className="dashboard-layout">
            {/* Sidebar Navigation */}
            <div className="dashboard-sidebar">
              <nav className="sidebar-nav">
                <button 
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <Briefcase size={20} />
                  Overview
                </button>
                <button 
                  className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <Calendar size={20} />
                  Service Requests
                </button>
                <button 
                  className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  <Settings size={20} />
                  My Services
                </button>
                <button 
                  className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('earnings')}
                >
                  <TrendingUp size={20} />
                  Earnings
                </button>
                <button 
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <Users size={20} />
                  Business Profile
                </button>
              </nav>
            </div>

            {/* Main Dashboard Content */}
            <div className="dashboard-content">
              {activeTab === 'overview' && (
                <motion.div 
                  className="overview-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="content-grid">
                    {/* Pending Requests */}
                    <div className="content-card">
                      <h3>Pending Requests</h3>
                      <div className="requests-list">
                        {serviceRequests.filter(req => req.status === 'pending').map(request => (
                          <div key={request.id} className="request-item">
                            <div className="request-info">
                              <h4>{request.service}</h4>
                              <p>{request.client}</p>
                              <span className="request-time">
                                {request.date} at {request.time}
                              </span>
                            </div>
                            <div className="request-actions">
                              <button className="btn-accept">
                                <CheckCircle size={16} />
                                Accept
                              </button>
                              <button className="btn-decline">
                                <XCircle size={16} />
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Earnings */}
                    <div className="content-card">
                      <h3>Recent Earnings</h3>
                      <div className="earnings-list">
                        {earnings.slice(0, 3).map(earning => (
                          <div key={earning.id} className="earning-item">
                            <div className="earning-info">
                              <p>{earning.service}</p>
                              <span className="earning-client">{earning.client}</span>
                              <span className="earning-date">{earning.date}</span>
                            </div>
                            <div className="earning-amount">{earning.amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Service Performance */}
                    <div className="content-card">
                      <h3>Service Performance</h3>
                      <div className="performance-metrics">
                        <div className="metric">
                          <div className="metric-value">98%</div>
                          <div className="metric-label">Completion Rate</div>
                        </div>
                        <div className="metric">
                          <div className="metric-value">4.9</div>
                          <div className="metric-label">Average Rating</div>
                        </div>
                        <div className="metric">
                          <div className="metric-value">2.5h</div>
                          <div className="metric-label">Avg Response Time</div>
                        </div>
                      </div>
                    </div>

                    {/* Business Analytics */}
                    <div className="content-card">
                      <h3>Business Analytics</h3>
                      <div className="analytics-grid">
                        <div className="analytics-item">
                          <div className="analytics-icon">
                            <TrendingUp size={20} />
                          </div>
                          <div className="analytics-content">
                            <h4>${analytics.monthlyEarnings}</h4>
                            <p>Monthly Earnings</p>
                            <span className="growth-rate positive">+{analytics.weeklyGrowth}%</span>
                          </div>
                        </div>
                        <div className="analytics-item">
                          <div className="analytics-icon">
                            <Users size={20} />
                          </div>
                          <div className="analytics-content">
                            <h4>{analytics.repeatCustomers}%</h4>
                            <p>Repeat Customers</p>
                            <span className="growth-rate positive">+5.2%</span>
                          </div>
                        </div>
                        <div className="analytics-item">
                          <div className="analytics-icon">
                            <Clock size={20} />
                          </div>
                          <div className="analytics-content">
                            <h4>{analytics.averageServiceTime}h</h4>
                            <p>Avg Service Time</p>
                            <span className="growth-rate neutral">Stable</span>
                          </div>
                        </div>
                        <div className="analytics-item">
                          <div className="analytics-icon">
                            <Star size={20} />
                          </div>
                          <div className="analytics-content">
                            <h4>{analytics.customerSatisfaction}</h4>
                            <p>Customer Rating</p>
                            <span className="growth-rate positive">+0.1</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="content-card">
                      <h3>Quick Actions</h3>
                      <div className="quick-actions">
                        <button className="action-btn">
                          <Plus size={20} />
                          Add Service
                        </button>
                        <button className="action-btn">
                          <Calendar size={20} />
                          Set Availability
                        </button>
                        <button className="action-btn">
                          <TrendingUp size={20} />
                          View Analytics
                        </button>
                        <button className="action-btn">
                          <Edit size={20} />
                          Update Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'requests' && (
                <motion.div 
                  className="requests-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="content-header">
                    <h2>Service Requests</h2>
                    <div className="header-actions">
                      <button className="btn-filter">
                        <Filter size={20} />
                        Filter
                      </button>
                    </div>
                  </div>
                  <div className="requests-grid">
                    {serviceRequests.map(request => (
                      <div key={request.id} className="request-card">
                        <div className="request-header">
                          <h4>{request.service}</h4>
                          <span className={`status-badge ${request.status}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="client-name">{request.client}</p>
                        <div className="request-details">
                          <span><Calendar size={16} /> {request.date}</span>
                          <span><Clock size={16} /> {request.time}</span>
                          <span><DollarSign size={16} /> {request.amount}</span>
                        </div>
                        {request.status === 'pending' && (
                          <div className="request-actions">
                            <button className="btn-accept">Accept</button>
                            <button className="btn-decline">Decline</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'services' && (
                <motion.div 
                  className="services-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="content-header">
                    <h2>My Services</h2>
                    <button className="btn-primary">
                      <Plus size={20} />
                      Add New Service
                    </button>
                  </div>
                  <div className="services-grid">
                    {services.map(service => (
                      <div key={service.id} className="service-card">
                        <div className="service-header">
                          <h4>{service.name}</h4>
                          <div className="service-status">
                            <span className={`status-indicator ${service.active ? 'active' : 'inactive'}`}></span>
                            {service.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        <p className="service-description">{service.description}</p>
                        <div className="service-rate">{service.rate}</div>
                        <div className="service-actions">
                          <button className="btn-outline">
                            <Edit size={16} />
                            Edit
                          </button>
                          <button className={service.active ? "btn-danger" : "btn-success"}>
                            {service.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'earnings' && (
                <motion.div 
                  className="earnings-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="content-header">
                    <h2>Earnings Overview</h2>
                    <div className="earnings-summary">
                      <div className="summary-item">
                        <span>This Month</span>
                        <strong>$1,250</strong>
                      </div>
                      <div className="summary-item">
                        <span>Total Earned</span>
                        <strong>$2,850</strong>
                      </div>
                    </div>
                  </div>
                  <div className="earnings-table">
                    {earnings.map(earning => (
                      <div key={earning.id} className="earning-row">
                        <div className="earning-service">{earning.service}</div>
                        <div className="earning-client">{earning.client}</div>
                        <div className="earning-date">{earning.date}</div>
                        <div className="earning-amount">{earning.amount}</div>
                        <div className={`earning-status ${earning.status}`}>{earning.status}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div 
                  className="profile-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="profile-card">
                    <h2>Business Profile</h2>
                    <div className="profile-form">
                      <div className="form-group">
                        <label>Business Name</label>
                        <input type="text" defaultValue="CleanPro Services" />
                      </div>
                      <div className="form-group">
                        <label>Business License</label>
                        <input type="text" placeholder="License Number" />
                      </div>
                      <div className="form-group">
                        <label>Services Offered</label>
                        <div className="service-tags">
                          <span className="tag">Cleaning</span>
                          <span className="tag">Maintenance</span>
                          <span className="tag">Deep Cleaning</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Years of Experience</label>
                        <input type="number" defaultValue="5" />
                      </div>
                      <div className="form-group">
                        <label>Service Areas</label>
                        <textarea placeholder="List the areas you serve..."></textarea>
                      </div>
                      <div className="form-group">
                        <label>Certifications</label>
                        <textarea placeholder="List your certifications..."></textarea>
                      </div>
                      <button className="btn-primary">Update Profile</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceProviderDashboard;
