'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Area,
} from 'recharts';
import type { ProductionTrendPoint } from '@/lib/api';

interface Props {
  data: ProductionTrendPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#081309',
        border: '1px solid #00ff66',
        borderRadius: '4px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.9), 0 0 15px rgba(0,255,102,0.2)',
        minWidth: '180px',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      <p style={{ color: '#00ff66', fontSize: '0.74rem', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>
        &gt; {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <span style={{ color: entry.color, fontSize: '0.75rem' }}>{entry.name}</span>
          <span style={{ color: '#d4ffd4', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {(entry.value / 1000).toFixed(1)}K MT
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProductionTrendChart({ data }: Props) {
  if (!data.length) {
    return <div className="empty-state"><p>No production telemetry available</p></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,255,102,0.06)" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: 'rgba(0,255,102,0.15)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#74bf85', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.72rem', paddingTop: '10px', fontFamily: 'JetBrains Mono' }}
        />
        <Area
          type="monotone"
          dataKey="shortfall"
          name="Shortfall Risk"
          fill="rgba(255, 42, 75, 0.16)"
          stroke="none"
        />
        <Bar
          dataKey="target"
          name="Target (Planned)"
          fill="rgba(0, 255, 102, 0.15)"
          stroke="rgba(0, 255, 102, 0.5)"
          strokeWidth={1}
          radius={[2, 2, 0, 0]}
          barSize={20}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Output"
          stroke="#00ff66"
          strokeWidth={2.5}
          dot={{ fill: '#00ff66', strokeWidth: 0, r: 3 }}
          activeDot={{ fill: '#00ff66', strokeWidth: 2, stroke: '#d4ffd4', r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
