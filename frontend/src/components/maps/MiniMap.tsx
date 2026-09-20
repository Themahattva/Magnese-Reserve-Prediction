'use client';

import { useEffect, useRef } from 'react';
import type { MineStatus } from '@/lib/api';
import { addBaseTileLayer } from '@/lib/mapTiles';

type LeafletContainer = HTMLDivElement & { _leaflet_id?: number | null };

interface Props {
  mines: MineStatus[];
}

const ux4gRiskColors: Record<string, { bg: string; border: string; text: string }> = {
  low: { bg: '#128937', border: '#0e692a', text: '#ffffff' },
  medium: { bg: '#d98a00', border: '#aa6c00', text: '#ffffff' },
  high: { bg: '#d46b08', border: '#9e4e04', text: '#ffffff' },
  critical: { bg: '#db372d', border: '#a8231b', text: '#ffffff' },
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
        center: [21.55, 79.60],
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
      });
      const currentMap = map;

      addBaseTileLayer(L, currentMap);

      const bounds: [number, number][] = [];

      // Add accurately mapped mine markers
      mines.forEach((mine) => {
        const color = ux4gRiskColors[mine.risk_level] || { bg: '#4A2BC2', border: '#331B91', text: '#ffffff' };
        bounds.push([mine.latitude, mine.longitude]);

        const icon = L.divIcon({
          className: 'ux4g-mine-marker',
          html: `<div style="
            display: flex; align-items: center; justify-content: center;
            width: 22px; height: 22px; border-radius: 50%;
            background: ${color.bg}; border: 2.5px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3); color: #ffffff;
            font-family: 'Noto Sans', sans-serif; font-size: 9px; font-weight: 700;
          ">
            ⛏
          </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([mine.latitude, mine.longitude], { icon })
          .addTo(currentMap)
          .bindPopup(`
            <div style="font-family: 'Noto Sans', sans-serif; font-size: 12px; padding: 4px; min-width: 160px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #4A2BC2; font-size: 13px;">${mine.name}</strong>
                <span style="background: ${color.bg}; color: #ffffff; font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px; text-transform: uppercase;">
                  ${mine.risk_level}
                </span>
              </div>
              <div style="color: #475569; font-size: 11px; line-height: 1.6;">
                <div>Monthly Output: <strong>${mine.production_percent}% of target</strong></div>
                <div>Inferred Reserves: <strong>${mine.estimated_reserves} MT</strong></div>
              </div>
              <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                <a href="/exploration" style="color: #4A2BC2; font-weight: 600; text-decoration: none; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
                  View Exploration Model &rarr;
                </a>
              </div>
            </div>
          `);
      });

      if (bounds.length > 0) {
        currentMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
      }
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
