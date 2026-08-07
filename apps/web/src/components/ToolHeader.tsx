'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Share2, Check, Shield } from 'lucide-react';
import { ToolMetadata } from '@devkit/shared';
import { useDevKitStore } from '../store/useDevKitStore';

interface ToolHeaderProps {
  tool: ToolMetadata;
  onShare?: () => void;
}

export function ToolHeader({ tool, onShare }: ToolHeaderProps) {
  const { toggleFavorite, isFavorite } = useDevKitStore();
  const favorited = isFavorite(tool.slug);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="border-b border-border bg-surface/50 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Link
            href="/"
            className="mt-1 p-1.5 rounded-md border border-border bg-background text-devText-secondary hover:text-devText-primary hover:border-accent/50 transition-colors"
            title="Back to Tools"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-devText-primary tracking-tight">
                {tool.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium border border-accent/20">
                {tool.category}
              </span>
            </div>
            <p className="text-sm text-devText-secondary mt-1 max-w-2xl">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Action Controls: Favorite Star & Share */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 shrink-0">
          <button
            onClick={() => toggleFavorite(tool.slug)}
            className={`p-2 rounded-md border text-sm font-medium flex items-center space-x-1.5 transition-colors ${
              favorited
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-background border-border text-devText-secondary hover:text-devText-primary'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">{favorited ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            onClick={handleShareClick}
            className="p-2 rounded-md border border-border bg-background text-devText-secondary hover:text-devText-primary hover:border-accent/50 text-sm font-medium flex items-center space-x-1.5 transition-colors"
            title="Share Configuration"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedShare ? 'Copied Link' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
