import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorNoticeProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({
  title = 'An error occurred',
  message,
  onRetry
}) => {
  return (
    <div className="cv-error-notice" role="alert">
      <AlertTriangle className="cv-error-notice-icon" size={24} aria-hidden="true" />
      <div className="cv-error-notice-content">
        <h4 className="cv-error-notice-title">{title}</h4>
        <p className="cv-error-notice-msg">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
