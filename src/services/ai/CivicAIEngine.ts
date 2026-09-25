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
    } else if (parsedIntent.intent === 'MOBILITY_ROUTE') {
      if (!mergedEntities.origin && !mergedEntities.destination) {
        missingInfo.push('origin');
      } else if (!mergedEntities.origin) {
        missingInfo.push('origin');
      } else if (!mergedEntities.destination) {
        missingInfo.push('destination');
      }
    } else if (parsedIntent.intent === 'MOBILITY_NEARBY_STOP') {
      if (!mergedEntities.location && !mergedEntities.landmark && !mergedEntities.origin) {
        missingInfo.push('currentLocation');
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
    const keywords = [
      'yes', 'yeah', 'yep', 'please', 'do it', 'report it', 'confirm', 'proceed',
      'ஆமாம்', 'சரி', 'ஆம்', 'உறுதி', 'செய்யுங்கள்', 'aam', 'sari',
      'அவுனு', 'సరే', 'అవును', 'చేయండి', 'కన్ఫర్మ్', 'avunu', 'sare'
    ];
    return keywords.some((k) => text.includes(k));
  }

  private isNegative(text: string): boolean {
    const keywords = ['no', 'nope', 'cancel', 'don\'t', 'stop', 'வேண்டாம்', 'ரத்து', 'వద్దు', 'రద్దు'];
    return keywords.some((k) => text.includes(k));
  }

  private classifyUtterance(raw: string, lower: string, _lang: LanguageCode): IntentObject {
    const entities = this.extractEntities(raw, lower);

    // Emergency Hospital / Ambulance
    if (
      lower.includes('hospital') || lower.includes('ambulance') || lower.includes('medical') ||
      lower.includes('மருத்துவமனை') || lower.includes('ஆம்புலன்ஸ்') || lower.includes('ஆஸ்பத்திரி') ||
      lower.includes('ஆஸ்பிட்டல்') || lower.includes('ஆம்புலன்ஸ் வேன்') ||
      lower.includes('ఆసుపత్రి') || lower.includes('అంబులెన్స్') || lower.includes('వైద్య')
    ) {
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
    if (
      lower.includes('police') || lower.includes('cops') || lower.includes('crime') ||
      lower.includes('போலீஸ்') || lower.includes('காவல்துறை') || lower.includes('காவல் நிலைய') ||
      lower.includes('போலீஸ் ஸ்டேஷன்') ||
      lower.includes('పోలీస్') || lower.includes('పోలీస్ స్టేషన్') || lower.includes('కంట్రోల్ రూమ్')
    ) {
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
    if (
      lower.includes('fire') || lower.includes('burning') ||
      lower.includes('தீ') || lower.includes('ஃபயர்') || lower.includes('தீயணைப்பு') || lower.includes('தீ பிடித்து') ||
      lower.includes('ఫైర్') || lower.includes('అగ్నిమాపక') || lower.includes('మంటలు')
    ) {
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

    // Tracking Intents
    const ticketMatch = raw.match(/(CIV|MUNI)-\d{4}-\d{4}/i) || raw.match(/\b\d{4}\b/);
    if (ticketMatch) {
      entities.requestId = ticketMatch[0].toUpperCase();
    }

    if (
      lower.includes('show my open') ||
      lower.includes('which complaints are still open') ||
      lower.includes('open complaints') ||
      lower.includes('pending complaints') ||
      lower.includes('open requests')
    ) {
      entities.filterStatus = 'OPEN';
      return {
        intent: 'OPEN_REQUESTS',
        confidence: 0.92,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'TRACKING_WORKFLOW',
        rawInput: raw
      };
    }

    if (
      lower.includes('resolved requests') ||
      lower.includes('resolved complaints') ||
      lower.includes('which complaints are completed') ||
      lower.includes('completed complaints') ||
      lower.includes('closed complaints')
    ) {
      entities.filterStatus = 'RESOLVED';
      return {
        intent: 'RESOLVED_REQUESTS',
        confidence: 0.92,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'TRACKING_WORKFLOW',
        rawInput: raw
      };
    }

    if (
      lower.includes('show my requests') ||
      lower.includes('show my complaints') ||
      lower.includes('my requests') ||
      lower.includes('list my tickets') ||
      lower.includes('previous requests') ||
      lower.includes('my complaints') ||
      lower.includes('என் புகார்கள்') ||
      lower.includes('என் கோரிக்கைகள்') ||
      lower.includes('முந்தைய புகார்கள்') ||
      lower.includes('నా ఫిర్యాదులు') ||
      lower.includes('నా అభ్యర్థనలు')
    ) {
      entities.filterStatus = 'ALL';
      return {
        intent: 'LIST_REQUESTS',
        confidence: 0.92,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'TRACKING_WORKFLOW',
        rawInput: raw
      };
    }

    if (
      lower.includes('track') ||
      lower.includes('status') ||
      lower.includes('what happened to') ||
      lower.includes('when did i report') ||
      (lower.includes('is my') && lower.includes('resolved')) ||
      lower.includes('last complaint') ||
      lower.includes('last request') ||
      lower.includes('நிலவரம்') ||
      lower.includes('புகார் நிலை') ||
      lower.includes('என்ன ஆச்சு') ||
      lower.includes('ஸ்தితి') ||
      lower.includes('ఫిర్యాదు స్థితి') ||
      lower.includes('స్థితి') ||
      ticketMatch
    ) {
      return {
        intent: 'TRACK_REQUEST',
        confidence: 0.92,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'TRACKING_WORKFLOW',
        rawInput: raw
      };
    }

    // Mobility Queries:
    // 1. Nearby Stop Search
    if (
      lower.includes('nearest bus stop') ||
      lower.includes('where is the nearest bus stop') ||
      lower.includes('bus stop near me') ||
      lower.includes('nearest stop') ||
      lower.includes('bus stand') ||
      lower.includes('nearby stop')
    ) {
      return {
        intent: 'MOBILITY_NEARBY_STOP',
        confidence: 0.92,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'MOBILITY_WORKFLOW',
        rawInput: raw
      };
    }

    // 2. Bus Status / Arrival Time
    if (
      lower.includes('when is the next bus') ||
      lower.includes('is there a bus') ||
      lower.includes('next bus') ||
      lower.includes('bus status') ||
      lower.includes('bus arrival')
    ) {
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

    // 3. ETA / Travel Duration / Ordinal route follow up
    if (
      lower.includes('how long') ||
      lower.includes('travel time') ||
      lower.includes('eta') ||
      lower.includes('faster one') ||
      lower.includes('duration') ||
      (entities.routeIndex !== undefined && (lower.includes('take') || lower.includes('good') || lower.includes('how') || lower.includes('looks')))
    ) {
      return {
        intent: 'MOBILITY_ETA',
        confidence: 0.90,
        entities,
        missingInformation: [],
        requiredConfirmation: false,
        suggestedWorkflow: 'MOBILITY_WORKFLOW',
        rawInput: raw
      };
    }

    // 4. Route Search
    if (
      lower.includes('travel') ||
      lower.includes('from') ||
      lower.includes('reach') ||
      lower.includes('bus to') ||
      lower.includes('route') ||
      lower.includes('transport') ||
      lower.includes('buses from') ||
      lower.includes('buses to') ||
      lower.includes('go to') ||
      lower.includes('going to') ||
      lower.includes('need to go') ||
      lower.includes('பேருந்து') ||
      lower.includes('பஸ்') ||
      lower.includes('బస్సు')
    ) {
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
    if (
      lower.includes('pothole') || lower.includes('hole') || lower.includes('pit') ||
      lower.includes('குழி') || lower.includes('பள்ளம்') || lower.includes('குழி இருக்கு') ||
      lower.includes('గొయ్యి') || lower.includes('గుంత') || lower.includes('గుంత ఉంది')
    ) {
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

    if (
      lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') ||
      lower.includes('bin') || lower.includes('dump') || lower.includes('litter') ||
      lower.includes('குப்பை') || lower.includes('கழிவு') || lower.includes('கழிவுப்பொருள்') ||
      lower.includes('చెత్త') || lower.includes('చెత్తకుండీ')
    ) {
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

    if (
      lower.includes('streetlight') || lower.includes('light') || lower.includes('lamp') || lower.includes('dark') ||
      lower.includes('மின்விளக்கு') || lower.includes('தெருவிளக்கு') || lower.includes('லைட்டு') ||
      lower.includes('స్ట్రీట్ లైట్') || lower.includes('దీపం')
    ) {
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

    if (
      lower.includes('water') || lower.includes('leak') || lower.includes('pipe') ||
      lower.includes('தண்ணீர்') || lower.includes('நீர்க்கசிவு') || lower.includes('குடிநீர்') ||
      lower.includes('నీరు') || lower.includes('లీకేజీ') || lower.includes('పైపు')
    ) {
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

    if (
      lower.includes('road') || lower.includes('tar') || lower.includes('asphalt') ||
      lower.includes('சாலை') || lower.includes('ரோடு') || lower.includes('ரோడ్డు') ||
      lower.includes('రోడ్డు') || lower.includes('రహదారి')
    ) {
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

    // Extract origin & destination for mobility queries
    // E.g. "from Ambattur to Chennai Central", "from Ambattur", "to Chennai Central"
    const fromToMatch = raw.match(/from\s+([A-Za-z0-9\s]+?)\s+to\s+([A-Za-z0-9\s]+)(?:[.,?!]|$)/i);
    if (fromToMatch) {
      entities.origin = fromToMatch[1].trim();
      entities.destination = fromToMatch[2].trim();
    } else {
      const fromMatch = raw.match(/from\s+([A-Za-z0-9\s]+?)(?:\s+to|\s+until|[.,?!]|$)/i);
      if (fromMatch) {
        entities.origin = fromMatch[1].trim();
      }
      const toMatch = raw.match(/(?:to|towards|reach)\s+([A-Za-z0-9\s]+?)(?:\s+from|[.,?!]|$)/i);
      if (toMatch) {
        const dest = toMatch[1].trim();
        if (!['the', 'my', 'a', 'an'].includes(dest.toLowerCase())) {
          entities.destination = dest;
        }
      }
    }

    // Location & Landmark extraction
    const nearMatch = raw.match(/(?:near|at|in|opposite|around|அருகில்|எதிரில்|దగ్గర)\s+([^,.?!]+)/i);
    if (nearMatch) {
      entities.location = nearMatch[1].trim();
      entities.landmark = `Near ${nearMatch[1].trim()}`;
    }

    // Ordinal route references for ETA queries (e.g. "second route", "first one", "1st", "2nd")
    if (lower.includes('first') || lower.includes('1st') || lower.includes('option 1') || lower.includes('route 1')) {
      entities.routeIndex = 0;
    } else if (lower.includes('second') || lower.includes('2nd') || lower.includes('option 2') || lower.includes('route 2')) {
      entities.routeIndex = 1;
    } else if (lower.includes('third') || lower.includes('3rd') || lower.includes('option 3') || lower.includes('route 3')) {
      entities.routeIndex = 2;
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
    if (missingField === 'origin') {
      if (lang === 'ta') return 'நீங்கள் எங்கிருந்து பயணிக்கிறீர்கள்?';
      if (lang === 'te') return 'మీరు ఎక్కడి నుండి ప్రయాణిస్తున్నారు?';
      return 'Where are you travelling from?';
    }
    if (missingField === 'destination') {
      if (lang === 'ta') return 'நீங்கள் எங்கே செல்ல வேண்டும்?';
      if (lang === 'te') return 'మీరు எక్కடிకి ప్రయాణించాలనుకుంటున్నారు?';
      return 'Where would you like to travel to?';
    }
    if (missingField === 'currentLocation') {
      if (lang === 'ta') return 'நீங்கள் தற்போது எந்தப் பகுதியில் இருக்கிறீர்கள்?';
      if (lang === 'te') return 'మీరు ప్రస్తుతం ఏ ప్రాంతంలో ఉన్నారు?';
      return 'Which area are you currently in?';
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
