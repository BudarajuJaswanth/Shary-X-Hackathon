import type { ToolRegistry } from '../tools/ToolRegistry';
import { type Result, failureResult } from '../../lib/error';

export type WorkflowStatus =
  | 'PENDING'
  | 'VALIDATING'
  | 'WAITING_FOR_INPUT'
  | 'WAITING_FOR_CONFIRMATION'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface WorkflowToolCallRecord {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  executedAt: string;
}

export interface WorkflowExecution {
  executionId: string;
  workflowName: string;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  toolCalls: WorkflowToolCallRecord[];
  idempotencyToken?: string;
  result?: any;
  error?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  executionId: string;
  workflowName: string;
  toolName: string;
  status: WorkflowStatus;
  sanitizedParams: Record<string, any>;
  success: boolean;
  requestId?: string;
  error?: string;
}

export class WorkflowOrchestrator {
  private toolRegistry: ToolRegistry;
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private executedTokens: Set<string> = new Set();

  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  public createExecution(workflowName: string, idempotencyToken?: string): WorkflowExecution {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const execution: WorkflowExecution = {
      executionId,
      workflowName,
      status: 'PENDING',
      startedAt: new Date().toISOString(),
      toolCalls: [],
      idempotencyToken
    };
    this.activeExecutions.set(executionId, execution);
    return execution;
  }

  public isTokenAlreadyProcessed(token?: string): boolean {
    if (!token) return false;
    return this.executedTokens.has(token);
  }

  public markTokenProcessed(token?: string): void {
    if (token) {
      this.executedTokens.add(token);
    }
  }

  public getExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public async executeToolWorkflow(
    workflowName: string,
    toolName: string,
    params: any,
    confirmationGiven = false,
    idempotencyToken?: string
  ): Promise<Result<any>> {
    // 1. Idempotency Check
    if (idempotencyToken && this.isTokenAlreadyProcessed(idempotencyToken)) {
      return failureResult({
        name: 'IdempotencyError',
        message: `Action with token '${idempotencyToken}' has already been executed. Duplicate creation blocked.`,
        code: 'IDEMPOTENT_ACTION_DUPLICATE'
      } as any);
    }

    const execution = this.createExecution(workflowName, idempotencyToken);

    // 2. Validation phase
    execution.status = 'VALIDATING';
    const validation = this.toolRegistry.validateInput(toolName, params);

    if (!validation.isValid) {
      execution.status = validation.missingParameters.length > 0 ? 'WAITING_FOR_INPUT' : 'FAILED';
      execution.error = validation.error;
      execution.completedAt = new Date().toISOString();

      this.logAudit(execution, toolName, params, false, validation.error);
      return failureResult({
        name: 'WorkflowValidationError',
        message: validation.error || `Missing required input parameters: ${validation.missingParameters.join(', ')}`,
        missingParameters: validation.missingParameters
      } as any);
    }

    // 3. Permission & Confirmation Check
    const tool = this.toolRegistry.getTool(toolName);
    if (tool && tool.permission === 'ACTION' && tool.requiresConfirmation && !confirmationGiven) {
      execution.status = 'WAITING_FOR_CONFIRMATION';
      this.logAudit(execution, toolName, params, false, 'Waiting for citizen confirmation');
      return failureResult({
        name: 'ConfirmationRequiredError',
        message: `Tool '${toolName}' requires citizen confirmation prior to execution.`
      } as any);
    }

    // 4. Execution phase
    execution.status = 'EXECUTING';
    const startTime = new Date().toISOString();

    const toolResult = await this.toolRegistry.executeTool(toolName, params, confirmationGiven);

    if (toolResult.success) {
      execution.status = 'COMPLETED';
      execution.completedAt = new Date().toISOString();
      execution.result = toolResult.data;
      execution.toolCalls.push({
        toolName,
        parameters: this.sanitizeParams(params),
        result: toolResult.data,
        executedAt: startTime
      });

      if (idempotencyToken) {
        this.markTokenProcessed(idempotencyToken);
      }

      this.logAudit(execution, toolName, params, true, undefined, toolResult.data?.ticketId);
      return toolResult;
    } else {
      execution.status = 'FAILED';
      execution.completedAt = new Date().toISOString();
      execution.error = toolResult.error.message;
      execution.toolCalls.push({
        toolName,
        parameters: this.sanitizeParams(params),
        error: toolResult.error.message,
        executedAt: startTime
      });

      this.logAudit(execution, toolName, params, false, toolResult.error.message);
      return toolResult;
    }
  }

  public cancelWorkflow(executionId: string): void {
    const exec = this.activeExecutions.get(executionId);
    if (exec) {
      exec.status = 'CANCELLED';
      exec.completedAt = new Date().toISOString();
    }
  }

  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    if (!params) return {};
    const sanitized = { ...params };
    const sensitiveKeys = ['password', 'secret', 'apiKey', 'token', 'auth', 'ssn'];
    for (const k of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
        sanitized[k] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  private logAudit(
    execution: WorkflowExecution,
    toolName: string,
    params: any,
    success: boolean,
    error?: string,
    requestId?: string
  ): void {
    this.auditLogs.push({
      timestamp: new Date().toISOString(),
      executionId: execution.executionId,
      workflowName: execution.workflowName,
      toolName,
      status: execution.status,
      sanitizedParams: this.sanitizeParams(params),
      success,
      requestId,
      error
    });
  }
}
