import { cn } from '@/lib/cn';

type CardVariant = 'default' | 'featured' | 'dark';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ variant = 'default', hover = true, className, children }: CardProps) {
  const base = 'rounded-2xl p-6 transition-all duration-[220ms]';

  const variants: Record<CardVariant, string> = {
    default: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
    featured: 'bg-[var(--brand-primary)] border border-[var(--brand-primary)] text-[var(--text-on-brand)]',
    dark: 'bg-[var(--q-black)] border-transparent',
  };

  const hoverClasses = hover
    ? 'hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-strong)]'
    : '';

  return (
    <div className={cn(base, variants[variant], hoverClasses, className)}>
      {children}
    </div>
  );
}
