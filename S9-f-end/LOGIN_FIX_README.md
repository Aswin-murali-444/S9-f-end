# Login Redirection Fix Guide

This guide explains how to fix the login redirection issues where users are not being directed to their respective dashboards after login.

## Issues Identified

1. **Role Mapping Mismatch**: The `uiRoleToDbRole` function was incorrectly mapping roles
2. **Dashboard Path Mismatch**: The `roleToDashboardPath` function had incorrect route mappings
3. **Database Schema Mismatch**: The frontend was trying to use a custom `users` table instead of Supabase's standard structure
4. **Missing Role Retrieval**: The system wasn't properly fetching user roles from the database after authentication

## Fixes Applied

### 1. Fixed Role Mapping Functions

Updated `f-end/frontend/src/hooks/useAuth.js`:

```javascript
const uiRoleToDbRole = (uiRole) => {
  const key = String(uiRole || '').toLowerCase();
  if (key.includes('driver') || key.includes('delivery')) return 'driver';
  const map = {
    'customer': 'customer',
    'service-provider': 'service_provider', // Fixed: was 'provider'
    'caretaker': 'caretaker', // Fixed: was 'caregiver'
  };
  return map[key] || 'customer';
};

const roleToDashboardPath = (dbRole) => {
  const map = {
    'customer': '/dashboard/customer',
    'service_provider': '/dashboard/provider', // Fixed: was 'provider'
    'driver': '/dashboard/driver',
    'caretaker': '/dashboard/caretaker', // Fixed: was 'caregiver'
    'admin': '/dashboard/admin'
  };
  return map[dbRole] || '/';
};
```

### 2. Updated Database Schema

Created `f-end/frontend/supabase-setup.sql` with the correct Supabase-compatible schema:

- Uses `profiles` table (Supabase standard) instead of custom `users` table
- References `auth.users(id)` for proper Supabase integration
- Includes Row Level Security (RLS) policies
- Maintains role-specific detail tables

### 3. Fixed Authentication Flow

Updated the login process to:

1. **Check for existing profile**: First try to get the user's role from their existing profile
2. **Create profile if needed**: Only create a new profile if one doesn't exist
3. **Proper error handling**: Fallback to default role if profile operations fail
4. **Role persistence**: Store and retrieve roles from the `profiles` table

### 4. Enhanced Dashboard Router

Updated `DashboardRouter` component to:

- Use `getUserRole()` function from `useAuth` hook
- Handle cases where users don't have roles assigned
- Properly fetch roles from the database
- Show appropriate error messages

## Setup Instructions

### 1. Database Setup

Run the SQL commands in `f-end/frontend/supabase-setup.sql` in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Execute the SQL commands

### 2. Verify Table Structure

After running the SQL, you should have these tables:

- `profiles` - Main user profiles with roles
- `customer_details` - Customer-specific information
- `service_provider_details` - Service provider details
- `caretaker_details` - Caretaker details
- `driver_details` - Driver details

### 3. Test the Fix

1. **Register a new user** with a specific role
2. **Login** with the registered user
3. **Verify redirection** to the correct dashboard
4. **Check role persistence** by logging out and back in

## How It Works Now

### Login Flow

1. User enters credentials and selects a role
2. Supabase authenticates the user
3. System checks if user already has a profile with a role
4. If no profile exists, creates one with the selected role
5. Returns the correct dashboard path based on the role
6. User is redirected to their role-specific dashboard

### Role Management

- Roles are stored in the `profiles` table
- Each user can only have one role
- Roles are persistent across sessions
- Role-specific data is stored in separate tables

### Security

- Row Level Security (RLS) is enabled
- Users can only access their own data
- Proper authentication checks are in place

## Troubleshooting

### Common Issues

1. **"Role Not Assigned" Error**
   - User profile wasn't created properly
   - Check if the `profiles` table exists
   - Verify RLS policies are in place

2. **Still Redirecting to Wrong Dashboard**
   - Check browser console for errors
   - Verify role mapping in `useAuth.js`
   - Check if profile was created with correct role

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if tables were created successfully
   - Ensure RLS policies are active

### Debug Steps

1. Check browser console for error messages
2. Verify user profile in Supabase dashboard
3. Check if role is correctly stored in `profiles` table
4. Test with a fresh user registration

## Testing Checklist

- [ ] Database schema created successfully
- [ ] User registration works with role selection
- [ ] Login redirects to correct dashboard
- [ ] Role persists across sessions
- [ ] Dashboard access is role-appropriate
- [ ] Error handling works for edge cases

## Files Modified

1. `f-end/frontend/src/hooks/useAuth.js` - Fixed role mapping and authentication flow
2. `f-end/frontend/src/components/DashboardRouter.jsx` - Enhanced role handling
3. `f-end/frontend/supabase-setup.sql` - New database schema
4. `f-end/frontend/LOGIN_FIX_README.md` - This documentation

## Next Steps

After implementing these fixes:

1. Test the complete authentication flow
2. Monitor for any remaining issues
3. Consider adding role-based access control to dashboard components
4. Implement role change functionality if needed
5. Add user management features for administrators
