import type { CivicComplaint, MobilityRoute, EmergencyContact, TicketStatus } from '../../types/civic';

export interface ICityServiceProvider {
  name: string;
  isMock: boolean;
  
  submitComplaint(complaint: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<CivicComplaint>;
  getComplaintByTicketId(ticketId: string): Promise<CivicComplaint | null>;
  getAllComplaints(): Promise<CivicComplaint[]>;
  updateComplaintStatus(ticketId: string, status: TicketStatus, note?: string): Promise<CivicComplaint | null>;

  queryMobilityRoutes(destination?: string, routeNumber?: string): Promise<MobilityRoute[]>;

  getEmergencyContacts(category?: string): Promise<EmergencyContact[]>;
}
