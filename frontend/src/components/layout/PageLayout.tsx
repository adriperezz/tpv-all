import { ArrowLeft, LayoutDashboard, Package, X as CierreCajaIcon, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const maxWClass: Record<string, string> = {
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/productos', label: 'Productos', icon: Package },
  { path: '/cierre',    label: 'Cierre',    icon: CierreCajaIcon },
  { path: '/config',    label: 'Config',    icon: Settings },
];

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  maxWidth?: 'lg' | 'xl' | '2xl' | '4xl';
  children: React.ReactNode;
}

export function PageLayout({ title, subtitle, onBack, right, maxWidth = '4xl', children }: PageLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Topbar */}
      <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className={`w-full mx-auto px-6 h-14 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-xs font-bold leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500 leading-none mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </nav>

          {right && <div className="flex items-center shrink-0">{right}</div>}
        </div>
      </header>

      {/* Content */}
      <main className={`${maxWClass[maxWidth]} mx-auto px-6 py-6`}>
        {children}
      </main>
    </div>
  );
}
