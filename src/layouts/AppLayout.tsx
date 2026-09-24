import React from 'react';
import { AppShell, type ActiveTabType } from '../components/shell/AppShell';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = (props) => {
  return <AppShell {...props} />;
};
