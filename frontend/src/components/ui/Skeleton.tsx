import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className, rounded }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--bg-subtle)]',
        rounded ? 'rounded-full' : 'rounded-lg',
        className,
      )}
    />
  );
}

/* ── Card skeleton ── */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-10 w-10" rounded />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-full mb-1.5" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

/* ── Table row skeleton ── */
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  const widths = ['w-40', 'w-20', 'w-28', 'w-20', 'w-24'];
  return (
    <tr className="border-b border-[var(--border-subtle)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={cn('h-4', widths[i % widths.length])} />
        </td>
      ))}
    </tr>
  );
}

/* ── Stat card skeleton ── */
export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-5" rounded />
      </div>
      <Skeleton className="h-9 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
