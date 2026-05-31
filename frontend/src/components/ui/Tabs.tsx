import { cn } from '@/lib/cn';
import { createContext, useContext, useState } from 'react';

/* ── Context ── */
interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
  variant: TabsVariant;
}
const TabsContext = createContext<TabsContextValue | null>(null);
function useTabsCtx() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
}

type TabsVariant = 'line' | 'pill' | 'card';

/* ── Root ── */
interface TabsProps {
  defaultValue: string;
  variant?: TabsVariant;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, variant = 'line', className, children }: TabsProps) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive, variant }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ── Tab List ── */
interface TabListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabList({ className, children }: TabListProps) {
  const { variant } = useTabsCtx();
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center',
        variant === 'line' && 'border-b border-[var(--border-subtle)] gap-0',
        variant === 'pill' && 'gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl w-fit',
        variant === 'card' && 'gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Tab Trigger ── */
interface TabTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  badge?: string | number;
}

export function TabTrigger({ value, className, children, badge }: TabTriggerProps) {
  const { active, setActive, variant } = useTabsCtx();
  const isActive = active === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-semibold transition-all duration-[200ms] outline-none',
        variant === 'line' && [
          'px-4 py-3 border-b-2 -mb-px',
          isActive
            ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]',
        ],
        variant === 'pill' && [
          'px-4 py-2 rounded-lg text-xs',
          isActive
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        ],
        variant === 'card' && [
          'px-4 py-2.5 rounded-xl border',
          isActive
            ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] border-[var(--brand-primary)]/30'
            : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]',
        ],
        className,
      )}
    >
      {children}
      {badge !== undefined && (
        <span className={cn(
          'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
          isActive
            ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
            : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Tab Panel ── */
interface TabPanelProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabPanel({ value, className, children }: TabPanelProps) {
  const { active } = useTabsCtx();
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={cn('pt-5', className)}>
      {children}
    </div>
  );
}
