'use client';

import { useEffect, useRef } from 'react';
import type { MineStatus } from '@/lib/api';
import { addBaseTileLayer } from '@/lib/mapTiles';

type LeafletContainer = HTMLDivElement & { _leaflet_id?: number | null };

interface Props {
  mines: MineStatus[];
}

const riskColors: Record<string, string> = {
  low: '#00ff66',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ff2a4b',
};

export default function MiniMap({ mines }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mines.length === 0) return;

    const el: LeafletContainer = containerRef.current;
    let map: import('leaflet').Map | null = null;

    import('leaflet').then((L) => {
      if (!el.isConnected) return;

      // If Leaflet already initialized this element, nuke it
      if (el._leaflet_id) {
        el._leaflet_id = null;
        el.innerHTML = '';
      }

      map = L.map(el, {
        center: [21.5, 79.5],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });
      const currentMap = map;

      addBaseTileLayer(L, currentMap);

      // Add mine markers
      mines.forEach((mine) => {
        const color = riskColors[mine.risk_level] || '#74bf85';

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 16px; height: 16px; border-radius: 2px;
            background: ${color}; border: 2px solid #030704;
            box-shadow: 0 0 10px ${color}, 0 2px 8px rgba(0,0,0,0.8);
            ${mine.risk_level === 'critical' ? 'animation: terminalBlink 1.2s infinite;' : ''}
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        L.marker([mine.latitude, mine.longitude], { icon })
          .addTo(currentMap)
          .bindPopup(`
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;">
              <strong style="font-size: 0.85rem; color: #00ff66;">&gt; ${mine.name.toUpperCase()}</strong>
              <div style="margin-top: 6px; color: #74bf85; line-height: 1.5;">
                <div>TELEMETRY: <span style="color: ${color}; font-weight: 700;">${mine.production_percent}%</span></div>
                <div>RESERVES: <span style="font-weight: 700; color: #d4ffd4;">${mine.estimated_reserves} MT</span></div>
                <div>STATUS: <span style="color: ${color}; font-weight: 700;">[${mine.risk_level.toUpperCase()}]</span></div>
              </div>
            </div>
          `);
      });
    });

    return () => {
      if (map) {
        map.remove();
        map = null;
      }
      // Also clean the DOM element
      if (el._leaflet_id) {
        el._leaflet_id = null;
        el.innerHTML = '';
      }
    };
  }, [mines]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '300px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    />
  );
}
