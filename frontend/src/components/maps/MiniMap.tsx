'use client';

import { useEffect, useRef } from 'react';
import type { MineStatus } from '@/lib/api';
import { addBaseTileLayer } from '@/lib/mapTiles';

type LeafletContainer = HTMLDivElement & { _leaflet_id?: number | null };

interface Props {
  mines: MineStatus[];
}

const riskColors: Record<string, string> = {
  low: '#1B8A5A',      /* Status Success */
  medium: '#C77700',   /* Status Warning */
  high: '#C77700',     /* Status Warning */
  critical: '#B3261E', /* Status Danger */
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
        const color = riskColors[mine.risk_level] || '#5C6670';

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 14px; height: 14px; border-radius: 50%;
            background: ${color}; border: 2px solid #FFFFFF;
            box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        L.marker([mine.latitude, mine.longitude], { icon })
          .addTo(currentMap)
          .bindPopup(`
            <div class="mine-popup-content" style="font-family: 'Inter', sans-serif; font-size: 0.80rem;">
              <strong style="font-size: 0.86rem; color: var(--primary, #0B3D6B);">${mine.name.toUpperCase()} MINE</strong>
              <div style="margin-top: 6px; color: var(--text-secondary, #5C6670); line-height: 1.55;">
                <div>Production: <span style="color: ${color}; font-weight: 700; font-family: 'JetBrains Mono', monospace;">${mine.production_percent}%</span></div>
                <div>Reserves: <span style="font-weight: 700; color: var(--text-primary, #1B1F23); font-family: 'JetBrains Mono', monospace;">${mine.estimated_reserves} MT</span></div>
                <div>Risk Status: <span style="color: ${color}; font-weight: 700;">${mine.risk_level.toUpperCase()}</span></div>
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
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid var(--border-default, #E2E6EA)',
      }}
    />
  );
}
