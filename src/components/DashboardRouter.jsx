import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import './DashboardRouter.css';

const DashboardRouter = ({ user, onDashboardLoad }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardRoute, setDashboardRoute] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { getUserRole } = useAuth();

  useEffect(() => {
    const initializeDashboard = async () => {
      if (user && user.id) {
        try {
          // Get user role from profile
          const role = await getUserRole();
          setUserRole(role);
          
          if (role) {
            // Determine dashboard route based on user role
            const route = getDashboardRoute(role);
            setDashboardRoute(route);
            
            // Automatically navigate to the appropriate dashboard
            if (route) {
              navigate(route);
              return; // Exit early since we're redirecting
            } else {
              // If no valid route found, redirect to home
              navigate('/');
              return;
            }
          }
        } catch (error) {
          console.error('Failed to get user role:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, getUserRole, onDashboardLoad, navigate]);

  const getDashboardRoute = (role) => {
    const routes = {
      customer: '/dashboard/customer',
      service_provider: '/dashboard/provider',
      supervisor: '/dashboard/supervisor',
      driver: '/dashboard/driver',
      admin: '/dashboard/admin'
    };
    
    // Instead of fallback to /dashboard, redirect to home or show error
    return routes[role] || null;
  };

  const handleDashboardRedirect = () => {
    if (dashboardRoute) {
      navigate(dashboardRoute);
    } else {
      // If no dashboard route found, redirect to home
      navigate('/');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="dashboard-router">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="dashboard-router">
        <div className="error-message">
          <h2>Role Not Assigned</h2>
          <p>Your account doesn't have a role assigned yet. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-router">
      <div className="dashboard-info">
        <h2>Welcome, {user.user_metadata?.full_name || user.user_metadata?.name || user.email}!</h2>
        <p>Role: <span className="role-badge">{userRole.replace('_', ' ').toUpperCase()}</span></p>
        
        <div className="dashboard-actions">
          <button 
            className="primary-button"
            onClick={handleDashboardRedirect}
          >
            Go to Dashboard
          </button>
          
          <div className="role-specific-info">
            {userRole === 'customer' && (
              <div className="info-card">
                <h3>Customer Dashboard</h3>
                <p>Book services, manage appointments, and track your requests.</p>
              </div>
            )}
            
            {userRole === 'service_provider' && (
              <div className="info-card">
                <h3>Service Provider Dashboard</h3>
                <p>Manage service requests, update availability, and track earnings.</p>
              </div>
            )}
            
            {userRole === 'supervisor' && (
              <div className="info-card">
                <h3>Supervisor Dashboard</h3>
                <p>Oversee operations, manage teams, and monitor performance standards.</p>
              </div>
            )}
            
            {userRole === 'driver' && (
              <div className="info-card">
                <h3>Driver Dashboard</h3>
                <p>Accept ride requests, navigate routes, and track your trips.</p>
              </div>
            )}
            
            {userRole === 'admin' && (
              <div className="info-card">
                <h3>Admin Dashboard</h3>
                <p>System overview, user management, and platform monitoring.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRouter;
