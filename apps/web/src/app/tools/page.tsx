'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
  Search,
  Star,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Grid3x3,
  Wrench,
} from 'lucide-react';
import { CORE_TOOLS, searchTools } from '@devkit/tool-core';
import { useDevKitStore } from '../../store/useDevKitStore';
import { useSearch } from '../../context/SearchContext';

const CATEGORIES = Array.from(new Set(CORE_TOOLS.map((t) => t.category)));

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export default function ToolsPage() {
  const router = useRouter();
  const { query, setQuery } = useSearch();
  const { toggleFavorite, isFavorite } = useDevKitStore();

  const tools = React.useMemo(() => {
    return searchTools(query);
  }, [query]);

  const popularTools = CORE_TOOLS.filter((t) => t.isPopular);
  const newTools = CORE_TOOLS.filter((t) => t.isNew);

  const isFiltering = query.trim() !== '';

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-devText-primary">Developer Tools Catalog</h1>
            <p className="text-xs text-devText-secondary">
              {isFiltering
                ? `Showing search results for "${query}"`
                : 'Explore all productivity utilities and developer tools'}
            </p>
          </div>
        </div>
      </div>

      {/* Filtered search results */}
      {isFiltering ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-devText-primary flex items-center gap-2">
              <Search className="w-4 h-4 text-accent" />
              <span>Results for &quot;{query}&quot;</span>
            </h2>
            <span className="text-xs text-devText-muted">
              {tools.length} tool{tools.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {tools.length === 0 ? (
            <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-3">
              <Search className="w-8 h-8 text-devText-muted mx-auto" />
              <h3 className="text-base font-semibold text-devText-primary">No tools found</h3>
              <p className="text-xs text-devText-muted">
                No tools match &quot;{query}&quot;. Try typing a different keyword in the header search.
              </p>
              <button
                onClick={() => setQuery('')}
                className="text-xs text-accent hover:underline font-semibold"
              >
                Clear search
              </button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {tools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  favorited={isFavorite(tool.slug)}
                  onNavigate={() => router.push(`/tools/${tool.slug}`)}
                  onToggleFavorite={() => toggleFavorite(tool.slug)}
                />
              ))}
            </motion.div>
          )}
        </section>
      ) : (
        <>
          {/* Popular tools section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-devText-primary">Popular Tools</h2>
              <span className="text-[11px] text-devText-muted ml-auto">{popularTools.length} tools</span>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {popularTools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  favorited={isFavorite(tool.slug)}
                  onNavigate={() => router.push(`/tools/${tool.slug}`)}
                  onToggleFavorite={() => toggleFavorite(tool.slug)}
                />
              ))}
            </motion.div>
          </section>

          {/* New tools section */}
          {newTools.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                <h2 className="text-base font-bold text-devText-primary">New & Updated</h2>
                <span className="text-[11px] text-devText-muted ml-auto">{newTools.length} tools</span>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {newTools.map((tool) => (
                  <ToolCard
                    key={tool.slug}
                    tool={tool}
                    favorited={isFavorite(tool.slug)}
                    onNavigate={() => router.push(`/tools/${tool.slug}`)}
                    onToggleFavorite={() => toggleFavorite(tool.slug)}
                  />
                ))}
              </motion.div>
            </section>
          )}

          {/* Browse by category section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-devText-muted" />
              <h2 className="text-base font-bold text-devText-primary">Browse by Category</h2>
            </div>

            <div className="space-y-8">
              {CATEGORIES.map((cat) => {
                const catTools = CORE_TOOLS.filter((t) => t.category === cat);
                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">{cat}</span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[11px] text-devText-muted">{catTools.length} tools</span>
                    </div>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {catTools.map((tool) => (
                        <ToolCard
                          key={tool.slug}
                          tool={tool}
                          favorited={isFavorite(tool.slug)}
                          onNavigate={() => router.push(`/tools/${tool.slug}`)}
                          onToggleFavorite={() => toggleFavorite(tool.slug)}
                        />
                      ))}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ─── Tool Card Component ──────────────────────────────────────────────────────
interface ToolCardProps {
  tool: (typeof CORE_TOOLS)[number];
  favorited: boolean;
  onNavigate: () => void;
  onToggleFavorite: () => void;
}

function ToolCard({ tool, favorited, onNavigate, onToggleFavorite }: ToolCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={onNavigate}
      className="group relative p-5 bg-surface border border-border rounded-xl hover:border-accent/50 hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
    >
      {/* New badge */}
      {tool.isNew && (
        <span className="absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent uppercase tracking-widest">
          New
        </span>
      )}

      <div>
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-background border border-border text-accent uppercase tracking-wider">
            {tool.category}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1 text-devText-muted hover:text-amber-400 relative z-10 transition-colors"
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 transition-all ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        <h3 className="text-sm font-bold text-devText-primary mt-3 group-hover:text-accent transition-colors leading-snug">
          {tool.name}
        </h3>
        <p className="text-xs text-devText-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Client Privacy</span>
        </div>
        <span className="flex items-center space-x-1 text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
}
