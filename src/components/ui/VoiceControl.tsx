import React from 'react';
import type { VoiceState } from '../../types/civic';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';

export interface VoiceControlProps {
  voiceState: VoiceState;
  onToggleListening: () => void;
  onStopSpeaking?: () => void;
  label?: string;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
  voiceState,
  onToggleListening,
  onStopSpeaking,
  label = 'Tap to speak with CityVoice AI'
}) => {
  const isListening = voiceState === 'LISTENING';
  const isSpeaking = voiceState === 'SPEAKING';
  const isUnderstanding = voiceState === 'UNDERSTANDING';

  const handleClick = () => {
    if (isSpeaking && onStopSpeaking) {
      onStopSpeaking();
    } else {
      onToggleListening();
    }
  };

  const getAriaLabel = () => {
    if (isListening) return 'Stop voice listening';
    if (isSpeaking) return 'Stop voice speech playback';
    if (isUnderstanding) return 'Analyzing voice transcript...';
    return 'Start voice listening';
  };

  return (
    <div className="cv-voice-control-container">
      <button
        type="button"
        className={`cv-voice-btn cv-voice-btn-${voiceState.toLowerCase()}`}
        onClick={handleClick}
        aria-pressed={isListening}
        aria-label={getAriaLabel()}
      >
        <span className="cv-voice-ring" aria-hidden="true" />
        <div className="cv-voice-icon-inner">
          {isListening ? (
            <MicOff size={32} aria-hidden="true" />
          ) : isSpeaking ? (
            <Volume2 size={32} aria-hidden="true" />
          ) : isUnderstanding ? (
            <Loader2 size={32} className="cv-spin" aria-hidden="true" />
          ) : (
            <Mic size={32} aria-hidden="true" />
          )}
        </div>
      </button>

      <span className="cv-voice-hint-label">{label}</span>
    </div>
  );
};
