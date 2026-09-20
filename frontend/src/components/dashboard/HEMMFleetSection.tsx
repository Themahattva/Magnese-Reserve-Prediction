'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpRight,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Equipment } from '@/lib/api';
import { productionAPI } from '@/lib/api';
import rawEquipmentData from '@/data/equipmentData.json';

const MINE_NAMES: Record<number, string> = {
  1: 'Dongri Buzurg',
  2: 'Balaghat',
  3: 'Chikla',
  4: 'Munsar',
  5: 'Kandri',
  6: 'Gumgaon',
  7: 'Parsioni',
  8: 'Sitapatore',
  9: 'Tirodi',
};

const MINE_TYPES: Record<number, 'Opencast' | 'Underground'> = {
  1: 'Opencast',
  2: 'Underground',
  3: 'Underground',
  4: 'Underground',
  5: 'Underground',
  6: 'Underground',
  7: 'Underground',
  8: 'Underground',
  9: 'Opencast',
};

export default function HEMMFleetSection() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(rawEquipmentData as Equipment[]);
  const [selectedMineId, setSelectedMineId] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchFleet() {
      try {
        const live = await productionAPI.getEquipment();
        if (live && live.length > 0) {
          setEquipmentList(live);
        }
      } catch {
        // Fallback already preloaded from rawEquipmentData
      }
    }
    fetchFleet();
  }, []);

  // Stats
  const totalFleet = equipmentList.length;
  const activeUnits = equipmentList.filter((e) => e.status === 'active').length;
  const idleUnits = equipmentList.filter((e) => e.status === 'idle').length;
  const maintenanceUnits = equipmentList.filter((e) => e.status === 'maintenance').length;
  const breakdownUnits = equipmentList.filter((e) => e.status === 'breakdown').length;

  const availabilityRate = totalFleet > 0 ? ((activeUnits / totalFleet) * 100).toFixed(1) : '0';

  // Unique Equipment Types
  const equipmentTypes = useMemo(() => {
    const set = new Set<string>();
    equipmentList.forEach((e) => set.add(e.equipment_type));
    return Array.from(set).sort();
  }, [equipmentList]);

  // Idle Machinery List
  const idleMachinery = useMemo(() => {
    return equipmentList.filter((e) => e.status === 'idle');
  }, [equipmentList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return equipmentList.filter((item) => {
      if (selectedMineId !== 'all' && item.mine_id !== selectedMineId) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (selectedType !== 'all' && item.equipment_type !== selectedType) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesId = item.unique_id?.toLowerCase().includes(query) || String(item.id).includes(query);
        const matchesModel = item.model_name.toLowerCase().includes(query);
        const matchesType = item.equipment_type.toLowerCase().includes(query);
        const matchesMine = item.mine_name?.toLowerCase().includes(query);
        if (!matchesId && !matchesModel && !matchesType && !matchesMine) return false;
      }
      return true;
    });
  }, [equipmentList, selectedMineId, selectedStatus, selectedType, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="ux4g-card" style={{ marginBottom: '2rem', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
      <style jsx>{`
        @keyframes pulseActive {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }
        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .status-dot.active {
          background-color: #128937;
          animation: pulseActive 1.8s infinite ease-in-out;
        }
        .status-dot.idle {
          background-color: #d98a00;
        }
        .status-dot.maintenance {
          background-color: #0284c7;
        }
        .status-dot.breakdown {
          background-color: #dc2626;
          animation: pulseActive 1.2s infinite ease-in-out;
        }
        .idle-card {
          background: #ffffff;
          border: 1px solid #fed7aa;
          border-left: 4px solid #f97316;
          border-radius: 6px;
          padding: 10px 12px;
          transition: all 0.2s;
        }
        .idle-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
        }
      `}</style>

      {/* Header */}
      <div className="ux4g-card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Truck size={18} style={{ color: 'var(--ux4g-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              <span>Heavy Earth Moving Machinery (HEMM) Telemetry &amp; Fleet Status</span>
            </h3>
            <span className="ux4g-badge badge-primary" style={{ fontSize: '0.72rem' }}>
              SCADA Fleet Telemetry
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Asset tracking, deployment breakdown, and live machinery status across all 9 MOIL operating leases.
          </p>
        </div>
      </div>

      <div className="ux4g-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* ── 4 KPI STATS CARDS ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          
          {/* Card 1: Total Fleet */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Fleet Available
              </span>
              <Truck size={16} style={{ color: 'var(--ux4g-primary)' }} />
            </div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {totalFleet} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Units</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
              Across 12 equipment classes in 9 mines
            </div>
          </div>

          {/* Card 2: Active Operating */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#128937', textTransform: 'uppercase' }}>
                Active Operating
              </span>
              <CheckCircle2 size={16} style={{ color: '#128937' }} />
            </div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#128937', lineHeight: 1.1 }}>
              {activeUnits} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Units</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#128937', fontWeight: 600, marginTop: '6px' }}>
              {availabilityRate}% operational availability
            </div>
          </div>

          {/* Card 3: Idle Machines */}
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                Standby / Buffer Pool
              </span>
              <span className="ux4g-badge badge-warning" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                REALLOCATION
              </span>
            </div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>
              {idleUnits} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#92400e' }}>Units</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '6px', fontWeight: 500 }}>
              Surplus capacity ready for shortfall pits
            </div>
          </div>

          {/* Card 4: Under Maintenance / Breakdown */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                Maintenance &amp; Down
              </span>
              <Wrench size={16} style={{ color: '#ea580c' }} />
            </div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', lineHeight: 1.1 }}>
              {maintenanceUnits + breakdownUnits} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Units</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
              {maintenanceUnits} scheduled service &bull; {breakdownUnits} breakdown
            </div>
          </div>

        </div>

        {/* ── FLEET OPERATIONAL STATUS & DISPATCH SPOTLIGHT (VARIED STATUSES) ──── */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                Live Fleet Machinery Status &amp; Telemetry Spotlight
              </strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Real-time status variations across active deployment, standby buffers, preventative maintenance, and breakdown.
              </div>
            </div>

            {/* Quick Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['all', 'active', 'idle', 'maintenance', 'breakdown'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    border: '1px solid',
                    cursor: 'pointer',
                    backgroundColor: selectedStatus === st ? '#1e3a5f' : '#ffffff',
                    color: selectedStatus === st ? '#ffffff' : '#475569',
                    borderColor: selectedStatus === st ? '#1e3a5f' : '#cbd5e1',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st === 'all' && `All Featured (${totalFleet})`}
                  {st === 'active' && `● Active (${activeUnits})`}
                  {st === 'idle' && `Standby (${idleUnits})`}
                  {st === 'maintenance' && `Maintenance (${maintenanceUnits})`}
                  {st === 'breakdown' && `Breakdown (${breakdownUnits})`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {/* Show varied representative machines based on status */}
            {(selectedStatus === 'all'
              ? [
                  ...equipmentList.filter((e) => e.status === 'active').slice(0, 3),
                  ...equipmentList.filter((e) => e.status === 'idle').slice(0, 2),
                  ...equipmentList.filter((e) => e.status === 'maintenance').slice(0, 2),
                  ...equipmentList.filter((e) => e.status === 'breakdown').slice(0, 1),
                ]
              : equipmentList.filter((e) => e.status === selectedStatus).slice(0, 8)
            ).map((m) => {
              const isAct = m.status === 'active';
              const isIdle = m.status === 'idle';
              const isMaint = m.status === 'maintenance';
              const isBkdn = m.status === 'breakdown';

              return (
                <div
                  key={m.id}
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${isAct ? '#bbf7d0' : isIdle ? '#fde68a' : isMaint ? '#bfdbfe' : '#fecaca'}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#1e3a5f',
                        background: '#f0f4f9',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: '1px solid #cbdbe9',
                      }}
                    >
                      {m.unique_id}
                    </span>
                    
                    {/* Status Badge Variations */}
                    {isAct && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#15803d',
                          background: '#dcfce7',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                        ACTIVE
                      </span>
                    )}
                    {isIdle && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#b45309',
                          background: '#fef3c7',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                        STANDBY
                      </span>
                    )}
                    {isMaint && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#1d4ed8',
                          background: '#dbeafe',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Wrench size={10} />
                        MAINTENANCE
                      </span>
                    )}
                    {isBkdn && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#b91c1c',
                          background: '#fee2e2',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertTriangle size={10} />
                        BREAKDOWN
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                    {m.model_name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 6px 0' }}>
                    {m.equipment_type} &bull; Capacity: <strong>{m.capacity}</strong>
                  </div>

                  {/* Telemetry row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f8fafc',
                      padding: '5px 8px',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      color: '#475569',
                      marginBottom: '6px',
                    }}
                  >
                    <span>
                      Utilization: <strong style={{ color: isAct ? '#15803d' : '#64748b' }}>{m.utilization_percent}%</strong>
                    </span>
                    <span>
                      Hours Today: <strong className="mono">{m.hours_today}h</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '6px',
                      fontSize: '0.74rem',
                    }}
                  >
                    <span style={{ color: '#475569' }}>
                      Location: <strong>{m.mine_name}</strong>
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: isAct ? '#16a34a' : isIdle ? '#d97706' : isMaint ? '#2563eb' : '#dc2626',
                      }}
                    >
                      {isAct ? 'Face Deployed' : isIdle ? 'Buffer Standby' : isMaint ? 'Workshop' : 'Pit Bay 4'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── INTERACTIVE FILTERS & SEARCH ─────────────────────────── */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Unique ID (e.g. HEMM-EXC-001) or model..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                fontSize: '0.82rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                outline: 'none',
              }}
            />
          </div>

          {/* Mine Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="ux4g-form-control"
              value={selectedMineId}
              onChange={(e) => {
                setSelectedMineId(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', borderRadius: '6px' }}
            >
              <option value="all">All 9 MOIL Mines</option>
              {Object.entries(MINE_NAMES).map(([id, name]) => (
                <option key={id} value={id}>
                  {name} ({MINE_TYPES[Number(id)]})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              className="ux4g-form-control"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', borderRadius: '6px' }}
            >
              <option value="all">All Statuses ({totalFleet})</option>
              <option value="active">Active Deployed ({activeUnits})</option>
              <option value="idle">Idle / Standby ({idleUnits})</option>
              <option value="maintenance">Under Maintenance ({maintenanceUnits})</option>
              <option value="breakdown">Breakdown ({breakdownUnits})</option>
            </select>
          </div>

          {/* Equipment Type Filter */}
          <div style={{ minWidth: '170px' }}>
            <select
              className="ux4g-form-control"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', borderRadius: '6px' }}
            >
              <option value="all">All Equipment Types</option>
              {equipmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {(selectedMineId !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || searchQuery !== '') && (
            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
              onClick={() => {
                setSelectedMineId('all');
                setSelectedStatus('all');
                setSelectedType('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{ fontSize: '0.76rem', padding: '6px 10px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* ── EQUIPMENT DIRECTORY TABLE ─────────────────────────────── */}
        <div className="ux4g-table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
          <table className="ux4g-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '140px' }}>Unique Asset ID</th>
                <th scope="col">Machinery Class &amp; Model</th>
                <th scope="col">Capacity Spec</th>
                <th scope="col">Deployed Location</th>
                <th scope="col" style={{ width: '130px' }}>Operational Status</th>
                <th scope="col">Telemetry Utilization</th>
                <th scope="col">Service Schedule</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length > 0 ? (
                paginatedList.map((item) => (
                  <tr key={item.id}>
                    {/* Unique Asset ID */}
                    <td>
                      <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ux4g-primary)', background: '#ede9fe', padding: '3px 7px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                        {item.unique_id || `HEMM-${item.id}`}
                      </span>
                    </td>

                    {/* Class & Model */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {item.model_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {item.equipment_type}
                      </div>
                    </td>

                    {/* Capacity Spec */}
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      <strong>{item.capacity || 'Standard'}</strong>
                    </td>

                    {/* Deployed Mine */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                        {item.mine_name || MINE_NAMES[item.mine_id]}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {MINE_TYPES[item.mine_id]} Mine
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        <span className={`status-dot ${item.status}`} />
                        <span style={{
                          color: item.status === 'active' ? '#128937' : item.status === 'idle' ? '#d97706' : item.status === 'maintenance' ? '#0284c7' : '#dc2626'
                        }}>
                          {item.status}
                        </span>
                      </span>
                      {item.downtime_reason && (
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                          {item.downtime_reason}
                        </div>
                      )}
                    </td>

                    {/* Telemetry Utilization */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '65px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, item.utilization_percent)}%`,
                              background: item.status === 'active' ? '#128937' : item.status === 'idle' ? '#d97706' : '#cbd5e1',
                            }}
                          />
                        </div>
                        <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          {item.utilization_percent}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.hours_today} hrs active today
                      </div>
                    </td>

                    {/* Service Schedule */}
                    <td style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      <div>Last: <strong>{item.last_maintenance || '2026-06-15'}</strong></div>
                      <div>Next: <strong style={{ color: item.status === 'maintenance' ? '#ea580c' : 'inherit' }}>{item.next_maintenance || '2026-09-30'}</strong></div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No machinery matches current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS ───────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem', color: '#64748b' }}>
          <div>
            Showing <strong>{filteredList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredList.length)}</strong> of <strong>{filteredList.length}</strong> matching machinery assets
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ padding: '4px 8px' }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline ux4g-btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ padding: '4px 8px' }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
