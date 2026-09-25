import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { CivicComplaint } from '../../types/civic';
import { type Result, successResult, failureResult, ValidationFailedError } from '../../lib/error';

export interface GetComplaintStatusParams {
  ticketId: string;
}

export class GetComplaintStatusTool implements ITool<GetComplaintStatusParams, CivicComplaint | null> {
  public name = 'getComplaintStatus';
  public description = 'Queries the current status and resolution SLA timeline for a registered ticket ID.';
  public category: ToolCategory = 'CIVIC';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    ticketId: { type: 'string', description: 'Municipal ticket ID (e.g. CIV-2026-0042)', required: true }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public validate(params: GetComplaintStatusParams): ToolValidationResult {
    if (!params.ticketId || !params.ticketId.trim()) {
      return { isValid: false, missingParameters: ['ticketId'], error: 'Ticket ID is required' };
    }
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetComplaintStatusParams): Promise<Result<CivicComplaint | null>> {
    const validation = this.validate(params);
    if (!validation.isValid) {
      return failureResult(new ValidationFailedError('getComplaintStatus', validation.error || 'Invalid params'));
    }
    const result = await this.cityService.getComplaintByTicketId(params.ticketId);
    return successResult(result);
  }
}
