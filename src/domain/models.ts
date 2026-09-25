import type { VoiceState } from '../types/civic';

export type VoiceConnectionStatus = VoiceState;

export type SupportedIntentName =
  | 'POTHOLE_COMPLAINT'
  | 'GARBAGE_COMPLAINT'
  | 'STREETLIGHT_COMPLAINT'
  | 'WATER_LEAKAGE_COMPLAINT'
  | 'ROAD_DAMAGE_COMPLAINT'
  | 'MOBILITY_ROUTE'
  | 'MOBILITY_NEARBY_STOP'
  | 'MOBILITY_BUS_STATUS'
  | 'MOBILITY_ETA'
  | 'MOBILITY_STOP_SEARCH'
  | 'EMERGENCY_HOSPITAL'
  | 'EMERGENCY_POLICE'
  | 'EMERGENCY_FIRE'
  | 'TRACK_REQUEST'
  | 'LIST_REQUESTS'
  | 'REQUEST_DETAILS'
  | 'OPEN_REQUESTS'
  | 'RESOLVED_REQUESTS'
  | 'GENERAL_CITY_INFORMATION'
  | 'AFFIRMATIVE_CONFIRM'
  | 'NEGATIVE_CANCEL'
  | 'UNKNOWN';

export interface ExtractedEntities {
  location?: string;
  landmark?: string;
  destination?: string;
  source?: string;
  origin?: string;
  complaintType?: string;
  description?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestId?: string;
  routeNumber?: string;
  selectedRouteIndex?: number;
  ordinalReference?: string;
  routeIndex?: number;
  lastMobilityRoutes?: any;
  facilityType?: EmergencyFacilityType;
  lastEmergencyFacilities?: EmergencyFacility[];
  selectedFacility?: EmergencyFacility;
  filterStatus?: string;
  searchQuery?: string;
  candidateComplaints?: any[];
  selectedComplaint?: any;
}

export interface IntentObject {
  intent: SupportedIntentName;
  confidence: number;
  entities: ExtractedEntities;
  missingInformation: string[];
  requiredConfirmation: boolean;
  suggestedWorkflow: string;
  clarificationQuestion?: string;
  rawInput: string;
}

export interface ConversationContext {
  sessionId: string;
  citizenId?: string;
  activeLanguage: 'en-IN' | 'ta-IN' | 'te-IN';
  currentIntent?: SupportedIntentName;
  currentWorkflow?: string;
  selectedTool?: string;
  pendingIntent?: IntentObject;
  pendingConfirmation?: IntentObject & { idempotencyToken?: string };
  lastToolResult?: any;
  accumulatedEntities: ExtractedEntities;
  turns: ConversationTurn[];
  lastUpdated: string;
}

export interface ConversationTurn {
  id: string;
  timestamp: string;
  userInput: string;
  systemResponse: string;
  detectedIntent: SupportedIntentName;
  entities: ExtractedEntities;
}

export interface Citizen {
  id: string;
  phoneNumber?: string;
  name?: string;
  preferredLanguage: 'en-IN' | 'ta-IN' | 'te-IN';
  locationPermissionGranted: boolean;
  lastKnownLocation?: Location;
}

export interface Location {
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  cityArea?: string;
}

export interface Conversation {
  id: string;
  citizenId: string;
  startedAt: string;
  updatedAt: string;
  activeLanguage: 'en-IN' | 'ta-IN' | 'te-IN';
  messages: Message[];
  activeWorkflowId?: string;
  voiceSessionId?: string;
  context?: ConversationContext;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'CITIZEN' | 'CITYVOICE_AI' | 'SYSTEM';
  content: string;
  timestamp: string;
  intent?: IntentObject;
  toolCalls?: ToolExecution[];
  audioUrl?: string;
  isSpoken: boolean;
}

export type ComplaintStatus = 'REGISTERED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type ComplaintCategory = 'POTHOLE' | 'GARBAGE' | 'STREETLIGHT' | 'WATER_LEAKAGE' | 'ROAD_DAMAGE' | 'OTHER';

