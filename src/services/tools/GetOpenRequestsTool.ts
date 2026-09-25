import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { CivicComplaint } from '../../types/civic';
import { type Result, successResult } from '../../lib/error';

export interface GetOpenRequestsParams {
  category?: string;
}

export class GetOpenRequestsTool implements ITool<GetOpenRequestsParams, CivicComplaint[]> {
  public name = 'getOpenRequests';
  public description = 'Fetches all currently active open municipal requests (SUBMITTED, ASSIGNED, IN_PROGRESS).';
  public category: ToolCategory = 'TRACKING';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    category: { type: 'string', description: 'Optional category filter', required: false }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public validate(_params: GetOpenRequestsParams): ToolValidationResult {
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetOpenRequestsParams): Promise<Result<CivicComplaint[]>> {
    const openList = await this.cityService.getAllComplaints('OPEN');
    if (params?.category && params.category !== 'ALL') {
      const filtered = openList.filter((c) => c.category === params.category);
      return successResult(filtered);
    }
    return successResult(openList);
  }
}
