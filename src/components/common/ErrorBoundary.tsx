import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AppError, Logger } from '../../lib/error';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.error(new AppError('React Component Crash', 'REACT_CRASH', 'FATAL', { error, errorInfo }));
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <AlertOctagon size={48} className="error-icon" />
          <h2>Application Encountered an Error</h2>
          <p>{this.state.error?.message || 'An unexpected UI failure occurred.'}</p>
          <button
            className="retry-btn"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            <RefreshCw size={16} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
