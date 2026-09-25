import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { RequestStatusHistory } from '../../domain/models';
import { type Result, successResult, failureResult, ValidationFailedError } from '../../lib/error';

export interface GetRequestHistoryParams {
  ticketId: string;
}

export class GetRequestHistoryTool implements ITool<GetRequestHistoryParams, RequestStatusHistory[]> {
  public name = 'getRequestHistory';
  public description = 'Fetches full status audit timeline history for a given request ID.';
  public category: ToolCategory = 'TRACKING';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    ticketId: { type: 'string', description: 'Request ticket ID', required: true }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public validate(params: GetRequestHistoryParams): ToolValidationResult {
    if (!params.ticketId || !params.ticketId.trim()) {
      return { isValid: false, missingParameters: ['ticketId'], error: 'Ticket ID is required' };
    }
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetRequestHistoryParams): Promise<Result<RequestStatusHistory[]>> {
    const val = this.validate(params);
    if (!val.isValid) {
      return failureResult(new ValidationFailedError('getRequestHistory', val.error || 'Invalid ticketId'));
    }
    const history = await this.cityService.getRequestStatusHistory(params.ticketId);
    return successResult(history);
  }
}
