'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';
import { CORE_TOOLS } from '@devkit/tool-core';
import { AuthGuard } from '../../components/AuthGuard';

import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, toggleFavorite, fetchFavoritesFromDB } = useDevKitStore();

  React.useEffect(() => {
    fetchFavoritesFromDB();
  }, [fetchFavoritesFromDB]);

  const favoritedTools = CORE_TOOLS.filter((t) => favorites.includes(t.slug));

  return (
    <AuthGuard title="Starred Favorites" description="Sign in to sync your starred developer utilities across your browsers and devices.">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-devText-primary">Starred Favorites</h1>
            <p className="text-xs text-devText-secondary">Your bookmarked developer tools for quick access</p>
          </div>
        </div>

        {favoritedTools.length === 0 ? (
          <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-3">
            <Star className="w-8 h-8 text-devText-muted mx-auto" />
            <h3 className="text-base font-semibold text-devText-primary">No Favorite Tools Yet</h3>
            <p className="text-xs text-devText-muted max-w-sm mx-auto">
              Click the star icon on any tool card or tool header to add it to your quick access favorites list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritedTools.map((tool) => (
              <div
                key={tool.slug}
                onClick={() => router.push(`/tools/${tool.slug}`)}
                className="p-5 bg-surface border border-border rounded-xl flex flex-col justify-between hover:border-accent/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-background text-accent uppercase tracking-wider">
                      {tool.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.slug);
                      }}
                      className="text-amber-400 hover:opacity-75 relative z-10"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-devText-primary mt-3 group-hover:text-accent transition-colors">{tool.name}</h3>
                  <p className="text-xs text-devText-secondary mt-1 line-clamp-2">{tool.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-emerald-400 flex items-center space-x-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Privacy First</span>
                  </span>
                  <span className="flex items-center space-x-1 text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
