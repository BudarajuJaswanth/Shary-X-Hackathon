import type { Complaint, ComplaintStatus, MobilityRequest, EmergencyRequest, Location, CityService } from '../domain/models';
import type { Result } from '../lib/error';

export interface ICityServiceProvider {
  name: string;
  isMock: boolean;

  registerComplaint(
    complaintData: Omit<Complaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Result<Complaint>>;

  getComplaintStatus(ticketId: string): Promise<Result<Complaint | null>>;

  getAllComplaints(): Promise<Result<Complaint[]>>;

  updateComplaintStatus(ticketId: string, status: ComplaintStatus, note?: string): Promise<Result<Complaint>>;

  queryMobilityInformation(destination?: string, routeNumber?: string): Promise<Result<MobilityRequest[]>>;

  findNearbyHospitals(location?: Location): Promise<Result<EmergencyRequest[]>>;

  getAvailableCityServices(): Promise<Result<CityService[]>>;
}
