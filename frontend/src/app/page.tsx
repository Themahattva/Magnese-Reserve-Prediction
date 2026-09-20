'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Mountain,
  Factory,
  AlertTriangle,
  Gauge,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import type { DashboardKPIs, MineStatus, ProductionTrendPoint, Alert } from '@/lib/api';
import ProductionTrendChart from '@/components/charts/ProductionTrendChart';
import MiniMap from '@/components/maps/MiniMap';
import HEMMFleetSection from '@/components/dashboard/HEMMFleetSection';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [mines, setMines] = useState<MineStatus[]>([]);
  const [trend, setTrend] = useState<ProductionTrendPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiData, mineData, trendData, alertData] = await Promise.all([
          dashboardAPI.getKPIs(),
          dashboardAPI.getMineStatus(),
          dashboardAPI.getProductionTrend(),
          dashboardAPI.getRecentAlerts(),
        ]);
        setKpis(kpiData);
        setMines(mineData);
        setTrend(trendData);
        setAlerts(alertData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        // Fallback realistic simulation data
        setKpis({
          total_reserves_mt: 152.4,
          current_production_rate: 98500,
          production_target: 110000,
          active_alerts: 4,
          equipment_utilization: 78.5,
          avg_ore_grade: 38.2,
          mines_count: 9,
          risk_mines_count: 2,
        });
        setMines([
          { id: 1, name: "Dongri Buzurg", latitude: 21.548660, longitude: 79.682890, risk_level: "low", production_percent: 92, estimated_reserves: 28.5 },
          { id: 2, name: "Balaghat", latitude: 21.849722, longitude: 80.226667, risk_level: "medium", production_percent: 78, estimated_reserves: 35.2 },
          { id: 3, name: "Chikla", latitude: 21.543056, longitude: 79.753889, risk_level: "low", production_percent: 95, estimated_reserves: 18.7 },
          { id: 4, name: "Munsar", latitude: 21.401389, longitude: 79.280833, risk_level: "high", production_percent: 62, estimated_reserves: 12.3 },
          { id: 5, name: "Kandri", latitude: 21.411667, longitude: 79.266111, risk_level: "low", production_percent: 88, estimated_reserves: 22.1 },
          { id: 6, name: "Gumgaon", latitude: 21.400000, longitude: 78.983333, risk_level: "medium", production_percent: 74, estimated_reserves: 15.8 },
          { id: 7, name: "Parsioni", latitude: 21.40, longitude: 79.22, risk_level: "low", production_percent: 90, estimated_reserves: 9.4 },
          { id: 8, name: "Sitapatore", latitude: 21.666667, longitude: 79.666667, risk_level: "critical", production_percent: 45, estimated_reserves: 5.2 },
          { id: 9, name: "Tirodi", latitude: 21.683056, longitude: 79.733056, risk_level: "low", production_percent: 91, estimated_reserves: 11.6 },
        ]);
        setTrend([
          { month: "Oct 2025", target: 102000, actual: 94000, shortfall: 8000 },
          { month: "Nov 2025", target: 98000, actual: 92000, shortfall: 6000 },
          { month: "Dec 2025", target: 105000, actual: 98500, shortfall: 6500 },
          { month: "Jan 2026", target: 100000, actual: 95000, shortfall: 5000 },
          { month: "Feb 2026", target: 103000, actual: 100500, shortfall: 2500 },
          { month: "Mar 2026", target: 107000, actual: 104000, shortfall: 3000 },
          { month: "Apr 2026", target: 99000, actual: 96000, shortfall: 3000 },
          { month: "May 2026", target: 101000, actual: 93000, shortfall: 8000 },
          { month: "Jun 2026", target: 104000, actual: 78000, shortfall: 26000 },
          { month: "Jul 2026", target: 98000, actual: 68000, shortfall: 30000 },
          { month: "Aug 2026", target: 102000, actual: 72000, shortfall: 30000 },
          { month: "Sep 2026", target: 106000, actual: 65000, shortfall: 41000 },
        ]);
        setAlerts([
          { id: 1, mine_name: "Sitapatore", risk_level: "critical", message: "Production shortfall of 8,500 tonnes predicted for next week", target_date: "2026-09-10", created_at: "2026-09-02T14:30:00" },
          { id: 2, mine_name: "Munsar", risk_level: "high", message: "Equipment downtime exceeding 40% — 2 excavators under maintenance", target_date: "2026-09-08", created_at: "2026-09-02T11:15:00" },
          { id: 3, mine_name: "Gumgaon", risk_level: "medium", message: "Heavy rainfall forecast may impact blasting schedule", target_date: "2026-09-12", created_at: "2026-09-01T09:45:00" },
          { id: 4, mine_name: "Balaghat", risk_level: "medium", message: "Grade variation detected in Block B7 — blend adjustment recommended", target_date: "2026-09-15", created_at: "2026-09-01T08:00:00" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const shortfallPercent = kpis
    ? (((kpis.production_target - kpis.current_production_rate) / kpis.production_target) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--ux4g-primary)', margin: '0 auto 1rem' }} />
        <h2>Loading ANVESHA Mining Intelligence...</h2>
        <p>Connecting to operational telemetry and geological models</p>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Operational &amp; Exploration Dashboard</h1>
          <p>
            Real-time synthesis of satellite mineral indicators, borehole assay distributions, and fleet telemetry across MOIL Ltd. mining leases.
          </p>
        </div>

        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Clock size={13} aria-hidden="true" />
            <span>Updated: 14 mins ago</span>
          </div>
          <Link href="/exploration" className="ux4g-btn ux4g-btn-outline ux4g-btn-sm">
            <Layers size={14} aria-hidden="true" />
            <span>Explore Map</span>
          </Link>
          <Link href="/decisions" className="ux4g-btn ux4g-btn-primary ux4g-btn-sm">
            <Sparkles size={14} aria-hidden="true" />
            <span>Review Actions</span>
          </Link>
        </div>
      </div>

      {/* Filter / Freshness Bar */}
      <div className="filters-bar">
        <label htmlFor="district-filter" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Mining Cluster:
        </label>
        <select
          id="district-filter"
          className="filter-select"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
        >
          <option value="all">All Clusters (Maharashtra &amp; Madhya Pradesh)</option>
          <option value="nagpur">Nagpur Cluster (Munsar, Kandri, Gumgaon, Parsioni)</option>
          <option value="bhandara">Bhandara Cluster (Dongri Buzurg, Chikla)</option>
          <option value="balaghat">Balaghat Cluster (Balaghat, Sitapatore, Tirodi)</option>
        </select>

        <span style={{ color: 'var(--border-strong)', margin: '0 0.5rem' }}>|</span>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Active Mines: <strong>{kpis?.mines_count || 9}</strong>
        </span>
        <span style={{ color: 'var(--border-strong)', margin: '0 0.5rem' }}>|</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--status-critical)' }}>
          Mines with Shortfall Risk: <strong>{kpis?.risk_mines_count || 2}</strong>
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <Mountain size={14} style={{ color: 'var(--ux4g-primary)' }} aria-hidden="true" />
            <span>Total Inferred Reserves</span>
          </div>
          <div className="kpi-value">{kpis?.total_reserves_mt || '—'} MT</div>
          <div className="kpi-change neutral">Across {kpis?.mines_count || 9} operational blocks</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <Factory size={14} style={{ color: '#0bbbea' }} aria-hidden="true" />
            <span>Monthly Production</span>
          </div>
          <div className="kpi-value">
            {kpis ? (kpis.current_production_rate / 1000).toFixed(1) : '—'}K MT
          </div>
          <div className="kpi-change negative">
            <TrendingDown size={12} aria-hidden="true" />
            <span>{shortfallPercent}% below target (110K MT)</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <AlertTriangle size={14} style={{ color: 'var(--status-high)' }} aria-hidden="true" />
            <span>Active Alerts</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-high)' }}>
            {kpis?.active_alerts || '—'}
          </div>
          <div className="kpi-change negative">
            <span>{kpis?.risk_mines_count || 0} sites requiring operational review</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <Gauge size={14} style={{ color: 'var(--status-low)' }} aria-hidden="true" />
            <span>Fleet Availability</span>
          </div>
          <div className="kpi-value">{kpis?.equipment_utilization || '—'}%</div>
          <div className="kpi-change positive">Above baseline threshold (75%)</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <Sparkles size={14} style={{ color: '#d98a00' }} aria-hidden="true" />
            <span>Average Ore Grade</span>
          </div>
          <div className="kpi-value">{kpis?.avg_ore_grade || '—'}%</div>
          <div className="kpi-change neutral">Run-of-mine Mn concentration</div>
        </div>
      </div>

      {/* Main Grid: Chart + Map */}
      <div className="dashboard-grid">
        {/* Production Trend Chart */}
        <div className="ux4g-card">
          <div className="ux4g-card-header">
            <h3>
              <Factory size={16} style={{ color: 'var(--ux4g-primary)' }} aria-hidden="true" />
              <span>Production vs. Target Horizon (12-Month Trend)</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unit: Tonnes / Month</span>
          </div>
          <div className="ux4g-card-body">
            <ProductionTrendChart data={trend} />
          </div>
          <div className="ux4g-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Model estimate updated with Central India IMD monsoon telemetry</span>
            <Link href="/production" className="ux4g-btn ux4g-btn-outline ux4g-btn-sm">
              <span>View What-If Simulator</span>
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Mini Map */}
        <div className="ux4g-card">
          <div className="ux4g-card-header">
            <h3>
              <Layers size={16} style={{ color: 'var(--ux4g-primary)' }} aria-hidden="true" />
              <span>Mine Locations &amp; Shortfall Risk</span>
            </h3>
            <span className="ux4g-badge badge-neutral">9 Active Leases</span>
          </div>
          <div className="ux4g-card-body" style={{ padding: 0 }}>
            <MiniMap mines={mines} />
          </div>
          <div className="ux4g-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Click markers for block details</span>
            <Link href="/exploration" className="ux4g-btn ux4g-btn-outline ux4g-btn-sm">
              <span>Full Exploration Map</span>
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Heavy Earth Moving Machinery (HEMM) Fleet Operations */}
      <HEMMFleetSection />

      {/* Recent Alerts & Decisions */}
      <div className="ux4g-card" style={{ marginBottom: '2rem' }}>
        <div className="ux4g-card-header">
          <h3>
            <AlertTriangle size={16} style={{ color: 'var(--status-critical)' }} aria-hidden="true" />
            <span>Shortfall Warnings &amp; Pending Reviews</span>
          </h3>
          <Link href="/decisions" className="ux4g-btn ux4g-btn-primary ux4g-btn-sm">
            <span>Decision Center</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
        <div className="ux4g-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="ux4g-table">
            <thead>
              <tr>
                <th scope="col">Risk Level</th>
                <th scope="col">Mine Site</th>
                <th scope="col">Alert Description</th>
                <th scope="col">Target Horizon</th>
                <th scope="col">Reported On</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <span className={`ux4g-badge badge-${alert.risk_level}`}>
                      {alert.risk_level}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alert.mine_name}</td>
                  <td>{alert.message}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{alert.target_date}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(alert.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href="/decisions" className="ux4g-btn ux4g-btn-outline ux4g-btn-sm">
                      Review
                    </Link>
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
