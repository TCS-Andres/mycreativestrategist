'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'input-base',
        invalid && 'border-destructive focus:border-destructive focus:ring-destructive/20',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
