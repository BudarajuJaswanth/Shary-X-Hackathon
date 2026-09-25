import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { IEmergencyService } from '../emergency/IEmergencyService';
import type { EmergencyFacility } from '../../domain/models';
import { type Result, successResult } from '../../lib/error';

export interface FindNearbyFireStationParams {
  location?: string;
}

export class FindNearbyFireStationTool implements ITool<FindNearbyFireStationParams, EmergencyFacility[]> {
  public name = 'findNearbyFireStation';
  public description = 'Locates nearest fire brigade stations and rescue control centers.';
  public category: ToolCategory = 'EMERGENCY';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    location: { type: 'string', description: 'Citizen location or city area', required: false }
  };

  private emergencyService: IEmergencyService;

  constructor(emergencyService: IEmergencyService) {
    this.emergencyService = emergencyService;
  }

  public validate(_params: FindNearbyFireStationParams): ToolValidationResult {
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: FindNearbyFireStationParams): Promise<Result<EmergencyFacility[]>> {
    const facilities = await this.emergencyService.findNearbyFacilities('FIRE_STATION', params?.location);
    return successResult(facilities);
  }
}
