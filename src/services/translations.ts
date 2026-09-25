import type { LanguageCode } from '../types/civic';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  home: string;
  voiceInteraction: string;
  myRequests: string;
  reportProblem: string;
  findTransport: string;
  emergencyHelp: string;
  language: string;
  settings: string;
  requestStatus: string;
  listening: string;
  understanding: string;
  speaking: string;
  micHint: string;
  verifyTitle: string;
  verifySubtitle: string;
  confirmBtn: string;
  cancelBtn: string;
  categoryLabel: string;
  locationLabel: string;
  landmarkLabel: string;
  descriptionLabel: string;
  priorityLabel: string;
  editDetails: string;
  ticketCreatedTitle: string;
  ticketNumber: string;
  etaResolution: string;
  department: string;
  mobilityTitle: string;
  route: string;
  nextBus: string;
  fare: string;
  emergencyTitle: string;
  callNow: string;
  trackTitle: string;
  trackPlaceholder: string;
  trackBtn: string;
  languageName: string;
  mockModeActive: string;
  sharyxReady: string;
  quickPromptsTitle: string;
  // Statuses
  statusSubmitted: string;
  statusAssigned: string;
  statusInProgress: string;
  statusResolved: string;
  statusClosed: string;
  // Filter Tabs
  filterAll: string;
  filterOpen: string;
  filterInProgress: string;
  filterResolved: string;
  // Common Labels & Empty States
  emptyStateTitle: string;
  emptyStateSub: string;
  chooseLanguageTitle: string;
  loadingMessage: string;
  errorMessage: string;
  tryAgain: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'CITYVOICE AI',
    tagline: 'Your city, one conversation away',
    home: 'Home',
    voiceInteraction: 'Voice AI',
    myRequests: 'My Requests',
    reportProblem: 'Report Problem',
    findTransport: 'Transit / Mobility',
    emergencyHelp: 'Emergency Help',
    language: 'Language',
    settings: 'Settings',
    requestStatus: 'Request Status',
    listening: 'Listening to your request...',
    understanding: 'Analyzing intent & extracting parameters...',
    speaking: 'CityVoice AI responding...',
    micHint: 'Tap to speak with CityVoice AI',
    verifyTitle: 'Verify Civic Request',
    verifySubtitle: 'Please confirm the details below before we submit to municipal authorities.',
    confirmBtn: 'Confirm & Submit Ticket',
    cancelBtn: 'Cancel Request',
    categoryLabel: 'Complaint Category',
    locationLabel: 'Location / Address',
    landmarkLabel: 'Nearby Landmark',
    descriptionLabel: 'Issue Description',
    priorityLabel: 'Priority Level',
    editDetails: 'Edit Details',
    ticketCreatedTitle: 'Civic Complaint Registered Successfully',
    ticketNumber: 'Ticket Reference ID',
    etaResolution: 'Estimated Resolution SLA',
    department: 'Assigned Department',
    mobilityTitle: 'Transit & Mobility Information',
    route: 'Route',
    nextBus: 'Next Departure',
    fare: 'Fare',
    emergencyTitle: 'Emergency Quick Dispatch (24x7)',
    callNow: 'Direct Call',
    trackTitle: 'Track Civic Request',
    trackPlaceholder: 'Enter Ticket ID (e.g. MUNI-2026-8942)',
    trackBtn: 'Search Ticket',
    languageName: 'English',
    mockModeActive: 'Mock Civic Engine Active',
    sharyxReady: 'SharyX Adapter Ready',
    quickPromptsTitle: 'Try asking CityVoice AI:',
    statusSubmitted: 'Submitted',
    statusAssigned: 'Assigned',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',
    statusClosed: 'Closed',
    filterAll: 'All',
    filterOpen: 'Open',
    filterInProgress: 'In Progress',
    filterResolved: 'Resolved',
    emptyStateTitle: 'No requests yet',
    emptyStateSub: 'When you report a city problem, your requests will appear here.',
    chooseLanguageTitle: 'Choose Your Preferred Language',
    loadingMessage: 'Processing request...',
    errorMessage: 'We couldn\'t retrieve your request right now.',
    tryAgain: 'Try Again'
  },
  ta: {
    appName: 'சிட்டிவாய்ஸ் AI',
    tagline: 'உங்கள் நகரம், ஒரு உரையாடல் தூரத்தில்',
    home: 'முகப்பு',
    voiceInteraction: 'குரல் உதவி',
    myRequests: 'என் கோரிக்கைகள்',
    reportProblem: 'புகார் அளிக்கவும்',
    findTransport: 'போக்குவரத்து தகவல்கள்',
    emergencyHelp: 'அவசர உதவி',
    language: 'மொழி',
    settings: 'அமைப்புகள்',
    requestStatus: 'புகாரின் நிலை',
    listening: 'உங்கள் குரலைக் கேட்கிறது...',
    understanding: 'செய்தியைப் புரிந்துகொள்கிறது...',
    speaking: 'பதிலளிக்கிறது...',
    micHint: 'பேச தட்டவும்',
    verifyTitle: 'நகராட்சி கோரிக்கையை உறுதிசெய்க',
    verifySubtitle: 'சமர்ப்பிப்பதற்கு முன் விவரங்களைச் சரிபார்க்கவும்.',
    confirmBtn: 'உறுதிசெய்து சமர்ப்பிக்கவும்',
    cancelBtn: 'ரத்துசெய்',
    categoryLabel: 'புகார் வகை',
    locationLabel: 'இடம் / முகவரி',
    landmarkLabel: 'அருகிலுள்ள அடையாளம்',
    descriptionLabel: 'புகார் விவரம்',
    priorityLabel: 'முன்னுரிமை',
    editDetails: 'விவரங்களை மாற்றுக',
    ticketCreatedTitle: 'புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது',
    ticketNumber: 'டிக்கெட் எண்',
    etaResolution: 'எதிர்பார்க்கப்படும் தீர்வு நேரம்',
    department: 'ஒதுக்கப்பட்ட துறை',
    mobilityTitle: 'பேருந்து மற்றும் போக்குவரத்து தகவல்கள்',
    route: 'தடம்',
    nextBus: 'அடுத்த பேருந்து',
    fare: 'கட்டணம்',
    emergencyTitle: 'அவசர உதவி சேவைகள் (24x7)',
    callNow: 'உடனே அழைக்கவும்',
    trackTitle: 'புகாரைக் கண்காணிக்க',
    trackPlaceholder: 'டிக்கெட் எண்ணை உள்ளிடவும் (எ.கா. MUNI-2026-8942)',
    trackBtn: 'தேடுக',
    languageName: 'தமிழ்',
    mockModeActive: 'மாதிரி நகராட்சி இயங்குகிறது',
    sharyxReady: 'SharyX அடாப்டர் தயார்',
    quickPromptsTitle: 'இவற்றை முயன்று பாருங்கள்:',
    statusSubmitted: 'சமர்ப்பிக்கப்பட்டது',
    statusAssigned: 'ஒதுக்கப்பட்டது',
    statusInProgress: 'செயல்பாட்டில் உள்ளது',
    statusResolved: 'தீர்வு காணப்பட்டது',
    statusClosed: 'மூடப்பட்டது',
    filterAll: 'அனைத்தும்',
    filterOpen: 'நிலுவையில் உள்ளவை',
    filterInProgress: 'செயல்பாட்டில் உள்ளவை',
    filterResolved: 'தீர்வு காணப்பட்டவை',
    emptyStateTitle: 'கோரிக்கைகள் ஏதும் இல்லை',
    emptyStateSub: 'நீங்கள் அளிக்கும் நகராட்சி புகார்கள் இங்கே தோன்றும்.',
    chooseLanguageTitle: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    loadingMessage: 'கோரிக்கை செயலாக்கப்படுகிறது...',
    errorMessage: 'தகவல்களை பெற இயலவில்லை.',
    tryAgain: 'மீண்டும் முயல்க'
  },
  te: {
    appName: 'సిటీవాయిస్ AI',
    tagline: 'మీ నగరం, ఒక సంభాషణ దూరంలో',
    home: 'హోమ్',
    voiceInteraction: 'వాయిస్ సహాయం',
    myRequests: 'నా అభ్యర్థనలు',
    reportProblem: 'ఫిర్యాదు చేయండి',
    findTransport: 'రవాణా సమాచారం',
    emergencyHelp: 'అత్యవసర సహాయం',
    language: 'భాష',
    settings: 'సెట్టింగ్‌లు',
    requestStatus: 'ఫిర్యాదు స్థితి',
    listening: 'మీ మాటలను వింటోంది...',
    understanding: 'సమాచారాన్ని విశ్లేషిస్తోంది...',
    speaking: 'సమాధానం ఇస్తోంది...',
    micHint: 'మాట్లాడటానికి నొక్కండి',
    verifyTitle: 'పౌర అభ్యర్థనను నిర్ధారించండి',
    verifySubtitle: 'సమర్పించే ముందు వివరాలను సరిచూసుకోండి.',
    confirmBtn: 'నిర్ధారించి సమర్పించండి',
    cancelBtn: 'రద్దు చేయి',
    categoryLabel: 'ఫిర్యాదు వర్గం',
    locationLabel: 'ప్రాంతం / చిరునామా',
    landmarkLabel: 'సమీప గుర్తు (ల్యాండ్‌మార్క్)',
    descriptionLabel: 'ఫిర్యాదు వివరాలు',
    priorityLabel: 'ప్రాధాన్యత',
    editDetails: 'వివరాలు సవరించు',
    ticketCreatedTitle: 'ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది',
    ticketNumber: 'టికెట్ సంఖ్య',
    etaResolution: 'అంచనా వేసిన పరిష్కార సమయం',
    department: 'కేటాయించిన శాఖ',
    mobilityTitle: 'రవాణా మరియు బస్సు సమాచారం',
    route: 'రూట్',
    nextBus: 'తరువాత బస్సు',
    fare: 'చార్జి',
    emergencyTitle: 'అత్యవసర సహాయ సేవలు (24x7)',
    callNow: 'వెంటనే కాల్ చేయండి',
    trackTitle: 'ఫిర్యాదు స్థితిని తనిఖీ చేయండి',
    trackPlaceholder: 'టికెట్ ఐడీని నమోదు చేయండి (ఉదా: MUNI-2026-8942)',
    trackBtn: 'శోధించండి',
    languageName: 'తెలుగు',
    mockModeActive: 'మాక్ మున్సిపల్ ఇంజన్ యాక్టివ్',
    sharyxReady: 'SharyX అడాప్టర్ సిద్ధంగా ఉంది',
    quickPromptsTitle: 'వీటిని అడిగి చూడండి:',
    statusSubmitted: 'సమర్పించబడింది',
    statusAssigned: 'కేటాయించబడింది',
    statusInProgress: 'పురోగతిలో ఉంది',
    statusResolved: 'పరిష్కరించబడింది',
    statusClosed: 'మూసివేయబడింది',
    filterAll: 'అన్నీ',
    filterOpen: 'తెరిచి ఉన్నవి',
    filterInProgress: 'పురోగతిలో ఉన్నవి',
    filterResolved: 'పరిష్కరించబడినవి',
    emptyStateTitle: 'అభ్యర్థనలు లేవు',
    emptyStateSub: 'మీరు ఫిర్యాదు చేసిన వివరాలు ఇక్కడ కనిపిస్తాయి.',
    chooseLanguageTitle: 'మీ భాషను ఎంచుకోండి',
    loadingMessage: 'సమాచారం ప్రాసెస్ చేయబడుతోంది...',
    errorMessage: 'సమాచారం పొందుపరచలేకపోయాము.',
    tryAgain: 'మళ్ళీ ప్రయత్నించండి'
  }
};

export function getTranslation(lang: LanguageCode, key: keyof TranslationDictionary): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || key;
}
