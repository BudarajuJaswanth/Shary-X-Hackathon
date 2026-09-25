import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { IEmergencyService } from '../emergency/IEmergencyService';
import type { EmergencyFacility } from '../../domain/models';
import { type Result, successResult } from '../../lib/error';

export interface FindNearbyPoliceStationParams {
  location?: string;
}

export class FindNearbyPoliceStationTool implements ITool<FindNearbyPoliceStationParams, EmergencyFacility[]> {
  public name = 'findNearbyPoliceStation';
  public description = 'Locates nearest police stations, law enforcement control rooms, and patrol units.';
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

  public validate(_params: FindNearbyPoliceStationParams): ToolValidationResult {
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: FindNearbyPoliceStationParams): Promise<Result<EmergencyFacility[]>> {
    const facilities = await this.emergencyService.findNearbyFacilities('POLICE', params?.location);
    return successResult(facilities);
  }
}
