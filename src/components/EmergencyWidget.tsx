import React from 'react';
import type { EmergencyContact } from '../types/civic';
import { PhoneCall, AlertTriangle, ShieldCheck, Flame, HeartPulse } from 'lucide-react';

interface EmergencyWidgetProps {
  contacts: EmergencyContact[];
}

export const EmergencyWidget: React.FC<EmergencyWidgetProps> = ({ contacts }) => {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'AMBULANCE':
        return <HeartPulse className="cat-icon ambulance" />;
      case 'POLICE':
        return <ShieldCheck className="cat-icon police" />;
      case 'FIRE':
        return <Flame className="cat-icon fire" />;
      default:
        return <AlertTriangle className="cat-icon" />;
    }
  };

  return (
    <div className="emergency-widget-card">
      <div className="emergency-header">
        <AlertTriangle className="warning-icon pulse" size={20} />
        <div>
          <h4>Emergency Quick Dispatch & Responders</h4>
          <p>Tap below to initiate high-priority direct helpline connection</p>
        </div>
      </div>

      <div className="contacts-grid">
        {contacts.map((contact) => (
          <div key={contact.id} className="emergency-card-item">
            <div className="contact-icon-box">{getIcon(contact.category)}</div>
            <div className="contact-details">
              <h5>{contact.name}</h5>
              <p className="address">{contact.address}</p>
              <span className="distance-badge">{contact.distanceKm} km away</span>
            </div>
            <a href={`tel:${contact.phone}`} className="call-now-btn">
              <PhoneCall size={16} />
              <span>Call {contact.phone}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
