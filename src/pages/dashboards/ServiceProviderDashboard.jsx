import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, LogOut, Home, Calendar, Settings, Plus, DollarSign, CheckCircle, Star, Briefcase, TrendingUp } from 'lucide-react';

const ServiceProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const stats = [
    { label: "Total Earnings", value: "$2,850", icon: DollarSign, color: "#10b981" },
    { label: "Active Requests", value: "12", icon: Calendar, color: "#4f9cf9" },
    { label: "Completed Jobs", value: "48", icon: CheckCircle, color: "#8b5cf6" },
    { label: "Client Rating", value: "4.9", icon: Star, color: "#f59e0b" }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '2rem 0', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '1.2rem'
            }}>
              <User size={24} />
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.8rem', 
                fontWeight: '700', 
                color: '#1e293b',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Service Provider Dashboard
              </h1>
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                color: '#64748b', 
                fontSize: '1rem' 
              }}>
                Welcome back, {user?.email || 'Provider'}!
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}>
                <Plus size={20} />
                Add Service
              </button>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                background: isLoggingOut ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '12px 24px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                opacity: isLoggingOut ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoggingOut) {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoggingOut) {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <LogOut size={20} />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
        </div>
      </header>

      {/* Stats Section */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem' 
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '2rem',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: `${stat.color}20`,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#1e293b',
                    lineHeight: '1.2'
                  }}>
                    {stat.value}
                  </h3>
                  <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    color: '#64748b', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '0 0 3rem 0' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem' 
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '300px 1fr', 
            gap: '2rem' 
          }}>
            {/* Sidebar */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: 'fit-content'
            }}>
              <h3 style={{ 
                margin: '0 0 1.5rem 0', 
                color: '#1e293b', 
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                Navigation
              </h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { icon: Home, label: 'Overview', active: true },
                  { icon: Calendar, label: 'Service Requests' },
                  { icon: Briefcase, label: 'My Services' },
                  { icon: TrendingUp, label: 'Earnings' },
                  { icon: User, label: 'Business Profile' },
                  { icon: Settings, label: 'Settings' }
                ].map((item, index) => (
                  <button key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    border: 'none',
                    background: item.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                    color: item.active ? 'white' : '#64748b',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (!item.active) {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.color = '#667eea';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!item.active) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#64748b';
                    }
                  }}>
                    <item.icon size={20} />
                    {item.label}
                </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{ 
                margin: '0 0 2rem 0', 
                color: '#1e293b',
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                Dashboard Overview
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '2rem' 
              }}>
                {/* Recent Requests */}
                <div style={{
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '16px',
                  padding: '2rem',
                  background: 'rgba(248, 250, 252, 0.5)'
                }}>
                  <h3 style={{ 
                    margin: '0 0 1.5rem 0', 
                    color: '#1e293b',
                    fontSize: '1.3rem',
                    fontWeight: '600'
                  }}>
                    Recent Requests
                  </h3>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <div style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.5)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>House Cleaning</h4>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: '#fef3c7',
                          color: '#d97706'
                        }}>Pending</span>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>John Customer</p>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Today at 2:00 PM • $75</p>
                    </div>
                    <div style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.5)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>Deep Cleaning</h4>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: '#dcfce7',
                          color: '#16a34a'
                        }}>Confirmed</span>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Sarah Johnson</p>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Tomorrow at 10:00 AM • $120</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                <div style={{
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '16px',
                  padding: '2rem',
                  background: 'rgba(248, 250, 252, 0.5)'
                }}>
                  <h3 style={{ 
                    margin: '0 0 1.5rem 0', 
                    color: '#1e293b',
                    fontSize: '1.3rem',
                    fontWeight: '600'
                  }}>
                    Quick Actions
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem' 
                  }}>
                    {[
                      { icon: Plus, label: 'Add New Service', color: '#667eea' },
                      { icon: Calendar, label: 'Set Availability', color: '#10b981' },
                      { icon: TrendingUp, label: 'View Analytics', color: '#8b5cf6' },
                      { icon: Settings, label: 'Update Profile', color: '#f59e0b' }
                    ].map((action, index) => (
                      <button key={index} style={{
                        padding: '1rem 1.5rem',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        background: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all 0.3s ease',
                        textAlign: 'left',
                        width: '100%'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.borderColor = action.color;
                        e.target.style.background = `${action.color}10`;
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                        e.target.style.background = 'white';
                        e.target.style.transform = 'translateY(0)';
                      }}>
                        <div style={{ color: action.color }}>
                          <action.icon size={20} />
                      </div>
                        {action.label}
                      </button>
                    ))}
                  </div>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceProviderDashboard;