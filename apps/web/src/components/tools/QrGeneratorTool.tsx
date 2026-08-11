'use client';

import React, { useState } from 'react';
import { QrCode, Download, Copy, Check, SlidersHorizontal } from 'lucide-react';
import { ColorPicker } from '../ui/color-picker';
import { useDevKitStore } from '../../store/useDevKitStore';

export function QrGeneratorTool() {
  const [text, setText] = useState('https://devkit-tools.vercel.app');
  const [fgColor, setFgColor] = useState('#6366f1');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    text
  )}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&margin=${margin}`;

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devkit-qrcode.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      addHistoryItem('qr-generator', `Downloaded QR code (${format.toUpperCase()}): ${text.slice(0, 50)}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addHistoryItem('qr-generator', `Copied QR link for: ${text.slice(0, 50)}`);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold text-devText-primary">QR Code Generator</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDownload('png')}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-background border border-border text-devText-primary hover:bg-surface text-xs font-medium rounded-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col border border-border rounded-lg bg-surface p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-devText-muted block mb-1.5">
              QR Code Payload (URL or Text)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL or text content to encode..."
              className="w-full p-3 bg-background border border-border rounded-lg text-devText-primary font-mono text-xs focus:outline-none focus:border-accent resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="text-xs font-medium text-devText-muted block mb-1">Foreground Color</label>
              <ColorPicker color={fgColor} onChange={setFgColor} label="Foreground Color" />
            </div>

            <div>
              <label className="text-xs font-medium text-devText-muted block mb-1">Background Color</label>
              <ColorPicker color={bgColor} onChange={setBgColor} label="Background Color" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="text-xs font-medium text-devText-muted block mb-1">Dimensions ({size}px)</label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-devText-muted block mb-1">Quiet Zone Margin ({margin}px)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden items-center justify-center p-6 space-y-4">
          <div
            className="p-4 rounded-xl border border-border flex items-center justify-center shadow-lg"
            style={{ backgroundColor: bgColor }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Generated QR Code"
              style={{ width: `${size}px`, height: `${size}px` }}
              className="rounded"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-mono text-devText-secondary truncate max-w-xs">{text}</p>
            <p className="text-[11px] text-devText-muted">Vector SVG & High-Resolution PNG supported</p>
          </div>
        </div>
      </div>
    </div>
  );
}
