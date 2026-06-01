'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
  onError?:  (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="error-boundary">
          <div className="error-boundary-icon">⚠</div>
          <p className="error-boundary-message">
            {this.state.error?.message ?? 'Something went wrong'}
          </p>
          <button className="btn-primary" onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
