'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import GlassCard from './ui/GlassCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
          <GlassCard className="max-w-2xl w-full p-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-space-grotesk font-bold mb-4">
                Something Went Wrong
              </h1>

              {/* Error Message */}
              <p className="text-gray-400 mb-6">
                We encountered an unexpected error. Don't worry, your wallet and funds are safe.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-400 mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-gray-400 mt-2">
                      <summary className="cursor-pointer hover:text-white">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 overflow-auto max-h-40 p-2 bg-black/20 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Reload Page</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>Go Home</span>
                </button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-gray-500 mt-8">
                If this problem persists, please try:
              </p>
              <ul className="text-sm text-gray-400 mt-2 space-y-1">
                <li>• Clearing your browser cache</li>
                <li>• Disconnecting and reconnecting your wallet</li>
                <li>• Using a different browser</li>
                <li>• Checking your internet connection</li>
              </ul>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;