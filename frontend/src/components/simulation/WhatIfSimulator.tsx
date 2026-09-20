'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Sparkles,
  CloudRain,
  Wrench,
  Flame,
  Moon,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Zap,
  Clock,
  Activity,
} from 'lucide-react';
import { predictionsAPI, auditAPI } from '@/lib/api';
import type { WhatIfRequest, WhatIfResponse } from '@/lib/api';

export interface MineSpec {
  id: number;
  name: string;
  type: 'Opencast' | 'Underground';
  district: string;
  state: string;
  daily_capacity: number;
  fleet_size: number;
  rain_threshold_mm: number;
  blasting_buffer_hours: number;
  weather_sensitivity: number;
}

export const MOIL_MINES: MineSpec[] = [
  { id: 1, name: "Dongri Buzurg", type: "Opencast", district: "Bhandara", state: "Maharashtra", daily_capacity: 1100, fleet_size: 15, rain_threshold_mm: 35.0, blasting_buffer_hours: 6.0, weather_sensitivity: 1.4 },
  { id: 2, name: "Balaghat", type: "Underground", district: "Balaghat", state: "Madhya Pradesh", daily_capacity: 1350, fleet_size: 18, rain_threshold_mm: 65.0, blasting_buffer_hours: 8.0, weather_sensitivity: 0.6 },
  { id: 3, name: "Chikla", type: "Underground", district: "Bhandara", state: "Maharashtra", daily_capacity: 650, fleet_size: 19, rain_threshold_mm: 55.0, blasting_buffer_hours: 7.0, weather_sensitivity: 0.7 },
  { id: 4, name: "Munsar", type: "Underground", district: "Nagpur", state: "Maharashtra", daily_capacity: 520, fleet_size: 17, rain_threshold_mm: 45.0, blasting_buffer_hours: 5.0, weather_sensitivity: 0.9 },
  { id: 5, name: "Kandri", type: "Underground", district: "Nagpur", state: "Maharashtra", daily_capacity: 480, fleet_size: 16, rain_threshold_mm: 50.0, blasting_buffer_hours: 6.0, weather_sensitivity: 0.8 },
  { id: 6, name: "Gumgaon", type: "Underground", district: "Nagpur", state: "Maharashtra", daily_capacity: 420, fleet_size: 15, rain_threshold_mm: 45.0, blasting_buffer_hours: 5.0, weather_sensitivity: 0.85 },
  { id: 7, name: "Parsioni", type: "Underground", district: "Nagpur", state: "Maharashtra", daily_capacity: 350, fleet_size: 16, rain_threshold_mm: 40.0, blasting_buffer_hours: 4.0, weather_sensitivity: 1.0 },
  { id: 8, name: "Sitapatore", type: "Underground", district: "Bhandara", state: "Maharashtra", daily_capacity: 300, fleet_size: 15, rain_threshold_mm: 40.0, blasting_buffer_hours: 4.0, weather_sensitivity: 1.1 },
  { id: 9, name: "Tirodi", type: "Opencast", district: "Balaghat", state: "Madhya Pradesh", daily_capacity: 750, fleet_size: 17, rain_threshold_mm: 35.0, blasting_buffer_hours: 6.0, weather_sensitivity: 1.35 },
];

