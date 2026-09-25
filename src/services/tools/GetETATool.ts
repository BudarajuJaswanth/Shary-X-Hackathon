import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { IMobilityService } from '../mobility/IMobilityService';
import type { ETA } from '../../domain/models';
import { type Result, successResult, failureResult, ValidationFailedError } from '../../lib/error';

export interface GetETAParams {
  routeNumber?: string;
  origin: string;
  destination: string;
}

export class GetETATool implements ITool<GetETAParams, ETA | null> {
  public name = 'getETA';
  public description = 'Calculates estimated travel duration and arrival time for transit route.';
  public category: ToolCategory = 'MOBILITY';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    origin: { type: 'string', description: 'Origin location', required: true },
    destination: { type: 'string', description: 'Destination location', required: true },
    routeNumber: { type: 'string', description: 'Route identifier', required: false }
  };

  private mobilityService: IMobilityService;

  constructor(mobilityService: IMobilityService) {
    this.mobilityService = mobilityService;
  }

  public validate(params: GetETAParams): ToolValidationResult {
    const missing: string[] = [];
    if (!params.origin) missing.push('origin');
    if (!params.destination) missing.push('destination');
    if (missing.length > 0) {
      return { isValid: false, missingParameters: missing, error: 'Origin and destination are required' };
    }
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetETAParams): Promise<Result<ETA | null>> {
    const val = this.validate(params);
    if (!val.isValid) {
      return failureResult(new ValidationFailedError('getETA', val.error || 'Invalid params'));
    }
    const eta = await this.mobilityService.getETA(params.routeNumber || 'M92', params.origin, params.destination);
    return successResult(eta);
  }
}
