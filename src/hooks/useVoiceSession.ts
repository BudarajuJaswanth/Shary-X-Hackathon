import { useState, useCallback } from 'react';
import type { IVoiceProvider } from '../providers/VoiceProvider';
import type { VoiceState } from '../types/civic';

export function useVoiceSession(provider: IVoiceProvider, language: 'en-IN' | 'ta-IN' | 'te-IN' = 'en-IN') {
  const [status, setStatus] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startVoice = useCallback(async () => {
    try {
      setIsListening(true);
      await provider.startSession({
        language,
        onTranscript: (text) => setTranscript(text),
        onStatusChange: (newStatus) => setStatus(newStatus)
      });
    } catch {
      setIsListening(false);
      setStatus('ERROR');
    }
  }, [provider, language]);

  const stopVoice = useCallback(async () => {
    setIsListening(false);
    await provider.stopSession();
  }, [provider]);

  const speak = useCallback(
    async (text: string) => {
      await provider.speak(text, language);
    },
    [provider, language]
  );

  return {
    status,
    transcript,
    isListening,
    startVoice,
    stopVoice,
    speak,
    stopSpeaking: () => provider.stopSpeaking()
  };
}
