import { Bell, Menu, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/cn';

interface TopbarProps {
  sidebarCollapsed?:      boolean;
  title?:                 string;
  subtitle?:              string;
  onMobileSidebarToggle?: () => void;
}

export function Topbar({ sidebarCollapsed, title = 'Dashboard', subtitle, onMobileSidebarToggle }: TopbarProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-[var(--topbar-height,64px)] z-30',
        'flex items-center gap-3 px-4 sm:px-6',
        'bg-[var(--bg-surface)]/90 backdrop-blur-sm border-b border-[var(--border-subtle)]',
        'transition-all duration-[220ms]',
        /* on mobile the sidebar is hidden, so topbar spans full width */
        'left-0',
        sidebarCollapsed
          ? 'lg:left-[68px]'
          : 'lg:left-[var(--sidebar-width,256px)]',
      )}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileSidebarToggle}
        className="lg:hidden p-2 -ml-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shrink-0"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-none truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate hidden sm:block">{subtitle}</p>}
      </div>

      {/* Search — hidden on small screens */}
      <div className="hidden md:flex items-center gap-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] w-52 hover:border-[var(--border-default)] transition-colors cursor-text">
        <Search size={13} />
        <span className="flex-1 text-[var(--text-faint)] text-xs">Buscar...</span>
        <kbd className="text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 font-mono text-[var(--text-faint)]">⌘K</kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--brand-primary)]" />
        </button>

        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        <button className="ml-0.5 flex items-center gap-2 rounded-xl px-1.5 py-1.5 hover:bg-[var(--bg-subtle)] transition-colors">
          <Avatar name="Fernando Parra" size="sm" />
        </button>
      </div>
    </header>
  );
}
