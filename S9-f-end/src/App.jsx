import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import QueryProvider from './providers/QueryProvider';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { SearchProvider } from './contexts/SearchContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import DashboardRouter from './components/DashboardRouter';

import './App.css';
import './components/ErrorBoundary.css';

const STALE_CHUNK_PATTERN = /Failed to fetch dynamically imported module|Importing a module script failed|Unable to preload CSS|ChunkLoadError/i;
const LAZY_RETRY_KEY = 'nexus_lazy_chunk_retry_count';
const MAX_LAZY_RETRIES = 2;

const lazyWithRetry = (importer) =>
  lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      const message = String(error?.message || error || '');
      if (!STALE_CHUNK_PATTERN.test(message)) {
        throw error;
      }

      const retryCount = Number(sessionStorage.getItem(LAZY_RETRY_KEY) || '0');
      if (retryCount < MAX_LAZY_RETRIES) {
        sessionStorage.setItem(LAZY_RETRY_KEY, String(retryCount + 1));
        const url = new URL(window.location.href);
        url.searchParams.set('v', Date.now().toString());
        window.location.replace(url.toString());
      }

      throw error;
    }
  });

// Modern Code Splitting with React.lazy
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const ServicesPage = lazyWithRetry(() => import('./pages/ServicesPage'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const AuthCallback = lazyWithRetry(() => import('./pages/AuthCallback'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'));
const CustomerDashboard = lazyWithRetry(() => import('./pages/dashboards/CustomerDashboard'));
const ServiceProviderDashboard = lazyWithRetry(() => import('./pages/dashboards/ServiceProviderDashboard'));
const DriverDashboard = lazyWithRetry(() => import('./pages/dashboards/DriverDashboard'));
const SupervisorDashboard = lazyWithRetry(() => import('./pages/dashboards/SupervisorDashboard'));
const AdminDashboard = lazyWithRetry(() => import('./pages/dashboards/AdminDashboard'));

// Admin Pages
const AddCategoryPage = lazyWithRetry(() => import('./pages/admin/AddCategoryPage'));
const AddServicePage = lazyWithRetry(() => import('./pages/admin/AddServicePage'));
const AddServiceProviderPage = lazyWithRetry(() => import('./pages/admin/AddServiceProviderPage'));
const CreateBillPage = lazyWithRetry(() => import('./pages/admin/CreateBillPage'));
const AdminUserProfilePage = lazyWithRetry(() => import('./pages/admin/AdminUserProfile'));
const CategoriesPage = lazyWithRetry(() => import('./pages/admin/CategoriesPage'));
const EditCategoryPage = lazyWithRetry(() => import('./pages/admin/EditCategoryPage'));
const AdminServicesPage = lazyWithRetry(() => import('./pages/admin/ServicesPage'));
const EditServicePage = lazyWithRetry(() => import('./pages/admin/EditServicePage'));
const ManageProvidersPage = lazyWithRetry(() => import('./pages/admin/ManageProvidersPage'));

// Test Pages

// Booking Page
const BookingPage = lazyWithRetry(() => import('./pages/BookingPage'));

const Placeholder = ({ title }) => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
    <h2>{title}</h2>
    <p>Dashboard coming soon.</p>
  </div>
);

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAnyDashboard = location.pathname.startsWith('/dashboard');
  const isCustomerDashboard = location.pathname.startsWith('/dashboard/customer');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isBookingPage = location.pathname === '/booking';
  const isHome = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const showPublicHeader = !(isAnyDashboard || isAdminPage || isBookingPage);

  // Auth can be briefly null during initialization; use persisted auth to keep history lock reliable.
  const hasPersistedAuth = (() => {
    try {
      if (user) return true;
      const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
      const storedSession = !!localStorage.getItem('session');
      const storedUser = !!localStorage.getItem('user');
      return storedAuth || storedSession || storedUser;
    } catch {
      return !!user;
    }
  })();

  // If the requirement is "back should stay on the dashboard after login",
  // prevent browser back navigation from leaving /dashboard/* while authenticated.
  const lastDashboardUrlRef = useRef('');
  useEffect(() => {
    if (isAnyDashboard && hasPersistedAuth) {
      lastDashboardUrlRef.current = `${location.pathname}${location.search}${location.hash}`;
    }
  }, [isAnyDashboard, hasPersistedAuth, location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!hasPersistedAuth) return;
    const onPopState = () => {
      const currentPath = window.location.pathname || '';
      const isStillDashboard = currentPath.startsWith('/dashboard');
      const fromStorage = localStorage.getItem('dashboard_path') || '';
      const role = localStorage.getItem('user_role') || '';
      const roleFallback =
        role === 'admin' ? '/dashboard/admin'
          : role === 'service_provider' ? '/dashboard/provider'
          : role === 'supervisor' ? '/dashboard/supervisor'
          : role === 'driver' ? '/dashboard/driver'
          : '/dashboard/customer';
      const targetCandidate =
        (lastDashboardUrlRef.current && lastDashboardUrlRef.current.startsWith('/dashboard'))
          ? lastDashboardUrlRef.current
          : (fromStorage && fromStorage.startsWith('/dashboard'))
            ? fromStorage
            : roleFallback;
      const target = targetCandidate;

      if (!isStillDashboard) {
        try {
          window.history.pushState({ __dashboardLock: true }, '', target);
        } catch {}
        navigate(target, { replace: true });
        return;
      }

      // Even within dashboard, keep user on the last known dashboard URL (no back navigation).
      try {
        window.history.pushState({ __dashboardLock: true }, '', target);
      } catch {}
      navigate(target, { replace: true });
    };

    // Ensure there's always a forward entry to cancel "back" while authenticated.
    // Do this both on initial mount and whenever route changes.
    if (isAnyDashboard) {
      try {
        window.history.pushState({ __dashboardLock: true }, '', lastDashboardUrlRef.current || window.location.href);
      } catch {}
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [hasPersistedAuth, isAnyDashboard, navigate]);

  return (
    <div className="App">
      {showPublicHeader && <Header />}
      <main className={showPublicHeader ? 'main-content main-content--with-header' : ''}>
                <Suspense fallback={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '50vh' 
                  }}>
                    <LoadingSpinner size="large" />
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={
                      <PublicOnlyRoute>
                        <HomePage />
                      </PublicOnlyRoute>
                    } />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    } />
                    <Route path="/register" element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    } />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/booking" element={
                      <ProtectedRoute allowedRoles={["customer"]}>
                        <BookingPage />
                      </ProtectedRoute>
                    } />
                    <Route
                      path="/dashboard/customer"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/provider"
                      element={
                        <ProtectedRoute allowedRoles={["service_provider"]}>
                          <ErrorBoundary>
                            <ServiceProviderDashboard />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/driver"
                      element={
                        <ProtectedRoute allowedRoles={["driver"]}>
                          <DriverDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/supervisor"
                      element={
                        <ProtectedRoute allowedRoles={["supervisor"]}>
                          <SupervisorDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/admin"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Admin Pages */}
                    <Route
                      path="/admin/categories"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <CategoriesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/categories/:id"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <EditCategoryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/add-category"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AddCategoryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/add-service"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AddServicePage />
                        </ProtectedRoute>
                      }
                    />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditServicePage />
            </ProtectedRoute>
          }
        />
                    <Route
                      path="/admin/add-service-provider"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AddServiceProviderPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/providers"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <ManageProvidersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/create-bill"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <CreateBillPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Test Routes removed */}
                    <Route
                      path="/admin/users/:userId"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminUserProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Catch-all route for /dashboard - redirect to appropriate dashboard */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardRouter user={user} />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </Suspense>
      </main>
      {isHome && <Footer />}

      {/* Modern Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#2c3e50',
            border: '1px solid #f1f5f9',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  useEffect(() => {
    sessionStorage.setItem(LAZY_RETRY_KEY, '0');
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <SearchProvider>
            <Router>
              <AppShell />
            </Router>
          </SearchProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
