import type { IAIEngine } from './IAIEngine';
import type {
  IntentObject,
  ConversationContext,
  SupportedIntentName,
  ExtractedEntities
} from '../../domain/models';
import type { LanguageCode } from '../../types/civic';

export class CivicAIEngine implements IAIEngine {
  public name = 'Deterministic Multilingual Context Engine';

  public async processUtterance(
    transcript: string,
    currentLanguage: LanguageCode,
    context?: ConversationContext
  ): Promise<{ intentResult: IntentObject; updatedContext: ConversationContext }> {
    const rawInput = transcript.trim();
    const lower = rawInput.toLowerCase();

    // Initialize or clone context
    const currentCtx: ConversationContext = context || {
      sessionId: 'sess_' + Date.now(),
      activeLanguage: currentLanguage === 'ta' ? 'ta-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-IN',
      accumulatedEntities: {},
      turns: [],
      lastUpdated: new Date().toISOString()
    };

    // 1. Check for Affirmative / Negative response to pending intent
    if (currentCtx.pendingIntent) {
      if (this.isAffirmative(lower)) {
        const confirmedIntent: IntentObject = {
          ...currentCtx.pendingIntent,
          intent: currentCtx.pendingIntent.intent,
          confidence: 1.0,
          requiredConfirmation: false,
          rawInput
        };

        const updatedCtx: ConversationContext = {
          ...currentCtx,
          pendingIntent: undefined,
          lastUpdated: new Date().toISOString()
        };

        return { intentResult: confirmedIntent, updatedContext: updatedCtx };
      }

      if (this.isNegative(lower)) {
        const cancelledIntent: IntentObject = {
          intent: 'NEGATIVE_CANCEL',
          confidence: 1.0,
          entities: {},
          missingInformation: [],
          requiredConfirmation: false,
          suggestedWorkflow: 'NONE',
          rawInput
        };

        const updatedCtx: ConversationContext = {
          ...currentCtx,
          pendingIntent: undefined,
          lastUpdated: new Date().toISOString()
        };

        return { intentResult: cancelledIntent, updatedContext: updatedCtx };
      }
    }

    // 2. Parse raw utterance for new intent & entities
    const parsedIntent = this.classifyUtterance(rawInput, lower, currentLanguage);

    // Merge entities with context memory
    const mergedEntities: ExtractedEntities = {
      ...currentCtx.accumulatedEntities,
      ...parsedIntent.entities
    };

    // Evaluate missing required information
    const missingInfo: string[] = [];
    if (
      [
        'POTHOLE_COMPLAINT',
        'GARBAGE_COMPLAINT',
        'STREETLIGHT_COMPLAINT',
        'WATER_LEAKAGE_COMPLAINT',
        'ROAD_DAMAGE_COMPLAINT'
      ].includes(parsedIntent.intent)
    ) {
      if (!mergedEntities.location && !mergedEntities.landmark) {
        missingInfo.push('location');
      }
    }

    let confidence = parsedIntent.confidence;
    let clarificationQuestion: string | undefined = undefined;

    // Confidence / Missing Info Handling
    if (missingInfo.length > 0) {
      confidence = Math.min(confidence, 0.6);
      clarificationQuestion = this.getClarificationQuestion(missingInfo[0], currentLanguage);
    } else if (confidence < 0.65 && parsedIntent.intent !== 'UNKNOWN') {
      clarificationQuestion = this.getLowConfidenceQuestion(parsedIntent.intent, currentLanguage);
    }

    const finalIntent: IntentObject = {
      intent: parsedIntent.intent,
      confidence,
      entities: mergedEntities,
      missingInformation: missingInfo,
      requiredConfirmation: parsedIntent.requiredConfirmation,
      suggestedWorkflow: parsedIntent.suggestedWorkflow,
      clarificationQuestion,
      rawInput
    };

    // Update context memory
    const updatedCtx: ConversationContext = {
      ...currentCtx,
      pendingIntent: missingInfo.length === 0 && finalIntent.requiredConfirmation ? finalIntent : undefined,
      accumulatedEntities: mergedEntities,
      turns: [
        ...currentCtx.turns,
        {
          id: 'turn_' + Date.now(),
          timestamp: new Date().toISOString(),
          userInput: rawInput,
          systemResponse: clarificationQuestion || 'Intent recognized',
          detectedIntent: finalIntent.intent,
          entities: mergedEntities
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    return { intentResult: finalIntent, updatedContext: updatedCtx };
  }

  private isAffirmative(text: string): boolean {
    const keywords = ['yes', 'yeah', 'yep', 'please', 'do it', 'report it', 'confirm', 'proceed', 'ஆமாம்', 'சரி', 'அவுனு', 'సరే'];
    return keywords.some((k) => text.includes(k));
  }

  private isNegative(text: string): boolean {
    const keywords = ['no', 'nope', 'cancel', 'don\'t', 'stop', 'வேண்டாம்', 'ரத்து', 'వద్దు', 'రద్దు'];
    return keywords.some((k) => text.includes(k));
  }

  private classifyUtterance(raw: string, lower: string, _lang: LanguageCode): IntentObject {
    const entities = this.extractEntities(raw, lower);

    // Emergency Hospital / Ambulance
    if (lower.includes('hospital') || lower.includes('ambulance') || lower.includes('medical') || lower.includes('மருத்துவமனை') || lower.includes('ஆம்புலன்ஸ்') || lower.includes('ఆసుపత్రి')) {
      return {
        intent: 'EMERGENCY_HOSPITAL',
        confidence: 0.95,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'EMERGENCY_WORKFLOW',
        rawInput: raw
      };
    }

    // Emergency Police
    if (lower.includes('police') || lower.includes('cops') || lower.includes('crime') || lower.includes('போலீஸ்') || lower.includes('காவல்துறை') || lower.includes('పోలీస్')) {
      return {
        intent: 'EMERGENCY_POLICE',
        confidence: 0.95,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'EMERGENCY_WORKFLOW',
        rawInput: raw
      };
    }

    // Emergency Fire
    if (lower.includes('fire') || lower.includes('burning') || lower.includes('தீ') || lower.includes('ஃபயர்') || lower.includes('ఫైర్')) {
      return {
        intent: 'EMERGENCY_FIRE',
        confidence: 0.95,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'EMERGENCY_WORKFLOW',
        rawInput: raw
      };
    }

    // Tracking
    const ticketMatch = raw.match(/(CIV|MUNI)-\d{4}-\d{4}/i) || raw.match(/\b\d{4}\b/);
    if (lower.includes('track') || lower.includes('status') || lower.includes('ticket') || ticketMatch) {
      if (ticketMatch) entities.requestId = ticketMatch[0].toUpperCase();
      return {
        intent: 'TRACK_REQUEST',
        confidence: 0.92,
        entities,
        missingInformation: entities.requestId ? [] : ['requestId'],
        requiredConfirmation: false,
        suggestedWorkflow: 'TRACKING_WORKFLOW',
        rawInput: raw
      };
    }

    // Mobility Queries
    if (lower.includes('bus status') || lower.includes('where is my bus') || lower.includes('bus arrival')) {
      return {
        intent: 'MOBILITY_BUS_STATUS',
        confidence: 0.90,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'MOBILITY_WORKFLOW',
        rawInput: raw
      };
    }

    if (lower.includes('bus stop') || lower.includes('stop search') || lower.includes('bus stand')) {
      return {
        intent: 'MOBILITY_STOP_SEARCH',
        confidence: 0.88,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'MOBILITY_WORKFLOW',
        rawInput: raw
      };
    }

    if (lower.includes('bus') || lower.includes('route') || lower.includes('eta') || lower.includes('transport') || lower.includes('பேருந்து') || lower.includes('பஸ்') || lower.includes('బస్సు')) {
      return {
        intent: 'MOBILITY_ROUTE',
        confidence: 0.88,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'MOBILITY_WORKFLOW',
        rawInput: raw
      };
    }

    // Complaints
    if (lower.includes('pothole') || lower.includes('hole') || lower.includes('குழி') || lower.includes('గొయ్యి')) {
      return {
        intent: 'POTHOLE_COMPLAINT',
        confidence: 0.92,
        entities: { ...entities, complaintType: 'POTHOLE' },
        missingInformation: [],
        requiredConfirmation: true,
        suggestedWorkflow: 'REGISTER_COMPLAINT_WORKFLOW',
        rawInput: raw
      };
    }

    if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('bin') || lower.includes('dump') || lower.includes('litter') || lower.includes('குப்பை') || lower.includes('చెత్త')) {
      return {
        intent: 'GARBAGE_COMPLAINT',
        confidence: 0.92,
        entities: { ...entities, complaintType: 'GARBAGE' },
        missingInformation: [],
        requiredConfirmation: true,
        suggestedWorkflow: 'REGISTER_COMPLAINT_WORKFLOW',
        rawInput: raw
      };
    }

    if (lower.includes('streetlight') || lower.includes('light') || lower.includes('lamp') || lower.includes('dark') || lower.includes('மின்விளக்கு') || lower.includes('லைటు')) {
      return {
        intent: 'STREETLIGHT_COMPLAINT',
        confidence: 0.90,
        entities: { ...entities, complaintType: 'STREETLIGHT' },
        missingInformation: [],
        requiredConfirmation: true,
        suggestedWorkflow: 'REGISTER_COMPLAINT_WORKFLOW',
        rawInput: raw
      };
    }

    if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('தண்ணீர்') || lower.includes('நீர்க்கசிவு') || lower.includes('నీరు')) {
      return {
        intent: 'WATER_LEAKAGE_COMPLAINT',
        confidence: 0.90,
        entities: { ...entities, complaintType: 'WATER_LEAKAGE' },
        missingInformation: [],
        requiredConfirmation: true,
        suggestedWorkflow: 'REGISTER_COMPLAINT_WORKFLOW',
        rawInput: raw
      };
    }

    if (lower.includes('road') || lower.includes('tar') || lower.includes('asphalt') || lower.includes('சாலை') || lower.includes('ரோడ్డు')) {
      return {
        intent: 'ROAD_DAMAGE_COMPLAINT',
        confidence: 0.88,
        entities: { ...entities, complaintType: 'ROAD_DAMAGE' },
        missingInformation: [],
        requiredConfirmation: true,
        suggestedWorkflow: 'REGISTER_COMPLAINT_WORKFLOW',
        rawInput: raw
      };
    }

    // General City Info
    if (lower.includes('timing') || lower.includes('office') || lower.includes('service') || lower.includes('contact')) {
      return {
        intent: 'GENERAL_CITY_INFORMATION',
        confidence: 0.75,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'GENERAL_INFO_WORKFLOW',
        rawInput: raw
      };
    }

    return {
      intent: 'UNKNOWN',
      confidence: 0.40,
      entities,
      missingInformation: [],
      requiredConfirmation: false,
      suggestedWorkflow: 'NONE',
      rawInput: raw
    };
  }

  private extractEntities(raw: string, lower: string): ExtractedEntities {
    const entities: ExtractedEntities = {
      description: raw
    };

    // Location & Landmark extraction (look for phrases like "near X", "at Y", "in Z", "near my college")
    const nearMatch = raw.match(/(?:near|at|in|opposite|around|அருகில்|எதிரில்|దగ్గర)\s+([^,.?!]+)/i);
    if (nearMatch) {
      entities.location = nearMatch[1].trim();
      entities.landmark = `Near ${nearMatch[1].trim()}`;
    }

    // Destination extraction (e.g. "to Central Station")
    const destMatch = raw.match(/(?:to|towards|for)\s+([^,.?!]+)/i);
    if (destMatch) {
      entities.destination = destMatch[1].trim();
    }

    // Urgency detection
    if (lower.includes('urgent') || lower.includes('severe') || lower.includes('dangerous') || lower.includes('emergency') || lower.includes('அவசரம்')) {
      entities.urgency = 'HIGH';
    } else {
      entities.urgency = 'MEDIUM';
    }

    return entities;
  }

  private getClarificationQuestion(missingField: string, lang: LanguageCode): string {
    if (missingField === 'location') {
      if (lang === 'ta') return 'இந்த பிரச்சினை எங்குள்ளது? தயவுசெய்து இடத்தை அல்லது அடையாளத்தைக் குறிப்பிடவும்.';
      if (lang === 'te') return 'ఈ సమస్య ఎక్కడ ఉంది? దయచేసి ప్రాంతం లేదా ల్యాండ్‌మార్క్ తెలియజేయండి.';
      return 'Where is this issue located? Please specify the street, area, or landmark.';
    }
    if (missingField === 'requestId') {
      if (lang === 'ta') return 'உங்கள் டிக்கெட் எண்ணைக் குறிப்பிடுங்கள் (எ.கா. MUNI-2026-8942)';
      return 'Please specify your ticket reference ID (e.g. MUNI-2026-8942)';
    }
    return 'Could you please provide more details?';
  }

  private getLowConfidenceQuestion(intent: SupportedIntentName, lang: LanguageCode): string {
    if (lang === 'ta') return `நீங்கள் ${intent} செய்ய விரும்புகிறீர்களா? தயவுசெய்து உறுதிப்படுத்தவும்.`;
    if (lang === 'te') return `మీరు ${intent} చేయాలనుకుంటున్నారా? దయచేసి నిర్ధారించండి.`;
    return `Did you mean to request ${intent.replace(/_/g, ' ').toLowerCase()}? Please confirm.`;
  }
}
