// Test Email Validation - Run this in browser console to test
// Make sure your backend is running on http://localhost:3001

console.log('🧪 Testing Email Validation System...');

// Test 1: Check if API service is available
if (typeof apiService !== 'undefined') {
  console.log('✅ API Service is available');
} else {
  console.log('❌ API Service not found - make sure you\'re on the register page');
}

// Test 2: Test email validation function
async function testEmailValidation() {
  console.log('\n🔍 Testing email validation...');
  
  try {
    // Test with existing email (should return exists: true)
    console.log('📧 Testing with existing email...');
    const existingResult = await apiService.checkEmailExists('customer@example.com');
    console.log('Existing email result:', existingResult);
    
    // Test with new email (should return exists: false)
    console.log('\n📧 Testing with new email...');
    const newResult = await apiService.checkEmailExists('newuser@example.com');
    console.log('New email result:', newResult);
    
    // Test with invalid email format
    console.log('\n📧 Testing with invalid email...');
    const invalidResult = await apiService.checkEmailExists('invalid-email');
    console.log('Invalid email result:', invalidResult);
    
    console.log('\n✅ Email validation tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test 3: Test backend endpoint directly
async function testBackendEndpoint() {
  console.log('\n🔍 Testing backend endpoint directly...');
  
  try {
    const response = await fetch('http://localhost:3001/check-email/customer@example.com');
    const data = await response.json();
    console.log('Backend response:', data);
    
    console.log('✅ Backend endpoint test completed!');
  } catch (error) {
    console.error('❌ Backend test failed:', error);
  }
}

// Test 4: Check database connection
async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    const response = await fetch('http://localhost:3001/test-db');
    const data = await response.json();
    console.log('Database test response:', data);
    
    console.log('✅ Database connection test completed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive email validation tests...\n');
  
  await testEmailValidation();
  await testBackendEndpoint();
  await testDatabaseConnection();
  
  console.log('\n🎉 All tests completed! Check the results above.');
}

// Export functions for manual testing
window.testEmailValidation = testEmailValidation;
window.testBackendEndpoint = testBackendEndpoint;
window.testDatabaseConnection = testDatabaseConnection;
window.runAllTests = runAllTests;

console.log('💡 Use runAllTests() to run all tests');
console.log('💡 Or run individual tests: testEmailValidation(), testBackendEndpoint(), testDatabaseConnection()');
