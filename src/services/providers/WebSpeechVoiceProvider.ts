import type { IVoiceProvider, VoiceProviderOptions } from './IVoiceProvider';
import type { Language, VoiceState, MicPermissionStatus } from '../../types/civic';

export class WebSpeechVoiceProvider implements IVoiceProvider {
  public name = 'Browser Web Speech Engine';
  public isAvailable = false;
  public isMock = false;

  private recognition: any = null;
  private options: VoiceProviderOptions | null = null;
  private currentLanguage: Language = 'en-IN';
  private currentState: VoiceState = 'IDLE';

  constructor() {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.isAvailable = !!SpeechRecognitionAPI && 'speechSynthesis' in window;
  }

  public async checkMicPermission(): Promise<MicPermissionStatus> {
    if (!navigator.permissions || !navigator.permissions.query) {
      return this.isAvailable ? 'GRANTED' : 'UNSUPPORTED';
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as any });
      if (result.state === 'granted') return 'GRANTED';
      if (result.state === 'denied') return 'DENIED';
      return 'PROMPT';
    } catch {
      return this.isAvailable ? 'GRANTED' : 'UNSUPPORTED';
    }
  }

  public async initialize(options: VoiceProviderOptions): Promise<void> {
    this.options = options;
    this.currentLanguage = options.language;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.updateState('ERROR');
      this.options?.onError('Browser does not support Speech Recognition. Speech fallback mode active.');
      return;
    }

    try {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.updateState('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          this.updateState('TRANSCRIBING');
          this.options?.onResult(finalTranscript, true);
        } else if (interimTranscript) {
          this.options?.onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('WebSpeech Error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.updateState('ERROR');
          this.options?.onError('Microphone access denied by browser permission settings.');
        } else if (event.error === 'no-speech') {
          this.updateState('IDLE');
        } else {
          this.updateState('ERROR');
          this.options?.onError(`Voice recognition error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this.currentState === 'LISTENING' || this.currentState === 'TRANSCRIBING') {
          this.updateState('IDLE');
        }
      };
    } catch (err: any) {
      this.updateState('ERROR');
      this.options?.onError(`Speech Initialization failed: ${err.message}`);
    }
  }

  public async startListening(): Promise<void> {
    if (!this.recognition) {
      this.options?.onError('Speech recognition is not available in this environment.');
      this.updateState('ERROR');
      return;
    }

    try {
      this.stopSpeaking();
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    } catch {
      try {
        this.recognition.stop();
        this.recognition.start();
      } catch (err: any) {
        this.updateState('ERROR');
        this.options?.onError(`Failed to start recording: ${err.message}`);
      }
    }
  }

  public async stopListening(): Promise<void> {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    this.updateState('IDLE');
  }

  public setLanguage(language: Language): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  public async speak(text: string, language: Language): Promise<void> {
    if (!('speechSynthesis' in window)) return;

    this.stopSpeaking();
    this.updateState('SPEAKING');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language.split('-')[0];
    const matchedVoice = voices.find(
      (v) => v.lang === language || v.lang.startsWith(langPrefix)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.updateState('IDLE');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback error:', e);
      this.updateState('IDLE');
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentState === 'SPEAKING') {
      this.updateState('IDLE');
    }
  }

  private updateState(state: VoiceState) {
    this.currentState = state;
    this.options?.onStateChange(state);
  }
}
