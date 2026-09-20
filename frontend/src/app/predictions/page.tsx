'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, Cell, Tooltip,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { predictionsAPI } from '@/lib/api';
import type { ShortfallPrediction, RiskCalendarDay, WhatIfRequest, WhatIfResponse } from '@/lib/api';
import WhatIfSimulator from '@/components/simulation/WhatIfSimulator';

const RISK_COLORS: Record<string, string> = {
  low: '#128937', medium: '#d98a00', high: '#d46b08', critical: '#db372d',
};

export interface MineCalibration {
  id: number;
  name: string;
  type: 'opencast' | 'underground' | 'mixed' | 'aggregate';
  daily_capacity: number;
  fleet_size: number;
  rain_threshold_mm: number;
  rain_sensitivity: number;
  blasting_buffer_hours: number;
  district: string;
  state: string;
}

export const MOIL_MINES: MineCalibration[] = [
  { id: 1, name: 'Dongri Buzurg', type: 'opencast', daily_capacity: 1050, fleet_size: 18, rain_threshold_mm: 20, rain_sensitivity: 1.25, blasting_buffer_hours: 1.0, district: 'Bhandara', state: 'Maharashtra' },
  { id: 2, name: 'Balaghat', type: 'underground', daily_capacity: 933, fleet_size: 16, rain_threshold_mm: 40, rain_sensitivity: 0.45, blasting_buffer_hours: 2.0, district: 'Balaghat', state: 'Madhya Pradesh' },
  { id: 3, name: 'Chikla', type: 'opencast', daily_capacity: 650, fleet_size: 12, rain_threshold_mm: 22, rain_sensitivity: 1.15, blasting_buffer_hours: 1.2, district: 'Nagpur', state: 'Maharashtra' },
  { id: 4, name: 'Munsar', type: 'opencast', daily_capacity: 700, fleet_size: 11, rain_threshold_mm: 20, rain_sensitivity: 1.30, blasting_buffer_hours: 1.0, district: 'Nagpur', state: 'Maharashtra' },
  { id: 5, name: 'Kandri', type: 'underground', daily_capacity: 867, fleet_size: 14, rain_threshold_mm: 38, rain_sensitivity: 0.48, blasting_buffer_hours: 2.0, district: 'Nagpur', state: 'Maharashtra' },
  { id: 6, name: 'Gumgaon', type: 'opencast', daily_capacity: 583, fleet_size: 10, rain_threshold_mm: 22, rain_sensitivity: 1.20, blasting_buffer_hours: 1.2, district: 'Nagpur', state: 'Maharashtra' },
  { id: 7, name: 'Parsioni', type: 'opencast', daily_capacity: 467, fleet_size: 8, rain_threshold_mm: 18, rain_sensitivity: 1.35, blasting_buffer_hours: 1.0, district: 'Nagpur', state: 'Maharashtra' },
  { id: 8, name: 'Sitapatore', type: 'underground', daily_capacity: 400, fleet_size: 7, rain_threshold_mm: 35, rain_sensitivity: 0.60, blasting_buffer_hours: 1.5, district: 'Balaghat', state: 'Madhya Pradesh' },
  { id: 9, name: 'Tirodi', type: 'mixed', daily_capacity: 550, fleet_size: 10, rain_threshold_mm: 25, rain_sensitivity: 0.95, blasting_buffer_hours: 1.5, district: 'Balaghat', state: 'Madhya Pradesh' },
  { id: 0, name: 'Fleet-wide (All Mines Combined)', type: 'aggregate', daily_capacity: 6200, fleet_size: 96, rain_threshold_mm: 25, rain_sensitivity: 0.85, blasting_buffer_hours: 1.5, district: 'All Zones', state: 'Central India' },
];

interface TooltipItem {
  name: string;
  value: number | string;
  color?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #cbd5e1',
      borderRadius: '4px', padding: '10px 14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      fontFamily: "'Noto Sans', sans-serif",
    }}>
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

