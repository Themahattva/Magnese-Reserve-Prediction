'use client';

import { useEffect, useState, useRef } from 'react';
import { reservesAPI } from '@/lib/api';
import type { ReserveSummary, ReserveBlock, DrillLog } from '@/lib/api';
import { addBaseTileLayer } from '@/lib/mapTiles';

let L: typeof import('leaflet') | null = null;

type LeafletIconDefault = typeof import('leaflet').Icon.Default & {
  prototype: import('leaflet').Icon.Default & { _getIconUrl?: unknown };
};

const MINE_LOCATIONS: Record<number, { lat: number; lon: number; name: string; district: string; state: string }> = {
  1: { lat: 21.548660, lon: 79.682890, name: "Dongri Buzurg", district: "Bhandara", state: "Maharashtra" },
  2: { lat: 21.849722, lon: 80.226667, name: "Balaghat", district: "Balaghat", state: "Madhya Pradesh" },
  3: { lat: 21.543056, lon: 79.753889, name: "Chikla", district: "Bhandara", state: "Maharashtra" },
  4: { lat: 21.401389, lon: 79.280833, name: "Munsar", district: "Nagpur", state: "Maharashtra" },
  5: { lat: 21.411667, lon: 79.266111, name: "Kandri", district: "Nagpur", state: "Maharashtra" },
  6: { lat: 21.400000, lon: 78.983333, name: "Gumgaon", district: "Nagpur", state: "Maharashtra" },
  7: { lat: 21.400000, lon: 79.220000, name: "Parsioni", district: "Nagpur", state: "Maharashtra" },
  8: { lat: 21.666667, lon: 79.666667, name: "Sitapatore", district: "Balaghat", state: "Madhya Pradesh" },
  9: { lat: 21.683056, lon: 79.733056, name: "Tirodi", district: "Balaghat", state: "Madhya Pradesh" },
};

