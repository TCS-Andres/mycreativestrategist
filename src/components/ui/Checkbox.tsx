'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const realId = id ?? generatedId;
    return (
      <label
        htmlFor={realId}
        className={cn(
          'group flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white px-4 py-3 text-sm font-medium text-brand-navy transition hover:border-brand-orange/60',
          'has-[:checked]:border-brand-orange has-[:checked]:bg-brand-orange/5',
          className,
        )}
      >
        <input ref={ref} id={realId} type="checkbox" className="peer sr-only" {...props} />
        <span
          aria-hidden
          className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-white transition peer-checked:border-brand-orange peer-checked:bg-brand-orange"
        >
          <svg
            className="h-3 w-3 text-white opacity-0 transition peer-checked:opacity-100 group-has-[:checked]:opacity-100"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6.5L4.5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
