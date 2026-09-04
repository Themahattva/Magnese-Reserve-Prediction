'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis,
  BarChart, Bar,
} from 'recharts';
import { predictionsAPI } from '@/lib/api';
import type { ShortfallPrediction, RiskCalendarDay, WhatIfRequest, WhatIfResponse } from '@/lib/api';

const RISK_COLORS: Record<string, string> = {
  low: '#00ff66', medium: '#eab308', high: '#f97316', critical: '#ff2a4b',
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#081309', border: '1px solid #00ff66',
      borderRadius: '4px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.9), 0 0 15px rgba(0,255,102,0.2)',
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
          <span style={{ color: entry.color || '#74bf85', fontSize: '0.74rem' }}>{entry.name}</span>
          <span style={{ color: '#d4ffd4', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<ShortfallPrediction[]>([]);
  const [calendar, setCalendar] = useState<RiskCalendarDay[]>([]);
  const [accuracy, setAccuracy] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'predictions' | 'simulator' | 'accuracy'>('predictions');

  // What-If state
  const [whatIf, setWhatIf] = useState<WhatIfRequest>({
    mine_id: 1, days_ahead: 7, equipment_down: 0, rainfall_mm: 0,
    blasting_delay_hours: 0, extra_shift: false,
  });
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResponse | null>(null);
  const [simulating, setSimulating] = useState(false);

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

  async function runSimulation() {
    setSimulating(true);
    try {
      const result = await predictionsAPI.runWhatIf(whatIf);
      setWhatIfResult(result);
    } catch {
      // Offline simulation
      const baseline = 3500 * whatIf.days_ahead;
      const equipImpact = whatIf.equipment_down * 450 * whatIf.days_ahead;
      const rainImpact = (whatIf.rainfall_mm / 50) * 800 * whatIf.days_ahead;
      const blastImpact = whatIf.blasting_delay_hours * 200;
      const shiftBonus = whatIf.extra_shift ? baseline * 0.15 : 0;
      const totalImpact = equipImpact + rainImpact + blastImpact - shiftBonus;
      const adjusted = Math.max(0, baseline - totalImpact);
      const pct = baseline > 0 ? ((baseline - adjusted) / baseline) * 100 : 0;
      setWhatIfResult({
        baseline_production: Math.round(baseline),
        adjusted_production: Math.round(adjusted),
        impact_tonnes: Math.round(baseline - adjusted),
        impact_percent: Math.round(pct * 10) / 10,
        risk_level: pct > 40 ? 'critical' : pct > 25 ? 'high' : pct > 10 ? 'medium' : 'low',
        breakdown: {
          equipment_downtime_impact: Math.round(equipImpact),
          rainfall_impact: Math.round(rainImpact),
          blasting_delay_impact: Math.round(blastImpact),
          extra_shift_bonus: Math.round(shiftBonus),
        },
      });
    } finally {
      setSimulating(false);
    }
  }

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
                          <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
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
        <div className="dashboard-grid-2 animate-in-delayed">
          {/* Controls */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Simulation Parameters</span>
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Days Ahead</span>
                <span>{whatIf.days_ahead}</span>
              </div>
              <input type="range" min={1} max={30} value={whatIf.days_ahead}
                onChange={(e) => setWhatIf({ ...whatIf, days_ahead: Number(e.target.value) })} />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Equipment Down</span>
                <span>{whatIf.equipment_down} units</span>
              </div>
              <input type="range" min={0} max={10} value={whatIf.equipment_down}
                onChange={(e) => setWhatIf({ ...whatIf, equipment_down: Number(e.target.value) })} />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Rainfall</span>
                <span>{whatIf.rainfall_mm} mm</span>
              </div>
              <input type="range" min={0} max={200} step={5} value={whatIf.rainfall_mm}
                onChange={(e) => setWhatIf({ ...whatIf, rainfall_mm: Number(e.target.value) })} />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Blasting Delay</span>
                <span>{whatIf.blasting_delay_hours} hrs</span>
              </div>
              <input type="range" min={0} max={24} value={whatIf.blasting_delay_hours}
                onChange={(e) => setWhatIf({ ...whatIf, blasting_delay_hours: Number(e.target.value) })} />
            </div>

            <div className="toggle-wrapper" style={{ marginBottom: '20px' }}>
              <div
                className={`toggle ${whatIf.extra_shift ? 'active' : ''}`}
                onClick={() => setWhatIf({ ...whatIf, extra_shift: !whatIf.extra_shift })}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Extra Shift (Night)</span>
            </div>

            <button className="btn btn-primary" onClick={runSimulation} style={{ width: '100%' }}>
              {simulating ? '⏳ Simulating...' : '▶️ Run Simulation'}
            </button>
          </div>

          {/* Results */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Simulation Results</span>
            </div>
            {whatIfResult ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>PREDICTED IMPACT</div>
                  <div className="stat-highlight" style={{ fontSize: '2.5rem' }}>
                    {whatIfResult.impact_percent > 0 ? '-' : '+'}{Math.abs(whatIfResult.impact_percent).toFixed(1)}%
                  </div>
                  <span className={`risk-badge ${whatIfResult.risk_level}`} style={{ marginTop: '8px' }}>
                    {whatIfResult.risk_level} risk
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Baseline</div>
                    <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{whatIfResult.baseline_production.toLocaleString()} T</div>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Adjusted</div>
                    <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: RISK_COLORS[whatIfResult.risk_level] }}>
                      {whatIfResult.adjusted_production.toLocaleString()} T
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>IMPACT BREAKDOWN</div>
                {Object.entries(whatIfResult.breakdown).map(([key, value]) => {
                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                  const isBonus = key.includes('bonus');
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                      <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: isBonus ? 'var(--risk-low)' : 'var(--risk-critical)' }}>
                        {isBonus ? '+' : '-'}{Math.abs(value).toLocaleString()} T
                      </span>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="empty-state">
                <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🔬</p>
                <p>Adjust parameters and run simulation to see predicted impact</p>
              </div>
            )}
          </div>
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
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,255,102,0.06)" />
                <XAxis dataKey="actual" name="Actual" tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(0,255,102,0.15)' }} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
                <YAxis dataKey="predicted" name="Predicted" tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={accuracy.scatter_data} fill="#00ff66" fillOpacity={0.7} />
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
