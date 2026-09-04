'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

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
      <h2 className="header-title">{title}</h2>

      <div className="header-actions">
        <div className="header-badge">
          <span className="dot" />
          <span>[SYS: ONLINE // 9 MINES]</span>
        </div>
        <div className="header-badge" style={{ cursor: 'pointer', borderColor: 'rgba(234, 179, 8, 0.4)', color: 'var(--risk-medium)' }}>
          <Bell size={13} />
          <span>[! 4 ALERTS]</span>
        </div>
      </div>
    </header>
  );
}
