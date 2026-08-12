'use client';

import React, { useState } from 'react';
import { Fingerprint, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { generateBulkUuids } from '@devkit/crypto-tools';
import { useDevKitStore } from '../../store/useDevKitStore';

export function UuidGeneratorTool() {
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [uuids, setUuids] = useState<string[]>(() => generateBulkUuids(5, 'v4'));
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  const handleGenerate = () => {
    let generated = generateBulkUuids(count, version);
    if (!hyphens) {
      generated = generated.map((u) => u.replace(/-/g, ''));
    }
    if (uppercase) {
      generated = generated.map((u) => u.toUpperCase());
    }
    setUuids(generated);
    addHistoryItem('uuid-generator', `Generated ${count} UUID ${version.toUpperCase()}s`);
  };

  const formattedText = uuids.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Options Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-devText-muted font-medium">Version:</span>
            <div className="flex bg-background border border-border rounded-md p-0.5">
              <button
                onClick={() => setVersion('v4')}
                className={`px-3 py-1 text-xs rounded font-semibold transition-colors ${
                  version === 'v4' ? 'bg-accent text-white' : 'text-devText-secondary'
                }`}
              >
                v4 (Random)
              </button>
              <button
                onClick={() => setVersion('v7')}
                className={`px-3 py-1 text-xs rounded font-semibold transition-colors ${
                  version === 'v7' ? 'bg-accent text-white' : 'text-devText-secondary'
                }`}
              >
                v7 (Time-ordered)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-devText-muted">Quantity:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-background border border-border text-devText-primary rounded px-2 py-1 text-xs focus:outline-none w-20"
            />
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-devText-secondary hover:text-devText-primary">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-accent"
            />
            <span>UPPERCASE</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-devText-secondary hover:text-devText-primary">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded accent-accent"
            />
            <span>Include Hyphens</span>
          </label>
        </div>

        <button
          onClick={handleGenerate}
          className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate UUIDs</span>
        </button>
      </div>

      {/* UUID Results list */}
      <div className="flex flex-col border border-border rounded-lg bg-surface flex-1 overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
          <span>GENERATED UUID LIST ({uuids.length})</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="hover:text-devText-primary text-xs flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="hover:text-devText-primary text-xs flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto max-h-[500px]">
          {uuids.map((uuid, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded bg-background border border-border font-mono text-xs text-devText-primary hover:border-accent/40 transition-colors"
            >
              <span>{uuid}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uuid);
                }}
                className="text-devText-muted hover:text-accent p-1"
                title="Copy single UUID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
