'use client';

import { useEffect, useState } from 'react';
import { FileDown, ShieldCheck, Search, CheckCircle2, Award, FileText } from 'lucide-react';
import { auditAPI } from '@/lib/api';
import type { AuditLogEntry } from '@/lib/api';
import { generateGovernmentPDF } from '@/lib/pdfReportGenerator';

export default function ReportsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await auditAPI.getAuditLogs();
        setLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      }
    }
    load();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action.toLowerCase().includes(filterAction.toLowerCase());
    return matchesSearch && matchesAction;
  });

  const handleDownloadPDF = (reportType: 'Exploration_Prospectivity_Report' | 'Production_Shortfall_Report' | 'Human_Decision_Governance_Log' | 'Executive_Audit_Trail_Report') => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      Exploration_Prospectivity_Report: {
        title: 'Manganese Prospectivity & Next-Best Borehole Location Dossier',
        subtitle: 'Comprehensive geostatistical inference, 3D block model grades, and Bayesian Value of Information (VoI) ranked next-drill locations across MOIL leases in Nagpur, Bhandara, and Balaghat districts.',
      },
      Production_Shortfall_Report: {
        title: 'Production Shortfall Forecast & IMD Weather Vulnerability Brief',
        subtitle: 'Multi-mine physics-informed operational yield forecasts, equipment downtime root causes, rainfall inundation thresholds, and simulated mitigation scenarios.',
      },
      Human_Decision_Governance_Log: {
        title: 'Human Sign-Off & Review Accountability Governance Record',
        subtitle: 'Statutory traceability ledger documenting authorized personnel sign-offs, evidence reviews, and state transitions for exploratory drilling and equipment reallocation.',
      },
      Executive_Audit_Trail_Report: {
        title: 'Executive Strategic Dossier & Immutable System Governance Audit Trail',
        subtitle: 'High-level synthesis of 9 active MOIL mining leases, production performance against targets, model drift governance telemetry, and authenticated decision logs.',
      },
    };

    const info = titles[reportType] || {
      title: 'ANVESHA Official Technical Report',
      subtitle: 'Government of India e-Governance certified technical documentation.',
    };

    generateGovernmentPDF({
      reportType,
      title: info.title,
      subtitle: info.subtitle,
      classification: 'RESTRICTED // OFFICIAL USE ONLY',
      officerName: 'Dr. R. K. Sharma, Ph.D. (IIT Roorkee)',
      officerDesignation: 'Chief Exploration Geologist & Head of Remote Sensing',
      records: filteredLogs,
    });

    setDownloadNotice(`✓ Official Government PDF generated and downloaded with Officer Signature and Official Seal.`);
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  const handleDownloadJSON = (reportType: string) => {
    const reportData = {
      report_title: `ANVESHA — ${reportType}`,
      generated_at: new Date().toISOString(),
      governance_framework: "Government of India UX4G 3.0 • WCAG 2.1 AA",
      audit_records_included: filteredLogs.length,
      records: filteredLogs,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ANVESHA_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadNotice(`✓ ${reportType} JSON raw data exported.`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <>
      {downloadNotice && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: '#171717',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            borderLeft: '5px solid #4A2BC2',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#34d399' }} />
          <span>{downloadNotice}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Audit-Ready Reports &amp; Immutable System Governance Log</h1>
          <p>
            Cryptographically timestamped operational trace of all AI drill recommendations, what-if simulations, model promotions, and human sign-offs across MOIL mining leases.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="ux4g-btn ux4g-btn-primary ux4g-btn-sm"
            onClick={() => handleDownloadPDF('Executive_Audit_Trail_Report')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileDown size={14} aria-hidden="true" />
            <span>Export Executive Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Official Government Certification Notice Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F1F3F7 0%, #FFFFFF 100%)',
          border: '1px solid var(--border-default)',
          borderLeft: '4px solid var(--ux4g-primary)',
          borderRadius: '4px',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--ux4g-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ux4g-primary)',
              flexShrink: 0,
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
              Statutory Government Format with Official Stamp &amp; Signature
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              All exported technical reports are rendered in official Ministry of Steel / MOIL Limited memorandum format, complete with authentic circular approval seal and Chief Exploration Geologist verification credentials.
            </span>
          </div>
        </div>
        <span className="ux4g-badge badge-success" style={{ fontSize: '0.75rem' }}>
          ✓ Ministry of Steel Compliant
        </span>
      </div>

      {/* Available Formal Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="ux4g-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <span className="ux4g-badge badge-neutral">Exploration Dossier</span>
            <strong style={{ fontSize: '1.05rem', display: 'block', marginTop: '0.4rem' }}>
              Manganese Prospectivity &amp; Next-Drill Report
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
              Summary of 3D inferred prospectivity, borehole assay logs, and Bayesian Value of Information (VoI) ranked next-drill locations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-primary ux4g-btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => handleDownloadPDF('Exploration_Prospectivity_Report')}
            >
              <FileDown size={14} aria-hidden="true" />
              <span>Download Official PDF (Signed &amp; Sealed)</span>
            </button>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
              onClick={() => handleDownloadJSON('Exploration_Prospectivity_Report')}
              title="Export raw JSON dataset"
            >
              <FileText size={13} aria-hidden="true" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        <div className="ux4g-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <span className="ux4g-badge badge-warning">Operations Audit</span>
            <strong style={{ fontSize: '1.05rem', display: 'block', marginTop: '0.4rem' }}>
              Production Shortfall &amp; Weather Sensitivity Brief
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
              Physics-informed shortfall forecasts, IMD rainfall threshold impact, equipment downtime bottlenecks, and what-if simulation results.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-primary ux4g-btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => handleDownloadPDF('Production_Shortfall_Report')}
            >
              <FileDown size={14} aria-hidden="true" />
              <span>Download Official PDF (Signed &amp; Sealed)</span>
            </button>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
              onClick={() => handleDownloadJSON('Production_Shortfall_Report')}
              title="Export raw JSON dataset"
            >
              <FileText size={13} aria-hidden="true" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        <div className="ux4g-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <span className="ux4g-badge badge-success">Decision Governance</span>
            <strong style={{ fontSize: '1.05rem', display: 'block', marginTop: '0.4rem' }}>
              Human Sign-off &amp; Review Accountability Log
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
              Every approved drill site and operational dispatch order stamped with reviewer identity, technical justification, and state change.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-primary ux4g-btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => handleDownloadPDF('Human_Decision_Governance_Log')}
            >
              <FileDown size={14} aria-hidden="true" />
              <span>Download Official PDF (Signed &amp; Sealed)</span>
            </button>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
              onClick={() => handleDownloadJSON('Human_Decision_Governance_Log')}
              title="Export raw JSON dataset"
            >
              <FileText size={13} aria-hidden="true" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="ux4g-card">
        <div className="ux4g-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3>
            <ShieldCheck size={16} style={{ color: 'var(--status-low)' }} aria-hidden="true" />
            <span>System Audit Log ({filteredLogs.length} Events)</span>
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="search"
                className="ux4g-form-control"
                placeholder="Search user, entity, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
              />
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="filter-select"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            >
              <option value="all">All Actions</option>
              <option value="APPROVED">Approvals</option>
              <option value="DEPLOYED">Deployments</option>
              <option value="SIMULATED">Simulations</option>
            </select>
          </div>
        </div>

        <div className="ux4g-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="ux4g-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Authorized User</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>State Transition</th>
                <th>Justification &amp; Rationale</th>
                <th>Model / Data Version</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{log.timestamp}</td>
                  <td>
                    <strong style={{ color: 'var(--ux4g-primary)' }}>{log.user}</strong>
                  </td>
                  <td>
                    <span className={`ux4g-badge ${log.action.includes('APPROVED') ? 'badge-success' : 'badge-neutral'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.entity}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{log.previous_state}</span> &rarr;{' '}
                    <strong>{log.new_state}</strong>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                    {log.reason}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.model_version}<br />
                    {log.data_version}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
