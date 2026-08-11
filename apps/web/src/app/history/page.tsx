'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { History, Trash2, ArrowRight, ShieldCheck, Lock, Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDevKitStore } from '../../store/useDevKitStore';
import { getToolBySlug } from '@devkit/tool-core';
import { AuthGuard } from '../../components/AuthGuard';
import { Button } from '../../components/ui/button';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface RemoteHistoryItem {
  id: string;
  toolSlug: string;
  inputSummary: string | null;
  isSensitive: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const { token, fetchMe } = useAuthStore();
  const { clearHistory } = useDevKitStore();

  const [items, setItems] = useState<RemoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pastikan token selalu fresh sebelum fetch
      await fetchMe();
      // Baca token terbaru langsung dari store state (bukan dari closure lama)
      const freshToken = useAuthStore.getState().token;
      if (!freshToken) {
        setError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/history?limit=50`, {
        headers: { Authorization: `Bearer ${freshToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.data);
      } else {
        setError(data.message || 'Failed to fetch history');
      }
    } catch {
      setError('Network error. Could not load history.');
    } finally {
      setLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClearAll = async () => {
    const freshToken = useAuthStore.getState().token;
    if (!freshToken) return;
    try {
      await fetch(`${API_BASE_URL}/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${freshToken}` },
      });
      clearHistory(); // juga bersihkan localStorage
      setItems([]);
    } catch {
      // silent
    }
  };

  return (
    <AuthGuard title="Tool History Cloud Sync" description="Sign in to view, save, and synchronize your local privacy-aware tool operation history.">
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-devText-primary">Tool History</h1>
              <p className="text-xs text-devText-secondary">Cloud-synced log of your recent tool operations</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={fetchHistory} disabled={loading} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {items.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear History</span>
              </Button>
            )}
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Privacy Safeguard:</strong> Secrets and sensitive tokens (such as JWTs) are automatically redacted and never persisted in history.
          </span>
        </div>

        {loading ? (
          <div className="p-12 border border-border bg-surface rounded-xl flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm text-devText-secondary">Loading history...</p>
          </div>
        ) : error ? (
          <div className="p-12 border border-rose-800/40 bg-rose-950/20 rounded-xl text-center space-y-3">
            <p className="text-sm font-semibold text-rose-400">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchHistory}>Try Again</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-3">
            <History className="w-8 h-8 text-devText-muted mx-auto" />
            <h3 className="text-base font-semibold text-devText-primary">No History Records</h3>
            <p className="text-xs text-devText-muted max-w-sm mx-auto">
              Your recent tool actions will be logged here as you use the tools. Start exploring any tool to see activity appear.
            </p>
          </div>
        ) : (
          <div className="border border-border bg-surface rounded-xl divide-y divide-border overflow-hidden">
            {items.map((item) => {
              const tool = getToolBySlug(item.toolSlug);
              const dateStr = new Date(item.createdAt).toLocaleString();
              return (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-sidebar transition-colors">
                  <div className="space-y-1 min-w-0 flex-1 mr-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-sm font-bold text-devText-primary">
                        {tool?.name || item.toolSlug}
                      </span>
                      {item.isSensitive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400 font-mono flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Sensitive</span>
                        </span>
                      )}
                    </div>
                    {item.inputSummary && (
                      <p className="text-xs text-devText-secondary font-mono truncate">{item.inputSummary}</p>
                    )}
                    <span className="text-[11px] text-devText-muted block">{dateStr}</span>
                  </div>

                  <Link
                    href={`/tools/${item.toolSlug}`}
                    className="px-3 py-1.5 bg-background border border-border text-devText-primary hover:border-accent/50 text-xs font-medium rounded-md flex items-center space-x-1 transition-colors shrink-0"
                  >
                    <span>Reopen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
