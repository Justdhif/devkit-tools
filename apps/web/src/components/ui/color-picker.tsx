'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Palette, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const PRESET_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#0284c7',
  '#3b82f6',
  '#0f172a',
  '#ffffff',
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
  label?: string;
}

export function ColorPicker({ color, onChange, className, label }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center space-x-2 border border-border bg-background px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-devText-primary hover:border-accent/50 focus:outline-none transition-colors',
            className
          )}
        >
          <span
            className="w-4 h-4 rounded-md border border-border shrink-0 shadow-xs"
            style={{ backgroundColor: color }}
          />
          <span>{color.toUpperCase()}</span>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={5}
          className="z-50 w-64 rounded-xl border border-border bg-surface p-3 text-devText-primary shadow-2xl animate-in fade-in-80 zoom-in-95 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-[11px] font-semibold text-devText-muted uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-accent" />
              {label || 'Color Palette'}
            </span>
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-border bg-transparent"
              title="Custom Color Picker"
            />
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {PRESET_COLORS.map((hex) => {
              const isSelected = color.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    onChange(hex);
                    setOpen(false);
                  }}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center transition-transform hover:scale-110 shadow-xs relative"
                  style={{ backgroundColor: hex }}
                  title={hex}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 pt-1 border-t border-border">
            <span className="text-xs font-semibold text-devText-muted font-mono">HEX:</span>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-mono text-devText-primary focus:outline-none focus:border-accent"
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
