import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { apiService } from '../services/api';

const NotificationDebugPage = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    fetchNotifications,
    fetchUnreadCount 
  } = useNotifications();
  
  const [manualTest, setManualTest] = useState(null);
  const [testUserId] = useState('23c88529-cae1-4fa5-af9f-9153db425cc5'); // User with bookings

  useEffect(() => {
    console.log('🔍 Debug: Current user:', user);
    console.log('🔍 Debug: Notifications:', notifications);
    console.log('🔍 Debug: Unread count:', unreadCount);
    console.log('🔍 Debug: Loading:', loading);
    console.log('🔍 Debug: Error:', error);
  }, [user, notifications, unreadCount, loading, error]);

  const testWithCorrectUser = async () => {
    try {
      console.log('🧪 Testing with correct user ID:', testUserId);
      const response = await apiService.getUserNotifications(testUserId, 1, 20);
      console.log('🧪 Manual test response:', response);
      setManualTest(response);
    } catch (error) {
      console.error('🧪 Manual test error:', error);
      setManualTest({ error: error.message });
    }
  };

  const refreshNotifications = () => {
    fetchNotifications();
    fetchUnreadCount();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Notification Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>👤 Current User Info</h2>
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
        <h2>🔔 Notification Hook Status</h2>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Unread Count:</strong> {unreadCount}</p>
        <p><strong>Total Notifications:</strong> {notifications.length}</p>
        <button onClick={refreshNotifications} style={{ padding: '10px', marginTop: '10px' }}>
          🔄 Refresh Notifications
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>🧪 Manual API Test</h2>
        <p><strong>Test User ID:</strong> {testUserId}</p>
        <button onClick={testWithCorrectUser} style={{ padding: '10px', marginTop: '10px' }}>
          🧪 Test with Correct User
        </button>
        {manualTest && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
            <pre>{JSON.stringify(manualTest, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>📋 Current Notifications</h2>
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
                <p><small>Status: {notification.status} | Priority: {notification.priority} | Time: {notification.time}</small></p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>No notifications found</p>
        )}
      </div>

      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#e7f3ff' }}>
        <h2>💡 Troubleshooting Tips</h2>
        <ul>
          <li>Make sure you're logged in as the correct user</li>
          <li>Check the browser console for detailed logs</li>
          <li>Verify the backend server is running on port 3001</li>
          <li>Check if the user has any bookings in the database</li>
          <li>Look for any CORS or network errors in the console</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDebugPage;
