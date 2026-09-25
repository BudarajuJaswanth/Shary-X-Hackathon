import type { LanguageCode, CivicComplaint } from '../../types/civic';

export function formatLocalizedComplaintResponse(
  cat: string,
  loc: string,
  lang: LanguageCode
): string {
  const catDisplay = cat.toLowerCase().replace('_', ' ');
  if (lang === 'ta') {
    return `${loc} பகுதியில் ${catDisplay} புகார் பதிவு செய்ய விவரங்களை கண்டறிந்துள்ளேன். தயவுசெய்து உறுதிப்படுத்தவும்.`;
  }
  if (lang === 'te') {
    return `${loc} ప్రాంతంలో ${catDisplay} ఫిర్యాదు గుర్తించబడింది. దయచేసి వివరాలను పరిశీలించి నిర్ధారించండి.`;
  }
  return `Extracted ${catDisplay} complaint near ${loc}. Please review the verification card before we register your ticket.`;
}

export function formatLocalizedComplaintCreatedResponse(
  ticketId: string,
  dept: string,
  sla: number,
  lang: LanguageCode
): string {
  if (lang === 'ta') {
    return `உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. டிக்கெட் எண்: **${ticketId}**. ${dept} துறைக்கு ஒதுக்கப்பட்டுள்ளது. எதிர்பார்கப்படும் தீர்வு நேரம்: ${sla} மணிநேரம்.`;
  }
  if (lang === 'te') {
    return `మీ ఫిర్యాదు విజయవంతంగా నమోదైంది. టికెట్ ఐడీ: **${ticketId}**. ${dept} శాఖకు కేటాయించబడింది. అంచనా వేసిన తీర్మాన సమయం: ${sla} గంటలు.`;
  }
  return `Your complaint has been submitted successfully. Ticket ID: **${ticketId}**. Assigned to ${dept}. Estimated resolution SLA is ${sla} hours.`;
}

export function formatLocalizedMobilityRouteResponse(
  origin: string,
  destination: string,
  routeCount: number,
  durationMinutes: number,
  lang: LanguageCode
): string {
  if (lang === 'ta') {
    return `${origin} முதல் ${destination} வரை ${routeCount} பேருந்து தடங்கள் கண்டறியப்பட்டன. மிக வேகமான பயணம் சுமார் **${durationMinutes} நிமிடங்கள்** ஆகும்.`;
  }
  if (lang === 'te') {
    return `${origin} నుండి ${destination} కి ${routeCount} రవాణా మార్గాలు కనుగొనబడ్డాయి. వేగవంతమైన మార్గం సుమారు **${durationMinutes} నిమిషాలు** పడుతుంది.`;
  }
  return `Found ${routeCount} transport route options from ${origin} to ${destination}. The fastest takes approximately **${durationMinutes} minutes**.`;
}

export function formatLocalizedNearbyStopResponse(
  area: string,
  stopName: string,
  walkMin: number,
  stopCount: number,
  lang: LanguageCode
): string {
  if (lang === 'ta') {
    return `${area} அருகில் ${stopCount} பேருந்து நிறுத்தங்கள் உள்ளன. மிக அருகில் உள்ள நிறுத்தம் **${stopName}** (${walkMin} நிமிட நடை).`;
  }
  if (lang === 'te') {
    return `${area} సమీపంలో ${stopCount} బస్ స్టాప్‌లు ఉన్నాయి. దగ్గరలోని బస్ స్టాప్ **${stopName}** (${walkMin} నిమిషాల నడక).`;
  }
  return `Found ${stopCount} bus stops near ${area}. The nearest stop is **${stopName}** (${walkMin} min walk).`;
}

export function formatLocalizedBusStatusResponse(
  destination: string,
  routeNo: string,
  currentStop: string,
  status: string,
  lang: LanguageCode
): string {
  if (lang === 'ta') {
    return `${destination} செல்லும் அடுத்த பேருந்து **தடம் ${routeNo}** தற்போது ${currentStop} அருகில் உள்ளது (${status}).`;
  }
  if (lang === 'te') {
    return `${destination} వెళ్లే తదుపరి బస్సు **రూట్ ${routeNo}** ప్రస్తుతం ${currentStop} వద్ద ఉంది (${status}).`;
  }
  return `Next bus heading towards ${destination} is **Route ${routeNo}** currently at ${currentStop} (${status}).`;
}

