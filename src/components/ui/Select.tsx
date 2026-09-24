import React, { forwardRef, useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className={`cv-form-field ${error ? 'cv-field-error' : ''}`}>
        {label && (
          <label htmlFor={selectId} className="cv-field-label">
            {label}
            {props.required && <span className="cv-required-mark" aria-hidden="true"> *</span>}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`cv-select ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

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

Select.displayName = 'Select';
