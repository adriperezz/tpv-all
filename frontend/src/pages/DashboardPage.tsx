import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { getSession } from '@/store/auth';
import { RefreshCw, Circle, Ban, LockOpen, Lock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface EstadoTaquilla {
  numero: number;
  activa: boolean;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  totalGeneral: number;
}

interface EstadoTaquillas {
  taquillas: EstadoTaquilla[];
  totalGeneral: number;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
}

interface Periodo {
  id: number | 'abierta';
  label: string;
  desde: string;
  hasta: string | null;
  taquilla: number | null;
  cerradoEn: string | null;
  cerradoPor: string | null;
  totalGeneral: number | null;
  totalVentas: number | null;
}

interface Resumen {
  totalVentasActivas: number;
  totalVentasAnuladas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  totalGeneral: number;
  productoResumen: { nombre: string; unidades: number; total: number }[];
  ticketResumen: Record<string, { cantidad: number; color: string }>;
}

interface LogAccion {
  id: number;
  accion: string;
  entidad: string;
  entidadId: number;
  timestamp: string;
  usuario: { nombre: string };
}

interface LineaVenta {
  id: number;
  nombreSnapshot: string;
  cantidad: number;
  subtotal: string;
}

interface Venta {
  id: number;
  timestamp: string;
  estado: 'ACTIVA' | 'ANULADA';
  metodoPago: string;
  taquilla: number;
  lineas: LineaVenta[];
  usuario: { id: number; nombre: string };
  logAcciones: { usuario: { nombre: string } }[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const session = getSession();

  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [seleccion, setSeleccion] = useState<Set<number | 'abierta'>>(new Set(['abierta']));
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [logs, setLogs] = useState<LogAccion[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [estadoTaquillas, setEstadoTaquillas] = useState<EstadoTaquillas | null>(null);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [tab, setTab] = useState<'resumen' | 'ventas' | 'logs'>('resumen');

  // anulación inline
  const [anulando, setAnulando] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [anulError, setAnulError] = useState('');
  const [anulLoading, setAnulLoading] = useState(false);

  async function cargarPeriodos() {
    setLoadingPeriodos(true);
    try {
      const [ps, ls, est] = await Promise.all([
        api.get<Periodo[]>('/sesiones-caja/periodos'),
        api.get<LogAccion[]>('/dashboard/log-acciones'),
        api.get<EstadoTaquillas>('/sesiones-caja/estado'),
      ]);
      setPeriodos(ps);
      setLogs(ls);
      setEstadoTaquillas(est);
    } finally {
      setLoadingPeriodos(false);
    }
  }

  function rangoDeSeleccion(sel: Set<number | 'abierta'>, ps: Periodo[]) {
    const selPeriodos = ps.filter(p => sel.has(p.id));
    if (selPeriodos.length === 0) return null;
    const desdeFechas = selPeriodos.map(p => new Date(p.desde).getTime());
    const hastaFechas = selPeriodos.map(p => p.hasta ? new Date(p.hasta).getTime() : Date.now());
    return {
      desde: new Date(Math.min(...desdeFechas)).toISOString(),
      hasta: new Date(Math.max(...hastaFechas)).toISOString(),
    };
  }

  async function cargarResumen(sel: Set<number | 'abierta'>, ps: Periodo[]) {
    if (sel.size === 0) { setResumen(null); return; }
    const rango = rangoDeSeleccion(sel, ps);
    if (!rango) return;
    setLoadingResumen(true);
    try {
      const r = await api.get<Resumen>(`/dashboard/resumen?desde=${encodeURIComponent(rango.desde)}&hasta=${encodeURIComponent(rango.hasta)}`);
      setResumen(r);
    } finally {
      setLoadingResumen(false);
    }
  }

  async function cargarVentas(sel: Set<number | 'abierta'>, ps: Periodo[]) {
    if (sel.size === 0) { setVentas([]); return; }
    const rango = rangoDeSeleccion(sel, ps);
    if (!rango) return;
    setLoadingVentas(true);
    try {
      const vs = await api.get<Venta[]>(`/ventas?desde=${encodeURIComponent(rango.desde)}&hasta=${encodeURIComponent(rango.hasta)}`);
      setVentas(vs);
    } finally {
      setLoadingVentas(false);
    }
  }

  useEffect(() => { cargarPeriodos(); }, []);

  useEffect(() => {
    if (periodos.length === 0) return;
    cargarResumen(seleccion, periodos);
    if (tab === 'ventas') cargarVentas(seleccion, periodos);
  }, [seleccion, periodos]);

  useEffect(() => {
    if (tab === 'ventas' && periodos.length > 0) cargarVentas(seleccion, periodos);
  }, [tab]);

  function togglePeriodo(id: number | 'abierta') {
    setSeleccion(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function abrirAnulacion(id: number) {
    setAnulando(id);
    setPin('');
    setAnulError('');
  }

  async function confirmarAnulacion(ventaId: number) {
    if (!session || !pin) return;
    setAnulLoading(true);
    setAnulError('');
    try {
      await api.patch(`/ventas/${ventaId}/anular`, { adminId: session.id, pinAdmin: pin });
      setAnulando(null);
      setPin('');
      // Refresca ventas y logs
      await Promise.all([
        cargarVentas(seleccion, periodos),
        api.get<LogAccion[]>('/dashboard/log-acciones').then(setLogs),
      ]);
    } catch (e: any) {
      setAnulError(e.message ?? 'Error al anular');
    } finally {
      setAnulLoading(false);
    }
  }

  const labelRango = () => {
    if (seleccion.size === 0) return 'Ningún período seleccionado';
    if (seleccion.size === 1) {
      const id = [...seleccion][0];
      return periodos.find(p => p.id === id)?.label ?? '';
    }
    return `${seleccion.size} períodos seleccionados`;
  };

  const TABS: { key: 'resumen' | 'ventas' | 'logs'; label: string }[] = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'ventas', label: 'Ventas' },
    { key: 'logs', label: 'Log acciones' },
  ];

  return (
    <PageLayout
      title="Dashboard"
      onBack={() => navigate('/tpv')}
      right={
        <button onClick={cargarPeriodos} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <RefreshCw size={15} className={loadingPeriodos ? 'animate-spin' : ''} /> Actualizar
        </button>
      }
    >

        {/* Estado taquillas */}
        {estadoTaquillas && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Estado sesiones — ahora mismo</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {estadoTaquillas.taquillas.map(t => (
                <div key={t.numero} className={`rounded-2xl p-4 border ${t.activa ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-900 border-gray-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">T{t.numero}</span>
                    {t.activa
                      ? <LockOpen size={14} className="text-green-400" />
                      : <Lock size={14} className="text-gray-600" />
                    }
                  </div>
                  {t.activa ? (
                    <>
                      <p className="text-lg font-bold text-amber-400">{t.totalGeneral.toFixed(2)} €</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.totalVentas} ventas</p>
                      <div className="flex gap-2 mt-2 text-xs text-gray-500">
                        {t.totalEfectivo > 0 && <span className="text-green-400">{t.totalEfectivo.toFixed(0)} ef</span>}
                        {t.totalTarjeta > 0 && <span className="text-blue-400">{t.totalTarjeta.toFixed(0)} tar</span>}
                        {t.totalTransferencia > 0 && <span className="text-purple-400">{t.totalTransferencia.toFixed(0)} tra</span>}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1">Sin ventas</p>
                  )}
                </div>
              ))}
            </div>
            {/* Sumatorio global */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Total sesión en curso</span>
                <span className="text-xl font-bold text-amber-400">{estadoTaquillas.totalGeneral.toFixed(2)} €</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Efectivo</p>
                  <p className="text-sm font-semibold text-green-400">{estadoTaquillas.totalEfectivo.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tarjeta</p>
                  <p className="text-sm font-semibold text-blue-400">{estadoTaquillas.totalTarjeta.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Transferencia</p>
                  <p className="text-sm font-semibold text-purple-400">{estadoTaquillas.totalTransferencia.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selector de períodos */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Períodos — selecciona uno o varios</p>
          {loadingPeriodos ? (
            <p className="text-gray-600 text-sm">Cargando períodos…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {periodos.map(p => {
                const sel = seleccion.has(p.id);
                const esAbierta = p.id === 'abierta';
                return (
                  <button key={String(p.id)} onClick={() => togglePeriodo(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      sel
                        ? esAbierta
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : 'bg-amber-500 border-amber-400 text-white shadow-md shadow-amber-900/40'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}>
                    {esAbierta && (
                      <Circle size={8} className={sel ? 'text-green-400 fill-green-400' : 'text-gray-600 fill-gray-600'} />
                    )}
                    <span>{p.label}</span>
                    {esAbierta && <span className="text-xs opacity-60">En curso</span>}
                    {!esAbierta && p.cerradoEn && (
                      <span className={`text-xs ${sel ? 'text-amber-100' : 'text-gray-500'}`}>
                        {new Date(p.cerradoEn).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {!esAbierta && p.totalGeneral != null && (
                      <span className={`text-xs font-bold ${sel ? 'text-white' : 'text-gray-300'}`}>{p.totalGeneral.toFixed(0)} €</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Resumen */}
        {tab === 'resumen' && (
          <>
            {seleccion.size === 0 && (
              <p className="text-gray-600 text-center py-12">Selecciona al menos un período para ver el resumen</p>
            )}
            {loadingResumen && <p className="text-gray-600 text-center py-12">Cargando…</p>}
            {!loadingResumen && resumen && seleccion.size > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-500">{labelRango()}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <KPI label="Total" value={`${resumen.totalGeneral.toFixed(2)} €`} accent />
                  <KPI label="Efectivo" value={`${resumen.totalEfectivo.toFixed(2)} €`} />
                  <KPI label="Tarjeta" value={`${resumen.totalTarjeta.toFixed(2)} €`} />
                  <KPI label="Transfer." value={`${resumen.totalTransferencia.toFixed(2)} €`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <KPI label="Ventas activas" value={String(resumen.totalVentasActivas)} />
                  <KPI label="Ventas anuladas" value={String(resumen.totalVentasAnuladas)} />
                </div>
                {Object.keys(resumen.ticketResumen).length > 0 && (
                  <div className="bg-gray-900 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 mb-3">Tickets</p>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(resumen.ticketResumen).map(([nombre, { cantidad, color }]) => (
                        <div key={nombre} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-sm">{nombre}</span>
                          <span className="font-bold">{cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {resumen.productoResumen.length > 0 && (
                  <div className="bg-gray-900 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 mb-3">Ventas por producto</p>
                    <div className="flex flex-col gap-2">
                      {resumen.productoResumen
                        .sort((a, b) => b.total - a.total)
                        .map(p => (
                          <div key={p.nombre} className="flex items-center justify-between">
                            <span className="text-sm">{p.nombre}</span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-gray-400">{p.unidades} uds</span>
                              <span className="font-semibold text-amber-400">{p.total.toFixed(2)} €</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab: Ventas */}
        {tab === 'ventas' && (
          <div className="flex flex-col gap-3">
            {seleccion.size === 0 && (
              <p className="text-gray-600 text-center py-12">Selecciona al menos un período</p>
            )}
            {loadingVentas && <p className="text-gray-600 text-center py-12">Cargando…</p>}
            {!loadingVentas && seleccion.size > 0 && ventas.length === 0 && (
              <p className="text-gray-600 text-center py-12">Sin ventas en el período seleccionado</p>
            )}
            {!loadingVentas && ventas.map(v => {
              const total = v.lineas.reduce((s, l) => s + Number(l.subtotal), 0);
              const anulada = v.estado === 'ANULADA';
              const expandida = anulando === v.id;
              return (
                <div key={v.id} className={`bg-gray-900 rounded-2xl p-4 ${anulada ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-gray-500 font-mono">#{v.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          v.metodoPago === 'EFECTIVO' ? 'bg-green-800/50 text-green-300' :
                          v.metodoPago === 'TARJETA' ? 'bg-blue-800/50 text-blue-300' :
                          'bg-purple-800/50 text-purple-300'
                        }`}>{v.metodoPago}</span>
                        <span className="text-xs text-gray-500">Taquilla {v.taquilla}</span>
                        {anulada && (
                          <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded">
                            ANULADA{v.logAcciones[0] ? ` · ${v.logAcciones[0].usuario.nombre}` : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(v.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{v.usuario.nombre}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {v.lineas.map(l => (
                          <span key={l.id} className="text-xs text-gray-400">
                            {l.cantidad}× {l.nombreSnapshot} — {Number(l.subtotal).toFixed(2)} €
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-lg font-bold ${anulada ? 'line-through text-gray-600' : 'text-amber-400'}`}>
                        {total.toFixed(2)} €
                      </span>
                      {!anulada && (
                        <button
                          onClick={() => expandida ? setAnulando(null) : abrirAnulacion(v.id)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-900/20">
                          <Ban size={12} /> Anular
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulario de anulación inline */}
                  {expandida && (
                    <div className="mt-3 pt-3 border-t border-gray-800 flex flex-col gap-2">
                      <p className="text-xs text-red-400 font-medium">Introduce tu PIN de admin para anular esta venta</p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="PIN"
                          value={pin}
                          onChange={e => { setPin(e.target.value); setAnulError(''); }}
                          onKeyDown={e => e.key === 'Enter' && confirmarAnulacion(v.id)}
                          className="flex-1 bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 font-mono"
                          autoFocus
                        />
                        <button
                          onClick={() => confirmarAnulacion(v.id)}
                          disabled={!pin || anulLoading}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold disabled:opacity-40 transition-all">
                          {anulLoading ? '…' : 'Confirmar'}
                        </button>
                        <button
                          onClick={() => setAnulando(null)}
                          className="px-3 py-2 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 text-sm transition-all">
                          Cancelar
                        </button>
                      </div>
                      {anulError && <p className="text-xs text-red-400">{anulError}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Logs */}
        {tab === 'logs' && (
          <div className="flex flex-col gap-2">
            {logs.length === 0 && <p className="text-gray-600 text-center py-8">Sin acciones registradas</p>}
            {logs.map(l => (
              <div key={l.id} className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded font-mono">{l.accion}</span>
                    <span className="text-xs text-gray-500">{l.entidad} #{l.entidadId}</span>
                  </div>
                  <p className="text-sm text-gray-300">{l.usuario.nombre}</p>
                </div>
                <span className="text-xs text-gray-600 shrink-0">
                  {new Date(l.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
    </PageLayout>
  );
}

function KPI({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-gray-900'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-amber-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
