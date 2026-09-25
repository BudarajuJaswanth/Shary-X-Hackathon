import type { IVoiceProvider, VoiceProviderOptions } from './IVoiceProvider';
import type { Language, VoiceState, MicPermissionStatus } from '../../types/civic';

export class MockVoiceProvider implements IVoiceProvider {
  public name = 'Mock Autonomous Voice Provider';
  public isAvailable = true;
  public isMock = true;

  private options: VoiceProviderOptions | null = null;
  public currentLanguage: Language = 'en-IN';
  private timer: any = null;
  private currentState: VoiceState = 'IDLE';

  public async checkMicPermission(): Promise<MicPermissionStatus> {
    return 'GRANTED';
  }

  public async initialize(options: VoiceProviderOptions): Promise<void> {
    this.options = options;
    this.currentLanguage = options.language;
    this.updateState('IDLE');
  }

  public async startListening(): Promise<void> {
    this.updateState('LISTENING');
    
    // Simulate streaming transcript decode
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.currentState === 'LISTENING') {
        this.updateState('TRANSCRIBING');
        const sampleText = "There is a pothole near my college. Please report it.";
        this.options?.onResult(sampleText, true);
      }
    }, 2000);
  }

  public async stopListening(): Promise<void> {
    clearTimeout(this.timer);
    this.updateState('IDLE');
  }

  public setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  public async speak(text: string, language: Language): Promise<void> {
    this.updateState('SPEAKING');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.onend = () => this.updateState('IDLE');
      utterance.onerror = () => this.updateState('IDLE');
      window.speechSynthesis.speak(utterance);
    } else {
      const duration = Math.min(Math.max(text.length * 40, 1200), 4000);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.updateState('IDLE');
      }, duration);
    }
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(this.timer);
    this.updateState('IDLE');
  }

  public updateState(state: VoiceState): void {
    this.currentState = state;
    this.options?.onStateChange(state);
  }
}
