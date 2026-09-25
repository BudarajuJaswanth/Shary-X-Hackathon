import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { CivicComplaint } from '../../types/civic';
import { type Result, successResult } from '../../lib/error';

export interface GetCitizenRequestsParams {
  filterStatus?: string;
  category?: string;
}

export class GetCitizenRequestsTool implements ITool<GetCitizenRequestsParams, CivicComplaint[]> {
  public name = 'getCitizenRequests';
  public description = 'Retrieves list of previous civic complaints registered by citizen.';
  public category: ToolCategory = 'CIVIC';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    filterStatus: { type: 'string', description: 'Status filter (ALL, OPEN, IN_PROGRESS, RESOLVED)', required: false },
    category: { type: 'string', description: 'Category filter', required: false }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public validate(_params: GetCitizenRequestsParams): ToolValidationResult {
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetCitizenRequestsParams): Promise<Result<CivicComplaint[]>> {
    const list = await this.cityService.getAllComplaints(params?.filterStatus);
    if (params?.category && params.category !== 'ALL') {
      const filtered = list.filter((c) => c.category === params.category);
      return successResult(filtered);
    }
    return successResult(list);
  }
}
