'use client';

import React, { useState } from 'react';
import { Link as LinkIcon, Copy, Check, AlertCircle } from 'lucide-react';
import { encodeUrl, decodeUrl, parseQueryParams } from '@devkit/crypto-tools';
import { useDevKitStore } from '../../store/useDevKitStore';

export function UrlEncoderTool() {
  const [input, setInput] = useState('https://devkit.app/search?query=developer tools&category=JSON');
  const [output, setOutput] = useState('');
  const [parsedParams, setParsedParams] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'component' | 'full'>('component');
  const [error, setError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  const handleEncode = () => {
    try {
      const res = encodeUrl(input, mode === 'component');
      setOutput(res);
      setError(undefined);
      addHistoryItem('url-encoder', 'Encoded URL string');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDecode = () => {
    try {
      const res = decodeUrl(input, mode === 'component');
      setOutput(res);
      setError(undefined);
      addHistoryItem('url-encoder', 'Decoded URL string');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleParseParams = () => {
    const params = parseQueryParams(input);
    setParsedParams(params);
    setOutput(JSON.stringify(params, null, 2));
    addHistoryItem('url-encoder', 'Parsed query parameters');
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-devText-muted font-medium">Mode:</span>
          <div className="flex bg-background border border-border rounded-md p-0.5">
            <button
              onClick={() => setMode('component')}
              className={`px-3 py-1 text-xs rounded font-semibold transition-colors ${
                mode === 'component' ? 'bg-accent text-white' : 'text-devText-secondary'
              }`}
            >
              encodeURIComponent
            </button>
            <button
              onClick={() => setMode('full')}
              className={`px-3 py-1 text-xs rounded font-semibold transition-colors ${
                mode === 'full' ? 'bg-accent text-white' : 'text-devText-secondary'
              }`}
            >
              encodeURI (Full URL)
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleEncode}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1 transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Encode</span>
          </button>
          <button
            onClick={handleDecode}
            className="px-3.5 py-1.5 bg-background border border-border text-devText-primary hover:bg-surface text-xs font-medium rounded-md transition-colors"
          >
            Decode
          </button>
          <button
            onClick={handleParseParams}
            className="px-3.5 py-1.5 bg-background border border-border text-devText-primary hover:bg-surface text-xs font-medium rounded-md transition-colors"
          >
            Parse Query Params
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted">
            <span>INPUT URL / QUERY STRING</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste URL or query string..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>PROCESSED OUTPUT</span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="hover:text-devText-primary text-xs flex items-center space-x-1 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Result string or JSON parsed query parameters..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
