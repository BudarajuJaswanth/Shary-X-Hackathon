import type { IntentObject, ConversationContext } from '../../domain/models';
import type { LanguageCode } from '../../types/civic';

export interface IAIEngine {
  name: string;
  processUtterance(
    transcript: string,
    currentLanguage: LanguageCode,
    context?: ConversationContext
  ): Promise<{ intentResult: IntentObject; updatedContext: ConversationContext }>;
}
