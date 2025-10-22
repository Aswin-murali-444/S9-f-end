import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications for the current user
  const fetchNotifications = useCallback(async (page = 1, limit = 20, status = null) => {
    if (!user?.id) {
      console.log('🔍 useNotifications: No user ID available');
      return;
    }

    console.log('🔍 useNotifications: Fetching notifications for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getUserNotifications(user.id, page, limit, status);
      
      if (response.success) {
        console.log('🔍 useNotifications: API response successful:', response);
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          status: notification.status,
          priority: notification.priority,
          time: formatTimeAgo(notification.created_at),
          createdAt: notification.created_at,
          metadata: notification.metadata
        }));

        console.log('🔍 useNotifications: Formatted notifications:', formattedNotifications);

        if (page === 1) {
          setNotifications(formattedNotifications);
        } else {
          setNotifications(prev => [...prev, ...formattedNotifications]);
        }
      } else {
        console.error('API returned unsuccessful response:', response);
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // If it's a 500 error, it might be a database issue
      if (err.message?.includes('500') || err.message?.includes('Internal Server Error')) {
        setError('Notification service temporarily unavailable');
      } else {
        setError(err.message || 'Failed to fetch notifications');
      }
      
      // Set empty notifications as fallback
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) {
      console.log('🔍 useNotifications: No user ID for unread count');
      return;
    }

    console.log('🔍 useNotifications: Fetching unread count for user:', user.id);
    try {
      const response = await apiService.getUserUnreadCount(user.id);
      console.log('🔍 useNotifications: Unread count response:', response);
      if (response.success) {
        setUnreadCount(response.data.unread_count);
        console.log('🔍 useNotifications: Set unread count to:', response.data.unread_count);
      } else {
        console.error('API returned unsuccessful response for unread count:', response);
        // Don't set error state for unread count failures, just log it
        // This prevents the notification system from breaking if count fails
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
      // Don't set error state for unread count failures, just log it
      // This prevents the notification system from breaking if count fails
      // Set unread count to 0 as fallback
      setUnreadCount(0);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user?.id) return;

    try {
      await apiService.markNotificationAsRead(user.id, notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read' }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await apiService.markAllNotificationsAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user?.id]);

  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId) => {
    if (!user?.id) return;

    try {
      await apiService.dismissUserNotification(user.id, notificationId);
      
      // Update local state - remove dismissed notification
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      // Update unread count if it was unread
      const dismissedNotification = notifications.find(n => n.id === notificationId);
      if (dismissedNotification && dismissedNotification.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  }, [user?.id, notifications]);

  // Add a new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    const formattedNotification = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      status: notification.status || 'unread',
      priority: notification.priority || 'medium',
      time: formatTimeAgo(notification.created_at),
      createdAt: notification.created_at,
      metadata: notification.metadata
    };

    setNotifications(prev => [formattedNotification, ...prev]);
    
    if (formattedNotification.status === 'unread') {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_pending':
        return '📋';
      case 'booking_assigned':
        return '👨‍🔧';
      case 'booking_confirmed':
        return '✅';
      case 'service_started':
        return '🚀';
      case 'service_completed':
        return '🎉';
      case 'booking_cancelled':
        return '❌';
      case 'booking_update':
        return '📝';
      case 'payment_success':
        return '💳';
      case 'payment_failed':
        return '⚠️';
      case 'reminder':
        return '⏰';
      case 'promotion':
        return '🎁';
      default:
        return '🔔';
    }
  };

  // Get notification color based on priority
  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ff4444';
      case 'high':
        return '#ff8800';
      case 'medium':
        return '#0088ff';
      case 'low':
        return '#888888';
      default:
        return '#0088ff';
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id, fetchNotifications, fetchUnreadCount]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
      // Also refresh notifications every 30 seconds to catch status changes
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchUnreadCount, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
    getNotificationIcon,
    getNotificationColor,
    formatTimeAgo
  };
};
