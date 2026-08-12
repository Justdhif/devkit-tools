'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Clock, AlertTriangle, Key } from 'lucide-react';
import { decodeJwt, JwtDecodeResult } from '@devkit/jwt-tools';
import { useDevKitStore } from '../../store/useDevKitStore';

const SAMPLE_JWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggRGV2ZWxvcGVyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.40P_t-35d21xL-1zG1vJ8Q`;

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [result, setResult] = useState<JwtDecodeResult | null>(() => decodeJwt(SAMPLE_JWT));
  const [copiedPayload, setCopiedPayload] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  const handleDecode = () => {
    const res = decodeJwt(token);
    setResult(res);
    if (res.success) {
      addHistoryItem('jwt-decoder', 'Decoded JWT Claims', true);
    }
  };

  const handleTokenChange = (val: string) => {
    setToken(val);
    setResult(decodeJwt(val));
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Privacy Notice Banner */}
      <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>100% Client-Side Privacy:</strong> Your token is parsed locally in your browser. It is never sent to any remote server or database.
        </span>
      </div>

      {/* Input Token Box */}
      <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
          <span>ENCODED JWT TOKEN</span>
          <button
            onClick={() => handleTokenChange('')}
            className="hover:text-devText-primary text-[11px]"
          >
            Clear Token
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => handleTokenChange(e.target.value)}
          placeholder="Paste JWT token here (eyJhbGci...)"
          className="w-full h-24 p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none"
        />
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
          {!result.success ? (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{result.error}</span>
            </div>
          ) : (
            <>
              {/* Expiration Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-sidebar border border-border rounded-lg text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-devText-primary">Token Expiration Status:</span>
                </div>
                <div className="flex items-center space-x-3">
                  {result.isExpired !== undefined && (
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        result.isExpired
                          ? 'bg-rose-950/60 border border-rose-800/60 text-rose-400'
                          : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                      }`}
                    >
                      {result.isExpired ? 'EXPIRED' : 'ACTIVE / VALID'}
                    </span>
                  )}
                  {result.timeRemaining && (
                    <span className="text-devText-secondary">{result.timeRemaining}</span>
                  )}
                </div>
              </div>

              {/* Header & Payload Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* HEADER */}
                <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
                  <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-rose-400 flex justify-between items-center">
                    <span className="flex items-center space-x-1">
                      <Key className="w-3.5 h-3.5" />
                      <span>HEADER (ALGORITHM & TOKEN TYPE)</span>
                    </span>
                  </div>
                  <pre className="p-3 font-mono text-xs text-devText-primary overflow-x-auto">
                    {JSON.stringify(result.header, null, 2)}
                  </pre>
                </div>

                {/* PAYLOAD */}
                <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
                  <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-indigo-400 flex justify-between items-center">
                    <span>PAYLOAD (CLAIMS & DATA)</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(result.payload, null, 2));
                        setCopiedPayload(true);
                        setTimeout(() => setCopiedPayload(false), 2000);
                      }}
                      className="hover:text-devText-primary text-xs flex items-center space-x-1 text-devText-muted"
                    >
                      {copiedPayload ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 font-mono text-xs text-devText-primary overflow-x-auto">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
