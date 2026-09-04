'use client';

import { useEffect, useState } from 'react';
import { recommendationsAPI } from '@/lib/api';
import type { CorrectiveAction, ActionHistory, ActionCategory } from '@/lib/api';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ff2a4b', high: '#f97316', medium: '#eab308', low: '#00ff66',
};

const OUTCOME_COLORS: Record<string, string> = {
  success: '#00ff66', partial: '#eab308', failed: '#ff2a4b',
};

export default function RecommendationsPage() {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [categories, setCategories] = useState<ActionCategory[]>([]);
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [actData, histData, catData] = await Promise.all([
          recommendationsAPI.getActions(),
          recommendationsAPI.getHistory(),
          recommendationsAPI.getCategories(),
        ]);
        setActions(actData);
        setHistory(histData);
        setCategories(catData);
      } catch {
        setActions([
          { id: 1, prediction_id: 1, mine_id: 8, mine_name: "Sitapatore", action_type: "redeploy", title: "Redeploy idle excavators from Parsioni to Sitapatore", description: "2 excavators at Parsioni mine are currently idle. Redeploying them to Sitapatore can increase daily output by ~900 tonnes and reduce the predicted shortfall by 39%.", priority: "urgent", estimated_impact_tonnes: 6300, estimated_impact_percent: 39.0, implementation_steps: ["Coordinate with Parsioni mine supervisor for equipment release", "Arrange transport for 2 CAT 390F excavators", "Brief Sitapatore operators on face allocation", "Target deployment within 48 hours"], category: "Equipment", is_implemented: false },
          { id: 2, prediction_id: 1, mine_id: 8, mine_name: "Sitapatore", action_type: "reschedule", title: "Add night shift operations for 5 days", description: "Introducing a night shift at Sitapatore for the next 5 days can compensate for lost daytime production and recover ~1,500 tonnes.", priority: "high", estimated_impact_tonnes: 1500, estimated_impact_percent: 9.2, implementation_steps: ["Allocate night shift workforce (min 12 operators)", "Ensure adequate lighting at active faces", "Pre-position dumpers and fuel for night operations", "Coordinate with blasting team for pre-shift preparation"], category: "Schedule", is_implemented: false },
          { id: 3, prediction_id: 2, mine_id: 4, mine_name: "Munsar", action_type: "maintenance", title: "Fast-track excavator hydraulic repair", description: "Excavator EXC-412 has been under maintenance for hydraulic failure for 3 days. Expediting repair with additional technicians can restore 450 tonnes/day capacity.", priority: "high", estimated_impact_tonnes: 3150, estimated_impact_percent: 22.0, implementation_steps: ["Deploy 2 additional hydraulic technicians from Nagpur workshop", "Order priority spare parts (hydraulic pump assembly)", "Set up parallel repair track — fix seal + replace pump simultaneously", "Target repair completion within 36 hours"], category: "Equipment", is_implemented: false },
          { id: 4, prediction_id: 3, mine_id: 6, mine_name: "Gumgaon", action_type: "reschedule", title: "Pre-blast before predicted rainfall window", description: "Weather forecast shows heavy rain from Sept 12-14. Completing blasting operations by Sept 11 will ensure material availability during the rain period.", priority: "medium", estimated_impact_tonnes: 1800, estimated_impact_percent: 24.5, implementation_steps: ["Advance blasting schedule by 2 days (target Sept 10-11)", "Prepare additional blast holes in Blocks G3 and G5", "Stockpile blasted material near crusher for rain-day processing", "Coordinate with explosive supplier for advance delivery"], category: "Weather", is_implemented: false },
          { id: 5, prediction_id: 4, mine_id: 2, mine_name: "Balaghat", action_type: "blend", title: "Optimize ore blending from Blocks B3 and B7", description: "Grade variation in Block B7 (34% Mn) can be compensated by blending with high-grade ore from Block B3 (44% Mn) to maintain target grade of 38%.", priority: "medium", estimated_impact_tonnes: 630, estimated_impact_percent: 18.0, implementation_steps: ["Route 60% of dumpers to Block B3 (high grade face)", "Route 40% of dumpers to Block B7 (lower grade face)", "Set up blending at crusher feed point", "Monitor hourly grade samples to maintain 38% target"], category: "Quality", is_implemented: false },
          { id: 6, prediction_id: 1, mine_id: 8, mine_name: "Sitapatore", action_type: "stockpile", title: "Activate emergency stockpile buffer", description: "Release 2,000 tonnes from Sitapatore's emergency stockpile to fulfill pending customer orders while production recovery is in progress.", priority: "urgent", estimated_impact_tonnes: 2000, estimated_impact_percent: 12.3, implementation_steps: ["Verify stockpile inventory and grade documentation", "Coordinate with dispatch team for customer allocation", "Begin stockpile reclamation with available loader", "Replenish stockpile once production normalizes"], category: "Logistics", is_implemented: false },
        ]);
        setHistory([
          { id: 101, mine_name: "Dongri Buzurg", action: "Redeployed 1 excavator from Tirodi", date_implemented: "2026-08-20", predicted_impact_tonnes: 2800, actual_impact_tonnes: 3100, outcome: "success" },
          { id: 102, mine_name: "Balaghat", action: "Pre-blast before monsoon onset", date_implemented: "2026-07-02", predicted_impact_tonnes: 4500, actual_impact_tonnes: 4100, outcome: "success" },
          { id: 103, mine_name: "Munsar", action: "Added night shift for 7 days", date_implemented: "2026-08-10", predicted_impact_tonnes: 2100, actual_impact_tonnes: 1200, outcome: "partial" },
          { id: 104, mine_name: "Gumgaon", action: "Ore blending optimization", date_implemented: "2026-08-15", predicted_impact_tonnes: 800, actual_impact_tonnes: 750, outcome: "success" },
        ]);
        setCategories([
          { category: "Equipment", count: 2, icon: "🔧" },
          { category: "Schedule", count: 1, icon: "📅" },
          { category: "Weather", count: 1, icon: "🌧️" },
          { category: "Quality", count: 1, icon: "📊" },
          { category: "Logistics", count: 1, icon: "🚚" },
        ]);
      }
    }
    load();
  }, []);

  const filteredActions = filterPriority
    ? actions.filter((a) => a.priority === filterPriority)
    : actions;

  const totalImpact = actions.reduce((s, a) => s + a.estimated_impact_tonnes, 0);

  return (
    <>
      <div className="page-header">
        <h1>Corrective Actions</h1>
        <p>AI-recommended actions to prevent shortfalls with implementation steps and impact estimates</p>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Active Recommendations</div>
          <div className="kpi-value">{actions.length}</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Total Est. Impact</div>
          <div className="kpi-value" style={{ color: 'var(--accent-300)' }}>{(totalImpact / 1000).toFixed(1)}K T</div>
        </div>
        {['urgent', 'high', 'medium'].map((p) => (
          <div key={p} className="kpi-card animate-in">
            <div className="kpi-label" style={{ textTransform: 'capitalize' }}>{p} Priority</div>
            <div className="kpi-value" style={{ color: PRIORITY_COLORS[p] }}>
              {actions.filter((a) => a.priority === p).length}
            </div>
          </div>
        ))}
      </div>

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <div key={cat.category} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)', fontSize: '0.78rem', color: 'var(--text-secondary)',
          }}>
            <span>{cat.icon}</span>
            <span>{cat.category}</span>
            <span className="mono" style={{ color: 'var(--primary-300)', fontWeight: 600 }}>{cat.count}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>
          Current Recommendations
        </button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          Action History
        </button>
      </div>

      {/* Priority Filter */}
      {activeTab === 'current' && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          <button
            className={`map-layer-btn ${!filterPriority ? 'active' : ''}`}
            onClick={() => setFilterPriority(null)}
          >
            All
          </button>
          {['urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              className={`map-layer-btn ${filterPriority === p ? 'active' : ''}`}
              onClick={() => setFilterPriority(p)}
              style={{ textTransform: 'capitalize' }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'current' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredActions.map((action) => {
            const isExpanded = expandedAction === action.id;
            return (
              <div
                key={action.id}
                className="action-card"
                onClick={() => setExpandedAction(isExpanded ? null : action.id)}
              >
                <div className="action-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`risk-badge ${action.priority === 'urgent' ? 'critical' : action.priority}`}>
                      {action.priority}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      {action.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {action.mine_name}
                  </span>
                </div>

                <div className="action-title">{action.title}</div>
                <div className="action-desc">{action.description}</div>

                <div className="action-impact">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Est. Impact: </span>
                    <span className="impact-value">{action.estimated_impact_tonnes.toLocaleString()} T</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Recovery: </span>
                    <span className="impact-value">{action.estimated_impact_percent}%</span>
                  </div>
                </div>

                {/* Expandable steps */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Implementation Steps
                    </div>
                    <ol className="steps-list">
                      {action.implementation_steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                    <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                      <button className="btn btn-primary" onClick={(e) => e.stopPropagation()}>
                        ✅ Mark Implemented
                      </button>
                      <button className="btn btn-secondary" onClick={(e) => e.stopPropagation()}>
                        📋 Export Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* History Tab */
        <div className="card animate-in-delayed">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mine</th>
                <th>Action Taken</th>
                <th>Date</th>
                <th>Predicted Impact</th>
                <th>Actual Impact</th>
                <th>Accuracy</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const accuracy = h.predicted_impact_tonnes > 0
                  ? ((h.actual_impact_tonnes / h.predicted_impact_tonnes) * 100).toFixed(0)
                  : '—';
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.mine_name}</td>
                    <td>{h.action}</td>
                    <td className="mono" style={{ fontSize: '0.78rem' }}>{h.date_implemented}</td>
                    <td className="mono">{h.predicted_impact_tonnes.toLocaleString()} T</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{h.actual_impact_tonnes.toLocaleString()} T</td>
                    <td className="mono">{accuracy}%</td>
                    <td>
                      <span className={`risk-badge ${h.outcome === 'success' ? 'low' : h.outcome === 'partial' ? 'medium' : 'critical'}`}>
                        {h.outcome}
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
