import { useTheme } from '@/hooks/useTheme';

export interface ChartColors {
  primary:       string;
  accent:        string;
  success:       string;
  warning:       string;
  info:          string;
  grid:          string;
  tick:          string;
  tooltipBg:     string;
  tooltipBorder: string;
  surface:       string;
  palette:       string[];
}

export function useChartColors(): ChartColors {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const primary = isDark ? '#C2E53A' : '#5B4FF0';
  const accent  = isDark ? '#9B91F5' : '#C2E53A';

  return {
    primary,
    accent,
    success:       '#22C55E',
    warning:       '#F59E0B',
    info:          '#3B82F6',
    grid:          isDark ? 'rgba(255,255,255,0.05)' : 'rgba(91,79,240,0.07)',
    tick:          isDark ? '#555270' : '#BBBBBB',
    tooltipBg:     isDark ? '#1A1730' : '#FFFFFF',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(91,79,240,0.12)',
    surface:       isDark ? '#18161F' : '#FFFFFF',
    palette:       [primary, '#3B82F6', '#F59E0B', '#22C55E', '#EF4444'],
  };
}
