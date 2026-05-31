import { Bell, ChevronRight, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/cn';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

interface NavLink {
  id: string;
  label: string;
  href?: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'projects',   label: 'Proyectos' },
  { id: 'analytics',  label: 'Analytics' },
  { id: 'settings',   label: 'Configuración' },
];

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavbarLayoutProps {
  children: React.ReactNode;
  links?: NavLink[];
  activeLink?: string;
  onNavigate?: (id: string) => void;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWClasses: Record<string, string> = {
  md:   'max-w-3xl',
  lg:   'max-w-5xl',
  xl:   'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function NavbarLayout({
  children,
  links = DEFAULT_LINKS,
  activeLink,
  onNavigate,
  breadcrumbs,
  title,
  subtitle,
  maxWidth = '2xl',
}: NavbarLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-40 h-[var(--topbar-height,64px)] bg-[var(--bg-surface)]/80 backdrop-blur-sm border-b border-[var(--border-subtle)] transition-colors duration-[320ms]">
        <div className={cn('mx-auto h-full flex items-center gap-4 px-6', maxWClasses[maxWidth])}>

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 mr-4">
            <div className="font-[family-name:var(--font-display)] text-lg font-black tracking-[-0.01em] text-[var(--text-primary)]">
              {APP_NAME.slice(0, -2)}
              <span className="text-[var(--brand-primary)]">IA</span>
            </div>
            <span className="hidden sm:block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              {APP_TAGLINE}
            </span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate?.(link.id)}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-[150ms]',
                  activeLink === link.id
                    ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--brand-primary)]" />
            </button>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--bg-subtle)] transition-colors">
              <Avatar name="Fernando Parra" size="sm" />
              <span className="hidden md:block text-xs font-semibold text-[var(--text-secondary)]">Fernando</span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors"
              onClick={() => setMobileMenuOpen(p => !p)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full inset-x-0 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] p-4 space-y-1 shadow-[var(--shadow-lg)]">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => { onNavigate?.(link.id); setMobileMenuOpen(false); }}
                className={cn(
                  'w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  activeLink === link.id
                    ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                )}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <main className="pt-[var(--topbar-height,64px)]">
        <div className={cn('mx-auto px-6 py-8', maxWClasses[maxWidth])}>

          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-6">
              <Home size={12} className="text-[var(--text-faint)]" />
              {breadcrumbs.map((bc, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ChevronRight size={11} className="text-[var(--text-faint)]" />
                  <span className={cn(
                    i === breadcrumbs.length - 1
                      ? 'text-[var(--text-primary)] font-semibold'
                      : 'hover:text-[var(--text-primary)] transition-colors cursor-pointer',
                  )}>
                    {bc.label}
                  </span>
                </div>
              ))}
            </nav>
          )}

          {/* Page title */}
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
