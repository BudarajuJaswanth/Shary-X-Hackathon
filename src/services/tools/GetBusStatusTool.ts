import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { IMobilityService } from '../mobility/IMobilityService';
import type { TransitVehicle } from '../../domain/models';
import { type Result, successResult } from '../../lib/error';

export interface GetBusStatusParams {
  routeNumber?: string;
  destination?: string;
}

export class GetBusStatusTool implements ITool<GetBusStatusParams, TransitVehicle[]> {
  public name = 'getBusStatus';
  public description = 'Gets live tracking and next departure status for bus route or destination.';
  public category: ToolCategory = 'MOBILITY';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    routeNumber: { type: 'string', description: 'Bus route number (e.g. M92, 70V)', required: false },
    destination: { type: 'string', description: 'Destination city area', required: false }
  };

  private mobilityService: IMobilityService;

  constructor(mobilityService: IMobilityService) {
    this.mobilityService = mobilityService;
  }

  public validate(_params: GetBusStatusParams): ToolValidationResult {
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetBusStatusParams): Promise<Result<TransitVehicle[]>> {
    const list = await this.mobilityService.getBusStatus(params?.routeNumber, params?.destination);
    return successResult(list);
  }
}
