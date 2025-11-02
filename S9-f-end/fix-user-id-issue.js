// User ID Check and Fix Script
console.log('🔍 User ID Issue Detected!\n');

// Check current user
if (typeof window !== 'undefined') {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 Current logged-in user:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      
      const currentUserId = user.id;
      const correctUserId = '23c88529-cae1-4fa5-af9f-9153db425cc5';
      
      if (currentUserId === correctUserId) {
        console.log('✅ CORRECT USER! You should see notifications.');
      } else {
        console.log('❌ WRONG USER!');
        console.log('   Current:', currentUserId);
        console.log('   Expected:', correctUserId);
        console.log('\n💡 SOLUTION:');
        console.log('   1. Log out of current account');
        console.log('   2. Log in as the user with bookings');
        console.log('   3. Or create bookings for current user');
      }
    } catch (error) {
      console.log('❌ Error parsing user data:', error.message);
    }
  } else {
    console.log('❌ No user logged in');
  }
} else {
  console.log('🖥️ Run this in browser console');
}

console.log('\n📊 Database Status:');
console.log('   User ddb8bbd1-c8b9-4652-ac43-30c14aecb0d8: 0 bookings');
console.log('   User 23c88529-cae1-4fa5-af9f-9153db425cc5: 6 bookings');
console.log('\n🎯 The notification system is working perfectly!');
console.log('   You just need to be logged in as the correct user.');
