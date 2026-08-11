'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Palette, Copy, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { ColorPicker } from '../ui/color-picker';
import { useDevKitStore } from '../../store/useDevKitStore';

export function ColorConverterTool() {
  const [hex, setHex] = useState('#6366f1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { addHistoryItem } = useDevKitStore();
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      addHistoryItem('color-converter', `Inspected color: ${hex.toUpperCase()}`);
    }, 1500);
    return () => { if (historyTimerRef.current) clearTimeout(historyTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  const hexToRgb = (hexStr: string) => {
    let clean = hexStr.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    const num = parseInt(clean, 16);
    if (isNaN(num)) return { r: 99, g: 102, b: 241 };
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  const rgb = hexToRgb(hex);

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWhite = ((1 + 0.05) / (lum + 0.05)).toFixed(2);
  const contrastBlack = ((lum + 0.05) / (0 + 0.05)).toFixed(2);

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const oklchString = `oklch(0.62 0.19 ${hsl.h})`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold text-devText-primary">Color Converter & WCAG Checker</span>
        </div>

        <div className="flex items-center space-x-2">
          <ColorPicker color={hex} onChange={setHex} label="Pick Base Color" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col border border-border rounded-lg bg-surface p-4 space-y-4">
          <div
            className="h-32 rounded-xl border border-border shadow-inner flex items-center justify-center relative transition-all"
            style={{ backgroundColor: hex }}
          >
            <span
              className="font-mono text-sm font-bold px-3 py-1.5 rounded-lg bg-black/40 text-white backdrop-blur-md"
            >
              {hex.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-xs font-semibold text-devText-muted uppercase tracking-wider">Color Formats</h4>

            {[
              { label: 'HEX', val: hex.toUpperCase() },
              { label: 'RGB', val: rgbString },
              { label: 'HSL', val: hslString },
              { label: 'OKLCH', val: oklchString },
            ].map((fmt) => (
              <div
                key={fmt.label}
                className="p-2.5 bg-background border border-border rounded-lg flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <span className="text-devText-muted font-bold mr-2">{fmt.label}:</span>
                  <span className="text-devText-primary">{fmt.val}</span>
                </div>
                <button
                  onClick={() => handleCopy(fmt.val, fmt.label)}
                  className="text-devText-muted hover:text-accent p-1 transition-colors"
                >
                  {copiedKey === fmt.label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface p-4 space-y-4">
          <h4 className="text-xs font-semibold text-accent flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            WCAG 2.1 Accessibility Contrast Ratios
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-4 rounded-xl border border-border space-y-2"
              style={{ backgroundColor: hex, color: '#ffffff' }}
            >
              <div className="text-xs font-bold">White Text (#FFF)</div>
              <div className="text-2xl font-black font-mono">{contrastWhite}:1</div>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span className={`px-2 py-0.5 rounded ${Number(contrastWhite) >= 4.5 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  AA {Number(contrastWhite) >= 4.5 ? 'PASS' : 'FAIL'}
                </span>
                <span className={`px-2 py-0.5 rounded ${Number(contrastWhite) >= 7.0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  AAA {Number(contrastWhite) >= 7.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border border-border space-y-2"
              style={{ backgroundColor: hex, color: '#000000' }}
            >
              <div className="text-xs font-bold">Black Text (#000)</div>
              <div className="text-2xl font-black font-mono">{contrastBlack}:1</div>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span className={`px-2 py-0.5 rounded ${Number(contrastBlack) >= 4.5 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  AA {Number(contrastBlack) >= 4.5 ? 'PASS' : 'FAIL'}
                </span>
                <span className={`px-2 py-0.5 rounded ${Number(contrastBlack) >= 7.0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  AAA {Number(contrastBlack) >= 7.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border flex-1">
            <h4 className="text-xs font-semibold text-devText-muted uppercase tracking-wider">Generated Shades Palette</h4>
            <div className="grid grid-cols-5 gap-2 h-16">
              {[20, 40, 60, 80, 95].map((lightness) => {
                const shadeHex = `hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`;
                return (
                  <div
                    key={lightness}
                    onClick={() => handleCopy(shadeHex, `shade-${lightness}`)}
                    className="h-full rounded-lg border border-border cursor-pointer flex flex-col justify-end p-1.5 transition-transform hover:scale-105"
                    style={{ backgroundColor: shadeHex }}
                    title={`Copy ${shadeHex}`}
                  >
                    <span className="text-[9px] font-mono font-bold px-1 rounded bg-black/50 text-white truncate text-center">
                      {lightness}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
