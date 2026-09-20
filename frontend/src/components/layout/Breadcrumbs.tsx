'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  'exploration': 'Exploration',
  'reserves': 'Exploration',
  'active': 'Active Exploration',
  '3d': '3D Orebody',
  'boreholes': 'Borehole Database',
  'uncertainty': 'Uncertainty Engine',
  'production': 'Production Intelligence',
  'predictions': 'Shortfall Forecasting',
  'what-if': 'What-If Simulator',
  'decisions': 'Decision Center',
  'recommendations': 'Decision Center',
  'data': 'Data Quality & Registry',
  'models': 'Model Registry & Drift',
  'reports': 'Audit & Reports',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <div className="ux4g-breadcrumb-bar">
      <div className="ux4g-breadcrumb-container">
        <nav aria-label="Breadcrumb">
          <ol className="ux4g-breadcrumb">
            <li className="ux4g-breadcrumb-item">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Home size={13} aria-hidden="true" />
                <span>Home</span>
              </Link>
            </li>

            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join('/')}`;
              const isLast = index === segments.length - 1;
              const label = ROUTE_LABELS[segment] || segment.toUpperCase();

              return (
                <li key={href} className={`ux4g-breadcrumb-item ${isLast ? 'active' : ''}`}>
                  <ChevronRight size={12} className="ux4g-breadcrumb-separator" aria-hidden="true" />
                  {isLast ? (
                    <span aria-current="page">{label}</span>
                  ) : (
                    <Link href={href}>{label}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
