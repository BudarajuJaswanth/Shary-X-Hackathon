import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => {
  const pixelSize = size === 'sm' ? 16 : size === 'lg' ? 36 : 24;

  return (
    <div className="cv-spinner-wrapper" role="status">
      <Loader2 className="cv-spinner" size={pixelSize} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Processing request...' }) => {
  return (
    <div className="cv-loading-overlay" role="dialog" aria-modal="true" aria-label={message}>
      <div className="cv-loading-box">
        <Spinner size="lg" />
        <p className="cv-loading-text">{message}</p>
      </div>
    </div>
  );
};
