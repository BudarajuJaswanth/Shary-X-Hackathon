import type { Language, VoiceState, MicPermissionStatus } from '../types/civic';
import type { VoiceSession } from '../domain/models';

export interface TranscriptListener {
  (transcript: string, isFinal: boolean): void;
}

export interface VoiceStatusListener {
  (status: VoiceState): void;
}

export interface VoiceProviderOptions {
  language: Language;
  onTranscript?: TranscriptListener;
  onStatusChange?: VoiceStatusListener;
  onError?: (error: Error) => void;
}

export interface IVoiceProvider {
  name: string;
  isMock: boolean;
  isAvailable: boolean;

  checkMicPermissions(): Promise<MicPermissionStatus>;
  requestMicPermissions(): Promise<MicPermissionStatus>;

  startSession(options: VoiceProviderOptions): Promise<VoiceSession>;
  stopSession(): Promise<void>;
  sendAudio(audioChunk: Blob | ArrayBuffer): Promise<void>;
  receiveTranscript(listener: TranscriptListener): void;
  speak(text: string, language: Language): Promise<void>;
  stopSpeaking(): void;
  getConnectionStatus(): VoiceState;
}
