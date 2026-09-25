import React, { useState, useMemo } from 'react';
import { useCivicContext } from '../context/CivicContext';
import type { TicketStatus, CivicComplaint } from '../types/civic';
import type { RequestStatusHistory } from '../domain/models';
import {
  Building2,
  ShieldAlert,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Bus,
  Activity,
  X,
  FileText,
  BarChart3,
  Layers,
  Cpu,
  UserCheck,
  Siren,
  PlusCircle,
  Eye,
  Check
} from 'lucide-react';

type DashboardTab = 'ALL_REQUESTS' | 'EMERGENCY_VIEW' | 'MOBILITY_VIEW' | 'ANALYTICS_VIEW';

export const AdminCityDashboard: React.FC = () => {
  const {
    complaints,
    refreshComplaints,
    updateComplaintStatus,
    getRequestStatusHistory,
    workflowOrchestrator,
    providerType,
    setProviderType,
    isMockMode,
    submitComplaint
  } = useCivicContext();

  const [activeTab, setActiveTab] = useState<DashboardTab>('ALL_REQUESTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<CivicComplaint | null>(null);

  // Status update form state inside modal
  const [historyTimeline, setHistoryTimeline] = useState<RequestStatusHistory[]>([]);
  const [newStatus, setNewStatus] = useState<TicketStatus>('REGISTERED');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);
  const [updateErrorMsg, setUpdateErrorMsg] = useState<string | null>(null);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshComplaints();
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  // Seed sample requests if dataset is empty or on operator demand
  const handleSeedDemoData = async () => {
    setIsLoading(true);
    try {
      await submitComplaint({
        category: 'POTHOLE',
        title: 'Dangerous Pothole near Bus Depot',
        description: 'Large 3ft pothole causing severe traffic gridlock and hazard for two-wheelers.',
        location: 'Ambattur Industrial Estate Road, Chennai',
        landmark: 'Opposite Ambattur Bus Stand Gate 2',
        priority: 'HIGH',
        estimatedResolutionHours: 24,
        assignedDepartment: 'Public Works Department (PWD) - Roads Division',
        language: 'en'
      });
      await submitComplaint({
        category: 'GARBAGE',
        title: 'Uncollected Municipal Waste Heap',
        description: 'Community waste bin overflowing for 4 days near school entrance.',
        location: 'Anna Nagar West, 2nd Main Road, Chennai',
        landmark: 'Near Govt High School',
        priority: 'MEDIUM',
        estimatedResolutionHours: 12,
        assignedDepartment: 'Solid Waste Management Division',
        language: 'en'
      });
      await submitComplaint({
        category: 'WATER_LEAKAGE',
        title: 'Major Water Pipeline Leak',
        description: 'Underground drinking water line burst flooding residential street.',
        location: 'Padi Junction, Chennai',
        landmark: 'Near Saravana Stores',
        priority: 'CRITICAL',
        estimatedResolutionHours: 8,
        assignedDepartment: 'Metropolitan Water Supply & Sewage Board',
        language: 'en'
      });
      await refreshComplaints();
    } finally {
      setIsLoading(false);
    }
  };

  // Open detail modal and load history
  const handleInspectRequest = async (complaint: CivicComplaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusNote('');
    setUpdateSuccessMsg(null);
    setUpdateErrorMsg(null);
    try {
      const history = await getRequestStatusHistory(complaint.ticketId);
      setHistoryTimeline(history);
    } catch {
      setHistoryTimeline([]);
    }
  };

  // Submit status update
  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdatingStatus(true);
    setUpdateSuccessMsg(null);
    setUpdateErrorMsg(null);

    try {
      const updated = await updateComplaintStatus(selectedComplaint.ticketId, newStatus, statusNote);
      if (updated) {
        setSelectedComplaint(updated);
        const history = await getRequestStatusHistory(updated.ticketId);
        setHistoryTimeline(history);
        setUpdateSuccessMsg(`Status updated successfully to ${newStatus.replace('_', ' ')}.`);
        setStatusNote('');
      } else {
        setUpdateErrorMsg('Failed to update status. Request not found.');
      }
    } catch (err: any) {
      setUpdateErrorMsg(`Error updating status: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Calculated Metrics
  const totalCount = complaints.length;
  const openCount = useMemo(
    () => complaints.filter((c) => ['REGISTERED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length,
    [complaints]
  );
  const inProgressCount = useMemo(
    () => complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    [complaints]
  );
  const resolvedCount = useMemo(
    () => complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
    [complaints]
  );
  const emergencyCount = useMemo(
    () => complaints.filter((c) => c.priority === 'CRITICAL' || c.category === ('EMERGENCY' as any)).length,
    [complaints]
  );

  // Filtered Complaints List
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Tab specific filter override
      if (activeTab === 'EMERGENCY_VIEW') {
        const isEmergencyCategory = c.category === ('EMERGENCY' as any) || c.priority === 'CRITICAL';
        if (!isEmergencyCategory) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = c.ticketId.toLowerCase().includes(q);
        const matchLoc = c.location.toLowerCase().includes(q);
        const matchCat = c.category.toLowerCase().includes(q);
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        if (!matchId && !matchLoc && !matchCat && !matchDesc && !matchTitle) return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;

      // Category Filter
      if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;

      // Priority Filter
      if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) return false;

      return true;
    });
  }, [complaints, activeTab, searchQuery, selectedStatus, selectedCategory, selectedPriority]);

  // Audit Logs for selected complaint or overall
  const auditLogs = useMemo(() => workflowOrchestrator.getAuditLogs(), [workflowOrchestrator]);

  return (
    <div className="admin-dashboard-container" style={{ padding: '1.5rem', maxWidth: '1320px', margin: '0 auto' }}>
      {/* HEADER SECTION */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Building2 size={28} className="text-primary-500" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              City Operations Command Center
            </h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              Phase 14 Operations Loop
            </span>
          </div>
          <p style={{ color: 'var(--cv-text-secondary, #94a3b8)', margin: 0, fontSize: '0.9rem' }}>
            Real-time civic complaint dispatch, status progression, transit analytics & emergency oversight
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleSeedDemoData}
            disabled={isLoading}
            className="cv-button cv-button-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
            title="Add realistic sample civic complaints"
          >
            <PlusCircle size={15} />
            Seed Sample Complaints
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="cv-button cv-button-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Refreshing...' : 'Refresh Feeds'}
          </button>
        </div>
      </div>

      {/* DEMO AUTHORIZATION & ENVIRONMENT BANNER */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid var(--cv-color-card-border, rgba(255, 255, 255, 0.1))',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={20} style={{ color: '#fbbf24' }} />
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              Development / Demo Operations Interface
            </span>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Simulated administrative view connected to {isMockMode ? 'Mock Local Engine (localStorage)' : 'Supabase PostgreSQL Cloud'}.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Voice Provider:</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)' }}>
            {providerType}
          </span>
          <button
            onClick={() => setProviderType(providerType === 'SHARYX' ? 'WEB_SPEECH' : 'SHARYX')}
            style={{ fontSize: '0.75rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Toggle Provider
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY GRID */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-card total" style={{ background: 'var(--cv-color-card, #1e293b)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc' }}>{totalCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Total Requests</div>
          </div>
        </div>

        <div className="stat-card registered" style={{ background: 'var(--cv-color-card, #1e293b)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc' }}>{openCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Open Requests</div>
          </div>
        </div>

        <div className="stat-card progress" style={{ background: 'var(--cv-color-card, #1e293b)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc' }}>{inProgressCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>In Progress Dispatch</div>
          </div>
        </div>

        <div className="stat-card resolved" style={{ background: 'var(--cv-color-card, #1e293b)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc' }}>{resolvedCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Resolved & Closed</div>
          </div>
        </div>

        <div className="stat-card emergency" style={{ background: 'var(--cv-color-card, #1e293b)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Siren size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc' }}>{emergencyCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Emergency / Critical</div>
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('ALL_REQUESTS')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ALL_REQUESTS' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'ALL_REQUESTS' ? '#3b82f6' : '#94a3b8',
            fontWeight: activeTab === 'ALL_REQUESTS' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <Layers size={16} /> All Civic Requests ({complaints.length})
        </button>

        <button
          onClick={() => setActiveTab('EMERGENCY_VIEW')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'EMERGENCY_VIEW' ? '2px solid #ef4444' : '2px solid transparent',
            color: activeTab === 'EMERGENCY_VIEW' ? '#ef4444' : '#94a3b8',
            fontWeight: activeTab === 'EMERGENCY_VIEW' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <Siren size={16} /> Emergency View
        </button>

        <button
          onClick={() => setActiveTab('MOBILITY_VIEW')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'MOBILITY_VIEW' ? '2px solid #0ea5e9' : '2px solid transparent',
            color: activeTab === 'MOBILITY_VIEW' ? '#0ea5e9' : '#94a3b8',
            fontWeight: activeTab === 'MOBILITY_VIEW' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <Bus size={16} /> Smart Mobility Transit
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS_VIEW')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ANALYTICS_VIEW' ? '2px solid #a855f7' : '2px solid transparent',
            color: activeTab === 'ANALYTICS_VIEW' ? '#a855f7' : '#94a3b8',
            fontWeight: activeTab === 'ANALYTICS_VIEW' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <BarChart3 size={16} /> Analytics & Distribution
        </button>
      </div>

      {/* MAIN CONTENT AREA: TAB DEPENDENT */}

      {/* TAB 1: ALL REQUESTS (Or Filtered Emergency View) */}
      {(activeTab === 'ALL_REQUESTS' || activeTab === 'EMERGENCY_VIEW') && (
        <div>
          {/* SEARCH & FILTERS BAR */}
          <div
            style={{
              background: 'var(--cv-color-card, #1e293b)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.85rem',
              alignItems: 'center'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Request ID, location, category or keywords..."
                className="cv-input"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="cv-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="REGISTERED">Submitted (Registered)</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="cv-select"
              >
                <option value="ALL">All Categories</option>
                <option value="POTHOLE">Pothole Hazard</option>
                <option value="GARBAGE">Garbage Overflow</option>
                <option value="STREETLIGHT">Streetlight Failure</option>
                <option value="WATER_LEAKAGE">Water Leakage</option>
                <option value="ROAD_DAMAGE">Road Damage</option>
                <option value="OTHER">Other Municipal Concern</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="cv-select"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* REQUEST TABLE CARD */}
          <div className="cv-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} className="text-primary-400" />
                {activeTab === 'EMERGENCY_VIEW' ? 'Emergency Request Hotline Records' : 'Municipal Requests Registry'}
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                  (Showing {filteredComplaints.length} of {complaints.length})
                </span>
              </h3>
            </div>

            {filteredComplaints.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                <AlertTriangle size={36} style={{ margin: '0 auto 0.75rem auto', color: '#f59e0b', opacity: 0.8 }} />
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc' }}>No matching requests found</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Try clearing filters or search query, or click "Seed Sample Complaints".</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Request ID</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Created</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => {
                      const isEmergency = c.priority === 'CRITICAL' || c.category === ('EMERGENCY' as any);
                      return (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: isEmergency ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                            transition: 'background 0.15s'
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                            {c.ticketId}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className="cv-badge cv-badge-info" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                              {c.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#e2e8f0', maxWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <MapPin size={14} className="text-secondary-400" />
                              {c.location}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background:
                                  c.priority === 'CRITICAL'
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : c.priority === 'HIGH'
                                    ? 'rgba(245, 158, 11, 0.2)'
                                    : 'rgba(100, 116, 139, 0.2)',
                                color:
                                  c.priority === 'CRITICAL'
                                    ? '#ef4444'
                                    : c.priority === 'HIGH'
                                    ? '#f59e0b'
                                    : '#94a3b8'
                              }}
                            >
                              {c.priority}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background:
                                  c.status === 'RESOLVED' || c.status === 'CLOSED'
                                    ? 'rgba(34, 197, 94, 0.15)'
                                    : c.status === 'IN_PROGRESS'
                                    ? 'rgba(14, 165, 233, 0.15)'
                                    : 'rgba(245, 158, 11, 0.15)',
                                color:
                                  c.status === 'RESOLVED' || c.status === 'CLOSED'
                                    ? '#22c55e'
                                    : c.status === 'IN_PROGRESS'
                                    ? '#0ea5e9'
                                    : '#f59e0b'
                              }}
                            >
                              {c.status === 'RESOLVED' || c.status === 'CLOSED' ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <Clock size={13} />
                              )}
                              {c.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                            {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <button
                              onClick={() => handleInspectRequest(c)}
                              className="cv-button cv-button-outline"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Eye size={13} /> Inspect & Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EMERGENCY SERVICES OVERVIEW */}
      {activeTab === 'EMERGENCY_VIEW' && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="cv-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #ef4444' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Siren size={20} /> State Emergency Facilities & Dispatch Contacts
            </h3>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.88rem' }}>
              Real-time directory of regional emergency dispatch centers available for citizen voice assistance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Unified Ambulance & Medical Dispatch', phone: '108', cat: 'Medical Hospital', dist: '0.8 km', color: '#ef4444' },
              { title: 'Metropolitan Police Command Center', phone: '100', cat: 'Police Station', dist: '1.2 km', color: '#3b82f6' },
              { title: 'Fire & Rescue Services Headquarters', phone: '101', cat: 'Fire Station', dist: '2.1 km', color: '#f59e0b' },
              { title: 'Women Safety Patrol & Helpline', phone: '1091', cat: 'Specialized Unit', dist: '1.0 km', color: '#a855f7' }
            ].map((item, idx) => (
              <div key={idx} className="cv-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                      {item.cat}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>24x7 Active</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1rem' }}>{item.title}</h4>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Distance to central sector: {item.dist}
                  </p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color }}>
                    Hotline: {item.phone}
                  </span>
                  <button className="cv-button cv-button-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                    Verify Line
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SMART MOBILITY TRANSIT */}
      {activeTab === 'MOBILITY_VIEW' && (
        <div>
          <div className="cv-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #0ea5e9' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bus size={20} /> Metropolitan Smart Mobility & Transit Overview
            </h3>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.88rem' }}>
              Live transit route inquiries, vehicle location tracking, and ETA metrics queried by citizens via voice.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {[
              { route: 'Route 21G', name: 'Broadway to Tambaram East', busType: 'Electric Express', eta: 'In 4 mins', status: 'ON TIME', color: '#22c55e', stop: 'Central Station' },
              { route: 'Route 47A', name: 'T. Nagar to ICF Perambur', busType: 'Ordinary Express', eta: 'In 9 mins', status: 'APPROACHING', color: '#3b82f6', stop: 'Valluvar Kottam' },
              { route: 'Route M70', name: 'Koyambedu CMBT to Velachery', busType: 'AC Volvo', eta: 'In 12 mins', status: 'DELAYED (Traffic)', color: '#f59e0b', stop: 'Vadapalani Junction' }
            ].map((route, i) => (
              <div key={i} className="cv-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {route.route}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: `${route.color}22`, color: route.color }}>
                    {route.status}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#f8fafc' }}>{route.name}</h4>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Bus Type: <strong>{route.busType}</strong> • Next ETA: <strong>{route.eta}</strong>
                </p>
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Current Vehicle Location: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{route.stop}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & CATEGORY BREAKDOWN */}
      {activeTab === 'ANALYTICS_VIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Category Progress Bars */}
          <div className="cv-card">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} className="text-primary-400" /> Category Breakdown
            </h3>
            {['POTHOLE', 'GARBAGE', 'STREETLIGHT', 'WATER_LEAKAGE', 'ROAD_DAMAGE', 'OTHER'].map((cat) => {
              const count = complaints.filter((c) => c.category === cat).length;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>
                    <span>{cat.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 700 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)', height: '100%', width: `${pct}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workflow Execution Audit Activity */}
          <div className="cv-card">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} className="text-secondary-400" /> Recent AI Workflow Audit Stream
            </h3>
            {auditLogs.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent AI workflow executions recorded in memory.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
                {auditLogs.slice(-6).reverse().map((log) => (
                  <div key={log.executionId} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                      <span>Workflow: {log.workflowName}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                      Tool Executed: <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{log.toolName}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: log.success ? '#22c55e' : '#ef4444', marginTop: '0.2rem' }}>
                      Status: {log.status} (Success={log.success ? 'True' : 'False'})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSPECT & UPDATE REQUEST DETAIL MODAL */}
      {selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="cv-card"
            style={{
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
                    {selectedComplaint.ticketId}
                  </span>
                  <span className="cv-badge cv-badge-info" style={{ fontSize: '0.72rem' }}>
                    {selectedComplaint.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>{selectedComplaint.title}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Section 1: Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem', background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Location</span>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} className="text-secondary-400" /> {selectedComplaint.location}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Assigned Department</span>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: '0.2rem' }}>
                  {selectedComplaint.assignedDepartment || 'Municipal Works Division'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Target SLA</span>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: '0.2rem' }}>
                  {selectedComplaint.estimatedResolutionHours || 24} Hours
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Submitted On</span>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: '0.2rem' }}>
                  {new Date(selectedComplaint.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>

            {/* Description / Conversation summary */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Citizen Complaint Description
              </span>
              <p style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.4rem', whiteSpace: 'pre-wrap' }}>
                {selectedComplaint.description}
              </p>
            </div>

            {/* Section 2: Visual Status Progression Stepper */}
            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                Status Progression Stepper
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                {[
                  { key: 'REGISTERED', label: '1. Submitted' },
                  { key: 'ASSIGNED', label: '2. Assigned' },
                  { key: 'IN_PROGRESS', label: '3. In Progress' },
                  { key: 'RESOLVED', label: '4. Resolved' },
                  { key: 'CLOSED', label: '5. Closed' }
                ].map((step, idx) => {
                  const statusOrder: TicketStatus[] = ['REGISTERED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
                  const currentIndex = statusOrder.indexOf(selectedComplaint.status);
                  const stepIndex = idx;
                  const isPassed = stepIndex <= currentIndex;
                  const isCurrent = stepIndex === currentIndex;

                  return (
                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isCurrent
                            ? '#3b82f6'
                            : isPassed
                            ? '#22c55e'
                            : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          marginBottom: '0.4rem'
                        }}
                      >
                        {isPassed ? <Check size={16} /> : idx + 1}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: isCurrent ? '#38bdf8' : isPassed ? '#22c55e' : '#64748b', fontWeight: isCurrent ? 700 : 500 }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Status History Audit Log */}
            {historyTimeline.length > 0 && (
              <div style={{ marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Recorded Status History Timeline
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {historyTimeline.map((h) => (
                    <div key={h.id} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>{h.status}:</strong> {h.note || 'Status updated'}</span>
                      <span style={{ color: '#64748b' }}>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Operator Status Update Form */}
            <form onSubmit={handleSaveStatusUpdate} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={16} className="text-primary-400" /> Operator Status Update Action
              </h4>

              {updateSuccessMsg && (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', padding: '0.65rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                  {updateSuccessMsg}
                </div>
              )}

              {updateErrorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.65rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                  {updateErrorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label className="cv-field-label">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                    className="cv-select"
                  >
                    <option value="REGISTERED">Submitted (Registered)</option>
                    <option value="ASSIGNED">Assigned to Dept</option>
                    <option value="IN_PROGRESS">In Progress (Field Unit)</option>
                    <option value="RESOLVED">Resolved (Maintenance Complete)</option>
                    <option value="CLOSED">Closed (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="cv-field-label">Status Dispatch Note</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Road crew deployed on site / PWD repair completed."
                    className="cv-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="cv-button cv-button-outline"
                  style={{ fontSize: '0.85rem' }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="cv-button cv-button-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                >
                  {isUpdatingStatus ? 'Saving Update...' : 'Save & Propagate Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
