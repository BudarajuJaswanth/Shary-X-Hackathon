import type { ITool } from './ITool';
import type { ICityServiceProvider } from '../../providers/CityServiceProvider';
import type { Complaint } from '../../domain/models';
import type { Result } from '../../lib/error';

export interface RegisterComplaintParams {
  category: Complaint['category'];
  title: string;
  description: string;
  locationAddress: string;
  landmark?: string;
  priority?: Complaint['priority'];
}

export class RegisterComplaintTool implements ITool<RegisterComplaintParams, Complaint> {
  public name = 'registerComplaint';
  public description = 'Registers a new municipal civic complaint (potholes, garbage, streetlight, water leakage, road damage).';
  
  public parametersSchema = {
    category: { type: 'string', description: 'Complaint category (POTHOLE, GARBAGE, STREETLIGHT, WATER_LEAKAGE, ROAD_DAMAGE, OTHER)', required: true },
    title: { type: 'string', description: 'Brief summary title of issue', required: true },
    description: { type: 'string', description: 'Detailed issue explanation', required: true },
    locationAddress: { type: 'string', description: 'Address or location where issue occurred', required: true },
    landmark: { type: 'string', description: 'Nearby landmark' },
    priority: { type: 'string', description: 'Priority level (LOW, MEDIUM, HIGH, CRITICAL)' }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public async execute(params: RegisterComplaintParams): Promise<Result<Complaint>> {
    return this.cityService.registerComplaint({
      category: params.category || 'OTHER',
      title: params.title || 'Civic Request',
      description: params.description,
      location: {
        address: params.locationAddress,
        landmark: params.landmark
      },
      priority: params.priority || 'HIGH',
      estimatedResolutionHours: params.category === 'POTHOLE' ? 24 : 48,
      assignedDepartment: 'Municipal Services Division'
    });
  }
}
