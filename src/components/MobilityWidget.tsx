import React from 'react';
import type { MobilityRoute } from '../types/civic';
import type { Route, TransitStop, TransitVehicle, TransitOption } from '../domain/models';
import { Bus, Clock, MapPin, IndianRupee, Navigation, Footprints, AlertCircle, Sparkles } from 'lucide-react';
import { useCivicContext } from '../context/CivicContext';

interface MobilityWidgetProps {
  routes?: MobilityRoute[];
  routeData?: Route[];
  stopsData?: TransitStop[];
  vehicleData?: TransitVehicle[];
}

export const MobilityWidget: React.FC<MobilityWidgetProps> = ({
  routes,
  routeData,
  stopsData,
  vehicleData
}) => {
  const { sendTextMessage } = useCivicContext();

  // 1. Structured Route Data (Route[] with TransitOption[])
  if (routeData && routeData.length > 0) {
    const allOptions: TransitOption[] = routeData.flatMap((r) => r.options);

    if (allOptions.length === 0) {
      return (
        <div className="mobility-widget-card empty-mobility">
          <div className="widget-title text-amber">
            <AlertCircle size={18} className="title-icon" />
            <span>No Routes Found</span>
          </div>
          <p className="empty-desc">No transport options match your requested locations.</p>
          <div className="recovery-actions">
            <button onClick={() => sendTextMessage('I need to travel from Ambattur to Chennai Central')}>Change origin</button>
            <button onClick={() => sendTextMessage('Travel to Chennai Central')}>Try another destination</button>
            <button onClick={() => sendTextMessage('Where is the nearest bus stop?')}>Search again</button>
          </div>
        </div>
      );
    }

    return (
      <div className="mobility-widget-card">
        <div className="widget-title">
          <div className="title-left">
            <Bus size={18} className="title-icon" />
            <span>Smart Mobility Options ({allOptions[0]?.origin} → {allOptions[0]?.destination})</span>
          </div>
          <span className="demo-badge" title="Demo Data - Not live transport authority stream">
            <Sparkles size={10} /> Demo Data
          </span>
        </div>

        <div className="routes-list">
          {allOptions.map((opt, idx) => (
            <div key={opt.id || idx} className={`route-item ${opt.isRecommended ? 'recommended' : ''}`}>
              {opt.isRecommended && <div className="recommended-ribbon">Recommended</div>}

              <div className="route-badge-row">
                <span className="route-number-pill">{opt.routeNumber}</span>
                <span className="bus-type-badge">{opt.busType}</span>
                <span className={`live-status ${opt.vehicle?.status ? opt.vehicle.status.toLowerCase() : 'on_time'}`}>
                  <Clock size={12} /> {opt.nextDeparture}
                </span>
              </div>

              <div className="route-main-flow">
                <div className="flow-path">
                  <span className="station origin">{opt.origin}</span>
                  <span className="arrow-connector">
                    <span className="bus-icon-chip">
                      <Bus size={12} /> {opt.routeNumber}
                    </span>
                  </span>
                  <span className="station dest">{opt.destination}</span>
                </div>
              </div>

              <div className="route-meta-grid">
                <div className="meta-pill duration">
                  <Clock size={12} /> <strong>{opt.durationMinutes} min</strong>
                </div>
                <div className="meta-pill stops">
                  <MapPin size={12} /> {opt.stopsCount} stops
                </div>
                <div className="meta-pill walking">
                  <Footprints size={12} /> {opt.walkingDistanceMinutes} min walking
                </div>
                <div className="meta-pill fare">
                  <IndianRupee size={12} /> {opt.fare}
                </div>
              </div>

              {opt.stops && opt.stops.length > 0 && (
                <div className="stops-timeline">
                  {opt.stops.map((stop, sIdx) => (
                    <span key={sIdx} className="stop-chip">
                      <MapPin size={10} /> {stop}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Nearby Transit Stops (TransitStop[])
  if (stopsData && stopsData.length > 0) {
    return (
      <div className="mobility-widget-card">
        <div className="widget-title">
          <div className="title-left">
            <MapPin size={18} className="title-icon" />
            <span>Nearby Bus Stops</span>
          </div>
          <span className="demo-badge" title="Demo Data">
            <Sparkles size={10} /> Demo Data
          </span>
        </div>

        <div className="stops-list-grid">
          {stopsData.map((stop) => (
            <div key={stop.id} className="stop-card">
              <div className="stop-header">
                <span className="stop-name">{stop.name}</span>
                <span className="walking-badge">
                  <Footprints size={12} /> {stop.walkingMinutes} min walk ({stop.distanceKm} km)
                </span>
              </div>
              <div className="stop-meta">
                <span className="area-tag">{stop.cityArea}</span>
                <button
                  className="quick-route-btn"
                  onClick={() => sendTextMessage(`When is the next bus at ${stop.name}?`)}
                >
                  Check departures
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Transit Vehicle Status (TransitVehicle[])
  if (vehicleData && vehicleData.length > 0) {
    return (
      <div className="mobility-widget-card">
        <div className="widget-title">
          <div className="title-left">
            <Navigation size={18} className="title-icon" />
            <span>Bus Status & Live Tracking</span>
          </div>
          <span className="demo-badge" title="Demo Data">
            <Sparkles size={10} /> Demo Data
          </span>
        </div>

        <div className="vehicles-list">
          {vehicleData.map((v) => (
            <div key={v.id} className="vehicle-card">
              <div className="vehicle-header">
                <span className="vehicle-number">{v.vehicleNumber}</span>
                <span className="bus-type">{v.busType}</span>
                <span className={`status-badge ${v.status.toLowerCase()}`}>
                  {v.status.replace('_', ' ')}
                </span>
              </div>
              <div className="vehicle-body">
                <span className="label">Current Location / Stop:</span>
                <span className="val">{v.currentStop || 'En Route'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Legacy MobilityRoute[] fallback
  if (routes && routes.length > 0) {
    return (
      <div className="mobility-widget-card">
        <div className="widget-title">
          <div className="title-left">
            <Bus size={18} className="title-icon" />
            <span>Transit Options</span>
          </div>
          <span className="demo-badge" title="Demo Data">
            <Sparkles size={10} /> Demo Data
          </span>
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
  }

  return null;
};
