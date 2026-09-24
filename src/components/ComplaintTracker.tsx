import React, { useState } from 'react';
import { useCivicContext } from '../context/CivicContext';
import { TRANSLATIONS } from '../services/translations';
import type { CivicComplaint, TicketStatus } from '../types/civic';
import { Search, ShieldCheck, MapPin, Clock, Building, Filter, FilePlus, ChevronRight } from 'lucide-react';
import { RequestDetailModal } from './RequestDetailModal';
import { ManualComplaintForm } from './ManualComplaintForm';

export const ComplaintTracker: React.FC = () => {
  const { complaints, language, trackTicket, updateComplaintStatus, isMockMode } = useCivicContext();
  const t = TRANSLATIONS[language];

  const [searchId, setSearchId] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchResult, setSearchResult] = useState<CivicComplaint | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<CivicComplaint | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    const res = await trackTicket(searchId);
    setSearchResult(res);
    setSearched(true);
    if (res) {
      setSelectedComplaint(res);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const getStepProgress = (status: TicketStatus) => {
    switch (status) {
      case 'REGISTERED':
        return 1;
      case 'ASSIGNED':
        return 2;
      case 'IN_PROGRESS':
        return 3;
      case 'RESOLVED':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="tracker-view-container">
      {/* Dev Mode Banner */}
      <div className="dev-mode-banner">
        <span>
          <strong>{isMockMode ? 'Development Mock Mode' : 'Live Gateway'}</strong> — Showing requests stored in local municipal database.
        </span>
      </div>

      <div className="tracker-top-bar">
        <button
          type="button"
          className={`btn-action-tab ${!showManualForm ? 'active' : ''}`}
          onClick={() => setShowManualForm(false)}
        >
          <ShieldCheck size={18} />
          <span>Track & View Requests ({complaints.length})</span>
        </button>

        <button
          type="button"
          className={`btn-action-tab ${showManualForm ? 'active' : ''}`}
          onClick={() => setShowManualForm(true)}
        >
          <FilePlus size={18} />
          <span>Form Fallback (Register Complaint)</span>
        </button>
      </div>

      {showManualForm ? (
        <ManualComplaintForm
          onSuccess={(newId) => {
            setSearchId(newId);
            setShowManualForm(false);
            trackTicket(newId).then((res) => setSelectedComplaint(res));
          }}
          onCancel={() => setShowManualForm(false)}
        />
      ) : (
        <>
          <div className="search-card">
            <h2 className="section-title">
              <ShieldCheck size={22} className="title-icon" /> {t.trackTitle}
            </h2>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="Enter Ticket Reference (e.g. CIV-2026-8942, MUNI-2026-4109)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <Search size={16} />
                <span>{t.trackBtn}</span>
              </button>
            </form>

            {searched && (
              <div className="search-result-box">
                {searchResult ? (
                  <div
                    className="result-card found clickable"
                    onClick={() => setSelectedComplaint(searchResult)}
                  >
                    <div className="result-header">
                      <span className="ticket-id">{searchResult.ticketId}</span>
                      <span className={`status-pill status-${searchResult.status.toLowerCase()}`}>
                        {searchResult.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="result-title">
                      <strong>{searchResult.title}</strong>
                    </p>
                    <p className="result-desc">{searchResult.description}</p>
                    <div className="result-meta">
                      <span>
                        <MapPin size={14} /> {searchResult.location}
                      </span>
                      <span>
                        <Building size={14} /> {searchResult.assignedDepartment}
                      </span>
                      <span>
                        <Clock size={14} /> SLA: {searchResult.estimatedResolutionHours} Hours
                      </span>
                    </div>
                    <div className="view-more-hint">
                      Click to view detailed timeline & status audit log <ChevronRight size={14} />
                    </div>
                  </div>
                ) : (
                  <div className="result-card not-found">
                    <p>⚠️ No ticket found matching ID "{searchId}". Please verify ticket reference.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="complaints-list-section">
            <div className="list-header">
              <h3>Registered Municipal Requests ({filteredComplaints.length})</h3>
              <div className="filter-tabs">
                <Filter size={14} className="filter-icon" />
                {['ALL', 'REGISTERED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    className={`filter-pill ${filterStatus === st ? 'active' : ''}`}
                    onClick={() => setFilterStatus(st)}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="cards-grid">
              {filteredComplaints.map((item) => {
                const step = getStepProgress(item.status);
                return (
                  <div
                    key={item.id}
                    className="complaint-card clickable-card"
                    onClick={() => setSelectedComplaint(item)}
                  >
                    <div className="card-top">
                      <span className="category-pill">{item.category}</span>
                      <span className="ticket-code">{item.ticketId}</span>
                      <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                        {item.priority} Priority
                      </span>
                    </div>

                    <h4 className="card-title">{item.title}</h4>
                    <p className="card-desc">{item.description}</p>

                    <div className="card-meta">
                      <div className="meta-row">
                        <MapPin size={14} className="icon" />
                        <span>{item.location}</span>
                      </div>
                      <div className="meta-row">
                        <Building size={14} className="icon" />
                        <span>{item.assignedDepartment}</span>
                      </div>
                      <div className="meta-row">
                        <Clock size={14} className="icon" />
                        <span>Resolution SLA: {item.estimatedResolutionHours} hrs</span>
                      </div>
                    </div>

                    <div className="timeline-progress">
                      <div className={`timeline-step ${step >= 1 ? 'done' : ''}`}>
                        <span className="dot"></span>
                        <span className="lbl">Submitted</span>
                      </div>
                      <div className={`timeline-step ${step >= 2 ? 'done' : ''}`}>
                        <span className="dot"></span>
                        <span className="lbl">Assigned</span>
                      </div>
                      <div className={`timeline-step ${step >= 3 ? 'done' : ''}`}>
                        <span className="dot"></span>
                        <span className="lbl">In Progress</span>
                      </div>
                      <div className={`timeline-step ${step >= 4 ? 'done' : ''}`}>
                        <span className="dot"></span>
                        <span className="lbl">Resolved</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Request Detail View Modal */}
      {selectedComplaint && (
        <RequestDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={(ticketId, status) => {
            updateComplaintStatus(ticketId, status);
            setSelectedComplaint((prev) => (prev ? { ...prev, status } : null));
          }}
        />
      )}
    </div>
  );
};

