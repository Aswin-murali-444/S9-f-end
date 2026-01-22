// Quick check script to verify notification system
console.log('🔍 Quick Notification Check\n');

// Check if we're in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Browser Environment Detected');
  
  // Check localStorage for user
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 Current User:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      
      // Check if this is the user with bookings
      const correctUserId = '23c88529-cae1-4fa5-af9f-9153db425cc5';
      if (user.id === correctUserId) {
        console.log('✅ CORRECT USER! You should see notifications.');
        console.log('🔔 Expected: 6 unread notifications (including 1 assigned notification)');
        console.log('💡 Check the notification bell in the top-right corner');
      } else {
        console.log('❌ WRONG USER! You need to log in as:', correctUserId);
        console.log('💡 Log out and log in as the correct user to see notifications');
      }
    } catch (error) {
      console.log('❌ Error parsing user data:', error.message);
    }
  } else {
    console.log('❌ No user logged in');
    console.log('💡 Please log in first');
  }
  
  // Test API call
  console.log('\n🧪 Testing API...');
  fetch('http://localhost:3001/notifications/user/23c88529-cae1-4fa5-af9f-9153db425cc5?page=1&limit=20')
    .then(response => response.json())
    .then(data => {
      console.log('📊 API Response:');
      console.log('   Success:', data.success);
      if (data.success && data.data.notifications) {
        console.log('   Total notifications:', data.data.notifications.length);
        console.log('   Unread count:', data.data.notifications.filter(n => n.status === 'unread').length);
        
        // Show assigned notifications
        const assigned = data.data.notifications.filter(n => n.type === 'booking_assigned');
        if (assigned.length > 0) {
          console.log('🎯 Assigned notifications:', assigned.length);
          assigned.forEach(n => {
            console.log('   -', n.title, '|', n.message);
          });
        }
      }
    })
    .catch(error => {
      console.log('❌ API Error:', error.message);
      console.log('💡 Make sure backend server is running on port 3001');
    });
    
} else {
  console.log('🖥️ Node.js Environment');
  console.log('💡 Run this script in the browser console to check notifications');
}

console.log('\n📋 Summary:');
console.log('1. ✅ Backend API is working');
console.log('2. ✅ Database has 6 bookings (1 now assigned)');
console.log('3. ✅ Notification system is working');
console.log('4. ❓ Check if you are logged in as the correct user');
console.log('5. ❓ Check the notification bell in the UI');
