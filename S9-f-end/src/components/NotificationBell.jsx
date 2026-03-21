import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock, Eye, IndianRupee } from 'lucide-react';
import { apiService } from '../services/api';
import './NotificationBell.css';

const NotificationBell = ({ adminUserId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [wageRequestStatuses, setWageRequestStatuses] = useState({});

  useEffect(() => {
    if (adminUserId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [adminUserId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(1, 10);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationsCount();
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Keep wageRequestStatuses in sync with current notifications
  useEffect(() => {
    const wageNotifs = notifications.filter(
      (n) => n.type === 'wage_increase_request' && n?.metadata?.wage_request_id
    );
    if (!wageNotifs.length) return;

    const fetchStatuses = async () => {
      const updates = {};
      await Promise.all(
        wageNotifs.map(async (n) => {
          const reqId = n.metadata.wage_request_id;
          try {
            const res = await apiService.getWageRequest(reqId);
            if (res?.success && res.data?.status) {
              updates[reqId] = res.data.status;
            }
          } catch (err) {
            console.warn('Failed to fetch wage request status for', reqId, err);
          }
        })
      );
      if (Object.keys(updates).length) {
        setWageRequestStatuses((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchStatuses();
  }, [notifications]);

  const markAsRead = async (notificationId) => {
    setActionLoading(prev => ({ ...prev, [notificationId]: 'read' }));
    try {
      await apiService.markNotificationAsRead(notificationId, adminUserId);
      console.log('✅ Notification marked as read:', notificationId);
      
      // Refresh data from server to ensure consistency
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Still update UI even if API fails
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read', read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  const markAllAsRead = async () => {
    setActionLoading(prev => ({ ...prev, markAll: true }));
    try {
      console.log('🔄 Marking all notifications as read...');
      const response = await apiService.markAllNotificationsAsRead(adminUserId);
      console.log('✅ API Response:', response);
      
      // Refresh data from server to ensure consistency
      console.log('🔄 Refreshing notifications from server...');
      await fetchNotifications();
      await fetchUnreadCount();
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      // Still update UI even if API fails
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          status: 'read', 
          read_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    } finally {
      setActionLoading(prev => ({ ...prev, markAll: false }));
    }
  };

  const dismissNotification = async (notificationId) => {
    setActionLoading(prev => ({ ...prev, [notificationId]: 'dismiss' }));
    try {
      // Use the correct dismiss method based on user type
      if (adminUserId) {
        // Admin user - use admin dismiss method
        await apiService.dismissNotification(notificationId, adminUserId);
      } else {
        // Regular user - use user-specific dismiss method
        await apiService.dismissUserNotification(userId, notificationId);
      }
      console.log('✅ Notification dismissed:', notificationId);
      
      // Refresh data from server to ensure consistency
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      // Still update UI even if API fails
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'profile_completed':
        return <CheckCircle size={16} style={{ color: '#10b981' }} />;
      case 'verification_status_changed':
        return <AlertCircle size={16} style={{ color: '#3b82f6' }} />;
      case 'system_alert':
        return <Bell size={16} style={{ color: '#f59e0b' }} />;
      default:
        return <Bell size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleWageRequestDecision = async (notification, decision) => {
    const wageRequestId = notification?.metadata?.wage_request_id;
    if (!wageRequestId) {
      console.warn('No wage_request_id found on notification metadata');
      return;
    }
    setActionLoading(prev => ({ ...prev, [notification.id]: decision }));
    try {
      await apiService.decideWageRequest(wageRequestId, {
        decision,
        adminUserId: adminUserId || null,
        comment: null,
        newHourlyRate: undefined
      });
      // Update local status map so buttons reflect new state without full reload
      setWageRequestStatuses(prev => ({
        ...prev,
        [wageRequestId]: decision === 'approve' ? 'approved' : 'rejected'
      }));
      // Refresh unread count so badge reflects latest state
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to process wage request decision:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notification.id]: null }));
    }
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  disabled={actionLoading.markAll}
                >
                  {actionLoading.markAll ? 'Processing...' : 'Mark all read'}
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="close-btn"
                title="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notification-list">
              {loading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={24} style={{ color: '#9ca3af' }} />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isWageRequest = notification.type === 'wage_increase_request';
                const meta = notification.metadata || {};
                const currentRate = Number(meta.current_hourly_rate) || null;
                const requestedRate = Number(meta.requested_hourly_rate) || null;
                const diff =
                  currentRate != null && requestedRate != null
                    ? requestedRate - currentRate
                    : null;
                const requestStatus = meta.wage_request_id
                  ? wageRequestStatuses[meta.wage_request_id]
                  : undefined;
                const isResolvedWage =
                  isWageRequest && requestStatus && requestStatus !== 'pending';
                return (
                  <div 
                    key={notification.id}
                    className={`notification-item ${notification.status === 'unread' ? 'unread' : ''} ${isWageRequest ? 'wage-request-banner' : ''}`}
                  >
                    <div className="notification-content">
                      <div className="notification-icon">
                        {isWageRequest ? <IndianRupee size={16} /> : getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-details">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        {isWageRequest && (currentRate != null && requestedRate != null) && (
                          <p className="provider-info">
                            Current: ₹{currentRate.toFixed(2)} · Requested: ₹{requestedRate.toFixed(2)}
                            {diff != null && diff > 0 ? ` (Δ ₹${diff.toFixed(2)})` : ''}
                          </p>
                        )}
                        {notification.sender && !isWageRequest && (
                          <p className="sender-info">
                            From: {notification.sender.email} ({notification.sender.role})
                          </p>
                        )}
                        <span className="notification-time">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="notification-actions">
                      {isWageRequest ? (
                        <>
                          <button
                            className="wage-approve-btn"
                            onClick={() => handleWageRequestDecision(notification, 'approve')}
                            disabled={isResolvedWage || !!actionLoading[notification.id]}
                          >
                            {isResolvedWage
                              ? 'Approved'
                              : actionLoading[notification.id] === 'approve'
                                ? 'Approving...'
                                : 'Accept'}
                          </button>
                          <button
                            className="wage-reject-btn"
                            onClick={() => handleWageRequestDecision(notification, 'reject')}
                            disabled={isResolvedWage || !!actionLoading[notification.id]}
                          >
                            {isResolvedWage && notification.status === 'dismissed'
                              ? 'Resolved'
                              : actionLoading[notification.id] === 'reject'
                                ? 'Rejecting...'
                                : 'Reject'}
                          </button>
                        </>
                      ) : (
                        <>
                          {notification.status === 'unread' && (
                            <button 
                              className="mark-read-btn"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                              disabled={actionLoading[notification.id]}
                            >
                              {actionLoading[notification.id] === 'read' ? (
                                <div className="mini-spinner"></div>
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          )}
                          <button 
                            className="dismiss-btn"
                            onClick={() => dismissNotification(notification.id)}
                            title="Dismiss"
                            disabled={actionLoading[notification.id]}
                          >
                            {actionLoading[notification.id] === 'dismiss' ? (
                              <div className="mini-spinner"></div>
                            ) : (
                              <X size={14} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
