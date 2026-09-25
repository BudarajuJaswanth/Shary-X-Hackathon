import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { MobilityRoute } from '../../types/civic';
import { type Result, successResult } from '../../lib/error';

export interface GetMobilityParams {
  destination?: string;
  routeNumber?: string;
}

export class GetMobilityInformationTool implements ITool<GetMobilityParams, MobilityRoute[]> {
  public name = 'getMobilityInformation';
  public description = 'Fetches real-time bus timetables, ETAs, and transit route information.';
  public category: ToolCategory = 'MOBILITY';
  public permission: ToolPermission = 'READ_ONLY';
  public requiresConfirmation = false;

  public parametersSchema = {
    destination: { type: 'string', description: 'Destination name or bus stop', required: false },
    routeNumber: { type: 'string', description: 'Bus route code (e.g. 21G)', required: false }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public validate(_params: GetMobilityParams): ToolValidationResult {
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: GetMobilityParams): Promise<Result<MobilityRoute[]>> {
    const routes = await this.cityService.queryMobilityRoutes(params?.destination, params?.routeNumber);
    return successResult(routes);
  }
}
