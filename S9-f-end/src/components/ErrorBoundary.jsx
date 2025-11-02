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

    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      console.error('Error caught by boundary:', error, errorInfo);
      // Here you would send to error reporting service like Sentry
    }
  }

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