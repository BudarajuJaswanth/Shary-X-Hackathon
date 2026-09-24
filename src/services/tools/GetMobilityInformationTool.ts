import type { ITool } from './ITool';
import type { ICityServiceProvider } from '../../providers/CityServiceProvider';
import type { MobilityRequest } from '../../domain/models';
import type { Result } from '../../lib/error';

export interface GetMobilityParams {
  destination?: string;
  routeNumber?: string;
}

export class GetMobilityInformationTool implements ITool<GetMobilityParams, MobilityRequest[]> {
  public name = 'getMobilityInformation';
  public description = 'Fetches real-time bus timetables, ETAs, and transit route information.';

  public parametersSchema = {
    destination: { type: 'string', description: 'Destination name or bus stop' },
    routeNumber: { type: 'string', description: 'Bus route code (e.g. 21G)' }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public async execute(params: GetMobilityParams): Promise<Result<MobilityRequest[]>> {
    return this.cityService.queryMobilityInformation(params.destination, params.routeNumber);
  }
}
