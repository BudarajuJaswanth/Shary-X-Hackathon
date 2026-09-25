import React from 'react';
import type { EmergencyFacility } from '../domain/models';
import { X, PhoneCall, Navigation, Clock, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface EmergencyFacilityModalProps {
  facility: EmergencyFacility | null;
  onClose: () => void;
}

export const EmergencyFacilityModal: React.FC<EmergencyFacilityModalProps> = ({ facility, onClose }) => {
  if (!facility) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card emergency-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header emergency-modal-header">
          <div className="facility-title-box">
            <span className={`facility-type-tag ${facility.type.toLowerCase()}`}>
              {facility.type.replace('_', ' ')}
            </span>
            <h3>{facility.name}</h3>
          </div>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body emergency-modal-body">
          <div className="location-info-box">
            <div className="info-row">
              <MapPin size={16} className="text-red" />
              <span>{facility.address}</span>
            </div>
            <div className="info-row">
              <Navigation size={16} className="text-cyan" />
              <span><strong>{facility.distanceKm} km</strong> away in {facility.cityArea}</span>
            </div>
            <div className="info-row">
              <Clock size={16} className="text-green" />
              <span>{facility.available24x7 ? 'Open 24x7 Emergency Responders' : 'Standard Operating Hours'}</span>
            </div>
          </div>

          {facility.services && facility.services.length > 0 && (
            <div className="services-section">
              <h5>Available Services & Care Units</h5>
              <div className="services-grid">
                {facility.services.map((serv, idx) => (
                  <span key={idx} className="service-chip">
                    <CheckCircle2 size={12} /> {serv}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="demo-data-notice">
            <Sparkles size={14} />
            <span>Development / Demo Facility Data — Verify details before travel.</span>
          </div>

          <div className="modal-actions-row">
            <a href={`tel:${facility.phone}`} className="action-btn call-btn">
              <PhoneCall size={18} />
              <span>Call {facility.phone}</span>
            </a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="action-btn dir-btn">
              <Navigation size={18} />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
