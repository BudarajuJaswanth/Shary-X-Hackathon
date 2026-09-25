import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  LanguageCode,
  Language,
  VoiceState,
  ProviderType,
  ConversationMessage,
  CivicComplaint,
  TicketStatus,
  MobilityRoute,
  EmergencyContact,
  WorkflowStage
} from '../types/civic';
import type { ConversationContext, RequestStatusHistory } from '../domain/models';
import type { IVoiceProvider } from '../services/providers/IVoiceProvider';
import { WebSpeechVoiceProvider } from '../services/providers/WebSpeechVoiceProvider';
import { MockVoiceProvider } from '../services/providers/MockVoiceProvider';
import { SharyXVoiceProvider } from '../services/providers/SharyXVoiceProvider';
import type { ICityServiceProvider } from '../services/cityServices/ICityServiceProvider';
import { MockCityServiceProvider } from '../services/cityServices/MockCityServiceProvider';
import { SharyXCityServiceProvider } from '../services/cityServices/SharyXCityServiceProvider';
import { SupabaseCityServiceProvider } from '../services/cityServices/SupabaseCityServiceProvider';
import { isSupabaseConfigured } from '../services/database/supabaseClient';
import { CivicAIEngine } from '../services/ai/CivicAIEngine';
import { runIntentEngineTestSuite } from '../services/ai/CivicAIEngine.test';
import { TRANSLATIONS } from '../services/translations';
import {
  formatLocalizedComplaintResponse,
  formatLocalizedComplaintCreatedResponse,
  formatLocalizedMobilityRouteResponse,
  formatLocalizedNearbyStopResponse,
  formatLocalizedBusStatusResponse,
  formatLocalizedEmergencyResponse,
  formatLocalizedTrackResultResponse,
  formatLocalizedDefaultHelpResponse
} from '../services/ai/ResponseLocalizer';
import type { IMobilityService } from '../services/mobility/IMobilityService';
import { MockMobilityService } from '../services/mobility/MockMobilityService';
import type { IEmergencyService } from '../services/emergency/IEmergencyService';
import { MockEmergencyService } from '../services/emergency/MockEmergencyService';
import type { Route, EmergencyFacility } from '../domain/models';
import { ToolRegistry } from '../services/tools/ToolRegistry';
import { WorkflowOrchestrator } from '../services/workflow/WorkflowOrchestrator';

interface CivicContextType {
  toolRegistry: ToolRegistry;
  workflowOrchestrator: WorkflowOrchestrator;
  language: LanguageCode;
  fullLanguage: Language;
  setLanguage: (lang: LanguageCode) => void;
  voiceState: VoiceState;
  providerType: ProviderType;
  setProviderType: (provider: ProviderType) => void;
  messages: ConversationMessage[];
  transcript: string;
  workflowStage: WorkflowStage;
  
  verificationDraft: Partial<CivicComplaint> | null;
  setVerificationDraft: React.Dispatch<React.SetStateAction<Partial<CivicComplaint> | null>>;
  isVerificationOpen: boolean;

  toggleListening: () => void;
  sendTextMessage: (text: string) => Promise<void>;
  confirmAndExecuteComplaint: (editedDetails?: Partial<CivicComplaint>) => Promise<void>;
  cancelVerification: () => void;
  trackTicket: (ticketId: string) => Promise<CivicComplaint | null>;
  submitComplaint: (
    complaintData: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ) => Promise<CivicComplaint>;
  updateComplaintStatus: (ticketId: string, status: TicketStatus, note?: string) => Promise<CivicComplaint | null>;
  getRequestStatusHistory: (ticketId: string) => Promise<RequestStatusHistory[]>;

  complaints: CivicComplaint[];
  refreshComplaints: () => Promise<void>;
  activeMobility: MobilityRoute[] | null;
  activeEmergency: EmergencyContact[] | null;
  isMockMode: boolean;
  
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  conversationContext: ConversationContext | null;

