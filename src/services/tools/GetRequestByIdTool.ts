import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { CivicComplaint } from '../../types/civic';
import { type Result, successResult, failureResult, ValidationFailedError } from '../../lib/error';

export interface GetRequestByIdParams {
  ticketId: string;
}

export class GetRequestByIdTool implements ITool<GetRequestByIdParams, CivicComplaint | null> {
  public name = 'getRequestById';
  public description = 'Fetches full detailed record of a civic request by ticket ID.';
  public category: ToolCategory = 'TRACKING';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    ticketId: { type: 'string', description: 'Ticket ID reference', required: true }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public validate(params: GetRequestByIdParams): ToolValidationResult {
    if (!params.ticketId || !params.ticketId.trim()) {
      return { isValid: false, missingParameters: ['ticketId'], error: 'Ticket ID is required' };
    }
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetRequestByIdParams): Promise<Result<CivicComplaint | null>> {
    const val = this.validate(params);
    if (!val.isValid) {
      return failureResult(new ValidationFailedError('getRequestById', val.error || 'Invalid ticketId'));
    }
    const complaint = await this.cityService.getComplaintByTicketId(params.ticketId);
    return successResult(complaint);
  }
}
