import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  type ColDef,
  type ICellRendererParams,
  type GridReadyEvent,
  type GridApi,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { Download, Search, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Badge, Button } from '@/components/ui';

ModuleRegistry.registerModules([AllCommunityModule]);

/* ── Types ── */
type Department = 'BIM' | 'IA' | 'Desarrollo' | 'Consultoría' | 'Dirección';
type Status     = 'Activo' | 'Remoto' | 'Vacaciones' | 'Baja';

interface Professional {
  id:          string;
  name:        string;
  avatar:      string;
  role:        string;
  department:  Department;
  location:    string;
  email:       string;
  startDate:   string;
  salary:      number;
  experience:  number;
  projects:    number;
  performance: number;
  status:      Status;
}

/* ── Data ── */
const PROFESSIONALS: Professional[] = [
  { id: '1',  name: 'Isabel Vega',       avatar: 'IV', role: 'BIM Manager',       department: 'BIM',         location: 'Valencia',  email: 'i.vega@quantia.es',       salary: 78000, experience: 12, projects: 35, performance: 95, status: 'Activo',    startDate: '2013-05-10' },
  { id: '2',  name: 'Fernando Ramos',    avatar: 'FR', role: 'Director General',   department: 'Dirección',   location: 'Madrid',    email: 'f.ramos@quantia.es',      salary: 95000, experience: 15, projects: 48, performance: 98, status: 'Activo',    startDate: '2010-01-15' },
  { id: '3',  name: 'Elena Martín',      avatar: 'EM', role: 'ML Engineer',        department: 'IA',          location: 'Madrid',    email: 'e.martin@quantia.es',     salary: 74000, experience: 6,  projects: 20, performance: 96, status: 'Activo',    startDate: '2019-09-01' },
  { id: '4',  name: 'Ana García',        avatar: 'AG', role: 'IA Engineer',        department: 'IA',          location: 'Barcelona', email: 'a.garcia@quantia.es',     salary: 72000, experience: 5,  projects: 18, performance: 97, status: 'Activo',    startDate: '2020-01-10' },
  { id: '5',  name: 'Alejandro Pérez',   avatar: 'AP', role: 'Data Scientist',     department: 'IA',          location: 'Barcelona', email: 'al.perez@quantia.es',     salary: 70000, experience: 5,  projects: 16, performance: 93, status: 'Activo',    startDate: '2020-06-15' },
  { id: '6',  name: 'Andrés Romero',     avatar: 'AR', role: 'ML Engineer',        department: 'IA',          location: 'Madrid',    email: 'an.romero@quantia.es',    salary: 71000, experience: 6,  projects: 17, performance: 92, status: 'Vacaciones', startDate: '2019-03-20' },
  { id: '7',  name: 'Carlos Mendoza',    avatar: 'CM', role: 'BIM Lead',           department: 'BIM',         location: 'Madrid',    email: 'c.mendoza@quantia.es',    salary: 65000, experience: 8,  projects: 23, performance: 94, status: 'Activo',    startDate: '2017-03-15' },
  { id: '8',  name: 'Roberto Silva',     avatar: 'RS', role: 'Senior Developer',   department: 'Desarrollo',  location: 'Madrid',    email: 'r.silva@quantia.es',      salary: 68000, experience: 7,  projects: 15, performance: 88, status: 'Remoto',    startDate: '2018-07-22' },
  { id: '9',  name: 'Laura Herrero',     avatar: 'LH', role: 'IA Researcher',      department: 'IA',          location: 'Madrid',    email: 'l.herrero@quantia.es',    salary: 69000, experience: 4,  projects: 14, performance: 90, status: 'Activo',    startDate: '2021-02-01' },
  { id: '10', name: 'Miguel Fernández',  avatar: 'MF', role: 'DevOps Engineer',    department: 'Desarrollo',  location: 'Madrid',    email: 'm.fernandez@quantia.es',  salary: 64000, experience: 6,  projects: 11, performance: 87, status: 'Activo',    startDate: '2019-11-05' },
  { id: '11', name: 'Sofía Navarro',     avatar: 'SN', role: 'Senior Consultant',  department: 'Consultoría', location: 'Madrid',    email: 's.navarro@quantia.es',    salary: 67000, experience: 8,  projects: 28, performance: 89, status: 'Vacaciones', startDate: '2017-08-14' },
  { id: '12', name: 'María Torres',      avatar: 'MT', role: 'Project Manager',    department: 'Consultoría', location: 'Valencia',  email: 'm.torres@quantia.es',     salary: 62000, experience: 10, projects: 31, performance: 91, status: 'Activo',    startDate: '2015-04-20' },
  { id: '13', name: 'Cristina Alonso',   avatar: 'CA', role: 'Consultant',         department: 'Consultoría', location: 'Madrid',    email: 'c.alonso@quantia.es',     salary: 56000, experience: 5,  projects: 19, performance: 86, status: 'Activo',    startDate: '2020-10-12' },
  { id: '14', name: 'Jorge Serrano',     avatar: 'JS', role: 'IT Consultant',      department: 'Consultoría', location: 'Sevilla',   email: 'j.serrano@quantia.es',    salary: 53000, experience: 3,  projects: 14, performance: 80, status: 'Remoto',    startDate: '2022-03-07' },
  { id: '15', name: 'Pablo Ruiz',        avatar: 'PR', role: 'Full Stack Dev',     department: 'Desarrollo',  location: 'Bilbao',    email: 'p.ruiz@quantia.es',       salary: 58000, experience: 3,  projects: 9,  performance: 79, status: 'Remoto',    startDate: '2022-01-17' },
  { id: '16', name: 'Teresa Blanco',     avatar: 'TB', role: 'Backend Developer',  department: 'Desarrollo',  location: 'Valencia',  email: 't.blanco@quantia.es',     salary: 60000, experience: 5,  projects: 12, performance: 84, status: 'Activo',    startDate: '2020-09-28' },
  { id: '17', name: 'David Moreno',      avatar: 'DM', role: 'Frontend Developer', department: 'Desarrollo',  location: 'Barcelona', email: 'd.moreno@quantia.es',     salary: 55000, experience: 4,  projects: 10, performance: 83, status: 'Remoto',    startDate: '2021-06-14' },
  { id: '18', name: 'Javier López',      avatar: 'JL', role: 'BIM Coordinator',    department: 'BIM',         location: 'Sevilla',   email: 'j.lopez@quantia.es',      salary: 52000, experience: 4,  projects: 12, performance: 82, status: 'Activo',    startDate: '2021-04-19' },
  { id: '19', name: 'Carmen Díaz',       avatar: 'CD', role: 'BIM Specialist',     department: 'BIM',         location: 'Madrid',    email: 'c.diaz@quantia.es',       salary: 48000, experience: 3,  projects: 8,  performance: 85, status: 'Activo',    startDate: '2022-09-05' },
  { id: '20', name: 'Patricia Castro',   avatar: 'PC', role: 'BIM Technician',     department: 'BIM',         location: 'Bilbao',    email: 'p.castro@quantia.es',     salary: 44000, experience: 2,  projects: 5,  performance: 77, status: 'Baja',      startDate: '2023-01-23' },
];

