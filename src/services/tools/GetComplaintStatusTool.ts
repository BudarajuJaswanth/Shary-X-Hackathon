import type { ITool } from './ITool';
import type { ICityServiceProvider } from '../../providers/CityServiceProvider';
import type { Complaint } from '../../domain/models';
import type { Result } from '../../lib/error';

export interface GetComplaintStatusParams {
  ticketId: string;
}

export class GetComplaintStatusTool implements ITool<GetComplaintStatusParams, Complaint | null> {
  public name = 'getComplaintStatus';
  public description = 'Queries the current status and resolution SLA timeline for a registered ticket ID.';

  public parametersSchema = {
    ticketId: { type: 'string', description: 'Municipal ticket ID (e.g. MUNI-2026-8942)', required: true }
  };

  private cityService: ICityServiceProvider;

  constructor(cityService: ICityServiceProvider) {
    this.cityService = cityService;
  }

  public async execute(params: GetComplaintStatusParams): Promise<Result<Complaint | null>> {
    return this.cityService.getComplaintStatus(params.ticketId);
  }
}
