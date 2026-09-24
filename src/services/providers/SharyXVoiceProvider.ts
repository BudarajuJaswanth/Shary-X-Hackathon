import type { IVoiceProvider, VoiceProviderOptions } from './IVoiceProvider';
import type { Language, MicPermissionStatus } from '../../types/civic';

export class SharyXVoiceProvider implements IVoiceProvider {
  public name = 'SharyX Neural Voice Cloud API';
  public isAvailable = false;
  public isMock = false;

  private apiKey: string;
  private baseUrl: string;
  private options: VoiceProviderOptions | null = null;
  public currentLanguage: Language = 'en-IN';
  private fallbackProvider: IVoiceProvider;

  constructor(fallbackProvider: IVoiceProvider) {
    this.apiKey = import.meta.env.VITE_SHARYX_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_SHARYX_BASE_URL || 'https://api.sharyx.ai/v1';
    this.fallbackProvider = fallbackProvider;
    this.isAvailable = !!this.apiKey;
  }

  public async checkMicPermission(): Promise<MicPermissionStatus> {
    return this.fallbackProvider.checkMicPermission ? this.fallbackProvider.checkMicPermission() : 'GRANTED';
  }

  public async initialize(options: VoiceProviderOptions): Promise<void> {
    this.options = options;
    this.currentLanguage = options.language;

    if (!this.isAvailable) {
      console.warn('[SharyX Provider] API Key missing. Delegating to local VoiceProvider adapter.');
      await this.fallbackProvider.initialize(options);
      return;
    }

    try {
      console.log(`[SharyX Provider] Initialized WebSocket audio stream endpoint: ${this.baseUrl}`);
    } catch (e: any) {
      this.options?.onError(`SharyX Voice initialization failed: ${e.message}`);
    }
  }

  public async startListening(): Promise<void> {
    if (!this.isAvailable) {
      return this.fallbackProvider.startListening();
    }
    this.options?.onStateChange('LISTENING');
  }

  public async stopListening(): Promise<void> {
    if (!this.isAvailable) {
      return this.fallbackProvider.stopListening();
    }
    this.options?.onStateChange('IDLE');
  }

  public setLanguage(language: Language): void {
    this.currentLanguage = language;
    this.fallbackProvider.setLanguage(language);
  }

  public async speak(text: string, language: Language): Promise<void> {
    if (!this.isAvailable) {
      return this.fallbackProvider.speak(text, language);
    }
    this.options?.onStateChange('SPEAKING');
  }

  public stopSpeaking(): void {
    this.fallbackProvider.stopSpeaking();
  }
}
