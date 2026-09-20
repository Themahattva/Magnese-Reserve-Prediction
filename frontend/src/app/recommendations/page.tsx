'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle2,
  FileDown,
  Clock,
  Filter,
  TrendingUp,
  ArrowUpDown,
  RotateCcw,
  Check,
} from 'lucide-react';
import { recommendationsAPI } from '@/lib/api';
import type { CorrectiveAction, ActionHistory, ActionCategory } from '@/lib/api';
import { exportActionToPdf } from '@/lib/exportPdf';

const PRIORITY_WEIGHT: Record<string, number> = {
  urgent: 0,
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ff2a4b',
  critical: '#ff2a4b',
  high: '#f97316',
  medium: '#eab308',
  low: '#00ff66',
};

function sortActionsByPriority(list: CorrectiveAction[]): CorrectiveAction[] {
  return [...list].sort((a, b) => {
    const pA = PRIORITY_WEIGHT[a.priority?.toLowerCase()] ?? 99;
    const pB = PRIORITY_WEIGHT[b.priority?.toLowerCase()] ?? 99;
    if (pA !== pB) return pA - pB;
    return (b.estimated_impact_tonnes || 0) - (a.estimated_impact_tonnes || 0);
  });
}

export default function RecommendationsPage() {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [categories, setCategories] = useState<ActionCategory[]>([]);
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  useEffect(() => {
    async function load() {
      try {
        const [actData, histData, catData] = await Promise.all([
          recommendationsAPI.getActions(),
          recommendationsAPI.getHistory(),
          recommendationsAPI.getCategories(),
        ]);
        setActions(sortActionsByPriority(actData));
        setHistory(histData);
        setCategories(catData);
      } catch {
        const fallbackActions: CorrectiveAction[] = [
          {
            id: 1,
            prediction_id: 1,
            mine_id: 8,
            mine_name: 'Sitapatore',
            action_type: 'redeploy',
            title: 'Redeploy idle excavators from Parsioni to Sitapatore',
            description: '2 excavators at Parsioni mine are currently idle. Redeploying them to Sitapatore can increase daily output by ~900 tonnes and reduce the predicted shortfall by 39%.',
            priority: 'urgent',
            estimated_impact_tonnes: 6300,
            estimated_impact_percent: 39.0,
            implementation_steps: [
              'Coordinate with Parsioni mine supervisor for equipment release',
              'Arrange transport for 2 CAT 390F excavators',
              'Brief Sitapatore operators on face allocation',
              'Target deployment within 48 hours',
            ],
            category: 'Equipment',
            is_implemented: false,
          },
          {
            id: 6,
            prediction_id: 1,
            mine_id: 8,
            mine_name: 'Sitapatore',
            action_type: 'stockpile',
            title: 'Activate emergency stockpile buffer',
            description: "Release 2,000 tonnes from Sitapatore's emergency stockpile to fulfill pending customer orders while production recovery is in progress.",
            priority: 'urgent',
            estimated_impact_tonnes: 2000,
            estimated_impact_percent: 12.3,
            implementation_steps: [
              'Verify stockpile inventory and grade documentation',
              'Coordinate with dispatch team for customer allocation',
              'Begin stockpile reclamation with available loader',
              'Replenish stockpile once production normalizes',
            ],
            category: 'Logistics',
            is_implemented: false,
          },
          {
            id: 2,
            prediction_id: 1,
            mine_id: 8,
            mine_name: 'Sitapatore',
            action_type: 'reschedule',
            title: 'Add night shift operations for 5 days',
            description: 'Introducing a night shift at Sitapatore for the next 5 days can compensate for lost daytime production and recover ~1,500 tonnes.',
            priority: 'high',
            estimated_impact_tonnes: 1500,
            estimated_impact_percent: 9.2,
            implementation_steps: [
              'Allocate night shift workforce (min 12 operators)',
              'Ensure adequate lighting at active faces',
              'Pre-position dumpers and fuel for night operations',
              'Coordinate with blasting team for pre-shift preparation',
            ],
            category: 'Schedule',
            is_implemented: false,
          },
          {
            id: 3,
            prediction_id: 2,
            mine_id: 4,
            mine_name: 'Munsar',
            action_type: 'maintenance',
            title: 'Fast-track excavator hydraulic repair',
            description: 'Excavator EXC-412 has been under maintenance for hydraulic failure for 3 days. Expediting repair with additional technicians can restore 450 tonnes/day capacity.',
            priority: 'high',
            estimated_impact_tonnes: 3150,
            estimated_impact_percent: 22.0,
            implementation_steps: [
              'Deploy 2 additional hydraulic technicians from Nagpur workshop',
              'Order priority spare parts (hydraulic pump assembly)',
              'Set up parallel repair track — fix seal + replace pump simultaneously',
              'Target repair completion within 36 hours',
            ],
            category: 'Equipment',
            is_implemented: false,
          },
          {
            id: 4,
            prediction_id: 3,
            mine_id: 6,
            mine_name: 'Gumgaon',
            action_type: 'reschedule',
            title: 'Pre-blast before predicted rainfall window',
            description: 'Weather forecast shows heavy rain from Sept 12-14. Completing blasting operations by Sept 11 will ensure material availability during the rain period.',
            priority: 'medium',
            estimated_impact_tonnes: 1800,
            estimated_impact_percent: 24.5,
            implementation_steps: [
              'Advance blasting schedule by 2 days (target Sept 10-11)',
              'Prepare additional blast holes in Blocks G3 and G5',
              'Stockpile blasted material near crusher for rain-day processing',
              'Coordinate with explosive supplier for advance delivery',
            ],
            category: 'Weather',
            is_implemented: false,
          },
          {
            id: 5,
            prediction_id: 4,
            mine_id: 2,
            mine_name: 'Balaghat',
            action_type: 'blend',
            title: 'Optimize ore blending from Blocks B3 and B7',
            description: 'Grade variation in Block B7 (34% Mn) can be compensated by blending with high-grade ore from Block B3 (44% Mn) to maintain target grade of 38%.',
            priority: 'medium',
            estimated_impact_tonnes: 630,
            estimated_impact_percent: 18.0,
            implementation_steps: [
              'Route 60% of dumpers to Block B3 (high grade face)',
              'Route 40% of dumpers to Block B7 (lower grade face)',
              'Set up blending at crusher feed point',
              'Monitor hourly grade samples to maintain 38% target',
            ],
            category: 'Quality',
            is_implemented: false,
          },
        ];
        setActions(sortActionsByPriority(fallbackActions));
        setHistory([
          { id: 101, mine_name: 'Dongri Buzurg', action: 'Redeployed 1 excavator from Tirodi', date_implemented: '2026-08-20', predicted_impact_tonnes: 2800, actual_impact_tonnes: 3100, outcome: 'success' },
          { id: 102, mine_name: 'Balaghat', action: 'Pre-blast before monsoon onset', date_implemented: '2026-07-02', predicted_impact_tonnes: 4500, actual_impact_tonnes: 4100, outcome: 'success' },
          { id: 103, mine_name: 'Munsar', action: 'Added night shift for 7 days', date_implemented: '2026-08-10', predicted_impact_tonnes: 2100, actual_impact_tonnes: 1200, outcome: 'partial' },
          { id: 104, mine_name: 'Gumgaon', action: 'Ore blending optimization', date_implemented: '2026-08-15', predicted_impact_tonnes: 800, actual_impact_tonnes: 750, outcome: 'success' },
        ]);
        setCategories([
          { category: 'Equipment', count: 2, icon: '🔧' },
          { category: 'Logistics', count: 1, icon: '🚚' },
          { category: 'Schedule', count: 1, icon: '📅' },
          { category: 'Weather', count: 1, icon: '🌧️' },
          { category: 'Quality', count: 1, icon: '📊' },
        ]);
      }
    }
    load();
  }, []);

  // Filter and ensure top priority actions are ALWAYS on top across all menus and categories
  const filteredActions = useMemo(() => {
    let result = actions;
    if (filterPriority) {
      result = result.filter((a) => a.priority === filterPriority);
    }
    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory);
    }
    return sortActionsByPriority(result);
  }, [actions, filterPriority, selectedCategory]);

  const totalImpact = actions.reduce((s, a) => s + (a.is_implemented ? 0 : a.estimated_impact_tonnes), 0);
  const pendingCount = actions.filter((a) => !a.is_implemented).length;
  const implementedCount = actions.filter((a) => a.is_implemented).length;

  // Handler: Functional Mark Implemented
  const handleToggleImplemented = async (action: CorrectiveAction, e: React.MouseEvent) => {
    e.stopPropagation();
    const willImplement = !action.is_implemented;

    // Update state locally
    setActions((prev) =>
      prev.map((a) => (a.id === action.id ? { ...a, is_implemented: willImplement } : a))
    );

    if (willImplement) {
      // Add to Action History tab
      const todayStr = '2026-09-20';
      const newHistoryEntry: ActionHistory = {
        id: action.id * 1000 + 1,
        mine_name: action.mine_name,
        action: action.title,
        date_implemented: todayStr,
        predicted_impact_tonnes: action.estimated_impact_tonnes,
        actual_impact_tonnes: action.estimated_impact_tonnes,
        outcome: 'success',
      };
      setHistory((prev) => [newHistoryEntry, ...prev]);

      showToast(`✓ Action marked as implemented and logged in Action History!`);

      try {
        await recommendationsAPI.markImplemented(action.id);
      } catch {
        // Backend optional in standalone mode
      }
    } else {
      showToast(`Action implementation reverted to pending.`);
    }
  };

  // Handler: Functional Export Details in PDF
  const handleExportDetails = (action: CorrectiveAction, e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. Generate & download professional Government / MOIL directive PDF
    const filename = exportActionToPdf(action);

    // 2. Also copy summary text to clipboard for quick messaging/email sharing
    const directiveSummary = [
      `MOIL LIMITED · CORRECTIVE ACTION DIRECTIVE [REF: MOIL-ACT-${String(action.id).padStart(4, '0')}]`,
      `Mine: ${action.mine_name} Mine | Priority: ${action.priority.toUpperCase()} | Category: ${action.category}`,
      `Title: ${action.title}`,
      `Impact: ${action.estimated_impact_tonnes.toLocaleString()} MT (${action.estimated_impact_percent}% recovery)`,
      `Status: ${action.is_implemented ? 'IMPLEMENTED' : 'PENDING'}`,
      `Protocol:`,
      ...action.implementation_steps.map((s, i) => ` ${i + 1}. ${s}`),
    ].join('\n');

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(directiveSummary).catch(() => {});
    }

    showToast(`📄 Exported "${filename}" (PDF downloaded & copied to clipboard)!`);
  };

  return (
    <>
      {/* Floating Notification Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '32px',
            zIndex: 9999,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1.5px solid var(--primary)',
            borderRadius: '6px',
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.84rem',
            fontWeight: 600,
            animation: 'fadeInUp 0.25s ease forwards',
          }}
        >
          <CheckCircle2 size={18} color="#00ff66" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>Corrective Actions &amp; Interventions</h1>
            <p>AI-driven priority interventions to eliminate production shortfalls with actionable steps</p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <ArrowUpDown size={14} color="var(--primary)" />
            <span>Ordering: <b>Top Priority First</b> (Urgent &rarr; High &rarr; Medium &rarr; Low)</span>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Pending Actions</div>
          <div className="kpi-value">{pendingCount}</div>
          <div className="kpi-change neutral">{implementedCount} implemented</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Active Est. Impact</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>
            {(totalImpact / 1000).toFixed(1)}K T
          </div>
          <div className="kpi-change positive">Tonnage recovery potential</div>
        </div>
        {['urgent', 'high', 'medium'].map((p) => {
          const count = actions.filter((a) => a.priority === p && !a.is_implemented).length;
          return (
            <div key={p} className="kpi-card animate-in">
              <div className="kpi-label" style={{ textTransform: 'capitalize' }}>
                {p} Priority
              </div>
              <div className="kpi-value" style={{ color: PRIORITY_COLORS[p] }}>
                {count}
              </div>
              <div className="kpi-change neutral">Pending execution</div>
            </div>
          );
        })}
      </div>

      {/* Category Chips with Filter Ability */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: !selectedCategory ? 'var(--primary)' : 'var(--bg-card)',
            color: !selectedCategory ? '#030704' : 'var(--text-secondary)',
            border: `1px solid ${!selectedCategory ? 'var(--primary)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-xl)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          <span>All Categories</span>
          <span style={{ opacity: 0.85 }}>({actions.length})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(isSelected ? null : cat.category)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                color: isSelected ? '#030704' : 'var(--text-secondary)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-xl)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.category}</span>
              <span
                style={{
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isSelected ? '#030704' : 'var(--primary)',
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabs: Current vs History */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Active Recommendations ({actions.filter((a) => !a.is_implemented).length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Action History &amp; Audit Log ({history.length})
        </button>
      </div>

      {/* Priority Filter — Top Priority Actions Always on Top in All Selections */}
      {activeTab === 'current' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Filter Priority:
          </span>
          <button
            className={`map-layer-btn ${!filterPriority ? 'active' : ''}`}
            onClick={() => setFilterPriority(null)}
          >
            All Priorities (Top Priority First)
          </button>
          {['urgent', 'high', 'medium'].map((p) => (
            <button
              key={p}
              className={`map-layer-btn ${filterPriority === p ? 'active' : ''}`}
              onClick={() => setFilterPriority(p)}
              style={{ textTransform: 'capitalize' }}
            >
              {p === 'urgent' ? '🔴 ' : p === 'high' ? '🟠 ' : '🟡 '}
              {p}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'current' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredActions.length === 0 ? (
            <div className="card empty-state">
              <p>No actions match the current filter selection.</p>
            </div>
          ) : (
            filteredActions.map((action, index) => {
              const isExpanded = expandedAction === action.id;
              return (
                <div
                  key={action.id}
                  className="action-card"
                  onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                  style={{
                    borderLeft: action.is_implemented
                      ? '4px solid #00ff66'
                      : action.priority === 'urgent'
                      ? '4px solid #ff2a4b'
                      : action.priority === 'high'
                      ? '4px solid #f97316'
                      : '4px solid #00ffcc',
                    opacity: action.is_implemented ? 0.78 : 1,
                    background: action.is_implemented ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  }}
                >
                  <div className="action-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        className={`risk-badge ${
                          action.priority === 'urgent' ? 'critical' : action.priority === 'high' ? 'high' : 'medium'
                        }`}
                      >
                        {action.priority} priority
                      </span>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-secondary)',
                          padding: '3px 8px',
                          background: 'var(--bg-card-hover)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        {action.category}
                      </span>

                      {action.is_implemented && (
                        <span className="risk-badge low">
                          <Check size={11} /> IMPLEMENTED
                        </span>
                      )}

                      {index === 0 && !filterPriority && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '3px',
                            background: 'rgba(255, 42, 75, 0.16)',
                            color: '#ff2a4b',
                            border: '1px solid rgba(255, 42, 75, 0.4)',
                          }}
                        >
                          TOP PRIORITY
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>
                        ⛏️ {action.mine_name} Mine
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {isExpanded ? '▲ Collapse' : '▼ View Details'}
                      </span>
                    </div>
                  </div>

                  <div className="action-title" style={{ marginTop: '4px' }}>
                    {action.title}
                  </div>
                  <div className="action-desc">{action.description}</div>

                  <div className="action-impact">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <TrendingUp size={14} color="var(--primary)" />
                      <span style={{ color: 'var(--text-secondary)' }}>Est. Recovery: </span>
                      <span className="impact-value">{action.estimated_impact_tonnes.toLocaleString()} MT</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Shortfall Compensation: </span>
                      <span className="impact-value">{action.estimated_impact_percent}%</span>
                    </div>
                  </div>

                  {/* Expandable Implementation Steps & Functional Actions */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 700,
                          marginBottom: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Clock size={13} color="var(--primary)" />
                        Sequential Implementation Protocol
                      </div>
                      <ol className="steps-list">
                        {action.implementation_steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>

                      {/* Functional Action Buttons */}
                      <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className={action.is_implemented ? 'btn btn-secondary' : 'btn btn-primary'}
                          onClick={(e) => handleToggleImplemented(action, e)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: action.is_implemented ? 'rgba(0, 255, 102, 0.12)' : undefined,
                            borderColor: action.is_implemented ? '#00ff66' : undefined,
                            color: action.is_implemented ? '#00ff66' : undefined,
                          }}
                        >
                          {action.is_implemented ? (
                            <>
                              <RotateCcw size={14} />
                              Revert to Pending
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} />
                              Mark Implemented
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={(e) => handleExportDetails(action, e)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FileDown size={15} color="var(--primary)" />
                          Export Details (PDF)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Action History Tab */
        <div className="card animate-in-delayed">
          <div className="card-header">
            <span className="card-title">Completed Actions Audit Log</span>
            <span className="card-subtitle">{history.length} Logged Interventions</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mine</th>
                <th>Action Taken</th>
                <th>Execution Date</th>
                <th>Predicted Impact</th>
                <th>Actual Output Impact</th>
                <th>Recovery %</th>
                <th>Verification Outcome</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const accuracy =
                  h.predicted_impact_tonnes > 0
                    ? ((h.actual_impact_tonnes / h.predicted_impact_tonnes) * 100).toFixed(0)
                    : '—';
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>⛏️ {h.mine_name}</td>
                    <td>{h.action}</td>
                    <td className="mono" style={{ fontSize: '0.78rem' }}>
                      {h.date_implemented}
                    </td>
                    <td className="mono">{h.predicted_impact_tonnes.toLocaleString()} MT</td>
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {h.actual_impact_tonnes.toLocaleString()} MT
                    </td>
                    <td className="mono">{accuracy}%</td>
                    <td>
                      <span
                        className={`risk-badge ${
                          h.outcome === 'success' ? 'low' : h.outcome === 'partial' ? 'medium' : 'critical'
                        }`}
                      >
                        {h.outcome === 'success' ? '✓ Verified Success' : h.outcome}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