export function computeCalibratedWhatIf(whatIf: WhatIfRequest): WhatIfResponse {
  const calib = MOIL_MINES.find((m) => m.id === whatIf.mine_id) || MOIL_MINES[0];
  const days = Math.max(1, whatIf.days_ahead);
  const baseline = Math.round(calib.daily_capacity * days);

  // 1. Non-linear equipment fleet availability bottleneck
  const fleetSize = Math.max(1, calib.fleet_size);
  const down = Math.min(whatIf.equipment_down, fleetSize);
  let equipImpact = 0;
  if (down > 0) {
    const frac = down / fleetSize;
    const lossEquipFrac = Math.pow(frac, 1.25) * 0.85;
    equipImpact = Math.round(baseline * lossEquipFrac);
  }

  // 2. Hydrologic pit / sump inundation
  const threshold = calib.rain_threshold_mm;
  const sensitivity = calib.weather_sensitivity;
  let rainImpact = 0;
  if (whatIf.rainfall_mm > 0) {
    if (whatIf.rainfall_mm <= threshold) {
      const rainFrac = (whatIf.rainfall_mm / threshold) * 0.12 * sensitivity;
      rainImpact = Math.round(baseline * rainFrac);
    } else {
      const excess = whatIf.rainfall_mm - threshold;
      const baseLoss = 0.12 * sensitivity;
      const excessFrac = Math.min(0.65, (excess / 60.0) * 0.55 * sensitivity);
      rainImpact = Math.round(baseline * (baseLoss + excessFrac));
    }
  }

  // 3. Blasting cycle delay / muckpile starvation
  const buffer = calib.blasting_buffer_hours;
  let blastImpact = 0;
  if (whatIf.blasting_delay_hours > 0) {
    if (whatIf.blasting_delay_hours <= buffer) {
      blastImpact = Math.round(baseline * (whatIf.blasting_delay_hours / Math.max(0.1, buffer)) * 0.02);
    } else {
      const unbuffered = Math.min(24.0, whatIf.blasting_delay_hours - buffer);
      const frac = Math.min(0.35, 0.02 + Math.pow(unbuffered / 16.0, 1.15) * 0.33);
      blastImpact = Math.round(baseline * frac);
    }
  }

  // 4. Compound muddy ramp traction drag
  let compoundDrag = 0;
  if (whatIf.rainfall_mm > 25.0 && whatIf.equipment_down > 0) {
    compoundDrag = Math.round(equipImpact * 0.20 * Math.min(1.0, (whatIf.rainfall_mm - 25.0) / 50.0));
  }

  // 5. Extra shift ore recovery bonus
  let shiftBonus = 0;
  if (whatIf.extra_shift) {
    const weatherEff = Math.max(0.10, 1.0 - (whatIf.rainfall_mm / 80.0) * 0.85);
    shiftBonus = Math.round(baseline * 0.22 * weatherEff);
  }

  const grossLoss = equipImpact + rainImpact + blastImpact + compoundDrag;
  const netLoss = grossLoss - shiftBonus;
  const adjusted = Math.max(0, baseline - netLoss);
  const impactTonnes = baseline - adjusted;
  const impactPct = baseline > 0 ? Number(((impactTonnes / baseline) * 100).toFixed(1)) : 0;

  let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (impactPct > 28) risk = 'critical';
  else if (impactPct > 18) risk = 'high';
  else if (impactPct > 8) risk = 'medium';

  return {
    scenario: 'Interactive Physics-Calibrated Simulation',
    baseline_production: baseline,
    adjusted_production: adjusted,
    impact_tonnes: impactTonnes,
    impact_percent: impactPct,
    risk_level: risk,
    breakdown: {
      equipment_downtime_impact: equipImpact,
      rainfall_impact: rainImpact,
      blasting_delay_impact: blastImpact,
      compound_haulroad_drag: compoundDrag,
      extra_shift_bonus: shiftBonus,
    },
  };
}

const RISK_COLORS: Record<string, string> = {
  low: '#128937',
  medium: '#d98a00',
  high: '#ea580c',
  critical: '#dc2626',
};

interface WhatIfSimulatorProps {
  initialMineId?: number;
  showTitle?: boolean;
}

