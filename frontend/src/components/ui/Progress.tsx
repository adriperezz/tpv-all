import { cn } from '@/lib/cn';

type ProgressVariant = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const variantFill: Record<ProgressVariant, string> = {
  brand:   'bg-[var(--brand-primary)]',
  accent:  'bg-[var(--brand-accent)]',
  success: 'bg-[var(--q-success)]',
  warning: 'bg-[var(--q-warning)]',
  danger:  'bg-[var(--q-danger)]',
  info:    'bg-[var(--q-info)]',
};

const sizeHeight: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function Progress({
  value,
  max = 100,
  variant = 'brand',
  size = 'sm',
  label,
  showValue = false,
  animated = false,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-bold tabular-nums text-[var(--text-primary)]">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden', sizeHeight[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            variantFill[variant],
            animated && 'animate-pulse',
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/* ── Multi-progress (stacked) ── */
interface ProgressSegment {
  value: number;
  variant: ProgressVariant;
  label?: string;
}

interface MultiProgressProps {
  segments: ProgressSegment[];
  size?: ProgressSize;
  showLegend?: boolean;
  className?: string;
}

export function MultiProgress({ segments, size = 'md', showLegend = false, className }: MultiProgressProps) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex w-full rounded-full overflow-hidden gap-px bg-[var(--bg-subtle)]', sizeHeight[size])}>
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn('h-full transition-all duration-500', variantFill[seg.variant])}
            style={{ width: `${(seg.value / total) * 100}%` }}
          />
        ))}
      </div>
      {showLegend && (
        <div className="flex flex-wrap gap-3 mt-2">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn('size-2.5 rounded-full', variantFill[seg.variant])} />
              <span className="text-xs text-[var(--text-muted)]">
                {seg.label} <span className="font-semibold text-[var(--text-primary)]">{seg.value}%</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