export function computeCalibratedWhatIf(whatIf: WhatIfRequest): WhatIfResponse {
  const calib = MOIL_MINES.find((m) => m.id === whatIf.mine_id) || MOIL_MINES[0];
  const days = Math.max(1, whatIf.days_ahead);
  const baseline = calib.daily_capacity * days;

  // 1. Non-linear equipment downtime bottleneck
  const fleetSize = calib.fleet_size;
  const down = Math.min(whatIf.equipment_down, fleetSize);
  let equipImpact = 0;
  if (down > 0 && fleetSize > 0) {
    const downRatio = down / fleetSize;
    const lossEquipFrac = Math.min(1.0, Math.pow(downRatio, 0.88) * 1.12);
    equipImpact = baseline * lossEquipFrac;
  }

  // 2. Hydrologic rainfall impact with threshold
  const threshold = calib.rain_threshold_mm;
  const sensitivity = calib.rain_sensitivity;
  let rainImpact = 0;
  if (whatIf.rainfall_mm > 0) {
    if (whatIf.rainfall_mm <= threshold) {
      const rainFrac = (whatIf.rainfall_mm / threshold) * 0.12 * sensitivity;
      rainImpact = baseline * rainFrac;
    } else {
      const excess = whatIf.rainfall_mm - threshold;
      const excessFrac = Math.min(0.72, Math.pow(excess / 80.0, 1.1) * sensitivity);
      const rainFrac = Math.min(0.85, 0.12 * sensitivity + excessFrac);
      rainImpact = baseline * rainFrac;
    }
  }

  // 3. Blasting delay impact against muckpile buffer
  const buffer = calib.blasting_buffer_hours;
  let blastImpact = 0;
  if (whatIf.blasting_delay_hours > 0) {
    if (whatIf.blasting_delay_hours <= buffer) {
      blastImpact = baseline * (whatIf.blasting_delay_hours / Math.max(0.1, buffer)) * 0.02;
    } else {
      const unbuffered = Math.min(24.0, whatIf.blasting_delay_hours - buffer);
      const blastFrac = (unbuffered / 24.0) * 0.40;
      blastImpact = (baseline / days) * blastFrac * Math.min(days, 2.5) + baseline * 0.02;
    }
  }

  // 4. Compound synergy
  let compoundDrag = 0;
  if (whatIf.rainfall_mm > 25.0 && whatIf.equipment_down > 0) {
    compoundDrag = equipImpact * 0.20 * Math.min(1.0, (whatIf.rainfall_mm - 25.0) / 50.0);
  }

  // 5. Extra shift bonus adjusted for night weather
  let shiftBonus = 0;
  if (whatIf.extra_shift) {
    const weatherEff = Math.max(0.10, 1.0 - (whatIf.rainfall_mm / 80.0) * 0.85);
    shiftBonus = baseline * 0.22 * weatherEff;
  }

  const totalLoss = equipImpact + rainImpact + blastImpact + compoundDrag;
  const grossAdjusted = Math.max(0, baseline - totalLoss + shiftBonus);
  const adjusted = Math.min(baseline * 1.25, grossAdjusted);
  const impactTonnes = baseline - adjusted;
  const pct = baseline > 0 ? Math.round((impactTonnes / baseline) * 1000) / 10 : 0;

  const breakdown: Record<string, number> = {
    equipment_downtime_impact: Math.round(equipImpact),
    rainfall_impact: Math.round(rainImpact),
    blasting_delay_impact: Math.round(blastImpact),
    extra_shift_bonus: Math.round(shiftBonus),
  };
  if (compoundDrag > 0) {
    breakdown.compound_haulroad_drag = Math.round(compoundDrag);
  }

  return {
    baseline_production: Math.round(baseline),
    adjusted_production: Math.round(adjusted),
    impact_tonnes: Math.round(impactTonnes),
    impact_percent: pct,
    risk_level: pct >= 40 ? 'critical' : pct >= 25 ? 'high' : pct >= 10 ? 'medium' : 'low',
    breakdown,
  };
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<ShortfallPrediction[]>([]);
  const [calendar, setCalendar] = useState<RiskCalendarDay[]>([]);
  const [accuracy, setAccuracy] = useState<{
    scatter_data: Array<{ actual: number; predicted: number; date?: string }>;
    metrics: { rmse: number; mae: number; r2_score: number; accuracy_within_10_percent: number };
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'predictions' | 'simulator' | 'accuracy'>('predictions');


  useEffect(() => {
    async function load() {
      try {
        const [predData, calData, accData] = await Promise.all([
          predictionsAPI.getShortfalls(),
          predictionsAPI.getRiskCalendar(),
          predictionsAPI.getModelAccuracy(),
        ]);
        setPredictions(predData);
        setCalendar(calData);
        setAccuracy(accData);
      } catch {
        setPredictions([
          { id: 1, mine_id: 8, mine_name: "Sitapatore", target_date: "2026-09-10", planned_qty_tonnes: 4200, predicted_qty_tonnes: 1890, shortfall_tonnes: 2310, risk_level: "critical", confidence_score: 0.89, contributing_factors: { equipment_downtime: 0.42, rainfall: 0.28, grade_variation: 0.18, blasting_delay: 0.12 } },
          { id: 2, mine_id: 4, mine_name: "Munsar", target_date: "2026-09-08", planned_qty_tonnes: 3800, predicted_qty_tonnes: 2356, shortfall_tonnes: 1444, risk_level: "high", confidence_score: 0.84, contributing_factors: { equipment_downtime: 0.55, seasonal_pattern: 0.22, labor_shortage: 0.13, blasting_delay: 0.10 } },
          { id: 3, mine_id: 6, mine_name: "Gumgaon", target_date: "2026-09-12", planned_qty_tonnes: 3200, predicted_qty_tonnes: 2464, shortfall_tonnes: 736, risk_level: "medium", confidence_score: 0.76, contributing_factors: { rainfall: 0.48, grade_variation: 0.25, equipment_downtime: 0.15, blasting_delay: 0.12 } },
          { id: 4, mine_id: 2, mine_name: "Balaghat", target_date: "2026-09-15", planned_qty_tonnes: 3500, predicted_qty_tonnes: 2870, shortfall_tonnes: 630, risk_level: "medium", confidence_score: 0.72, contributing_factors: { grade_variation: 0.38, seasonal_pattern: 0.30, rainfall: 0.20, equipment_downtime: 0.12 } },
          { id: 5, mine_id: 1, mine_name: "Dongri Buzurg", target_date: "2026-09-14", planned_qty_tonnes: 4000, predicted_qty_tonnes: 3680, shortfall_tonnes: 320, risk_level: "low", confidence_score: 0.81, contributing_factors: { seasonal_pattern: 0.40, rainfall: 0.35, equipment_downtime: 0.15, grade_variation: 0.10 } },
        ]);
        setCalendar(Array.from({ length: 30 }, (_, i) => ({
          date: `2026-09-${String(i + 1).padStart(2, '0')}`,
          risk_level: ['low', 'low', 'medium', 'low', 'high', 'medium', 'low', 'critical', 'low', 'medium'][i % 10],
          predicted_production_percent: 60 + Math.random() * 40,
        })));
        setAccuracy({
          scatter_data: Array.from({ length: 40 }, () => {
            const actual = 1500 + Math.random() * 3500;
            return { actual: Math.round(actual), predicted: Math.round(actual + (Math.random() - 0.5) * 600) };
          }),
          metrics: { rmse: 312.4, mae: 248.7, r2_score: 0.87, accuracy_within_10_percent: 78.5 },
        });
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Shortfall Predictions</h1>
        <p>ML-powered production shortfall forecasts with risk assessment and what-if simulation</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'predictions' ? 'active' : ''}`} onClick={() => setActiveTab('predictions')}>
          Predictions & Calendar
        </button>
        <button className={`tab ${activeTab === 'simulator' ? 'active' : ''}`} onClick={() => setActiveTab('simulator')}>
          What-If Simulator
        </button>
        <button className={`tab ${activeTab === 'accuracy' ? 'active' : ''}`} onClick={() => setActiveTab('accuracy')}>
          Model Accuracy
        </button>
      </div>

      {activeTab === 'predictions' && (
        <>
          {/* Prediction Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {predictions.map((pred) => {
              const factorEntries = Object.entries(pred.contributing_factors)
                .sort(([, a], [, b]) => b - a);
              const factorData = factorEntries.map(([name, value]) => ({
                name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                value: Math.round(value * 100),
                fill: value > 0.35 ? '#ff2a4b' : value > 0.2 ? '#f97316' : '#eab308',
              }));

              return (
                <div key={pred.id} className="card animate-in">
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {/* Left: Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{pred.mine_name}</h3>
                        <span className={`risk-badge ${pred.risk_level}`}>{pred.risk_level}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          Target: {pred.target_date}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Planned</div>
                          <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{pred.planned_qty_tonnes.toLocaleString()} T</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Predicted</div>
                          <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--risk-medium)' }}>{pred.predicted_qty_tonnes.toLocaleString()} T</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Shortfall</div>
                          <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: RISK_COLORS[pred.risk_level] }}>
                            {pred.shortfall_tonnes.toLocaleString()} T
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Confidence: <span className="mono" style={{ color: 'var(--primary-300)' }}>{(pred.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Right: Factor Chart */}
                    <div style={{ width: '280px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>CONTRIBUTING FACTORS</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={factorData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                          <XAxis type="number" hide domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#475569', fontSize: 10, fontFamily: "'Noto Sans', sans-serif" }} axisLine={false} tickLine={false} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                            {factorData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} fillOpacity={0.7} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk Calendar */}
          <div className="card animate-in-delayed">
            <div className="card-header">
              <span className="card-title">30-Day Risk Calendar</span>
              <span className="card-subtitle">September 2026</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', padding: '8px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-muted)', padding: '6px', fontWeight: 600 }}>
                  {d}
                </div>
              ))}
              {/* Offset for September 2026 (Tuesday start) */}
              <div />
              {calendar.slice(0, 30).map((day, i) => {
                const dayNum = i + 1;
                const bgColor = RISK_COLORS[day.risk_level] || '#3a6845';
                return (
                  <div
                    key={day.date}
                    style={{
                      textAlign: 'center',
                      padding: '10px 6px',
                      borderRadius: 'var(--radius-sm)',
                      background: `${bgColor}18`,
                      border: `1px solid ${bgColor}30`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={`${day.date}: ${day.risk_level} risk, ${day.predicted_production_percent.toFixed(0)}% production`}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: bgColor }}>{dayNum}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {day.predicted_production_percent.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
              {Object.entries(RISK_COLORS).map(([level, color]) => (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'simulator' && (
        <div style={{ marginTop: '0.5rem' }}>
          <WhatIfSimulator showTitle={false} />
        </div>
      )}

      {activeTab === 'accuracy' && accuracy && (
        <div className="dashboard-grid-2 animate-in-delayed">
          {/* Scatter Plot */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Predicted vs Actual Production</span>
              <span className="card-subtitle">tonnes</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E6EE" />
                <XAxis dataKey="actual" name="Actual" tick={{ fill: '#64748B', fontSize: 10, fontFamily: "'Noto Sans', sans-serif" }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
                <YAxis dataKey="predicted" name="Predicted" tick={{ fill: '#64748B', fontSize: 10, fontFamily: "'Noto Sans', sans-serif" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={accuracy.scatter_data} fill="#4A2BC2" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Model Performance Metrics</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'RMSE', value: accuracy.metrics.rmse.toFixed(1), unit: 'T', desc: 'Root Mean Square Error' },
                { label: 'MAE', value: accuracy.metrics.mae.toFixed(1), unit: 'T', desc: 'Mean Absolute Error' },
                { label: 'R² Score', value: accuracy.metrics.r2_score.toFixed(2), unit: '', desc: 'Coefficient of Determination' },
                { label: 'Accuracy ±10%', value: accuracy.metrics.accuracy_within_10_percent.toFixed(1), unit: '%', desc: 'Predictions within 10% of actual' },
              ].map((metric) => (
                <div key={metric.label} style={{ padding: '18px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metric.label}</div>
                  <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {metric.value}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>{metric.unit}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>{metric.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
