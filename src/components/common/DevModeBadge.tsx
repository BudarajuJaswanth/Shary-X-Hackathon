import React from 'react';
import { envConfig } from '../../config/env';
import { Cpu, AlertCircle, ShieldCheck } from 'lucide-react';

interface DevModeBadgeProps {
  activeVoiceProviderName?: string;
  activeCityProviderName?: string;
  isMockActive: boolean;
}

export const DevModeBadge: React.FC<DevModeBadgeProps> = ({
  activeVoiceProviderName = 'Mock Voice Engine',
  activeCityProviderName = 'Mock City Municipal Engine',
  isMockActive = true
}) => {
  return (
    <div className={`dev-mode-indicator-bar ${isMockActive ? 'mock-active' : 'live-active'}`}>
      <div className="dev-mode-content">
        <div className="dev-mode-left">
          <span className="dev-badge-chip">
            <Cpu size={12} className="inline-icon" /> DEV DEMO MODE
          </span>
          <span className="dev-mode-text">
            Operating with <strong>{activeCityProviderName}</strong> & <strong>{activeVoiceProviderName}</strong>
          </span>
        </div>

        <div className="dev-mode-right">
          {isMockActive ? (
            <span className="mock-notice">
              <AlertCircle size={12} className="inline-icon" /> Simulated Municipal Data • SharyX API Ready
            </span>
          ) : (
            <span className="live-notice">
              <ShieldCheck size={12} className="inline-icon text-emerald" /> Connected to SharyX Cloud Services
            </span>
          )}
          <span className="env-tag">{envConfig.env.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
