import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { getSession } from '@/store/auth';
import { RefreshCw } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface Anulacion {
  ventaId: number;
  admin: string;
  timestamp: string;
  monto: number;
}

interface ParteX {
  desde: string;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  totalGeneral: number;
  productoResumen: { nombre: string; cantidad: number; total: number }[];
  ticketResumen: Record<string, number>;
  totalVentasAnuladas: number;
  totalMontoAnulado: number;
  anulaciones: Anulacion[];
}

interface Snapshot {
  totalGeneral: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  realEfectivo: number | null;
  realTarjeta: number | null;
  realTransferencia: number | null;
  descuadreEfectivo: number | null;
  descuadreTarjeta: number | null;
  descuadreTransferencia: number | null;
}

interface CierreResult { id: number; cierre: string; snapshot: Snapshot }

interface Reales { efectivo: string; tarjeta: string; transferencia: string }

export default function CierreCajaPage() {
  const navigate = useNavigate();
  const taquilla = getSession()?.taquilla ?? 1;

  const [resumen, setResumen] = useState<ParteX | null>(null);
  const [loading, setLoading] = useState(true);
  const [reales, setReales] = useState<Reales>({ efectivo: '', tarjeta: '', transferencia: '' });
  const [cerrando, setCerrando] = useState(false);
  const [resultado, setResultado] = useState<CierreResult | null>(null);

  async function cargar() {
    setLoading(true);
    try {
      const r = await api.get<ParteX>(`/sesiones-caja/parte-x/${taquilla}`);
      setResumen(r);
      setReales({
        efectivo: r.totalEfectivo.toFixed(2),
        tarjeta: r.totalTarjeta.toFixed(2),
        transferencia: r.totalTransferencia.toFixed(2),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function cerrar() {
    if (!window.confirm('¿Confirmar cierre de caja? Esta acción no se puede deshacer.')) return;
    setCerrando(true);
    try {
      const body: Record<string, number> = {};
      if (reales.efectivo !== '') body.realEfectivo = Number(reales.efectivo);
      if (reales.tarjeta !== '') body.realTarjeta = Number(reales.tarjeta);
      if (reales.transferencia !== '') body.realTransferencia = Number(reales.transferencia);

      const res = await api.post<CierreResult>(`/sesiones-caja/cerrar/${taquilla}`, body);
      setResultado(res);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCerrando(false);
    }
  }

  // ── Pantalla de resultado ──────────────────────────────────────────────────
  if (resultado) {
    const s = resultado.snapshot;
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">✓</div>
            <h2 className="text-2xl font-bold text-green-400 mb-1">Caja cerrada</h2>
            <p className="text-gray-500 text-sm">
              Taquilla {taquilla} · {new Date(resultado.cierre).toLocaleString('es-ES')}
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 mb-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Resumen de descuadres</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left pb-2">Método</th>
                  <th className="text-right pb-2">Teórico</th>
                  <th className="text-right pb-2">Real</th>
                  <th className="text-right pb-2">Descuadre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <FilaDescuadre label="Efectivo"
                  teorico={s.totalEfectivo} real={s.realEfectivo} descuadre={s.descuadreEfectivo} />
                <FilaDescuadre label="Tarjeta"
                  teorico={s.totalTarjeta} real={s.realTarjeta} descuadre={s.descuadreTarjeta} />
                <FilaDescuadre label="Transferencia"
                  teorico={s.totalTransferencia} real={s.realTransferencia} descuadre={s.descuadreTransferencia} />
              </tbody>
              <tfoot className="border-t border-gray-700">
                <tr>
                  <td className="pt-3 font-bold text-white">Total</td>
                  <td className="pt-3 text-right font-bold text-amber-400">{s.totalGeneral.toFixed(2)} €</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          <button onClick={() => navigate('/tpv')}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold">
            Volver al TPV
          </button>
        </div>
      </div>
    );
  }

  // ── Pantalla principal ─────────────────────────────────────────────────────
  return (
    <PageLayout
      title="Cierre de caja"
      subtitle={`Taquilla ${taquilla}`}
      maxWidth="lg"
      onBack={() => navigate(-1)}
      right={
        <button onClick={cargar} className="text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      }
    >

        {loading && <p className="text-gray-600 text-center py-12">Cargando…</p>}

        {resumen && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-600">
              Desde {new Date(resumen.desde).toLocaleString('es-ES')} · {resumen.totalVentas} ventas
            </p>

            {/* KPIs teóricos */}
            <div className="grid grid-cols-3 gap-3">
              <KPI label="Total general" value={`${resumen.totalGeneral.toFixed(2)} €`} accent />
              <KPI label="Ventas" value={String(resumen.totalVentas)} />
              <KPI label="Tickets" value={String(Object.values(resumen.ticketResumen).reduce((a, b) => a + b, 0))} />
            </div>

            {/* Arqueo inline — siempre visible */}
            <div className="bg-gray-900 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Arqueo — importes reales</p>
              <div className="flex flex-col gap-3">
                <FilaArqueo
                  label="💵 Efectivo"
                  teorico={resumen.totalEfectivo}
                  value={reales.efectivo}
                  onChange={v => setReales(r => ({ ...r, efectivo: v }))}
                />
                <FilaArqueo
                  label="💳 Tarjeta / Datáfono"
                  teorico={resumen.totalTarjeta}
                  value={reales.tarjeta}
                  onChange={v => setReales(r => ({ ...r, tarjeta: v }))}
                />
                <FilaArqueo
                  label="📱 Transferencia"
                  teorico={resumen.totalTransferencia}
                  value={reales.transferencia}
                  onChange={v => setReales(r => ({ ...r, transferencia: v }))}
                />
              </div>
            </div>

            {/* Tickets */}
            {Object.keys(resumen.ticketResumen).length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-3">Tickets generados</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(resumen.ticketResumen).map(([nombre, cantidad]) => (
                    <div key={nombre} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                      <span className="text-sm">{nombre}</span>
                      <span className="font-bold">{cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Productos */}
            {resumen.productoResumen.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-3">Ventas por producto</p>
                <div className="flex flex-col gap-2">
                  {resumen.productoResumen.map(p => (
                    <div key={p.nombre} className="flex items-center justify-between">
                      <span className="text-sm">{p.nombre}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">{p.cantidad} uds</span>
                        <span className="font-semibold text-amber-400">{p.total.toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anulaciones */}
            {resumen.totalVentasAnuladas > 0 && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-red-400 uppercase tracking-widest">Ventas anuladas</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-red-400 font-bold">{resumen.totalVentasAnuladas} ventas</span>
                    <span className="text-red-300 font-bold">−{resumen.totalMontoAnulado.toFixed(2)} €</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {resumen.anulaciones.map(a => (
                    <div key={a.ventaId} className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        <span className="text-gray-500 font-mono">#{a.ventaId}</span>
                        {' '}anulada por <span className="text-red-400 font-medium">{a.admin}</span>
                      </span>
                      <span className="text-gray-500">
                        {new Date(a.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{a.monto.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={cerrar} disabled={cerrando}
              className="py-4 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-40 font-bold text-base transition-all">
              {cerrando ? 'Cerrando…' : 'Cerrar caja (Parte Z)'}
            </button>
          </div>
        )}
    </PageLayout>
  );
}

function FilaArqueo({ label, teorico, value, onChange }: {
  label: string; teorico: number; value: string; onChange: (v: string) => void;
}) {
  const real = value !== '' ? Number(value) : null;
  const diff = real !== null ? real - teorico : null;
  return (
    <div className="bg-gray-800 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-gray-500">Teórico: <span className="text-gray-300">{teorico.toFixed(2)} €</span></span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number" min="0" step="0.01"
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={teorico.toFixed(2)}
          className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-right font-mono text-sm text-white outline-none focus:ring-2 focus:ring-amber-500"
        />
        {diff !== null && (
          <span className={`text-sm font-bold w-20 text-right shrink-0 ${
            diff === 0 ? 'text-green-400' : diff > 0 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {diff >= 0 ? '+' : ''}{diff.toFixed(2)} €
          </span>
        )}
      </div>
    </div>
  );
}

function FilaDescuadre({ label, teorico, real, descuadre }: {
  label: string; teorico: number; real: number | null; descuadre: number | null;
}) {
  return (
    <tr>
      <td className="py-2 text-gray-300">{label}</td>
      <td className="py-2 text-right text-gray-400">{teorico.toFixed(2)} €</td>
      <td className="py-2 text-right">{real !== null ? `${real.toFixed(2)} €` : <span className="text-gray-600">—</span>}</td>
      <td className={`py-2 text-right font-semibold ${
        descuadre === null ? 'text-gray-600' :
        descuadre === 0 ? 'text-green-400' :
        descuadre > 0 ? 'text-amber-400' : 'text-red-400'
      }`}>
        {descuadre !== null ? `${descuadre >= 0 ? '+' : ''}${descuadre.toFixed(2)} €` : '—'}
      </td>
    </tr>
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