  isContinuousVoiceMode: boolean;
  setIsContinuousVoiceMode: (val: boolean) => void;
  toggleContinuousVoiceMode: () => void;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

const LANG_MAP: Record<LanguageCode, Language> = {
  en: 'en-IN',
  ta: 'ta-IN',
  te: 'te-IN'
};

const uniqueId = (prefix = 'msg') => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [providerType, setProviderTypeState] = useState<ProviderType>('WEB_SPEECH');
  const [transcript, setTranscript] = useState('');
  const [_workflowStage, setWorkflowStage] = useState<WorkflowStage>('UNDERSTAND');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  
  const [verificationDraft, setVerificationDraft] = useState<Partial<CivicComplaint> | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const [complaints, setComplaints] = useState<CivicComplaint[]>([]);
  const [activeMobility, setActiveMobility] = useState<MobilityRoute[] | null>(null);
  const [activeEmergency, _setActiveEmergency] = useState<EmergencyContact[] | null>(null);

  const mockCityService = useRef<ICityServiceProvider>(new MockCityServiceProvider());
  const supabaseCityService = useRef<ICityServiceProvider>(new SupabaseCityServiceProvider());
  const cityServiceRef = useRef<ICityServiceProvider>(
    isSupabaseConfigured()
      ? supabaseCityService.current
      : new SharyXCityServiceProvider(mockCityService.current)
  );
  
  const webVoiceProvider = useRef<IVoiceProvider>(new WebSpeechVoiceProvider());
  const mockVoiceProvider = useRef<IVoiceProvider>(new MockVoiceProvider());
  const sharyXVoiceProvider = useRef<IVoiceProvider>(
    new SharyXVoiceProvider(webVoiceProvider.current)
  );

  const activeVoiceProvider = useRef<IVoiceProvider>(webVoiceProvider.current);
  const aiEngine = useRef(new CivicAIEngine());
  const mobilityServiceRef = useRef<IMobilityService>(new MockMobilityService());
  const emergencyServiceRef = useRef<IEmergencyService>(new MockEmergencyService());

  const toolRegistryRef = useRef<ToolRegistry>(
    new ToolRegistry(cityServiceRef.current, mobilityServiceRef.current, emergencyServiceRef.current)
  );
  const workflowOrchestratorRef = useRef<WorkflowOrchestrator>(
    new WorkflowOrchestrator(toolRegistryRef.current)
  );

