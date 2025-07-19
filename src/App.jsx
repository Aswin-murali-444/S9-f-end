import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import QueryProvider from './providers/QueryProvider';
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

function App() {

  return (
    <ErrorBoundary>
      <QueryProvider>
        <Router>
          <div className="App">
            <Header />
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
                </Routes>
              </Suspense>
            </main>
            <Footer />
            
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
        </Router>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
