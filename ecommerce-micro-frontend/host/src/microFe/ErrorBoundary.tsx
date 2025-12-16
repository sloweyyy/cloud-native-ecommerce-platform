/**
 * Error Boundary for Micro Frontend Loading
 * 
 * Catches errors during micro frontend loading and rendering,
 * provides fallback UI with error details and recovery options.
 * 
 * Pattern adapted from console-ui error boundary implementation.
 */

import React, { ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error info in state
    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    // Reset error state and try again
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onReset?: () => void;
}

/**
 * Default Error Fallback UI
 * 
 * Displays error message and provides options to recover
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  onReset,
}) => {
  return (
    <div
      style={{
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Result
        status="500"
        title="Failed to Load Micro Frontend"
        subTitle={
          <div>
            <Typography.Paragraph>
              Something went wrong while loading the application.
            </Typography.Paragraph>
            {error && (
              <Typography.Paragraph
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  textAlign: 'left',
                  overflowX: 'auto',
                }}
              >
                <strong>Error:</strong> {error.message}
              </Typography.Paragraph>
            )}
            {errorInfo && process.env.NODE_ENV === 'development' && (
              <Typography.Paragraph
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  textAlign: 'left',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <strong>Stack Trace:</strong>
                <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {errorInfo.componentStack}
                </pre>
              </Typography.Paragraph>
            )}
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="home"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Back to Home
          </Button>,
          onReset && (
            <Button key="retry" onClick={onReset}>
              Try Again
            </Button>
          ),
        ]}
      />
    </div>
  );
};

/**
 * Hook-based error boundary wrapper
 * For functional components that need error boundary protection
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

