import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

type InputState = 'default' | 'error' | 'success';

interface BaseProps { state?: InputState; label?: string; hint?: string; }

const inputBase = 'w-full font-[family-name:var(--font-sans)] text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] border-[1.5px] rounded-xl px-[14px] py-[10px] outline-none placeholder:text-[var(--text-faint)] transition-all duration-[220ms]';
const stateClasses: Record<InputState, string> = {
  default: 'border-[var(--border-default)] focus:border-[var(--brand-primary)] focus:shadow-[0_0_0_3px_var(--focus-ring)]',
  error:   'border-[var(--q-danger)] focus:border-[var(--q-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]',
  success: 'border-[var(--q-success)] focus:border-[var(--q-success)] focus:shadow-[0_0_0_3px_rgba(34,197,94,0.18)]',
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ state = 'default', label, hint, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</label>}
      <input ref={ref} id={id} className={cn(inputBase, stateClasses[state], className)} {...props} />
      {hint && <p className={cn('text-[11px]', state === 'error' ? 'text-[var(--q-danger)]' : state === 'success' ? 'text-[var(--q-success)]' : 'text-[var(--text-muted)]')}>{hint}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ state = 'default', label, hint, className, id, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</label>}
      <select ref={ref} id={id} className={cn(inputBase, stateClasses[state], 'cursor-pointer', className)} {...props}>{children}</select>
      {hint && <p className="text-[11px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  ),
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ state = 'default', label, hint, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</label>}
      <textarea ref={ref} id={id} className={cn(inputBase, stateClasses[state], 'resize-y min-h-[100px]', className)} {...props} />
      {hint && <p className="text-[11px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  ),
);
Textarea.displayName = 'Textarea';
