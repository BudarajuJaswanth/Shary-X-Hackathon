import type { ICityServiceProvider } from './ICityServiceProvider';
import type { CivicComplaint, MobilityRoute, EmergencyContact, TicketStatus } from '../../types/civic';

const STORAGE_KEY = 'cityvoice_civic_complaints';

const INITIAL_MOCK_COMPLAINTS: CivicComplaint[] = [
  {
    id: 'c1',
    ticketId: 'MUNI-2026-8942',
    category: 'POTHOLE',
    title: 'Severe Deep Pothole',
    description: 'Dangerous 2-foot wide pothole near Anna University Gate 3 causing traffic slowdown.',
    location: 'Sardar Patel Road, Guindy, Chennai',
    landmark: 'Opposite Anna University Gate 3',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    estimatedResolutionHours: 24,
    assignedDepartment: 'Public Works Department (PWD) - Roads Division',
    language: 'en',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c2',
    ticketId: 'MUNI-2026-4109',
    category: 'GARBAGE',
    title: 'Uncollected Municipal Waste Overflow',
    description: 'Community garbage bin overflowing onto walkway for past 3 days.',
    location: 'Sector 4, Main Commercial Street, Jubilee Hills, Hyderabad',
    landmark: 'Near Metro Pillar 142',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    estimatedResolutionHours: 12,
    assignedDepartment: 'Solid Waste Management Division',
    language: 'en'
  },
  {
    id: 'c3',
    ticketId: 'MUNI-2026-7831',
    category: 'STREETLIGHT',
    title: 'Non-functional Streetlights (3 Poles)',
    description: 'Entire stretch pitch dark at night, safety concern for evening commuters.',
    location: '100 Feet Ring Road, BTM 2nd Stage, Bengaluru',
    landmark: 'Near Central Bus Terminus',
    priority: 'HIGH',
    status: 'REGISTERED',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    estimatedResolutionHours: 48,
    assignedDepartment: 'Electrical & Lighting Maintenance Division',
    language: 'en'
  }
];

const MOCK_MOBILITY_ROUTES: MobilityRoute[] = [
  {
    routeNumber: '21G',
    origin: 'Broadway Bus Terminus',
    destination: 'Tambaram East',
    nextDepartureTime: 'In 4 mins',
    etaMinutes: 4,
    fare: '₹22',
    busType: 'Electric Express',
    stops: ['Broadway', 'Central Station', 'LIC / Mount Road', 'Guindy', 'Chromepet', 'Tambaram'],
    liveStatus: 'ON_TIME',
    vehicleLocation: {
      lat: 13.0827,
      lng: 80.2707,
      currentStop: 'Central Station (Approaching)'
    }
  },
  {
    routeNumber: '47A',
    origin: 'T. Nagar Bus Stand',
    destination: 'ICF Perambur',
    nextDepartureTime: 'In 9 mins',
    etaMinutes: 9,
    fare: '₹15',
    busType: 'Ordinary Bus',
    stops: ['T. Nagar', 'Valluvar Kottam', 'Kilpauk Medical College', 'Perambur'],
    liveStatus: 'APPROACHING',
    vehicleLocation: {
      lat: 13.0418,
      lng: 80.2341,
      currentStop: 'Valluvar Kottam'
    }
  },
  {
    routeNumber: 'M70',
    origin: 'Koyambedu CMBT',
    destination: 'Velachery Bus Depot',
    nextDepartureTime: 'In 12 mins',
    etaMinutes: 12,
    fare: '₹45',
    busType: 'AC Volvo',
    stops: ['CMBT Koyambedu', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Velachery'],
    liveStatus: 'DELAYED',
    vehicleLocation: {
      lat: 13.0694,
      lng: 80.1948,
      currentStop: 'Vadapalani Junction'
    }
  }
];

const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'e1',
    name: 'State Unified Emergency Dispatch (Ambulance / Medical)',
    category: 'AMBULANCE',
    phone: '108',
    distanceKm: 0.8,
    address: 'City General Central Command Unit',
    available24x7: true
  },
  {
    id: 'e2',
    name: 'City Police Control Room & Quick Response Team',
    category: 'POLICE',
    phone: '100',
    distanceKm: 1.2,
    address: 'Metropolitan Police Headquarters',
    available24x7: true
  },
  {
    id: 'e3',
    name: 'Fire & Rescue Services Command Center',
    category: 'FIRE',
    phone: '101',
    distanceKm: 2.1,
    address: 'Central Fire Brigade Station',
    available24x7: true
  },
  {
    id: 'e4',
    name: 'Women Helpline & Emergency Safety Patrol',
    category: 'WOMEN_HELPLINE',
    phone: '1091',
    distanceKm: 1.0,
    address: 'City Safety Division',
    available24x7: true
  },
  {
    id: 'e5',
    name: 'Disaster Management & Flood Control Hotline',
    category: 'DISASTER',
    phone: '1070',
    distanceKm: 3.5,
    address: 'Municipal Disaster Response Center',
    available24x7: true
  }
];

