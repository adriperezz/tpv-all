import {
  BarChart3,
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  Settings,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { APP_TAGLINE } from '@/lib/constants';

interface NavItem {
  id:       string;
  label:    string;
  icon:     React.ElementType;
  badge?:   string;
  disabled?: boolean;
  soon?:    boolean;
}

interface NavGroup {
  label?: string;
  items:  NavItem[];
}

const NAV: NavGroup[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { id: 'projects',      label: 'Proyectos',      icon: FolderOpen,  badge: '24' },
      { id: 'professionals', label: 'Profesionales',  icon: UserCheck },
      { id: 'clients',       label: 'Clientes',       icon: Users },
      { id: 'reports',       label: 'Reportes',       icon: BarChart3 },
    ],
  },
  {
    label: 'Tech & IA',
    items: [
      { id: 'ai-tools', label: 'Herramientas IA', icon: Bot,       soon: true, disabled: true },
      { id: 'bim',      label: 'BIM',             icon: Building2, soon: true, disabled: true },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'settings', label: 'Configuración', icon: Settings },
    ],
  },
];

interface SidebarProps {
  activeItem?:       string;
  onNavigate?:       (id: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?:       boolean;
  onMobileClose?:    () => void;
}

export function Sidebar({
  activeItem = 'dashboard',
  onNavigate,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  function handleToggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  }

  function handleNav(id: string) {
    onNavigate?.(id);
    onMobileClose?.();
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-[220ms] lg:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onMobileClose}
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen flex flex-col z-40',
          'bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]',
          'transition-all duration-[220ms]',
          /* mobile: slide in/out as full-width drawer */
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          /* desktop: collapse to icon bar */
          collapsed ? 'lg:w-[68px] w-[var(--sidebar-width,256px)]' : 'w-[var(--sidebar-width,256px)]',
        )}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 h-[var(--topbar-height,64px)] border-b border-[var(--border-subtle)] shrink-0">
          {!collapsed && (
            <div>
              <div className="font-[family-name:var(--font-display)] text-xl font-black tracking-[-0.01em] text-[var(--text-primary)]">
                QUANT<span className="text-[var(--brand-primary)]">IA</span>
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mt-[-2px]">
                {APP_TAGLINE}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="font-[family-name:var(--font-display)] text-xl font-black text-[var(--brand-primary)] mx-auto">Q</div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={handleToggleCollapse}
            className={cn(
              'hidden lg:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shrink-0',
              collapsed && 'mx-auto',
            )}
            aria-label={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shrink-0"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.label && !collapsed && (
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = item.id === activeItem;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => !item.disabled && handleNav(item.id)}
                        title={collapsed ? item.label : undefined}
                        disabled={item.disabled}
                        className={cn(
                          'w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-[150ms]',
                          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                          isActive
                            ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] border-l-2 border-[var(--brand-primary)] pl-[10px]'
                            : item.disabled
                            ? 'text-[var(--text-faint)] cursor-not-allowed opacity-50'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
                        )}
                      >
                        <Icon size={16} className="shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] font-bold bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] rounded-full px-2 py-0.5">
                                {item.badge}
                              </span>
                            )}
                            {item.soon && (
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-[var(--warning-bg,#FEF9C3)] text-[var(--warning-fg,#854D0E)] rounded-full px-1.5 py-0.5">
                                Soon
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        {!collapsed && (
          <div className="shrink-0 p-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-[var(--text-on-brand)] text-xs font-bold shrink-0">
                FP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">Fernando Parra</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">Admin · QUANTIA</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
