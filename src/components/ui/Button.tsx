'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-heading font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange/30 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-orange text-white hover:bg-brand-orange-deep active:translate-y-[1px] shadow-soft',
        secondary:
          'bg-brand-navy text-brand-cream hover:bg-brand-black active:translate-y-[1px]',
        ghost: 'bg-transparent text-brand-navy hover:bg-brand-gray/50',
        outline:
          'border border-border bg-white text-brand-navy hover:border-brand-navy hover:bg-brand-cream',
        link: 'text-brand-blue hover:underline underline-offset-4 px-0 py-0',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-14 px-8 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