export class MockCityServiceProvider implements ICityServiceProvider {
  public name = 'Mock City Municipal Engine';
  public isMock = true;

  private memoryStore: CivicComplaint[] = INITIAL_MOCK_COMPLAINTS;

  constructor() {
    this.ensureStorage();
  }

  private hasLocalStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private ensureStorage() {
    if (!this.hasLocalStorage()) return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_COMPLAINTS));
    }
  }

  public async submitComplaint(
    complaintData: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<CivicComplaint> {
    const existing = await this.getAllComplaints();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `CIV-${new Date().getFullYear()}-${randomSuffix}`;
    
    const departmentMap: Record<string, string> = {
      POTHOLE: 'Public Works Department (PWD) - Roads Division',
      GARBAGE: 'Solid Waste Management Division',
      STREETLIGHT: 'Electrical & Street Lighting Department',
      WATER_LEAKAGE: 'Metropolitan Water Supply & Sewage Board',
      ROAD_DAMAGE: 'Highways & Infrastructure Maintenance',
      OTHER: 'General Municipal Administration'
    };

    const newTicket: CivicComplaint = {
      ...complaintData,
      id: 'c_' + Date.now(),
      ticketId,
      status: 'REGISTERED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedDepartment: departmentMap[complaintData.category] || 'General Municipal Administration'
    };

    const updated = [newTicket, ...existing];
    this.memoryStore = updated;
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newTicket;
  }

  public async getComplaintByTicketId(ticketId: string): Promise<CivicComplaint | null> {
    const complaints = await this.getAllComplaints();
    const cleanSearch = ticketId.trim().toUpperCase();
    return complaints.find((c) => c.ticketId.toUpperCase() === cleanSearch || c.id === ticketId) || null;
  }

  public async getAllComplaints(): Promise<CivicComplaint[]> {
    if (!this.hasLocalStorage()) {
      return this.memoryStore;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_MOCK_COMPLAINTS;
    } catch {
      return INITIAL_MOCK_COMPLAINTS;
    }
  }

  public async updateComplaintStatus(
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<CivicComplaint | null> {
    const complaints = await this.getAllComplaints();
    const index = complaints.findIndex((c) => c.ticketId === ticketId || c.id === ticketId);
    if (index === -1) return null;

    complaints[index].status = status;
    complaints[index].updatedAt = new Date().toISOString();
    if (note) {
      complaints[index].description += `\n[Status Note]: ${note}`;
    }

    this.memoryStore = complaints;
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    }
    return complaints[index];
  }

  public async queryMobilityRoutes(destination?: string, routeNumber?: string): Promise<MobilityRoute[]> {
    if (routeNumber) {
      const match = MOCK_MOBILITY_ROUTES.filter((r) =>
        r.routeNumber.toLowerCase().includes(routeNumber.toLowerCase())
      );
      if (match.length > 0) return match;
    }

    if (destination) {
      const match = MOCK_MOBILITY_ROUTES.filter(
        (r) =>
          r.destination.toLowerCase().includes(destination.toLowerCase()) ||
          r.stops.some((s) => s.toLowerCase().includes(destination.toLowerCase()))
      );
      if (match.length > 0) return match;
    }

    return MOCK_MOBILITY_ROUTES;
  }

  public async getEmergencyContacts(category?: string): Promise<EmergencyContact[]> {
    if (category) {
      return MOCK_EMERGENCY_CONTACTS.filter(
        (e) => e.category.toLowerCase() === category.toLowerCase()
      );
    }
    return MOCK_EMERGENCY_CONTACTS;
  }
}
