import React from 'react';
import { useCivicContext } from '../context/CivicContext';
import { TRANSLATIONS } from '../services/translations';
import type { LanguageCode } from '../types/civic';
import type { ActiveTabType } from './shell/AppShell';
import { Mic, ShieldCheck, Globe, Cpu, LayoutDashboard, MessageSquareText, Heart, User, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { language, setLanguage, providerType, setProviderType } = useCivicContext();
  const t = TRANSLATIONS[language];

  return (
    <header className="civic-header">
      <div className="header-brand" onClick={() => setActiveTab('MAIN')}>
        <div className="brand-logo-icon">
          <Mic className="logo-mic" />
          <span className="logo-pulse-ring"></span>
        </div>
        <div className="brand-titles">
          <h1 className="brand-title">
            CITYVOICE <span className="brand-ai">AI</span>
          </h1>
          <p className="brand-tagline">{t.tagline}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Language Selector Pills */}
        <div className="language-selector">
          <Globe className="lang-icon" />
          {(['en', 'ta', 'te'] as LanguageCode[]).map((lang) => (
            <button
              key={lang}
              className={`lang-pill ${language === lang ? 'active' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'తెలుగు'}
            </button>
          ))}
        </div>

        {/* Provider Mode Switcher */}
        <div className="provider-badge-container">
          <button
            className={`provider-pill ${providerType === 'SHARYX' ? 'sharyx' : 'mock'}`}
            title="Click to toggle Provider API mode"
            onClick={() =>
              setProviderType(providerType === 'SHARYX' ? 'WEB_SPEECH' : 'SHARYX')
            }
          >
            <Cpu className="provider-icon" />
            <span>{providerType === 'SHARYX' ? 'SharyX Provider' : 'Mock Engine'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-btn ${activeTab === 'MAIN' ? 'active' : ''}`}
            onClick={() => setActiveTab('MAIN')}
          >
            <Sparkles size={16} />
            <span>{t.home}</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'CONVERSATION' ? 'active' : ''}`}
            onClick={() => setActiveTab('CONVERSATION')}
          >
            <MessageSquareText size={16} />
            <span>{t.voiceInteraction}</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'TRACKER' ? 'active' : ''}`}
            onClick={() => setActiveTab('TRACKER')}
          >
            <ShieldCheck size={16} />
            <span>{t.myRequests}</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'OUR_STORY' ? 'active' : ''}`}
            onClick={() => setActiveTab('OUR_STORY')}
          >
            <Heart size={16} />
            <span>Our Story</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'LOGIN' ? 'active' : ''}`}
            onClick={() => setActiveTab('LOGIN')}
          >
            <User size={16} />
            <span>Login</span>
          </button>

          <button
            className={`nav-btn admin-btn ${activeTab === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setActiveTab('ADMIN')}
          >
            <LayoutDashboard size={16} />
            <span>City Dashboard</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
