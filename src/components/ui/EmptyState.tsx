import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="cv-empty-state">
      <div className="cv-empty-state-icon" aria-hidden="true">
        {icon || <Inbox size={40} />}
      </div>
      <h3 className="cv-empty-state-title">{title}</h3>
      <p className="cv-empty-state-desc">{description}</p>
      {action && <div className="cv-empty-state-action">{action}</div>}
    </div>
  );
};
