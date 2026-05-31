import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'dark' | 'outline-light' | 'lime-outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] border-[var(--brand-primary)] shadow-[var(--shadow-brand)] hover:bg-[var(--brand-primary-hover)] hover:border-[var(--brand-primary-hover)]',
  accent: 'bg-[var(--brand-accent)] text-[var(--text-on-accent)] border-[var(--brand-accent)] shadow-[var(--shadow-accent)] hover:bg-[var(--brand-accent-hover)] hover:border-[var(--brand-accent-hover)]',
  outline: 'bg-transparent text-[var(--brand-primary)] border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]',
  ghost: 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-transparent hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]',
  dark: 'bg-[var(--bg-inverse)] text-[var(--text-on-inverse)] border-[var(--bg-inverse)] hover:opacity-90',
  'outline-light': 'bg-transparent text-white border-white/30 hover:border-white/70 hover:bg-white/5',
  'lime-outline': 'bg-transparent text-[var(--q-lime)] border-[var(--q-lime)] hover:bg-[var(--q-lime)]/10',
  danger: 'bg-[var(--danger-bg)] text-[var(--danger-fg)] border-[var(--danger-border)] hover:bg-[var(--danger-fg)] hover:text-white',
};

const sizeClasses: Record<Size, string> = {
  sm:   'px-4 py-[7px] text-xs gap-1.5',
  md:   'px-[22px] py-[10px] text-sm gap-2',
  lg:   'px-7 py-3.5 text-base gap-2.5 rounded-xl',
  icon: 'p-[10px] aspect-square',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-xl border-2 transition-all duration-[220ms] select-none',
        'hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
