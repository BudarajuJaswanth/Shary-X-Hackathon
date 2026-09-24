import React from 'react';
import type { CivicComplaint, TicketStatus } from '../types/civic';
import { X, MapPin, Building, Clock, ShieldCheck, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface RequestDetailModalProps {
  complaint: CivicComplaint | null;
  onClose: () => void;
  onUpdateStatus?: (ticketId: string, status: TicketStatus) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus
}) => {
  if (!complaint) return null;

  const getStepIndex = (status: TicketStatus) => {
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

  const step = getStepIndex(complaint.status);

  return (
    <div className="request-detail-backdrop">
      <div className="request-detail-card">
        <div className="modal-header">
          <div className="modal-header-title">
            <ShieldCheck className="icon-main" size={24} />
            <div>
              <h2 className="title">{complaint.ticketId}</h2>
              <span className="subtitle">Civic Complaint Request File</span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Dev Mode Notice */}
          <div className="dev-notice-chip">
            ℹ️ Development Mock Backend — Ticket stored in browser local state.
          </div>

          {/* Header Summary */}
          <div className="summary-banner">
            <div className="banner-col">
              <span className="lbl">Category</span>
              <span className="val badge-category">{complaint.category}</span>
            </div>
            <div className="banner-col">
              <span className="lbl">Status</span>
              <span className={`val badge-status status-${complaint.status.toLowerCase()}`}>
                {complaint.status.replace('_', ' ')}
              </span>
            </div>
            <div className="banner-col">
              <span className="lbl">Priority</span>
              <span className={`val badge-priority priority-${complaint.priority.toLowerCase()}`}>
                {complaint.priority} Priority
              </span>
            </div>
            <div className="banner-col">
              <span className="lbl">Resolution SLA</span>
              <span className="val">{complaint.estimatedResolutionHours} Hours</span>
            </div>
          </div>

          {/* Timeline Audit Log */}
          <div className="timeline-section">
            <h4 className="section-subtitle">Workflow Execution & Status Audit Log</h4>
            <div className="timeline-grid">
              <div className={`timeline-node ${step >= 1 ? 'completed' : ''}`}>
                <div className="node-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div className="node-content">
                  <h5>1. Submitted (Registered)</h5>
                  <p>Citizen logged report via CityVoice AI.</p>
                  <small>{new Date(complaint.createdAt).toLocaleString()}</small>
                </div>
              </div>

              <div className={`timeline-node ${step >= 2 ? 'completed' : ''}`}>
                <div className="node-icon">
                  <Building size={16} />
                </div>
                <div className="node-content">
                  <h5>2. Assigned to Department</h5>
                  <p>{complaint.assignedDepartment}</p>
                  <small>{step >= 2 ? new Date(complaint.updatedAt).toLocaleString() : 'Pending dispatch'}</small>
                </div>
              </div>

              <div className={`timeline-node ${step >= 3 ? 'completed' : ''}`}>
                <div className="node-icon">
                  <Clock size={16} />
                </div>
                <div className="node-content">
                  <h5>3. In Progress (Field Team Dispatched)</h5>
                  <p>Engineers & maintenance crew deployed on site.</p>
                  <small>{step >= 3 ? 'Work in progress' : 'Awaiting team'}</small>
                </div>
              </div>

              <div className={`timeline-node ${step >= 4 ? 'completed' : ''}`}>
                <div className="node-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="node-content">
                  <h5>4. Resolved</h5>
                  <p>Hazard repaired & verified by municipal inspector.</p>
                  <small>{step >= 4 ? 'Completed' : 'Pending resolution'}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="info-grid">
            <div className="info-box">
              <h4>
                <MapPin size={16} /> Location Details
              </h4>
              <p>
                <strong>Address:</strong> {complaint.location}
              </p>
              {complaint.landmark && (
                <p>
                  <strong>Landmark:</strong> {complaint.landmark}
                </p>
              )}
            </div>

            <div className="info-box">
              <h4>
                <Building size={16} /> Department Assignment
              </h4>
              <p>
                <strong>Routing:</strong> {complaint.assignedDepartment}
              </p>
              <p>
                <strong>Language Code:</strong> {complaint.language.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="description-box">
            <h4>Description & Report Details</h4>
            <p className="desc-text">{complaint.description}</p>
          </div>

          {complaint.photoUrl && (
            <div className="photo-section">
              <h4>
                <ImageIcon size={16} /> Photo Evidence
              </h4>
              <img src={complaint.photoUrl} alt="Evidence" className="evidence-img" />
            </div>
          )}

          {/* Quick Officer Status Update Action */}
          {onUpdateStatus && (
            <div className="status-update-action">
              <span>Change Status (Officer Mode):</span>
              <div className="btn-group">
                {(['REGISTERED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as TicketStatus[]).map((st) => (
                  <button
                    key={st}
                    className={`btn-status-pill ${complaint.status === st ? 'active' : ''}`}
                    onClick={() => onUpdateStatus(complaint.ticketId, st)}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
};
