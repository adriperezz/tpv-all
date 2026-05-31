import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartColors, type ChartColors } from '@/lib/chartColors';

const SEGMENTS = [
  { name: 'BIM',         value: 45 },
  { name: 'IA',          value: 30 },
  { name: 'Desarrollo',  value: 15 },
  { name: 'Consultoría', value: 10 },
];

const FIXED_COLORS = ['#5B4FF0', '#C2E53A', '#3B82F6', '#F59E0B'];

interface TooltipEntry {
  name?:  string;
  value?: number;
}

interface DonutTooltipProps {
  active?:  boolean;
  payload?: TooltipEntry[];
  colors:   ChartColors;
}

function DonutTooltip({ active, payload, colors }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;
  const name  = payload[0].name ?? '';
  const idx   = SEGMENTS.findIndex(s => s.name === name);
  const color = FIXED_COLORS[idx] ?? colors.primary;
  return (
    <div style={{
      background:   colors.tooltipBg,
      border:       `1px solid ${colors.tooltipBorder}`,
      borderRadius: 10,
      padding:      '8px 12px',
      boxShadow:    '0 8px 24px rgba(0,0,0,0.16)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.tick }}>{name}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, marginLeft: 8 }}>{payload[0].value}%</span>
      </div>
    </div>
  );
}

export function ProjectsDonut() {
  const c = useChartColors();

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={SEGMENTS}
              cx="50%" cy="50%"
              innerRadius="52%" outerRadius="78%"
              paddingAngle={3}
              dataKey="value"
              startAngle={90} endAngle={-270}
              stroke="none"
            >
              {SEGMENTS.map((_, i) => (
                <Cell key={i} fill={FIXED_COLORS[i]} />
              ))}
            </Pie>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip content={<DonutTooltip colors={c} /> as any} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-black leading-none" style={{ color: c.primary, fontFamily: 'Nunito, sans-serif' }}>24</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mt-1">proyectos</p>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3">
        {SEGMENTS.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2 min-w-0">
            <span className="size-2.5 rounded-full shrink-0" style={{ background: FIXED_COLORS[i] }} />
            <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">{s.name}</span>
            <span className="text-xs font-black text-[var(--text-primary)]">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
