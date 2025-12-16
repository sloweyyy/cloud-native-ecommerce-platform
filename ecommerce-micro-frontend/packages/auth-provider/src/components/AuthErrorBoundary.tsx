import { Component, ErrorInfo, ReactNode } from 'react';
import type { DebugOptions } from '../types';

interface Props {
  children: ReactNode;
  debug?: DebugOptions;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for authentication errors
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.debug?.logging) {
      console.error('[AuthProvider] Error caught by boundary:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Authentication Error</h2>
          <p>Something went wrong with authentication.</p>
          {this.props.debug?.logging && this.state.error && (
            <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '10px' }}>
              {this.state.error.message}
            </pre>
          )}
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

