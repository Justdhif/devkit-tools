'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, Shield } from 'lucide-react';
import { computeHash } from '@devkit/crypto-tools';
import { useDevKitStore } from '../../store/useDevKitStore';

export function HashGeneratorTool() {
  const [input, setInput] = useState('DevKit Privacy First Tool');
  const [hashes, setHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  }>({ md5: '', sha1: '', sha256: '', sha512: '' });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { addHistoryItem } = useDevKitStore();

  useEffect(() => {
    let active = true;
    const calculateAll = async () => {
      if (!input) {
        setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
        return;
      }
      const md5Res = await computeHash(input, 'MD5');
      const sha1Res = await computeHash(input, 'SHA-1');
      const sha256Res = await computeHash(input, 'SHA-256');
      const sha512Res = await computeHash(input, 'SHA-512');

      if (active) {
        setHashes({ md5: md5Res, sha1: sha1Res, sha256: sha256Res, sha512: sha512Res });
      }
    };
    calculateAll();
    return () => {
      active = false;
    };
  }, [input]);

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      {/* Privacy banner */}
      <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Local Computation:</strong> Hash digests are calculated locally in your browser using standard Web Crypto algorithms.
        </span>
      </div>

      {/* Input panel */}
      <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between">
          <span>INPUT STRING</span>
          <button
            onClick={() => setInput('')}
            className="hover:text-devText-primary text-[11px]"
          >
            Clear
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type text to compute cryptographic hashes..."
          className="w-full h-24 p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none"
        />
      </div>

      {/* Hash Digest Results List */}
      <div className="space-y-3">
        {[
          { label: 'MD5 (128-bit)', val: hashes.md5, key: 'md5' },
          { label: 'SHA-1 (160-bit)', val: hashes.sha1, key: 'sha1' },
          { label: 'SHA-256 (256-bit)', val: hashes.sha256, key: 'sha256' },
          { label: 'SHA-512 (512-bit)', val: hashes.sha512, key: 'sha512' },
        ].map((algo) => (
          <div key={algo.key} className="p-3 bg-surface border border-border rounded-lg space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-accent">
              <span>{algo.label}</span>
              <button
                onClick={() => handleCopy(algo.val, algo.key)}
                disabled={!algo.val}
                className="hover:text-devText-primary text-[11px] flex items-center space-x-1 text-devText-muted disabled:opacity-50"
              >
                {copiedKey === algo.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedKey === algo.key ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-devText-primary break-all bg-background p-2 rounded border border-border">
              {algo.val || '---'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
