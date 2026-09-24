import type { ITool } from './ITool';
import type { ICityServiceProvider } from '../../providers/CityServiceProvider';
import type { EmergencyRequest } from '../../domain/models';
import type { Result } from '../../lib/error';

export interface FindNearbyHospitalParams {
  locationAddress?: string;
}

export class FindNearbyHospitalTool implements ITool<FindNearbyHospitalParams, EmergencyRequest[]> {
  public name = 'findNearbyHospital';
  public description = 'Locates nearest hospitals and emergency dispatch centers.';

  public parametersSchema = {
    locationAddress: { type: 'string', description: 'Address or landmark' }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public async execute(params: FindNearbyHospitalParams): Promise<Result<EmergencyRequest[]>> {
    return this.cityService.findNearbyHospitals(
      params.locationAddress ? { address: params.locationAddress } : undefined
    );
  }
}
