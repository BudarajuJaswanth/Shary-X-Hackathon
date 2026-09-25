import type { Result } from '../../lib/error';

export type ToolCategory = 'CIVIC' | 'MOBILITY' | 'EMERGENCY' | 'TRACKING';
export type ToolPermission = 'READ_ONLY' | 'ACTION';

export interface ToolParameterSchema {
  type: string;
  description: string;
  required?: boolean;
}

export interface ToolValidationResult {
  isValid: boolean;
  missingParameters: string[];
  error?: string;
}

export interface ITool<P = any, R = any> {
  name: string;
  description: string;
  category: ToolCategory;
  permission: ToolPermission;
  requiresConfirmation: boolean;
  parametersSchema: Record<string, ToolParameterSchema>;
  validate(params: P): ToolValidationResult;
  execute(params: P): Promise<Result<R>>;
}
