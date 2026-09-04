'use client';

import { useEffect, useState } from 'react';
import {
  Mountain,
  TrendingDown,
  AlertTriangle,
  Gauge,
  Gem,
  Factory,
} from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import type { DashboardKPIs, MineStatus, ProductionTrendPoint, Alert } from '@/lib/api';
import ProductionTrendChart from '@/components/charts/ProductionTrendChart';
import MiniMap from '@/components/maps/MiniMap';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [mines, setMines] = useState<MineStatus[]>([]);
  const [trend, setTrend] = useState<ProductionTrendPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Use fallback data for demo
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

  return (
    <>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card animate-in">
          <div className="kpi-label">
            <Mountain size={14} />
            Total Reserves
          </div>
          <div className="kpi-value">{kpis?.total_reserves_mt || '—'} MT</div>
          <div className="kpi-change neutral">Across {kpis?.mines_count || 9} active mines</div>
        </div>

        <div className="kpi-card animate-in">
          <div className="kpi-label">
            <Factory size={14} />
            Monthly Production
          </div>
          <div className="kpi-value">
            {kpis ? (kpis.current_production_rate / 1000).toFixed(1) : '—'}K
          </div>
          <div className="kpi-change negative">
            ▼ {shortfallPercent}% below target
          </div>
        </div>

        <div className="kpi-card animate-in">
          <div className="kpi-label">
            <AlertTriangle size={14} />
            Active Alerts
          </div>
          <div className="kpi-value" style={{ color: 'var(--risk-high)' }}>
            {kpis?.active_alerts || '—'}
          </div>
          <div className="kpi-change negative">
            {kpis?.risk_mines_count || 0} mines at risk
          </div>
        </div>

        <div className="kpi-card animate-in">
          <div className="kpi-label">
            <Gauge size={14} />
            Equipment Utilization
          </div>
          <div className="kpi-value">{kpis?.equipment_utilization || '—'}%</div>
          <div className="kpi-change neutral">Fleet-wide average</div>
        </div>

        <div className="kpi-card animate-in">
          <div className="kpi-label">
            <Gem size={14} />
            Avg Ore Grade
          </div>
          <div className="kpi-value">{kpis?.avg_ore_grade || '—'}%</div>
          <div className="kpi-change positive">Mn content (weighted)</div>
        </div>
      </div>

      {/* Main Grid: Chart + Map */}
      <div className="dashboard-grid animate-in-delayed">
        {/* Production Trend Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Production vs Target (12-Month Trend)</span>
            <span className="card-subtitle">tonnes / month</span>
          </div>
          <ProductionTrendChart data={trend} />
        </div>

        {/* Mini Map */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Mine Locations</span>
            <span className="card-subtitle">Risk Status</span>
          </div>
          <MiniMap mines={mines} />
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card animate-in-delayed">
        <div className="card-header">
          <span className="card-title">Recent Alerts &amp; Predictions</span>
          <button className="btn btn-secondary" style={{ fontSize: '0.72rem' }}>
            [ VIEW LOGS ]
          </button>
        </div>
        <div className="alert-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <span className={`risk-badge ${alert.risk_level}`}>
                {alert.risk_level}
              </span>
              <div className="alert-content">
                <h4>{alert.mine_name}</h4>
                <p>{alert.message}</p>
                <div className="alert-meta">
                  Target: {alert.target_date} · Created: {new Date(alert.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
