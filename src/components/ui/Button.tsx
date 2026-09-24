import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        aria-disabled={isButtonDisabled}
        className={`cv-button cv-button-${variant} cv-button-${size} ${isLoading ? 'cv-button-loading' : ''} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="cv-button-spinner" size={16} aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="cv-button-icon-left" aria-hidden="true">{leftIcon}</span>}
        <span className="cv-button-text">{children}</span>
        {!isLoading && rightIcon && <span className="cv-button-icon-right" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
