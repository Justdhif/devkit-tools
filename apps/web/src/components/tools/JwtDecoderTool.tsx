'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Clock, AlertTriangle, Key } from 'lucide-react';
import { decodeJwt, JwtDecodeResult } from '@devkit/jwt-tools';
import { useDevKitStore } from '../../store/useDevKitStore';
import { PostExecutionRecommendations } from '../PostExecutionRecommendations';

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
    if (val.trim()) {
      const res = decodeJwt(val);
      setResult(res);
    } else {
      setResult(null);
    }
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
          <span>INPUT JWT TOKEN</span>
          <button
            onClick={() => handleTokenChange('')}
            className="hover:text-devText-primary text-xs"
          >
            Clear
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => handleTokenChange(e.target.value)}
          placeholder="Paste eyJ... encoded JWT token here..."
          className="p-3 bg-transparent font-mono text-xs text-devText-primary focus:outline-none resize-none h-24"
        />
      </div>

      {/* Result Display */}
      {result && (
        <div className="flex flex-col space-y-4">
          {!result.success ? (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{result.error || 'Failed to decode JWT format.'}</span>
            </div>
          ) : (
            <>
              {/* Expiration status banner */}
              <div
                className={`p-3 border rounded-lg flex items-center justify-between text-xs font-medium ${
                  result.isExpired === false
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                    : result.isExpired === true
                    ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                    : 'bg-surface border-border text-devText-secondary'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Status:{' '}
                    <strong className="uppercase">
                      {result.isExpired === false ? 'Active / Valid' : result.isExpired === true ? 'Expired' : 'No Expiration Claim'}
                    </strong>
                  </span>
                </div>

                {result.expiresAt && (
                  <span className="font-mono text-[11px]">
                    Expires: {result.expiresAt}
                  </span>
                )}
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

              {result.payload && (
                <PostExecutionRecommendations
                  currentOutput={JSON.stringify(result.payload, null, 2)}
                  actions={[
                    { id: 'jwt-fmt', label: 'Format Payload JSON', targetSlug: 'json-formatter' },
                    { id: 'jwt-ts', label: 'Generate TypeScript Interface', targetSlug: 'json-to-typescript' },
                    { id: 'jwt-ai', label: 'Explain Payload with AI', targetSlug: 'ai-assistant' },
                  ]}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
