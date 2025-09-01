import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Heart, 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  Bell, 
  TrendingUp, 
  Shield, 
  Star,
  Plus,
  Filter,
  Edit,
  CheckCircle,
  AlertCircle,
  Phone,
  Target,
  Award,
  BarChart3,
  UserCheck,
  CalendarDays,
  AlertTriangle,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { useAnimations } from '../../hooks/useAnimations';
import './SharedDashboard.css';
import './SupervisorDashboard.css';

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [qualityReports, setQualityReports] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [trainingNeeds, setTrainingNeeds] = useState([]);
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  const { useAnimatedInView, staggerAnimation } = useAnimations();

  useEffect(() => {
    // Simulate loading comprehensive data
    setTeamAssignments([
      { id: 1, team: "Morning Shift", type: "Elderly Care", date: "2024-01-15", time: "09:00", status: "scheduled", priority: "high", members: 4, location: "Sunset Gardens" },
      { id: 2, team: "Afternoon Shift", type: "Child Care", date: "2024-01-15", time: "14:00", status: "in_progress", priority: "medium", members: 3, location: "Bright Futures" },
      { id: 3, team: "Night Shift", type: "Special Needs", date: "2024-01-15", time: "22:00", status: "pending", priority: "low", members: 2, location: "Comfort Care" },
      { id: 4, team: "Weekend Team", type: "Respite Care", date: "2024-01-20", time: "10:00", status: "scheduled", priority: "medium", members: 5, location: "Family Support" }
    ]);
    
    setStaff([
      { id: 1, name: "Sarah Wilson", role: "Senior Caregiver", experience: "5 years", lastShift: "2024-01-10", status: "active", performance: 95, certifications: ["CPR", "First Aid"], nextReview: "2024-02-01" },
      { id: 2, name: "Mike Johnson", role: "Junior Caregiver", experience: "2 years", lastShift: "2024-01-12", status: "active", performance: 87, certifications: ["CPR"], nextReview: "2024-01-25" },
      { id: 3, name: "Emily Davis", role: "Specialist Caregiver", experience: "7 years", lastShift: "2024-01-14", status: "active", performance: 98, certifications: ["CPR", "First Aid", "Special Needs"], nextReview: "2024-02-15" },
      { id: 4, name: "David Chen", role: "Junior Caregiver", experience: "1 year", lastShift: "2024-01-13", status: "training", performance: 75, certifications: ["CPR"], nextReview: "2024-01-30" }
    ]);
    
    setSchedules([
      { id: 1, time: "09:00", team: "Morning Shift", task: "Team briefing", duration: "30 min", attendees: 4, location: "Conference Room A" },
      { id: 2, time: "14:00", team: "Afternoon Shift", task: "Performance review", duration: "1 hour", attendees: 3, location: "Office 2" },
      { id: 3, time: "16:00", team: "All Staff", task: "Safety training", duration: "2 hours", attendees: 12, location: "Training Center" },
      { id: 4, time: "22:00", team: "Night Shift", task: "Handover meeting", duration: "15 min", attendees: 2, location: "Main Office" }
    ]);

    setPerformanceMetrics({
      teamEfficiency: 94,
      clientSatisfaction: 4.8,
      safetyIncidents: 2,
      trainingCompletion: 87,
      responseTime: "8.5 min",
      qualityScore: 92
    });

    setQualityReports([
      { id: 1, area: "Hygiene Standards", score: 95, status: "excellent", lastCheck: "2024-01-14", inspector: "Quality Team" },
      { id: 2, area: "Safety Protocols", score: 88, status: "good", lastCheck: "2024-01-13", inspector: "Safety Officer" },
      { id: 3, area: "Documentation", score: 92, status: "excellent", lastCheck: "2024-01-12", inspector: "Compliance Team" },
      { id: 4, area: "Client Communication", score: 90, status: "good", lastCheck: "2024-01-11", inspector: "Quality Team" }
    ]);

    setIncidents([
      { id: 1, type: "Minor Injury", severity: "low", date: "2024-01-13", staff: "Mike Johnson", status: "resolved", action: "First aid applied, incident reported" },
      { id: 2, type: "Equipment Issue", severity: "medium", date: "2024-01-12", staff: "Sarah Wilson", status: "investigating", action: "Equipment replaced, investigation ongoing" }
    ]);

    setTrainingNeeds([
      { id: 1, staff: "David Chen", skill: "Special Needs Care", priority: "high", deadline: "2024-02-01", status: "scheduled" },
      { id: 2, staff: "Mike Johnson", skill: "Advanced First Aid", priority: "medium", deadline: "2024-02-15", status: "pending" }
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
    { label: "Team Members", value: "12", icon: Users, color: "#8b5cf6", change: "+2", changeType: "positive" },
    { label: "This Week Hours", value: "168", icon: Clock, color: "#4f9cf9", change: "+12", changeType: "positive" },
    { label: "Team Performance", value: "94%", icon: TrendingUp, color: "#10b981", change: "+3%", changeType: "positive" },
    { label: "Quality Rating", value: "4.8", icon: Star, color: "#f59e0b", change: "+0.2", changeType: "positive" }
  ];

  const handleAssignmentAction = (assignmentId, action) => {
    setTeamAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: action }
          : assignment
      )
    );
  };

  const handleStaffAction = (staffId, action) => {
    setStaff(prev => 
      prev.map(member => 
        member.id === staffId 
          ? { ...member, status: action }
          : member
      )
    );
  };

  const handleScheduleAction = (scheduleId, action) => {
    setSchedules(prev => 
      prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: action }
          : schedule
      )
    );
  };

  return (
    <div className="supervisor-dashboard">
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
              <h1>Welcome back, Supervisor!</h1>
              <p>Manage your team assignments and staff relationships</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary">
                <Bell size={20} />
                Notifications
              </button>
              <button className="btn-primary">
                <Plus size={20} />
                New Assignment
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
              className={`tab ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              Team Management
            </button>
            <button 
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
            <button 
              className={`tab ${activeTab === 'quality' ? 'active' : ''}`}
              onClick={() => setActiveTab('quality')}
            >
              Quality Control
            </button>
            <button 
              className={`tab ${activeTab === 'scheduling' ? 'active' : ''}`}
              onClick={() => setActiveTab('scheduling')}
            >
              Scheduling
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
                {/* Performance Overview */}
                <div className="performance-overview">
                  <h3>Performance Overview</h3>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-header">
                        <Target size={20} />
                        <span>Team Efficiency</span>
                          </div>
                      <div className="metric-value">{performanceMetrics.teamEfficiency}%</div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${performanceMetrics.teamEfficiency}%` }}></div>
                          </div>
                        </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <Star size={20} />
                        <span>Client Satisfaction</span>
                      </div>
                      <div className="metric-value">{performanceMetrics.clientSatisfaction}/5.0</div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${performanceMetrics.clientSatisfaction * 20}%` }}></div>
                    </div>
                  </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <Shield size={20} />
                        <span>Safety Score</span>
                          </div>
                      <div className="metric-value">{100 - performanceMetrics.safetyIncidents * 10}/100</div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${100 - performanceMetrics.safetyIncidents * 10}%` }}></div>
                    </div>
                  </div>
                </div>
                </div>
                
                {/* Recent Team Assignments */}
                <div className="recent-assignments">
                  <h3>Recent Team Assignments</h3>
                <div className="assignments-grid">
                    {teamAssignments.slice(0, 3).map(assignment => (
                    <div key={assignment.id} className="assignment-card">
                      <div className="assignment-header">
                          <span className={`priority ${assignment.priority}`}>{assignment.priority}</span>
                          <span className={`status ${assignment.status}`}>{assignment.status}</span>
                        </div>
                        <h4>{assignment.team}</h4>
                        <p>{assignment.type} • {assignment.location}</p>
                      <div className="assignment-details">
                          <span><Calendar size={16} /> {assignment.date}</span>
                          <span><Clock size={16} /> {assignment.time}</span>
                          <span><Users size={16} /> {assignment.members} members</span>
                      </div>
                      <div className="assignment-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => handleAssignmentAction(assignment.id, 'in_progress')}
                          >
                            Start
                        </button>
                          <button className="btn-secondary">View Details</button>
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
                      <Plus size={24} />
                      <span>Create Assignment</span>
                    </button>
                    <button className="action-card">
                      <Users size={24} />
                      <span>Add Team Member</span>
                    </button>
                    <button className="action-card">
                      <Calendar size={24} />
                      <span>Schedule Meeting</span>
                    </button>
                    <button className="action-card">
                      <BarChart3 size={24} />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div 
                className="team-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="team-header">
                  <h3>Team Management</h3>
                  <button className="btn-primary">
                    <Plus size={20} />
                    Add Team Member
                  </button>
                </div>
                
                <div className="staff-grid">
                  {staff.map(member => (
                    <div key={member.id} className="staff-card">
                      <div className="staff-header">
                      <div className="staff-avatar">
                          {member.name.charAt(0)}
                      </div>
                      <div className="staff-info">
                        <h4>{member.name}</h4>
                          <p>{member.role}</p>
                        </div>
                        <span className={`status ${member.status}`}>{member.status}</span>
                      </div>
                      <div className="staff-details">
                        <div className="detail-item">
                          <span>Experience:</span>
                          <span>{member.experience}</span>
                        </div>
                        <div className="detail-item">
                          <span>Performance:</span>
                          <span className="performance-score">{member.performance}%</span>
                        </div>
                        <div className="detail-item">
                          <span>Last Shift:</span>
                          <span>{member.lastShift}</span>
                        </div>
                        <div className="detail-item">
                          <span>Next Review:</span>
                          <span>{member.nextReview}</span>
                        </div>
                      </div>
                      <div className="certifications">
                        <h5>Certifications:</h5>
                        <div className="cert-tags">
                          {member.certifications.map(cert => (
                            <span key={cert} className="cert-tag">{cert}</span>
                          ))}
                      </div>
                      </div>
                      <div className="staff-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleStaffAction(member.id, 'active')}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button className="btn-primary">
                          <MessageSquare size={16} />
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div 
                className="performance-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="performance-header">
                  <h3>Performance Monitoring</h3>
                  <div className="performance-filters">
                    <select className="filter-select">
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>This Quarter</option>
                    </select>
                  </div>
                </div>

                <div className="performance-metrics">
                  <div className="metric-row">
                    <div className="metric-item">
                      <h4>Team Efficiency</h4>
                      <div className="metric-value large">{performanceMetrics.teamEfficiency}%</div>
                      <div className="metric-trend positive">+3% from last week</div>
                    </div>
                    <div className="metric-item">
                      <h4>Client Satisfaction</h4>
                      <div className="metric-value large">{performanceMetrics.clientSatisfaction}/5.0</div>
                      <div className="metric-trend positive">+0.2 from last week</div>
                    </div>
                    <div className="metric-item">
                      <h4>Response Time</h4>
                      <div className="metric-value large">{performanceMetrics.responseTime}</div>
                      <div className="metric-trend negative">+0.5 min from last week</div>
                    </div>
                  </div>
                </div>

                <div className="training-needs">
                  <h3>Training Needs</h3>
                  <div className="training-grid">
                    {trainingNeeds.map(training => (
                      <div key={training.id} className="training-card">
                        <div className="training-header">
                          <h4>{training.staff}</h4>
                          <span className={`priority ${training.priority}`}>{training.priority}</span>
                        </div>
                        <p><strong>Skill:</strong> {training.skill}</p>
                        <p><strong>Deadline:</strong> {training.deadline}</p>
                        <p><strong>Status:</strong> <span className={`status ${training.status}`}>{training.status}</span></p>
                        <div className="training-actions">
                          <button className="btn-primary">Schedule Training</button>
                          <button className="btn-secondary">View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quality' && (
              <motion.div 
                className="quality-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="quality-header">
                  <h3>Quality Control</h3>
                  <button className="btn-primary">
                    <Plus size={20} />
                    New Quality Check
                  </button>
                </div>

                <div className="quality-overview">
                  <div className="quality-score">
                    <h4>Overall Quality Score</h4>
                    <div className="score-display">
                      <span className="score-value">{performanceMetrics.qualityScore}</span>
                      <span className="score-max">/100</span>
                    </div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${performanceMetrics.qualityScore}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="quality-reports">
                  <h3>Recent Quality Reports</h3>
                  <div className="reports-grid">
                    {qualityReports.map(report => (
                      <div key={report.id} className="report-card">
                        <div className="report-header">
                          <h4>{report.area}</h4>
                          <span className={`status ${report.status}`}>{report.status}</span>
                        </div>
                        <div className="report-score">
                          <span className="score">{report.score}/100</span>
                        </div>
                        <div className="report-details">
                          <p><strong>Last Check:</strong> {report.lastCheck}</p>
                          <p><strong>Inspector:</strong> {report.inspector}</p>
                        </div>
                        <div className="report-actions">
                          <button className="btn-secondary">View Report</button>
                          <button className="btn-primary">Schedule Follow-up</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="incident-management">
                  <h3>Incident Management</h3>
                  <div className="incidents-grid">
                    {incidents.map(incident => (
                      <div key={incident.id} className="incident-card">
                        <div className="incident-header">
                          <h4>{incident.type}</h4>
                          <span className={`severity ${incident.severity}`}>{incident.severity}</span>
                        </div>
                        <div className="incident-details">
                          <p><strong>Date:</strong> {incident.date}</p>
                          <p><strong>Staff:</strong> {incident.staff}</p>
                          <p><strong>Status:</strong> <span className={`status ${incident.status}`}>{incident.status}</span></p>
                          <p><strong>Action:</strong> {incident.action}</p>
                        </div>
                        <div className="incident-actions">
                          <button className="btn-secondary">Update Status</button>
                          <button className="btn-primary">View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'scheduling' && (
              <motion.div 
                className="scheduling-tab"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="scheduling-header">
                  <h3>Team Scheduling</h3>
                  <button className="btn-primary">
                    <Plus size={20} />
                    New Schedule
                  </button>
                </div>
                
                <div className="schedule-overview">
                  <div className="schedule-stats">
                    <div className="stat-item">
                      <h4>Today's Meetings</h4>
                      <span className="stat-value">{schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</span>
                    </div>
                    <div className="stat-item">
                      <h4>This Week</h4>
                      <span className="stat-value">{schedules.length}</span>
                    </div>
                    <div className="stat-item">
                      <h4>Total Attendees</h4>
                      <span className="stat-value">{schedules.reduce((sum, s) => sum + s.attendees, 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="schedule-list">
                  <h3>Upcoming Schedules</h3>
                <div className="schedules-grid">
                  {schedules.map(schedule => (
                    <div key={schedule.id} className="schedule-card">
                      <div className="schedule-time">
                        <Clock size={20} />
                        <span>{schedule.time}</span>
                      </div>
                      <div className="schedule-content">
                          <h4>{schedule.task}</h4>
                          <p><strong>Team:</strong> {schedule.team}</p>
                          <p><strong>Duration:</strong> {schedule.duration}</p>
                          <p><strong>Location:</strong> {schedule.location}</p>
                          <p><strong>Attendees:</strong> {schedule.attendees} people</p>
                      </div>
                      <div className="schedule-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => handleScheduleAction(schedule.id, 'confirmed')}
                          >
                          Confirm
                        </button>
                          <button className="btn-secondary">Edit</button>
                          <button className="btn-secondary">Cancel</button>
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

export default SupervisorDashboard;
