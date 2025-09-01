// Authentication hook for managing user state
import React, { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbscbvrklkntlbtefkgw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2NidnJrbGtudGxidGVma2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODgzOTIsImV4cCI6MjA2ODY2NDM5Mn0.EJbPGMn7kXFgj5IahA2GIiEcA3dTDCbgj9cF09rcsuY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const uiRoleToDbRole = (uiRole) => {
  const key = String(uiRole || '').toLowerCase();
  if (key.includes('driver') || key.includes('delivery')) return 'driver';
  const map = {
    'customer': 'customer',
    'service-provider': 'service_provider',
    'supervisor': 'supervisor',
  };
  return map[key] || 'customer';
};

const roleToDashboardPath = (dbRole) => {
  const map = {
    'customer': '/dashboard/customer',
    'service_provider': '/dashboard/provider',
    'driver': '/dashboard/driver',
    'supervisor': '/dashboard/supervisor',
    'admin': '/dashboard/admin'
  };
  // Instead of fallback to /dashboard, redirect to home
  return map[dbRole] || '/';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize authentication state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setUser(session.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(session.user));
          localStorage.setItem('session', JSON.stringify(session));
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
          localStorage.removeItem('session');
        }
        setIsInitialized(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(session.user));
        localStorage.setItem('session', JSON.stringify(session));
        if (event === 'SIGNED_IN' && isInitialized) {
          toast.success('Successfully signed in!');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        if (event === 'SIGNED_OUT') {
          toast.success('Logged out successfully');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const upsertUserProfile = async ({ authUserId, email, fullName, uiRole, avatarUrl }) => {
    const dbRole = uiRoleToDbRole(uiRole);
    
    console.log('🔐 Attempting to upsert user profile:', {
      authUserId,
      email,
      fullName,
      uiRole,
      dbRole,
      avatarUrl
    });
    
    try {
      // First, check if the users table exists and is accessible
      const { data: tableCheck, error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('❌ Cannot access users table:', tableError);
        // Try to create a minimal user profile anyway
        console.log('🔄 Attempting minimal user creation despite table access issues...');
        return await createMinimalUserProfile(authUserId, email, fullName, dbRole, avatarUrl);
      }
      
      console.log('✅ Users table is accessible');
      
      // Extract first and last name from full name
      const nameParts = (fullName || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing user:', checkError);
        // Continue with user creation even if check fails
        console.log('🔄 Continuing with user creation despite check error...');
      }
      
      let result;
      
      if (existingUser) {
        // Update existing user
        console.log('📝 Updating existing user profile...');
        
        const { data, error: updateError } = await supabase
          .from('users')
          .update({
            email: email,
            full_name: fullName || '',
            role: dbRole,
            avatar_url: avatarUrl || null,
            last_login: new Date().toISOString(),
            supabase_auth: true,
            status: 'active',
            email_verified: true
          })
          .eq('auth_user_id', authUserId)
          .select();
        
        if (updateError) {
          console.error('❌ User profile update failed:', updateError);
          throw new Error(`Update error: ${updateError.message}`);
        }
        
        result = data[0];
        console.log('✅ Successfully updated user profile:', result);
        
        // Try to update related tables, but don't fail if they don't exist
        await updateRelatedTables(result.id, firstName, lastName, avatarUrl, dbRole);
        
      } else {
        // Insert new user
        console.log('🆕 Creating new user profile...');
        
        const { data, error: insertError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authUserId,
            email: email,
            full_name: fullName || '',
            role: dbRole,
            avatar_url: avatarUrl || null,
            last_login: new Date().toISOString(),
            supabase_auth: true,
            status: 'active',
            email_verified: true,
            password_hash: 'supabase_auth_user', // Placeholder for Supabase users
            phone_verified: false
          })
          .select();
        
        if (insertError) {
          console.error('❌ User profile insert failed:', insertError);
          throw new Error(`Insert error: ${insertError.message}`);
        }
        
        result = data[0];
        console.log('✅ Success successfully created user profile:', result);
        
        // Try to insert into related tables, but don't fail if they don't exist
        await insertRelatedTables(result.id, firstName, lastName, avatarUrl, dbRole);
      }
      
      // Verify the data was actually saved
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();
      
      if (verifyError || !verifyData) {
        console.error('❌ Verification failed after upsert:', verifyError);
        throw new Error('Data verification failed after upsert');
      }
      
      console.log('✅ Successfully upserted and verified user profile:', verifyData);
      console.log('🎯 User role assigned:', dbRole);
      console.log('👤 User details saved:', {
        id: verifyData.id,
        email: verifyData.email,
        full_name: verifyData.full_name,
        role: verifyData.role,
        avatar_url: verifyData.avatar_url,
        supabase_auth: verifyData.supabase_auth,
        status: verifyData.status
      });
      
      return dbRole;
      
    } catch (error) {
      console.error('💥 Critical error in upsertUserProfile:', error);
      
      // Try alternative approach - simple insert with minimal fields
      try {
        console.log('🔄 Attempting simple insert as fallback...');
        return await createMinimalUserProfile(authUserId, email, fullName, dbRole, avatarUrl);
      } catch (fallbackError) {
        console.error('💥 Fallback also failed:', fallbackError);
        throw error; // Re-throw original error if fallback also fails
      }
    }
  };

  // Helper function to create minimal user profile
  const createMinimalUserProfile = async (authUserId, email, fullName, dbRole, avatarUrl) => {
    console.log('🔧 Creating minimal user profile...');
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUserId,
          email: email,
          role: dbRole,
          full_name: fullName || '',
          supabase_auth: true,
          status: 'active',
          email_verified: true,
          password_hash: 'supabase_auth_user',
          avatar_url: avatarUrl || null
        })
        .select();
      
      if (insertError) {
        console.error('❌ Minimal user profile creation failed:', insertError);
        // Try upsert as final fallback
        const { data: upsertData, error: upsertError } = await supabase
          .from('users')
          .upsert({
            auth_user_id: authUserId,
            email: email,
            role: dbRole,
            full_name: fullName || '',
            supabase_auth: true,
            status: 'active',
            email_verified: true,
            password_hash: 'supabase_auth_user',
            avatar_url: avatarUrl || null
          }, {
            onConflict: 'auth_user_id'
          })
          .select();
        
        if (upsertError) {
          console.error('❌ Upsert fallback also failed:', upsertError);
          throw upsertError;
        }
        
        console.log('✅ Minimal user profile created via upsert fallback:', upsertData);
        return dbRole;
      }
      
      console.log('✅ Minimal user profile created successfully:', insertData);
      return dbRole;
      
    } catch (error) {
      console.error('💥 All minimal user profile creation attempts failed:', error);
      // Return the role anyway to not break the OAuth flow
      return dbRole;
    }
  };

  // Helper function to update related tables
  const updateRelatedTables = async (userId, firstName, lastName, avatarUrl, dbRole) => {
    // Try to update user_profiles table - don't fail if it doesn't exist
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          profile_picture_url: avatarUrl || null
        }, {
          onConflict: 'id'
        });
      
      if (profileError) {
        console.warn('⚠️ Could not update user_profiles table:', profileError.message);
      } else {
        console.log('✅ Successfully updated user_profiles table');
      }
    } catch (error) {
      console.warn('⚠️ user_profiles table might not exist:', error.message);
    }
  };

  // Helper function to insert into related tables
  const insertRelatedTables = async (userId, firstName, lastName, avatarUrl, dbRole) => {
    // Try to insert into user_profiles table - don't fail if it doesn't exist
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          profile_picture_url: avatarUrl || null
        });
      
      if (profileError) {
        console.warn('⚠️ Could not insert into user_profiles table:', profileError.message);
      } else {
        console.log('✅ Successfully inserted into user_profiles table');
      }
    } catch (error) {
      console.warn('⚠️ user_profiles table might not exist:', error.message);
    }
    
    // For customers, try to insert into customer_details table - don't fail if it doesn't exist
    if (dbRole === 'customer') {
      try {
        const { error: customerError } = await supabase
          .from('customer_details')
          .insert({
            id: userId,
            preferred_services: [],
            emergency_contact_name: '',
            emergency_contact_phone: '',
            special_requirements: ''
          });
        
        if (customerError) {
          console.warn('⚠️ Could not insert into customer_details table:', customerError.message);
        } else {
          console.log('✅ Successfully inserted into customer_details table');
        }
      } catch (error) {
        console.warn('⚠️ customer_details table might not exist:', error.message);
      }
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) {
        toast.error(error.message || 'Login failed');
        return { success: false, error: error.message };
      }
      if (data.user && data.session) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('session', JSON.stringify(data.session));

        let mappedRole = 'customer';
        try {
          // First, try to get existing user profile
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('auth_user_id', data.user.id)
            .single();

          if (userData && userData.role) {
            // User already has a profile with a role
            console.log('✅ Existing user profile found:', userData);
            mappedRole = userData.role;
          } else {
            // Create new profile with selected role
            console.log('🆕 Creating new user profile for existing auth user...');
            mappedRole = await upsertUserProfile({
              authUserId: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
              uiRole: credentials.userType,
              avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            });
          }
        } catch (e) {
          console.warn('⚠️ User profile handling failed:', e?.message);
          // Try to create profile anyway
          try {
            console.log('🔄 Attempting to create user profile after error...');
            mappedRole = await upsertUserProfile({
              authUserId: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
              uiRole: credentials.userType,
              avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            });
          } catch (retryError) {
            console.error('💥 Failed to create user profile on retry:', retryError);
            // Fallback to default role
            mappedRole = 'customer';
          }
        }

        toast.success('Login successful!');
        return { success: true, user: data.user, role: mappedRole, dashboardPath: roleToDashboardPath(mappedRole) };
      }
    } catch (error) {
      toast.error('Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name || userData.full_name || '',
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      });
      if (error) {
        toast.error(error.message || 'Registration failed');
        return { success: false, error: error.message };
      }
      if (data.user) {
        let mappedRole = 'customer';
        try {
          mappedRole = await upsertUserProfile({
            authUserId: data.user.id,
            email: userData.email,
            fullName: userData.name || userData.full_name || '',
            uiRole: userData.userType,
            avatarUrl: null,
          });
        } catch (e) {
          console.warn('Profile creation failed:', e?.message);
          // Fallback to default role
          mappedRole = 'customer';
        }
        
        // Don't automatically sign in the user after registration
        // They should go to login page and sign in manually
        toast.success('Registration successful! Please check your email to verify your account and then log in.');
        
        // Sign out the user to ensure they're not automatically signed in
        await supabase.auth.signOut();
        
        return { success: true, user: data.user, role: mappedRole };
      }
    } catch (error) {
      toast.error('Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // For Google auth, always set role to 'customer' (normal users)
      localStorage.setItem('pending_ui_role', 'customer');
      
      console.log('🚀 Initiating Google OAuth sign-in for customer role');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) {
        console.error('❌ Google OAuth error:', error);
        toast.error(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Google OAuth initiated successfully, redirecting...');
      return { success: true };
    } catch (error) {
      console.error('💥 Google OAuth failed:', error);
      toast.error('Failed to sign in with Google');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const finalizeOAuthRoleSync = async () => {
    // Called after OAuth redirect completes
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return { success: false };
      
      console.log('🔍 Google OAuth user data:', {
        id: currentUser.id,
        email: currentUser.email,
        metadata: currentUser.user_metadata
      });
      
      // For Google auth, always assign 'customer' role (normal users)
      const pendingRole = 'customer';
      
      // Extract all available user metadata from Google
      const fullName = currentUser.user_metadata?.full_name || 
                      currentUser.user_metadata?.name || 
                      currentUser.user_metadata?.display_name || '';
      const avatarUrl = currentUser.user_metadata?.avatar_url || 
                       currentUser.user_metadata?.picture || 
                       currentUser.user_metadata?.photoURL || null;
      
      let mappedRole = 'customer';
      let isNewUser = false;
      
      try {
        // First, try to get existing user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, id')
          .eq('auth_user_id', currentUser.id)
          .single();

        if (userData && userData.role) {
          // User already has a profile with a role
          console.log('✅ Existing OAuth user profile found:', userData);
          mappedRole = userData.role;
          isNewUser = false;
          
          // Update last login for existing users
          try {
            await supabase
              .from('users')
              .update({
                last_login: new Date().toISOString(),
                avatar_url: avatarUrl || null
              })
              .eq('auth_user_id', currentUser.id);
            console.log('✅ Updated last login for existing user');
          } catch (updateError) {
            console.warn('⚠️ Could not update last login:', updateError.message);
          }
        } else {
          // Create new profile with customer role for Google auth
          console.log('🆕 Creating new OAuth user profile with customer role...');
          
          // Try to create the user profile
          try {
            const { data: newUserData, error: createError } = await supabase
              .from('users')
              .insert({
                auth_user_id: currentUser.id,
                email: currentUser.email,
                full_name: fullName || '',
                role: 'customer',
                avatar_url: avatarUrl || null,
                last_login: new Date().toISOString(),
                supabase_auth: true,
                status: 'active',
                email_verified: true,
                password_hash: 'supabase_auth_user'
              })
              .select()
              .single();
            
            if (createError) {
              console.warn('⚠️ Direct insert failed:', createError.message);
              // Try upsert instead
              const { data: upsertData, error: upsertError } = await supabase
                .from('users')
                .upsert({
                  auth_user_id: currentUser.id,
                  email: currentUser.email,
                  full_name: fullName || '',
                  role: 'customer',
                  avatar_url: avatarUrl || null,
                  last_login: new Date().toISOString(),
                  supabase_auth: true,
                  status: 'active',
                  email_verified: true,
                  password_hash: 'supabase_auth_user'
                }, {
                  onConflict: 'auth_user_id'
                })
                .select()
                .single();
              
              if (upsertError) {
                console.warn('⚠️ Upsert also failed:', upsertError.message);
                throw upsertError;
              }
              
              console.log('✅ User profile created via upsert:', upsertData);
            } else {
              console.log('✅ User profile created via insert:', newUserData);
            }
            
            mappedRole = 'customer';
            isNewUser = true;
            
          } catch (profileError) {
            console.warn('⚠️ Profile creation failed, but continuing with customer role:', profileError.message);
            // Continue with default customer role even if profile creation fails
            mappedRole = 'customer';
            isNewUser = true;
          }
        }
      } catch (e) {
        console.warn('⚠️ Database operation failed, but continuing with customer role:', e?.message);
        // Continue with customer role even if database operations fail
        mappedRole = 'customer';
        isNewUser = true;
      }
      
      localStorage.removeItem('pending_ui_role');
      
      // For Google auth users, always redirect to customer dashboard
      if (isNewUser) {
        console.log('🎉 New Google OAuth user created successfully with role:', mappedRole);
        return { success: true, role: mappedRole, isNewUser: true, redirectTo: '/dashboard/customer' };
      } else {
        console.log('🔄 Existing Google OAuth user logged in with role:', mappedRole);
        return { success: true, role: mappedRole, dashboardPath: '/dashboard/customer' };
      }
    } catch (e) {
      console.error('💥 Error in finalizeOAuthRoleSync:', e);
      // Even if there's an error, try to redirect to customer dashboard
      // This ensures the user doesn't get stuck
      return { 
        success: true, 
        role: 'customer', 
        dashboardPath: '/dashboard/customer',
        error: e.message 
      };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) {
        toast.error(error.message || 'Failed to send reset email');
        return { success: false, error: error.message };
      }
      toast.success('Password reset email sent. Please check your inbox.');
      return { success: true };
    } catch (error) {
      toast.error('Failed to send reset email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message || 'Failed to update password' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update password' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Ensure user lands on login after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  };

  const getUserRole = async () => {
    if (!user?.id) return null;
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, status, email_verified')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error) {
        console.warn('⚠️ Failed to get user role:', error);
        return null;
      }
      
      console.log('✅ Retrieved user data from database:', userData);
      
      if (userData?.role) {
        console.log('🎯 User role found:', userData.role);
        return userData.role;
      } else {
        console.warn('⚠️ No role found for user');
        return null;
      }
      
    } catch (error) {
      console.warn('⚠️ Error getting user role:', error);
      return null;
    }
  };

  const getCompleteUserProfile = async () => {
    if (!user?.id) return null;
    
    try {
      // Get user data with related profile information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            first_name,
            last_name,
            phone,
            date_of_birth,
            gender,
            profile_picture_url,
            bio,
            address,
            city,
            state,
            country,
            postal_code
          ),
          customer_details (
            preferred_services,
            emergency_contact_name,
            emergency_contact_phone,
            special_requirements
          )
        `)
        .eq('auth_user_id', user.id)
        .single();
      
      if (userError) {
        console.warn('⚠️ Failed to get complete user profile:', userError);
        return null;
      }
      
      console.log('✅ Retrieved complete user profile:', userData);
      return userData;
      
    } catch (error) {
      console.warn('⚠️ Error getting complete user profile:', error);
      return null;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    isInitialized,
    login,
    register,
    signInWithGoogle,
    finalizeOAuthRoleSync,
    requestPasswordReset,
    updatePassword,
    logout,
    refreshSession,
    uiRoleToDbRole,
    getUserRole,
    getCompleteUserProfile,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}; 