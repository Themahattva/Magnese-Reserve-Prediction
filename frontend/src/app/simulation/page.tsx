'use client';

import WhatIfSimulator from '@/components/simulation/WhatIfSimulator';

export default function SimulationPage() {
  return (
    <div style={{ padding: '0 0.5rem 2rem 0.5rem' }}>
      <WhatIfSimulator showTitle={true} />
    </div>
  );
}
