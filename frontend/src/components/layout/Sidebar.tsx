'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Satellite,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
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
        <h1>&gt;_ MOIL.SYS</h1>
        <p>// AI DEEP-TECH CONSOLE</p>
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
              <Icon className="nav-icon" size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>[root@moil-ai:~$] · v2.6.0</p>
      </div>
    </aside>
  );
}
