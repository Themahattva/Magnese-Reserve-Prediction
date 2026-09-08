'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Building2,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/reserves', label: 'Reserve Mapping', icon: Map },
  { href: '/production', label: 'Production Analytics', icon: BarChart3 },
  { href: '/predictions', label: 'Shortfall Predictions', icon: AlertTriangle },
  { href: '/recommendations', label: 'Corrective Actions', icon: Lightbulb },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>
          <Building2 size={20} color="#0B3D6B" />
          <span>MOIL LIMITED</span>
        </h1>
        <p>Manganese Ore India Ltd.</p>
        <div style={{ marginTop: '6px' }}>
          <span style={{
            fontSize: '0.62rem',
            padding: '2px 6px',
            borderRadius: '3px',
            background: 'var(--ore-accent-light)',
            color: 'var(--ore-accent)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Miniratna I PSU · Govt of India
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={17} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '2px' }}>
          Smart India Hackathon 2026
        </p>
        <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
          SIH26009 · Ministry of Steel
        </p>
      </div>
    </aside>
  );
}
