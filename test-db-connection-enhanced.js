// Enhanced Database Test Script
// Copy and paste this into your browser console on your frontend

console.log('🚀 Enhanced Database Test Starting...');

async function testDatabaseConnection() {
  try {
    // Get the supabase client from your app
    const { supabase } = await import('./src/hooks/useAuth.js');
    
    console.log('📡 Testing database connection...');
    
    // Test 1: Check if we can access the users table
    console.log('🔍 Test 1: Checking users table access...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('auth_user_id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Cannot access users table:', tableError);
      console.log('💡 This suggests a table access issue or RLS policy problem');
      return false;
    }
    
    console.log('✅ Users table accessible. Current data:', tableCheck);
    
    // Test 2: Check table structure
    console.log('🔍 Test 2: Checking table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Structure check failed:', structureError);
      return false;
    }
    
    if (structureData && structureData.length > 0) {
      console.log('📋 Available columns:', Object.keys(structureData[0]));
    } else {
      console.log('📋 Table is empty, but accessible');
    }
    
    // Test 3: Try to insert a test record
    console.log('🔍 Test 3: Testing insert operation...');
    
    const testUser = {
      email: 'test@example.com',
      role: 'customer',
      full_name: 'Test User',
      auth_user_id: '11111111-1111-1111-1111-111111111111'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.log('💡 This suggests a column, constraint, or RLS policy issue');
      console.log('🔧 Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return false;
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com');
      
      if (deleteError) {
        console.warn('⚠️ Could not clean up test data:', deleteError);
      } else {
        console.log('🧹 Cleaned up test data');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function testAuthenticationState() {
  try {
    const { supabase } = await import('./src/hooks/useAuth.js');
    
    console.log('🔐 Testing authentication state...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Auth check failed:', error);
      return null;
    } else if (user) {
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });
      return user;
    } else {
      console.log('ℹ️ No user authenticated');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    return null;
  }
}

async function testUserProfileCreation() {
  try {
    const { supabase } = await import('./src/hooks/useAuth.js');
    
    console.log('👤 Testing user profile creation...');
    
    const currentUser = await testAuthenticationState();
    if (!currentUser) {
      console.log('⚠️ No authenticated user to test profile creation');
      return false;
    }
    
    // Check if user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', currentUser.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Profile check failed:', profileError);
      return false;
    }
    
    if (existingProfile) {
      console.log('✅ User profile exists:', existingProfile);
      return true;
    } else {
      console.log('ℹ️ No user profile found - this is expected for new users');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Profile creation test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Running all enhanced tests...');
  
  const results = {
    auth: await testAuthenticationState(),
    dbConnection: await testDatabaseConnection(),
    profileCreation: await testUserProfileCreation()
  };
  
  console.log('📊 Test Results:', results);
  
  if (results.dbConnection && results.profileCreation) {
    console.log('🎉 All tests passed! Your database is working correctly.');
    console.log('💡 Users should now be able to register and have their data stored in the users table.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
    console.log('🔧 You may need to run the SQL script to fix your users table.');
  }
  
  return results;
}

// Make functions available globally
window.testDatabaseConnection = testDatabaseConnection;
window.testAuthenticationState = testAuthenticationState;
window.testUserProfileCreation = testUserProfileCreation;
window.runAllTests = runAllTests;

console.log('📚 Enhanced test functions loaded!');
console.log('💡 Run runAllTests() to test everything');
console.log('🔍 Or run individual tests: testDatabaseConnection(), testAuthenticationState(), testUserProfileCreation()');
