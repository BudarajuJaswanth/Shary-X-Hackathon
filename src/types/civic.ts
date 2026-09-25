export type Language = 'en-IN' | 'ta-IN' | 'te-IN';

export type LanguageCode = 'en' | 'ta' | 'te';

export type ProviderType = 'MOCK' | 'SHARYX' | 'WEB_SPEECH' | 'SUPABASE';

export type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'UNDERSTANDING'
  | 'CONFIRMING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'SUCCESS'
  | 'ERROR';

export type WorkflowStage = 'UNDERSTAND' | 'VERIFY' | 'EXECUTE' | 'CONFIRM' | 'COMPLETED';

export type ComplaintCategory = 'POTHOLE' | 'GARBAGE' | 'STREETLIGHT' | 'WATER_LEAKAGE' | 'ROAD_DAMAGE' | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus = 'SUBMITTED' | 'REGISTERED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export type MicPermissionStatus = 'PROMPT' | 'GRANTED' | 'DENIED' | 'UNSUPPORTED';

export interface CivicComplaint {
  id: string;
  ticketId: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  location: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  priority: ComplaintPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  estimatedResolutionHours: number;
  assignedDepartment: string;
  citizenPhone?: string;
  photoUrl?: string;
  audioNoteUrl?: string;
  language: LanguageCode;
}

export interface MobilityRoute {
  routeNumber: string;
  origin: string;
  destination: string;
  nextDepartureTime: string;
  etaMinutes: number;
  fare: string;
  busType: 'AC Volvo' | 'Electric Express' | 'Ordinary Bus' | 'Metro Feeder';
  stops: string[];
  liveStatus: 'ON_TIME' | 'DELAYED' | 'APPROACHING';
  vehicleLocation?: {
    lat: number;
    lng: number;
    currentStop: string;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  category: 'POLICE' | 'AMBULANCE' | 'FIRE' | 'DISASTER' | 'WOMEN_HELPLINE';
  phone: string;
  distanceKm?: number;
  address?: string;
  available24x7: boolean;
}

export interface AIIntentResult {
  intent: 'CREATE_COMPLAINT' | 'QUERY_MOBILITY' | 'EMERGENCY_HELP' | 'TRACK_COMPLAINT' | 'UNKNOWN';
  confidence: number;
  complaintDetails?: Partial<CivicComplaint>;
  mobilityQuery?: {
    destination?: string;
    origin?: string;
    routeNumber?: string;
  };
  trackingId?: string;
  missingParameters?: string[];
  rawTranscript: string;
  translatedText?: string;
  detectedLanguage: LanguageCode;
  spokenResponseText: string;
  displayMarkdown: string;
}

import type { Route, TransitStop, TransitVehicle, EmergencyFacility } from '../domain/models';

export interface ConversationMessage {
  id: string;
  sender: 'CITIZEN' | 'CITYVOICE_AI';
  text: string;
  timestamp: string;
  language: LanguageCode;
  actionRequired?: boolean;
  intentResult?: AIIntentResult;
  ticketData?: CivicComplaint;
  mobilityData?: MobilityRoute[];
  mobilityRouteData?: Route[];
  mobilityStopsData?: TransitStop[];
  mobilityVehicleData?: TransitVehicle[];
  emergencyData?: EmergencyContact[];
  emergencyFacilityData?: EmergencyFacility[];
}