export function formatLocalizedEmergencyResponse(
  type: string,
  area: string,
  count: number,
  topName: string,
  distKm: number,
  lang: LanguageCode
): string {
  const typeTa = type === 'HOSPITAL' ? 'மருத்துவமனைகள்' : type === 'POLICE' ? 'காவல் நிலையங்கள்' : 'தீயணைப்பு நிலையங்கள்';
  const typeTe = type === 'HOSPITAL' ? 'ఆసుపత్రులు' : type === 'POLICE' ? 'పోలీస్ స్టేషన్లు' : 'అగ్నిమాపక కేంద్రాలు';
  const typeEn = type === 'HOSPITAL' ? 'hospitals' : type === 'POLICE' ? 'police stations' : 'fire & rescue stations';

  if (lang === 'ta') {
    return `${area} பகுதியில் ${count} அவசர ${typeTa} கண்டறியப்பட்டன. மிக அருகில் உள்ளது **${topName}** (${distKm} கி.மீ). அவசர உதவிக்கு **112 / 108 / 100** அழைக்கவும்.`;
  }
  if (lang === 'te') {
    return `${area} లో ${count} అత్యవసర ${typeTe} కనుగొనబడ్డాయి. దగ్గరలోనిది **${topName}** (${distKm} కి.మీ). అత్యవసర సాయానికి **112 / 108 / 100** కి కాల్ చేయండి.`;
  }
  return `Found ${count} nearby ${typeEn} in ${area}. The closest is **${topName}** (${distKm} km away). For immediate life-threatening emergencies, dial **112 / 108 / 100** directly.`;
}

export function formatLocalizedTrackResultResponse(
  ticket: CivicComplaint,
  lang: LanguageCode
): string {
  const statusTa = ticket.status === 'IN_PROGRESS' ? 'செயல்பாட்டில் உள்ளது' : ticket.status === 'RESOLVED' ? 'தீர்வு காணப்பட்டது' : ticket.status === 'CLOSED' ? 'மூடப்பட்டது' : 'பதிவு செய்யப்பட்டுள்ளது';
  const statusTe = ticket.status === 'IN_PROGRESS' ? 'పురోగతిలో ఉంది' : ticket.status === 'RESOLVED' ? 'పరిష్కరించబడింది' : ticket.status === 'CLOSED' ? 'మూసివేయబడింది' : 'నమోదైంది';

  if (lang === 'ta') {
    return `உங்கள் புகார் **${ticket.ticketId}** (${ticket.category}) தற்போது **${statusTa}**. ${ticket.assignedDepartment} துறைக்கு ஒதுக்கப்பட்டுள்ளது.`;
  }
  if (lang === 'te') {
    return `మీ ఫిర్యాదు **${ticket.ticketId}** (${ticket.category}) ప్రస్తుతం **${statusTe}**. ${ticket.assignedDepartment} శాఖకు కేటాయించబడింది.`;
  }
  return `Your complaint **${ticket.ticketId}** (${ticket.category.replace('_', ' ')}) is currently **${ticket.status.replace('_', ' ')}**. Assigned to ${ticket.assignedDepartment}.`;
}

export function formatLocalizedDefaultHelpResponse(lang: LanguageCode): string {
  if (lang === 'ta') {
    return 'நான் உங்களுக்கு சாலை குழிகள் அல்லது குப்பைகளை பதிவு செய்ய, பேருந்து அட்டவணைகளை அறிய, அல்லது அவசர உதவி எண்களை பெற உதவ முடியும். நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?';
  }
  if (lang === 'te') {
    return 'నేను మీకు గుంతలు లేదా చెత్త సమస్యలను నమోదు చేయడానికి, బస్సు సమయాలను తనిఖీ చేయడానికి లేదా అత్యవసర సేవలను అనుసంధానించడానికి సహాయపడగలను. మీరు ఏమి చేయాలనుకుంటున్నారు?';
  }
  return 'I can help you report potholes or garbage, check bus schedules, or connect to emergency dispatch. What would you like to do?';
}
