/**
 * Error Handling Architecture
 * Standardized application error hierarchy and result wrappers.
 */

export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'FATAL';

export class AppError extends Error {
  public code: string;
  public severity: ErrorSeverity;
  public originalError?: any;

  constructor(message: string, code = 'APP_ERROR', severity: ErrorSeverity = 'ERROR', originalError?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.originalError = originalError;
  }
}

export class VoiceProviderError extends AppError {
  constructor(message: string, originalError?: any) {
    super(message, 'VOICE_PROVIDER_ERROR', 'ERROR', originalError);
    this.name = 'VoiceProviderError';
  }
}

export class CityServiceError extends AppError {
  constructor(message: string, originalError?: any) {
    super(message, 'CITY_SERVICE_ERROR', 'ERROR', originalError);
    this.name = 'CityServiceError';
  }
}

export class ToolExecutionError extends AppError {
  constructor(toolName: string, message: string, originalError?: any) {
    super(`Tool [${toolName}] failed: ${message}`, 'TOOL_EXECUTION_ERROR', 'ERROR', originalError);
    this.name = 'ToolExecutionError';
  }
}

export class ValidationFailedError extends AppError {
  public missingParameters?: string[];

  constructor(toolName: string, message: string, missingParameters?: string[]) {
    super(`Validation failed for [${toolName}]: ${message}`, 'VALIDATION_FAILED_ERROR', 'WARNING');
    this.name = 'ValidationFailedError';
    this.missingParameters = missingParameters;
  }
}

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export function successResult<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function failureResult<E extends AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

export class Logger {
  public static info(msg: string, details?: any) {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, details || '');
  }

  public static warn(msg: string, details?: any) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, details || '');
  }

  public static error(err: AppError | Error | string) {
    if (err instanceof AppError) {
      console.error(`[${err.code}] [${err.severity}] ${err.message}`, err.originalError || '');
    } else {
      console.error(`[ERROR]`, err);
    }
  }
}
