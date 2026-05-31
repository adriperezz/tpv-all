import { cn } from '@/lib/cn';

type BadgeVariant = 'purple' | 'lime' | 'dark' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  purple:  'bg-[var(--q-purple-light)] text-[var(--q-purple-dark)] dark:bg-[rgba(155,145,245,0.18)] dark:text-[#C7C0FA]',
  lime:    'bg-[var(--q-lime-pale)] text-[#3a5a00] dark:bg-[rgba(194,229,58,0.18)] dark:text-[var(--q-lime-light)]',
  dark:    'bg-[var(--q-black)] text-[var(--q-lime)]',
  success: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
  danger:  'bg-[var(--danger-bg)] text-[var(--danger-fg)]',
  info:    'bg-[var(--info-bg)] text-[var(--info-fg)]',
  outline: 'bg-transparent border border-[var(--brand-primary)] text-[var(--brand-primary)]',
};

export function Badge({ variant = 'purple', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-[10px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors duration-[320ms]',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
