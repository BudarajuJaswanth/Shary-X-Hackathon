/**
 * Application Configuration & Environment Loader
 * Strictly isolates secret keys and environment flags.
 */

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  isDevMode: boolean;
  activeVoiceProvider: 'mock' | 'webspeech' | 'sharyx';
  activeCityProvider: 'mock' | 'sharyx';
  sharyxApiKey?: string;
  sharyxBaseUrl: string;
  defaultLanguage: 'en-IN' | 'ta-IN' | 'te-IN';
  enableDebugLogs: boolean;
}

export const envConfig: AppConfig = {
  env: (import.meta.env.MODE as any) || 'development',
  isDevMode: import.meta.env.DEV ?? true,
  activeVoiceProvider: (import.meta.env.VITE_VOICE_PROVIDER as any) || 'webspeech',
  activeCityProvider: (import.meta.env.VITE_CITY_PROVIDER as any) || 'mock',
  sharyxApiKey: import.meta.env.VITE_SHARYX_API_KEY || undefined,
  sharyxBaseUrl: import.meta.env.VITE_SHARYX_BASE_URL || 'https://api.sharyx.ai/v1',
  defaultLanguage: (import.meta.env.VITE_DEFAULT_LANG as any) || 'en-IN',
  enableDebugLogs: import.meta.env.DEV ?? true
};
