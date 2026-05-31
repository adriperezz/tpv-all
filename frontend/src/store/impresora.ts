const KEY = 'tpv_impresora';

interface ImpresoraConfig {
  ip: string;
  nombre: string;
}

export function getImpresora(): ImpresoraConfig | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function saveImpresora(ip: string, nombre: string) {
  localStorage.setItem(KEY, JSON.stringify({ ip, nombre }));
}

export function clearImpresora() {
  localStorage.removeItem(KEY);
}
