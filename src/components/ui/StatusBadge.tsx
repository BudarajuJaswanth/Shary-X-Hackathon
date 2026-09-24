import React from 'react';
import type { ComplaintStatus } from '../../domain/models';
import { Clock, CheckCircle2, AlertTriangle, UserCheck, XCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status: ComplaintStatus | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'REGISTERED':
        return { label: 'Registered', icon: <Clock size={12} />, variant: 'info' };
      case 'ASSIGNED':
        return { label: 'Assigned', icon: <UserCheck size={12} />, variant: 'warning' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', icon: <Clock size={12} />, variant: 'primary' };
      case 'RESOLVED':
        return { label: 'Resolved', icon: <CheckCircle2 size={12} />, variant: 'success' };
      case 'REJECTED':
        return { label: 'Rejected', icon: <XCircle size={12} />, variant: 'danger' };
      case 'HIGH':
      case 'CRITICAL':
        return { label: `${normalized} Priority`, icon: <AlertTriangle size={12} />, variant: 'danger' };
      default:
        return { label: status, icon: null, variant: 'neutral' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`cv-badge cv-badge-${config.variant} cv-badge-${size}`} role="status">
      {config.icon && <span className="cv-badge-icon" aria-hidden="true">{config.icon}</span>}
      <span className="cv-badge-label">{config.label}</span>
    </span>
  );
};
