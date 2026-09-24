import type { ICityServiceProvider } from './CityServiceProvider';
import type { Complaint, ComplaintStatus, MobilityRequest, EmergencyRequest, Location, CityService } from '../domain/models';
import { type Result, successResult, failureResult, CityServiceError } from '../lib/error';

const LOCAL_STORAGE_KEY = 'cityvoice_foundation_complaints';

const DEFAULT_MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c_01',
    ticketId: 'MUNI-2026-8942',
    category: 'POTHOLE',
    title: 'Severe Deep Pothole',
    description: 'Dangerous pothole near Anna University Gate 3.',
    location: { address: 'Sardar Patel Road, Guindy, Chennai', landmark: 'Opposite Gate 3' },
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedResolutionHours: 24,
    assignedDepartment: 'Public Works Department (PWD)'
  },
  {
    id: 'c_02',
    ticketId: 'MUNI-2026-4109',
    category: 'GARBAGE',
    title: 'Municipal Waste Overflow',
    description: 'Overflowing bin on Commercial Street.',
    location: 'Sector 4, Jubilee Hills, Hyderabad' as any,
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedResolutionHours: 12,
    assignedDepartment: 'Solid Waste Management'
  }
];

export class MockCityServiceProvider implements ICityServiceProvider {
  public name = 'Mock City Municipal Engine';
  public isMock = true;

  constructor() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_COMPLAINTS));
    }
  }

  public async registerComplaint(
    data: Omit<Complaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Result<Complaint>> {
    try {
      const existing = await this.getAllComplaintsInternal();
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `MUNI-${new Date().getFullYear()}-${suffix}`;

      const newComplaint: Complaint = {
        ...data,
        id: 'c_' + Date.now(),
        ticketId,
        status: 'REGISTERED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedDepartment: data.assignedDepartment || 'Municipal Works Division'
      };

      const updated = [newComplaint, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return successResult(newComplaint);
    } catch (e: any) {
      return failureResult(new CityServiceError('Failed to register complaint', e));
    }
  }

  public async getComplaintStatus(ticketId: string): Promise<Result<Complaint | null>> {
    try {
      const complaints = await this.getAllComplaintsInternal();
      const clean = ticketId.trim().toUpperCase();
      const found = complaints.find((c) => c.ticketId.toUpperCase() === clean || c.id === ticketId) || null;
      return successResult(found);
    } catch (e: any) {
      return failureResult(new CityServiceError('Failed to query complaint', e));
    }
  }

  public async getAllComplaints(): Promise<Result<Complaint[]>> {
    try {
      const list = await this.getAllComplaintsInternal();
      return successResult(list);
    } catch (e: any) {
      return failureResult(new CityServiceError('Failed to fetch complaints', e));
    }
  }

  public async updateComplaintStatus(
    ticketId: string,
    status: ComplaintStatus,
    note?: string
  ): Promise<Result<Complaint>> {
    try {
      const complaints = await this.getAllComplaintsInternal();
      const index = complaints.findIndex((c) => c.ticketId === ticketId || c.id === ticketId);

      if (index === -1) {
        return failureResult(new CityServiceError(`Ticket ${ticketId} not found`));
      }

      complaints[index].status = status;
      complaints[index].updatedAt = new Date().toISOString();
      if (note) complaints[index].description += `\n[Status Note]: ${note}`;

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(complaints));
      return successResult(complaints[index]);
    } catch (e: any) {
      return failureResult(new CityServiceError('Failed to update complaint', e));
    }
  }

  public async queryMobilityInformation(
    destination?: string,
    routeNumber?: string
  ): Promise<Result<MobilityRequest[]>> {
    const mockMobility: MobilityRequest[] = [
      {
        id: 'm1',
        destination: destination || 'Central Railway Station',
        busRouteNumber: routeNumber || '21G',
        requestedAt: new Date().toISOString()
      },
      {
        id: 'm2',
        destination: destination || 'Airport Metro Terminal',
        busRouteNumber: 'M70',
        requestedAt: new Date().toISOString()
      }
    ];
    return successResult(mockMobility);
  }

  public async findNearbyHospitals(location?: Location): Promise<Result<EmergencyRequest[]>> {
    const mockEmergency: EmergencyRequest[] = [
      {
        id: 'e1',
        category: 'AMBULANCE',
        location: location || { address: 'City General Hospital, Main Gate', landmark: 'Near Central Clocktower' },
        description: 'State Unified Medical Dispatch 108 Command Center',
        severity: 'HIGH',
        requestedAt: new Date().toISOString()
      },
      {
        id: 'e2',
        category: 'POLICE',
        location: location || { address: 'Metropolitan Police Command Unit', landmark: 'City Center' },
        description: 'Quick Police Dispatch 100 Patrol Unit',
        severity: 'CRITICAL',
        requestedAt: new Date().toISOString()
      }
    ];
    return successResult(mockEmergency);
  }

  public async getAvailableCityServices(): Promise<Result<CityService[]>> {
    const services: CityService[] = [
      {
        id: 's1',
        name: 'Road Infrastructure & Pothole Repair',
        department: 'Public Works Department',
        isAvailable: true,
        contactNumber: '1800-425-0001',
        serviceCategory: 'CIVIC_ROADS'
      },
      {
        id: 's2',
        name: 'Solid Waste Management & Sanitation',
        department: 'Municipal Corporation',
        isAvailable: true,
        contactNumber: '1800-425-0002',
        serviceCategory: 'SANITATION'
      }
    ];
    return successResult(services);
  }

  private async getAllComplaintsInternal(): Promise<Complaint[]> {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_MOCK_COMPLAINTS;
  }
}
