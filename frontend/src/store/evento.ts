const KEY = 'tpv_fecha_evento';

export function getFechaEvento(): string {
  return localStorage.getItem(KEY) ?? '';
}

export function saveFechaEvento(fecha: string): void {
  if (fecha) localStorage.setItem(KEY, fecha);
  else localStorage.removeItem(KEY);
}
