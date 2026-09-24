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
import type { ConversationContext } from '../domain/models';
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

interface CivicContextType {
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

  complaints: CivicComplaint[];
  refreshComplaints: () => Promise<void>;
  activeMobility: MobilityRoute[] | null;
  activeEmergency: EmergencyContact[] | null;
  isMockMode: boolean;
  
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  conversationContext: ConversationContext | null;
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
  const [activeEmergency, setActiveEmergency] = useState<EmergencyContact[] | null>(null);

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

      const responseText = `Extracted ${cat} complaint near ${loc}. Please review the verification card before we register your ticket.`;

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
    } else if (intentResult.intent.startsWith('MOBILITY')) {
      const destination = intentResult.entities.destination || 'Central Station';
      const routes = await cityServiceRef.current.queryMobilityRoutes(destination);
      setActiveMobility(routes);

      const responseText = `Found live bus schedules heading towards ${destination}. Next bus arrives shortly.`;

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        mobilityData: routes
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (intentResult.intent.startsWith('EMERGENCY')) {
      const emergencies = await cityServiceRef.current.getEmergencyContacts();
      setActiveEmergency(emergencies);

      const responseText = `Emergency dispatch lines activated for ${intentResult.intent.replace('EMERGENCY_', '')}. Direct helplines connected.`;

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        emergencyData: emergencies
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else if (intentResult.intent === 'TRACK_REQUEST') {
      const ticketId = intentResult.entities.requestId || 'MUNI-2026-8942';
      const ticket = await cityServiceRef.current.getComplaintByTicketId(ticketId);

      const responseText = ticket
        ? `Status for Ticket ${ticket.ticketId}: ${ticket.status}. Assigned to ${ticket.assignedDepartment}.`
        : `No ticket found with ID ${ticketId}. Please check the reference code.`;

      const aiResponseMsg: ConversationMessage = {
        id: uniqueId('msg_ai'),
        sender: 'CITYVOICE_AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        ticketData: ticket || undefined
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setVoiceState('SUCCESS');
      setWorkflowStage('COMPLETED');
      speakText(responseText);
    } else {
      const responseText = 'I can help you report potholes or garbage, check bus schedules, or connect to emergency dispatch. What would you like to do?';
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

    const confirmationText = `Ticket ${ticket.ticketId} has been registered! Estimated resolution within ${ticket.estimatedResolutionHours} hours.`;

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

  return (
    <CivicContext.Provider
      value={{
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
        complaints,
        refreshComplaints,
        activeMobility,
        activeEmergency,
        isMockMode: cityServiceRef.current.isMock,
        speakText,
        stopSpeaking,
        conversationContext
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
