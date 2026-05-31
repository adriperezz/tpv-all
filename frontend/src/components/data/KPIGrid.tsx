import { StatCard } from '@/components/ui';
import type { KPI } from '@/types';

const KPIS: KPI[] = [
  { id: '1', label: 'Proyectos activos', value: '24', unit: '+', trend: 'up', trendValue: '+12% vs mes anterior', icon: 'briefcase', variant: 'brand' },
  { id: '2', label: 'Clientes',          value: '48', trend: 'up', trendValue: '+3 nuevos este mes', icon: 'users' },
  { id: '3', label: 'Horas IA',          value: '3.2', unit: 'K', trend: 'up', trendValue: '+300% de crecimiento', icon: 'cpu' },
  { id: '4', label: 'Satisfacción',      value: '98', unit: '%', trend: 'neutral', trendValue: 'NPS promedio', icon: 'star' },
];

interface KPIGridProps { kpis?: KPI[]; }

export function KPIGrid({ kpis = KPIS }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, i) => <StatCard key={kpi.id} kpi={kpi} index={i} />)}
    </div>
  );
}
