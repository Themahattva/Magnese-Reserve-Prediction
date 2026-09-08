'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/reserves': 'Reserve Mapping & Estimation',
  '/production': 'Production Analytics',
  '/predictions': 'Shortfall Predictions',
  '/recommendations': 'Corrective Actions',
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'MOIL Intelligence';

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h2 className="header-title">{title}</h2>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)', borderLeft: '1px solid rgba(255, 255, 255, 0.25)', paddingLeft: '12px' }}>
          Ministry of Steel · Govt. of India
        </span>
      </div>

      <div className="header-actions">
        <div className="header-badge">
          <span className="dot" style={{ background: '#1B8A5A', boxShadow: '0 0 6px #1B8A5A' }} />
          <span>SYS: ONLINE (9 MINES)</span>
        </div>
        <div
          className="header-badge"
          style={{
            cursor: 'pointer',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            background: 'rgba(199, 119, 0, 0.25)',
            color: '#FFFFFF',
          }}
        >
          <Bell size={13} style={{ color: '#FFD180' }} />
          <span>4 ALERTS</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
