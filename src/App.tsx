import React, { useState } from 'react';
import { CivicProvider } from './context/CivicContext';
import { AppLayout } from './layouts/AppLayout';
import { MainLandingPage } from './pages/MainLandingPage';
import { HomePage } from './pages/HomePage';
import { TrackerPage } from './pages/TrackerPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { OurStoryPage } from './pages/OurStoryPage';
import { VerificationModal } from './components/VerificationModal';
import type { ActiveTabType } from './components/shell/AppShell';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('MAIN');

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'MAIN' && (
        <MainLandingPage onNavigateTab={setActiveTab} />
      )}
      {activeTab === 'CONVERSATION' && (
        <HomePage onNavigateTab={setActiveTab} />
      )}
      {activeTab === 'TRACKER' && <TrackerPage />}
      {activeTab === 'OUR_STORY' && (
        <OurStoryPage onStartConversation={() => setActiveTab('CONVERSATION')} />
      )}
      {activeTab === 'LOGIN' && (
        <LoginPage onSuccessNavigate={() => setActiveTab('CONVERSATION')} />
      )}
      {activeTab === 'ADMIN' && <AdminPage />}

      <VerificationModal />
    </AppLayout>
  );
};

export default function App() {
  return (
    <CivicProvider>
      <MainApp />
    </CivicProvider>
  );
}
