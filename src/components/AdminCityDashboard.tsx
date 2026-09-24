import React from 'react';
import { useCivicContext } from '../context/CivicContext';
import {
  BarChart3,
  Cpu,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building2,
  Layers
} from 'lucide-react';

export const AdminCityDashboard: React.FC = () => {
  const { complaints, providerType, setProviderType, refreshComplaints } = useCivicContext();

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const registeredCount = complaints.filter((c) => c.status === 'REGISTERED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>
            <Building2 className="inline-icon" size={26} /> Municipal Command & City Overview
          </h2>
          <p>Real-time autonomous civic AI employee monitoring & ticket dispatch matrix</p>
        </div>
        <button className="refresh-btn" onClick={refreshComplaints}>
          <RefreshCw size={16} /> Refresh Feeds
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon-box">
            <Layers size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">Total Registered Tickets</span>
          </div>
        </div>

        <div className="stat-card registered">
          <div className="stat-icon-box">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{registeredCount}</span>
            <span className="stat-label">Pending Assignment</span>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon-box">
            <BarChart3 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{inProgressCount}</span>
            <span className="stat-label">Active Field Dispatch</span>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon-box">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{resolvedCount}</span>
            <span className="stat-label">Resolved Complaints</span>
          </div>
        </div>
      </div>

      <div className="architecture-status-box">
        <div className="box-header">
          <Cpu size={20} className="cpu-icon" />
          <div>
            <h3>Autonomous AI System Architecture & Provider State</h3>
            <p>Decoupled provider abstraction supporting instant SharyX API adapter switching</p>
          </div>
        </div>

        <div className="provider-matrix">
          <div className={`matrix-card ${providerType === 'WEB_SPEECH' ? 'active' : ''}`}>
            <h4>Browser Web Speech Voice Provider</h4>
            <p>Active Provider: Native SpeechRecognition + SpeechSynthesis</p>
            <span className="status-indicator active">Online</span>
          </div>

          <div className={`matrix-card ${providerType === 'MOCK' ? 'active' : ''}`}>
            <h4>Mock Synthetic Voice Provider</h4>
            <p>Testing Provider: Synthetic audio visualizer simulation</p>
            <span className="status-indicator ready">Ready</span>
          </div>

          <div className={`matrix-card ${providerType === 'SHARYX' ? 'active' : ''}`}>
            <h4>SharyX Voice & City API Adapter</h4>
            <p>Configured via VITE_SHARYX_API_KEY environment variables</p>
            <span className="status-indicator adapter">Adapter Armed</span>
          </div>
        </div>

        <div className="matrix-actions">
          <span>Active Provider: <strong>{providerType}</strong></span>
          <button
            className="toggle-provider-btn"
            onClick={() => setProviderType(providerType === 'SHARYX' ? 'WEB_SPEECH' : 'SHARYX')}
          >
            Switch Active Provider
          </button>
        </div>
      </div>

      <div className="tickets-table-card">
        <h3>Live Municipal Ticket Registry</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket Reference</th>
              <th>Category</th>
              <th>Location</th>
              <th>Assigned Department</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id}>
                <td className="code-cell">{c.ticketId}</td>
                <td>
                  <span className="cat-chip">{c.category}</span>
                </td>
                <td className="loc-cell">{c.location}</td>
                <td>{c.assignedDepartment}</td>
                <td>
                  <span className={`p-pill p-${c.priority.toLowerCase()}`}>{c.priority}</span>
                </td>
                <td>
                  <span className={`st-pill st-${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
