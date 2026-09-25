import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { IMobilityService } from '../mobility/IMobilityService';
import type { Route } from '../../domain/models';
import { type Result, successResult, failureResult, ValidationFailedError } from '../../lib/error';

export interface SearchRoutesParams {
  origin: string;
  destination: string;
}

export class SearchRoutesTool implements ITool<SearchRoutesParams, Route[]> {
  public name = 'searchRoutes';
  public description = 'Searches public transit bus and metro route options between origin and destination.';
  public category: ToolCategory = 'MOBILITY';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    origin: { type: 'string', description: 'Starting location or area', required: true },
    destination: { type: 'string', description: 'Target destination location', required: true }
  };

  private mobilityService: IMobilityService;

  constructor(mobilityService: IMobilityService) {
    this.mobilityService = mobilityService;
  }

  public validate(params: SearchRoutesParams): ToolValidationResult {
    const missing: string[] = [];
    if (!params.origin) missing.push('origin');
    if (!params.destination) missing.push('destination');
    if (missing.length > 0) {
      return { isValid: false, missingParameters: missing, error: `Missing origin or destination` };
    }
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: SearchRoutesParams): Promise<Result<Route[]>> {
    const val = this.validate(params);
    if (!val.isValid) {
      return failureResult(new ValidationFailedError('searchRoutes', val.error || 'Invalid params'));
    }
    const routes = await this.mobilityService.getRoutes(params.origin, params.destination);
    return successResult(routes);
  }
}
