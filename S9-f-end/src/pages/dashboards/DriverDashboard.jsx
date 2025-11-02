import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Car, 
  Calendar, 
  MapPin, 
  Clock, 
  Settings, 
  Bell, 
  TrendingUp, 
  Navigation, 
  Star,
  Plus,
  Filter,
  Edit,
  CheckCircle,
  AlertTriangle,
  Phone,
  Route,
  Fuel,
  DollarSign,
  Wrench,
  Shield,
  Target,
  BarChart3,
  MessageSquare,
  Zap,
  Award,
  Clock3,
  Map
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import './SharedDashboard.css';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rideRequests, setRideRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [earnings, setEarnings] = useState({});
  const [maintenance, setMaintenance] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  const { useAnimatedInView, staggerAnimation } = useAnimations();

  useEffect(() => {
    // Simulate loading comprehensive data
    setRideRequests([
      { id: 1, passenger: "Sarah Johnson", pickup: "123 Main St", destination: "456 Oak Ave", time: "14:30", distance: "5.2 km", fare: "$18", status: "pending", rating: 4.8, phone: "+1-555-0123" },
      { id: 2, passenger: "Mike Chen", pickup: "789 Pine Rd", destination: "321 Elm St", time: "15:00", distance: "3.8 km", fare: "$14", status: "accepted", rating: 4.9, phone: "+1-555-0124" },
      { id: 3, passenger: "Emily Davis", pickup: "Downtown Mall", destination: "Airport", time: "15:30", distance: "12.5 km", fare: "$35", status: "pending", rating: 4.7, phone: "+1-555-0125" },
      { id: 4, passenger: "David Wilson", pickup: "Hotel Plaza", destination: "Train Station", time: "16:00", distance: "4.2 km", fare: "$16", status: "pending", rating: 4.6, phone: "+1-555-0126" }
    ]);
    
    setTrips([
      { id: 1, passenger: "Alice Brown", pickup: "Downtown Mall", destination: "Airport", date: "2024-01-10", fare: "$35", rating: 5, status: "completed", distance: "12.5 km", duration: "25 min", tip: "$5" },
      { id: 2, passenger: "John Doe", pickup: "Hotel Plaza", destination: "Train Station", date: "2024-01-09", fare: "$22", rating: 4, status: "completed", distance: "4.2 km", duration: "12 min", tip: "$3" },
      { id: 3, passenger: "Lisa Smith", pickup: "Shopping Center", destination: "Office Park", date: "2024-01-08", fare: "$28", rating: 5, status: "completed", distance: "8.7 km", duration: "18 min", tip: "$4" },
      { id: 4, passenger: "Robert Johnson", pickup: "Residential Area", destination: "Hospital", date: "2024-01-07", fare: "$19", rating: 4, status: "completed", distance: "3.1 km", duration: "8 min", tip: "$2" }
    ]);
    
    setVehicleStatus({
      model: "Toyota Camry",
      year: 2020,
      plate: "ABC-123",
      fuel: 78,
      mileage: 45230,
      insurance: "Valid until Dec 2024",
      maintenance: "Due in 2,500 km",
      lastService: "2024-01-05",
      nextService: "2024-01-25",
      fuelEfficiency: "28 mpg",
      engineHealth: "Excellent",
      tirePressure: "32 PSI"
    });

    setEarnings({
      today: 127,
      thisWeek: 845,
      thisMonth: 3240,
      total: 15680,
      averagePerRide: 24.50,
      tips: 156,
      bonuses: 89,
      fuelCosts: 45,
      maintenanceCosts: 120
    });

    setMaintenance([
      { id: 1, type: "Oil Change", dueDate: "2024-01-25", status: "scheduled", cost: "$45", priority: "medium", description: "Regular oil change and filter replacement" },
      { id: 2, type: "Tire Rotation", dueDate: "2024-02-01", status: "pending", cost: "$35", priority: "low", description: "Rotate tires for even wear" },
      { id: 3, type: "Brake Inspection", dueDate: "2024-01-30", status: "urgent", cost: "$120", priority: "high", description: "Check brake pads and rotors" },
      { id: 4, type: "Air Filter", dueDate: "2024-02-15", status: "pending", cost: "$25", priority: "low", description: "Replace cabin and engine air filters" }
    ]);

    setRoutes([
      { id: 1, name: "Downtown Loop", distance: "15.2 km", estimatedTime: "32 min", traffic: "moderate", efficiency: 85, waypoints: 8, status: "active" },
      { id: 2, name: "Airport Express", distance: "25.8 km", estimatedTime: "45 min", traffic: "low", efficiency: 92, waypoints: 5, status: "active" },
      { id: 3, name: "University Route", distance: "12.3 km", estimatedTime: "28 min", traffic: "high", efficiency: 78, waypoints: 12, status: "inactive" }
    ]);

    setNotifications([
      { id: 1, type: "maintenance", message: "Oil change due in 5 days", priority: "medium", time: "2 hours ago" },
      { id: 2, type: "earnings", message: "Weekly bonus unlocked: $25", priority: "high", time: "4 hours ago" },
      { id: 3, type: "rating", message: "New 5-star rating from Sarah J.", priority: "low", time: "6 hours ago" }
    ]);
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
    { label: "Today's Earnings", value: `$${earnings.today}`, icon: DollarSign, color: "#10b981", change: "+$23", changeType: "positive" },
    { label: "Active Rides", value: rideRequests.filter(r => r.status === 'accepted').length.toString(), icon: Car, color: "#4f9cf9", change: "+1", changeType: "positive" },
    { label: "Total Distance", value: "284 km", icon: Route, color: "#f59e0b", change: "+45 km", changeType: "positive" },
    { label: "Driver Rating", value: "4.8", icon: Star, color: "#ef4444", change: "+0.1", changeType: "positive" }
  ];

  const handleRideAction = (rideId, action) => {
    setRideRequests(prev => 
      prev.map(ride => 
        ride.id === rideId 
          ? { ...ride, status: action }
          : ride
      )
    );
  };

  const handleMaintenanceAction = (maintenanceId, action) => {
    setMaintenance(prev => 
      prev.map(item => 
        item.id === maintenanceId 
          ? { ...item, status: action }
          : item
      )
    );
  };

  const handleRouteAction = (routeId, action) => {
    setRoutes(prev => 
      prev.map(route => 
        route.id === routeId 
          ? { ...route, status: action }
          : route
      )
    );
  };

  return (
    <div className="driver-dashboard">
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
              <h1>Welcome back, Driver!</h1>
              <p>Manage your rides, track earnings, and maintain your vehicle</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary">
                <Bell size={20} />
                Notifications
              </button>
              <button className="btn-primary">
                <Plus size={20} />
                Go Online
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
              className={`tab ${activeTab === 'rides' ? 'active' : ''}`}
              onClick={() => setActiveTab('rides')}
            >
              Ride Management
            </button>
            <button 
              className={`tab ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              Earnings
            </button>
            <button 
              className={`tab ${activeTab === 'vehicle' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicle')}
            >
              Vehicle
            </button>
            <button 
              className={`tab ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              Routes
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
                {/* Quick Stats */}
                <div className="quick-stats">
                  <h3>Quick Overview</h3>
                  <div className="stats-overview">
                    <div className="stat-item">
                      <div className="stat-icon-small">
                        <DollarSign size={20} />
                      </div>
                      <div className="stat-info">
                        <h4>This Week</h4>
                        <span className="stat-value">${earnings.thisWeek}</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon-small">
                        <Route size={20} />
                      </div>
                      <div className="stat-info">
                        <h4>Total Trips</h4>
                        <span className="stat-value">{trips.length}</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon-small">
                        <Star size={20} />
                      </div>
                      <div className="stat-info">
                        <h4>Avg Rating</h4>
                        <span className="stat-value">4.8</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon-small">
                        <Fuel size={20} />
                      </div>
                      <div className="stat-info">
                        <h4>Fuel Level</h4>
                        <span className="stat-value">{vehicleStatus.fuel}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Ride Requests */}
                <div className="recent-requests">
                  <h3>Recent Ride Requests</h3>
                  <div className="requests-grid">
                    {rideRequests.slice(0, 3).map(request => (
                      <div key={request.id} className="request-card">
                        <div className="request-header">
                          <div className="passenger-info">
                            <h4>{request.passenger}</h4>
                            <div className="rating">
                              <Star size={16} fill="#fbbf24" />
                              <span>{request.rating}</span>
                            </div>
                          </div>
                          <span className={`status ${request.status}`}>{request.status}</span>
                        </div>
                        <div className="request-details">
                          <div className="location">
                            <MapPin size={16} />
                            <span><strong>From:</strong> {request.pickup}</span>
                          </div>
                          <div className="location">
                            <MapPin size={16} />
                            <span><strong>To:</strong> {request.destination}</span>
                          </div>
                          <div className="trip-info">
                            <span><Clock size={16} /> {request.time}</span>
                            <span><Route size={16} /> {request.distance}</span>
                            <span><DollarSign size={16} /> {request.fare}</span>
                          </div>
                        </div>
                        <div className="request-actions">
                          {request.status === 'pending' && (
                            <>
                              <button 
                                className="btn-primary"
                                onClick={() => handleRideAction(request.id, 'accepted')}
                              >
                                Accept
                              </button>
                              <button className="btn-secondary">Decline</button>
                            </>
                          )}
                          {request.status === 'accepted' && (
                            <button className="btn-primary">
                              <Navigation size={16} />
                              Navigate
                            </button>
                          )}
                          <button className="btn-secondary">
                            <Phone size={16} />
                            Call
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Status */}
                <div className="vehicle-status-overview">
                  <h3>Vehicle Status</h3>
                  <div className="vehicle-status-grid">
                    <div className="status-item">
                      <div className="status-icon">
                        <Fuel size={20} />
                      </div>
                      <div className="status-info">
                        <h4>Fuel Level</h4>
                        <span className={`status-value ${vehicleStatus.fuel < 20 ? 'warning' : 'normal'}`}>
                          {vehicleStatus.fuel}%
                        </span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon">
                        <Wrench size={20} />
                      </div>
                      <div className="status-info">
                        <h4>Next Service</h4>
                        <span className="status-value">{vehicleStatus.nextService}</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon">
                        <Shield size={20} />
                      </div>
                      <div className="status-info">
                        <h4>Insurance</h4>
                        <span className="status-value">{vehicleStatus.insurance}</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-icon">
                        <Target size={20} />
                      </div>
                      <div className="status-info">
                        <h4>Engine Health</h4>
                        <span className="status-value">{vehicleStatus.engineHealth}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="actions-grid">
                    <button className="action-card">
                      <Zap size={24} />
                      <span>Go Online</span>
                    </button>
                    <button className="action-card">
                      <Map size={24} />
                      <span>View Map</span>
                    </button>
                    <button className="action-card">
                      <BarChart3 size={24} />
                      <span>View Analytics</span>
                    </button>
                    <button className="action-card">
                      <Settings size={24} />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rides' && (
              <motion.div 
                className="rides-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="rides-header">
                  <h3>Ride Management</h3>
                  <div className="rides-filters">
                    <select className="filter-select">
                      <option>All Rides</option>
                      <option>Pending</option>
                      <option>Active</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>

                <div className="rides-content">
                  <div className="active-rides">
                    <h4>Active Rides</h4>
                    <div className="rides-grid">
                      {rideRequests.filter(r => r.status === 'accepted').map(ride => (
                        <div key={ride.id} className="ride-card active">
                          <div className="ride-header">
                            <h5>{ride.passenger}</h5>
                            <span className="status active">Active</span>
                          </div>
                          <div className="ride-details">
                            <div className="location">
                              <MapPin size={16} />
                              <span>{ride.pickup}</span>
                            </div>
                            <div className="location">
                              <MapPin size={16} />
                              <span>{ride.destination}</span>
                            </div>
                            <div className="trip-info">
                              <span><Clock size={16} /> {ride.time}</span>
                              <span><Route size={16} /> {ride.distance}</span>
                              <span><DollarSign size={16} /> {ride.fare}</span>
                            </div>
                          </div>
                          <div className="ride-actions">
                            <button className="btn-primary">
                              <Navigation size={16} />
                              Navigate
                            </button>
                            <button className="btn-secondary">
                              <MessageSquare size={16} />
                              Message
                            </button>
                            <button className="btn-secondary">
                              <Phone size={16} />
                              Call
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pending-rides">
                    <h4>Pending Requests</h4>
                    <div className="rides-grid">
                      {rideRequests.filter(r => r.status === 'pending').map(ride => (
                        <div key={ride.id} className="ride-card pending">
                          <div className="ride-header">
                            <h5>{ride.passenger}</h5>
                            <span className="status pending">Pending</span>
                          </div>
                          <div className="ride-details">
                            <div className="location">
                              <MapPin size={16} />
                              <span>{ride.pickup}</span>
                            </div>
                            <div className="location">
                              <MapPin size={16} />
                              <span>{ride.destination}</span>
                            </div>
                            <div className="trip-info">
                              <span><Clock size={16} /> {ride.time}</span>
                              <span><Route size={16} /> {ride.distance}</span>
                              <span><DollarSign size={16} /> {ride.fare}</span>
                            </div>
                          </div>
                          <div className="ride-actions">
                            <button 
                              className="btn-primary"
                              onClick={() => handleRideAction(ride.id, 'accepted')}
                            >
                              Accept
                            </button>
                            <button className="btn-secondary">Decline</button>
                            <button className="btn-secondary">
                              <Phone size={16} />
                              Call
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'earnings' && (
              <motion.div 
                className="earnings-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="earnings-header">
                  <h3>Earnings Overview</h3>
                  <div className="earnings-filters">
                    <select className="filter-select">
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>Last 3 Months</option>
                      <option>This Year</option>
                    </select>
                  </div>
                </div>

                <div className="earnings-overview">
                  <div className="earnings-summary">
                    <div className="summary-card">
                      <h4>Total Earnings</h4>
                      <div className="summary-value">${earnings.total}</div>
                      <div className="summary-change positive">+$2,450 this month</div>
                    </div>
                    <div className="summary-card">
                      <h4>This Week</h4>
                      <div className="summary-value">${earnings.thisWeek}</div>
                      <div className="summary-change positive">+$125 from last week</div>
                    </div>
                    <div className="summary-card">
                      <h4>Average per Ride</h4>
                      <div className="summary-value">${earnings.averagePerRide}</div>
                      <div className="summary-change positive">+$1.20 from last week</div>
                    </div>
                    <div className="summary-card">
                      <h4>Total Tips</h4>
                      <div className="summary-value">${earnings.tips}</div>
                      <div className="summary-change positive">+$23 this month</div>
                    </div>
                  </div>
                </div>

                <div className="earnings-breakdown">
                  <h3>Earnings Breakdown</h3>
                  <div className="breakdown-grid">
                    <div className="breakdown-item">
                      <h4>Ride Fares</h4>
                      <div className="breakdown-value">${earnings.thisMonth}</div>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="breakdown-item">
                      <h4>Tips</h4>
                      <div className="breakdown-value">${earnings.tips}</div>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div className="breakdown-item">
                      <h4>Bonuses</h4>
                      <div className="breakdown-value">${earnings.bonuses}</div>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="recent-trips">
                  <h3>Recent Trips</h3>
                  <div className="trips-grid">
                    {trips.map(trip => (
                      <div key={trip.id} className="trip-card">
                        <div className="trip-header">
                          <h4>{trip.passenger}</h4>
                          <span className={`status ${trip.status}`}>{trip.status}</span>
                        </div>
                        <div className="trip-details">
                          <div className="location">
                            <MapPin size={16} />
                            <span>{trip.pickup} → {trip.destination}</span>
                          </div>
                          <div className="trip-info">
                            <span><Calendar size={16} /> {trip.date}</span>
                            <span><Route size={16} /> {trip.distance}</span>
                            <span><Clock3 size={16} /> {trip.duration}</span>
                          </div>
                          <div className="trip-earnings">
                            <span className="fare"><DollarSign size={16} /> {trip.fare}</span>
                            {trip.tip && <span className="tip">+{trip.tip} tip</span>}
                            <div className="rating">
                              <Star size={16} fill="#fbbf24" />
                              <span>{trip.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'vehicle' && (
              <motion.div 
                className="vehicle-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="vehicle-header">
                  <h3>Vehicle Management</h3>
                  <button className="btn-primary">
                    <Plus size={20} />
                    Schedule Service
                  </button>
                </div>

                <div className="vehicle-overview">
                  <div className="vehicle-info">
                    <h4>Vehicle Details</h4>
                    <div className="vehicle-details">
                      <div className="detail-row">
                        <span>Model:</span>
                        <span>{vehicleStatus.model}</span>
                      </div>
                      <div className="detail-row">
                        <span>Year:</span>
                        <span>{vehicleStatus.year}</span>
                      </div>
                      <div className="detail-row">
                        <span>License Plate:</span>
                        <span>{vehicleStatus.plate}</span>
                      </div>
                      <div className="detail-row">
                        <span>Mileage:</span>
                        <span>{vehicleStatus.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="detail-row">
                        <span>Fuel Efficiency:</span>
                        <span>{vehicleStatus.fuelEfficiency}</span>
                      </div>
                      <div className="detail-row">
                        <span>Insurance:</span>
                        <span>{vehicleStatus.insurance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="vehicle-status-cards">
                    <div className="status-card">
                      <div className="status-header">
                        <Fuel size={20} />
                        <span>Fuel Level</span>
                      </div>
                      <div className={`status-value ${vehicleStatus.fuel < 20 ? 'warning' : 'normal'}`}>
                        {vehicleStatus.fuel}%
                      </div>
                      <div className="status-bar">
                        <div className="status-fill" style={{ width: `${vehicleStatus.fuel}%` }}></div>
                      </div>
                    </div>

                    <div className="status-card">
                      <div className="status-header">
                        <Wrench size={20} />
                        <span>Next Service</span>
                      </div>
                      <div className="status-value">{vehicleStatus.nextService}</div>
                      <div className="status-note">Due in 10 days</div>
                    </div>

                    <div className="status-card">
                      <div className="status-header">
                        <Shield size={20} />
                        <span>Engine Health</span>
                      </div>
                      <div className="status-value">{vehicleStatus.engineHealth}</div>
                      <div className="status-note">All systems normal</div>
                    </div>

                    <div className="status-card">
                      <div className="status-header">
                        <Target size={20} />
                        <span>Tire Pressure</span>
                      </div>
                      <div className="status-value">{vehicleStatus.tirePressure}</div>
                      <div className="status-note">Optimal range</div>
                    </div>
                  </div>
                </div>

                <div className="maintenance-schedule">
                  <h3>Maintenance Schedule</h3>
                  <div className="maintenance-grid">
                    {maintenance.map(item => (
                      <div key={item.id} className="maintenance-card">
                        <div className="maintenance-header">
                          <h4>{item.type}</h4>
                          <span className={`priority ${item.priority}`}>{item.priority}</span>
                        </div>
                        <div className="maintenance-details">
                          <p><strong>Due Date:</strong> {item.dueDate}</p>
                          <p><strong>Cost:</strong> {item.cost}</p>
                          <p><strong>Description:</strong> {item.description}</p>
                          <p><strong>Status:</strong> <span className={`status ${item.status}`}>{item.status}</span></p>
                        </div>
                        <div className="maintenance-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => handleMaintenanceAction(item.id, 'scheduled')}
                          >
                            Schedule
                          </button>
                          <button className="btn-secondary">View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'routes' && (
              <motion.div 
                className="routes-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="routes-header">
                  <h3>Route Management</h3>
                  <button className="btn-primary">
                    <Plus size={20} />
                    Create Route
                  </button>
                </div>

                <div className="routes-overview">
                  <div className="route-stats">
                    <div className="stat-item">
                      <h4>Active Routes</h4>
                      <span className="stat-value">{routes.filter(r => r.status === 'active').length}</span>
                    </div>
                    <div className="stat-item">
                      <h4>Total Distance</h4>
                      <span className="stat-value">{routes.reduce((sum, r) => sum + parseFloat(r.distance), 0).toFixed(1)} km</span>
                    </div>
                    <div className="stat-item">
                      <h4>Avg Efficiency</h4>
                      <span className="stat-value">{Math.round(routes.reduce((sum, r) => sum + r.efficiency, 0) / routes.length)}%</span>
                    </div>
                  </div>
                </div>

                <div className="routes-list">
                  <h3>Available Routes</h3>
                  <div className="routes-grid">
                    {routes.map(route => (
                      <div key={route.id} className="route-card">
                        <div className="route-header">
                          <h4>{route.name}</h4>
                          <span className={`status ${route.status}`}>{route.status}</span>
                        </div>
                        <div className="route-details">
                          <div className="route-info">
                            <span><Route size={16} /> {route.distance}</span>
                            <span><Clock size={16} /> {route.estimatedTime}</span>
                            <span><MapPin size={16} /> {route.waypoints} waypoints</span>
                          </div>
                          <div className="route-metrics">
                            <div className="metric">
                              <span>Efficiency</span>
                              <div className="efficiency-bar">
                                <div className="efficiency-fill" style={{ width: `${route.efficiency}%` }}></div>
                              </div>
                              <span>{route.efficiency}%</span>
                            </div>
                            <div className="traffic-indicator">
                              <span>Traffic:</span>
                              <span className={`traffic ${route.traffic}`}>{route.traffic}</span>
                            </div>
                          </div>
                        </div>
                        <div className="route-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => handleRouteAction(route.id, 'active')}
                          >
                            Activate
                          </button>
                          <button className="btn-secondary">
                            <Map size={16} />
                            View Map
                          </button>
                          <button className="btn-secondary">
                            <Edit size={16} />
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
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

export default DriverDashboard;
