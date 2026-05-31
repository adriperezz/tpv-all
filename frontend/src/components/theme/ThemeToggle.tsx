import { Moon, Sun } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="h-9 w-[92px] animate-pulse rounded-full bg-[var(--bg-subtle)]" />
    );
  }

  return (
    <div
      role="group"
      aria-label="Cambiar tema"
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-sm)] transition-all duration-[320ms]"
    >
      {(['light', 'dark'] as const).map((t) => {
        const isActive = theme === t;
        const Icon = t === 'light' ? Sun : Moon;
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            aria-pressed={isActive}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-[220ms]',
              isActive
                ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            )}
          >
            <Icon size={11} strokeWidth={2.5} />
            {t === 'light' ? 'Light' : 'Dark'}
          </button>
        );
      })}
    </div>
  );
}
