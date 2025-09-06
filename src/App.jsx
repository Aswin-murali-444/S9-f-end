import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import QueryProvider from './providers/QueryProvider';
import { AuthProvider } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';

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
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/dashboard/customer" element={<CustomerDashboard />} />
                    <Route path="/dashboard/provider" element={<ServiceProviderDashboard />} />
                    <Route path="/dashboard/driver" element={<DriverDashboard />} />
                    <Route path="/dashboard/supervisor" element={<SupervisorDashboard />} />
                    <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    
                    {/* Admin Pages */}
                    <Route path="/admin/add-category" element={<AddCategoryPage />} />
                    <Route path="/admin/add-service" element={<AddServicePage />} />
                    <Route path="/admin/add-user" element={<AddUserPage />} />
                    <Route path="/admin/assign-provider" element={<AssignProviderPage />} />
                    <Route path="/admin/create-bill" element={<CreateBillPage />} />
                    
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
