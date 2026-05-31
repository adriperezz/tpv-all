const KEY = 'tpv_theme';

export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  return (localStorage.getItem(KEY) as Theme) ?? 'dark';
}

export function applyTheme(theme: Theme) {
  localStorage.setItem(KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme(): Theme {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

// Aplica el tema guardado al cargar
applyTheme(getTheme());
