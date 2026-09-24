import type { Result } from '../../lib/error';

export interface ToolParameterSchema {
  type: string;
  description: string;
  required?: boolean;
}

export interface ITool<P = any, R = any> {
  name: string;
  description: string;
  parametersSchema: Record<string, ToolParameterSchema>;
  execute(params: P): Promise<Result<R>>;
}
