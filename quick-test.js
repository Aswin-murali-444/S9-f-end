// Quick Test - Run this in your browser console to see what's happening
// Copy and paste this into your browser console on your frontend

console.log('🔍 Quick Database Test Starting...');

// Test 1: Check if we can access the users table
async function quickTest() {
  try {
    // Get the supabase client from your app
    const { supabase } = await import('./src/hooks/useAuth.js');
    
    console.log('📡 Testing database connection...');
    
    // Try to select from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing users table:', error);
      console.log('💡 This suggests a table access issue');
      return;
    }
    
    console.log('✅ Users table accessible. Current data:', data);
    
    // Try to insert a test record
    console.log('📝 Testing insert operation...');
    
    const testUser = {
      email: 'quicktest@example.com',
      role: 'customer',
      full_name: 'Quick Test User',
      auth_user_id: '11111111-1111-1111-1111-111111111111'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.log('💡 This suggests a column or constraint issue');
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test data
      await supabase
        .from('users')
        .delete()
        .eq('email', 'quicktest@example.com');
      console.log('🧹 Cleaned up test data');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test 2: Check what columns exist in your users table
async function checkColumns() {
  try {
    const { supabase } = await import('./src/hooks/useAuth.js');
    
    console.log('🔍 Checking table structure...');
    
    // Try to get one record to see what columns exist
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Could not check columns:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Available columns:', Object.keys(data[0]));
    } else {
      console.log('📋 Table is empty, but accessible');
    }
    
  } catch (error) {
    console.error('❌ Column check failed:', error);
  }
}

// Test 3: Check authentication state
async function checkAuth() {
  try {
    const { supabase } = await import('./src/hooks/useAuth.js');
    
    console.log('🔐 Checking authentication...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Auth check failed:', error);
    } else if (user) {
      console.log('✅ User authenticated:', user.id);
      console.log('📧 User email:', user.email);
    } else {
      console.log('ℹ️ No user authenticated');
    }
    
  } catch (error) {
    console.error('❌ Auth check failed:', error);
  }
}

// Run all tests
async function runQuickTests() {
  console.log('🚀 Running quick tests...');
  
  await checkAuth();
  await checkColumns();
  await quickTest();
  
  console.log('✨ Quick tests complete!');
}

// Make functions available globally
window.quickTest = quickTest;
window.checkColumns = checkColumns;
window.checkAuth = checkAuth;
window.runQuickTests = runQuickTests;

console.log('📚 Test functions loaded. Run runQuickTests() to test everything.');
console.log('💡 Or run individual tests: quickTest(), checkColumns(), checkAuth()');
