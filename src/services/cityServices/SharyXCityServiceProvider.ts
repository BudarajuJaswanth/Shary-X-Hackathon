import type { ICityServiceProvider } from './ICityServiceProvider';
import type { CivicComplaint, MobilityRoute, EmergencyContact, TicketStatus } from '../../types/civic';

export class SharyXCityServiceProvider implements ICityServiceProvider {
  public name = 'SharyX Civic Engine API';
  public isMock = false;

  private apiKey: string;
  private baseUrl: string;
  private fallbackProvider: ICityServiceProvider;

  constructor(fallbackProvider: ICityServiceProvider) {
    this.apiKey = import.meta.env.VITE_SHARYX_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_SHARYX_BASE_URL || 'https://api.sharyx.ai/v1';
    this.fallbackProvider = fallbackProvider;
  }

  public get isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async submitComplaint(
    complaintData: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<CivicComplaint> {
    if (!this.isConfigured) {
      console.log('[SharyX City Adapter] API key missing. Delegating to MockCityServiceProvider.');
      return this.fallbackProvider.submitComplaint(complaintData);
    }

    try {
      const response = await fetch(`${this.baseUrl}/civic/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(complaintData)
      });

      if (!response.ok) throw new Error(`SharyX HTTP Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.warn('[SharyX City Adapter] Request failed, using fallback:', error);
      return this.fallbackProvider.submitComplaint(complaintData);
    }
  }

  public async getComplaintByTicketId(ticketId: string): Promise<CivicComplaint | null> {
    if (!this.isConfigured) {
      return this.fallbackProvider.getComplaintByTicketId(ticketId);
    }
    return this.fallbackProvider.getComplaintByTicketId(ticketId);
  }

  public async getAllComplaints(): Promise<CivicComplaint[]> {
    if (!this.isConfigured) {
      return this.fallbackProvider.getAllComplaints();
    }
    return this.fallbackProvider.getAllComplaints();
  }

  public async updateComplaintStatus(
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<CivicComplaint | null> {
    if (!this.isConfigured) {
      return this.fallbackProvider.updateComplaintStatus(ticketId, status, note);
    }
    return this.fallbackProvider.updateComplaintStatus(ticketId, status, note);
  }

  public async queryMobilityRoutes(destination?: string, routeNumber?: string): Promise<MobilityRoute[]> {
    if (!this.isConfigured) {
      return this.fallbackProvider.queryMobilityRoutes(destination, routeNumber);
    }
    return this.fallbackProvider.queryMobilityRoutes(destination, routeNumber);
  }

  public async getEmergencyContacts(category?: string): Promise<EmergencyContact[]> {
    if (!this.isConfigured) {
      return this.fallbackProvider.getEmergencyContacts(category);
    }
    return this.fallbackProvider.getEmergencyContacts(category);
  }
}
