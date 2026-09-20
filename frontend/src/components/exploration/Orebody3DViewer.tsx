'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Info } from 'lucide-react';
import type { Orebody3DResponse, OrebodyVoxel } from '@/lib/api';

interface Props {
  data: Orebody3DResponse | null;
  selectedBlockId?: string;
  onSelectVoxel?: (voxel: OrebodyVoxel | null) => void;
}

type ColorMode = 'probability' | 'grade' | 'uncertainty';

export default function Orebody3DViewer({ data, onSelectVoxel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ yaw: 35, pitch: 25 });
  const [zoom, setZoom] = useState(1.0);
  const [colorMode, setColorMode] = useState<ColorMode>('probability');
  const [cutoffFilter, setCutoffFilter] = useState(0.5); // min probability cutoff
  const [depthSlice, setDepthSlice] = useState(-100); // max depth to show
  const [hoveredVoxel, setHoveredVoxel] = useState<OrebodyVoxel | null>(null);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Filter voxels based on current controls
  const visibleVoxels = useMemo(() => {
    if (!data?.voxels) return [];
    return data.voxels.filter(
      (v) => v.z >= depthSlice && (colorMode === 'grade' ? v.estimated_grade_percent >= cutoffFilter * 45 : v.mn_probability >= cutoffFilter)
    );
  }, [data, depthSlice, cutoffFilter, colorMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI display
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle 3D grid datum plane
    const centerX = width / 2;
    const centerY = height / 2 + 30;

    const radYaw = (rotation.yaw * Math.PI) / 180;
    const radPitch = (rotation.pitch * Math.PI) / 180;

    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);

    // 3D projection helper
    const project = (x: number, y: number, z: number) => {
      // Rotate around Z (yaw)
      const rx = x * cosY - y * sinY;
      const ry = x * sinY + y * cosY;
      // Rotate around X (pitch)
      const rz = ry * sinP - z * cosP;
      const finalY = ry * cosP + z * sinP;

      const scale = zoom * 1.6;
      return {
        px: centerX + rx * scale,
        py: centerY - finalY * scale,
        depth: rz,
      };
    };

    // Draw reference boundary box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    const boxSize = 180;
    const groundCorners = [
      project(-boxSize, -boxSize, 0),
      project(boxSize, -boxSize, 0),
      project(boxSize, boxSize, 0),
      project(-boxSize, boxSize, 0),
    ];
    ctx.beginPath();
    ctx.moveTo(groundCorners[0].px, groundCorners[0].py);
    for (let i = 1; i < 4; i++) ctx.lineTo(groundCorners[i].px, groundCorners[i].py);
    ctx.closePath();
    ctx.stroke();

    // Draw surface coordinate axes
    const origin = project(0, 0, 0);
    const north = project(0, 100, 0);
    const east = project(100, 0, 0);
    const depthAxis = project(0, 0, -80);

    // North (Y)
    ctx.strokeStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(north.px, north.py);
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.font = '10px "Noto Sans", sans-serif';
    ctx.fillText('N (UTM)', north.px + 4, north.py);

    // East (X)
    ctx.strokeStyle = '#34d399';
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(east.px, east.py);
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.fillText('E (UTM)', east.px + 4, east.py);

    // Depth (-Z)
    ctx.strokeStyle = '#f87171';
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(depthAxis.px, depthAxis.py);
    ctx.stroke();
    ctx.fillStyle = '#f87171';
    ctx.fillText('-Z (Depth)', depthAxis.px + 4, depthAxis.py);

    // Draw Borehole Traces
    if (data?.borehole_traces) {
      data.borehole_traces.forEach((bh) => {
        const top = project(bh.surface_coords[0], bh.surface_coords[1], 0);
        const bottom = project(bh.surface_coords[0], bh.surface_coords[1], -bh.depth_m);

        // Trace line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(top.px, top.py);
        ctx.lineTo(bottom.px, bottom.py);
        ctx.stroke();

        // Collar marker
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(top.px, top.py, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '9px "Noto Sans", sans-serif';
        ctx.fillText(bh.id, top.px + 5, top.py - 4);

        // Ore intercept interval highlights
        bh.assay_intercepts.forEach((interval) => {
          if (interval.mn_percent > 25) {
            const p1 = project(bh.surface_coords[0], bh.surface_coords[1], -interval.from_m);
            const p2 = project(bh.surface_coords[0], bh.surface_coords[1], -interval.to_m);
            ctx.strokeStyle = '#4A2BC2';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        });
      });
    }

    // Sort voxels back-to-front (painter's algorithm)
    const projectedVoxels = visibleVoxels.map((v) => {
      const p = project(v.x, v.y, v.z);
      return { ...v, px: p.px, py: p.py, depth: p.depth };
    });
    projectedVoxels.sort((a, b) => b.depth - a.depth);

    // Draw Voxels
    projectedVoxels.forEach((v) => {
      const voxelRadius = (v.size_m[0] / 2) * zoom * 0.95;

      let fillColor = 'rgba(74, 43, 194, 0.6)';
      if (colorMode === 'probability') {
        const alpha = Math.max(0.2, v.mn_probability);
        if (v.mn_probability > 0.8) fillColor = `rgba(74, 43, 194, ${alpha})`;
        else if (v.mn_probability > 0.6) fillColor = `rgba(11, 187, 234, ${alpha})`;
        else fillColor = `rgba(148, 163, 184, ${alpha * 0.5})`;
      } else if (colorMode === 'grade') {
        if (v.estimated_grade_percent >= 40) fillColor = 'rgba(18, 137, 55, 0.85)';
        else if (v.estimated_grade_percent >= 35) fillColor = 'rgba(217, 138, 0, 0.8)';
        else fillColor = 'rgba(219, 55, 45, 0.7)';
      } else if (colorMode === 'uncertainty') {
        if (v.uncertainty < 0.3) fillColor = 'rgba(18, 137, 55, 0.8)'; // Low uncertainty (good)
        else if (v.uncertainty < 0.6) fillColor = 'rgba(217, 138, 0, 0.8)';
        else fillColor = 'rgba(219, 55, 45, 0.85)'; // High uncertainty
      }

      ctx.fillStyle = fillColor;
      ctx.beginPath();
      // Draw isometric diamond/hex block
      ctx.ellipse(v.px, v.py, voxelRadius, voxelRadius * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  }, [data, rotation, zoom, visibleVoxels, colorMode]);

  // Mouse interaction for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDraggingState(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) {
      // Hit test for hovered voxel
      if (!data?.voxels || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Approximate nearest voxel
      const radYaw = (rotation.yaw * Math.PI) / 180;
      const radPitch = (rotation.pitch * Math.PI) / 180;
      const cosY = Math.cos(radYaw), sinY = Math.sin(radYaw);
      const cosP = Math.cos(radPitch), sinP = Math.sin(radPitch);
      const centerX = rect.width / 2, centerY = rect.height / 2 + 30;

      let nearest: OrebodyVoxel | null = null;
      let minDist = 18;

      visibleVoxels.forEach((v) => {
        const rx = v.x * cosY - v.y * sinY;
        const ry = v.x * sinY + v.y * cosY;
        const finalY = ry * cosP + v.z * sinP;
        const px = centerX + rx * zoom * 1.6;
        const py = centerY - finalY * zoom * 1.6;
        const dist = Math.hypot(px - mouseX, py - mouseY);
        if (dist < minDist) {
          minDist = dist;
          nearest = v;
        }
      });
      setHoveredVoxel(nearest);
      if (onSelectVoxel) onSelectVoxel(nearest);
      return;
    }

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation((prev) => ({
      yaw: (prev.yaw + deltaX * 0.5) % 360,
      pitch: Math.max(5, Math.min(85, prev.pitch - deltaY * 0.5)),
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 3D Viewport Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Color Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Color By:</span>
          <div className="ux4g-tabs" style={{ margin: 0, border: 'none' }}>
            <button
              type="button"
              className={`ux4g-tab ${colorMode === 'probability' ? 'active' : ''}`}
              onClick={() => setColorMode('probability')}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
            >
              Mn Probability
            </button>
            <button
              type="button"
              className={`ux4g-tab ${colorMode === 'grade' ? 'active' : ''}`}
              onClick={() => setColorMode('grade')}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
            >
              Estimated Grade %
            </button>
            <button
              type="button"
              className={`ux4g-tab ${colorMode === 'uncertainty' ? 'active' : ''}`}
              onClick={() => setColorMode('uncertainty')}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
            >
              Uncertainty Envelopes
            </button>
          </div>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="ux4g-btn ux4g-btn-secondary ux4g-btn-sm"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            aria-label="Zoom in"
            title="Zoom In"
          >
            <ZoomIn size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ux4g-btn ux4g-btn-secondary ux4g-btn-sm"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            aria-label="Zoom out"
            title="Zoom Out"
          >
            <ZoomOut size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ux4g-btn ux4g-btn-secondary ux4g-btn-sm"
            onClick={() => {
              setRotation({ yaw: 35, pitch: 25 });
              setZoom(1.0);
            }}
            aria-label="Reset perspective"
            title="Reset Perspective"
          >
            <RotateCw size={13} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ width: '100%', height: '100%', cursor: isDraggingState ? 'grabbing' : 'grab', display: 'block' }}
        />

        {/* Legend Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(15, 20, 28, 0.88)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{ fontWeight: 600, color: '#60a5fa' }}>
            {colorMode === 'probability' ? 'Inferred Mn Probability' : colorMode === 'grade' ? 'Estimated Mn Grade (%)' : 'Uncertainty Index'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {colorMode === 'probability' && (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#4A2BC2', borderRadius: '2px' }} /> &gt;80% High
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#0bbbea', borderRadius: '2px' }} /> 60-80% Moderate
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '2px' }} /> &lt;60% Footwall
                </span>
              </>
            )}
            {colorMode === 'grade' && (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#128937', borderRadius: '2px' }} /> &gt;40% EMD/High
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#d98a00', borderRadius: '2px' }} /> 35-40% Medium
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#db372d', borderRadius: '2px' }} /> &lt;35% Silico
                </span>
              </>
            )}
            {colorMode === 'uncertainty' && (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#128937', borderRadius: '2px' }} /> &lt;0.30 Low
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#d98a00', borderRadius: '2px' }} /> 0.30-0.60 Medium
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: 8, height: 8, background: '#db372d', borderRadius: '2px' }} /> &gt;0.60 High (Target)
                </span>
              </>
            )}
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '2px' }}>
            Purple bars indicate core borehole drill assay intercepts
          </span>
        </div>

        {/* Hovered Block Telemetry Box */}
        {hoveredVoxel && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.96)',
              color: '#171717',
              padding: '10px 14px',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              minWidth: '220px',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--ux4g-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={13} />
              <span>Voxel Coordinates [{hoveredVoxel.x}m, {hoveredVoxel.y}m]</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: '#4b5563' }}>Depth Horizon:</span>
              <strong>{hoveredVoxel.z}m</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: '#4b5563' }}>Inferred Mn Probability:</span>
              <strong>{(hoveredVoxel.mn_probability * 100).toFixed(0)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: '#4b5563' }}>Estimated Grade:</span>
              <strong>{hoveredVoxel.estimated_grade_percent}% Mn</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Uncertainty Metric:</span>
              <span className={`ux4g-badge ${hoveredVoxel.uncertainty > 0.5 ? 'badge-high' : 'badge-low'}`}>
                {hoveredVoxel.uncertainty > 0.5 ? 'High' : 'Low'} ({(hoveredVoxel.uncertainty * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Depth & Cutoff Filtering Sliders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-surface)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>Subsurface Slicing Depth:</span>
            <span style={{ color: 'var(--ux4g-primary)' }}>{depthSlice}m</span>
          </div>
          <input
            type="range"
            min="-120"
            max="-20"
            step="5"
            value={depthSlice}
            onChange={(e) => setDepthSlice(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>Orebody Probability Cutoff:</span>
            <span style={{ color: 'var(--ux4g-primary)' }}>{(cutoffFilter * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={cutoffFilter}
            onChange={(e) => setCutoffFilter(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
