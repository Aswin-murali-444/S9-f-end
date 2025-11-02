import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

const NotificationTest = () => {
  const { user, isAuthenticated } = useAuth();
  const { notifications, unreadCount, loading, error } = useNotifications();
  
  console.log('🔔 NotificationTest: Component rendered');
  console.log('🔔 NotificationTest: User:', user);
  console.log('🔔 NotificationTest: Is authenticated:', isAuthenticated);
  console.log('🔔 NotificationTest: Notifications:', notifications);
  console.log('🔔 NotificationTest: Unread count:', unreadCount);
  console.log('🔔 NotificationTest: Loading:', loading);
  console.log('🔔 NotificationTest: Error:', error);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Notification Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        <p><strong>User Email:</strong> {user?.email || 'None'}</p>
        <p><strong>User Role:</strong> {user?.role || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>Notification Status</h2>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Unread Count:</strong> {unreadCount}</p>
        <p><strong>Total Notifications:</strong> {notifications.length}</p>
      </div>

      <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>Notifications</h2>
        {notifications.length > 0 ? (
          <div>
            {notifications.map(notification => (
              <div key={notification.id} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: notification.status === 'unread' ? '#f0f8ff' : '#f9f9f9'
              }}>
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <small>Type: {notification.type} | Status: {notification.status} | Time: {notification.time}</small>
              </div>
            ))}
          </div>
        ) : (
          <p>No notifications found</p>
        )}
      </div>
    </div>
  );
};

export default NotificationTest;
