'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full max-w-xl mx-auto my-8 p-6 rounded-2xl glass-panel border border-red-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white">Kuch gadbad ho gayi (Something went wrong)</h3>
          <p className="text-sm text-gray-400">
            UI render karne mein problem aayi. Please page refresh karein ya dubara try karein.
          </p>

          <button
            type="button"
            onClick={this.handleReset}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FF7A1A] hover:bg-[#ff8933] text-black font-semibold text-sm inline-flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-orange-glow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Page Refresh Karein</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
