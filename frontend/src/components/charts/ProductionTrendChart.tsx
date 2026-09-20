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

interface TooltipPayloadItem {
  color?: string;
  name?: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        padding: '10px 14px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minWidth: '180px',
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      <p style={{ color: '#4A2BC2', fontSize: '0.8rem', marginBottom: '6px', fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '0.78rem',
          }}
        >
          <span style={{ color: entry.color || '#4b5563', fontWeight: 500 }}>{entry.name}:</span>
          <span style={{ color: '#171717', fontWeight: 700, marginLeft: '8px' }}>
            {(entry.value / 1000).toFixed(1)}K MT
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProductionTrendChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="ux4g-card-body" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No production telemetry available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#4b5563', fontSize: 11, fontFamily: "'Noto Sans', sans-serif" }}
          axisLine={{ stroke: '#cbd5e1' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#4b5563', fontSize: 11, fontFamily: "'Noto Sans', sans-serif" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.78rem', paddingTop: '12px', fontFamily: "'Noto Sans', sans-serif" }}
        />
        <Area
          type="monotone"
          dataKey="shortfall"
          name="Predicted Shortfall"
          fill="rgba(219, 55, 45, 0.12)"
          stroke="#db372d"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <Bar
          dataKey="target"
          name="Production Target"
          fill="#dcd4ff"
          stroke="#4A2BC2"
          strokeWidth={1}
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Output"
          stroke="#128937"
          strokeWidth={2.5}
          dot={{ fill: '#128937', strokeWidth: 0, r: 3 }}
          activeDot={{ fill: '#128937', strokeWidth: 2, stroke: '#ffffff', r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
