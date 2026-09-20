'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Layers,
  TrendingUp,
  CheckSquare,
  Database,
  Cpu,
  FileText,
  UserCheck,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const NAV_BASE = [
  { href: '/', key: 'nav.dashboard', defaultLabel: 'Dashboard', icon: Compass },
  { href: '/exploration', key: 'nav.exploration', defaultLabel: 'Exploration', icon: Layers },
  { href: '/production', key: 'nav.production', defaultLabel: 'Production Intelligence', icon: TrendingUp },
  { href: '/simulation', key: 'nav.simulation', defaultLabel: 'What-If Simulation', icon: Sliders },
  { href: '/decisions', key: 'nav.decisions', defaultLabel: 'Decision Center', icon: CheckSquare },
  { href: '/data', key: 'nav.data', defaultLabel: 'Data Sources', icon: Database },
  { href: '/models', key: 'nav.models', defaultLabel: 'Model Registry', icon: Cpu },
  { href: '/reports', key: 'nav.reports', defaultLabel: 'Reports & Audit', icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="ux4g-navbar" aria-label="Main Navigation">
      <div className="ux4g-navbar-container">
        {/* Brand identity */}
        <Link href="/" className="ux4g-brand" aria-label="ANVESHA Home">
          <div className="ux4g-brand-badge" aria-hidden="true">
            <span>अन्वेषा</span>
          </div>
          <div className="ux4g-brand-text">
            <h1>{t('brand.nav_title', 'ANVESHA')}</h1>
            <p>{t('brand.nav_subtitle', 'Mining Exploration & Production AI')}</p>
          </div>
        </Link>

        {/* Primary Navigation Links */}
        <ul className="ux4g-nav-links" role="menubar">
          {NAV_BASE.map((item) => {
            const Icon = item.icon;
            const isExact = pathname === item.href;
            const isSub = item.href !== '/' && pathname.startsWith(item.href);
            // Handle legacy route compatibility: /reserves -> exploration, /predictions -> production, /recommendations -> decisions
            const isLegacyMatch =
              (item.href === '/exploration' && pathname.startsWith('/reserves')) ||
              (item.href === '/production' && pathname.startsWith('/predictions')) ||
              (item.href === '/decisions' && pathname.startsWith('/recommendations'));
            const isActive = isExact || isSub || isLegacyMatch;

            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  className={`ux4g-nav-link ${isActive ? 'active' : ''}`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{t(item.key, item.defaultLabel)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Navbar Right Actions */}
        <div className="ux4g-nav-actions">
          {/* Simulation Mode Badge */}
          <div className="demo-mode-badge" title="Verified Simulation Mode active">
            <span className="status-dot-pulse" aria-hidden="true" />
            <span>{t('badge.simulation', 'Simulation')}</span>
          </div>

          {/* User Session Role */}
          <div className="reviewer-session-badge" title="Logged in as Technical Reviewer (MOIL Ltd.)">
            <UserCheck size={13} style={{ color: 'var(--ux4g-primary)' }} aria-hidden="true" />
            <span>{t('badge.reviewer', 'Reviewer (MOIL)')}</span>
          </div>

          {/* Alerts Badge */}
          <Link
            href="/decisions"
            className="alerts-nav-badge"
            aria-label="4 system alerts requiring review"
          >
            <AlertTriangle size={13} aria-hidden="true" />
            <span>{t('badge.alerts', '4 Alerts')}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
