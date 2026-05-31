import { AlertTriangle, CheckCircle, Info, Sparkles, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type AlertVariant = 'brand' | 'success' | 'warning' | 'danger' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.ElementType; classes: string }> = {
  brand:   { icon: Sparkles,      classes: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] border-[var(--brand-primary)]/30' },
  success: { icon: CheckCircle,   classes: 'bg-[var(--success-bg)] text-[var(--success-fg)] border-[var(--success-border)]' },
  warning: { icon: AlertTriangle, classes: 'bg-[var(--warning-bg)] text-[var(--warning-fg)] border-[var(--warning-border)]' },
  danger:  { icon: XCircle,       classes: 'bg-[var(--danger-bg)] text-[var(--danger-fg)] border-[var(--danger-border)]' },
  info:    { icon: Info,          classes: 'bg-[var(--info-bg)] text-[var(--info-fg)] border-[var(--info-border)]' },
};

export function Alert({ variant = 'info', title, description, className }: AlertProps) {
  const { icon: Icon, classes } = config[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border px-5 py-4 text-sm transition-colors duration-[320ms]', classes, className)}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-0.5 opacity-85">{description}</p>}
      </div>
    </div>
  );
}
