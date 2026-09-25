import type { CivicComplaint, MobilityRoute, EmergencyContact, TicketStatus } from '../../types/civic';
import type { RequestStatusHistory } from '../../domain/models';

export interface ICityServiceProvider {
  name: string;
  isMock: boolean;
  
  submitComplaint(complaint: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<CivicComplaint>;
  getComplaintByTicketId(ticketId: string): Promise<CivicComplaint | null>;
  getAllComplaints(filterStatus?: string): Promise<CivicComplaint[]>;
  updateComplaintStatus(ticketId: string, status: TicketStatus, note?: string): Promise<CivicComplaint | null>;
  getRequestStatusHistory(ticketId: string): Promise<RequestStatusHistory[]>;

  queryMobilityRoutes(destination?: string, routeNumber?: string): Promise<MobilityRoute[]>;

  getEmergencyContacts(category?: string): Promise<EmergencyContact[]>;
}
