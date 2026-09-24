import React from 'react';
import type { MobilityRoute } from '../types/civic';
import { Bus, Clock, MapPin, IndianRupee, Navigation } from 'lucide-react';

interface MobilityWidgetProps {
  routes: MobilityRoute[];
}

export const MobilityWidget: React.FC<MobilityWidgetProps> = ({ routes }) => {
  return (
    <div className="mobility-widget-card">
      <div className="widget-title">
        <Bus size={18} className="title-icon" />
        <span>Live City Bus & Transit Schedules</span>
      </div>

      <div className="routes-list">
        {routes.map((route, idx) => (
          <div key={idx} className="route-item">
            <div className="route-badge-row">
              <span className="route-number-pill">{route.routeNumber}</span>
              <span className="bus-type-badge">{route.busType}</span>
              <span className={`live-status ${route.liveStatus.toLowerCase()}`}>
                <Clock size={12} /> {route.nextDepartureTime}
              </span>
            </div>

            <div className="route-info">
              <div className="route-endpoints">
                <span className="origin">{route.origin}</span>
                <span className="arrow">→</span>
                <span className="destination">{route.destination}</span>
              </div>
              <div className="route-meta">
                <span>
                  <IndianRupee size={12} className="inline-icon" /> {route.fare}
                </span>
                <span>
                  <Navigation size={12} className="inline-icon" /> Current Stop:{' '}
                  {route.vehicleLocation?.currentStop || 'En route'}
                </span>
              </div>
            </div>

            <div className="stops-timeline">
              {route.stops.map((stop, sIdx) => (
                <span key={sIdx} className="stop-chip">
                  <MapPin size={10} /> {stop}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
