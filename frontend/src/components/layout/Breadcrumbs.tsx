'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const ROUTE_KEYS: Record<string, { key: string; fallback: string }> = {
  '': { key: 'bc.home', fallback: 'Home' },
  'exploration': { key: 'bc.exploration', fallback: 'Exploration' },
  'reserves': { key: 'bc.reserves', fallback: 'Exploration' },
  'active': { key: 'bc.active', fallback: 'Active Exploration' },
  '3d': { key: 'bc.3d', fallback: '3D Orebody' },
  'boreholes': { key: 'bc.boreholes', fallback: 'Borehole Database' },
  'uncertainty': { key: 'bc.uncertainty', fallback: 'Uncertainty Engine' },
  'production': { key: 'bc.production', fallback: 'Production Intelligence' },
  'predictions': { key: 'bc.predictions', fallback: 'Shortfall Forecasting' },
  'simulation': { key: 'bc.whatif', fallback: 'What-If Simulator' },
  'what-if': { key: 'bc.whatif', fallback: 'What-If Simulator' },
  'decisions': { key: 'bc.decisions', fallback: 'Decision Center' },
  'recommendations': { key: 'bc.recommendations', fallback: 'Decision Center' },
  'data': { key: 'bc.data', fallback: 'Data Quality & Registry' },
  'models': { key: 'bc.models', fallback: 'Model Registry & Drift' },
  'reports': { key: 'bc.reports', fallback: 'Audit & Reports' },
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <div className="ux4g-breadcrumb-bar">
      <div className="ux4g-breadcrumb-container">
        <nav aria-label="Breadcrumb">
          <ol className="ux4g-breadcrumb">
            <li className="ux4g-breadcrumb-item">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Home size={13} aria-hidden="true" />
                <span>{t('bc.home', 'Home')}</span>
              </Link>
            </li>

            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join('/')}`;
              const isLast = index === segments.length - 1;
              const routeInfo = ROUTE_KEYS[segment];
              const label = routeInfo ? t(routeInfo.key, routeInfo.fallback) : segment.toUpperCase();

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
