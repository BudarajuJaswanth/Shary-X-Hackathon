import React, { useState } from 'react';
import { useCivicContext } from '../context/CivicContext';
import { TRANSLATIONS } from '../services/translations';
import type { ComplaintCategory, ComplaintPriority } from '../types/civic';
import { FileText, MapPin, AlertTriangle, Camera, CheckCircle2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ManualComplaintFormProps {
  onSuccess?: (ticketId: string) => void;
  onCancel?: () => void;
}

export const ManualComplaintForm: React.FC<ManualComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const { language, submitComplaint, isMockMode } = useCivicContext();
  const t = TRANSLATIONS[language];

  const [category, setCategory] = useState<ComplaintCategory>('POTHOLE');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('HIGH');
  const [photoUrl, setPhotoUrl] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');

  const [workflowState, setWorkflowState] = useState<'IDLE' | 'VALIDATING' | 'SUBMITTING' | 'SUBMITTED' | 'FAILED'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const samplePhotos = [
    { label: 'Pothole Hazard', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80' },
    { label: 'Garbage Overflow', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80' },
    { label: 'Broken Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Step 1: Validating
    setWorkflowState('VALIDATING');

    if (!location.trim()) {
      setErrorMsg('Please specify a location (street name, landmark, or neighborhood).');
      setWorkflowState('FAILED');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please describe the issue or hazard.');
      setWorkflowState('FAILED');
      return;
    }

    // Step 2: Submitting
    setWorkflowState('SUBMITTING');

    try {
      const ticket = await submitComplaint({
        category,
        title: `${category.replace('_', ' ')} Hazard Report`,
        description,
        location,
        landmark: landmark || undefined,
        priority,
        language,
        citizenPhone: citizenPhone || undefined,
        photoUrl: photoUrl || samplePhotos[0].url,
        estimatedResolutionHours: priority === 'CRITICAL' ? 12 : priority === 'HIGH' ? 24 : 48,
        assignedDepartment: 'Municipal Infrastructure Division'
      });

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Fallback
      }

      setGeneratedTicketId(ticket.ticketId);
      setWorkflowState('SUBMITTED');

      if (onSuccess) {
        onSuccess(ticket.ticketId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit complaint ticket.');
      setWorkflowState('FAILED');
    }
  };

  return (
    <div className="manual-form-container">
      {/* Dev Mode Banner */}
      <div className="dev-mode-banner">
        <ShieldAlert size={16} />
        <span>
          <strong>{isMockMode ? 'Development Mock Mode' : 'Live Gateway'}</strong>: Complaints are stored in local municipal test store.
        </span>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h2 className="card-title-lg">
              <FileText className="title-icon" size={24} /> Register Civic Complaint
            </h2>
            <p className="card-subtitle">
              Text & form fallback for citizens reporting municipal hazards, infrastructure issues, or service outages.
            </p>
          </div>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-close-form">
              ✕
            </button>
          )}
        </div>

        {/* Workflow State Bar */}
        <div className="form-stepper">
          <div className={`step-item ${workflowState === 'IDLE' ? 'active' : 'done'}`}>
            <span className="step-num">1</span> 1. Collecting Details
          </div>
          <div className={`step-item ${workflowState === 'VALIDATING' ? 'active' : workflowState === 'SUBMITTING' || workflowState === 'SUBMITTED' ? 'done' : ''}`}>
            <span className="step-num">2</span> 2. Validating
          </div>
          <div className={`step-item ${workflowState === 'SUBMITTING' ? 'active' : workflowState === 'SUBMITTED' ? 'done' : ''}`}>
            <span className="step-num">3</span> 3. Submitting
          </div>
          <div className={`step-item ${workflowState === 'SUBMITTED' ? 'active done' : ''}`}>
            <span className="step-num">4</span> 4. Submitted
          </div>
        </div>

        {workflowState === 'SUBMITTED' ? (
          <div className="submission-success-card">
            <CheckCircle2 size={56} className="success-icon" />
            <h3 className="success-title">Complaint Registered Successfully!</h3>
            <p className="success-subtitle">
              Your official tracking code is: <strong className="highlight-code">{generatedTicketId}</strong>
            </p>
            <div className="success-details">
              <div className="detail-row">
                <span>Category:</span> <strong>{category.replace('_', ' ')}</strong>
              </div>
              <div className="detail-row">
                <span>Location:</span> <strong>{location}</strong>
              </div>
              <div className="detail-row">
                <span>Status:</span> <span className="badge-submitted">Submitted (Registered)</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-primary btn-full-width"
              onClick={() => {
                setWorkflowState('IDLE');
                setLocation('');
                setDescription('');
                setLandmark('');
              }}
            >
              Register Another Complaint
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="complaint-form-body">
            {errorMsg && (
              <div className="form-error-alert">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.categoryLabel} *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              >
                <option value="POTHOLE">🕳️ Pothole / Road Surface Hazard</option>
                <option value="GARBAGE">🗑️ Garbage Overflow & Sanitation</option>
                <option value="STREETLIGHT">💡 Streetlight & Lighting Outage</option>
                <option value="WATER_LEAKAGE">💧 Water Leakage & Pipe Burst</option>
                <option value="ROAD_DAMAGE">🛣️ Major Road & Construction Damage</option>
                <option value="OTHER">🏢 Other Municipal Service Concern</option>
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={14} /> Location / Street Address *
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Sardar Patel Road, Guindy, Chennai"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Opposite Anna University Gate 3"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description of Issue *</label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="Describe the complaint in detail (e.g., Deep 2-foot wide pothole blocking lane 2)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <AlertTriangle size={14} /> Urgency Level
                </label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                >
                  <option value="LOW">Low (SLA ~ 72 Hours)</option>
                  <option value="MEDIUM">Medium (SLA ~ 48 Hours)</option>
                  <option value="HIGH">High (Urgent SLA ~ 24 Hours)</option>
                  <option value="CRITICAL">Critical Hazard (Immediate 12 Hours)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Citizen Phone (For SMS Tracking)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Camera size={14} /> Photo Evidence (Simulated / URL)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Paste photo image URL or select sample below"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <div className="sample-photo-chips">
                <span className="sample-lbl">Sample evidence photos:</span>
                {samplePhotos.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`chip-btn ${photoUrl === sp.url ? 'active' : ''}`}
                    onClick={() => setPhotoUrl(sp.url)}
                  >
                    <Sparkles size={12} /> {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {photoUrl && (
              <div className="photo-preview-box">
                <img src={photoUrl} alt="Evidence preview" />
              </div>
            )}

            <div className="form-actions">
              {onCancel && (
                <button type="button" className="btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={workflowState === 'SUBMITTING' || workflowState === 'VALIDATING'}
                className="btn-primary"
              >
                {workflowState === 'SUBMITTING' ? (
                  <span>Submitting Ticket...</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Submit Complaint Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
