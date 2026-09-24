import { MockVoiceProvider } from '../providers/MockVoiceProvider';
import { MockCityServiceProvider } from '../providers/MockCityServiceProvider';

export const mockProviders = {
  voice: new MockVoiceProvider(),
  cityService: new MockCityServiceProvider()
};
