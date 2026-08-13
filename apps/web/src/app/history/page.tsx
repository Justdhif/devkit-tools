'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  History,
  Trash2,
  ArrowRight,
  Lock,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDevKitStore } from '../../store/useDevKitStore';
import { getToolBySlug } from '@devkit/tool-core';

import { Button } from '../../components/ui/button';
import { AuthGuard } from '../../components/AuthGuard';
import { historyService, HistoryItem } from '../../services/historyService';



const PAGE_SIZE = 10;



export default function HistoryPage() {
  const { token, fetchMe } = useAuthStore();
  const { clearHistory } = useDevKitStore();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    const authState = useAuthStore.getState();
    if (!authState.isAuthenticated && !authState.token && !authState.refreshToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fetchMe();
      if (!useAuthStore.getState().isAuthenticated) {
        setItems([]);
        return;
      }
      const data = await historyService.getHistory();
      setItems(data);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Network error. Could not load history.');
    } finally {
      setLoading(false);
    }
  }, [fetchMe]);


  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClearAll = async () => {
    try {
      await historyService.clearHistory();
      clearHistory();
      setItems([]);
      setCurrentPage(1);
    } catch {
      // silent
    }
  };


  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedItems = items.slice(startIndex, endIndex);

  return (
    <AuthGuard
      title="Tool History Cloud Sync"
      description="Sign in to view, save, and synchronize your local privacy-aware tool operation history."
    >
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-devText-primary">Tool History</h1>
              <p className="text-xs text-devText-secondary">
                Cloud-synced log of your recent tool operations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchHistory}
              disabled={loading}
              title="Refresh"
            >
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

        {loading ? (
          <div className="p-12 border border-border bg-surface rounded-xl flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm text-devText-secondary">Loading history...</p>
          </div>
        ) : error ? (
          <div className="p-12 border border-rose-800/40 bg-rose-950/20 rounded-xl text-center space-y-3">
            <p className="text-sm font-semibold text-rose-400">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchHistory}>
              Try Again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-3">
            <History className="w-8 h-8 text-devText-muted mx-auto" />
            <h3 className="text-base font-semibold text-devText-primary">No History Records</h3>
            <p className="text-xs text-devText-muted max-w-sm mx-auto">
              Your recent tool actions will be logged here as you use the tools. Start exploring
              any tool to see activity appear.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pagination Controls (Positioned Above History List) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-1">
                <span className="text-xs text-devText-muted">
                  Showing{' '}
                  <span className="font-semibold text-devText-primary">
                    {startIndex + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-devText-primary">
                    {Math.min(endIndex, items.length)}
                  </span>{' '}
                  of <span className="font-semibold text-devText-primary">{items.length}</span>{' '}
                  history entries
                </span>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 text-xs px-2.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 text-xs rounded-md font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-accent text-white font-bold'
                            : 'text-devText-secondary hover:bg-surface hover:text-devText-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 text-xs px-2.5"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* History Items List */}
            <div className="border border-border bg-surface rounded-xl divide-y divide-border overflow-hidden">
              {paginatedItems.map((item) => {
                const tool = getToolBySlug(item.toolSlug);
                const dateStr = new Date(item.createdAt).toLocaleString();
                return (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between hover:bg-sidebar transition-colors"
                  >
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
                        <p className="text-xs text-devText-secondary font-mono truncate">
                          {item.inputSummary}
                        </p>
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
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
