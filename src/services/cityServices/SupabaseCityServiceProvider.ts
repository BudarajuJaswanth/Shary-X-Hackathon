import type { ICityServiceProvider } from './ICityServiceProvider';
import type { CivicComplaint, MobilityRoute, EmergencyContact, TicketStatus } from '../../types/civic';
import type { RequestStatusHistory } from '../../domain/models';
import { SupabaseCivicRepository } from '../database/SupabaseCivicRepository';
import { MockCityServiceProvider } from './MockCityServiceProvider';

export class SupabaseCityServiceProvider implements ICityServiceProvider {
  public name = 'Supabase PostgreSQL City Engine';
  public isMock = false;

  private repository: SupabaseCivicRepository;
  private fallbackMock: MockCityServiceProvider;

  constructor() {
    this.repository = new SupabaseCivicRepository();
    this.fallbackMock = new MockCityServiceProvider();
  }

  public async submitComplaint(
    complaintData: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<CivicComplaint> {
    try {
      return await this.repository.createComplaint(complaintData);
    } catch (err) {
      console.warn('[SupabaseCityServiceProvider] Fallback to mock on submission error:', err);
      return await this.fallbackMock.submitComplaint(complaintData);
    }
  }

  public async getComplaintByTicketId(ticketId: string): Promise<CivicComplaint | null> {
    try {
      const result = await this.repository.getComplaintByTicketId(ticketId);
      if (result) return result;
      return await this.fallbackMock.getComplaintByTicketId(ticketId);
    } catch {
      return await this.fallbackMock.getComplaintByTicketId(ticketId);
    }
  }

  public async getAllComplaints(filterStatus?: string): Promise<CivicComplaint[]> {
    try {
      const results = await this.repository.listComplaints(filterStatus);
      if (results.length > 0) return results;
      return await this.fallbackMock.getAllComplaints(filterStatus);
    } catch {
      return await this.fallbackMock.getAllComplaints(filterStatus);
    }
  }

  public async updateComplaintStatus(
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<CivicComplaint | null> {
    try {
      const result = await this.repository.updateComplaintStatus(ticketId, status, note);
      if (result) return result;
      return await this.fallbackMock.updateComplaintStatus(ticketId, status, note);
    } catch {
      return await this.fallbackMock.updateComplaintStatus(ticketId, status, note);
    }
  }

  public async getRequestStatusHistory(ticketId: string): Promise<RequestStatusHistory[]> {
    try {
      const history = await this.repository.getRequestStatusHistory(ticketId);
      if (history.length > 0) return history;
      return await this.fallbackMock.getRequestStatusHistory(ticketId);
    } catch {
      return await this.fallbackMock.getRequestStatusHistory(ticketId);
    }
  }

  public async queryMobilityRoutes(destination?: string, routeNumber?: string): Promise<MobilityRoute[]> {
    return await this.fallbackMock.queryMobilityRoutes(destination, routeNumber);
  }

  public async getEmergencyContacts(category?: string): Promise<EmergencyContact[]> {
    return await this.fallbackMock.getEmergencyContacts(category);
  }
}
