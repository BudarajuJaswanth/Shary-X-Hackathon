import type { Language, VoiceState, MicPermissionStatus } from '../../types/civic';

export interface VoiceProviderOptions {
  language: Language;
  onResult: (transcript: string, isFinal: boolean) => void;
  onStateChange: (state: VoiceState) => void;
  onError: (error: string) => void;
}

export interface IVoiceProvider {
  name: string;
  isAvailable: boolean;
  isMock: boolean;
  initialize(options: VoiceProviderOptions): Promise<void>;
  checkMicPermission?(): Promise<MicPermissionStatus>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  speak(text: string, language: Language): Promise<void>;
  stopSpeaking(): void;
  setLanguage(language: Language): void;
}
