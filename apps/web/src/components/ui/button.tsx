'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// ─── Variant & Size Maps ────────────────────────────────────────────────────

const variantClasses = {
  default:
    'bg-accent hover:bg-accent-hover text-white font-semibold shadow-xs',
  secondary:
    'bg-background border border-border text-devText-primary hover:bg-surface hover:border-accent/50 font-medium',
  ghost:
    'text-devText-muted hover:text-devText-primary hover:bg-background font-medium',
  destructive:
    'bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 font-semibold',
  link: 'text-accent hover:underline font-medium p-0 h-auto',
} as const;

const sizeClasses = {
  default: 'px-4 py-2 text-xs',
  sm: 'px-3 py-1.5 text-xs',
  icon: 'p-2',
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

// ─── Button ─────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        // Base — layout, cursor, focus, disabled
        'inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
        'disabled:pointer-events-none disabled:opacity-50',
        'shrink-0',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button };
