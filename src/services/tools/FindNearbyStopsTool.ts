import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { IMobilityService } from '../mobility/IMobilityService';
import type { TransitStop } from '../../domain/models';
import { type Result, successResult, failureResult, ValidationFailedError } from '../../lib/error';

export interface FindNearbyStopsParams {
  location: string;
}

export class FindNearbyStopsTool implements ITool<FindNearbyStopsParams, TransitStop[]> {
  public name = 'findNearbyStops';
  public description = 'Finds bus stops and metro stations near a specified location.';
  public category: ToolCategory = 'MOBILITY';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    location: { type: 'string', description: 'Current location or landmark area', required: true }
  };

  private mobilityService: IMobilityService;

  constructor(mobilityService: IMobilityService) {
    this.mobilityService = mobilityService;
  }

  public validate(params: FindNearbyStopsParams): ToolValidationResult {
    if (!params.location) {
      return { isValid: false, missingParameters: ['location'], error: 'Location parameter is required' };
    }
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: FindNearbyStopsParams): Promise<Result<TransitStop[]>> {
    const val = this.validate(params);
    if (!val.isValid) {
      return failureResult(new ValidationFailedError('findNearbyStops', val.error || 'Invalid location'));
    }
    const stops = await this.mobilityService.getNearbyStops(params.location);
    return successResult(stops);
  }
}
