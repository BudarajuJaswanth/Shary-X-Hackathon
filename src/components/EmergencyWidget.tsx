import React, { useState } from 'react';
import type { EmergencyContact } from '../types/civic';
import type { EmergencyFacility } from '../domain/models';
import { PhoneCall, AlertTriangle, ShieldCheck, Flame, HeartPulse, Navigation, Sparkles, Eye, MapPin } from 'lucide-react';
import { EmergencyFacilityModal } from './EmergencyFacilityModal';

interface EmergencyWidgetProps {
  contacts?: EmergencyContact[];
  facilities?: EmergencyFacility[];
}

export const EmergencyWidget: React.FC<EmergencyWidgetProps> = ({ contacts, facilities }) => {
  const [selectedFacility, setSelectedFacility] = useState<EmergencyFacility | null>(null);

  const getIcon = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'AMBULANCE':
      case 'HOSPITAL':
        return <HeartPulse className="cat-icon ambulance" />;
      case 'POLICE':
        return <ShieldCheck className="cat-icon police" />;
      case 'FIRE':
      case 'FIRE_STATION':
        return <Flame className="cat-icon fire" />;
      default:
        return <AlertTriangle className="cat-icon" />;
    }
  };

  // Structured Emergency Facilities View
  if (facilities && facilities.length > 0) {
    return (
      <div className="emergency-widget-card">
        <div className="emergency-header">
          <div className="header-left">
            <AlertTriangle className="warning-icon pulse text-red" size={20} />
            <div>
              <h4>Nearby Emergency Facilities</h4>
              <p className="emergency-safety-sub">
                For life-threatening emergencies, dial <strong>112 / 108 / 100</strong> immediately.
              </p>
            </div>
          </div>
          <span className="demo-badge">
            <Sparkles size={10} /> Demo Data
          </span>
        </div>

        <div className="contacts-grid">
          {facilities.map((fac) => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${fac.latitude},${fac.longitude}`;
            return (
              <div key={fac.id} className="emergency-card-item">
                <div className="contact-icon-box">{getIcon(fac.type)}</div>
                <div className="contact-details">
                  <h5>{fac.name}</h5>
                  <p className="address"><MapPin size={10} className="inline-icon" /> {fac.address}</p>
                  <div className="badges-row">
                    <span className="distance-badge">{fac.distanceKm} km away</span>
                    <span className="24x7-badge">{fac.available24x7 ? '24x7 Emergency' : 'Standard'}</span>
                  </div>
                </div>

                <div className="emergency-actions-grid">
                  <a href={`tel:${fac.phone}`} className="call-now-btn">
                    <PhoneCall size={14} />
                    <span>Call</span>
                  </a>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="nav-btn" title="Directions">
                    <Navigation size={14} />
                    <span>Directions</span>
                  </a>
                  <button className="details-btn" onClick={() => setSelectedFacility(fac)} title="View Details">
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selectedFacility && (
          <EmergencyFacilityModal
            facility={selectedFacility}
            onClose={() => setSelectedFacility(null)}
          />
        )}
      </div>
    );
  }

  // Legacy Emergency Contacts View
  if (contacts && contacts.length > 0) {
    return (
      <div className="emergency-widget-card">
        <div className="emergency-header">
          <div className="header-left">
            <AlertTriangle className="warning-icon pulse" size={20} />
            <div>
              <h4>Emergency Quick Responders & Helplines</h4>
              <p>For immediate life-threatening emergencies, dial <strong>112 / 108 / 100</strong></p>
            </div>
          </div>
          <span className="demo-badge">
            <Sparkles size={10} /> Demo Data
          </span>
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
  }

  return null;
};
