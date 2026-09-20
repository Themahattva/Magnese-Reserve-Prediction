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
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
  const { user, logout } = useAuth();

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

          {/* User Session & Role */}
          {user ? (
            <div className="user-session-container" style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'var(--surface-elevated, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '16px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.78rem',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--ux4g-primary, #1e3a5f)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                >
                  {user.full_name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.employee_id}</span>
                </div>
                <Link
                  href="/profile"
                  style={{
                    marginLeft: '0.2rem',
                    color: 'var(--ux4g-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  title="View Profile"
                >
                  <UserCheck size={14} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  title="Sign out of ANVESHA"
                  aria-label="Sign out"
                >
                  <LogOut size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="ux4g-btn ux4g-btn-primary ux4g-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
            >
              <LogIn size={13} aria-hidden="true" />
              <span>Employee Sign In</span>
            </Link>
          )}

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