const MAX_SALARY = Math.max(...PROFESSIONALS.map(p => p.salary));

/* ── Department config ── */
const DEPT: Record<Department, { bg: string; color: string; variant: 'purple' | 'lime' | 'info' | 'warning' | 'dark' }> = {
  BIM:         { bg: '#EAE8FD', color: '#3B30C0', variant: 'purple' },
  IA:          { bg: '#EEF6CC', color: '#3a5a00', variant: 'lime' },
  Desarrollo:  { bg: '#DBEAFE', color: '#1E40AF', variant: 'info' },
  Consultoría: { bg: '#FEF9C3', color: '#854D0E', variant: 'warning' },
  Dirección:   { bg: '#0D0D0D', color: '#C2E53A', variant: 'dark' },
};

/* ── Status config ── */
const STATUS: Record<Status, { dot: string; label: string }> = {
  Activo:     { dot: '#22C55E', label: 'Activo' },
  Remoto:     { dot: '#3B82F6', label: 'Remoto' },
  Vacaciones: { dot: '#F59E0B', label: 'Vacaciones' },
  Baja:       { dot: '#EF4444', label: 'Baja' },
};

/* ── Avatar colors ── */
const AVATAR_PALETTE = [
  '#5B4FF0','#C2E53A','#3B82F6','#F59E0B','#22C55E',
  '#EF4444','#8B5CF6','#06B6D4','#EC4899','#14B8A6',
];
function avatarColor(id: string) {
  return AVATAR_PALETTE[parseInt(id, 10) % AVATAR_PALETTE.length];
}
function avatarFg(bg: string) {
  /* lime and yellow need dark text */
  return ['#C2E53A','#F59E0B'].includes(bg) ? '#0D0D0D' : '#FFFFFF';
}

