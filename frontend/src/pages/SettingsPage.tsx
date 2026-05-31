import { Bell, Key, Palette, Shield, User } from 'lucide-react';
import { NavbarLayout } from '@/components/layout/NavbarLayout';
import { Alert, Badge, Button, Card, Input, Select, Textarea } from '@/components/ui';
import { Progress, MultiProgress } from '@/components/ui/Progress';
import { SkeletonCard, SkeletonStat } from '@/components/ui/Skeleton';
import { Tabs, TabList, TabTrigger, TabPanel } from '@/components/ui/Tabs';

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

function SectionTitle({ children, desc }: { children: React.ReactNode; desc?: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-black text-[var(--text-primary)] tracking-tight">{children}</h3>
      {desc && <p className="text-sm text-[var(--text-muted)] mt-0.5">{desc}</p>}
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 py-5 border-b border-[var(--border-subtle)] last:border-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        {desc && <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  return (
    <NavbarLayout
      activeLink="settings"
      onNavigate={onNavigate}
      breadcrumbs={[{ label: 'Dashboard' }, { label: 'Configuración' }]}
      title="Configuración"
      subtitle="Gestiona tu cuenta, preferencias y componentes disponibles."
    >
      <Tabs defaultValue="profile" variant="line">
        <TabList>
          <TabTrigger value="profile"><User size={14} />Perfil</TabTrigger>
          <TabTrigger value="appearance"><Palette size={14} />Apariencia</TabTrigger>
          <TabTrigger value="notifications" badge={3}><Bell size={14} />Notificaciones</TabTrigger>
          <TabTrigger value="security"><Shield size={14} />Seguridad</TabTrigger>
          <TabTrigger value="components"><Key size={14} />Componentes UI</TabTrigger>
        </TabList>

        {/* ── PERFIL ── */}
        <TabPanel value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card hover={false}>
                <SectionTitle desc="Tu información personal visible en el panel.">Información personal</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Nombre" defaultValue="Fernando" />
                  <Input label="Apellidos" defaultValue="Parra" />
                  <Input label="Correo electrónico" type="email" defaultValue="admin@quantia.es" className="sm:col-span-2" />
                  <Input label="Cargo" defaultValue="Director de Proyectos" />
                  <Input label="Empresa" defaultValue="QUANTIA Ingeniería" />
                  <div className="sm:col-span-2">
                    <Textarea label="Biografía" defaultValue="Especialista en BIM e Inteligencia Artificial aplicada a la construcción." />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="primary" size="sm">Guardar cambios</Button>
                  <Button variant="ghost" size="sm">Cancelar</Button>
                </div>
              </Card>

              <Card hover={false}>
                <SectionTitle desc="Almacenamiento y recursos disponibles en tu cuenta.">Uso del plan</SectionTitle>
                <div className="space-y-5">
                  <Progress label="Almacenamiento BIM (14.2 GB de 20 GB)" value={71} showValue variant="brand" size="md" />
                  <Progress label="Proyectos activos (24 de 50)" value={48} showValue variant="accent" size="md" />
                  <Progress label="Usuarios del equipo (8 de 10)" value={80} showValue variant="warning" size="md" />
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-[var(--text-secondary)] mb-3">Distribución por tipo de proyecto</p>
                    <MultiProgress
                      showLegend
                      size="lg"
                      segments={[
                        { value: 45, variant: 'brand',   label: 'BIM' },
                        { value: 30, variant: 'accent',  label: 'IA' },
                        { value: 15, variant: 'info',    label: 'Desarrollo' },
                        { value: 10, variant: 'warning', label: 'Consultoría' },
                      ]}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card hover={false}>
                <SectionTitle>Avatar</SectionTitle>
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="size-20 rounded-2xl bg-[var(--brand-primary)] flex items-center justify-center text-[var(--text-on-brand)] text-2xl font-black">
                    FP
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Fernando Parra</p>
                    <p className="text-xs text-[var(--text-muted)]">admin@quantia.es</p>
                    <Badge variant="purple" className="mt-2">Administrador</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Cambiar foto
                  </Button>
                </div>
              </Card>

              <Alert variant="brand" title="Plan Profesional activo" description="Renovación automática el 30/07/2026." />
            </div>
          </div>
        </TabPanel>

        {/* ── APARIENCIA ── */}
        <TabPanel value="appearance">
          <Card hover={false}>
            <SectionTitle desc="Personaliza el aspecto visual de la aplicación.">Tema y apariencia</SectionTitle>
            <div className="divide-y divide-[var(--border-subtle)]">
              <SettingRow label="Tema de color" desc="Elige entre modo claro y oscuro.">
                <Select defaultValue="auto" className="w-36 text-sm">
                  <option value="auto">Automático</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </Select>
              </SettingRow>
              <SettingRow label="Idioma" desc="Idioma de la interfaz.">
                <Select defaultValue="es" className="w-36 text-sm">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </Select>
              </SettingRow>
              <SettingRow label="Formato de fecha" desc="Cómo se muestran las fechas.">
                <Select defaultValue="ddmmyyyy" className="w-40 text-sm">
                  <option value="ddmmyyyy">DD/MM/AAAA</option>
                  <option value="mmddyyyy">MM/DD/YYYY</option>
                  <option value="iso">ISO 8601</option>
                </Select>
              </SettingRow>
              <SettingRow label="Densidad de UI" desc="Compacta o cómoda para más espacio visual.">
                <Select defaultValue="normal" className="w-36 text-sm">
                  <option value="compact">Compacta</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Amplia</option>
                </Select>
              </SettingRow>
            </div>
          </Card>
        </TabPanel>

        {/* ── NOTIFICACIONES ── */}
        <TabPanel value="notifications">
          <div className="space-y-4 mb-8">
            <Alert variant="info" title="Tienes 3 notificaciones sin leer" description="Revísalas en el panel de actividad." />
            <Alert variant="success" title="Sincronización completada" description="GitHub conectado correctamente. Última sync: hace 5 min." />
            <Alert variant="warning" title="Revisión pendiente en Plaza Sur" description="3 interferencias detectadas que requieren acción antes del viernes." />
          </div>
          <Card hover={false}>
            <SectionTitle>Preferencias de notificación</SectionTitle>
            <div className="divide-y divide-[var(--border-subtle)]">
              {[
                { label: 'Alertas de proyectos', desc: 'Cambios de estado, hitos y revisiones', default: true },
                { label: 'Actividad del equipo', desc: 'Cuando alguien comenta o actualiza', default: true },
                { label: 'Informes semanales', desc: 'Resumen ejecutivo cada lunes', default: false },
                { label: 'Alertas de IA', desc: 'Predicciones y anomalías detectadas', default: true },
                { label: 'Marketing y novedades', desc: 'Nuevas funcionalidades y guías', default: false },
              ].map(n => (
                <SettingRow key={n.label} label={n.label} desc={n.desc}>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={n.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[var(--bg-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:size-4 after:transition-all peer-checked:bg-[var(--brand-primary)]" />
                  </label>
                </SettingRow>
              ))}
            </div>
          </Card>
        </TabPanel>

        {/* ── SEGURIDAD ── */}
        <TabPanel value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card hover={false}>
              <SectionTitle desc="Actualiza tu contraseña periódicamente.">Cambiar contraseña</SectionTitle>
              <div className="space-y-4">
                <Input label="Contraseña actual" type="password" placeholder="••••••••" />
                <Input label="Nueva contraseña" type="password" placeholder="••••••••" />
                <Input label="Confirmar contraseña" type="password" placeholder="••••••••" />
                <Progress label="Fortaleza de contraseña" value={80} variant="success" size="sm" showValue />
                <Button variant="primary" size="sm">Actualizar contraseña</Button>
              </div>
            </Card>
            <Card hover={false}>
              <SectionTitle desc="Sesiones activas en tu cuenta.">Dispositivos activos</SectionTitle>
              <div className="space-y-3">
                {[
                  { device: 'Chrome · Windows 11', location: 'Madrid, España', current: true, time: 'Ahora' },
                  { device: 'Safari · iPhone 15', location: 'Madrid, España', current: false, time: 'Hace 2h' },
                  { device: 'Firefox · macOS', location: 'Barcelona, España', current: false, time: 'Ayer' },
                ].map(s => (
                  <div key={s.device} className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {s.device}
                        {s.current && <Badge variant="success" className="ml-2">Actual</Badge>}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{s.location} · {s.time}</p>
                    </div>
                    {!s.current && (
                      <Button variant="danger" size="sm">Cerrar</Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabPanel>

        {/* ── COMPONENTES UI ── */}
        <TabPanel value="components">
          <div className="space-y-10">

            {/* Tabs */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[var(--brand-primary)] mb-1">Tabs</p>
              <h3 className="text-lg font-black text-[var(--text-primary)] mb-5">Variantes de pestañas</h3>
              <div className="space-y-8">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-3 font-semibold uppercase tracking-widest">Line (default)</p>
                  <Tabs defaultValue="a" variant="line">
                    <TabList><TabTrigger value="a">General</TabTrigger><TabTrigger value="b" badge={5}>Pendientes</TabTrigger><TabTrigger value="c">Archivo</TabTrigger></TabList>
                    <TabPanel value="a"><p className="text-sm text-[var(--text-muted)]">Contenido de la pestaña General.</p></TabPanel>
                    <TabPanel value="b"><p className="text-sm text-[var(--text-muted)]">5 elementos pendientes.</p></TabPanel>
                    <TabPanel value="c"><p className="text-sm text-[var(--text-muted)]">Sin elementos archivados.</p></TabPanel>
                  </Tabs>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-3 font-semibold uppercase tracking-widest">Pill</p>
                  <Tabs defaultValue="a" variant="pill">
                    <TabList><TabTrigger value="a">Semana</TabTrigger><TabTrigger value="b">Mes</TabTrigger><TabTrigger value="c">Año</TabTrigger></TabList>
                    <TabPanel value="a"><p className="text-sm text-[var(--text-muted)]">Vista semanal.</p></TabPanel>
                    <TabPanel value="b"><p className="text-sm text-[var(--text-muted)]">Vista mensual.</p></TabPanel>
                    <TabPanel value="c"><p className="text-sm text-[var(--text-muted)]">Vista anual.</p></TabPanel>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[var(--brand-primary)] mb-1">Progress</p>
              <h3 className="text-lg font-black text-[var(--text-primary)] mb-5">Barras de progreso</h3>
              <Card hover={false}>
                <div className="space-y-5">
                  <Progress label="Brand (primary)"  value={72} showValue variant="brand"   size="md" />
                  <Progress label="Accent (lime)"    value={55} showValue variant="accent"  size="md" />
                  <Progress label="Success"          value={90} showValue variant="success" size="md" />
                  <Progress label="Warning"          value={38} showValue variant="warning" size="md" />
                  <Progress label="Danger"           value={15} showValue variant="danger"  size="md" />
                  <Progress label="Info"             value={61} showValue variant="info"    size="md" />
                </div>
              </Card>
            </div>

            {/* Skeleton */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[var(--brand-primary)] mb-1">Skeleton</p>
              <h3 className="text-lg font-black text-[var(--text-primary)] mb-5">Estados de carga</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>

          </div>
        </TabPanel>
      </Tabs>
    </NavbarLayout>
  );
}
