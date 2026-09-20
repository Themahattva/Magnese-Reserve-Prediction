'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  Line, ComposedChart,
} from 'recharts';
import { Sliders, Building2 } from 'lucide-react';
import { productionAPI } from '@/lib/api';
import type { ProductionSummary, Equipment } from '@/lib/api';

const RISK_COLORS: Record<string, string> = {
  active: '#128937',
  idle: '#d98a00',
  maintenance: '#fa8c16',
  breakdown: '#db372d',
};

interface TooltipItem {
  name?: string;
  value: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #cbd5e1',
      borderRadius: '4px', padding: '10px 14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      fontFamily: "'Noto Sans', sans-serif",
    }}>
      <p style={{ color: '#4A2BC2', fontSize: '0.8rem', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
          <span style={{ color: entry.color || '#4b5563', fontSize: '0.78rem' }}>{entry.name}</span>
          <span style={{ color: '#171717', fontSize: '0.8rem', fontWeight: 700 }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProductionPage() {
  const [summary, setSummary] = useState<ProductionSummary[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedMine, setSelectedMine] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment'>('overview');

  useEffect(() => {
    async function load() {
      try {
        const [sumData, eqData] = await Promise.all([
          productionAPI.getSummary(),
          productionAPI.getEquipment(selectedMine),
        ]);
        setSummary(sumData);
        setEquipment(eqData);
      } catch {
        setSummary([
          { mine_id: 1, mine_name: "Dongri Buzurg", total_planned: 315000, total_actual: 289800, shortfall_percent: 8.0, avg_grade: 40.2 },
          { mine_id: 2, mine_name: "Balaghat", total_planned: 280000, total_actual: 218400, shortfall_percent: 22.0, avg_grade: 38.5 },
          { mine_id: 3, mine_name: "Chikla", total_planned: 195000, total_actual: 185250, shortfall_percent: 5.0, avg_grade: 42.1 },
          { mine_id: 4, mine_name: "Munsar", total_planned: 210000, total_actual: 130200, shortfall_percent: 38.0, avg_grade: 36.8 },
          { mine_id: 5, mine_name: "Kandri", total_planned: 260000, total_actual: 228800, shortfall_percent: 12.0, avg_grade: 39.4 },
          { mine_id: 6, mine_name: "Gumgaon", total_planned: 175000, total_actual: 129500, shortfall_percent: 26.0, avg_grade: 37.2 },
          { mine_id: 7, mine_name: "Parsioni", total_planned: 140000, total_actual: 126000, shortfall_percent: 10.0, avg_grade: 41.5 },
          { mine_id: 8, mine_name: "Sitapatore", total_planned: 120000, total_actual: 54000, shortfall_percent: 55.0, avg_grade: 34.9 },
          { mine_id: 9, mine_name: "Tirodi", total_planned: 165000, total_actual: 150150, shortfall_percent: 9.0, avg_grade: 38.8 },
        ]);
        setEquipment([
          { id: 1, mine_id: 1, equipment_type: "Excavator", model_name: "EXC-342", status: "active", utilization_percent: 87, hours_today: 6.5, downtime_reason: null },
          { id: 2, mine_id: 1, equipment_type: "Dumper", model_name: "DMP-105", status: "active", utilization_percent: 92, hours_today: 7.2, downtime_reason: null },
          { id: 3, mine_id: 4, equipment_type: "Excavator", model_name: "EXC-412", status: "breakdown", utilization_percent: 0, hours_today: 0, downtime_reason: "hydraulic failure" },
          { id: 4, mine_id: 4, equipment_type: "Drill Rig", model_name: "DRL-208", status: "maintenance", utilization_percent: 0, hours_today: 0, downtime_reason: "scheduled maintenance" },
          { id: 5, mine_id: 2, equipment_type: "Loader", model_name: "LDR-556", status: "active", utilization_percent: 76, hours_today: 5.8, downtime_reason: null },
          { id: 6, mine_id: 8, equipment_type: "Excavator", model_name: "EXC-801", status: "breakdown", utilization_percent: 0, hours_today: 0, downtime_reason: "engine overhaul" },
          { id: 7, mine_id: 3, equipment_type: "Bulldozer", model_name: "BUL-310", status: "idle", utilization_percent: 0, hours_today: 1.2, downtime_reason: null },
          { id: 8, mine_id: 8, equipment_type: "Dumper", model_name: "DMP-809", status: "maintenance", utilization_percent: 0, hours_today: 0, downtime_reason: "tire replacement" },
        ]);
      }
    }
    load();
  }, [selectedMine]);

  const totalPlanned = summary.reduce((s, m) => s + m.total_planned, 0);
  const totalActual = summary.reduce((s, m) => s + m.total_actual, 0);
  const overallShortfall = totalPlanned > 0 ? ((totalPlanned - totalActual) / totalPlanned * 100) : 0;

  // Equipment status breakdown for pie chart
  const statusCounts = equipment.reduce((acc, eq) => {
    acc[eq.status] = (acc[eq.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: RISK_COLORS[status] || '#74bf85',
  }));

  const chartData = summary.map((m) => ({
    name: m.mine_name.length > 10 ? m.mine_name.substring(0, 10) + '…' : m.mine_name,
    fullName: m.mine_name,
    planned: m.total_planned,
    actual: m.total_actual,
    shortfall: m.shortfall_percent,
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Production Analytics</h1>
          <p>Historical production performance, equipment monitoring, and operational insights</p>
        </div>

        <div className="filters-bar" style={{ margin: 0 }}>
          <label htmlFor="prod-mine-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Filter Mine:
          </label>
          <select
            id="prod-mine-select"
            className="filter-select"
            value={selectedMine ?? ''}
            onChange={(e) => setSelectedMine(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Mines Combined</option>
            {summary.map((m) => (
              <option key={m.mine_id} value={m.mine_id}>
                {m.mine_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Total Planned (Q)</div>
          <div className="kpi-value">{(totalPlanned / 1000).toFixed(0)}K</div>
          <div className="kpi-change neutral">tonnes this quarter</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Total Actual (Q)</div>
          <div className="kpi-value">{(totalActual / 1000).toFixed(0)}K</div>
          <div className="kpi-change negative">▼ {overallShortfall.toFixed(1)}% below plan</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Active Equipment</div>
          <div className="kpi-value">{equipment.filter((e) => e.status === 'active').length}</div>
          <div className="kpi-change neutral">of {equipment.length} total</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Avg Utilization</div>
          <div className="kpi-value">
            {(equipment.filter((e) => e.status === 'active').reduce((s, e) => s + e.utilization_percent, 0) /
              Math.max(1, equipment.filter((e) => e.status === 'active').length)).toFixed(0)}%
          </div>
          <div className="kpi-change neutral">active fleet</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Production Overview
        </button>
        <button className={`tab ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>
          Equipment Status
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Planned vs Actual Bar Chart (UX4G Standard) */}
          <div className="card animate-in-delayed" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <span className="card-title">Planned vs Actual Production by Lease</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Quarterly output comparisons across all 9 active MOIL mining leases
                </div>
              </div>
              <span className="card-subtitle">metric tonnes (T)</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EE" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontFamily: "'Noto Sans', sans-serif" }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: "'Noto Sans', sans-serif" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '12px', fontFamily: "'Noto Sans', sans-serif" }} />
                <Bar dataKey="planned" name="Planned Output (T)" fill="#DDD6FE" stroke="#4A2BC2" strokeWidth={1} radius={[3, 3, 0, 0]} barSize={22} />
                <Bar dataKey="actual" name="Actual Achieved (T)" fill="#4A2BC2" stroke="#372099" strokeWidth={1} radius={[3, 3, 0, 0]} barSize={22} />
                <Line type="monotone" dataKey="shortfall" name="Shortfall %" stroke="#DC2626" strokeWidth={2.5} dot={{ fill: '#DC2626', r: 3 }} yAxisId="right" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#DC2626', fontSize: 11, fontFamily: "'Noto Sans', sans-serif" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Organised Tabular Summary */}
          <div className="card animate-in-delayed">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="card-title" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Central Mines Production Performance Matrix
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Audited production telemetry, shortfall variance analysis, and grade compliance across 9 MOIL leases
                </div>
              </div>
              <Link href="/simulation" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '5px' }}>
                <Sliders size={13} />
                <span>Simulate All in What-If &rarr;</span>
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ux4g-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8F9FB', borderBottom: '2px solid #E2E6EE' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>Mine Lease</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>District &amp; State</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>Type</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Planned (T)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Actual (T)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Variance</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>Fulfillment</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Grade (% Mn)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>Operational Health</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.sort((a, b) => b.shortfall_percent - a.shortfall_percent).map((mine) => {
                    const meta = {
                      1: { district: 'Bhandara', state: 'Maharashtra', type: 'Opencast' },
                      2: { district: 'Balaghat', state: 'Madhya Pradesh', type: 'Underground' },
                      3: { district: 'Bhandara', state: 'Maharashtra', type: 'Opencast' },
                      4: { district: 'Nagpur', state: 'Maharashtra', type: 'Opencast' },
                      5: { district: 'Nagpur', state: 'Maharashtra', type: 'Underground' },
                      6: { district: 'Nagpur', state: 'Maharashtra', type: 'Opencast' },
                      7: { district: 'Nagpur', state: 'Maharashtra', type: 'Opencast' },
                      8: { district: 'Balaghat', state: 'Madhya Pradesh', type: 'Underground' },
                      9: { district: 'Balaghat', state: 'Madhya Pradesh', type: 'Mixed' },
                    }[mine.mine_id] || { district: 'Central Belt', state: 'India', type: 'Opencast' };

                    const varianceT = mine.total_actual - mine.total_planned;
                    const fulfillmentPct = mine.total_planned > 0
                      ? Math.round((mine.total_actual / mine.total_planned) * 100)
                      : 0;

                    const isCritical = mine.shortfall_percent > 30;
                    const isHigh = mine.shortfall_percent > 20 && !isCritical;
                    const isMedium = mine.shortfall_percent > 10 && !isCritical && !isHigh;

                    return (
                      <tr
                        key={mine.mine_id}
                        style={{
                          borderBottom: '1px solid #E2E6EE',
                          backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '11px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={13} style={{ color: 'var(--ux4g-primary)' }} />
                            <span>{mine.mine_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>
                          {meta.district}, {meta.state}
                        </td>
                        <td style={{ padding: '11px 12px' }}>
                          <span
                            className="ux4g-badge badge-neutral"
                            style={{ fontSize: '0.7rem', textTransform: 'uppercase', padding: '2px 6px' }}
                          >
                            {meta.type}
                          </span>
                        </td>
                        <td className="mono" style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 600 }}>
                          {mine.total_planned.toLocaleString()}
                        </td>
                        <td className="mono" style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 600 }}>
                          {mine.total_actual.toLocaleString()}
                        </td>
                        <td className="mono" style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: varianceT < 0 ? '#DC2626' : '#128937' }}>
                          {varianceT < 0 ? '-' : '+'}{Math.abs(varianceT).toLocaleString()} ({mine.shortfall_percent}%)
                        </td>
                        <td style={{ padding: '11px 12px', textAlign: 'center', minWidth: '110px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: '#E2E6EE', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, fulfillmentPct)}%`,
                                  backgroundColor: fulfillmentPct < 70 ? '#DC2626' : fulfillmentPct < 85 ? '#D98A00' : '#128937',
                                }}
                              />
                            </div>
                            <span className="mono" style={{ fontSize: '0.74rem', fontWeight: 600, minWidth: '32px' }}>
                              {fulfillmentPct}%
                            </span>
                          </div>
                        </td>
                        <td className="mono" style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: mine.avg_grade >= 40 ? '#128937' : '#1E293B' }}>
                          {mine.avg_grade}% Mn
                        </td>
                        <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                          <span className={`risk-badge ${isCritical ? 'critical' : isHigh ? 'high' : isMedium ? 'medium' : 'low'}`} style={{ fontSize: '0.72rem' }}>
                            {isCritical ? 'Critical Deficit' : isHigh ? 'Elevated Risk' : isMedium ? 'Moderate Watch' : 'Nominal / On Track'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                          <Link
                            href={`/simulation?mine_id=${mine.mine_id}`}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title={`Simulate what-if scenarios for ${mine.mine_name}`}
                          >
                            <Sliders size={11} />
                            <span>Simulate</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#F1F5F9', borderTop: '2px solid #CBD5E1', fontWeight: 700 }}>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                      Total MOIL Portfolio (9 Leases)
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Nagpur, Bhandara, Balaghat</td>
                    <td style={{ padding: '12px' }}>Combined</td>
                    <td className="mono" style={{ padding: '12px', textAlign: 'right' }}>
                      {totalPlanned.toLocaleString()} T
                    </td>
                    <td className="mono" style={{ padding: '12px', textAlign: 'right' }}>
                      {totalActual.toLocaleString()} T
                    </td>
                    <td className="mono" style={{ padding: '12px', textAlign: 'right', color: '#DC2626' }}>
                      -{(totalPlanned - totalActual).toLocaleString()} T ({overallShortfall.toFixed(1)}%)
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className="mono" style={{ fontWeight: 800 }}>
                        {totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0}% Target
                      </span>
                    </td>
                    <td className="mono" style={{ padding: '12px', textAlign: 'right', color: '#128937' }}>
                      38.8% Mn (Wtd)
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className="ux4g-badge badge-warning" style={{ fontSize: '0.72rem' }}>
                        Active Shortfall Mitigation
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Link href="/reports" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                        Export Dossier
                      </Link>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Equipment Tab */
        <div className="dashboard-grid-2 animate-in-delayed">
          {/* Pie Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Fleet Status Breakdown</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={4} strokeWidth={0}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Equipment List */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Equipment Details</span>
            </div>
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Utilization</th>
                    <th>Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((eq) => (
                    <tr key={eq.id}>
                      <td className="mono" style={{ fontSize: '0.76rem' }}>{eq.model_name}</td>
                      <td>{eq.equipment_type}</td>
                      <td>
                        <span className={`risk-badge ${eq.status === 'active' ? 'low' : eq.status === 'idle' ? 'medium' : eq.status === 'maintenance' ? 'high' : 'critical'}`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="mono">{eq.utilization_percent > 0 ? `${eq.utilization_percent}%` : '—'}</td>
                      <td style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{eq.downtime_reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
