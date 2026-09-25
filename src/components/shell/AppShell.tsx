import React from 'react';
import { DevModeBadge } from '../common/DevModeBadge';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Header } from '../Header';
import { BottomNav } from '../ui/BottomNav';
import { ToastProvider } from '../ui/Toast';
import { useCivicContext } from '../../context/CivicContext';

export type ActiveTabType = 'MAIN' | 'CONVERSATION' | 'TRACKER' | 'ADMIN' | 'OUR_STORY' | 'LOGIN';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, activeTab, setActiveTab }) => {
  const { providerType } = useCivicContext();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="cityvoice-root">
          <a href="#main-content" className="sr-only focus:not-sr-only skip-to-content">
            Skip to main content
          </a>

          <DevModeBadge
            isMockActive={providerType !== 'SHARYX'}
            activeVoiceProviderName={providerType === 'SHARYX' ? 'SharyX Voice API' : 'Browser Speech API'}
            activeCityProviderName={providerType === 'SHARYX' ? 'SharyX Civic REST Service' : 'Mock Municipal Engine'}
          />

          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

          <footer className="civic-footer">
            <div className="footer-content">
              <p>
                <strong>CITYVOICE AI</strong> • Autonomous Voice-First Action Engine for Smart Cities
              </p>
              <div className="footer-badges">
                <span className="badge">UNDERSTAND → VERIFY → EXECUTE → CONFIRM</span>
                <span className="badge">SharyX API Architecture Ready</span>
              </div>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};
