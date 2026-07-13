import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Graceful logging without breaking tests
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-rose-500/30 rounded-2xl shadow-xl flex flex-col gap-4 text-center max-w-md mx-auto my-8" data-testid="error-boundary-fallback">
          <div className="flex items-center justify-center text-rose-500 text-5xl">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-slate-100">Component Execution Halted</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The system encountered an unexpected UI rendering error, but the remaining dashboard operations continue to run securely.
          </p>
          {this.state.error && (
            <div className="p-3 bg-slate-950 rounded-lg text-[10px] font-mono text-rose-400 overflow-x-auto text-left border border-slate-800">
              <p>Reference Code: ERR-500-UI</p>
              <p>Please contact the operations desk if the issue persists.</p>
            </div>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
          >
            Attempt Recovery
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
