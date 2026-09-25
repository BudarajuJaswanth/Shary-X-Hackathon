import type { ITool, ToolCategory, ToolPermission, ToolValidationResult } from './ITool';
import type { ICityServiceProvider } from '../cityServices/ICityServiceProvider';
import type { CivicComplaint } from '../../types/civic';
import { type Result, successResult, failureResult, ValidationFailedError } from '../../lib/error';

export interface RegisterComplaintParams {
  category: CivicComplaint['category'];
  title?: string;
  description: string;
  location: string;
  landmark?: string;
  priority?: CivicComplaint['priority'];
}

export class RegisterComplaintTool implements ITool<RegisterComplaintParams, CivicComplaint> {
  public name = 'registerComplaint';
  public description = 'Registers a new municipal civic complaint (potholes, garbage, streetlight, water leakage, road damage).';
  public category: ToolCategory = 'CIVIC';
  public permission: ToolPermission = 'ACTION';
  public requiresConfirmation = true;

  public parametersSchema = {
    category: { type: 'string', description: 'Complaint category (POTHOLE, GARBAGE, STREETLIGHT, WATER_LEAKAGE, ROAD_DAMAGE, OTHER)', required: true },
    description: { type: 'string', description: 'Detailed issue explanation', required: true },
    location: { type: 'string', description: 'Address or location where issue occurred', required: true },
    title: { type: 'string', description: 'Brief summary title of issue', required: false },
    landmark: { type: 'string', description: 'Nearby landmark', required: false },
    priority: { type: 'string', description: 'Priority level (LOW, MEDIUM, HIGH, CRITICAL)', required: false }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public validate(params: RegisterComplaintParams): ToolValidationResult {
    const missing: string[] = [];
    if (!params.category) missing.push('category');
    if (!params.location) missing.push('location');
    if (!params.description) missing.push('description');

    if (missing.length > 0) {
      return {
        isValid: false,
        missingParameters: missing,
        error: `Missing required parameters for complaint registration: ${missing.join(', ')}`
      };
    }
    return { isValid: true, missingParameters: [] };
  }

  public async execute(params: RegisterComplaintParams): Promise<Result<CivicComplaint>> {
    const validation = this.validate(params);
    if (!validation.isValid) {
      return failureResult(new ValidationFailedError('registerComplaint', validation.error || 'Invalid parameters'));
    }

    try {
      const result = await this.cityService.submitComplaint({
        category: params.category || 'POTHOLE',
        title: params.title || `${params.category || 'Civic'} Hazard`,
        description: params.description,
        location: params.location,
        landmark: params.landmark || '',
        priority: params.priority || 'HIGH',
        estimatedResolutionHours: params.category === 'POTHOLE' ? 24 : 48,
        assignedDepartment: 'Municipal Works Division',
        language: 'en'
      });
      return successResult(result);
    } catch (err: any) {
      return failureResult(new ValidationFailedError('registerComplaint', err.message || 'Submission failed'));
    }
  }
}
