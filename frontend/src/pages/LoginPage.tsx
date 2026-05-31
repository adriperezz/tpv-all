import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { saveSession } from '@/store/auth';
import { Delete } from 'lucide-react';

interface Usuario { id: number; nombre: string; rol: 'ADMIN' | 'TAQUILLA' }

const TAQUILLAS = [1, 2, 3];

export default function LoginPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [pin, setPin] = useState('');
  const [taquilla, setTaquilla] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Usuario[]>('/auth/usuarios').then(setUsuarios).catch(() => {});
  }, []);

  function selectUsuario(u: Usuario) {
    setSelected(u);
    setPin('');
    setError('');
  }

  function pressDigit(d: string) {
    if (pin.length >= 6) return;
    setPin(p => p + d);
  }

  async function pressEnter() {
    if (!selected || pin.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ access_token: string; usuario: { id: number; nombre: string; rol: 'ADMIN' | 'TAQUILLA' } }>(
        '/auth/login',
        { usuarioId: selected.id, pin }
      );
      saveSession({ ...res.usuario, taquilla }, res.access_token);
      navigate('/tpv');
    } catch {
      setError('PIN incorrecto');
      setPin('');
    } finally {
      setLoading(false);
    }
  }

  const admins = usuarios.filter(u => u.rol === 'ADMIN');
  const taquilleros = usuarios.filter(u => u.rol === 'TAQUILLA');

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 p-6 select-none">
      <h1 className="text-3xl font-bold text-white tracking-wide">TPV Patio Nazarí</h1>

      {!selected ? (
        <div className="w-full max-w-xl flex flex-col gap-6">
          {/* Selector de taquilla */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-gray-400 text-sm">Taquilla:</span>
            {TAQUILLAS.map(n => (
              <button key={n} onClick={() => setTaquilla(n)}
                className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                  taquilla === n ? "bg-amber-500 text-white" : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}>
                {n}
              </button>
            ))}
          </div>

          {admins.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 text-center">Admin</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {admins.map(u => <UserCard key={u.id} usuario={u} onSelect={selectUsuario} />)}
              </div>
            </div>
          )}

          {taquilleros.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 text-center">Taquilla</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {taquilleros.map(u => <UserCard key={u.id} usuario={u} onSelect={selectUsuario} />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-sm">
            ← Volver
          </button>

          <div className={`text-xl font-semibold ${selected.rol === 'ADMIN' ? 'text-amber-400' : 'text-blue-400'}`}>
            {selected.nombre}
          </div>

          <div className="flex gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-amber-400' : 'bg-gray-700'}`} />
            ))}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <PinKey key={d} label={d} onClick={() => pressDigit(d)} />
            ))}
            <PinKey label={<Delete size={20} />} onClick={() => setPin(p => p.slice(0,-1))} variant="ghost" />
            <PinKey label="0" onClick={() => pressDigit('0')} />
            <PinKey label={loading ? '…' : '✓'} onClick={pressEnter} variant="confirm" disabled={pin.length < 4 || loading} />
          </div>
        </div>
      )}
    </div>
  );
}

function UserCard({ usuario, onSelect }: { usuario: Usuario; onSelect: (u: Usuario) => void }) {
  const isAdmin = usuario.rol === 'ADMIN';
  return (
    <button onClick={() => onSelect(usuario)}
      className={`py-5 px-3 rounded-2xl font-semibold text-lg transition-all active:scale-95 ${
        isAdmin
          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
          : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
      }`}>
      {usuario.nombre}
    </button>
  );
}

function PinKey({ label, onClick, variant = 'default', disabled = false }: {
  label: React.ReactNode; onClick: () => void;
  variant?: 'default' | 'ghost' | 'confirm'; disabled?: boolean;
}) {
  const styles = { default: 'bg-gray-800 text-white hover:bg-gray-700', ghost: 'bg-transparent text-gray-400 hover:bg-gray-800', confirm: 'bg-amber-500 text-white hover:bg-amber-400' };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-20 h-20 rounded-2xl text-2xl font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 ${styles[variant]}`}>
      {label}
    </button>
  );
}
