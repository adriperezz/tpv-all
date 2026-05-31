import { cn } from '@/lib/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const COLORS = [
  'bg-[#5B4FF0] text-white',
  'bg-[#C2E53A] text-[#0D0D0D]',
  'bg-[#9B91F5] text-white',
  'bg-[#3B30C0] text-white',
  'bg-[#D9EE79] text-[#0D0D0D]',
  'bg-[#251D9A] text-white',
];

function getColorClass(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-12 text-sm',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizeClasses[size], className)} />;
  }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold shrink-0 select-none', sizeClasses[size], getColorClass(name), className)}>
      {getInitials(name)}
    </div>
  );
}
