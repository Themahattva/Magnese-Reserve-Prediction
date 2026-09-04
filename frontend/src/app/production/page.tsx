'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, ComposedChart, Area,
} from 'recharts';
import { productionAPI } from '@/lib/api';
import type { ProductionSummary, Equipment } from '@/lib/api';

const RISK_COLORS: Record<string, string> = {
  active: '#00ff66',
  idle: '#eab308',
  maintenance: '#f97316',
  breakdown: '#ff2a4b',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#081309', border: '1px solid #00ff66',
      borderRadius: '4px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.9), 0 0 15px rgba(0,255,102,0.2)',
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      <p style={{ color: '#00ff66', fontSize: '0.74rem', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>&gt; {label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
          <span style={{ color: entry.color, fontSize: '0.74rem' }}>{entry.name}</span>
          <span style={{ color: '#d4ffd4', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
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
        <h1>Production Analytics</h1>
        <p>Historical production performance, equipment monitoring, and operational insights</p>
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
          {/* Planned vs Actual Bar Chart */}
          <div className="card animate-in-delayed" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <span className="card-title">Planned vs Actual Production by Mine</span>
              <span className="card-subtitle">quarterly tonnes</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,255,102,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(0,255,102,0.15)' }} tickLine={false} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.72rem', paddingTop: '16px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="planned" name="Planned" fill="rgba(0,255,204,0.18)" stroke="rgba(0,255,204,0.6)" strokeWidth={1} radius={[2, 2, 0, 0]} barSize={24} />
                <Bar dataKey="actual" name="Actual" fill="rgba(0,255,102,0.25)" stroke="#00ff66" strokeWidth={1} radius={[2, 2, 0, 0]} barSize={24} />
                <Line type="monotone" dataKey="shortfall" name="Shortfall %" stroke="#ff2a4b" strokeWidth={2} dot={{ fill: '#ff2a4b', r: 3 }} yAxisId="right" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="card animate-in-delayed">
            <div className="card-header">
              <span className="card-title">Mine-wise Production Summary</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mine</th>
                  <th>Planned (T)</th>
                  <th>Actual (T)</th>
                  <th>Shortfall</th>
                  <th>Avg Grade (%Mn)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.sort((a, b) => b.shortfall_percent - a.shortfall_percent).map((mine) => (
                  <tr key={mine.mine_id}>
                    <td style={{ fontWeight: 600 }}>{mine.mine_name}</td>
                    <td className="mono">{mine.total_planned.toLocaleString()}</td>
                    <td className="mono">{mine.total_actual.toLocaleString()}</td>
                    <td>
                      <span className={`risk-badge ${mine.shortfall_percent > 30 ? 'critical' : mine.shortfall_percent > 20 ? 'high' : mine.shortfall_percent > 10 ? 'medium' : 'low'}`}>
                        {mine.shortfall_percent}%
                      </span>
                    </td>
                    <td className="mono">{mine.avg_grade}%</td>
                    <td>
                      <span className={`risk-badge ${mine.shortfall_percent > 30 ? 'critical' : mine.shortfall_percent > 20 ? 'high' : mine.shortfall_percent > 10 ? 'medium' : 'low'}`}>
                        {mine.shortfall_percent > 30 ? 'Critical' : mine.shortfall_percent > 20 ? 'At Risk' : mine.shortfall_percent > 10 ? 'Watch' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