/* ── Cell renderers ── */
function NameCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  const bg = avatarColor(data.id);
  const fg = avatarFg(bg);
  return (
    <div className="flex items-center gap-2.5 h-full">
      <div
        className="size-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
        style={{ background: bg, color: fg }}
      >
        {data.avatar}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug truncate">{data.name}</p>
        <p className="text-[11px] text-[var(--text-muted)] truncate">{data.email}</p>
      </div>
    </div>
  );
}

function DepartmentCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  const d = DEPT[data.department];
  return (
    <div className="flex items-center h-full">
      <Badge variant={d.variant}>{data.department}</Badge>
    </div>
  );
}

function StatusCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  const s = STATUS[data.status];
  return (
    <div className="flex items-center gap-1.5 h-full">
      <span className="size-2 rounded-full shrink-0" style={{ background: s.dot }} />
      <span className="text-[12px] font-medium text-[var(--text-secondary)]">{s.label}</span>
    </div>
  );
}

function SalaryCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  const pct = (data.salary / MAX_SALARY) * 100;
  return (
    <div className="flex flex-col justify-center gap-1 h-full py-1">
      <p className="text-[13px] font-bold text-[var(--text-primary)]">
        {data.salary.toLocaleString('es-ES')} €
      </p>
      <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--brand-primary)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PerformanceCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  const color =
    data.performance >= 90 ? '#22C55E' :
    data.performance >= 75 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2 h-full">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${data.performance}%`, background: color }}
        />
      </div>
      <span className="text-[12px] font-bold w-8 text-right" style={{ color }}>
        {data.performance}%
      </span>
    </div>
  );
}

function ExperienceCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  return (
    <div className="flex items-center h-full">
      <span className="text-[13px] text-[var(--text-secondary)]">{data.experience} año{data.experience !== 1 ? 's' : ''}</span>
    </div>
  );
}

function DateCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  return (
    <div className="flex items-center h-full">
      <span className="text-[12px] text-[var(--text-muted)]">
        {new Date(data.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    </div>
  );
}

function ActionsCell({ data }: ICellRendererParams<Professional>) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-1.5 h-full">
      <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-[var(--text-on-brand)] transition-all duration-150">
        Ver
      </button>
      <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-all duration-150">
        Editar
      </button>
    </div>
  );
}

/* ── Page ── */
interface ProfessionalsPageProps {
  onNavigate?: (page: string) => void;
}

