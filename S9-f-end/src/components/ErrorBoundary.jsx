import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Recover automatically from stale deploy asset errors on hosted builds.
    this.tryRecoverFromStaleAssets(error);

    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      console.error('Error caught by boundary:', error, errorInfo);
      // Here you would send to error reporting service like Sentry
    }
  }

  isStaleAssetError = (error) => {
    const message = String(error?.message || error || '');
    return /Unable to preload CSS|Failed to fetch dynamically imported module|Importing a module script failed/i.test(message);
  };

  tryRecoverFromStaleAssets = async (error) => {
    if (!this.isStaleAssetError(error)) return;
    if (sessionStorage.getItem('nexus_stale_asset_recovered') === '1') return;

    sessionStorage.setItem('nexus_stale_asset_recovered', '1');

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (cleanupError) {
      console.warn('Stale asset cleanup skipped:', cleanupError);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now().toString());
    window.location.replace(url.toString());
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <AlertTriangle size={64} className="error-icon" />
            <h2>Oops! Something went wrong</h2>
            <p className="error-message">
              We're sorry for the inconvenience. Our team has been notified and is working on a fix.
            </p>
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button" aria-label="Try to recover from the error">
                <RefreshCw size={20} />
                Try Again
              </button>
              <button onClick={() => window.location.reload()} className="reload-button" aria-label="Reload the page to fix the error">
                Reload Page
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 