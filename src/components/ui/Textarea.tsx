'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'input-base resize-y leading-relaxed',
        'min-h-[120px]',
        invalid && 'border-destructive focus:border-destructive focus:ring-destructive/20',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
