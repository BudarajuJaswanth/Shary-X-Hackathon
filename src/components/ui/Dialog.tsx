import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer
}) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cv-dialog-backdrop" onClick={onClose}>
      <div
        className="cv-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cv-dialog-header">
          <div>
            <h2 id={titleId} className="cv-dialog-title">
              {title}
            </h2>
            {subtitle && <p className="cv-dialog-subtitle">{subtitle}</p>}
          </div>
          <button
            className="cv-dialog-close-btn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="cv-dialog-body">{children}</div>

        {footer && <div className="cv-dialog-footer">{footer}</div>}
      </div>
    </div>
  );
};
