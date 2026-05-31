import { BarChart3, Briefcase, Cpu, Star, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { KPI } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  users:     Users,
  cpu:       Cpu,
  star:      Star,
  chart:     BarChart3,
};

/* Sparkline data presets — one per KPI index */
const SPARKLINES = [
  [38, 52, 44, 68, 58, 74, 82, 72],
  [62, 55, 67, 51, 72, 65, 78, 82],
  [18, 32, 44, 58, 48, 68, 84, 95],
  [80, 84, 88, 86, 91, 94, 96, 98],
];

function Sparkline({ data, brand }: { data: number[]; brand: boolean }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[3px] h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 rounded-sm transition-all duration-300',
            brand
              ? 'bg-[var(--text-on-brand)]/25 last:bg-[var(--text-on-brand)]/70'
              : 'bg-[var(--brand-primary)]/20 last:bg-[var(--brand-primary)]/70',
          )}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

interface StatCardProps {
  kpi: KPI;
  index?: number;
}

export function StatCard({ kpi, index = 0 }: StatCardProps) {
  const isBrand  = kpi.variant === 'brand';
  const Icon     = ICON_MAP[kpi.icon] ?? BarChart3;
  const sparkline = SPARKLINES[index % SPARKLINES.length];

  return (
    <div
      className={cn(
        'group relative rounded-2xl p-5 overflow-hidden',
        'transition-all duration-[220ms] hover:-translate-y-1',
        isBrand
          ? [
              'bg-[var(--brand-primary)] border border-[var(--brand-primary)]',
              'shadow-[var(--shadow-brand)]',
            ]
          : [
              'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
              'hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)]',
            ],
      )}
    >
      {/* Decorative glow (brand card only) */}
      {isBrand && (
        <div className="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-white/10" />
      )}

      {/* Top row: icon + sparkline */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'size-9 rounded-xl flex items-center justify-center shrink-0',
          isBrand ? 'bg-[var(--text-on-brand)]/15' : 'bg-[var(--brand-primary-soft)]',
        )}>
          <Icon size={16} className={isBrand ? 'text-[var(--text-on-brand)]' : 'text-[var(--brand-primary)]'} />
        </div>
        <Sparkline data={sparkline} brand={isBrand} />
      </div>

      {/* Value */}
      <div className={cn(
        'font-[family-name:var(--font-display)] font-black leading-none tracking-[-0.02em]',
        isBrand ? 'text-[var(--text-on-brand)]' : 'text-[var(--text-primary)]',
      )}>
        <span className="text-[38px]">{kpi.value}</span>
        {kpi.unit && (
          <span className={cn('text-2xl ml-0.5', isBrand ? 'text-[var(--brand-accent)]' : 'text-[var(--brand-primary)]')}>
            {kpi.unit}
          </span>
        )}
      </div>

      {/* Label */}
      <p className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.10em] mt-1 mb-2',
        isBrand ? 'text-[var(--text-on-brand)]/60' : 'text-[var(--text-muted)]',
      )}>
        {kpi.label}
      </p>

      {/* Trend */}
      {kpi.trendValue && (
        <div className={cn(
          'flex items-center gap-1 text-[11px] font-semibold',
          kpi.trend === 'up'
            ? (isBrand ? 'text-[var(--text-on-brand)]/75' : 'text-[var(--q-success)]')
            : kpi.trend === 'down'
            ? 'text-[var(--q-danger)]'
            : (isBrand ? 'text-[var(--text-on-brand)]/50' : 'text-[var(--text-muted)]'),
        )}>
          {kpi.trend === 'up'   && <TrendingUp  size={12} />}
          {kpi.trend === 'down' && <TrendingDown size={12} />}
          {kpi.trendValue}
        </div>
      )}
    </div>
  );
}
