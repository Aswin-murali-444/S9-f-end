# Database Fix Guide - Users Not Inserting into Supabase

## Problem Summary

Users are not being inserted into your Supabase database because:
1. The code was trying to use a `profiles` table that doesn't exist
2. Your existing `users` table structure doesn't match what the code expects
3. Missing required columns like `auth_user_id`

## Solution Steps

### Step 1: Fix Your Users Table Structure

Run this SQL in your Supabase SQL Editor to add missing columns:

```sql
-- Check current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add auth_user_id column (links to Supabase auth.users)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE users ADD COLUMN auth_user_id UUID;
        RAISE NOTICE 'Added auth_user_id column';
    END IF;
    
    -- Add role column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer';
        RAISE NOTICE 'Added role column';
    END IF;
    
    -- Add full_name column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Added full_name column';
    END IF;
    
    -- Add avatar_url column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column';
    END IF;
    
    -- Add last_login column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_login column';
    END IF;
END $$;

-- Add unique constraint on auth_user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' 
        AND constraint_name LIKE '%auth_user_id%'
        AND constraint_type = 'UNIQUE'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id);
        RAISE NOTICE 'Added unique constraint on auth_user_id';
    END IF;
END $$;

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

### Step 2: Verify Your Table Structure

After running the SQL above, your `users` table should have these columns:

- `id` (primary key)
- `email`
- `auth_user_id` (UUID, unique, references Supabase auth.users)
- `role` (VARCHAR, default 'customer')
- `full_name` (VARCHAR)
- `avatar_url` (TEXT)
- `last_login` (TIMESTAMP)
- Any other existing columns you had

### Step 3: Test the Database Connection

1. Open your browser console on your frontend
2. Run this test to verify the database works:

```javascript
// Test database connection
async function testDB() {
  const { supabase } = await import('./src/hooks/useAuth.js');
  
  try {
    // Test 1: Check if table is accessible
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Table access error:', error);
      return;
    }
    
    console.log('✅ Table accessible:', data);
    
    // Test 2: Try to insert a test record
    const testUser = {
      email: 'test@example.com',
      role: 'customer',
      full_name: 'Test User',
      auth_user_id: '00000000-0000-0000-0000-000000000000' // dummy UUID
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDB();
```

### Step 4: Check Row Level Security (RLS)

If you have RLS enabled, you might need to create policies:

```sql
-- Enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own data
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = auth_user_id::text);

-- Create policy to allow users to view their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = auth_user_id::text);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = auth_user_id::text);
```

### Step 5: Test User Registration/Login

1. Try to register a new user with a role
2. Check the browser console for any error messages
3. Check your Supabase dashboard to see if data was inserted
4. Try logging in with the new user

## Common Issues and Solutions

### Issue 1: "Table doesn't exist" error
**Solution**: Run the SQL from Step 1 to create missing columns

### Issue 2: "Column doesn't exist" error
**Solution**: Check which columns are missing and add them using the SQL above

### Issue 3: "Permission denied" error
**Solution**: Check RLS policies and create appropriate ones

### Issue 4: "Unique constraint violation" error
**Solution**: The `auth_user_id` column should be unique. Check for duplicate entries.

### Issue 5: "Data type mismatch" error
**Solution**: Ensure column types match what the code is trying to insert

## Debugging Steps

### 1. Check Browser Console
Look for error messages when trying to register/login

### 2. Check Supabase Dashboard
- Go to Table Editor
- Check if the `users` table exists
- Check what columns it has
- Check if any data is being inserted

### 3. Check Network Tab
- Open browser DevTools → Network tab
- Try to register/login
- Look for failed API calls
- Check the response for error details

### 4. Test Database Directly
Use the test script from Step 3 to verify database connectivity

## Expected Behavior After Fix

1. **User Registration**: Should create a record in the `users` table
2. **User Login**: Should find the existing user and redirect to correct dashboard
3. **Role Assignment**: Should persist the selected role in the database
4. **Dashboard Access**: Should redirect users to their role-specific dashboard

## Verification Checklist

- [ ] Users table has all required columns
- [ ] `auth_user_id` column exists and is unique
- [ ] `role` column exists with correct data type
- [ ] RLS policies are properly configured (if using RLS)
- [ ] Database connection test passes
- [ ] User registration creates database records
- [ ] User login finds existing records
- [ ] Dashboard redirection works correctly

## If Still Not Working

1. **Check Supabase Logs**: Go to your Supabase dashboard → Logs
2. **Verify API Keys**: Ensure your frontend is using the correct Supabase URL and anon key
3. **Check CORS**: Ensure your Supabase project allows requests from your frontend domain
4. **Test with Simple Query**: Try a basic SELECT query to verify connectivity

## Support

If you're still having issues after following this guide:
1. Check the browser console for specific error messages
2. Check your Supabase dashboard for any error logs
3. Verify your table structure matches the expected schema
4. Test with a simple database operation to isolate the issue
