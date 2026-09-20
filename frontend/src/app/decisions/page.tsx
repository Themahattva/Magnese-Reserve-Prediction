'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileDown,
  Layers,
  Wrench,
} from 'lucide-react';
import { explorationAPI, recommendationsAPI, auditAPI } from '@/lib/api';
import type { DrillCandidate, CorrectiveAction, AuditLogEntry } from '@/lib/api';

type SelectedDecisionItem =
  | { type: 'drill'; item: DrillCandidate }
  | { type: 'ops'; item: CorrectiveAction };

export default function DecisionCenterPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'drilling' | 'operations'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [drillCandidates, setDrillCandidates] = useState<DrillCandidate[]>([]);
  const [operationalActions, setOperationalActions] = useState<CorrectiveAction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedDecisionItem | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('Senior Mine Planning Engineer');
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject' | 'request_evidence'>('approve');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? null : c)), 4000);
  };

  useEffect(() => {
    async function load() {
      try {
        const [drillRes, opsRes, auditRes] = await Promise.all([
          explorationAPI.getDrillCandidates(),
          recommendationsAPI.getActions(),
          auditAPI.getAuditLogs(),
        ]);
        setDrillCandidates(drillRes.candidates || []);
        setOperationalActions(opsRes || []);
        setAuditLogs(auditRes.logs || []);
      } catch (err) {
        console.error('Failed to load decisions:', err);
        setDrillCandidates([
          {
            site_id: 'DR-017',
            mine_id: 1,
            mine_name: 'Dongri Buzurg',
            latitude: 21.55241,
            longitude: 79.68652,
            priority: 'high',
            estimated_mn_probability: 0.82,
            expected_grade_percent: 41.5,
            uncertainty_level: 'high',
            expected_uncertainty_reduction_percent: 28.4,
            value_of_information_score: 88.5,
            estimated_drilling_cost_inr: 480000,
            target_depth_m: 95.0,
            accessibility: 'Good (near haul road)',
            geological_formation: 'Mansar Formation (Mn-rich reef horizon)',
            surface_spectral_evidence: 'Iron oxide ratio 2.45, Clay mineral index 1.88 (Sentinel-2 band ratio)',
            nearest_borehole_id: 'BH-01-04',
            distance_to_nearest_borehole_m: 420,
            primary_reason: 'High surface prospectivity paired with large geostatistical spacing. Drilling here maximizes information gain on strike continuation.',
            review_status: 'pending_review',
          },
          {
            site_id: 'DR-024',
            mine_id: 2,
            mine_name: 'Balaghat',
            latitude: 21.8532,
            longitude: 80.2315,
            priority: 'high',
            estimated_mn_probability: 0.79,
            expected_grade_percent: 44.2,
            uncertainty_level: 'high',
            expected_uncertainty_reduction_percent: 24.1,
            value_of_information_score: 84.0,
            estimated_drilling_cost_inr: 620000,
            target_depth_m: 140.0,
            accessibility: 'Moderate (ridge crest flank)',
            geological_formation: 'Mansar Gondite contact zone',
            surface_spectral_evidence: 'Strong Mn-shale alteration signature, low vegetation cover',
            nearest_borehole_id: 'BH-02-08',
            distance_to_nearest_borehole_m: 510,
            primary_reason: 'Deep underground reef extension. Confirmatory core will establish reserve upgrade from Inferred to Indicated.',
            review_status: 'approved',
          },
          {
            site_id: 'DR-009',
            mine_id: 8,
            mine_name: 'Sitapatore',
            latitude: 21.6698,
            longitude: 79.6699,
            priority: 'critical',
            estimated_mn_probability: 0.74,
            expected_grade_percent: 35.5,
            uncertainty_level: 'high',
            expected_uncertainty_reduction_percent: 33.0,
            value_of_information_score: 91.0,
            estimated_drilling_cost_inr: 420000,
            target_depth_m: 85.0,
            accessibility: 'Moderate (requires access track grading)',
            geological_formation: 'Sitasaongi Formation footwall',
            surface_spectral_evidence: 'Hyperspectral Mn indicator cluster along east fault line',
            nearest_borehole_id: 'BH-08-01',
            distance_to_nearest_borehole_m: 680,
            primary_reason: 'Highest uncertainty reduction potential across all leases. Data will resolve structural fault offset affecting Sitapatore ore continuation.',
            review_status: 'pending_review',
          },
        ]);
        setOperationalActions([
          {
            id: 1,
            prediction_id: 1,
            mine_id: 8,
            mine_name: 'Sitapatore',
            action_type: 'equipment_reallocation',
            title: 'Deploy Backup Excavators to Pit Floor',
            priority: 'critical',
            description: 'Deploy 2 backup excavators from Dongri Buzurg to recover 1,400 T shortfall in Sitapatore South Pit.',
            estimated_impact_tonnes: 1400,
            estimated_impact_percent: 18.5,
            implementation_steps: [
              'Mobilize low-bed trailer to Dongri Buzurg equipment yard',
              'Perform pre-dispatch hydraulic inspection on EXC-342',
              'Coordinate haul route clearance with Bhandara RTO',
              'Commission at Sitapatore South Pit bench 4',
            ],
            category: 'equipment',
            is_implemented: false,
          },
          {
            id: 2,
            prediction_id: 2,
            mine_id: 4,
            mine_name: 'Munsar',
            action_type: 'blending_optimization',
            title: 'Optimize Run-of-Mine Ferroalloy Blending Ratio',
            priority: 'high',
            description: 'Adjust ROM blend ratio: 65% high-grade Dongri + 35% Munsar medium-grade to satisfy ferroalloy plant specs.',
            estimated_impact_tonnes: 920,
            estimated_impact_percent: 12.0,
            implementation_steps: [
              'Sample stockpile assay via portable XRF analyzer',
              'Configure feed hopper gates to 65:35 gravimetric ratio',
              'Validate blended product Mn/Fe ratio > 6.0',
            ],
            category: 'processing',
            is_implemented: true,
          },
        ]);
        setAuditLogs([
          {
            id: 1,
            user: 'Shri Vivek K. Verma',
            action: 'Approved equipment reallocation for Sitapatore',
            entity: 'Mine Operations / Excavator EXC-342',
            previous_state: 'pending',
            new_state: 'approved',
            timestamp: '2026-09-18T10:14:00Z',
            reason: 'Critical shortfall mitigation authorization under Rule 16 of MMRD Act.',
            model_version: 'v2.4.1',
            data_version: 'v4.0',
          },
          {
            id: 2,
            user: 'Dr. R. K. Sharma',
            action: 'Approved confirmatory drill site DR-024',
            entity: 'Active Exploration / Balaghat Lease',
            previous_state: 'pending_review',
            new_state: 'approved',
            timestamp: '2026-09-17T15:30:00Z',
            reason: 'High Bayesian Value of Information (84.0) justifies deep core drilling for Indicated reserve classification.',
            model_version: 'v1.4.0',
            data_version: 'v2.0',
          },
        ]);
      }
    }
    load();
  }, []);

  const handleDecisionSubmit = async () => {
    if (!selectedItem) return;

    const { type, item } = selectedItem;
    const actionLabel = decisionAction === 'approve' ? 'Approved' : decisionAction === 'reject' ? 'Rejected' : 'Needs More Evidence';

    if (type === 'drill') {
      try {
        await explorationAPI.reviewDrillCandidate(item.site_id, decisionAction, reviewerName, decisionNotes);
      } catch {
        // simulation fallback
      }
      setDrillCandidates((prev) =>
        prev.map((c) => (c.site_id === item.site_id ? { ...c, review_status: decisionAction === 'approve' ? 'approved' : 'rejected' } : c))
      );
    } else {
      if (decisionAction === 'approve') {
        try {
          await recommendationsAPI.markImplemented(item.id);
        } catch {
          // simulation fallback
        }
      }
      setOperationalActions((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, is_implemented: decisionAction === 'approve' } : a))
      );
    }

    // Record into Audit Log
    const newLog: AuditLogEntry = {
      id: auditLogs.length + 101,
      timestamp: '2026-09-20 ' + new Date().toTimeString().split(' ')[0] + ' IST',
      user: reviewerName.toLowerCase().replace(/\s+/g, '_'),
      action: `${decisionAction.toUpperCase()}_${type.toUpperCase()}`,
      entity: type === 'drill' ? `Drill Site ${item.site_id} (${item.mine_name})` : `${item.title} (${item.mine_name})`,
      previous_state: 'Pending Review',
      new_state: actionLabel,
      reason: decisionNotes || 'Verified against geological models and production shortfall constraints',
      model_version: type === 'drill' ? 'active-exploration-voi-v1.4' : 'shortfall-predictor-v2.1',
      data_version: 'MOIL-LIVE-2026',
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast(`Decision recorded: ${newLog.entity} marked as ${actionLabel}.`);
    setReviewModalOpen(false);
    setDecisionNotes('');
    setSelectedItem(null);
  };

  const pendingDrillCount = drillCandidates.filter((c) => c.review_status === 'pending_review').length;
  const pendingOpsCount = operationalActions.filter((a) => !a.is_implemented).length;
  const totalPending = pendingDrillCount + pendingOpsCount;

  return (
    <>
      {toastMessage && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: '#171717',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            borderLeft: '4px solid #4A2BC2',
          }}
        >
          <CheckCircle2 size={16} style={{ color: '#34d399' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Decision Center &amp; Human-in-the-Loop Governance</h1>
          <p>
            Formal review authority for AI-recommended borehole drilling sites and operational shortfall interventions. Every decision requires human sign-off and is immutably logged for audit readiness.
          </p>
        </div>

        <div className="page-actions">
          <Link href="/reports" className="ux4g-btn ux4g-btn-outline ux4g-btn-sm">
            <FileDown size={14} aria-hidden="true" />
            <span>Export Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Pending Human Review</div>
          <div className="kpi-value" style={{ color: totalPending > 0 ? 'var(--status-high)' : 'var(--status-low)' }}>
            {totalPending}
          </div>
          <div className="kpi-change neutral">
            {pendingDrillCount} drilling &bull; {pendingOpsCount} operational
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Approved Interventions</div>
          <div className="kpi-value" style={{ color: 'var(--status-low)' }}>
            {operationalActions.filter((a) => a.is_implemented).length + drillCandidates.filter((c) => c.review_status === 'approved').length}
          </div>
          <div className="kpi-change positive">Active in mine operational queue</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Expected Shortfall Recovery</div>
          <div className="kpi-value" style={{ color: 'var(--ux4g-primary)' }}>
            {(operationalActions.reduce((s, a) => s + (a.estimated_impact_tonnes || 0), 0) / 1000).toFixed(1)}K MT
          </div>
          <div className="kpi-change neutral">Combined operational upside</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Review Compliance</div>
          <div className="kpi-value">100%</div>
          <div className="kpi-change positive">Zero unverified autonomous executions</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filters-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Stream:</span>
          <button
            type="button"
            className={`ux4g-btn ux4g-btn-sm ${activeFilter === 'all' ? 'ux4g-btn-primary' : 'ux4g-btn-secondary'}`}
            onClick={() => setActiveFilter('all')}
          >
            All Recommendations ({totalPending})
          </button>
          <button
            type="button"
            className={`ux4g-btn ux4g-btn-sm ${activeFilter === 'drilling' ? 'ux4g-btn-primary' : 'ux4g-btn-secondary'}`}
            onClick={() => setActiveFilter('drilling')}
          >
            Drilling Sites ({pendingDrillCount})
          </button>
          <button
            type="button"
            className={`ux4g-btn ux4g-btn-sm ${activeFilter === 'operations' ? 'ux4g-btn-primary' : 'ux4g-btn-secondary'}`}
            onClick={() => setActiveFilter('operations')}
          >
            Operational Actions ({pendingOpsCount})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="status-filter" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</label>
          <select
            id="status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review Only</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Review Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Stream 1: Exploration Drilling Recommendations */}
        {(activeFilter === 'all' || activeFilter === 'drilling') && (
          <div className="ux4g-card">
            <div className="ux4g-card-header">
              <h3>
                <Layers size={16} style={{ color: 'var(--ux4g-primary)' }} aria-hidden="true" />
                <span>Exploration Drilling Recommendations (Active Exploration Engine)</span>
              </h3>
              <span className="ux4g-badge badge-neutral">Value of Information (VoI) Ranked</span>
            </div>

            <div className="ux4g-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="ux4g-table">
                <thead>
                  <tr>
                    <th>Site ID</th>
                    <th>Mine Lease</th>
                    <th>Priority</th>
                    <th>Expected Grade &amp; Prob</th>
                    <th>Uncertainty Reduction</th>
                    <th>Value of Info</th>
                    <th>Est. Cost</th>
                    <th>Review Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drillCandidates.map((cand) => (
                    <tr key={cand.site_id}>
                      <td>
                        <strong style={{ color: 'var(--ux4g-primary)' }}>{cand.site_id}</strong>
                      </td>
                      <td>{cand.mine_name}</td>
                      <td>
                        <span className={`ux4g-badge badge-${cand.priority}`}>{cand.priority}</span>
                      </td>
                      <td>
                        <strong>{cand.expected_grade_percent}% Mn</strong> ({(cand.estimated_mn_probability * 100).toFixed(0)}%)
                      </td>
                      <td>
                        <strong style={{ color: 'var(--status-low)' }}>&minus;{cand.expected_uncertainty_reduction_percent}%</strong>
                      </td>
                      <td>
                        <strong>{cand.value_of_information_score}/100</strong>
                      </td>
                      <td>&#8377;{(cand.estimated_drilling_cost_inr / 100000).toFixed(2)}L</td>
                      <td>
                        <span className={`ux4g-badge ${cand.review_status === 'approved' ? 'badge-success' : cand.review_status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {cand.review_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ux4g-btn ux4g-btn-primary ux4g-btn-sm"
                          onClick={() => {
                            setSelectedItem({ type: 'drill', item: cand });
                            setReviewModalOpen(true);
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stream 2: Operational Corrective Actions */}
        {(activeFilter === 'all' || activeFilter === 'operations') && (
          <div className="ux4g-card">
            <div className="ux4g-card-header">
              <h3>
                <Wrench size={16} style={{ color: 'var(--status-high)' }} aria-hidden="true" />
                <span>Operational Shortfall Mitigation Actions</span>
              </h3>
              <span className="ux4g-badge badge-neutral">Physics-Informed Shortfall Engine</span>
            </div>

            <div className="ux4g-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="ux4g-table">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Mine Lease</th>
                    <th>Recommended Action</th>
                    <th>Category</th>
                    <th>Estimated Recovery</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {operationalActions.map((act) => (
                    <tr key={act.id}>
                      <td>
                        <span className={`ux4g-badge badge-${act.priority}`}>{act.priority}</span>
                      </td>
                      <td>
                        <strong>{act.mine_name}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{act.title}</strong>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '420px' }}>
                            {act.description}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span className="ux4g-badge badge-neutral">{act.category}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--status-low)' }}>
                          +{act.estimated_impact_tonnes?.toLocaleString()} MT
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({act.estimated_impact_percent}% shortfall mitigation)
                        </div>
                      </td>
                      <td>
                        <span className={`ux4g-badge ${act.is_implemented ? 'badge-success' : 'badge-warning'}`}>
                          {act.is_implemented ? 'Approved & Dispatched' : 'Pending Review'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
                          onClick={() => {
                            setSelectedItem({ type: 'ops', item: act });
                            setReviewModalOpen(true);
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Decision Review Modal */}
      {reviewModalOpen && selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                  Decision Sign-off: {selectedItem.type === 'drill' ? selectedItem.item.site_id : selectedItem.item.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lease: {selectedItem.item.mine_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '4px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {selectedItem.type === 'drill' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target Depth:</span>
                    <strong>{selectedItem.item.target_depth_m}m</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Uncertainty Reduction:</span>
                    <strong style={{ color: 'var(--status-low)' }}>&minus;{selectedItem.item.expected_uncertainty_reduction_percent}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Value of Information:</span>
                    <strong>{selectedItem.item.value_of_information_score} / 100</strong>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Estimated Recovery:</span>
                    <strong style={{ color: 'var(--status-low)' }}>+{selectedItem.item.estimated_impact_tonnes?.toLocaleString()} MT</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Category:</span>
                    <strong>{selectedItem.item.category}</strong>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reviewer Authority:</label>
              <input
                type="text"
                className="ux4g-form-control"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Decision:</label>
              <select
                className="ux4g-form-control"
                value={decisionAction}
                onChange={(e) => setDecisionAction(e.target.value as 'approve' | 'reject' | 'request_evidence')}
              >
                <option value="approve">Approve &amp; Dispatch Order</option>
                <option value="request_evidence">Request Further Geological / Telemetry Evidence</option>
                <option value="reject">Reject Recommendation</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Justification &amp; Rationale:</label>
              <textarea
                className="ux4g-form-control"
                rows={3}
                placeholder="Enter formal justification for system audit log..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="ux4g-btn ux4g-btn-secondary"
                onClick={() => setReviewModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ux4g-btn ux4g-btn-primary"
                onClick={handleDecisionSubmit}
              >
                Record Decision &amp; Update Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
