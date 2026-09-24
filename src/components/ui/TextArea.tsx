import React, { forwardRef, useId } from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className={`cv-form-field ${error ? 'cv-field-error' : ''}`}>
        {label && (
          <label htmlFor={textareaId} className="cv-field-label">
            {label}
            {props.required && <span className="cv-required-mark" aria-hidden="true"> *</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`cv-textarea ${className}`}
          {...props}
        />

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

TextArea.displayName = 'TextArea';
