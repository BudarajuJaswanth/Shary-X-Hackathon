import React, { useState } from 'react';
import { CivicProvider } from './context/CivicContext';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';
import { TrackerPage } from './pages/TrackerPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { OurStoryPage } from './pages/OurStoryPage';
import { VerificationModal } from './components/VerificationModal';
import type { ActiveTabType } from './components/shell/AppShell';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('CONVERSATION');

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
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
