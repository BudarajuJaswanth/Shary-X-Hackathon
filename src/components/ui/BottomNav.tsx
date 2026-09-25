import React from 'react';
import { Sparkles, MessageSquareText, ShieldCheck, Heart, User } from 'lucide-react';
import type { ActiveTabType } from '../shell/AppShell';

export interface BottomNavProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="cv-bottom-nav" aria-label="Mobile navigation">
      <button
        type="button"
        className={`cv-bottom-nav-item ${activeTab === 'MAIN' ? 'active' : ''}`}
        aria-current={activeTab === 'MAIN' ? 'page' : undefined}
        onClick={() => setActiveTab('MAIN')}
      >
        <Sparkles size={20} aria-hidden="true" />
        <span className="cv-bottom-nav-label">Overview</span>
      </button>

      <button
        type="button"
        className={`cv-bottom-nav-item ${activeTab === 'CONVERSATION' ? 'active' : ''}`}
        aria-current={activeTab === 'CONVERSATION' ? 'page' : undefined}
        onClick={() => setActiveTab('CONVERSATION')}
      >
        <MessageSquareText size={20} aria-hidden="true" />
        <span className="cv-bottom-nav-label">Assistant</span>
      </button>

      <button
        type="button"
        className={`cv-bottom-nav-item ${activeTab === 'TRACKER' ? 'active' : ''}`}
        aria-current={activeTab === 'TRACKER' ? 'page' : undefined}
        onClick={() => setActiveTab('TRACKER')}
      >
        <ShieldCheck size={20} aria-hidden="true" />
        <span className="cv-bottom-nav-label">Tracker</span>
      </button>

      <button
        type="button"
        className={`cv-bottom-nav-item ${activeTab === 'OUR_STORY' ? 'active' : ''}`}
        aria-current={activeTab === 'OUR_STORY' ? 'page' : undefined}
        onClick={() => setActiveTab('OUR_STORY')}
      >
        <Heart size={20} aria-hidden="true" />
        <span className="cv-bottom-nav-label">Our Story</span>
      </button>

      <button
        type="button"
        className={`cv-bottom-nav-item ${activeTab === 'LOGIN' ? 'active' : ''}`}
        aria-current={activeTab === 'LOGIN' ? 'page' : undefined}
        onClick={() => setActiveTab('LOGIN')}
      >
        <User size={20} aria-hidden="true" />
        <span className="cv-bottom-nav-label">Login</span>
      </button>
    </nav>
  );
};