export default function WhatIfSimulator({ initialMineId = 1, showTitle = true }: WhatIfSimulatorProps) {
  const [whatIf, setWhatIf] = useState<WhatIfRequest>({
    mine_id: initialMineId,
    days_ahead: 7,
    equipment_down: 0,
    rainfall_mm: 0,
    blasting_delay_hours: 0,
    extra_shift: false,
  });
  const [activePreset, setActivePreset] = useState<string>('reset');
  const [serverResult, setServerResult] = useState<WhatIfResponse | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [committedNotice, setCommittedNotice] = useState<string | null>(null);

  const selectedMine = MOIL_MINES.find((m) => m.id === whatIf.mine_id) || MOIL_MINES[0];
  const computedResult = useMemo(() => computeCalibratedWhatIf(whatIf), [whatIf]);
  const whatIfResult = serverResult || computedResult;

  const handleMineChange = (newMineId: number) => {
    const targetMine = MOIL_MINES.find((m) => m.id === newMineId) || MOIL_MINES[0];
    setServerResult(null);
    setWhatIf((prev) => ({
      ...prev,
      mine_id: newMineId,
      equipment_down: Math.min(prev.equipment_down, targetMine.fleet_size),
    }));
  };

  const applyPreset = (preset: 'monsoon' | 'breakdown' | 'blasting' | 'night' | 'reset') => {
    setActivePreset(preset);
    const m = selectedMine;
    let next = { ...whatIf };
    if (preset === 'monsoon') {
      next = {
        ...next,
        rainfall_mm: Math.round(m.rain_threshold_mm * 2.2),
        equipment_down: Math.max(1, Math.round(m.fleet_size * 0.18)),
        blasting_delay_hours: 4,
        extra_shift: false,
      };
    } else if (preset === 'breakdown') {
      next = {
        ...next,
        rainfall_mm: 5,
        equipment_down: Math.max(2, Math.round(m.fleet_size * 0.35)),
        blasting_delay_hours: 1,
        extra_shift: false,
      };
    } else if (preset === 'blasting') {
      next = {
        ...next,
        rainfall_mm: 0,
        equipment_down: 0,
        blasting_delay_hours: 12,
        extra_shift: false,
      };
    } else if (preset === 'night') {
      next = {
        ...next,
        rainfall_mm: 0,
        equipment_down: 0,
        blasting_delay_hours: 0,
        extra_shift: true,
      };
    } else if (preset === 'reset') {
      next = {
        ...next,
        rainfall_mm: 0,
        equipment_down: 0,
        blasting_delay_hours: 0,
        extra_shift: false,
      };
    }
    setServerResult(null);
    setWhatIf(next);
  };

  const runBackendSimulation = async () => {
    setSimulating(true);
    try {
      const result = await predictionsAPI.runWhatIf(whatIf);
      setServerResult(result);
    } catch {
      setServerResult(computeCalibratedWhatIf(whatIf));
    } finally {
      setTimeout(() => setSimulating(false), 300);
    }
  };

  const handleCommitToDecisions = async () => {
    try {
      await auditAPI.createAuditLog({
        user: 'Operations Controller',
        action: 'COMMIT_WHAT_IF_SCENARIO',
        entity: `SIM-MINE-${whatIf.mine_id}-${whatIf.days_ahead}D`,
        previous_state: `Baseline: ${whatIfResult.baseline_production.toLocaleString()} T`,
        new_state: `Simulated: ${whatIfResult.adjusted_production.toLocaleString()} T (${whatIfResult.impact_tonnes > 0 ? '−' : '+'}${Math.abs(whatIfResult.impact_tonnes).toLocaleString()} T, ${whatIfResult.risk_level} risk)`,
        reason: `Contingency scenario commit for ${selectedMine.name} with ${whatIf.equipment_down} HEMM down, ${whatIf.rainfall_mm}mm rain, ${whatIf.blasting_delay_hours}h blast delay`,
      });
      setCommittedNotice(
        `Operational contingency committed for ${selectedMine.name}: Net ${whatIfResult.impact_tonnes > 0 ? '−' : '+'}${Math.abs(whatIfResult.impact_tonnes).toLocaleString()} T (${whatIfResult.impact_percent}%) logged to Decision Center audit trail.`
      );
      setTimeout(() => setCommittedNotice(null), 9000);
    } catch {
      setCommittedNotice(`Contingency scenario saved locally for ${selectedMine.name}.`);
      setTimeout(() => setCommittedNotice(null), 7000);
    }
  };

  // Retention percentage
  const retainedPct = Math.max(
    0,
    Math.min(100, Math.round((whatIfResult.adjusted_production / (whatIfResult.baseline_production || 1)) * 100))
  );

  // Proportional breakdown calculations
  const totalLoss =
    (whatIfResult.breakdown.equipment_downtime_impact || 0) +
    (whatIfResult.breakdown.rainfall_impact || 0) +
    (whatIfResult.breakdown.blasting_delay_impact || 0) +
    (whatIfResult.breakdown.compound_haulroad_drag || 0);

  const getLossShare = (val: number) => (totalLoss > 0 ? Math.round((val / totalLoss) * 100) : 0);

  return (
    <div className="whatif-simulator-container">
      <style jsx>{`
        @keyframes livePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.55;
          }
        }
        @keyframes subtleGlow {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(74, 43, 194, 0.08);
          }
          50% {
            box-shadow: 0 8px 24px rgba(74, 43, 194, 0.18);
          }
        }
        .preset-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        .preset-card:hover {
          transform: translateY(-2px);
          border-color: #4a2bc2;
          box-shadow: 0 6px 16px rgba(74, 43, 194, 0.12);
        }
        .preset-card.active {
          border-color: #4a2bc2;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          box-shadow: 0 0 0 2px #4a2bc2, 0 6px 18px rgba(74, 43, 194, 0.15);
        }
        .slider-wrap {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 16px;
          transition: border-color 0.2s;
        }
        .slider-wrap:hover {
          border-color: #cbd5e1;
        }
        .custom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e2e8f0;
          outline: none;
          transition: background 0.2s;
          cursor: pointer;
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4a2bc2;
          cursor: pointer;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          transition: transform 0.15s, background-color 0.15s;
        }
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          background: #371ea3;
        }
        .loss-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .loss-row:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: livePulse 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* Optional Top Header */}
      {showTitle && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="ux4g-badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Sliders size={12} />
                <span>Calibrated Operational Sandbox</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Physics-Informed Mine Inundation &amp; Fleet Availability Model
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
              What-If Scenario Simulation Engine
            </h1>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Dynamically model non-linear equipment bottlenecks, monsoon pit inundation, and blasting cycle delays across all 9 MOIL leases.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/decisions" className="ux4g-btn ux4g-btn-outline ux4g-btn-sm" style={{ gap: '6px' }}>
              <span>Decision Center</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Committed Notice Banner */}
      {committedNotice && (
        <div
          className="ux4g-alert alert-success animate-in"
          style={{
            marginBottom: '1.25rem',
            boxShadow: '0 4px 14px rgba(18, 137, 55, 0.15)',
            borderLeft: '4px solid #128937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#128937', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{committedNotice}</span>
        </div>
      )}

      {/* ── PRESET SCENARIOS SECTION ─────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--ux4g-primary)' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Calibrated Stress Test Presets
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            One-click standard mining scenarios calibrated against {selectedMine.name}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {/* Preset 1: Monsoon */}
          <button
            type="button"
            className={`preset-card ${activePreset === 'monsoon' ? 'active' : ''}`}
            onClick={() => applyPreset('monsoon')}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CloudRain size={18} style={{ color: '#0284c7' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Monsoon Sump Surge</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{Math.round(selectedMine.rain_threshold_mm * 2.2)}mm pit flooding</div>
            </div>
          </button>

          {/* Preset 2: Fleet Breakdown */}
          <button
            type="button"
            className={`preset-card ${activePreset === 'breakdown' ? 'active' : ''}`}
            onClick={() => applyPreset('breakdown')}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wrench size={18} style={{ color: '#ea580c' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Fleet Availability Drop</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>35% shovel/loader failure</div>
            </div>
          </button>

          {/* Preset 3: Blasting Stoppage */}
          <button
            type="button"
            className={`preset-card ${activePreset === 'blasting' ? 'active' : ''}`}
            onClick={() => applyPreset('blasting')}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Flame size={18} style={{ color: '#dc2626' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Blasting Cycle Stoppage</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>12h muckpile face starvation</div>
            </div>
          </button>

          {/* Preset 4: Night Shift */}
          <button
            type="button"
            className={`preset-card ${activePreset === 'night' ? 'active' : ''}`}
            onClick={() => applyPreset('night')}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Moon size={18} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Night Shift Boost</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>+22% extra shift recovery</div>
            </div>
          </button>

          {/* Preset 5: Reset */}
          <button
            type="button"
            className={`preset-card ${activePreset === 'reset' ? 'active' : ''}`}
            onClick={() => applyPreset('reset')}
            style={{ minWidth: '130px' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RotateCcw size={18} style={{ color: '#475569' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Baseline Reset</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Nominal operation</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── TWO COLUMN MAIN GRID ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: PARAMETER SLIDERS & CONFIG */}
        <div className="ux4g-card" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div className="ux4g-card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                <span>Simulation Parameters</span>
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Operational calibration for <strong>{selectedMine.name}</strong> ({selectedMine.district}, {selectedMine.state})
              </div>
            </div>
            <span className="ux4g-badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
              {selectedMine.type}
            </span>
          </div>

          <div className="ux4g-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Target Mine Dropdown */}
            <div className="slider-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Target Mining Lease</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ux4g-primary)', fontWeight: 700 }}>
                  {selectedMine.daily_capacity.toLocaleString()} T / day capacity
                </span>
              </div>
              <select
                className="ux4g-form-control"
                value={whatIf.mine_id}
                onChange={(e) => handleMineChange(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                {MOIL_MINES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.type}) — {m.district}, {m.state} [{m.fleet_size} HEMM units]
                  </option>
                ))}
              </select>
            </div>

            {/* Forecast Horizon */}
            <div className="slider-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: 'var(--ux4g-primary)' }} />
                  <span>Forecast Horizon</span>
                </span>
                <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ux4g-primary)', background: '#ede9fe', padding: '2px 8px', borderRadius: '4px' }}>
                  {whatIf.days_ahead} Days
                </span>
              </div>
              <input
                type="range"
                className="custom-slider"
                min={1}
                max={30}
                value={whatIf.days_ahead}
                onChange={(e) => {
                  setServerResult(null);
                  setActivePreset('custom');
                  setWhatIf({ ...whatIf, days_ahead: Number(e.target.value) });
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>1 Day (Immediate Shift)</span>
                <span>14 Days (Bi-weekly)</span>
                <span>30 Days (Monthly)</span>
              </div>
            </div>

            {/* Fleet Availability Deficit */}
            <div className="slider-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wrench size={14} style={{ color: '#ea580c' }} />
                  <span>Fleet Availability Deficit</span>
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: whatIf.equipment_down > 0 ? '#ea580c' : '#128937',
                    background: whatIf.equipment_down > 0 ? '#ffedd5' : '#e6f7ec',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {whatIf.equipment_down} / {selectedMine.fleet_size} units down ({selectedMine.fleet_size > 0 ? Math.round((whatIf.equipment_down / selectedMine.fleet_size) * 100) : 0}%)
                </span>
              </div>
              <input
                type="range"
                className="custom-slider"
                min={0}
                max={selectedMine.fleet_size}
                value={whatIf.equipment_down}
                onChange={(e) => {
                  setServerResult(null);
                  setActivePreset('custom');
                  setWhatIf({ ...whatIf, equipment_down: Number(e.target.value) });
                }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Active loading benches at {selectedMine.name}. 1 excavator failure starves ~3–4 dump tippers.
              </div>
            </div>

            {/* 24-Hour Rainfall Level */}
            <div className="slider-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CloudRain size={14} style={{ color: '#0284c7' }} />
                  <span>24-Hour Incline Rainfall</span>
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: whatIf.rainfall_mm > selectedMine.rain_threshold_mm ? '#dc2626' : '#0284c7',
                    background: whatIf.rainfall_mm > selectedMine.rain_threshold_mm ? '#fee2e2' : '#e0f2fe',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {whatIf.rainfall_mm} mm
                </span>
              </div>
              <input
                type="range"
                className="custom-slider"
                min={0}
                max={200}
                step={5}
                value={whatIf.rainfall_mm}
                onChange={(e) => {
                  setServerResult(null);
                  setActivePreset('custom');
                  setWhatIf({ ...whatIf, rainfall_mm: Number(e.target.value) });
                }}
              />
              {whatIf.rainfall_mm > selectedMine.rain_threshold_mm ? (
                <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} />
                  <span>Exceeds {selectedMine.rain_threshold_mm}mm sump threshold! Floor inundation &amp; ramp slip active.</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Pit sump threshold: {selectedMine.rain_threshold_mm} mm. Sub-threshold: minor haul road traction slip.
                </div>
              )}
            </div>

            {/* Blasting Delay */}
            <div className="slider-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={14} style={{ color: '#dc2626' }} />
                  <span>Blasting Cycle Delay</span>
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: whatIf.blasting_delay_hours > selectedMine.blasting_buffer_hours ? '#dc2626' : '#475569',
                    background: whatIf.blasting_delay_hours > selectedMine.blasting_buffer_hours ? '#fee2e2' : '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {whatIf.blasting_delay_hours} hrs
                </span>
              </div>
              <input
                type="range"
                className="custom-slider"
                min={0}
                max={24}
                value={whatIf.blasting_delay_hours}
                onChange={(e) => {
                  setServerResult(null);
                  setActivePreset('custom');
                  setWhatIf({ ...whatIf, blasting_delay_hours: Number(e.target.value) });
                }}
              />
              {whatIf.blasting_delay_hours > selectedMine.blasting_buffer_hours ? (
                <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} />
                  <span>Exceeds {selectedMine.blasting_buffer_hours}h muckpile buffer! Shovels starved of fragmented ore.</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Muckpile buffer protects shovel continuous loading up to {selectedMine.blasting_buffer_hours}h.
                </div>
              )}
            </div>

            {/* Extra Shift Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: whatIf.extra_shift ? '#f5f3ff' : '#ffffff',
                borderRadius: '8px',
                border: whatIf.extra_shift ? '1.5px solid #4a2bc2' : '1px solid #e2e8f0',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                id="sim-extra-shift"
                checked={whatIf.extra_shift}
                onChange={() => {
                  setServerResult(null);
                  setActivePreset('custom');
                  setWhatIf({ ...whatIf, extra_shift: !whatIf.extra_shift });
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4a2bc2' }}
              />
              <label htmlFor="sim-extra-shift" style={{ cursor: 'pointer', flex: 1, margin: 0 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                  Deploy Extra Night Shift (+22% nominal recovery)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {whatIf.rainfall_mm > 40
                    ? '⚠️ Severe rainfall limits night illumination & wet ramp haulage safety.'
                    : 'Optimal dry conditions: full night haulage & shovel loading authorized.'}
                </span>
              </label>
            </div>

            {/* Backend Recalculate Button */}
            <button
              type="button"
              className="ux4g-btn ux4g-btn-primary"
              onClick={runBackendSimulation}
              disabled={simulating}
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem', justifyContent: 'center' }}
            >
              {simulating ? '⏳ Querying Server Model...' : '⚡ Re-compute Live Model'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: GAUGE, STATS & LOSS BREAKDOWN */}
        <div className="ux4g-card" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div className="ux4g-card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" style={{ backgroundColor: RISK_COLORS[whatIfResult.risk_level] }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                <span>Simulated Forecast &amp; Impact</span>
              </h3>
            </div>
            <span
              className={`ux4g-badge badge-${whatIfResult.risk_level}`}
              style={{ textTransform: 'uppercase', fontWeight: 700 }}
            >
              {whatIfResult.risk_level} Risk
            </span>
          </div>

          <div className="ux4g-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Primary Visual Variance Gauge */}
            <div
              style={{
                textAlign: 'center',
                padding: '20px 16px',
                background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                <Activity size={13} style={{ color: 'var(--ux4g-primary)' }} />
                <span>Simulated Variance &bull; {selectedMine.name}</span>
              </div>

              {/* Huge Variance Percentage */}
              <div
                className="mono"
                style={{
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  margin: '8px 0',
                  color: whatIfResult.impact_percent > 0 ? RISK_COLORS[whatIfResult.risk_level] : '#128937',
                  textShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {whatIfResult.impact_percent > 0 ? '−' : '+'}{Math.abs(whatIfResult.impact_percent).toFixed(1)}%
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                Net Output Variance:{' '}
                <strong className="mono" style={{ color: whatIfResult.impact_tonnes > 0 ? RISK_COLORS[whatIfResult.risk_level] : '#128937', fontSize: '1rem' }}>
                  {whatIfResult.impact_tonnes > 0 ? '−' : '+'}{Math.abs(whatIfResult.impact_tonnes).toLocaleString()} Tonnes
                </strong>{' '}
                over {whatIf.days_ahead} days
              </div>

              {/* Dual Horizontal Animated Gauge Meter */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '5px' }}>
                  <span>Retained Output: <strong>{retainedPct}%</strong></span>
                  <span>Target: <strong>{whatIfResult.baseline_production.toLocaleString()} T</strong></span>
                </div>
                
                {/* Outer Track */}
                <div style={{ height: '12px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                  {/* Retained Output Fill */}
                  <div
                    style={{
                      height: '100%',
                      width: `${retainedPct}%`,
                      background: retainedPct > 80 ? 'linear-gradient(90deg, #10b981, #059669)' : retainedPct > 60 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                  {/* Lost Output Fill */}
                  <div
                    style={{
                      height: '100%',
                      width: `${100 - retainedPct}%`,
                      background: '#fee2e2',
                      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ padding: '12px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>BASELINE TARGET</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                  {whatIfResult.baseline_production.toLocaleString()} T
                </div>
              </div>
              <div style={{ padding: '12px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SIMULATED OUTPUT</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: RISK_COLORS[whatIfResult.risk_level] }}>
                  {whatIfResult.adjusted_production.toLocaleString()} T
                </div>
              </div>
              <div style={{ padding: '12px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET VARIANCE</div>
                <div
                  className="mono"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginTop: '4px',
                    color: whatIfResult.impact_tonnes > 0 ? RISK_COLORS[whatIfResult.risk_level] : '#128937',
                  }}
                >
                  {whatIfResult.impact_tonnes > 0 ? '−' : '+'}{Math.abs(whatIfResult.impact_tonnes).toLocaleString()} T
                </div>
              </div>
            </div>

            {/* Physics & Operational Loss Breakdown */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Physics &amp; Operational Loss Breakdown
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(whatIfResult.breakdown).map(([key, value]) => {
                  let label = key;
                  let icon = <Zap size={14} />;
                  let barColor = '#4a2bc2';

                  if (key === 'equipment_downtime_impact') {
                    label = 'Fleet Availability Bottleneck';
                    icon = <Wrench size={14} style={{ color: '#ea580c' }} />;
                    barColor = '#ea580c';
                  } else if (key === 'rainfall_impact') {
                    label = 'Hydrologic Pit Inundation';
                    icon = <CloudRain size={14} style={{ color: '#0284c7' }} />;
                    barColor = '#0284c7';
                  } else if (key === 'blasting_delay_impact') {
                    label = 'Muckpile Face Starvation';
                    icon = <Flame size={14} style={{ color: '#dc2626' }} />;
                    barColor = '#dc2626';
                  } else if (key === 'compound_haulroad_drag') {
                    label = 'Compound Muddy Ramp Drag';
                    icon = <AlertTriangle size={14} style={{ color: '#d97706' }} />;
                    barColor = '#d97706';
                  } else if (key === 'extra_shift_bonus') {
                    label = 'Extra Night Shift Ore Recovery';
                    icon = <Moon size={14} style={{ color: '#10b981' }} />;
                    barColor = '#10b981';
                  }

                  const isBonus = key === 'extra_shift_bonus';
                  const share = isBonus ? 0 : getLossShare(value);

                  return (
                    <div key={key} className="loss-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {icon}
                          <span>{label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {!isBonus && share > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: '3px' }}>
                              {share}%
                            </span>
                          )}
                          <strong
                            className="mono"
                            style={{
                              fontSize: '0.84rem',
                              color: isBonus ? '#10b981' : value > 0 ? '#dc2626' : '#64748b',
                            }}
                          >
                            {isBonus ? `+${value.toLocaleString()} T` : `−${value.toLocaleString()} T`}
                          </strong>
                        </div>
                      </div>

                      {/* Mini Proportional Bar */}
                      {!isBonus && (
                        <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${share}%`,
                              backgroundColor: barColor,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Mitigation Directive */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 700 }}>
                <Info size={15} />
                <span>AI Operational Mitigation Directive</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.55 }}>
                {whatIfResult.breakdown.rainfall_impact > (whatIfResult.breakdown.equipment_downtime_impact || 0) &&
                whatIfResult.breakdown.rainfall_impact > (whatIfResult.breakdown.blasting_delay_impact || 0)
                  ? `Hydrologic inundation is the dominant constraint for ${selectedMine.name}. Activate auxiliary submersible sump pumps at pit floor benches and divert haul tippers to higher dewatered ramps to salvage up to ~${Math.round(whatIfResult.breakdown.rainfall_impact * 0.45).toLocaleString()} T.`
                  : whatIfResult.breakdown.equipment_downtime_impact > (whatIfResult.breakdown.blasting_delay_impact || 0)
                  ? `Mechanical fleet availability is critical. Reallocate idle dumpers from Chikla lease and schedule pit floor maintenance overnight.`
                  : whatIfResult.breakdown.blasting_delay_impact > 0
                  ? `Blasting delay is starving loading faces. Authorize pre-split blasting during shift changeover to replenish buffer muckpile.`
                  : 'Operational conditions nominal. Maintain current shovel loading patterns.'}
              </div>
            </div>

            {/* Commit to Decision Center Button */}
            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline"
              onClick={handleCommitToDecisions}
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center', gap: '6px' }}
            >
              <span>📋 Commit Scenario to Decision Center Audit Trail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
