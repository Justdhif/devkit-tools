'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Share2, ShieldCheck, ArrowRight, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { SharedItemPayload } from '@devkit/shared';
import { getToolBySlug } from '@devkit/tool-core';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function SharePage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<SharedItemPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`${API_BASE_URL}/share/${params.id}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Shared configuration not found');
        }
        setItem(json.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load shared item');
      } finally {
        setLoading(false);
      }
    }
    fetchShare();
  }, [params.id]);

  const handleCopyConfig = () => {
    if (!item) return;
    navigator.clipboard.writeText(JSON.stringify(item.configuration, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-devText-muted space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm">Fetching shared tool workspace configuration...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-300 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-devText-primary">Shared Config Not Found</h1>
        <p className="text-xs text-devText-secondary">{error || 'This link may have expired or is invalid.'}</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-accent text-white font-semibold text-xs rounded-lg shadow-xs hover:bg-accent-hover transition-colors"
        >
          Go to DevKit Home
        </Link>
      </div>
    );
  }

  const tool = getToolBySlug(item.toolSlug);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="p-6 bg-surface border border-border rounded-xl space-y-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 font-mono font-bold uppercase">
                Shared Tool Configuration
              </span>
              <h1 className="text-2xl font-bold text-devText-primary mt-1">{item.title}</h1>
              <p className="text-xs text-devText-secondary">
                Target Tool: <strong className="text-accent">{tool?.name || item.toolSlug}</strong> • ID: #{item.id}
              </p>
            </div>
          </div>

          {tool && (
            <Link
              href={`/tools/${tool.slug}`}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
            >
              <span>Open in DevKit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Security Redaction Badge */}
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-emerald-400 text-xs flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            <strong>DevKit Privacy Safeguard:</strong> All secret parameters (API tokens, passwords, auth headers) were automatically redacted before link generation.
          </span>
        </div>
      </div>

      {/* Configuration View Box */}
      <div className="flex flex-col border border-border rounded-xl bg-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
          <span>CONFIGURATION PAYLOAD (JSON)</span>
          <button
            onClick={handleCopyConfig}
            className="hover:text-devText-primary text-xs flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Payload'}</span>
          </button>
        </div>

        <pre className="p-4 bg-background text-devText-primary font-mono text-xs overflow-x-auto min-h-[250px] leading-relaxed">
          {JSON.stringify(item.configuration, null, 2)}
        </pre>
      </div>
    </div>
  );
}
