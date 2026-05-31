import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { getImpresora, saveImpresora, clearImpresora } from '@/store/impresora';
import { getSession } from '@/store/auth';
import { Printer, Trash2, ChevronDown, Shield, Eye, EyeOff } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

const IMPRESORAS_PRESET = [
  { nombre: 'Impresora 1', ip: '192.168.123.100' },
  { nombre: 'Impresora 2', ip: '192.168.1.70' },
];

interface Usuario { id: number; nombre: string; rol: string; activo: boolean }

export default function ConfigPage() {
  const navigate = useNavigate();
  const session = getSession();
  const esAdmin = session?.rol === 'ADMIN';

  const actual = getImpresora();
  const [ip, setIp] = useState(actual?.ip ?? '');
  const [nombre, setNombre] = useState(actual?.nombre ?? '');
  const [guardado, setGuardado] = useState(false);

  // Acordeón usuarios
  const [abierto, setAbierto] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  function guardar() {
    if (!ip) return;
    saveImpresora(ip, nombre || ip);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  function seleccionarPreset(p: { nombre: string; ip: string }) {
    setIp(p.ip);
    setNombre(p.nombre);
    saveImpresora(p.ip, p.nombre);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  async function cargarUsuarios() {
    if (usuarios.length > 0) return;
    const us = await api.get<Usuario[]>('/usuarios');
    setUsuarios(us);
  }

  function toggleAcordeon() {
    if (!abierto) cargarUsuarios();
    setAbierto(p => !p);
  }

  return (
    <PageLayout title="Configuración" maxWidth="lg" onBack={() => navigate(-1)}>

      {/* Impresora activa */}
      {actual && (
        <div className="bg-green-900/30 border border-green-700/40 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Printer size={20} className="text-green-400" />
            <div>
              <p className="font-semibold text-green-300">{actual.nombre}</p>
              <p className="text-xs text-green-600">{actual.ip}</p>
            </div>
          </div>
          <button onClick={() => { clearImpresora(); setIp(''); setNombre(''); }}
            className="text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Presets */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">Impresoras configuradas</p>
        <div className="flex flex-col gap-2">
          {IMPRESORAS_PRESET.map(p => (
            <button key={p.ip} onClick={() => seleccionarPreset(p)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                actual?.ip === p.ip
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white'
              }`}>
              <div className="flex items-center gap-3">
                <Printer size={18} />
                <div className="text-left">
                  <p className="font-medium text-sm">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{p.ip}</p>
                </div>
              </div>
              {actual?.ip === p.ip && <span className="text-xs text-amber-400">Activa</span>}
            </button>
          ))}
        </div>
      </div>

      {/* IP manual */}
      <div className="bg-gray-900 rounded-2xl p-5">
        <p className="text-sm text-gray-500 mb-4">IP personalizada</p>
        <div className="flex flex-col gap-3">
          <input value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Nombre (opcional)"
            className="bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          <input value={ip} onChange={e => setIp(e.target.value)}
            placeholder="192.168.1.100"
            className="bg-gray-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500" />
          <button onClick={guardar} disabled={!ip}
            className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold disabled:opacity-30 transition-all">
            {guardado ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center mt-4">
        La selección se recuerda 8 horas
      </p>

      {/* Acordeón admin — solo visible para rol ADMIN */}
      {esAdmin && (
        <div className="mt-8 border-t border-gray-800 pt-6">
          <button
            onClick={toggleAcordeon}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-400 text-xs transition-colors w-full"
          >
            <Shield size={13} />
            <span>Gestión de usuarios</span>
            <ChevronDown size={13} className={`ml-auto transition-transform ${abierto ? 'rotate-180' : ''}`} />
          </button>

          {abierto && (
            <div className="mt-4 flex flex-col gap-3">
              {usuarios.map(u => (
                <UsuarioRow key={u.id} usuario={u} onActualizado={us => setUsuarios(prev => prev.map(x => x.id === us.id ? us : x))} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

function UsuarioRow({ usuario, onActualizado }: { usuario: Usuario; onActualizado: (u: Usuario) => void }) {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');

  const nombreDirty = nombre.trim() !== usuario.nombre;
  const pinValido = pin.length >= 4 && pin === pinConfirm;
  const puedeGuardar = nombreDirty || pinValido;

  async function guardar() {
    if (!puedeGuardar) return;
    if (pin && pin !== pinConfirm) { setErr('Los PINs no coinciden'); return; }
    setSaving(true);
    setErr('');
    setOk('');
    try {
      const body: Record<string, unknown> = {};
      if (nombreDirty) body.nombre = nombre.trim();
      if (pin) body.nuevoPin = pin;
      const actualizado = await api.patch<Usuario>(`/usuarios/${usuario.id}`, body);
      onActualizado(actualizado);
      setPin('');
      setPinConfirm('');
      setOk('Guardado');
      setTimeout(() => setOk(''), 2000);
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${usuario.rol === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
          {usuario.rol}
        </span>
        {!usuario.activo && <span className="text-xs text-red-500">Inactivo</span>}
      </div>

      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && puedeGuardar && guardar()}
        className="bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
      />

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500">Nuevo PIN (mín. 4 dígitos)</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Nuevo PIN"
              className="w-full bg-gray-800 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500 pr-9"
            />
            <button onClick={() => setShowPin(p => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <input
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            value={pinConfirm}
            onChange={e => setPinConfirm(e.target.value)}
            placeholder="Confirmar"
            className="flex-1 bg-gray-800 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        {pin && pin !== pinConfirm && <p className="text-xs text-red-400">Los PINs no coinciden</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={guardar}
          disabled={!puedeGuardar || saving}
          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold disabled:opacity-30 transition-all"
        >
          {saving ? 'Guardando…' : ok || 'Guardar cambios'}
        </button>
      </div>
      {err && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}
