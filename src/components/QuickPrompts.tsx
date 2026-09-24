import React from 'react';
import { useCivicContext } from '../context/CivicContext';
import { TRANSLATIONS } from '../services/translations';
import { Sparkles } from 'lucide-react';

export const QuickPrompts: React.FC = () => {
  const { sendTextMessage, language } = useCivicContext();
  const t = TRANSLATIONS[language];

  const promptsByLang: Record<string, string[]> = {
    en: [
      'There is a deep pothole near Anna Nagar bus stand',
      'Overflowing garbage bin on Main Commercial Street',
      'When is the next bus to Central Station?',
      'Emergency accident on highway, need ambulance!',
      'Track ticket status for MUNI-2026-8942'
    ],
    ta: [
      'அண்ணா நகர் பஸ் ஸ்டாண்ட் அருகில் பெரிய சாலைக் குழி உள்ளது',
      'பிரதான சாலையில் குப்பை தொட்டி நிரம்பி வழிகிறது',
      'சென்ட்ரல் ரயில் நிலையத்திற்கு அடுத்த பஸ் எப்போது?',
      'அவசர விபத்து! 108 ஆம்புலன்ஸ் தேவை',
      'டிக்கெட் நிலவரம் பார்க்க MUNI-2026-8942'
    ],
    te: [
      'అన్నా నగర్ బస్ స్టాండ్ వద్ద పెద్ద రోడ్డు గుంత ఉంది',
      'మెయిన్ రోడ్డు పై చెత్త కుండీ నిండిపోయింది',
      'సెంట్రల్ స్టేషన్ కి తదుపరి బస్సు ఎప్పుడు?',
      'అత్యవసర ప్రమాదం! 108 అంబులెన్స్ కావాలి',
      'టికెట్ స్థితి తనిఖీ MUNI-2026-8942'
    ]
  };

  const prompts = promptsByLang[language] || promptsByLang['en'];

  return (
    <div className="quick-prompts-container">
      <div className="prompts-label">
        <Sparkles size={14} className="sparkle-icon" />
        <span>{t.quickPromptsTitle}</span>
      </div>
      <div className="prompts-scroll">
        {prompts.map((p, idx) => (
          <button key={idx} className="prompt-chip" onClick={() => sendTextMessage(p)}>
            "{p}"
          </button>
        ))}
      </div>
    </div>
  );
};
