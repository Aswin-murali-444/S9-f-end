// Real-time notification test script
console.log('🔔 Real-time Notification Test\n');

// Check if we're in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Browser Environment Detected');
  
  // Function to test notifications
  const testNotifications = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }

    console.log('👤 Current User:', user.id);
    
    // Test API call
    try {
      const response = await fetch(`http://localhost:3001/notifications/user/${user.id}?page=1&limit=20`);
      const data = await response.json();
      
      console.log('📊 API Response:');
      console.log('   Success:', data.success);
      
      if (data.success && data.data.notifications) {
        const notifications = data.data.notifications;
        console.log('   Total notifications:', notifications.length);
        console.log('   Unread count:', notifications.filter(n => n.status === 'unread').length);
        
        // Show notification types
        const types = {};
        notifications.forEach(n => {
          types[n.type] = (types[n.type] || 0) + 1;
        });
        
        console.log('   Notification types:', types);
        
        // Show confirmed notifications
        const confirmed = notifications.filter(n => n.type === 'booking_confirmed');
        if (confirmed.length > 0) {
          console.log('✅ Confirmed notifications:', confirmed.length);
          confirmed.forEach(n => {
            console.log(`   - ${n.title}: ${n.message}`);
          });
        }
        
        // Show assigned notifications
        const assigned = notifications.filter(n => n.type === 'booking_assigned');
        if (assigned.length > 0) {
          console.log('👨‍🔧 Assigned notifications:', assigned.length);
          assigned.forEach(n => {
            console.log(`   - ${n.title}: ${n.message}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ API Error:', error.message);
    }
  };

  // Run test immediately
  testNotifications();
  
  // Set up auto-refresh every 10 seconds
  console.log('🔄 Setting up auto-refresh every 10 seconds...');
  setInterval(testNotifications, 10000);
  
  // Add manual test function to window
  window.testNotifications = testNotifications;
  console.log('💡 You can also run testNotifications() manually');
  
} else {
  console.log('🖥️ Node.js Environment');
  console.log('💡 Run this script in the browser console to test notifications');
}

console.log('\n📋 Expected Results:');
console.log('- Total notifications: 6');
console.log('- Unread count: 6');
console.log('- Confirmed notifications: 3');
console.log('- Assigned notifications: 1');
console.log('- Pending notifications: 2');
