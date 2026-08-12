'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, GitMerge } from 'lucide-react';

export interface ActionItem {
  id: string;
  label: string;
  targetSlug: string;
  queryParamKey?: string;
}

interface PostExecutionRecommendationsProps {
  currentOutput: string;
  actions: ActionItem[];
  className?: string;
}

export function PostExecutionRecommendations({
  currentOutput,
  actions,
  className = '',
}: PostExecutionRecommendationsProps) {
  const router = useRouter();

  if (!currentOutput || currentOutput.trim().length === 0 || actions.length === 0) {
    return null;
  }

  const handleActionClick = (action: ActionItem) => {
    const paramKey = action.queryParamKey || 'initialInput';
    const encoded = encodeURIComponent(currentOutput.substring(0, 1000));
    router.push(`/tools/${action.targetSlug}?${paramKey}=${encoded}`);
  };

  return (
    <div
      className={`p-3 bg-surface/80 border border-accent/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
        <span className="font-semibold text-devText-primary">Next Recommended Actions:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="px-2.5 py-1 bg-background border border-border hover:border-accent hover:bg-surface text-devText-primary font-medium rounded-lg flex items-center space-x-1 transition-all shadow-2xs text-[11px]"
          >
            <span>{action.label}</span>
            <ArrowRight className="w-3 h-3 text-accent" />
          </button>
        ))}

        <button
          onClick={() =>
            router.push(`/tools/pipeline-builder?initialInput=${encodeURIComponent(currentOutput.substring(0, 500))}`)
          }
          className="px-2.5 py-1 bg-accent/20 border border-accent/40 hover:bg-accent/30 text-accent font-bold rounded-lg flex items-center space-x-1 transition-colors text-[11px]"
        >
          <GitMerge className="w-3 h-3" />
          <span>Chain in Pipeline →</span>
        </button>
      </div>
    </div>
  );
}
