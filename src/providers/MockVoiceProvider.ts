import type { IVoiceProvider, VoiceProviderOptions, TranscriptListener } from './VoiceProvider';
import type { VoiceState, MicPermissionStatus } from '../types/civic';
import type { VoiceSession } from '../domain/models';

export class MockVoiceProvider implements IVoiceProvider {
  public name = 'Mock Autonomous Voice Provider';
  public isMock = true;
  public isAvailable = true;

  private currentStatus: VoiceState = 'IDLE';
  private currentLanguage: 'en-IN' | 'ta-IN' | 'te-IN' = 'en-IN';
  private transcriptListeners: Set<TranscriptListener> = new Set();
  private options: VoiceProviderOptions | null = null;
  private currentSession: VoiceSession | null = null;
  private timer: any = null;

  public async checkMicPermissions(): Promise<MicPermissionStatus> {
    return 'GRANTED';
  }

  public async requestMicPermissions(): Promise<MicPermissionStatus> {
    return 'GRANTED';
  }

  public async startSession(options: VoiceProviderOptions): Promise<VoiceSession> {
    this.options = options;
    this.currentLanguage = options.language;
    if (options.onTranscript) this.transcriptListeners.add(options.onTranscript);

    this.updateStatus('LISTENING');

    await new Promise((res) => setTimeout(res, 300));

    this.currentSession = {
      id: 'session_mock_' + Date.now(),
      status: 'LISTENING',
      startedAt: new Date().toISOString(),
      language: this.currentLanguage,
      transcriptBuffer: '',
      isAudioStreaming: true
    };

    this.updateStatus('LISTENING');
    return this.currentSession;
  }

  public async stopSession(): Promise<void> {
    this.updateStatus('IDLE');
    if (this.currentSession) {
      this.currentSession.isAudioStreaming = false;
    }
  }

  public async sendAudio(audioChunk: Blob | ArrayBuffer): Promise<void> {
    const chunkSize = audioChunk instanceof ArrayBuffer ? audioChunk.byteLength : audioChunk.size;
    console.log('[MockVoiceProvider] Processing audio chunk size:', chunkSize);
    this.emitTranscript('Mock voice audio chunk received', true);
  }

  public receiveTranscript(listener: TranscriptListener): void {
    this.transcriptListeners.add(listener);
  }

  public async speak(text: string, language: 'en-IN' | 'ta-IN' | 'te-IN'): Promise<void> {
    this.updateStatus('SPEAKING');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.onend = () => this.updateStatus('IDLE');
      utterance.onerror = () => this.updateStatus('IDLE');
      window.speechSynthesis.speak(utterance);
    } else {
      const duration = Math.min(Math.max(text.length * 40, 1200), 4000);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.updateStatus('IDLE');
      }, duration);
    }
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(this.timer);
    this.updateStatus('IDLE');
  }

  public getConnectionStatus(): VoiceState {
    return this.currentStatus;
  }

  private updateStatus(status: VoiceState) {
    this.currentStatus = status;
    if (this.currentSession) this.currentSession.status = status;
    this.options?.onStatusChange?.(status);
  }

  private emitTranscript(text: string, isFinal: boolean) {
    this.transcriptListeners.forEach((listener) => listener(text, isFinal));
  }
}
