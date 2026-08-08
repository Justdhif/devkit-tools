'use client';

import React from 'react';
import Link from 'next/link';
import { History, Trash2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';
import { getToolBySlug } from '@devkit/tool-core';
import { AuthGuard } from '../../components/AuthGuard';

export default function HistoryPage() {
  const { history, clearHistory } = useDevKitStore();

  return (
    <AuthGuard title="Tool History Cloud Sync" description="Sign in to view, save, and synchronize your local privacy-aware tool operation history.">
      <div className="p-4 sm:p-6 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-devText-primary">Tool History</h1>
              <p className="text-xs text-devText-secondary">Privacy-aware local log of recent tool operations</p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Privacy Safeguard:</strong> Secrets and sensitive tokens (such as JWTs) are automatically redacted and never persisted in history.
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-3">
            <History className="w-8 h-8 text-devText-muted mx-auto" />
            <h3 className="text-base font-semibold text-devText-primary">No History Records</h3>
            <p className="text-xs text-devText-muted max-w-sm mx-auto">
              Your recent tool actions will be logged locally here as you perform tasks.
            </p>
          </div>
        ) : (
          <div className="border border-border bg-surface rounded-xl divide-y divide-border overflow-hidden">
            {history.map((item) => {
              const tool = getToolBySlug(item.toolSlug);
              const dateStr = new Date(item.timestamp).toLocaleString();
              return (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-sidebar transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
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
                    <p className="text-xs text-devText-secondary font-mono">{item.inputSummary}</p>
                    <span className="text-[11px] text-devText-muted block">{dateStr}</span>
                  </div>

                  <Link
                    href={`/tools/${item.toolSlug}`}
                    className="px-3 py-1.5 bg-background border border-border text-devText-primary hover:border-accent/50 text-xs font-medium rounded-md flex items-center space-x-1 transition-colors"
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
