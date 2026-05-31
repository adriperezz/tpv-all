const SESSION_KEY = 'tpv_session';
const TOKEN_KEY = 'tpv_token';
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8h

export interface Session {
  id: number;
  nombre: string;
  rol: 'ADMIN' | 'TAQUILLA';
  taquilla: number;
  loginAt: number;
}

export function saveSession(usuario: Omit<Session, 'loginAt'>, token: string) {
  const session: Session = { ...usuario, loginAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const session: Session = JSON.parse(raw);
  if (Date.now() - session.loginAt > SESSION_TTL) {
    clearSession();
    return null;
  }
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isAdmin(): boolean {
  return getSession()?.rol === 'ADMIN';
}
