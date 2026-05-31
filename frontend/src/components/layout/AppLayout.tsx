import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  children:    React.ReactNode;
  title?:      string;
  subtitle?:   string;
  activeLink?: string;
  onNavigate?: (id: string) => void;
}

export function AppLayout({ children, title, subtitle, activeLink, onNavigate }: AppLayoutProps) {
  const [sidebarCollapsed,  setSidebarCollapsed]  = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeItem,        setActiveItem]        = useState(activeLink ?? 'dashboard');

  function handleNavigate(id: string) {
    setActiveItem(id);
    onNavigate?.(id);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Sidebar
        activeItem={activeItem}
        onNavigate={handleNavigate}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        title={title}
        subtitle={subtitle}
        onMobileSidebarToggle={() => setMobileSidebarOpen(p => !p)}
      />
      <main
        className={cn(
          'pt-[var(--topbar-height,64px)] transition-all duration-[220ms]',
          /* mobile: no left padding; desktop: respect sidebar width */
          'pl-0',
          sidebarCollapsed
            ? 'lg:pl-[68px]'
            : 'lg:pl-[var(--sidebar-width,256px)]',
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
