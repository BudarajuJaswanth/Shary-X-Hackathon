import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`cv-form-field ${error ? 'cv-field-error' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="cv-field-label">
            {label}
            {props.required && <span className="cv-required-mark" aria-hidden="true"> *</span>}
          </label>
        )}

        <div className="cv-input-wrapper">
          {leftIcon && <span className="cv-input-icon-left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`cv-input ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''} ${className}`}
            {...props}
          />
          {rightIcon && <span className="cv-input-icon-right">{rightIcon}</span>}
        </div>

        {error && (
          <p id={errorId} className="cv-field-error-msg" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="cv-field-helper-msg">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
