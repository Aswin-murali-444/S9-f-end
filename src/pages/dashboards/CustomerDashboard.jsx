import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Home, Calendar, Settings, Bell, User, LogOut, Plus, Search, Filter, Star, Clock, MapPin, Phone, Mail, CheckCircle, Play, X, Circle, DollarSign } from 'lucide-react';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data for demonstration
  const [services] = useState([
    {
      id: 1,
      name: 'Home Cleaning',
      provider: 'CleanPro Services',
      status: 'completed',
      date: '2024-01-15',
      rating: 5,
      price: '$75.00',
      category: 'cleaning',
      providerRating: 4.8,
      duration: '2 hours',
      nextService: null
    },
    {
      id: 2,
      name: 'Plumbing Repair',
      provider: 'FixIt Plumbing',
      status: 'scheduled',
      date: '2024-01-20',
      rating: null,
      price: '$120.00',
      category: 'maintenance',
      providerRating: 4.6,
      duration: '1.5 hours',
      nextService: '2024-01-20 14:00'
    },
    {
      id: 3,
      name: 'Elder Care',
      provider: 'CareFirst',
      status: 'active',
      date: '2024-01-18',
      rating: 4,
      price: '$45.00/hour',
      category: 'care',
      providerRating: 4.9,
      duration: '4 hours',
      nextService: '2024-01-19 09:00'
    }
  ]);

  const [upcomingServices] = useState([
    {
      id: 4,
      name: 'Deep Cleaning',
      provider: 'CleanPro Services',
      date: '2024-01-22',
      time: '10:00 AM',
      duration: '3 hours',
      price: '$150.00'
    },
    {
      id: 5,
      name: 'Garden Maintenance',
      provider: 'GreenThumb Landscaping',
      date: '2024-01-25',
      time: '2:00 PM',
      duration: '2 hours',
      price: '$80.00'
    }
  ]);

  const [serviceStats] = useState({
    totalServices: 24,
    completedServices: 21,
    totalSpent: '$1,850',
    averageRating: 4.7,
    favoriteCategory: 'cleaning',
    monthlySavings: '$120'
  });

  const [quickActions] = useState([
    { name: 'Book Service', icon: Plus, color: '#3b82f6', action: () => console.log('Book service') },
    { name: 'Emergency', icon: Bell, color: '#ef4444', action: () => console.log('Emergency') },
    { name: 'Schedule', icon: Calendar, color: '#10b981', action: () => console.log('Schedule') },
    { name: 'Support', icon: Phone, color: '#f59e0b', action: () => console.log('Support') }
  ]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      completed: '#10b981',
      scheduled: '#3b82f6',
      active: '#f59e0b',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'scheduled': return <Clock size={16} />;
      case 'active': return <Play size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <Circle size={16} />;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <Home size={24} className="logo-icon" />
            <h1>S9 Mini Dashboard</h1>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.user_metadata?.full_name || user?.email || 'Customer'}
              </span>
              <span className="user-role">Customer</span>
            </div>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Home size={20} />
              <span>Overview</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <Calendar size={20} />
              <span>My Services</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Plus size={20} />
              <span>Book Service</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Panel */}
        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="tab-header">
                <h2>Welcome back!</h2>
                <p>Here's what's happening with your services today</p>
              </div>

              {/* Service Statistics */}
              <div className="service-stats">
                <h3>Your Service Summary</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                      <h4>{serviceStats.totalServices}</h4>
                      <p>Total Services</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                      <h4>{serviceStats.completedServices}</h4>
                      <p>Completed</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                      <h4>{serviceStats.totalSpent}</h4>
                      <p>Total Spent</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Star size={24} />
                    </div>
                    <div className="stat-content">
                      <h4>{serviceStats.averageRating}</h4>
                      <p>Avg Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <button 
                        key={index} 
                        className="action-card"
                        onClick={action.action}
                        style={{ '--action-color': action.color }}
                      >
                        <div className="action-icon" style={{ backgroundColor: action.color }}>
                          <IconComponent size={20} />
                        </div>
                        <span>{action.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Services */}
              <div className="upcoming-services">
                <h3>Upcoming Services</h3>
                <div className="services-grid">
                  {upcomingServices.map((service) => (
                    <div key={service.id} className="service-card upcoming">
                      <div className="service-header">
                        <h4>{service.name}</h4>
                        <span className="status-badge scheduled">Scheduled</span>
                      </div>
                      <div className="service-details">
                        <p><strong>Provider:</strong> {service.provider}</p>
                        <p><strong>Date:</strong> {service.date} at {service.time}</p>
                        <p><strong>Duration:</strong> {service.duration}</p>
                        <p><strong>Price:</strong> {service.price}</p>
                      </div>
                      <div className="service-actions">
                        <button className="btn-secondary">Reschedule</button>
                        <button className="btn-primary">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Services */}
              <div className="recent-services">
                <h3>Recent Services</h3>
                <div className="services-grid">
                  {services.slice(0, 3).map((service) => (
                    <div key={service.id} className="service-card">
                      <div className="service-header">
                        <h4>{service.name}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(service.status) }}
                        >
                          {service.status}
                        </span>
                      </div>
                      <p className="provider">{service.provider}</p>
                      <div className="service-details">
                        <span className="date">{service.date}</span>
                        <span className="price">{service.price}</span>
                      </div>
                      {service.rating && (
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < service.rating ? '#fbbf24' : 'none'}
                              color="#fbbf24"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="services-tab">
              <div className="tab-header">
                <h2>My Services</h2>
                <p>Manage and track all your service requests</p>
              </div>

              {/* Search and Filter */}
              <div className="search-filter">
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="care">Care</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>

              {/* Services List */}
              <div className="services-list">
                {filteredServices.map((service) => (
                  <div key={service.id} className="service-item">
                    <div className="service-info">
                      <div className="service-main">
                        <h4>{service.name}</h4>
                        <p className="provider">{service.provider}</p>
                      </div>
                      <div className="service-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(service.status) }}
                        >
                          {service.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="service-meta">
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>{service.date}</span>
                      </div>
                      <div className="meta-item">
                        <span className="price">{service.price}</span>
                      </div>
                    </div>
                    
                    <div className="service-actions">
                      <button className="action-btn primary">View Details</button>
                      {service.status === 'scheduled' && (
                        <button className="action-btn secondary">Reschedule</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-tab">
              <div className="tab-header">
                <h2>Book a Service</h2>
                <p>Schedule new services for your home</p>
              </div>
              
              <div className="booking-placeholder">
                <Plus size={48} />
                <h3>Service Booking</h3>
                <p>Choose from our wide range of services</p>
                <button className="primary-btn">Browse Services</button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="tab-header">
                <h2>My Profile</h2>
                <p>Manage your account information</p>
              </div>
              
              <div className="profile-info">
                <div className="profile-avatar">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                
                <div className="profile-details">
                  <h3>{user?.user_metadata?.full_name || 'Customer Name'}</h3>
                  <p className="email">{user?.email || 'email@example.com'}</p>
                  <p className="role">Customer Account</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="tab-header">
                <h2>Settings</h2>
                <p>Customize your dashboard preferences</p>
              </div>
              
              <div className="settings-placeholder">
                <Settings size={48} />
                <h3>Settings</h3>
                <p>Configure your account preferences</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;
