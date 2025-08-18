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
    'service-provider': 'provider',
    'caretaker': 'caregiver',
  };
  return map[key] || 'customer';
};

const roleToDashboardPath = (dbRole) => {
  const map = {
    'customer': '/dashboard/customer',
    'provider': '/dashboard/provider',
    'driver': '/dashboard/driver',
    'caregiver': '/dashboard/caregiver',
    'admin': '/dashboard/admin'
  };
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
    const { error } = await supabase
      .from('users')
      .upsert({
        auth_user_id: authUserId,
        email: email,
        full_name: fullName || '',
        role: dbRole,
        avatar_url: avatarUrl || null,
        last_login: new Date().toISOString(),
      }, { onConflict: 'auth_user_id' });
    if (error) throw error;
    return dbRole;
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
          mappedRole = await upsertUserProfile({
            authUserId: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            uiRole: credentials.userType,
            avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
          });
        } catch (e) {
          console.warn('Profile upsert failed:', e?.message);
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
          console.warn('Profile upsert failed:', e?.message);
        }
        toast.success('Registration successful! Please check your email to verify your account.');
        return { success: true, user: data.user, role: mappedRole, dashboardPath: roleToDashboardPath(mappedRole) };
      }
    } catch (error) {
      toast.error('Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (uiRole) => {
    try {
      setLoading(true);
      if (uiRole) {
        localStorage.setItem('pending_ui_role', uiRole);
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
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
      const pendingRole = localStorage.getItem('pending_ui_role') || 'customer';
      const fullName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '';
      const avatarUrl = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null;
      let mappedRole = 'customer';
      try {
        mappedRole = await upsertUserProfile({
          authUserId: currentUser.id,
          email: currentUser.email,
          fullName,
          uiRole: pendingRole,
          avatarUrl,
        });
      } catch (e) {
        console.warn('OAuth profile upsert failed:', e?.message);
      }
      localStorage.removeItem('pending_ui_role');
      return { success: true, role: mappedRole, dashboardPath: roleToDashboardPath(mappedRole) };
    } catch (e) {
      return { success: false };
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
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}; 