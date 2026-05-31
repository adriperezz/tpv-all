import { MoreHorizontal } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import type { Project, Status } from '@/types';
import { cn } from '@/lib/cn';

const STATUS_CONFIG: Record<Status, { label: string; variant: 'success' | 'warning' | 'purple' | 'danger' }> = {
  active:    { label: 'Activo',      variant: 'success' },
  review:    { label: 'En revisión', variant: 'warning' },
  completed: { label: 'Completado',  variant: 'purple' },
  paused:    { label: 'Pausado',     variant: 'danger' },
};

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Centro Comercial Plaza Sur',   client: 'Inmobiliaria García',  status: 'active',    budget: 450000, progress: 72,  manager: 'Ana López',    managerInitials: 'AL', updatedAt: 'Hoy, 09:32h' },
  { id: '2', name: 'Planta Industrial Teruel',      client: 'Manufacturas Norte',   status: 'review',    budget: 320000, progress: 55,  manager: 'Carlos Ruiz',  managerInitials: 'CR', updatedAt: 'Ayer' },
  { id: '3', name: 'Residencial Los Pinos',         client: 'Promotora BH',         status: 'active',    budget: 890000, progress: 38,  manager: 'Lucía Martín', managerInitials: 'LM', updatedAt: 'Hoy, 11:15h' },
  { id: '4', name: 'Auditoría BIM — Hospitalia',    client: 'Grupo Hospitalia',     status: 'completed', budget: 120000, progress: 100, manager: 'Pedro Sanz',   managerInitials: 'PS', updatedAt: '22 abr' },
  { id: '5', name: 'IA Predictiva de Costes',       client: 'Vías y Obras S.A.',    status: 'active',    budget: 250000, progress: 61,  manager: 'Ana López',    managerInitials: 'AL', updatedAt: 'Hoy, 08:47h' },
  { id: '6', name: 'Dashboard Gerencial v2',        client: 'Constructora Iberia',  status: 'paused',    budget: 85000,  progress: 25,  manager: 'Miguel Torres', managerInitials: 'MT', updatedAt: '18 abr' },
];

function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? 'bg-[var(--q-success)]' : value >= 60 ? 'bg-[var(--brand-primary)]' : value >= 30 ? 'bg-[var(--q-warning)]' : 'bg-[var(--q-danger)]';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-[var(--text-muted)] tabular-nums w-8">{value}%</span>
    </div>
  );
}

interface DataTableProps {
  projects?: Project[];
  title?: string;
}

export function DataTable({ projects = MOCK_PROJECTS, title = 'Proyectos activos' }: DataTableProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{projects.length} proyectos en total</p>
        </div>
        <button className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors">
          Ver todos →
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              {['Proyecto', 'Estado', 'Cliente', 'Presupuesto', 'Avance', 'Responsable', ''].map(col => (
                <th key={col} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr
                key={project.id}
                className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--brand-primary-soft)] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-[var(--text-primary)] whitespace-nowrap">{project.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{project.updatedAt}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={STATUS_CONFIG[project.status].variant}>{STATUS_CONFIG[project.status].label}</Badge>
                </td>
                <td className="px-6 py-4 text-[var(--text-secondary)] whitespace-nowrap">{project.client}</td>
                <td className="px-6 py-4 font-semibold text-[var(--text-primary)] tabular-nums whitespace-nowrap">
                  {project.budget.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </td>
                <td className="px-6 py-4"><ProgressBar value={project.progress} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Avatar name={project.manager} size="sm" />
                    <span className="text-[var(--text-secondary)] text-xs">{project.manager}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