  useEffect(() => {
    refreshComplaints();
    runIntentEngineTestSuite();

    const t = TRANSLATIONS[language];
    setMessages([
      {
        id: uniqueId('msg_welcome'),
        sender: 'CITYVOICE_AI',
        text: `🙏 **${t.appName}** - ${t.tagline}.\n\nHow can I help you today? You can report a pothole or garbage issue, check live bus schedules, or get emergency assistance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language
      }
    ]);
    initVoiceProvider(providerType, language);
  }, []);

  const refreshComplaints = async () => {
    const data = await cityServiceRef.current.getAllComplaints();
    setComplaints(data);
  };

  const getProviderInstance = (type: ProviderType): IVoiceProvider => {
    switch (type) {
      case 'SHARYX':
        return sharyXVoiceProvider.current;
      case 'MOCK':
        return mockVoiceProvider.current;
      case 'WEB_SPEECH':
      default:
        return webVoiceProvider.current.isAvailable
          ? webVoiceProvider.current
          : mockVoiceProvider.current;
    }
  };

  const [isContinuousVoiceMode, setIsContinuousVoiceMode] = useState<boolean>(true);
  const isContinuousVoiceModeRef = useRef<boolean>(true);

  const toggleContinuousVoiceMode = () => {
    setIsContinuousVoiceMode((prev) => {
      const next = !prev;
      isContinuousVoiceModeRef.current = next;
      return next;
    });
  };

  const prevVoiceStateRef = useRef<VoiceState>('IDLE');

  useEffect(() => {
    const prevState = prevVoiceStateRef.current;
    prevVoiceStateRef.current = voiceState;

    if (prevState === 'SPEAKING' && voiceState === 'IDLE' && isContinuousVoiceModeRef.current) {
      const timer = setTimeout(() => {
        if (activeVoiceProvider.current) {
          activeVoiceProvider.current.startListening();
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [voiceState]);

  const initVoiceProvider = async (type: ProviderType, langCode: LanguageCode) => {
    const provider = getProviderInstance(type);
    activeVoiceProvider.current = provider;

    await provider.initialize({
      language: LANG_MAP[langCode],
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          sendTextMessage(text);
        }
      },
      onStateChange: (state) => setVoiceState(state),
      onError: (err) => {
        console.warn('Voice Provider warning:', err);
      }
    });
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    activeVoiceProvider.current.setLanguage(LANG_MAP[lang]);
  };

  const setProviderType = (type: ProviderType) => {
    setProviderTypeState(type);
    initVoiceProvider(type, language);
  };

  const toggleListening = () => {
    if (voiceState === 'LISTENING' || voiceState === 'TRANSCRIBING') {
      activeVoiceProvider.current.stopListening();
    } else {
      setTranscript('');
      activeVoiceProvider.current.startListening();
    }
  };

  const speakText = (text: string) => {
    activeVoiceProvider.current.speak(text, LANG_MAP[language]);
  };

  const stopSpeaking = () => {
    activeVoiceProvider.current.stopSpeaking();
  };

  const sendTextMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const citizenMsg: ConversationMessage = {
      id: uniqueId('msg_user'),
      sender: 'CITIZEN',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language
    };

    setMessages((prev) => [...prev, citizenMsg]);
    setTranscript('');
    setVoiceState('UNDERSTANDING');
    setWorkflowStage('UNDERSTAND');

    // Multi-turn context processing
    const { intentResult, updatedContext } = await aiEngine.current.processUtterance(
      userText,
      language,
      conversationContext || undefined
    );

    setConversationContext(updatedContext);

    // If clarification question is required due to missing info or low confidence
    if (intentResult.clarificationQuestion && intentResult.confidence < 0.65) {
      const responseText = intentResult.clarificationQuestion;
      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language
      };
      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('IDLE');
      speakText(responseText);
      return;
    }

    // Handle Complaint Registration Intents
    if (intentResult.intent.includes('COMPLAINT')) {
      const cat = intentResult.entities.complaintType || 'POTHOLE';
      const loc = intentResult.entities.location || intentResult.entities.landmark || 'City Main Area';

      setVoiceState('CONFIRMING');
      setWorkflowStage('VERIFY');
      setVerificationDraft({
        category: cat as any,
        title: `${cat.replace('_', ' ')} Hazard`,
        location: loc,
        landmark: intentResult.entities.landmark,
        description: userText,
        priority: intentResult.entities.urgency || 'HIGH'
      });
      setIsVerificationOpen(true);

      const responseText = formatLocalizedComplaintResponse(cat, loc, language);

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        actionRequired: true
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      speakText(responseText);
    } else if (intentResult.intent === 'MOBILITY_ROUTE') {
      const origin = intentResult.entities.origin || 'Ambattur';
      const destination = intentResult.entities.destination || 'Chennai Central';

      const routes = await mobilityServiceRef.current.getRoutes(origin, destination);
      const mainRoute = routes[0];
      const optionCount = mainRoute ? mainRoute.options.length : 0;

      const updatedCtx: ConversationContext = {
        ...updatedContext,
        accumulatedEntities: {
          ...updatedContext.accumulatedEntities,
          origin,
          destination,
          lastMobilityRoutes: routes
        }
      };
      setConversationContext(updatedCtx);

      const legacyRoutes: MobilityRoute[] = mainRoute
        ? mainRoute.options.map((opt) => ({
            routeNumber: opt.routeNumber,
            origin: opt.origin,
            destination: opt.destination,
            estimatedDurationMinutes: opt.durationMinutes,
            nextDepartureTime: opt.nextDeparture,
            etaMinutes: opt.eta.minutes,
            fare: opt.fare,
            busType: opt.busType as any,
            stops: opt.stops,
            liveStatus: opt.vehicle?.status === 'DELAYED' ? 'DELAYED' : opt.vehicle?.status === 'APPROACHING' ? 'APPROACHING' : 'ON_TIME',
            vehicleLocation: opt.vehicle
              ? {
                  lat: 13.0827,
                  lng: 80.2707,
                  currentStop: opt.vehicle.currentStop || 'En route'
                }
              : undefined
          }))
        : [];
      setActiveMobility(legacyRoutes);

      const responseText = formatLocalizedMobilityRouteResponse(
        origin,
        destination,
        optionCount,
        mainRoute?.options[0]?.durationMinutes || 38,
        language
      );

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        mobilityRouteData: routes,
        mobilityData: legacyRoutes
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (intentResult.intent === 'MOBILITY_NEARBY_STOP') {
      const area = intentResult.entities.location || intentResult.entities.origin || conversationContext?.accumulatedEntities.origin || 'Ambattur';
      const stops = await mobilityServiceRef.current.getNearbyStops(area);

      const updatedCtx: ConversationContext = {
        ...updatedContext,
        accumulatedEntities: {
          ...updatedContext.accumulatedEntities,
          location: area
        }
      };
      setConversationContext(updatedCtx);

      const responseText = formatLocalizedNearbyStopResponse(
        area,
        stops[0]?.name || 'Ambattur Bus Stop',
        stops[0]?.walkingMinutes || 3,
        stops.length,
        language
      );

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        mobilityStopsData: stops
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (intentResult.intent === 'MOBILITY_BUS_STATUS') {
      const destination = intentResult.entities.destination || conversationContext?.accumulatedEntities.destination || 'Chennai Central';

      const vehicles = await mobilityServiceRef.current.getBusStatus(undefined, destination);
      const firstVeh = vehicles[0];

      const responseText = formatLocalizedBusStatusResponse(
        destination,
        firstVeh ? firstVeh.vehicleNumber : 'M92',
        firstVeh?.currentStop || 'Padi Junction',
        firstVeh?.status.replace('_', ' ') || 'ON TIME',
        language
      );

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        mobilityVehicleData: vehicles
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (intentResult.intent === 'MOBILITY_ETA') {
      const lastRoutes = (conversationContext?.accumulatedEntities.lastMobilityRoutes as Route[] | undefined) || (updatedContext.accumulatedEntities.lastMobilityRoutes as Route[] | undefined);
      const routeIdx = intentResult.entities.routeIndex;

      let responseText = '';
      if (lastRoutes && lastRoutes.length > 0 && lastRoutes[0].options.length > 0) {
        const options = lastRoutes[0].options;
        if (routeIdx !== undefined && options[routeIdx]) {
          const selected = options[routeIdx];
          responseText = `The ${routeIdx === 0 ? 'first' : routeIdx === 1 ? 'second' : 'third'} route (**${selected.routeNumber}** - ${selected.title}) takes approximately **${selected.durationMinutes} minutes** (${selected.stopsCount} stops, ${selected.walkingDistanceMinutes} min walk).`;
        } else if (userText.toLowerCase().includes('faster')) {
          const sorted = [...options].sort((a, b) => a.durationMinutes - b.durationMinutes);
          const fastest = sorted[0];
          responseText = `Yes! Route **${fastest.routeNumber}** (${fastest.title}) is the fastest option, taking approximately **${fastest.durationMinutes} minutes**.`;
        } else {
          const defaultOpt = options[0];
          responseText = `The estimated travel time from ${defaultOpt.origin} to ${defaultOpt.destination} via Route **${defaultOpt.routeNumber}** is **${defaultOpt.durationMinutes} minutes**.`;
        }
      } else {
        const origin = intentResult.entities.origin || conversationContext?.accumulatedEntities.origin || 'Ambattur';
        const destination = intentResult.entities.destination || conversationContext?.accumulatedEntities.destination || 'Chennai Central';
        const etaObj = await mobilityServiceRef.current.getETA('M92', origin, destination);
        responseText = `Estimated travel time to ${destination} is approximately **${etaObj?.minutes || 42} minutes** (${etaObj?.trafficCondition.toLowerCase() || 'moderate'} traffic condition).`;
      }

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (intentResult.intent === 'EMERGENCY_HOSPITAL' || intentResult.intent === 'EMERGENCY_POLICE' || intentResult.intent === 'EMERGENCY_FIRE') {
      const type = intentResult.intent === 'EMERGENCY_HOSPITAL' ? 'HOSPITAL' : intentResult.intent === 'EMERGENCY_POLICE' ? 'POLICE' : 'FIRE_STATION';
      const area = intentResult.entities.location || intentResult.entities.origin || conversationContext?.accumulatedEntities.location || 'Ambattur';

      const facilities = await emergencyServiceRef.current.findNearbyFacilities(type, area);
      const topFacility = facilities[0];

      const updatedCtx: ConversationContext = {
        ...updatedContext,
        accumulatedEntities: {
          ...updatedContext.accumulatedEntities,
          facilityType: type,
          lastEmergencyFacilities: facilities,
          selectedFacility: topFacility
        }
      };
      setConversationContext(updatedCtx);

      const responseText = formatLocalizedEmergencyResponse(
        type,
        area,
        facilities.length,
        topFacility?.name || 'Emergency Center',
        topFacility?.distanceKm || 1.2,
        language
      );

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        emergencyFacilityData: facilities
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (
      userText.toLowerCase().includes('which one is closest') ||
      userText.toLowerCase().includes('what\'s the phone number') ||
      userText.toLowerCase().includes('phone number') ||
      userText.toLowerCase().includes('contact number')
    ) {
      const lastFacilities = (conversationContext?.accumulatedEntities.lastEmergencyFacilities as EmergencyFacility[] | undefined) || (updatedContext.accumulatedEntities.lastEmergencyFacilities as EmergencyFacility[] | undefined);
      let responseText = '';

      if (lastFacilities && lastFacilities.length > 0) {
        const top = lastFacilities[0];
        if (userText.toLowerCase().includes('phone') || userText.toLowerCase().includes('contact')) {
          responseText = `The helpline contact number for **${top.name}** is **${top.phone}**.`;
        } else {
          responseText = `The closest emergency facility is **${top.name}** located **${top.distanceKm} km away** at ${top.address}.`;
        }
      } else {
        responseText = `I can help you find emergency hospitals, police stations, or fire departments. Which service do you need?`;
      }

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        emergencyFacilityData: lastFacilities
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (
      intentResult.intent === 'TRACK_REQUEST' ||
      intentResult.intent === 'LIST_REQUESTS' ||
      intentResult.intent === 'OPEN_REQUESTS' ||
      intentResult.intent === 'RESOLVED_REQUESTS' ||
      intentResult.intent === 'REQUEST_DETAILS'
    ) {
      const allComplaints = await cityServiceRef.current.getAllComplaints();
      const lowerInput = userText.toLowerCase();

      // Case A: Explicit Ticket ID match
      if (intentResult.entities.requestId) {
        const target = await cityServiceRef.current.getComplaintByTicketId(intentResult.entities.requestId);
        if (target) {
          const updatedCtx: ConversationContext = {
            ...updatedContext,
            accumulatedEntities: {
              ...updatedContext.accumulatedEntities,
              selectedComplaint: target
            }
          };
          setConversationContext(updatedCtx);

          const responseText = formatLocalizedTrackResultResponse(target, language);
          const aiResponseMsg: ConversationMessage = {
            id: uniqueId('msg_ai'),
            sender: 'CITYVOICE_AI',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language,
            ticketData: target
          };

          setMessages((prev) => [...prev, aiResponseMsg]);
          setVoiceState('SUCCESS');
          setWorkflowStage('COMPLETED');
          speakText(responseText);
          return;
        } else {
          const responseText = `I couldn't find any request matching Ticket ID **${intentResult.entities.requestId}**. Please check the reference code.`;
          const aiResponseMsg: ConversationMessage = {
            id: uniqueId('msg_ai'),
            sender: 'CITYVOICE_AI',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language
          };

          setMessages((prev) => [...prev, aiResponseMsg]);
          setVoiceState('SUCCESS');
          setWorkflowStage('COMPLETED');
          speakText(responseText);
          return;
        }
      }

      // Case B: Follow-up conversational question on previously selected complaint
      const prevSelected = (conversationContext?.accumulatedEntities.selectedComplaint as CivicComplaint | undefined) || (updatedContext.accumulatedEntities.selectedComplaint as CivicComplaint | undefined);
      if (prevSelected && (lowerInput.includes('when did i submit') || lowerInput.includes('when did i report') || lowerInput.includes('is it resolved') || lowerInput.includes('what department'))) {
        let responseText = '';
        if (lowerInput.includes('when did i')) {
          responseText = `Complaint **${prevSelected.ticketId}** was submitted on ${new Date(prevSelected.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}.`;
        } else if (lowerInput.includes('is it resolved')) {
          responseText = prevSelected.status === 'RESOLVED' || prevSelected.status === 'CLOSED'
            ? `Yes, complaint **${prevSelected.ticketId}** is resolved.`
            : `No, complaint **${prevSelected.ticketId}** is currently **${prevSelected.status.replace('_', ' ')}**.`;
        } else {
          responseText = `Complaint **${prevSelected.ticketId}** is assigned to **${prevSelected.assignedDepartment}**.`;
        }

        const aiResponseMsg: ConversationMessage = {
          id: uniqueId('msg_ai'),
          sender: 'CITYVOICE_AI',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
          ticketData: prevSelected
        };

        setMessages((prev) => [...prev, aiResponseMsg]);
        setVoiceState('SUCCESS');
        setWorkflowStage('COMPLETED');
        speakText(responseText);
        return;
      }

      // Case C: "Last Complaint" interpretation
      if (lowerInput.includes('last complaint') || lowerInput.includes('last request') || lowerInput.includes('most recent')) {
        if (allComplaints.length === 0) {
          const responseText = "I couldn't find any previous requests. Would you like to report a new problem?";
          const aiResponseMsg: ConversationMessage = {
            id: uniqueId('msg_ai'),
            sender: 'CITYVOICE_AI',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language
          };
          setMessages((prev) => [...prev, aiResponseMsg]);
          setVoiceState('SUCCESS');
          speakText(responseText);
          return;
        }

        const sorted = [...allComplaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastComplaint = sorted[0];

        const updatedCtx: ConversationContext = {
          ...updatedContext,
          accumulatedEntities: {
            ...updatedContext.accumulatedEntities,
            selectedComplaint: lastComplaint
          }
        };
        setConversationContext(updatedCtx);

        const responseText = `Your most recent complaint **${lastComplaint.ticketId}** (${lastComplaint.category.replace('_', ' ')}) submitted on ${new Date(lastComplaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} is currently **${lastComplaint.status.replace('_', ' ')}**.`;

        const aiResponseMsg: ConversationMessage = {
          id: uniqueId('msg_ai'),
          sender: 'CITYVOICE_AI',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
          ticketData: lastComplaint
        };

        setMessages((prev) => [...prev, aiResponseMsg]);
        setVoiceState('SUCCESS');
        setWorkflowStage('COMPLETED');
        speakText(responseText);
        return;
      }

      // Case D: Category specific search (e.g. "my pothole complaint") with Disambiguation!
      const catKeywords = ['pothole', 'garbage', 'trash', 'streetlight', 'water', 'road'];
      const matchedCatKey = catKeywords.find((k) => lowerInput.includes(k));
      
      if (matchedCatKey) {
        const catUpper = matchedCatKey === 'water' ? 'WATER_LEAKAGE' : matchedCatKey === 'road' ? 'ROAD_DAMAGE' : matchedCatKey.toUpperCase();
        const matchingComplaints = allComplaints.filter((c) => c.category === catUpper || c.title.toLowerCase().includes(matchedCatKey) || c.description.toLowerCase().includes(matchedCatKey));

        if (matchingComplaints.length === 1) {
          const single = matchingComplaints[0];
          const updatedCtx: ConversationContext = {
            ...updatedContext,
            accumulatedEntities: {
              ...updatedContext.accumulatedEntities,
              selectedComplaint: single
            }
          };
          setConversationContext(updatedCtx);

          const responseText = `Your ${single.category.toLowerCase().replace('_', ' ')} complaint **${single.ticketId}** near ${single.location} is currently **${single.status.replace('_', ' ')}**.`;

          const aiResponseMsg: ConversationMessage = {
            id: uniqueId('msg_ai'),
            sender: 'CITYVOICE_AI',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language,
            ticketData: single
          };

          setMessages((prev) => [...prev, aiResponseMsg]);
          setVoiceState('SUCCESS');
          setWorkflowStage('COMPLETED');
          speakText(responseText);
          return;
        } else if (matchingComplaints.length > 1) {
          // Disambiguation Prompt
          const locationsList = matchingComplaints.slice(0, 3).map((c) => `the one near ${c.location}`).join(' or ');
          const responseText = `I found ${matchingComplaints.length} ${matchedCatKey} complaints. Do you mean ${locationsList}?`;

          const updatedCtx: ConversationContext = {
            ...updatedContext,
            accumulatedEntities: {
              ...updatedContext.accumulatedEntities,
              candidateComplaints: matchingComplaints
            }
          };
          setConversationContext(updatedCtx);

          const aiResponseMsg: ConversationMessage = {
            id: uniqueId('msg_ai'),
            sender: 'CITYVOICE_AI',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language
          };

          setMessages((prev) => [...prev, aiResponseMsg]);
          setVoiceState('SUCCESS');
          setWorkflowStage('COMPLETED');
          speakText(responseText);
          return;
        }
      }

      // Case E: Filtering (OPEN / RESOLVED / ALL)
      let filtered = allComplaints;
      if (intentResult.intent === 'OPEN_REQUESTS') {
        filtered = allComplaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED');
      } else if (intentResult.intent === 'RESOLVED_REQUESTS') {
        filtered = allComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');
      }

      if (filtered.length === 0) {
        const responseText = `No ${intentResult.intent === 'OPEN_REQUESTS' ? 'open' : intentResult.intent === 'RESOLVED_REQUESTS' ? 'resolved' : ''} requests found in your record.`;
        const aiResponseMsg: ConversationMessage = {
          id: uniqueId('msg_ai'),
          sender: 'CITYVOICE_AI',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language
        };
        setMessages((prev) => [...prev, aiResponseMsg]);
        setVoiceState('SUCCESS');
        speakText(responseText);
        return;
      }

      const topItem = filtered[0];
      const responseText = `You have ${filtered.length} ${intentResult.intent === 'OPEN_REQUESTS' ? 'open' : intentResult.intent === 'RESOLVED_REQUESTS' ? 'resolved' : ''} requests. The latest is **${topItem.ticketId}** (${topItem.title}) - Status: **${topItem.status.replace('_', ' ')}**.`;

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        ticketData: topItem
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else {
      const responseText = formatLocalizedDefaultHelpResponse(language);
      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    }
  };

  const confirmAndExecuteComplaint = async (editedDetails?: Partial<CivicComplaint>) => {
    const finalDetails = { ...(verificationDraft || {}), ...(editedDetails || {}) };
    setVoiceState('EXECUTING');
    setWorkflowStage('EXECUTE');

    const ticket = await cityServiceRef.current.submitComplaint({
      category: finalDetails.category || 'POTHOLE',
      title: finalDetails.title || 'Civic Infrastructure Concern',
      description: finalDetails.description || 'Reported via CityVoice AI',
      location: finalDetails.location || 'General City Area',
      landmark: finalDetails.landmark || '',
      priority: finalDetails.priority || 'HIGH',
      estimatedResolutionHours: finalDetails.category === 'POTHOLE' ? 24 : 48,
      assignedDepartment: 'Municipal Works Division',
      language,
      photoUrl: finalDetails.photoUrl
    });

    await refreshComplaints();
    setIsVerificationOpen(false);
    setVerificationDraft(null);
    setWorkflowStage('CONFIRM');

    const confirmationText = formatLocalizedComplaintCreatedResponse(
      ticket.ticketId,
      ticket.assignedDepartment,
      ticket.estimatedResolutionHours,
      language
    );

    const confirmMsg: ConversationMessage = {
      id: uniqueId('msg_confirm'),
      sender: 'CITYVOICE_AI',
      text: `✅ **Ticket Registered Successfully!**\n\n- **Reference ID**: \`${ticket.ticketId}\`\n- **Category**: ${ticket.category}\n- **Location**: ${ticket.location}\n- **Assigned Dept**: ${ticket.assignedDepartment}\n- **SLA**: ${ticket.estimatedResolutionHours} Hours`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
      ticketData: ticket
    };

    setMessages((prev) => [...prev, confirmMsg]);
    setVoiceState('SUCCESS');
    speakText(confirmationText);
    setWorkflowStage('COMPLETED');
  };

  const cancelVerification = () => {
    setIsVerificationOpen(false);
    setVerificationDraft(null);
    setVoiceState('IDLE');
    setWorkflowStage('COMPLETED');
  };

  const trackTicket = async (ticketId: string): Promise<CivicComplaint | null> => {
    return await cityServiceRef.current.getComplaintByTicketId(ticketId);
  };

  const submitComplaint = async (
    complaintData: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<CivicComplaint> => {
    const ticket = await cityServiceRef.current.submitComplaint(complaintData);
    await refreshComplaints();
    return ticket;
  };

  const updateComplaintStatus = async (
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<CivicComplaint | null> => {
    const res = await cityServiceRef.current.updateComplaintStatus(ticketId, status, note);
    await refreshComplaints();
    return res;
  };

  const getRequestStatusHistory = async (ticketId: string): Promise<RequestStatusHistory[]> => {
    return await cityServiceRef.current.getRequestStatusHistory(ticketId);
  };

  return (
    <CivicContext.Provider
      value={{
        toolRegistry: toolRegistryRef.current,
        workflowOrchestrator: workflowOrchestratorRef.current,
        language,
        fullLanguage: LANG_MAP[language],
        setLanguage,
        voiceState,
        providerType,
        setProviderType,
        messages,
        transcript,
        workflowStage: _workflowStage,
        verificationDraft,
        setVerificationDraft,
        isVerificationOpen,
        toggleListening,
        sendTextMessage,
        confirmAndExecuteComplaint,
        cancelVerification,
        trackTicket,
        submitComplaint,
        updateComplaintStatus,
        getRequestStatusHistory,
        complaints,
        refreshComplaints,
        activeMobility,
        activeEmergency,
        isMockMode: cityServiceRef.current.isMock,
        speakText,
        stopSpeaking,
        conversationContext,
        isContinuousVoiceMode,
        setIsContinuousVoiceMode,
        toggleContinuousVoiceMode
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivicContext = () => {
  const ctx = useContext(CivicContext);
  if (!ctx) throw new Error('useCivicContext must be used within a CivicProvider');
  return ctx;
};
