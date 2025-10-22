import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

const NotificationTestPage = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    fetchNotifications,
    fetchUnreadCount 
  } = useNotifications();
  
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchNotifications();
    fetchUnreadCount();
    setLastRefresh(new Date());
  };

  useEffect(() => {
    console.log('🔍 NotificationTestPage - Current state:');
    console.log('   User:', user?.id);
    console.log('   Notifications count:', notifications.length);
    console.log('   Unread count:', unreadCount);
    console.log('   Loading:', loading);
    console.log('   Error:', error);
  }, [user, notifications, unreadCount, loading, error]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔔 Notification Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>👤 Current User</h2>
        {user ? (
          <div>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          </div>
        ) : (
          <p style={{ color: 'red' }}>❌ No user logged in</p>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>🔔 Notification Status</h2>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Unread Count:</strong> {unreadCount}</p>
        <p><strong>Total Notifications:</strong> {notifications.length}</p>
        <p><strong>Last Refresh:</strong> {lastRefresh.toLocaleTimeString()}</p>
        
        <button 
          onClick={handleRefresh} 
          style={{ 
            padding: '10px 20px', 
            marginTop: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Notifications
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>📋 Notifications List</h2>
        {notifications.length > 0 ? (
          <div>
            {notifications.map((notification, index) => (
              <div key={notification.id} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                backgroundColor: notification.status === 'unread' ? '#fff3cd' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '3px'
              }}>
                <p><strong>{index + 1}. {notification.title}</strong></p>
                <p>{notification.message}</p>
                <p><small>
                  Status: {notification.status} | 
                  Priority: {notification.priority} | 
                  Time: {notification.time} |
                  Type: {notification.type}
                </small></p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>No notifications found</p>
        )}
      </div>

      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#e7f3ff' }}>
        <h2>💡 Instructions</h2>
        <ol>
          <li>Make sure you're logged in as user: <code>23c88529-cae1-4fa5-af9f-9153db425cc5</code></li>
          <li>Click "Refresh Notifications" to manually update the list</li>
          <li>Check the console for detailed logs</li>
          <li>You should see 6 notifications including confirmed ones</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTestPage;
