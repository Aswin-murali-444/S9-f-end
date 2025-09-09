import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import QueryProvider from './providers/QueryProvider';
import { AuthProvider } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

import './App.css';
import './components/ErrorBoundary.css';

// Modern Code Splitting with React.lazy
const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CustomerDashboard = lazy(() => import('./pages/dashboards/CustomerDashboard'));
const ServiceProviderDashboard = lazy(() => import('./pages/dashboards/ServiceProviderDashboard'));
const DriverDashboard = lazy(() => import('./pages/dashboards/DriverDashboard'));
const SupervisorDashboard = lazy(() => import('./pages/dashboards/SupervisorDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));

// Admin Pages
const AddCategoryPage = lazy(() => import('./pages/admin/AddCategoryPage'));
const AddServicePage = lazy(() => import('./pages/admin/AddServicePage'));
const AddUserPage = lazy(() => import('./pages/admin/AddUserPage'));
const AssignProviderPage = lazy(() => import('./pages/admin/AssignProviderPage'));
const CreateBillPage = lazy(() => import('./pages/admin/CreateBillPage'));
const AdminUserProfilePage = lazy(() => import('./pages/admin/AdminUserProfile'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const EditCategoryPage = lazy(() => import('./pages/admin/EditCategoryPage'));

const Placeholder = ({ title }) => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
    <h2>{title}</h2>
    <p>Dashboard coming soon.</p>
  </div>
);

function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isDashboard && !isAdminPage && <Header />}
      <main className="main-content">
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
                    <Route
                      path="/"
                      element={
                        <PublicOnlyRoute>
                          <HomePage />
                        </PublicOnlyRoute>
                      }
                    />
                    <Route path="/services" element={<PublicOnlyRoute><ServicesPage /></PublicOnlyRoute>} />
                    <Route path="/about" element={<PublicOnlyRoute><AboutPage /></PublicOnlyRoute>} />
                    <Route path="/contact" element={<PublicOnlyRoute><ContactPage /></PublicOnlyRoute>} />
                    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
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
                          <ServiceProviderDashboard />
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
                      path="/admin/add-user"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AddUserPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/assign-provider"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AssignProviderPage />
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
                    <Route
                      path="/admin/users/:userId"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminUserProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Catch-all route for /dashboard - redirect to home */}
                    <Route path="/dashboard" element={<HomePage />} />
                  </Routes>
                </Suspense>
      </main>
      {!isDashboard && !isAdminPage && <Footer />}

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
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <Router>
            <AppShell />
          </Router>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
