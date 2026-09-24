import React, { useState, useEffect } from 'react';
import { useCivicContext } from '../context/CivicContext';
import { TRANSLATIONS } from '../services/translations';
import type { ComplaintCategory, ComplaintPriority } from '../types/civic';
import confetti from 'canvas-confetti';
import { CheckCircle2, X, MapPin, AlertTriangle, FileText, Camera, ShieldAlert } from 'lucide-react';

export const VerificationModal: React.FC = () => {
  const {
    isVerificationOpen,
    verificationDraft,
    confirmAndExecuteComplaint,
    cancelVerification,
    language
  } = useCivicContext();

  const t = TRANSLATIONS[language];

  const [category, setCategory] = useState<ComplaintCategory>('POTHOLE');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('HIGH');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (verificationDraft) {
      setCategory(verificationDraft.category || 'POTHOLE');
      setLocation(verificationDraft.location || '');
      setLandmark(verificationDraft.landmark || '');
      setDescription(verificationDraft.description || '');
      setPriority(verificationDraft.priority || 'HIGH');
      setPhotoUrl(verificationDraft.photoUrl || '');
    }
  }, [verificationDraft]);

  if (!isVerificationOpen || !verificationDraft) return null;

  const handleConfirm = async () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore fallback
    }

    await confirmAndExecuteComplaint({
      category,
      location,
      landmark,
      description,
      priority,
      photoUrl
    });
  };

  return (
    <div className="verification-modal-backdrop">
      <div className="verification-modal-card">
        <div className="modal-header">
          <div className="modal-title-box">
            <ShieldAlert className="modal-icon" size={24} />
            <div>
              <h2 className="modal-title">{t.verifyTitle}</h2>
              <p className="modal-subtitle">{t.verifySubtitle}</p>
            </div>
          </div>
          <button className="close-btn" onClick={cancelVerification}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-grid">
          <div className="dev-notice-chip" style={{ marginBottom: '12px' }}>
            ℹ️ <strong>Development Mock Mode</strong>: Require citizen explicit confirmation before executing local municipal ticket submission.
          </div>

          <div className="workflow-stepper">
            <div className="step step-done">1. Understand</div>
            <div className="step step-active">2. Verify & Confirm</div>
            <div className="step">3. Municipal Execution</div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.categoryLabel}</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            >
              <option value="POTHOLE">🕳️ Road Pothole Hazard</option>
              <option value="GARBAGE">🗑️ Garbage / Waste Overflow</option>
              <option value="STREETLIGHT">💡 Non-functional Streetlight</option>
              <option value="WATER_LEAKAGE">💧 Water Pipeline Leakage</option>
              <option value="ROAD_DAMAGE">🛣️ Road & Surface Damage</option>
              <option value="OTHER">🏢 Other Municipal Service</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MapPin size={14} className="inline-icon" /> {t.locationLabel}
            </label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Anna Salai, Guindy, Chennai"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.landmarkLabel}</label>
            <input
              type="text"
              className="form-input"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite Bus Stop / Metro Pillar 14"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileText size={14} className="inline-icon" /> {t.descriptionLabel}
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                <AlertTriangle size={14} className="inline-icon" /> {t.priorityLabel}
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              >
                <option value="LOW">Low (Regular SLA 72 hrs)</option>
                <option value="MEDIUM">Medium (Standard SLA 48 hrs)</option>
                <option value="HIGH">High (Urgent SLA 24 hrs)</option>
                <option value="CRITICAL">Critical (Immediate Dispatch 12 hrs)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Camera size={14} className="inline-icon" /> Photo Evidence (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Image URL or attach photo"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>
          </div>

          {photoUrl && (
            <div className="photo-preview">
              <img src={photoUrl} alt="Complaint Evidence" />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={cancelVerification}>
            {t.cancelBtn}
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            <CheckCircle2 size={18} />
            <span>{t.confirmBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
