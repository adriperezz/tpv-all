export type Theme = 'light' | 'dark';

export type Status = 'active' | 'review' | 'completed' | 'paused';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string;
  disabled?: boolean;
  children?: NavItem[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface KPI {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: string;
  variant?: 'default' | 'brand';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: Status;
  budget: number;
  progress: number;
  manager: string;
  managerInitials: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'brand';
  title: string;
  description: string;
  time: string;
}
