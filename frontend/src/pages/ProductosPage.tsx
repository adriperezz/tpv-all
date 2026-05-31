import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Plus, Pencil, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface TipoTicket { id: number; nombre: string; color: string }
interface ProductoTicket { tipoTicketId: number; cantidad: number; tipoTicket: TipoTicket }
interface Producto { id: number; nombre: string; precio: string; activo: boolean; productoTickets: ProductoTicket[] }

interface FormState { nombre: string; precio: string; tickets: { tipoTicketId: number; cantidad: number }[] }
const FORM_EMPTY: FormState = { nombre: '', precio: '', tickets: [] };

export default function ProductosPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tipos, setTipos] = useState<TipoTicket[]>([]);
  const [modal, setModal] = useState<'crear' | number | null>(null); // number = id a editar
  const [form, setForm] = useState<FormState>(FORM_EMPTY);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    const [ps, ts] = await Promise.all([
      api.get<Producto[]>('/productos'),
      api.get<TipoTicket[]>('/productos/tipos-ticket'),
    ]);
    setProductos(ps);
    setTipos(ts);
  }

  useEffect(() => { cargar(); }, []);

  function abrirCrear() {
    setForm(FORM_EMPTY);
    setModal('crear');
  }

  function abrirEditar(p: Producto) {
    setForm({
      nombre: p.nombre,
      precio: p.precio,
      tickets: p.productoTickets.map(pt => ({ tipoTicketId: pt.tipoTicketId, cantidad: pt.cantidad })),
    });
    setModal(p.id);
  }

  function setTicketCantidad(tipoId: number, cant: number) {
    setForm(f => {
      const exists = f.tickets.find(t => t.tipoTicketId === tipoId);
      if (cant <= 0) return { ...f, tickets: f.tickets.filter(t => t.tipoTicketId !== tipoId) };
      if (exists) return { ...f, tickets: f.tickets.map(t => t.tipoTicketId === tipoId ? { ...t, cantidad: cant } : t) };
      return { ...f, tickets: [...f.tickets, { tipoTicketId: tipoId, cantidad: cant }] };
    });
  }

  async function guardar() {
    if (!form.nombre || !form.precio) return;
    setSaving(true);
    try {
      const body = { nombre: form.nombre, precio: Number(form.precio), tickets: form.tickets };
      if (modal === 'crear') await api.post('/productos', body);
      else await api.put(`/productos/${modal}`, body);
      await cargar();
      setModal(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivo(p: Producto) {
    await api.patch(`/productos/${p.id}/activo`, { activo: !p.activo });
    await cargar();
  }

  async function borrar(p: Producto) {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/productos/${p.id}`);
      await cargar();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const activos = productos.filter(p => p.activo);
  const inactivos = productos.filter(p => !p.activo);

  return (
    <PageLayout
      title="Productos"
      maxWidth="2xl"
      onBack={() => navigate('/tpv')}
      right={
        <button onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-all">
          <Plus size={16} /> Nuevo
        </button>
      }
    >

        {activos.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Activos ({activos.length})</p>
            <div className="flex flex-col gap-2">
              {activos.map(p => <ProductoRow key={p.id} producto={p} onEdit={() => abrirEditar(p)} onToggle={() => toggleActivo(p)} onDelete={() => borrar(p)} />)}
            </div>
          </div>
        )}

        {inactivos.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Inactivos ({inactivos.length})</p>
            <div className="flex flex-col gap-2 opacity-50">
              {inactivos.map(p => <ProductoRow key={p.id} producto={p} onEdit={() => abrirEditar(p)} onToggle={() => toggleActivo(p)} onDelete={() => borrar(p)} />)}
            </div>
          </div>
        )}

        {/* Tipos de ticket */}
        <div className="mt-8">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Tipos de ticket</p>
          <div className="flex flex-col gap-2">
            {tipos.map(t => (
              <TipoTicketRow key={t.id} tipo={t} onChange={() => cargar()} />
            ))}
            <NuevoTipoForm onCreado={() => cargar()} />
          </div>
        </div>
      {/* Modal crear/editar */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md relative">
            <button onClick={() => setModal(null)} className="absolute top-3 right-3 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4">{modal === 'crear' ? 'Nuevo producto' : 'Editar producto'}</h2>

            <div className="flex flex-col gap-3">
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre" autoFocus
                className="bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
              <input value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                placeholder="Precio (€)" type="number" min="0" step="0.50"
                className="bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500" />

              <div>
                <p className="text-xs text-gray-500 mb-2">Tickets que genera</p>
                <div className="flex flex-col gap-2">
                  {tipos.map(t => {
                    const entry = form.tickets.find(x => x.tipoTicketId === t.id);
                    return (
                      <div key={t.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                          <span className="text-sm">{t.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setTicketCantidad(t.id, (entry?.cantidad ?? 0) - 1)}
                            className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold flex items-center justify-center">−</button>
                          <span className="w-6 text-center font-mono text-sm">{entry?.cantidad ?? 0}</span>
                          <button onClick={() => setTicketCantidad(t.id, (entry?.cantidad ?? 0) + 1)}
                            className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold flex items-center justify-center">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button onClick={guardar} disabled={!form.nombre || !form.precio || saving}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold disabled:opacity-30 transition-all">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function NuevoTipoForm({ onCreado }: { onCreado: () => void }) {
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);
  const [pendienteImagen, setPendienteImagen] = useState<{ id: number; clave: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function crear() {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const tipo = await api.post<{ id: number; nombre: string }>('/productos/tipos-ticket', {
        nombre: nombre.trim().toUpperCase(), color,
      });
      const clave = tipo.nombre.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      setPendienteImagen({ id: tipo.id, clave });
      setNombre('');
      setColor('#6366f1');
      onCreado();
      setTimeout(() => fileRef.current?.click(), 100);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function subirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendienteImagen) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('imagen', file);
      await api.upload(`/productos/tipos-ticket/${pendienteImagen.id}/imagen`, fd);
      setPendienteImagen(null);
    } catch (err: any) {
      alert(`Error subiendo imagen: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <>
      {pendienteImagen && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm">
          <span className="text-amber-400 font-medium shrink-0">
            {uploading ? 'Subiendo…' : `Sube el PNG para "${pendienteImagen.clave}"`}
          </span>
          <span className="text-gray-500 text-xs">→ se guardará como <code>{pendienteImagen.clave}.png</code></span>
          {!uploading && (
            <button onClick={() => fileRef.current?.click()}
              className="ml-auto px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-all">
              Elegir PNG
            </button>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/png" className="hidden" onChange={subirImagen} />

      <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-3">
        <label className="cursor-pointer relative shrink-0">
          <span className="w-7 h-7 rounded-full block border-2 border-gray-700" style={{ backgroundColor: color }} />
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </label>
        <input
          value={nombre} onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && crear()}
          placeholder="Nuevo tipo (ej: VERMUT)"
          className="flex-1 bg-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button onClick={crear} disabled={!nombre.trim() || saving}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold disabled:opacity-30 transition-all">
          <Plus size={14} /> Añadir
        </button>
      </div>
    </>
  );
}

function TipoTicketRow({ tipo, onChange }: { tipo: TipoTicket; onChange: () => void }) {
  const [nombre, setNombre] = useState(tipo.nombre);
  const [color, setColor] = useState(tipo.color);
  const [saving, setSaving] = useState(false);

  const dirty = nombre.trim().toUpperCase() !== tipo.nombre || color !== tipo.color;

  async function guardar() {
    setSaving(true);
    try {
      await api.patch(`/productos/tipos-ticket/${tipo.id}`, {
        nombre: nombre.trim().toUpperCase(),
        color,
      });
      onChange();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
      <label className="cursor-pointer relative group shrink-0">
        <span className="w-7 h-7 rounded-full block border-2 border-gray-700 group-hover:border-gray-400 transition-colors"
          style={{ backgroundColor: color }} />
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>
      <input
        value={nombre} onChange={e => setNombre(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && dirty && guardar()}
        className="flex-1 bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
      />
      <span className="text-xs font-mono text-gray-600 shrink-0">{color}</span>
      {dirty && (
        <button onClick={guardar} disabled={saving}
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold disabled:opacity-40 transition-all shrink-0">
          {saving ? '…' : 'Guardar'}
        </button>
      )}
    </div>
  );
}

function ProductoRow({ producto, onEdit, onToggle, onDelete }: {
  producto: Producto; onEdit: () => void; onToggle: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {producto.productoTickets.map(pt => (
            <span key={pt.tipoTicketId} className="w-3 h-3 rounded-full" style={{ backgroundColor: pt.tipoTicket.color }} />
          ))}
        </div>
        <div>
          <p className="font-medium text-sm">{producto.nombre}</p>
          <p className="text-xs text-gray-400">{Number(producto.precio).toFixed(2)} €
            {producto.productoTickets.length > 0 && (
              <span className="ml-2">
                · {producto.productoTickets.map(pt => `${pt.cantidad} ${pt.tipoTicket.nombre}`).join(' + ')}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <Pencil size={15} />
        </button>
        <button onClick={onToggle} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          {producto.activo ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
