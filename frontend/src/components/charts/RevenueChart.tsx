import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartColors, type ChartColors } from '@/lib/chartColors';

const DATA = [
  { month: 'Ene', revenue: 42,  projects: 3 },
  { month: 'Feb', revenue: 58,  projects: 4 },
  { month: 'Mar', revenue: 51,  projects: 3 },
  { month: 'Abr', revenue: 75,  projects: 5 },
  { month: 'May', revenue: 68,  projects: 6 },
  { month: 'Jun', revenue: 92,  projects: 7 },
  { month: 'Jul', revenue: 78,  projects: 5 },
  { month: 'Ago', revenue: 96,  projects: 8 },
  { month: 'Sep', revenue: 82,  projects: 7 },
  { month: 'Oct', revenue: 110, projects: 9 },
  { month: 'Nov', revenue: 97,  projects: 8 },
  { month: 'Dic', revenue: 124, projects: 11 },
];

interface TooltipEntry {
  dataKey?: string;
  value?:   number;
  color?:   string;
}

interface RevenueTooltipProps {
  active?:  boolean;
  payload?: TooltipEntry[];
  label?:   string;
  colors:   ChartColors;
}

function RevenueTooltip({ active, payload, label, colors }: RevenueTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:   colors.tooltipBg,
      border:       `1px solid ${colors.tooltipBorder}`,
      borderRadius: 12,
      padding:      '10px 14px',
      boxShadow:    '0 8px 32px rgba(0,0,0,0.18)',
      minWidth:     148,
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: colors.tick, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: colors.tick }}>
            {entry.dataKey === 'revenue' ? 'Ingresos' : 'Proyectos'}
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, marginLeft: 'auto', paddingLeft: 12, color: entry.color }}>
            {entry.dataKey === 'revenue' ? `${entry.value}K€` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart() {
  const c = useChartColors();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={c.primary} stopOpacity={0.22} />
            <stop offset="100%" stopColor={c.primary} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke={c.grid} vertical={false} />

        <XAxis
          dataKey="month"
          tick={{ fill: c.tick, fontSize: 11, fontWeight: 600 }}
          axisLine={false} tickLine={false} dy={6}
        />
        <YAxis
          yAxisId="rev"
          tick={{ fill: c.tick, fontSize: 11 }}
          axisLine={false} tickLine={false}
          tickFormatter={(v: number) => `${v}K`}
          width={38}
        />
        <YAxis
          yAxisId="proj"
          orientation="right"
          tick={{ fill: c.tick, fontSize: 11 }}
          axisLine={false} tickLine={false}
          width={24} tickCount={5}
        />

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Tooltip content={<RevenueTooltip colors={c} /> as any} cursor={{ stroke: c.grid, strokeWidth: 1 }} />

        <Bar
          yAxisId="proj" dataKey="projects"
          fill={c.accent} radius={[4, 4, 0, 0]}
          maxBarSize={20} opacity={0.75}
        />
        <Area
          yAxisId="rev" type="monotone" dataKey="revenue"
          stroke={c.primary} strokeWidth={2.5}
          fill="url(#grad-revenue)" dot={false}
          activeDot={{ r: 5, fill: c.primary, stroke: c.surface, strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
