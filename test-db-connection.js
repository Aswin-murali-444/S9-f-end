// Test Database Connection and Table Structure
// Run this in your browser console after importing the useAuth hook

import { supabase } from './src/hooks/useAuth.js';

// Test 1: Check if we can connect to Supabase
console.log('Testing Supabase connection...');

// Test 2: Check if the users table exists and what columns it has
async function checkUsersTable() {
  try {
    console.log('Checking users table structure...');
    
    // Try to get table info
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing users table:', error);
      return;
    }
    
    console.log('Users table accessible. Sample data:', data);
    
    // Try to get column information
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });
    
    if (columnError) {
      console.log('Could not get column info via RPC, trying direct query...');
      // Try a simple insert to see what columns exist
      const testData = {
        email: 'test@example.com',
        role: 'customer',
        full_name: 'Test User'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.error('Insert test failed:', insertError);
        console.log('This suggests the table structure is different than expected');
      } else {
        console.log('Insert test successful:', insertData);
      }
    } else {
      console.log('Table columns:', columns);
    }
    
  } catch (error) {
    console.error('Error checking users table:', error);
  }
}

// Test 3: Try to insert a test record
async function testInsert() {
  try {
    console.log('Testing insert operation...');
    
    const testUser = {
      email: 'test@example.com',
      role: 'customer',
      full_name: 'Test User',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (error) {
      console.error('Insert failed:', error);
    } else {
      console.log('Insert successful:', data);
    }
    
  } catch (error) {
    console.error('Error testing insert:', error);
  }
}

// Test 4: Check RLS policies
async function checkRLS() {
  try {
    console.log('Checking RLS policies...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('RLS check failed:', error);
    } else {
      console.log('RLS check passed, data accessible:', data);
    }
    
  } catch (error) {
    console.error('Error checking RLS:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== Starting Database Tests ===');
  
  await checkUsersTable();
  await testInsert();
  await checkRLS();
  
  console.log('=== Database Tests Complete ===');
}

// Export for use in console
window.runDatabaseTests = runAllTests;
window.checkUsersTable = checkUsersTable;
window.testInsert = testInsert;
window.checkRLS = checkRLS;

console.log('Database test functions loaded. Run runDatabaseTests() to test everything.');
