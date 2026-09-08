'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Bar,
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
        background: 'var(--bg-card, #FFFFFF)',
        border: '1px solid var(--border-default, #E2E6EA)',
        borderRadius: '6px',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-dropdown, 0 4px 16px rgba(0, 0, 0, 0.15))',
        minWidth: '190px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <p style={{ color: 'var(--primary, #0B3D6B)', fontSize: '0.80rem', marginBottom: '8px', fontWeight: 700, letterSpacing: '-0.01em' }}>
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: entry.color }} />
            <span style={{ color: 'var(--text-secondary, #5C6670)', fontSize: '0.76rem' }}>{entry.name}</span>
          </div>
          <span style={{ color: 'var(--text-primary, #1B1F23)', fontSize: '0.80rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle, #E2E6EA)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--text-secondary, #5C6670)', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={{ stroke: 'var(--border-default, #E2E6EA)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-secondary, #5C6670)', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.76rem', paddingTop: '10px', fontFamily: 'Inter' }}
        />
        {/* Shortfall Risk area */}
        <Area
          type="monotone"
          dataKey="shortfall"
          name="Shortfall Risk"
          fill="rgba(179, 38, 30, 0.12)"
          stroke="none"
        />
        {/* Target bar in Govt Blue */}
        <Bar
          dataKey="target"
          name="Target (Planned)"
          fill="var(--chart-target-fill, rgba(11, 61, 107, 0.22))"
          stroke="var(--primary, #0B3D6B)"
          strokeWidth={1.5}
          radius={[3, 3, 0, 0]}
          barSize={20}
        />
        {/* Actual Output in Manganese Ore */}
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Output"
          stroke="var(--chart-actual, #3C2A3E)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--chart-actual, #3C2A3E)', strokeWidth: 0, r: 3.5 }}
          activeDot={{ fill: 'var(--chart-actual, #3C2A3E)', strokeWidth: 2, stroke: 'var(--ore-accent-light, #E8E1EA)', r: 5.5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