export default function ReservesPage() {
  const [summary, setSummary] = useState<ReserveSummary[]>([]);
  const [blocks, setBlocks] = useState<ReserveBlock[]>([]);
  const [drillLogs, setDrillLogs] = useState<DrillLog[]>([]);
  const [selectedMine, setSelectedMine] = useState<number | undefined>(undefined);
  const [activeLayer, setActiveLayer] = useState<string>('reserves');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const layerGroupRef = useRef<import('leaflet').LayerGroup | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, blockData, logData] = await Promise.all([
          reservesAPI.getSummary(),
          reservesAPI.getBlocks(selectedMine),
          reservesAPI.getDrillLogs(selectedMine),
        ]);
        setSummary(summaryData);
        setBlocks(blockData);
        setDrillLogs(logData);
      } catch {
        // Fallback data for all 9 MOIL mines
        setSummary([
          { mine_id: 1, mine_name: "Dongri Buzurg", total_estimated_tonnage: 28500000, avg_grade: 40.2, avg_confidence: 0.87, num_blocks: 24 },
          { mine_id: 2, mine_name: "Balaghat", total_estimated_tonnage: 35200000, avg_grade: 38.5, avg_confidence: 0.82, num_blocks: 31 },
          { mine_id: 3, mine_name: "Chikla", total_estimated_tonnage: 18700000, avg_grade: 42.1, avg_confidence: 0.91, num_blocks: 16 },
          { mine_id: 4, mine_name: "Munsar", total_estimated_tonnage: 12300000, avg_grade: 36.8, avg_confidence: 0.75, num_blocks: 12 },
          { mine_id: 5, mine_name: "Kandri", total_estimated_tonnage: 22100000, avg_grade: 39.4, avg_confidence: 0.84, num_blocks: 20 },
          { mine_id: 6, mine_name: "Gumgaon", total_estimated_tonnage: 15800000, avg_grade: 37.2, avg_confidence: 0.79, num_blocks: 14 },
          { mine_id: 7, mine_name: "Parsioni", total_estimated_tonnage: 9400000, avg_grade: 41.5, avg_confidence: 0.88, num_blocks: 8 },
          { mine_id: 8, mine_name: "Sitapatore", total_estimated_tonnage: 5200000, avg_grade: 34.9, avg_confidence: 0.71, num_blocks: 6 },
          { mine_id: 9, mine_name: "Tirodi", total_estimated_tonnage: 11600000, avg_grade: 38.8, avg_confidence: 0.83, num_blocks: 10 },
        ]);

        const targetMines = selectedMine ? [selectedMine] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const demoBlocks: ReserveBlock[] = [];
        const demoLogs: DrillLog[] = [];

        targetMines.forEach((mId) => {
          const loc = MINE_LOCATIONS[mId] || { lat: 21.5, lon: 79.5 };
          const offsets = [
            [-0.015, -0.015], [0.012, 0.015], [-0.01, 0.02],
            [0.018, -0.01], [0.005, 0.005], [-0.02, 0.008]
          ];
          offsets.forEach((off, idx) => {
            const clat = loc.lat + off[0];
            const clon = loc.lon + off[1];
            const s = 0.008;
            demoBlocks.push({
              id: mId * 100 + idx,
              block_id: `BLK-${mId}-${String.fromCharCode(65 + idx)}`,
              mine_id: mId,
              center_lat: clat,
              center_lon: clon,
              estimated_tonnage: 450000 + idx * 280000,
              mn_grade_percent: 36.5 + (idx % 4) * 2.8,
              confidence_score: 0.72 + (idx % 3) * 0.12,
              estimation_method: idx % 2 === 0 ? 'Ordinary Kriging' : 'Inverse Distance Weighting',
              polygon: [
                [clat - s, clon - s],
                [clat + s, clon - s],
                [clat + s, clon + s],
                [clat - s, clon + s],
              ],
            });

            demoLogs.push({
              id: mId * 100 + idx,
              borehole_id: `BH-${mId}-0${idx + 1}`,
              mine_id: mId,
              latitude: clat + 0.002,
              longitude: clon + 0.002,
              depth_m: 85 + idx * 15,
              mn_grade_percent: 38.0 + (idx % 3) * 2.5,
              fe_grade_percent: 6.2 + (idx % 2) * 1.1,
              rock_type: idx % 2 === 0 ? 'Gondite / Quartzite' : 'Manganese Silicate',
              formation: 'Sausar Group (Mansar Fm)',
            });
          });
        });

        setBlocks(demoBlocks);
        setDrillLogs(demoLogs);
      }
    }
    load();
  }, [selectedMine]);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    // Load Leaflet CSS once
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((leaflet) => {
      if (cancelled || !mapRef.current) return;

      L = leaflet;
      delete (L.Icon.Default as LeafletIconDefault).prototype._getIconUrl;

      // Destroy previous map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [21.5, 79.5],
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
      });

      addBaseTileLayer(L, map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan and zoom map when selected mine changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedMine && MINE_LOCATIONS[selectedMine]) {
      const { lat, lon } = MINE_LOCATIONS[selectedMine];
      mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([21.55, 79.6], 8, { duration: 1.2 });
    }
  }, [selectedMine]);

  // Update map layers when data changes
  useEffect(() => {
    if (!L || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Render Mine Location Pins
    Object.entries(MINE_LOCATIONS).forEach(([idStr, mine]) => {
      const mId = Number(idStr);
      if (selectedMine && selectedMine !== mId) return;

      const markerIcon = L!.divIcon({
        className: 'mine-head-marker',
        html: `
          <div style="
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(3, 7, 4, 0.92); border: 1.5px solid #00ff66;
            color: #00ff66; font-family: 'JetBrains Mono', monospace; font-size: 0.70rem;
            font-weight: 700; padding: 3px 8px; border-radius: 4px;
            box-shadow: 0 0 12px rgba(0,255,102,0.5), 0 2px 8px rgba(0,0,0,0.8);
            white-space: nowrap; transform: translate(-50%, -100%); cursor: pointer;
          ">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#00ff66;box-shadow:0 0 8px #00ff66;"></span>
            <span>⛏️ ${mine.name.toUpperCase()}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const m = L!.marker([mine.lat, mine.lon], { icon: markerIcon });
      m.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;">
          <strong style="color: #00ff66; font-size: 0.85rem;">&gt; ${mine.name.toUpperCase()} MINE</strong>
          <div style="margin-top: 6px; color: #74bf85; line-height: 1.5;">
            <div>LOCATION: <b style="color: #d4ffd4;">${mine.district}, ${mine.state}</b></div>
            <div>COORDINATES: <span style="color: #d4ffd4; font-family: monospace;">${mine.lat.toFixed(6)}°N, ${mine.lon.toFixed(6)}°E</span></div>
            <div>GEOLOGY: <span style="color: #74bf85;">Sausar Manganese Belt (Mansar Fm)</span></div>
          </div>
        </div>
      `);
      layerGroup.addLayer(m);
    });

    if (activeLayer === 'reserves' || activeLayer === 'all') {
      blocks.forEach((block) => {
        if (!block.polygon?.length) return;
        const latlngs = block.polygon.map((p: number[]) => [p[0], p[1]] as [number, number]);
        const confidence = block.confidence_score;
        const color = confidence > 0.85 ? '#00ff66' : confidence > 0.7 ? '#eab308' : '#ff2a4b';

        const polygon = L!.polygon(latlngs, {
          color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 1.5,
        });

        polygon.bindPopup(`
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;">
            <strong style="color: #00ff66; font-size: 0.85rem;">&gt; ${block.block_id}</strong>
            <div style="margin-top: 6px; color: #74bf85; line-height: 1.5;">
              <div>TONNAGE: <b style="color: #d4ffd4;">${(block.estimated_tonnage / 1000000).toFixed(2)} MT</b></div>
              <div>GRADE: <b style="color: #d4ffd4;">${block.mn_grade_percent}% Mn</b></div>
              <div>CONFIDENCE: <b style="color: ${color};">${(confidence * 100).toFixed(0)}%</b></div>
              <div>METHOD: <span style="color: #74bf85;">${block.estimation_method}</span></div>
            </div>
          </div>
        `);
        layerGroup.addLayer(polygon);
      });
    }

    if (activeLayer === 'drillLogs' || activeLayer === 'all') {
      drillLogs.forEach((log) => {
        const gradeColor = log.mn_grade_percent > 40 ? '#00ff66' : log.mn_grade_percent > 30 ? '#eab308' : '#ff2a4b';
        const icon = L!.divIcon({
          className: 'drill-marker',
          html: `<div style="width:10px;height:10px;border-radius:2px;background:${gradeColor};border:1.5px solid #030704;box-shadow:0 0 8px ${gradeColor};"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        const marker = L!.marker([log.latitude, log.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;">
            <strong style="color: #00ff66; font-size: 0.85rem;">&gt; ${log.borehole_id}</strong>
            <div style="margin-top: 6px; color: #74bf85; line-height: 1.5;">
              <div>DEPTH: <b style="color: #d4ffd4;">${log.depth_m}m</b></div>
              <div>MN GRADE: <b style="color: ${gradeColor};">${log.mn_grade_percent}%</b></div>
              <div>FE GRADE: <b style="color: #d4ffd4;">${log.fe_grade_percent}%</b></div>
              <div>ROCK: <span style="color: #74bf85;">${log.rock_type}</span></div>
              <div>FORMATION: <span style="color: #74bf85;">${log.formation}</span></div>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }
  }, [blocks, drillLogs, activeLayer, selectedMine]);

  const totalReserves = summary.reduce((s, m) => s + m.total_estimated_tonnage, 0);

  return (
    <>
      <div className="page-header">
        <h1>Reserve Mapping & Estimation</h1>
        <p>Interactive map of manganese reserve blocks with satellite-derived mineral indicators</p>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Total Estimated Reserves</div>
          <div className="kpi-value">{(totalReserves / 1000000).toFixed(1)} MT</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Active Mines</div>
          <div className="kpi-value">{summary.length}</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Total Blocks Mapped</div>
          <div className="kpi-value">{summary.reduce((s, m) => s + m.num_blocks, 0)}</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label">Avg Confidence</div>
          <div className="kpi-value">
            {(summary.reduce((s, m) => s + m.avg_confidence, 0) / summary.length * 100 || 0).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Map + Controls */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 300px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            ref={mapRef}
            style={{ height: '550px', borderRadius: 'var(--radius-lg)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Layer Controls */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Map Layers</span>
            </div>
            {['reserves', 'drillLogs', 'all'].map((layer) => (
              <button
                key={layer}
                className={`map-layer-btn ${activeLayer === layer ? 'active' : ''}`}
                onClick={() => setActiveLayer(layer)}
                style={{ width: '100%', marginBottom: '6px', textAlign: 'left' }}
              >
                {layer === 'reserves' ? '🗺️ Reserve Blocks' : layer === 'drillLogs' ? '🔩 Drill Logs' : '📍 Show All'}
              </button>
            ))}
          </div>

          {/* Mine Filter */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Filter by Mine</span>
            </div>
            <button
              className={`map-layer-btn ${!selectedMine ? 'active' : ''}`}
              onClick={() => setSelectedMine(undefined)}
              style={{ width: '100%', marginBottom: '6px', textAlign: 'left' }}
            >
              All Mines
            </button>
            {summary.map((mine) => (
              <button
                key={mine.mine_id}
                className={`map-layer-btn ${selectedMine === mine.mine_id ? 'active' : ''}`}
                onClick={() => setSelectedMine(mine.mine_id)}
                style={{ width: '100%', marginBottom: '4px', textAlign: 'left', fontSize: '0.74rem' }}
              >
                {mine.mine_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reserve Summary Table */}
      <div className="card animate-in-delayed">
        <div className="card-header">
          <span className="card-title">Reserve Summary by Mine</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mine</th>
              <th>Est. Reserves (MT)</th>
              <th>Avg Grade (%Mn)</th>
              <th>Confidence</th>
              <th>Blocks</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((mine) => (
              <tr key={mine.mine_id}>
                <td style={{ fontWeight: 600 }}>{mine.mine_name}</td>
                <td className="mono">{(mine.total_estimated_tonnage / 1000000).toFixed(1)}</td>
                <td className="mono">{mine.avg_grade.toFixed(1)}%</td>
                <td>
                  <span
                    className={`risk-badge ${mine.avg_confidence > 0.85 ? 'low' : mine.avg_confidence > 0.75 ? 'medium' : 'high'}`}
                  >
                    {(mine.avg_confidence * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="mono">{mine.num_blocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