export function ProfessionalsPage({ onNavigate }: ProfessionalsPageProps) {
  const gridRef  = useRef<AgGridReact<Professional>>(null);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'Todos'>('Todos');

  const departments: Array<Department | 'Todos'> = ['Todos', 'BIM', 'IA', 'Desarrollo', 'Consultoría', 'Dirección'];

  const rowData = useMemo(() => {
    if (selectedDept === 'Todos') return PROFESSIONALS;
    return PROFESSIONALS.filter(p => p.department === selectedDept);
  }, [selectedDept]);

  const columnDefs = useMemo<ColDef<Professional>[]>(() => [
    {
      checkboxSelection:       true,
      headerCheckboxSelection: true,
      width:       46,
      minWidth:    46,
      maxWidth:    46,
      resizable:   false,
      sortable:    false,
      filter:      false,
      pinned:      'left',
    },
    {
      field:       'name',
      headerName:  'Profesional',
      cellRenderer: NameCell,
      pinned:      'left',
      minWidth:    220,
      filter:      'agTextColumnFilter',
      sortable:    true,
    },
    {
      field:       'department',
      headerName:  'Área',
      cellRenderer: DepartmentCell,
      width:       130,
      filter:      'agTextColumnFilter',
    },
    {
      field:       'role',
      headerName:  'Cargo',
      minWidth:    160,
      filter:      'agTextColumnFilter',
      cellStyle:   { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 },
    },
    {
      field:       'location',
      headerName:  'Ubicación',
      width:       120,
      filter:      'agTextColumnFilter',
      cellStyle:   { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 },
    },
    {
      field:       'status',
      headerName:  'Estado',
      cellRenderer: StatusCell,
      width:       130,
      filter:      'agTextColumnFilter',
    },
    {
      field:       'salary',
      headerName:  'Salario',
      cellRenderer: SalaryCell,
      width:       165,
      filter:      'agNumberColumnFilter',
      sort:        'desc',
    },
    {
      field:       'performance',
      headerName:  'Rendimiento',
      cellRenderer: PerformanceCell,
      width:       155,
      filter:      'agNumberColumnFilter',
    },
    {
      field:       'experience',
      headerName:  'Experiencia',
      cellRenderer: ExperienceCell,
      width:       115,
      filter:      'agNumberColumnFilter',
    },
    {
      field:       'projects',
      headerName:  'Proyectos',
      width:       105,
      filter:      'agNumberColumnFilter',
      cellStyle:   { color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px' },
    },
    {
      field:       'startDate',
      headerName:  'Incorporación',
      cellRenderer: DateCell,
      width:       140,
      filter:      'agDateColumnFilter',
    },
    {
      headerName:  'Acciones',
      cellRenderer: ActionsCell,
      width:       120,
      sortable:    false,
      filter:      false,
      pinned:      'right',
      resizable:   false,
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable:     true,
    sortable:      true,
    suppressMovable: false,
  }), []);

  const onGridReady = useCallback((event: GridReadyEvent) => {
    event.api.sizeColumnsToFit();
  }, []);

  function exportCsv() {
    gridRef.current?.api.exportDataAsCsv({
      fileName: 'profesionales-quantia.csv',
    });
  }

  /* Stats */
  const total     = PROFESSIONALS.length;
  const activos   = PROFESSIONALS.filter(p => p.status === 'Activo').length;
  const remoto    = PROFESSIONALS.filter(p => p.status === 'Remoto').length;
  const vacas     = PROFESSIONALS.filter(p => p.status === 'Vacaciones').length;
  const avgPerf   = Math.round(PROFESSIONALS.reduce((s, p) => s + p.performance, 0) / total);
  const gridApi   = useRef<GridApi | null>(null);

  const onGridReadyFull = useCallback((e: GridReadyEvent) => {
    gridApi.current = e.api;
    onGridReady(e);
  }, [onGridReady]);

  return (
    <AppLayout activeLink="professionals" onNavigate={onNavigate} title="Profesionales" subtitle="Gestión del equipo humano">
      <div className="space-y-6">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total equipo',   value: total,    color: 'var(--brand-primary)' },
            { label: 'Activos',        value: activos,  color: '#22C55E' },
            { label: 'En remoto',      value: remoto,   color: '#3B82F6' },
            { label: 'Vacaciones',     value: vacas,    color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 hover:border-[var(--border-default)] focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)] transition-all">
            <Search size={14} className="text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Buscar profesional..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none min-w-0"
            />
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                  selectedDept === dept
                    ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Avg performance pill */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto rounded-full border border-[var(--border-subtle)] px-3 py-1.5 bg-[var(--bg-surface)]">
            <span className="size-2 rounded-full bg-[#22C55E]" />
            <span className="text-[12px] font-semibold text-[var(--text-secondary)]">Rendimiento medio</span>
            <span className="text-[13px] font-black text-[var(--text-primary)]">{avgPerf}%</span>
          </div>

          {/* Export */}
          <Button variant="outline" size="sm" onClick={exportCsv} className="shrink-0">
            <Download size={13} /> Exportar CSV
          </Button>
        </div>

        {/* ── AG Grid ── */}
        <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
          <div
            className="ag-theme-quartz"
            style={{ width: '100%', height: 620 }}
          >
            <AgGridReact<Professional>
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              quickFilterText={search}
              rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true }}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 15, 20]}
              suppressCellFocus={false}
              onGridReady={onGridReadyFull}
              noRowsOverlayComponent={() => (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Users size={32} className="text-[var(--text-faint)]" />
                  <p className="text-sm font-semibold text-[var(--text-muted)]">No se encontraron profesionales</p>
                </div>
              )}
            />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
