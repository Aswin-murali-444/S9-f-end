// Debug script to check current user and notifications
console.log('🔍 Debug: Checking notification system...\n');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Running in browser environment');
  
  // Check localStorage for user data
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 Current logged-in user:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Name:', user.first_name, user.last_name);
    } catch (error) {
      console.log('❌ Error parsing user data:', error.message);
    }
  } else {
    console.log('❌ No user data found in localStorage');
    console.log('💡 You need to log in to see notifications');
  }

  // Check if the notification hook is working
  console.log('\n🔔 Testing notification API...');
  
  // Test the API endpoint
  const testUserId = '23c88529-cae1-4fa5-af9f-9153db425cc5'; // User with bookings
  
  fetch(`http://localhost:3001/notifications/user/${testUserId}?page=1&limit=20`)
    .then(response => response.json())
    .then(data => {
      console.log('✅ API Response:', data);
      if (data.success && data.data.notifications) {
        console.log(`📊 Found ${data.data.notifications.length} notifications`);
        console.log(`📊 Unread count: ${data.data.notifications.filter(n => n.status === 'unread').length}`);
      }
    })
    .catch(error => {
      console.log('❌ API Error:', error.message);
    });

} else {
  console.log('🖥️ Running in Node.js environment');
  console.log('💡 To test notifications in the browser:');
  console.log('   1. Make sure you are logged in as user: 23c88529-cae1-4fa5-af9f-9153db425cc5');
  console.log('   2. Check the browser console for notification data');
  console.log('   3. The notification bell should show 6 unread notifications');
}
