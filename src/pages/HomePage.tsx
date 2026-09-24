import React from 'react';
import { CitizenHomeExperience } from '../components/home/CitizenHomeExperience';
import { ConversationFeed } from '../components/ConversationFeed';
import { useCivicContext } from '../context/CivicContext';
import type { ActiveTabType } from '../components/shell/AppShell';

interface HomePageProps {
  onNavigateTab?: (tab: ActiveTabType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateTab }) => {
  const { messages } = useCivicContext();

  // If citizen has engaged in an active multi-turn conversation (more than welcome message), show the combined view!
  const hasActiveConversation = messages.length > 1;

  return (
    <div className="home-page-wrapper">
      <CitizenHomeExperience onNavigateTab={onNavigateTab} />

      {hasActiveConversation && (
        <div className="active-conversation-section">
          <h3 className="section-title">Active Conversation Log</h3>
          <ConversationFeed />
        </div>
      )}
    </div>
  );
};