export interface Complaint {
  id: string;
  ticketId: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  location: Location;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  estimatedResolutionHours: number;
  assignedDepartment: string;
  photoUrl?: string;
  audioNoteUrl?: string;
}

export interface TransitStop {
  id: string;
  name: string;
  cityArea: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  walkingMinutes?: number;
}

export interface TransitVehicle {
  id: string;
  vehicleNumber: string;
  busType: 'AC Volvo' | 'Electric Express' | 'Ordinary Bus' | 'Metro Feeder' | 'Express Bus';
  currentStop?: string;
  status: 'ON_TIME' | 'DELAYED' | 'APPROACHING';
}

export interface ETA {
  minutes: number;
  estimatedArrival: string;
  trafficCondition: 'LIGHT' | 'MODERATE' | 'HEAVY';
}

export interface TransitOption {
  id: string;
  routeNumber: string;
  title: string;
  origin: string;
  destination: string;
  durationMinutes: number;
  stopsCount: number;
  walkingDistanceMinutes: number;
  fare: string;
  busType: 'AC Volvo' | 'Electric Express' | 'Ordinary Bus' | 'Metro Feeder' | 'Express Bus';
  nextDeparture: string;
  eta: ETA;
  stops: string[];
  vehicle?: TransitVehicle;
  isRecommended?: boolean;
  isDemoData?: boolean;
}

export interface Route {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  options: TransitOption[];
}

export interface MobilityRequest {
  id: string;
  origin?: string;
  destination?: string;
  busRouteNumber?: string;
  requestedAt: string;
  isMockDemoData?: boolean;
}

export type EmergencyFacilityType = 'HOSPITAL' | 'POLICE' | 'FIRE_STATION';

export interface EmergencyFacility {
  id: string;
  name: string;
  type: EmergencyFacilityType;
  address: string;
  cityArea: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string;
  available24x7: boolean;
  services: string[];
  isDemoData: boolean;
}

export interface RequestStatusHistory {
  id: string;
  requestId: string;
  status: 'SUBMITTED' | 'REGISTERED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  timestamp: string;
  note?: string;
  updatedByDepartment?: string;
}

export interface EmergencyRequest {
  id: string;
  category: 'POLICE' | 'AMBULANCE' | 'FIRE' | 'DISASTER' | 'WOMEN_HELPLINE';
  location: Location;
  description?: string;
  severity: 'HIGH' | 'CRITICAL';
  requestedAt: string;
}

export type CivicRequestType = 'COMPLAINT' | 'MOBILITY' | 'EMERGENCY' | 'TRACKING';

export interface CivicRequest {
  id: string;
  type: CivicRequestType;
  citizenId: string;
  complaint?: Complaint;
  mobility?: MobilityRequest;
  emergency?: EmergencyRequest;
  createdAt: string;
}

export interface CityService {
  id: string;
  name: string;
  department: string;
  isAvailable: boolean;
  contactNumber: string;
  serviceCategory: string;
}

export type WorkflowStage = 'UNDERSTAND' | 'VERIFY' | 'EXECUTE' | 'CONFIRM' | 'COMPLETED' | 'CANCELLED';

export interface Workflow {
  id: string;
  name: string;
  stage: WorkflowStage;
  extractedParameters: Record<string, any>;
  missingParameters: string[];
  requiredTools: string[];
  startedAt: string;
}

export interface ToolExecution {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  executedAt: string;
}

export interface Tool {
  name: string;
  description: string;
  parametersSchema: Record<string, any>;
  execute(params: Record<string, any>): Promise<any>;
}

export interface VoiceSession {
  id: string;
  status: VoiceState;
  startedAt: string;
  language: 'en-IN' | 'ta-IN' | 'te-IN';
  transcriptBuffer: string;
  isAudioStreaming: boolean;
  errorMessage?: string;
}
