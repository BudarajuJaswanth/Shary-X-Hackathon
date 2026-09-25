import type { LanguageCode, Language } from '../types/civic';

export interface SupportedLanguageConfig {
  code: LanguageCode;
  locale: Language;
  displayName: string;
  nativeName: string;
  enabled: boolean;
  voiceSupport: boolean;
  textSupport: boolean;
}

export const SUPPORTED_LANGUAGES: SupportedLanguageConfig[] = [
  {
    code: 'en',
    locale: 'en-IN',
    displayName: 'English',
    nativeName: 'English',
    enabled: true,
    voiceSupport: true,
    textSupport: true
  },
  {
    code: 'ta',
    locale: 'ta-IN',
    displayName: 'Tamil',
    nativeName: 'தமிழ்',
    enabled: true,
    voiceSupport: true,
    textSupport: true
  },
  {
    code: 'te',
    locale: 'te-IN',
    displayName: 'Telugu',
    nativeName: 'తెలుగు',
    enabled: true,
    voiceSupport: true,
    textSupport: true
  }
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function getLanguageConfig(code: LanguageCode): SupportedLanguageConfig {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ||
    SUPPORTED_LANGUAGES[0]
  );
}
