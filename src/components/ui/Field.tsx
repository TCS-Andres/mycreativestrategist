import * as React from 'react';
import { cn } from '@/lib/utils';

export function Field({
  number,
  label,
  helper,
  required,
  error,
  hint,
  children,
  className,
}: {
  number?: number;
  label: string;
  helper?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline gap-3">
        {number !== undefined && (
          <span className="font-heading text-xs font-semibold text-brand-orange/80 tabular-nums">
            {String(number).padStart(2, '0')}
          </span>
        )}
        <label className="label-base flex-1">
          {label}
          {required && <span className="ml-1 text-brand-orange">*</span>}
        </label>
      </div>
      {helper && <p className="pl-8 text-sm text-muted-foreground">{helper}</p>}
      <div className={cn(number !== undefined ? 'pl-8' : undefined)}>{children}</div>
      {hint && !error && (
        <p className={cn('text-xs text-muted-foreground', number !== undefined && 'pl-8')}>
          {hint}
        </p>
      )}
      {error && (
        <p className={cn('text-xs text-destructive', number !== undefined && 'pl-8')}>{error}</p>
      )}
    </div>
  );
}
