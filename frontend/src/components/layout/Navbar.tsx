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

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: Compass },
  { href: '/exploration', label: 'Exploration', icon: Layers },
  { href: '/production', label: 'Production Intelligence', icon: TrendingUp },
  { href: '/simulation', label: 'What-If Simulation', icon: Sliders },
  { href: '/decisions', label: 'Decision Center', icon: CheckSquare },
  { href: '/data', label: 'Data Sources', icon: Database },
  { href: '/models', label: 'Model Registry', icon: Cpu },
  { href: '/reports', label: 'Reports & Audit', icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="ux4g-navbar" aria-label="Main Navigation">
      <div className="ux4g-navbar-container">
        {/* Brand identity */}
        <Link href="/" className="ux4g-brand" aria-label="ANVESHA Home">
          <div className="ux4g-brand-badge" aria-hidden="true">
            <span>अन्वेषा</span>
          </div>
          <div className="ux4g-brand-text">
            <h1>ANVESHA</h1>
            <p>Mining Exploration &amp; Production AI</p>
          </div>
        </Link>

        {/* Primary Navigation Links */}
        <ul className="ux4g-nav-links" role="menubar">
          {NAV_ITEMS.map((item) => {
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
                  <span>{item.label}</span>
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
            <span>Simulation</span>
          </div>

          {/* User Session Role */}
          <div className="reviewer-session-badge" title="Logged in as Technical Reviewer (MOIL Ltd.)">
            <UserCheck size={13} style={{ color: 'var(--ux4g-primary)' }} aria-hidden="true" />
            <span>Reviewer (MOIL)</span>
          </div>

          {/* Alerts Badge */}
          <Link
            href="/decisions"
            className="alerts-nav-badge"
            aria-label="4 system alerts requiring review"
          >
            <AlertTriangle size={13} aria-hidden="true" />
            <span>4 Alerts</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
