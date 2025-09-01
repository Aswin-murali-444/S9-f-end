# Authentication Data Storage Fix Guide

This guide will help you fix the issue where authentication data is not being stored in the `users` table.

## 🚨 Problem Description

Currently, when users register or authenticate, their data is not being properly stored in your `users` table. This means:
- User profiles are not being created
- Role information is not being saved
- User data is not persisting in the database

## 🔧 What I've Fixed

### 1. Enhanced Error Handling in `useAuth.js`
- Added comprehensive logging to track what's happening during user profile creation
- Added fallback mechanisms when profile creation fails
- Enhanced error messages to identify specific database issues

### 2. Improved User Profile Creation
- Enhanced the `upsertUserProfile` function with better error handling
- Added verification that data was actually saved
- Added fallback to simple insert if upsert fails

### 3. Better OAuth Flow Handling
- Improved Google sign-in to ensure user profiles are created
- Added retry mechanisms for profile creation

## 📋 Steps to Fix Your Database

### Step 1: Run the Complete SQL Script

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `fix-users-table-complete.sql`
4. Click **Run** to execute the script

This script will:
- ✅ Check your current table structure
- ✅ Add missing columns if needed
- ✅ Set up proper constraints and indexes
- ✅ Enable Row Level Security (RLS)
- ✅ Create proper RLS policies
- ✅ Test the table structure

### Step 2: Test the Database Connection

1. Open your frontend application
2. Open **Browser Console** (F12)
3. Copy and paste the contents of `test-db-connection-enhanced.js`
4. Run `runAllTests()` to test everything

### Step 3: Verify the Fix

After running the SQL script and tests:

1. **Try registering a new user** - they should now be stored in the `users` table
2. **Check the browser console** - you should see detailed logs about profile creation
3. **Check your Supabase dashboard** - new users should appear in the `users` table

## 🔍 What to Look For

### In Browser Console (During Registration/Login):
```
🔐 Attempting to upsert user profile: { authUserId: "...", email: "...", ... }
✅ Users table is accessible
📝 Upsert result: { data: [...], error: null }
✅ Successfully upserted and verified user profile: {...}
🎯 User role assigned: customer
```

### In Supabase Dashboard:
- Go to **Table Editor** → **users**
- You should see new user records with:
  - `auth_user_id` (UUID from Supabase auth)
  - `email` (user's email)
  - `role` (user's selected role)
  - `full_name` (user's name)
  - `created_at` and `updated_at` timestamps

## 🚨 Common Issues and Solutions

### Issue 1: "Permission denied" Error
**Solution**: The RLS policies might not be set up correctly. Run the SQL script again.

### Issue 2: "Column does not exist" Error
**Solution**: Your table is missing required columns. The SQL script will add them.

### Issue 3: "Table does not exist" Error
**Solution**: The `users` table doesn't exist. The SQL script will create it.

### Issue 4: "Unique constraint violation" Error
**Solution**: This means the user already exists. This is normal and expected.

## 🧪 Testing the Fix

### Test 1: New User Registration
1. Register a new user with any role
2. Check browser console for success messages
3. Verify user appears in Supabase `users` table

### Test 2: Existing User Login
1. Login with an existing user
2. Check browser console for profile retrieval messages
3. Verify user data is loaded correctly

### Test 3: Google OAuth
1. Try Google sign-in
2. Check browser console for OAuth profile creation
3. Verify user profile is created in database

## 📊 Expected Results

After the fix, you should see:

1. **New users** being automatically added to the `users` table
2. **User roles** being properly saved and retrieved
3. **Detailed logging** in the browser console showing the process
4. **No more "authentication data not stored" errors**

## 🔧 If Problems Persist

If you're still having issues after following this guide:

1. **Check the browser console** for specific error messages
2. **Run the test script** to identify the exact problem
3. **Check Supabase logs** for any backend errors
4. **Verify RLS policies** are correctly applied

## 📞 Need Help?

If you continue to have issues:
1. Share the specific error messages from the browser console
2. Share the results of running the test script
3. Check if the SQL script ran successfully in Supabase

---

**Remember**: The key is ensuring your `users` table has the correct structure and RLS policies, and that the frontend can properly access and modify it.
