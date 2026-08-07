'use client';

import React, { useState } from 'react';
import { Copy, Check, Binary, AlertCircle } from 'lucide-react';
import { encodeBase64, decodeBase64 } from '@devkit/crypto-tools';
import { useDevKitStore } from '../../store/useDevKitStore';

export function Base64Tool() {
  const [input, setInput] = useState('Hello DevKit World!');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  const handleEncode = () => {
    try {
      const res = encodeBase64(input, urlSafe);
      setOutput(res);
      setError(undefined);
      addHistoryItem('base64-encoder', 'Encoded text to Base64');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDecode = () => {
    try {
      const res = decodeBase64(input);
      setOutput(res);
      setError(undefined);
      addHistoryItem('base64-encoder', 'Decoded Base64 to text');
    } catch (err: any) {
      setError(err.message);
    }
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
        <label className="flex items-center space-x-2 text-xs cursor-pointer text-devText-secondary hover:text-devText-primary">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="rounded accent-accent"
          />
          <span>URL-Safe Base64 (replace +/ with -_)</span>
        </label>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleEncode}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1 shadow-xs transition-colors"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Encode</span>
          </button>
          <button
            onClick={handleDecode}
            className="px-4 py-1.5 bg-background border border-border text-devText-primary hover:bg-surface text-xs font-medium rounded-md transition-colors"
          >
            Decode
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
            <span>INPUT TEXT OR BASE64</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type raw text or base64 string..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>PROCESSED RESULT</span>
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
            placeholder="Result will appear here..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
